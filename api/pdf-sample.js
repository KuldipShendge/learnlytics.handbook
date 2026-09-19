// Only these six user-provided public files may be served by this endpoint.
const samples = Object.freeze({
  'math-handbook': ['1NrfvS0IaW_9V3HYBuf96BdmUTo6b4H5Y', 'Math-01.pdf'],
  'math-solutions': ['1F5v0mI-tccz493TYzLEEu9ztKND0EdO6', 'Math-Solution.pdf'],
  'eda-handbook': ['1AFPSPOXo11BbQN1gRdMiW7Fn-lEGrKIY', 'EDA.pdf'],
  'eda-solutions': ['1d3jeAoedRPtYNZ4S-28dhhdPTUGSKajt', 'EDA-Solution.pdf'],
  'mlops-handbook': ['16DkrMtl9NxCDtgNr0mabwN_RS77WvA4Q', 'MLops-01.pdf'],
  'mlops-solutions': ['1R8BkMMbAzYIc4hUKMI4xWGGM0DR1nv11', 'MLops-Solution.pdf']
});
const MAX_BYTES = 4 * 1024 * 1024;

module.exports = async function pdfSample(req, res) {
  const fail = (status, message) => {
    res.statusCode = status;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: message }));
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return fail(405, 'Method not allowed.');
  }
  const key = new URL(req.url, 'http://localhost').searchParams.get('sample');
  if (!Object.hasOwn(samples, key)) return fail(404, 'Unknown sample.');
  const [id, filename] = samples[key];
  try {
    const upstream = await fetch(`https://drive.google.com/uc?export=download&id=${id}`, {
      signal: AbortSignal.timeout(20000), redirect: 'follow'
    });
    if (!upstream.ok || !upstream.body) return fail(502, 'The sample is temporarily unavailable.');
    if (Number(upstream.headers.get('content-length')) > MAX_BYTES) {
      await upstream.body.cancel();
      return fail(502, 'The sample exceeds the preview size limit.');
    }
    const reader = upstream.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return fail(502, 'The sample exceeds the preview size limit.');
      }
      chunks.push(Buffer.from(value));
    }
    const pdf = Buffer.concat(chunks);
    // Google can return a login or quota page with HTTP 200. Never cache it as PDF.
    if (pdf.subarray(0, 5).toString() !== '%PDF-') return fail(502, 'Drive did not return a readable PDF.');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
    res.end(req.method === 'HEAD' ? undefined : pdf);
  } catch (error) {
    console.error('Drive sample request failed:', error.name);
    return fail(502, 'The sample is temporarily unavailable. Please try again.');
  }
};
