const { test } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/pdf-sample.js');
function response() {
  return { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = body; } };
}
test('rejects unsupported methods and unknown samples without fetching', async t => {
  const fetch = t.mock.method(global, 'fetch', () => { throw new Error('Must not fetch'); });
  for (const [method, key, status] of [['POST','math-handbook',405],['GET','https://example.com',404],['GET','toString',404]]) {
    const res = response();
    await handler({ method, url: '/api/pdf-sample?sample=' + encodeURIComponent(key) }, res);
    assert.equal(res.statusCode, status);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  }
  assert.equal(fetch.mock.callCount(), 0);
});
test('serves valid Drive PDF bytes inline and caches only success', async t => {
  const bytes = Buffer.from('%PDF-1.7\nvalid sample fixture');
  t.mock.method(global, 'fetch', async url => {
    assert.equal(new URL(url).searchParams.get('id'), '1NrfvS0IaW_9V3HYBuf96BdmUTo6b4H5Y');
    return new Response(bytes);
  });
  const res = response();
  await handler({ method: 'GET', url: '/api/pdf-sample?sample=math-handbook' }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, bytes);
  assert.equal(res.headers['Content-Type'], 'application/pdf');
  assert.match(res.headers['Content-Disposition'], /^inline/);
  assert.match(res.headers['Cache-Control'], /s-maxage=3600/);
});
test('rejects Drive login HTML, network errors and oversized content', async t => {
  const fetch = t.mock.method(global, 'fetch');
  for (const result of [() => new Response('<html>Sign in</html>'), () => { throw new Error('Network'); }, () => new Response('too large', {headers:{'content-length':5*1024*1024}}), () => new Response(new Uint8Array(4*1024*1024+1))]) {
    fetch.mock.mockImplementation(async () => result());
    const res = response();
    await handler({ method: 'GET', url: '/api/pdf-sample?sample=math-handbook' }, res);
    assert.equal(res.statusCode, 502);
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.equal(res.headers['Content-Type'], 'application/json; charset=utf-8');
  }
});
test('HEAD returns matching PDF headers without a response body', async t => {
  t.mock.method(global, 'fetch', async () => new Response('%PDF-1.7\nfixture'));
  const res = response();
  await handler({ method: 'HEAD', url: '/api/pdf-sample?sample=eda-solutions' }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body, undefined);
  assert.equal(res.headers['Content-Disposition'], 'inline; filename="EDA-Solution.pdf"');
});
