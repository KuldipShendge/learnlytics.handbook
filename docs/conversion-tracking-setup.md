# LearnLytics Razorpay → Meta Purchase tracking

## Current setup progress (29 September)

The user has deployed the webhook and verified a real Test Mode capture: HTTP 200 with
`signature_valid`, `payment_captured`, and `payload_inspected`. The real payment had email,
contact and an order ID, but empty payment notes; the order dashboard showed email/phone
notes only. No reliable product mapping has been established. Test button ID:
`pl_ThbXIYIhe7fFeO`. Existing six hosted Payment Pages have browser Pixel tracking;
the existing server Purchase integration has not been identified. Keep `CAPI_MODE=inspect`.

With the latest inspection update, setting both Test API credentials in inspection mode
fetches the signed payment and its linked order. It logs `api_inspected` with response
schema, usable matching flags, note counts, receipt presence, and exact known button-ID
candidates. No raw notes, contact values, receipt values or credentials are logged.
Candidates do not configure mapping automatically. Without API keys, inspection remains
webhook-only. Live keys are rejected in this diagnostic flow. API failures return 503
with numeric provider status in `razorpay_api_error`, allowing a retry.

Push the updated `server/conversions.mjs`, `server/products.mjs`, test and this guide;
wait for deployment Ready, then make one new Test Mode payment. Open its Vercel
`api_inspected` log. An empty `identifier_candidates` list is a valid diagnostic result,
not a mapping success. Further private API inspection or a supported merchant reference
mechanism may still be required. This step never contacts Meta or the idempotency store.

## Status and scope

Code and local automated tests are implemented. **No complete Razorpay → Meta test has run and production CAPI is not enabled.** The initial webhook deployment and signed test capture were verified by the user; the latest API inspection update still needs deploying. Product identity and Meta receipt remain unverified.

Repository: `D:\learnlytics.handbook-main`. Canonical site found in `index.html`, `robots.txt`, and `sitemap.xml`: **https://learnlyticshandbook.shop**. There is no `.vercel/project.json` or Git remote in this source folder, so the Vercel project name/account could not be established locally. In Vercel, select the existing project whose Domains list contains this domain. Do not create another production project accidentally.

Existing browser Pixel ID is `1441817607724869`. Source inspection found PageView and opt-in Lead, but no browser Purchase. These remain unchanged. The server owns confirmed Purchase events; a button click or redirect is not proof of payment. Check Meta's Event Setup Tool and any Razorpay-side Meta integration too: those external settings cannot be audited from this repository. Disable any independently configured Purchase rule before the test to avoid uncorrelated duplicate events.

## Why one small durable store

Low volume reduces storage size, not duplicate-delivery risk. A webhook can be retried on another Vercel instance or after a deployment, and two deliveries can run concurrently. Memory, browser storage and function `/tmp` cannot enforce durable uniqueness.

Redis is not intrinsically required. An existing SQL database with a unique payment key and transaction would work. Vercel Blob supports conditional writes, but a safe lease, concurrent completion and recovery protocol takes more code. No existing database was found here, so this implementation uses one **Upstash Redis** store through Vercel Marketplace, via HTTPS REST, without an SDK, VPS or backend framework. Do not install the retired `@vercel/kv` package. Choose a region close to the Vercel function.

Storage contains a payment-scoped lock, a pending event containing only normalized customer hashes, and a tiny permanent sent marker. Pending events expire after 7 days; sent markers have no TTL. Configure persistent storage with no eviction of these records and do not clear it during deployments. Hashes are still customer data: keep the store private and access restricted. Do not use a public Blob as a substitute.

## Environment variables — exact values and where to obtain them

Add values in **Vercel → the existing project → Settings → Environment Variables**. Use the environment of the deployment receiving the test webhook (prefer a staging/preview deployment with an intentional webhook access setup). Redeploy after changing variables. Do not put secrets in HTML, frontend JavaScript, Git, chat, screenshots, webhook URLs or query strings. `.env.example` is a blank template; `.env.local` and `private/` are ignored.

| Variable | Test setup value / source |
| --- | --- |
| `CAPI_MODE` | Start with `inspect`. After inspecting the actual payload, set `test`. Default is `inspect`. |
| `RAZORPAY_WEBHOOK_SECRET` | Generate a long random secret yourself and enter the identical value in Razorpay's **Test Mode** webhook Secret field and Vercel. This is different from the Razorpay API secret. |
| `RAZORPAY_ACCOUNT_ID` | Your `acc_…` account ID, from Razorpay account details or the `account_id` of the actual signed test webhook. Required before sending CAPI. |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard, switch to **Test Mode**, Account & Settings → API Keys → Generate key; use the `rzp_test_…` ID. |
| `RAZORPAY_KEY_SECRET` | Secret paired with the above Test Mode key. Store it immediately in Vercel. |
| `META_PIXEL_ID` | `1441817607724869`. Confirm this is the selected Pixel/Dataset in Events Manager. |
| `META_CAPI_ACCESS_TOKEN` | Meta Events Manager → select that Dataset → Settings → Conversions API → direct/manual integration → Generate access token. UI wording can vary by account. |
| `META_GRAPH_API_VERSION` | Use the supported `vNN.0` version shown in Meta's current generated CAPI sample. Explicit configuration is required; code does not silently choose an API version. |
| `META_TEST_EVENT_CODE` | Same Dataset → Test Events → server-event testing code. Required in `test` mode. |
| `SITE_URL` | `https://learnlyticshandbook.shop` (HTTPS origin only, no query string or path). |
| `UPSTASH_REDIS_REST_URL` | Vercel Storage/Marketplace → create/connect Upstash Redis → REST URL. Map the integration's generated name to this exact name if it uses a prefix. |
| `UPSTASH_REDIS_REST_TOKEN` | The same database's read/write REST token, not a read-only token. |
| `RAZORPAY_PRODUCT_ID_PATH` | JSON pointer to the **observed, merchant-controlled identifier**, rooted at `{webhook,payment,order,customer}`. Leave blank until the real payload/API response has been inspected. Never assume `payment_button_id` or infer identity from the amount. |
| `RAZORPAY_PRODUCT_MAP_JSON` | Optional JSON object mapping additional observed test button IDs/merchant references to `data_analyst`, `ml_engineer`, `ds_genai`, or `combined_bundle`. Supplied eight button IDs are already listed in `server/products.mjs`. Confirm their mode; IDs themselves do not distinguish test from live. |
| `RAZORPAY_ENRICH_RESOURCES` | Empty by default. Set `order`, `customer`, or `order,customer` only when real inspection establishes which linked entity supplies missing fields. Payment is always fetched to verify test/live API credentials and amount. |
| `CAPI_LIVE_APPROVED` | Keep `false` during this work. |
| `CAPI_VERIFIED_TEST_PAYMENT_ID` | Leave blank until a real complete test is confirmed in Meta. This is an operator attestation, not automated proof of the Meta UI result. |

The site never uses `email@email.com` or `1234567890` as actual matching values. Email is trimmed/lowercased then SHA-256 hashed. Phone must have an explicit international `+` or `00` prefix; formatting is removed and country code retained before hashing. Ambiguous national numbers are omitted rather than guessing a country. At least one valid email/phone is required. Payment/customer API fields use Razorpay's documented schema.

Webhook request IP and User-Agent belong to Razorpay, not the buyer: they are not forwarded. No fabricated `fbp`, `fbc`, IP, browser agent or external ID is sent. If legitimately linked first-party matching data becomes available later, add it only with a verified payment association.

## Manual test checklist

1. **Deploy the implementation in inspection mode.** Select the existing Vercel project by its domain, add `CAPI_MODE=inspect` and the webhook secret, then deploy these files. The route is `/api/razorpay-webhook`; it must reach the Function, not return `index.html`. A GET should return 405, and an unsigned POST should return 401. An unauthenticated webhook must be able to reach this route without a Vercel login page; configure access narrowly for the test deployment without opening unrelated private deployments. This code does not change deployment-protection settings.
2. **Razorpay Test Mode → Account & Settings → Webhooks → Add webhook.** Use the deployment's HTTPS `/api/razorpay-webhook` URL, the same webhook secret, event `payment.captured`, and an alert email. Do not modify the Live Mode webhook yet. Keep the customer-facing live buttons unchanged; use Razorpay's Test Mode button preview/test checkout for the test transaction.
3. **Capture a real test payment and inspect the payload.** Vercel logs should show `webhook_received`, `signature_valid`, `payment_captured`, `payload_inspected`. The response is deliberately `inspected_no_conversion_sent`. Inspect the delivery payload in Razorpay; if needed, save it locally as `private/payment.webhook.json`, never in a public webhook-bin service. It is not yet a successful Meta test.
4. **Resolve product identity using that evidence.** Use the local helper below. If the webhook lacks email/contact/identity, run the helper with `--fetch` to inspect the documented payment, linked order and customer responses using Test Mode API credentials. Confirm the identifier is merchant-controlled, not a buyer-editable text field. Set `RAZORPAY_PRODUCT_ID_PATH`, optional additional ID map and needed enrichment resources. If no reliable identity exists in any response, STOP: this integration will return `product_unresolved`, not guess. The next step is confirmed merchant metadata/reference support on the Razorpay button/order, or a server-created order flow; that change is not made speculatively.
5. **Connect the store and configure Meta Test Events.** Add all required variables from the table, set `CAPI_MODE=test`, redeploy. Make a fresh captured test payment (or explicitly re-deliver the inspection event if still within 7 days). Verify logs through `product_identified`, `matching_prepared`, `capi_request_sent`, `meta_response` with `events_received: 1`, and `purchase_recorded`. In Meta Test Events verify **one Server Purchase**, the expected content ID/name, actual currency/value and matching fields. Local tests or Meta HTTP acceptance alone do not prove the dashboard result.
6. **Re-deliver the same captured payment.** Expect HTTP 200 `duplicate_ignored`, log `duplicate_event_ignored`, and no second CAPI request. Confirm Meta still shows one Purchase. Record the payment ID, event ID, product, currency/value, test timestamp and redacted proof. Test each product/market mapping before relying on all eight buttons. Do not switch production until this checklist is complete.

For a private local inspection, use Node 22+ with environment variables loaded privately:

```powershell
node --env-file=.env.local scripts/inspect-razorpay-payload.mjs private/payment.webhook.json
node --env-file=.env.local scripts/inspect-razorpay-payload.mjs private/payment.webhook.json --fetch
```

The helper prints schema, usable matching flags and `pl_…` identifier candidates, never raw customer values. A candidate path is evidence to inspect, not automatic configuration. It cannot validate signature unless the original signed request is delivered to the endpoint. Its fixtures/tests are synthetic and explicitly do not claim a real button field path.

## Delivery, retries and duplicate behavior

Only `payment.captured` with a valid raw-body HMAC-SHA256 signature is processed. Unknown event types return 200 after signature validation. Wrong account is rejected. Each payment is fetched with the configured mode's credentials and checked against webhook amount, currency, order and captured state. `INR`/`USD` are supported at their two-decimal minor-unit scale; other currencies fail closed. Capture time comes from webhook `created_at`, not the request's arrival time or payment authorization time.

The durable key is scoped by account, mode, Dataset and payment ID, not delivery ID. Meta `event_id` is `razorpay:test:pay_…` (or `razorpay:live:pay_…`), with event name `Purchase`. A 30-second atomic owner-checked lease prevents concurrent sends. The immutable pending event is saved before contacting Meta. Only an accepted `events_received: 1` followed by a durable sent marker returns `purchase_sent`.

Calls use a shared four-second outbound budget and the Vercel function has a 15-second maximum. Successful/duplicate processing returns 200 promptly; temporary API/store/configuration failures return 503 so Razorpay can retry. In-flight deliveries return 503 rather than falsely acknowledging unfinished work. If the process dies, the lease expires. No background work is abandoned after a 200 response. Measure actual cold-start/API latency in the real test; slow providers can still cause a retry.

There is no distributed transaction between Redis and Meta. If Meta receives an event but its response or the final database write is lost, retry uses the exact saved event ID/payload so Meta can deduplicate. Retries stop after 24 hours from the first attempt and emit `reconciliation_required`; do not blindly replay uncertain events outside Meta's deduplication window. Permanent done markers block late completed duplicates. Never delete a pending plan/done marker or change the Dataset/event ID to force a retry without first reconciling Meta's receipt.

Razorpay retries failed delivery for a limited period and may disable a consistently failing webhook. Check the configured alert email and Vercel errors, repair configuration/provider access, then use Razorpay's redelivery controls where available. This intentionally small synchronous design has no independent retry worker. If higher volume or repeated provider outages require a queue, add it then.

Logs contain correlation IDs, a short hashed payment reference, stages, product/value/currency, matching-presence flags and numeric Meta error codes. Raw request bodies, notes, customer values, hashes, tokens and full third-party error messages are not logged.

## Later production switch — NOT performed

After manually verifying the full test and duplicate delivery: set the live webhook secret/account/API credentials, inspect the live mapping separately if it differs, remove `META_TEST_EVENT_CODE`, set `CAPI_VERIFIED_TEST_PAYMENT_ID` to the verified test payment ID, set `CAPI_LIVE_APPROVED=true`, and set `CAPI_MODE=live`. Redeploy and configure the Live Mode webhook. Use a separate deployment/secret while transitioning so test and live webhooks cannot share the wrong configuration. Default/inspect mode never emits Purchase; live mode refuses incomplete approval settings.

## Validation and references

Run `node --test tests/conversions.test.mjs tests/kit-payments.test.cjs tests/pdf-sample.test.cjs`. These tests simulate signed webhooks, provider responses and storage; they do not establish live provider delivery or actual Redis/Vercel deployment behavior. Local HTTP checks also confirmed raw-byte signature verification, tampering rejection, method handling, protected source/environment paths, unknown API handling, SPA fallback and static assets.

- [Razorpay payment webhook schema](https://razorpay.com/docs/webhooks/payments/)
- [Razorpay signature verification and duplicates](https://github.com/razorpay/markdown-docs/blob/master/webhooks/validate-test.md)
- [Razorpay fetch payment API](https://razorpay.com/docs/api/payments/fetch-with-id/)
- [Razorpay webhook retries](https://d6xcmfyh68wv8.cloudfront.net/docs/webhooks/best-practices/)
- [Vercel Node.js Web Request handlers](https://vercel.com/docs/functions/runtimes/node-js)
- [Vercel storage options](https://vercel.com/docs/storage), [Blob conditional writes](https://vercel.com/docs/vercel-blob/using-blob-sdk)
- [Upstash REST API](https://upstash.com/docs/redis/features/restapi)
- [Meta official Business SDK](https://github.com/facebook/facebook-nodejs-business-sdk)
- [Meta CAPI parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/)
- [Meta event deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)

Meta documentation pages were not retrievable in this session; confirm the generated API version and account-specific UI during setup. The real payload/mapping and end-to-end result remain unverified until the manual steps above run.
