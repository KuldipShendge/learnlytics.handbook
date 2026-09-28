import { createWebhookHandler } from '../server/conversions.mjs';

// Web Request exposes the original bytes; never JSON.stringify a parsed webhook.
export default { fetch: createWebhookHandler() };
