# Discount registration setup

This script saves previous purchase, contact details, desired kit and reason for manual discount review. It does not verify purchases, calculate a discount, or send emails automatically.

1. Open the Apps Script project for the **Register & Get Discount** endpoint (deployment ID `AKfycbwNFB5OzO2ZT4i0c9oREhnFfhmdLxch-mXq7cmguPBLrgWr-SSk9zpybkloAUD_8InmlQ`). Do not replace the separate free-download email script.
2. The previous server-side source is not in this repository. Save a copy of your existing script before replacing it with `discount-requests.gs`. If it has additional custom logic you want to keep, merge that logic instead of discarding it.
3. Set `DISCOUNT_SPREADSHEET_ID` to the ID between `/d/` and `/edit` in your Google Sheet URL.
4. Run `setupDiscountSheet` once and authorize it. It creates a new **Discount Requests v2** tab; existing tabs and rows remain untouched.
5. Select **Deploy → Manage deployments → Edit (pencil) → New version → Deploy** on the existing web app deployment. Execute as yourself and retain public access so visitors can submit without signing in. Updating the existing deployment preserves the website's URL. If you create a different deployment, replace the discount fetch URL in `js/script.js` with its `/exec` URL.
6. Publish the updated website files (`index.html` and `js/script.js`). After deployment, submit a test request yourself and confirm the new tab contains the previous course and interested course in separate columns.

Requests are marked **Pending review**. Check the purchase against your records before sharing a discount. First-time buyers can choose **I haven’t purchased yet**; older cached forms are recorded as **Not provided (legacy form)**.

The local checks use a mocked Sheet only; no live request or email was sent.
