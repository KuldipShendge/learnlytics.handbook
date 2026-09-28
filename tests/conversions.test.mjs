import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createWebhookHandler, matchingData, verifySignature, createRedisStore } from '../server/conversions.mjs';
import { buttonProducts } from '../server/products.mjs';

// Synthetic fixture based on documented payment entity fields. fixture_button is deliberately
// invented for the test adapter; it is NOT a claim about real Payment Button payloads.
const time = 1790630000;
const payment = () => ({ id: 'pay_Fixture123', entity: 'payment', amount: 1499, currency: 'USD',
  status: 'captured', captured: true, order_id: 'order_Fixture123', customer_id: 'cust_Fixture123',
  email: ' BUYER@example.org ', contact: '+91 98765 43210', notes: { fixture_button: 'pl_ThYC9dN6TDPgpj' }, created_at: time - 100 });
const event = p => ({ entity: 'event', account_id: 'acc_Fixture123', event: 'payment.captured',
  created_at: time - 5, payload: { payment: { entity: p || payment() } } });
const baseEnv = () => ({ CAPI_MODE: 'test', RAZORPAY_WEBHOOK_SECRET: 'synthetic-secret',
  RAZORPAY_ACCOUNT_ID: 'acc_Fixture123', RAZORPAY_KEY_ID: 'rzp_test_fixture', RAZORPAY_KEY_SECRET: 'synthetic-api-secret',
  RAZORPAY_PRODUCT_ID_PATH: '/payment/notes/fixture_button', META_PIXEL_ID: '1441817607724869',
  META_CAPI_ACCESS_TOKEN: 'synthetic-meta-token', META_GRAPH_API_VERSION: 'v23.0', META_TEST_EVENT_CODE: 'TESTfixture',
  SITE_URL: 'https://learnlyticshandbook.shop', UPSTASH_REDIS_REST_URL: 'https://fixture.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'synthetic-store-token' });
const hash = v => createHash('sha256').update(v).digest('hex');
function memoryStore() {
  const records = new Map();
  return {
    records,
    async acquire(k, owner) { const r = records.get(k) || {}; records.set(k, r); if (r.done) return 'done'; if (r.owner) return 'busy'; r.owner = owner; return 'acquired'; },
    async getPlan(k) { return records.get(k)?.plan; },
    async savePlan(k, plan) { records.get(k).plan = structuredClone(plan); },
    async complete(k, owner) { assert.equal(records.get(k).owner, owner); records.set(k, { done: true }); },
    async release(k, owner) { const r = records.get(k); if (r?.owner === owner) delete r.owner; }
  };
}
function setup(options = {}) {
  const env = { ...baseEnv(), ...options.env }, logs = [], calls = [], metaEvents = [];
  const store = options.store || memoryStore();
  let currentTime = time;
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    if (url.startsWith('https://api.razorpay.com')) {
      if (options.apiStatus) return new Response('{}', { status: options.apiStatus });
      return Response.json(url.includes('/orders/') ? { id: 'order_Fixture123', notes: { fixture_button: 'pl_ThYC9dN6TDPgpj' } } :
        url.includes('/customers/') ? { id: 'cust_Fixture123', email: 'fallback@example.org', contact: '+14155552671' } : options.payment || payment());
    }
    metaEvents.push(JSON.parse(init.body));
    if (options.meta) return options.meta(url, init);
    return Response.json({ events_received: 1 });
  };
  const makeHandler = () => createWebhookHandler({ env, fetcher, storeFactory: () => store,
    logger: x => logs.push(x), now: () => currentTime });
  function request(body = event(options.payment), signature, method = 'POST') {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    return new Request('https://example.org/api/razorpay-webhook', { method,
      headers: { 'x-razorpay-signature': signature ?? createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex'),
        'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.8', 'user-agent': 'RazorpayWebhook' },
      ...(method === 'POST' ? { body: raw } : {}) });
  }
  return { env, store, logs, calls, metaEvents, makeHandler, request, setTime: t => currentTime = t };
}

test('raw-byte HMAC: rejects malformed, missing, tampered and reserialized bodies', async () => {
  const s = setup(), handler = s.makeHandler();
  for (const signature of ['', 'x', 'a'.repeat(64), 'a'.repeat(62)]) assert.equal((await handler(s.request(event(), signature))).status, 401);
  const raw = JSON.stringify(event(), null, 2);
  const signature = createHmac('sha256', s.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex');
  assert.equal(verifySignature(Buffer.from(raw), signature, s.env.RAZORPAY_WEBHOOK_SECRET), true);
  assert.equal((await handler(s.request(event(), signature))).status, 401);
  assert.equal(s.calls.length, 0);
});

test('valid capture sends hashed customer data, capture time, exact amount and correct Meta test event', async () => {
  const s = setup(); assert.equal((await s.makeHandler()(s.request())).status, 200);
  const body = s.metaEvents[0], e = body.data[0];
  assert.equal(body.test_event_code, 'TESTfixture');
  assert.equal(e.event_name, 'Purchase'); assert.equal(e.event_time, time - 5);
  assert.equal(e.event_id, 'razorpay:test:pay_Fixture123');
  assert.deepEqual(e.user_data, { em: [hash('buyer@example.org')], ph: [hash('919876543210')] });
  assert.equal(e.custom_data.value, 14.99); assert.equal(e.custom_data.currency, 'USD');
  assert.deepEqual(e.custom_data.content_ids, ['ds_genai']);
  assert.equal(e.custom_data.content_type, 'product');
  assert.equal(e.user_data.client_ip_address, undefined); assert.equal(e.user_data.client_user_agent, undefined);
  const all = JSON.stringify(s.logs);
  for (const sensitive of ['BUYER', 'buyer@example', '98765', 'synthetic-secret', 'synthetic-meta-token']) assert.ok(!all.includes(sensitive));
});

test('separate function instances and concurrent deliveries send exactly one accepted Purchase', async () => {
  const s = setup();
  const results = await Promise.all([s.makeHandler()(s.request()), s.makeHandler()(s.request())]);
  assert.ok(results.some(r => r.status === 200));
  assert.equal(s.metaEvents.length, 1);
  assert.equal((await s.makeHandler()(s.request())).status, 200);
  assert.equal(s.metaEvents.length, 1);
  assert.ok(s.logs.some(x => x.stage === 'duplicate_event_ignored'));
});

test('all eight IDs map independently of equal prices', async () => {
  for (const [button, expected] of Object.entries(buttonProducts)) {
    const p = payment(); p.notes.fixture_button = button;
    const s = setup({ payment: p }); await s.makeHandler()(s.request());
    assert.equal(s.metaEvents[0].data[0].custom_data.content_ids[0], expected);
  }
});

test('actual INR amount is converted from paise, never inferred from catalog', async () => {
  const p = payment(); p.currency = 'INR'; p.amount = 89900; p.notes.fixture_button = 'pl_ThYEBdhXwq6ycx';
  const s = setup({ payment: p }); await s.makeHandler()(s.request());
  assert.equal(s.metaEvents[0].data[0].custom_data.value, 899);
  assert.equal(s.metaEvents[0].data[0].custom_data.currency, 'INR');
});

test('unknown product does not guess by price or send a conversion', async () => {
  const p = payment(); p.notes = {};
  const s = setup({ payment: p }); const r = await s.makeHandler()(s.request());
  assert.equal(r.status, 503); assert.equal((await r.json()).result, 'product_unresolved'); assert.equal(s.metaEvents.length, 0);
});

test('API failures, amount mismatch and account mismatch fail closed', async () => {
  for (const opts of [{ apiStatus: 401 }, { env: { RAZORPAY_ACCOUNT_ID: 'acc_Other' } }]) {
    const s = setup(opts); assert.notEqual((await s.makeHandler()(s.request())).status, 200); assert.equal(s.metaEvents.length, 0);
  }
  const s = setup(), e = event(); e.payload.payment.entity.amount++;
  assert.equal((await s.makeHandler()(s.request(e))).status, 503); assert.equal(s.metaEvents.length, 0);
});

test('explicit inspected order/customer enrichment supplies identity and missing matching data', async () => {
  const p = payment(); p.notes = {}; delete p.email; delete p.contact;
  const s = setup({ payment: p, env: { RAZORPAY_ENRICH_RESOURCES: 'order,customer', RAZORPAY_PRODUCT_ID_PATH: '/order/notes/fixture_button' } });
  assert.equal((await s.makeHandler()(s.request())).status, 200);
  assert.deepEqual(s.metaEvents[0].data[0].user_data, { em: [hash('fallback@example.org')], ph: [hash('14155552671')] });
});

test('inspection mode acknowledges a signed event but never fetches, stores or sends customer data', async () => {
  const s = setup({ env: { CAPI_MODE: 'inspect' } }); const r = await s.makeHandler()(s.request());
  assert.equal((await r.json()).result, 'inspected_no_conversion_sent'); assert.equal(s.calls.length, 0); assert.equal(s.store.records.size, 0);
  assert.ok(!JSON.stringify(s.logs).includes('fixture_button'));
});

test('test/live gates prevent accidental production sends', async () => {
  for (const env of [{ CAPI_MODE: 'live' }, { META_TEST_EVENT_CODE: '' }, { RAZORPAY_KEY_ID: 'rzp_live_wrong' }, { CAPI_MODE: 'oops' }]) {
    const s = setup({ env }); assert.equal((await s.makeHandler()(s.request())).status, 503); assert.equal(s.metaEvents.length, 0);
  }
});

test('approved live configuration omits test code and isolates event IDs from test mode', async () => {
  const s = setup({ env: { CAPI_MODE: 'live', RAZORPAY_KEY_ID: 'rzp_live_fixture', META_TEST_EVENT_CODE: '',
    CAPI_LIVE_APPROVED: 'true', CAPI_VERIFIED_TEST_PAYMENT_ID: 'pay_VerifiedTest' } });
  assert.equal((await s.makeHandler()(s.request())).status, 200);
  assert.equal(s.metaEvents[0].test_event_code, undefined);
  assert.equal(s.metaEvents[0].data[0].event_id, 'razorpay:live:pay_Fixture123');
});

test('no configured signature secret or store token cannot silently acknowledge a Purchase', async () => {
  for (const key of ['RAZORPAY_WEBHOOK_SECRET', 'UPSTASH_REDIS_REST_TOKEN']) {
    const s = setup({ env: { [key]: '' } });
    assert.equal((await s.makeHandler()(s.request())).status, 503); assert.equal(s.metaEvents.length, 0);
  }
});

test('does not process non-captured events, invalid JSON, incorrect methods or oversized bodies', async () => {
  const s = setup(), h = s.makeHandler();
  const ignored = event(); ignored.event = 'payment.authorized'; assert.equal((await h(s.request(ignored))).status, 200);
  const invalid = event(); invalid.payload.payment.entity.captured = false; assert.equal((await h(s.request(invalid))).status, 422);
  assert.equal((await h(s.request('{'))).status, 400);
  assert.equal((await h(s.request(event(), '', 'GET'))).status, 405);
  assert.equal((await h(s.request(' '.repeat(262145)))).status, 413);
  assert.equal(s.metaEvents.length, 0);
});

test('Meta failure is retried with identical saved event and test code, not marked sent', async () => {
  let count = 0;
  const s = setup({ meta: () => ++count === 1 ? Response.json({ error: { code: 190, message: 'private customer text' } }, { status: 400 }) : Response.json({ events_received: 1 }) });
  assert.equal((await s.makeHandler()(s.request())).status, 503);
  assert.equal((await s.makeHandler()(s.request())).status, 200);
  assert.deepEqual(s.metaEvents[0], s.metaEvents[1]);
  assert.ok(!JSON.stringify(s.logs).includes('private customer text'));
});

test('ambiguous Meta timeout retries stable ID only within bounded window', async () => {
  const s = setup({ meta: () => { throw new Error('network timeout with sensitive context'); } });
  assert.equal((await s.makeHandler()(s.request())).status, 503);
  await s.makeHandler()(s.request()); assert.deepEqual(s.metaEvents[0], s.metaEvents[1]);
  s.setTime(time + 86400); const late = await s.makeHandler()(s.request());
  assert.equal((await late.json()).result, 'reconciliation_required'); assert.equal(s.metaEvents.length, 2);
});

test('post-Meta database failure preserves same dedup ID on retry', async () => {
  const store = memoryStore(); const complete = store.complete; let attempt = 0;
  store.complete = async (...args) => { if (++attempt === 1) throw new Error('store failed'); return complete(...args); };
  const s = setup({ store }); assert.equal((await s.makeHandler()(s.request())).status, 503);
  assert.equal((await s.makeHandler()(s.request())).status, 200);
  assert.deepEqual(s.metaEvents[0], s.metaEvents[1]);
});

test('storage failures never send without a durable plan', async () => {
  const store = memoryStore(); store.savePlan = async () => { throw new Error('offline'); };
  const s = setup({ store }); assert.equal((await s.makeHandler()(s.request())).status, 503); assert.equal(s.metaEvents.length, 0);
});

test('missing customer data, invalid money and stale capture timestamps cannot produce events', async () => {
  for (const overrides of [{ email: '', contact: '9876543210' }, { amount: 0 }, { amount: 1.5 }, { currency: 'JPY' }]) {
    const s = setup({ payment: { ...payment(), ...overrides } }); assert.equal((await s.makeHandler()(s.request())).status, 503); assert.equal(s.metaEvents.length, 0);
  }
  const s = setup(), old = event(); old.created_at = time - 8 * 86400;
  assert.equal((await s.makeHandler()(s.request(old))).status, 503); assert.equal(s.metaEvents.length, 0);
});

test('matching ignores dummy fields and does not guess phone country codes', () => {
  assert.deepEqual(matchingData({ email: 'email@email.com', contact: '1234567890' }), {});
  assert.deepEqual(matchingData({ contact: '9876543210' }), {});
  assert.deepEqual(matchingData({ contact: '0044 7700 900123' }), { ph: [hash('447700900123')] });
});

test('Redis adapter uses atomic owner-checked completion and persistent sent markers', async () => {
  const cmds = []; const results = ['acquired', null, 'OK', 1, 1];
  const store = createRedisStore(baseEnv(), async (url, init) => { cmds.push(JSON.parse(init.body)); return Response.json({ result: results.shift() }); }, AbortSignal.timeout(4000));
  assert.equal(await store.acquire('key', 'owner'), 'acquired'); assert.equal(await store.getPlan('key'), null);
  await store.savePlan('key', { event: {} }); await store.complete('key', 'owner'); await store.release('key', 'owner');
  assert.match(cmds[0][1], /NX.*EX/); assert.match(cmds[3][1], /GET.*ARGV\[1\]/); assert.match(cmds[3][1], /'sent'/);
  assert.ok(!cmds[3][1].includes("'EX'"));
});

test('frontend remains free of browser Purchase; API route precedes SPA fallback', async () => {
  const frontend = await Promise.all(['index.html', 'js/kit-payments.js', 'js/meta-matching.js', 'js/script.js'].map(p => readFile(new URL('../' + p, import.meta.url), 'utf8')));
  for (const text of frontend) assert.doesNotMatch(text, /fbq\([^;]*['"]Purchase['"]/);
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.ok(config.routes.findIndex(r => r.handle === 'filesystem') < config.routes.findIndex(r => r.dest === '/index.html'));
});
