# Chapter 1 sample PDFs

The 18 current PDFs in `pdfs/chapter-samples/` are unchanged copies of the user-provided Drive files. These are required website assets, not backups. Static delivery avoids the 4.5 MB Vercel Function response limit; each supplied PDF is larger than that limit. The reader still uses PDF.js inside the course page.

`scripts/chapter-samples.json` records the course/module mapping, original Drive links, filenames and verified opening page numbers. `js/ml-pdf-samples.js` contains the matching runtime catalog. `api/pdf-sample.js` redirects legacy approved sample keys to these static assets.

Deploy the entire project, including the new PDFs and `images/ml-pdf-samples/*-v2.webp` thumbnails. Changing a PDF on Drive does not automatically change the deployed copy: replace its static PDF, refresh the thumbnail and opening page if needed, and redeploy. Use a new versioned filename for replacements to avoid stale browser copies.

DS Gen AI's sample label uses Module 8 as explicitly supplied for this update; the existing seven-module course curriculum remains unchanged.
