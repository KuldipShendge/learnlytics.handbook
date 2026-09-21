# Chapter 1 sample PDFs

All 18 Read sample cards open a dialog inside the course page. The PDF loads
from its original public Google Drive /preview URL in an iframe. Clicking a
sample does not open a new tab. The original /view link is only a secondary
Open separately fallback, alongside Reload preview and Back to course.

Google Drive supplies scrolling and zoom. The heading states the PDF page where
Chapter 1 starts; automatic starting-page selection is not provided. The iframe
is removed when closing or replacing a sample. A delayed preview shows help
instead of silently opening a different tab. Cross-origin iframe load events
cannot confirm the PDF's contents, so reload and the fallback remain available.

The reader does not require local PDF copies, PDF.js assets, or PDF bytes through
a Vercel Function. Existing local PDFs are preserved but need not be uploaded.
The old live static PDF path returned HTML instead of PDF on 21 September 2026.

scripts/chapter-samples.json records original links and metadata.
js/ml-pdf-samples.js contains the matching runtime catalog. api/pdf-sample.js
redirects legacy approved keys to the original Drive /view URL. The current
in-page reader does not use that endpoint. Public Drive viewing must remain enabled.

Push these website files together:
- index.html
- js/ml-pdf-samples.js
- css/ml-pdf-drive.css
- api/pdf-sample.js (if today's earlier update has not been pushed)

Also keep tests/pdf-sample.test.cjs and this documentation in source.
Existing thumbnail images remain required. A changed Drive file ID requires
updating the catalogs and legacy endpoint.

Verification: all 18 sample mappings and the legacy endpoint tests pass. Browser
checks confirm in-page dialog opening across all three courses, reload replacing
the iframe, close cleanup and focus restoration. PDF rendering in the iframe
remains unverified: the test browser shows a blank Drive iframe in both the
website and a minimal standalone embed page. Verify rendering on the hosted site.
