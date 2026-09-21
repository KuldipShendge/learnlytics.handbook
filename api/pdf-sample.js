// Legacy sample endpoint: redirect approved keys to their original Drive viewer.
// PDF bytes are never proxied through a Vercel Function.
const samples = Object.freeze({
  "ds-python-handbook": "https://drive.google.com/file/d/1lBFFR4lB1eZo8k1A0w2v9ahq3nmxuGgN/view",
  "ds-python-solutions": "https://drive.google.com/file/d/1d7a2ump-RuAFO8Q1FTR1M9ZQijgoC_rg/view",
  "ds-genai-handbook": "https://drive.google.com/file/d/1vjbNAxnqpeivtYvEXqr4dEbFuqICtyVL/view",
  "ds-genai-solutions": "https://drive.google.com/file/d/1D3zxmC1gGEx4Edo5kBLLHeaQwUEPXqTI/view",
  "ds-evaluation-handbook": "https://drive.google.com/file/d/1d_ueAUcbAlL-uo3RNGharPyF8-P5faAz/view",
  "ds-evaluation-solutions": "https://drive.google.com/file/d/1aeVURbSL9KU47ibCwVKN29CsA1YKOwH1/view",
  "combo-regression-handbook": "https://drive.google.com/file/d/1pvuh4iJtK61Lpnoy6iccZe_U2owBkvyU/view",
  "combo-regression-solutions": "https://drive.google.com/file/d/1qJ2zW8_SRUvRy6g3lRt0WXMGibjXThVL/view",
  "combo-mlops-handbook": "https://drive.google.com/file/d/1YFlcVgpNM-PelR2EGjCWBr1FrpvUI7wv/view",
  "combo-mlops-solutions": "https://drive.google.com/file/d/1_iP0rXc-_uQXORBy1FU96YpsbvwdB5zq/view",
  "combo-genai-handbook": "https://drive.google.com/file/d/1H5DZpmKsb674pi0jW7aUKqIfEKpaTNxh/view",
  "combo-genai-solutions": "https://drive.google.com/file/d/1adzvq052uK5m8sTGDvmlR4-isr555lqm/view",
  "math-handbook": "https://drive.google.com/file/d/1t2HALsWlwOB0z8dXQI31zR6Izaqsy5Mk/view",
  "math-solutions": "https://drive.google.com/file/d/1pCBurAW5Z2LB17YO0RryahjdD58xayLG/view",
  "eda-handbook": "https://drive.google.com/file/d/1akhotgg4eNlRAszDDpOCyHtl2cVVgXSg/view",
  "eda-solutions": "https://drive.google.com/file/d/1QLY_C_G8XNgq9a36AjC6pIp165AlWuUN/view",
  "mlops-handbook": "https://drive.google.com/file/d/1oMuVpJH-zjMnANDxk04ePrHVPyLVEox5/view",
  "mlops-solutions": "https://drive.google.com/file/d/1mkpV5eCMem3UdcfyMeTrXIuORLdbBHp4/view"
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
  res.setHeader('Location', samples[key]);
  res.end();
};
