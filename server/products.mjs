export const products = Object.freeze({
  data_analyst: { name: 'Data Analyst Complete Kit', page: 'data-analyst' },
  ml_engineer: { name: 'Machine Learning Engineer Complete Kit', page: 'ai-automation' },
  ds_genai: { name: 'Data Scientist & Gen AI Complete Kit', page: 'data-science' },
  combined_bundle: { name: 'Data Science + Gen AI + ML Engineer Complete Kit', page: 'ds-genai-ml' }
});

// Merchant-supplied IDs; these alone do NOT prove a payload field or test/live mode.
export const buttonProducts = Object.freeze({
  pl_ThVHCCQ2yen4NY: 'data_analyst', pl_ThXweHqkLlL64U: 'data_analyst',
  pl_ThY1yderWIYPj0: 'ml_engineer', pl_ThY3jfk29pD143: 'ml_engineer',
  pl_ThY5ZHwc4wAyAL: 'ds_genai', pl_ThYC9dN6TDPgpj: 'ds_genai',
  pl_ThYEBdhXwq6ycx: 'combined_bundle', pl_ThYGVEIFLYXbbq: 'combined_bundle'
});

export function readPointer(object, pointer) {
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) return undefined;
  return pointer.slice(1).split('/').reduce((value, part) => {
    const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
    if (['__proto__', 'prototype', 'constructor'].includes(key)) return undefined;
    return value && Object.hasOwn(value, key) ? value[key] : undefined;
  }, object);
}

export function identifyProduct(context, env) {
  // Set ONLY after inspecting an actual Payment Button test payload/API response.
  const identifier = readPointer(context, env.RAZORPAY_PRODUCT_ID_PATH);
  let extra = {};
  try { extra = JSON.parse(env.RAZORPAY_PRODUCT_MAP_JSON || '{}'); }
  catch { throw new Error('invalid_product_map'); }
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) throw new Error('invalid_product_map');
  for (const id of Object.values(extra)) {
    if (!Object.hasOwn(products, id)) throw new Error('invalid_product_map');
  }
  const map = { ...buttonProducts, ...extra };
  if (typeof identifier !== 'string' || !Object.hasOwn(map, identifier)) throw new Error('product_unresolved');
  return { id: map[identifier], ...products[map[identifier]] };
}

// Shape only. Values, free-text notes and contact information are never logged.
export function shapeOf(value, prefix = '', paths = [], depth = 0) {
  if (depth > 7 || paths.length >= 100) return paths;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (!/^[A-Za-z_][A-Za-z_0-9]{0,40}$/.test(key)) continue;
      if (key === 'notes') { paths.push(`${prefix}/notes:<redacted>`); continue; }
      shapeOf(child, `${prefix}/${key}`, paths, depth + 1);
    }
  } else paths.push(`${prefix}:${Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value}`);
  return paths;
}

// Report only exact merchant-supplied button IDs, never arbitrary note/customer values.
// A candidate is evidence to review, not an automatically trusted product mapping.
export function inspectionCandidates(context) {
  const known = new Set([...Object.keys(buttonProducts), 'pl_ThbXIYIhe7fFeO']);
  const found = [];
  let visited = 0;
  function walk(value, path = '', depth = 0) {
    if (++visited > 500 || depth > 8 || found.length >= 20) return;
    if (typeof value === 'string' && known.has(value)) {
      found.push({ path, button_id: value });
    } else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        // Do not expose arbitrary note keys; only known metadata keys are safe to print.
        if (path.endsWith('/notes') && !['payment_button_id', 'payment_link_id', 'button_id', 'product_id', 'reference_id', 'learnlytics_product'].includes(key)) continue;
        if (/^[A-Za-z_][A-Za-z_0-9]{0,40}$/.test(key)) walk(child, `${path}/${key}`, depth + 1);
      }
    }
  }
  walk(context);
  return found;
}
