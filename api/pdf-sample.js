// Legacy sample endpoint: redirect only approved keys to current static PDFs.
// Static delivery avoids Vercel's function response-size limit.
const samples = Object.freeze({
  "ds-python-handbook": "ds-python-handbook-v2.pdf",
  "ds-python-solutions": "ds-python-solutions-v2.pdf",
  "ds-genai-handbook": "ds-genai-handbook-v2.pdf",
  "ds-genai-solutions": "ds-genai-solutions-v2.pdf",
  "ds-evaluation-handbook": "ds-evaluation-handbook-v2.pdf",
  "ds-evaluation-solutions": "ds-evaluation-solutions-v2.pdf",
  "combo-regression-handbook": "combo-regression-handbook-v2.pdf",
  "combo-regression-solutions": "combo-regression-solutions-v2.pdf",
  "combo-mlops-handbook": "combo-mlops-handbook-v2.pdf",
  "combo-mlops-solutions": "combo-mlops-solutions-v2.pdf",
  "combo-genai-handbook": "combo-genai-handbook-v2.pdf",
  "combo-genai-solutions": "combo-genai-solutions-v2.pdf",
  "math-handbook": "math-handbook-v2.pdf",
  "math-solutions": "math-solutions-v2.pdf",
  "eda-handbook": "eda-handbook-v2.pdf",
  "eda-solutions": "eda-solutions-v2.pdf",
  "mlops-handbook": "mlops-handbook-v2.pdf",
  "mlops-solutions": "mlops-solutions-v2.pdf"
});
module.exports = function pdfSample(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    return res.end();
  }
  const key = new URL(req.url, 'http://localhost').searchParams.get('sample');
  if (!Object.hasOwn(samples, key)) {
    res.statusCode = 404;
    return res.end();
  }
  res.statusCode = 307;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Location', '/pdfs/chapter-samples/' + samples[key]);
  res.end();
};
