// Run locally against a privately saved, real Test Mode webhook. Prints no customer values.
import { readFile } from 'node:fs/promises';
import { shapeOf, buttonProducts } from '../server/products.mjs';
import { matchingData } from '../server/conversions.mjs';

const filename = process.argv[2];
if (!filename) throw new Error('Usage: node --env-file=.env.local scripts/inspect-razorpay-payload.mjs private/payment.webhook.json [--fetch]');
const webhook = JSON.parse(await readFile(filename, 'utf8'));
const context = { webhook, payment: webhook.payload?.payment?.entity };
if (!context.payment) throw new Error('Not a documented payment webhook');
console.log(JSON.stringify({ stage: 'actual_payload_shape', paths: shapeOf(context) }));
if (process.argv.includes('--fetch')) {
  const { RAZORPAY_KEY_ID: id, RAZORPAY_KEY_SECRET: secret } = process.env;
  if (!id?.startsWith('rzp_test_') || !secret) throw new Error('Test credentials required in environment');
  async function get(resource, entityId, prefix) {
    if (!new RegExp(`^${prefix}_[A-Za-z0-9]+$`).test(entityId || '')) return undefined;
    const res = await fetch(`https://api.razorpay.com/v1/${resource}/${entityId}`, {
      headers: { Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64') },
      signal: AbortSignal.timeout(5000), redirect: 'error'
    });
    if (!res.ok) throw new Error(`Razorpay ${resource} HTTP ${res.status}`);
    return res.json();
  }
  context.payment = await get('payments', context.payment.id, 'pay');
  context.order = await get('orders', context.payment.order_id, 'order');
  context.customer = await get('customers', context.payment.customer_id, 'cust');
  console.log(JSON.stringify({ stage: 'fetched_entity_shapes', paths: shapeOf(context) }));
}
function candidates(value, path = '', depth = 0) {
  if (depth > 8) return;
  if (typeof value === 'string' && /^pl_[A-Za-z0-9]+$/.test(value)) {
    console.log(JSON.stringify({ button_candidate_path: path, button_id: value, known_product: buttonProducts[value] || null }));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (/^[A-Za-z_][A-Za-z_0-9]{0,40}$/.test(key)) candidates(child, `${path}/${key}`, depth + 1);
    }
  }
}
candidates(context);
const matching = matchingData(context.payment, context.customer);
console.log(JSON.stringify({ email_usable: !!matching.em, phone_usable: !!matching.ph,
  notice: 'Candidate fields still require merchant confirmation. No candidate means unresolved; never infer product from price.' }));
