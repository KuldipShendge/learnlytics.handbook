import { createHash, createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { identifyProduct, shapeOf, inspectionCandidates } from './products.mjs';

const MAX_BODY = 256 * 1024;
const DAY = 86400;
const sha = value => createHash('sha256').update(value).digest('hex');
const response = (status, result) => Response.json({ result }, { status, headers: { 'Cache-Control': 'no-store' } });
const fail = code => { throw new Error(code); };

export function verifySignature(raw, signature, secret) {
  if (!secret || typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(raw).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}

export function matchingData(payment, customer = {}) {
  const data = {};
  const email = [payment.email, customer.email].find(v => typeof v === 'string' && v.trim());
  const em = email?.trim().toLowerCase();
  if (em && em !== 'email@email.com' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) data.em = [sha(em)];
  const contact = [payment.contact, customer.contact].find(v => typeof v === 'string' && v.trim());
  // Do not infer a country code from currency, IP or the buyer's product choice.
  if (contact && /^(\+|00)/.test(contact.trim())) {
    const ph = contact.replace(/\D/g, '').replace(/^00/, '');
    if (/^[1-9]\d{7,14}$/.test(ph) && ph !== '1234567890') data.ph = [sha(ph)];
  }
  return data;
}

async function readRaw(request, signal) {
  if (Number(request.headers.get('content-length')) > MAX_BODY) fail('body_too_large');
  if (!request.body) return Buffer.alloc(0);
  const reader = request.body.getReader();
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  const chunks = []; let size = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BODY) { cancel(); fail('body_too_large'); }
      chunks.push(Buffer.from(value));
    }
    signal.throwIfAborted();
    return Buffer.concat(chunks);
  } finally { signal.removeEventListener('abort', cancel); reader.releaseLock(); }
}

function config(env) {
  const mode = env.CAPI_MODE || 'inspect';
  if (!['inspect', 'test', 'live'].includes(mode)) fail('invalid_mode');
  if (mode === 'inspect') return { mode };
  const required = ['RAZORPAY_ACCOUNT_ID', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
    'META_PIXEL_ID', 'META_CAPI_ACCESS_TOKEN',
    'META_GRAPH_API_VERSION', 'SITE_URL', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];
  if (required.some(key => !env[key])) fail('configuration_incomplete');
  if (!/^\d+$/.test(env.META_PIXEL_ID) || !/^v\d+\.0$/.test(env.META_GRAPH_API_VERSION)) fail('invalid_meta_config');
  if (!/^https:\/\/[A-Za-z0-9.-]+\/?$/.test(env.SITE_URL)) fail('invalid_site_url');
  if (!/^https:\/\/[A-Za-z0-9.-]+\/?$/.test(env.UPSTASH_REDIS_REST_URL)) fail('invalid_redis_url');
  if (mode === 'test' && (!env.RAZORPAY_KEY_ID.startsWith('rzp_test_') || !env.META_TEST_EVENT_CODE)) fail('test_mode_required');
  if (mode === 'live' && (!env.RAZORPAY_KEY_ID.startsWith('rzp_live_') ||
      env.CAPI_LIVE_APPROVED !== 'true' || !/^pay_[A-Za-z0-9]+$/.test(env.CAPI_VERIFIED_TEST_PAYMENT_ID || '') ||
      env.META_TEST_EVENT_CODE)) fail('live_not_approved');
  const enrich = (env.RAZORPAY_ENRICH_RESOURCES || '').split(',').filter(Boolean);
  if (enrich.some(r => !['order', 'customer'].includes(r))) fail('invalid_enrichment');
  return { mode, enrich };
}

export function createRedisStore(env, fetcher, signal) {
  async function command(args) {
    const res = await fetcher(env.UPSTASH_REDIS_REST_URL, {
      method: 'POST', redirect: 'error', signal,
      headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    if (!res.ok) fail('store_unavailable');
    const data = await res.json();
    if (data.error || !Object.hasOwn(data, 'result')) fail('store_unavailable');
    return data.result;
  }
  return {
    async acquire(key, owner) {
      return command(['EVAL', "if redis.call('EXISTS',KEYS[1])==1 then return 'done' end; if redis.call('SET',KEYS[2],ARGV[1],'NX','EX',30) then return 'acquired' end; return 'busy'", 2, key + ':done', key + ':lock', owner]);
    },
    async getPlan(key) { const value = await command(['GET', key + ':plan']); return value ? JSON.parse(value) : null; },
    async savePlan(key, plan) {
      if (await command(['SET', key + ':plan', JSON.stringify(plan), 'NX', 'EX', 7 * DAY]) !== 'OK') fail('plan_conflict');
    },
    async complete(key, owner) {
      const result = await command(['EVAL', "if redis.call('GET',KEYS[1])~=ARGV[1] then return 0 end; redis.call('SET',KEYS[2],'sent'); redis.call('DEL',KEYS[3],KEYS[1]); return 1", 3, key + ':lock', key + ':done', key + ':plan', owner]);
      if (result !== 1) fail('completion_not_persisted');
    },
    async release(key, owner) {
      await command(['EVAL', "if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) end; return 0", 1, key + ':lock', owner]);
    }
  };
}

export function createWebhookHandler({ env = process.env, fetcher = fetch, storeFactory = createRedisStore,
  logger = item => console.log(JSON.stringify(item)), now = () => Math.floor(Date.now() / 1000) } = {}) {
  return async request => {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const requestId = randomUUID();
    const log = (stage, details = {}) => logger({ component: 'razorpay-capi', stage, request_id: requestId, ...details });
    // A bounded synchronous attempt. No fire-and-forget work after HTTP 200.
    const signal = AbortSignal.timeout(4000);
    let store, key, owner, acquired = false;
    log('webhook_received');
    try {
      if (!env.RAZORPAY_WEBHOOK_SECRET) fail('webhook_not_configured');
      const raw = await readRaw(request, signal);
      if (!verifySignature(raw, request.headers.get('x-razorpay-signature'), env.RAZORPAY_WEBHOOK_SECRET)) {
        log('signature_invalid'); return response(401, 'invalid_signature');
      }
      log('signature_valid');
      let webhook;
      try { webhook = JSON.parse(raw.toString('utf8')); } catch { return response(400, 'invalid_json'); }
      if (!webhook || typeof webhook !== 'object') return response(400, 'invalid_event');
      if (webhook.event !== 'payment.captured') return response(200, 'event_ignored');
      const original = webhook.payload?.payment?.entity;
      if (!original || !/^pay_[A-Za-z0-9]+$/.test(original.id || '') || original.status !== 'captured' || original.captured !== true) return response(422, 'invalid_captured_payment');
      const reference = sha(original.id).slice(0, 16);
      log('payment_captured', { payment_ref: reference });
      const cfg = config(env);
      if (env.RAZORPAY_ACCOUNT_ID && webhook.account_id !== env.RAZORPAY_ACCOUNT_ID) return response(403, 'account_mismatch');
      const api = async (resource, id, prefix) => {
        if (typeof id !== 'string' || !new RegExp(`^${prefix}_[A-Za-z0-9]+$`).test(id)) fail('missing_resource_id');
        const res = await fetcher(`https://api.razorpay.com/v1/${resource}/${id}`, { redirect: 'error', signal,
          headers: { Authorization: 'Basic ' + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64') } });
        if (!res.ok) {
          log('razorpay_api_error', { resource, status: res.status });
          fail('razorpay_fetch_failed');
        }
        const data = await res.json();
        if (data.id !== id) fail('resource_id_mismatch');
        return data;
      };
      if (cfg.mode === 'inspect') {
        log('payload_inspected', { payment_ref: reference, paths: shapeOf(webhook),
          has_email: !!original.email, has_contact: !!original.contact, has_order: !!original.order_id,
          has_customer: !!original.customer_id, has_notes: !!Object.keys(original.notes || {}).length });
        if (env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_SECRET) {
          // Only Test Mode credentials are allowed for this diagnostic path.
          if (!env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') || !env.RAZORPAY_KEY_SECRET) fail('test_mode_required');
          const payment = await api('payments', original.id, 'pay');
          if (payment.status !== 'captured' || payment.captured !== true || payment.amount !== original.amount ||
              payment.currency !== original.currency || payment.order_id !== original.order_id) fail('payment_mismatch');
          const context = { payment };
          if (payment.order_id) context.order = await api('orders', payment.order_id, 'order');
          const matching = matchingData(payment);
          log('api_inspected', { payment_ref: reference, paths: shapeOf(context),
            identifier_candidates: inspectionCandidates(context),
            order_fetched: !!context.order, receipt_present: !!context.order?.receipt,
            payment_notes_count: Object.keys(payment.notes || {}).length,
            order_notes_count: Object.keys(context.order?.notes || {}).length,
            email_usable: !!matching.em, phone_usable: !!matching.ph });
        }
        // Explicitly acknowledged inspection only; re-deliver after configuring the real mapping.
        return response(200, 'inspected_no_conversion_sent');
      }
      key = `learnlytics:capi:${env.RAZORPAY_ACCOUNT_ID}:${cfg.mode}:${env.META_PIXEL_ID}:${original.id}`;
      owner = randomUUID(); store = storeFactory(env, fetcher, signal);
      const lock = await store.acquire(key, owner);
      if (lock === 'done') { log('duplicate_event_ignored', { payment_ref: reference }); return response(200, 'duplicate_ignored'); }
      if (lock !== 'acquired') return response(503, 'processing_retry');
      acquired = true;
      let plan = await store.getPlan(key);
      if (!plan) {
        // Fetch with test/live credentials to verify mode. Never trust a guessed `livemode` field.
        const payment = await api('payments', original.id, 'pay');
        if (payment.status !== 'captured' || payment.captured !== true || payment.amount !== original.amount || payment.currency !== original.currency || payment.order_id !== original.order_id) fail('payment_mismatch');
        const context = { webhook, payment };
        await Promise.all(cfg.enrich.map(async kind => {
          context[kind] = kind === 'order' ? await api('orders', payment.order_id, 'order') : await api('customers', payment.customer_id, 'cust');
        }));
        let product;
        if (env.RAZORPAY_PRODUCT_ID_PATH) {
          try { product = identifyProduct(context, env); }
          catch (error) { log('product_unresolved', { payment_ref: reference, paths: shapeOf(context) }); throw error; }
          log('product_identified', { payment_ref: reference, product: product.id });
        } else log('product_mapping_skipped', { payment_ref: reference });
        // Only currencies sold by this storefront are supported; both have 2 decimal minor units.
        if (!['INR', 'USD'].includes(payment.currency) || !Number.isSafeInteger(payment.amount) || payment.amount <= 0) fail('invalid_amount_currency');
        const eventTime = webhook.created_at; // Capture event time, not payment authorization/creation time.
        if (!Number.isSafeInteger(eventTime) || eventTime > now() + 60 || eventTime < now() - 7 * DAY) fail('invalid_event_time');
        const userData = matchingData(payment, context.customer);
        // Current merchant requirement: both fields must be valid, never fabricated.
        if (!userData.em || !userData.ph) fail('customer_matching_missing');
        log('matching_prepared', { email_hashed: !!userData.em, phone_hashed: !!userData.ph });
        plan = { first_attempt: now(), event: {
          event_name: 'Purchase', event_id: `razorpay:${cfg.mode}:${original.id}`, event_time: eventTime,
          action_source: 'website', event_source_url: `${env.SITE_URL.replace(/\/$/, '')}/${product ? '#' + product.page : ''}`,
          user_data: userData,
          custom_data: { value: payment.amount / 100, currency: payment.currency,
            ...(product ? { content_ids: [product.id], content_name: product.name, content_type: 'product', num_items: 1 } : {}) }
        } };
        await store.savePlan(key, plan);
      }
      // A network timeout may hide a successful Meta receipt. Keep retries within its dedup window;
      // older uncertain attempts need reconciliation, never a new event_id or blind late replay.
      if (now() - plan.first_attempt >= DAY) fail('reconciliation_required');
      if (!plan.event.user_data.em?.length || !plan.event.user_data.ph?.length) fail('customer_matching_missing');
      const payload = { data: [plan.event], ...(cfg.mode === 'test' ? { test_event_code: env.META_TEST_EVENT_CODE } : {}) };
      log('capi_request_sent', { payment_ref: reference, mode: cfg.mode, product: plan.event.custom_data.content_ids?.[0] || null,
        value: plan.event.custom_data.value, currency: plan.event.custom_data.currency });
      const meta = await fetcher(`https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${env.META_PIXEL_ID}/events`, {
        method: 'POST', redirect: 'error', signal,
        headers: { Authorization: `Bearer ${env.META_CAPI_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let result;
      try { result = await meta.json(); } catch { fail('meta_invalid_response'); }
      // Never log Meta's message/body: third-party error strings can echo customer fields or tokens.
      log('meta_response', { status: meta.status, events_received: Number(result.events_received) || 0,
        error_code: Number(result.error?.code) || null, error_subcode: Number(result.error?.error_subcode) || null });
      if (!meta.ok || result.error || result.events_received !== 1) fail('meta_rejected');
      await store.complete(key, owner);
      acquired = false;
      log('purchase_recorded', { payment_ref: reference, mode: cfg.mode });
      return response(200, 'purchase_sent');
    } catch (error) {
      const known = new Set(['body_too_large', 'webhook_not_configured', 'invalid_mode', 'configuration_incomplete',
        'invalid_meta_config', 'invalid_site_url', 'invalid_redis_url', 'test_mode_required', 'live_not_approved',
        'invalid_enrichment', 'store_unavailable', 'plan_conflict', 'completion_not_persisted', 'missing_resource_id',
        'razorpay_fetch_failed', 'resource_id_mismatch', 'payment_mismatch', 'product_unresolved', 'invalid_product_map',
        'invalid_amount_currency', 'invalid_event_time', 'customer_matching_missing', 'reconciliation_required',
        'meta_invalid_response', 'meta_rejected']);
      const code = known.has(error.message) ? error.message : signal.aborted ? 'processing_timeout' : 'processing_failed';
      log('processing_error', { code });
      return response(code === 'body_too_large' ? 413 : 503, code);
    } finally {
      if (acquired) { try { await store.release(key, owner); } catch { log('lock_release_deferred'); } }
    }
  };
}
