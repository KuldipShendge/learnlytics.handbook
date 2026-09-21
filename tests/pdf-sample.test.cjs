const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const handler=require('../api/pdf-sample.js');
const {samples}=require('../scripts/chapter-samples.json');
const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v},end(body){this.body=body}});
test('unknown keys and unsupported methods cannot redirect',()=>{
 for(const [method,key,status] of [['POST','math-handbook',405],['GET','https://example.com',404],['GET','toString',404]]){
  const res=response();handler({method,url:'/api/pdf-sample?sample='+encodeURIComponent(key)},res);assert.equal(res.statusCode,status);assert.equal(res.headers.Location,undefined);
 }
});
test('all 18 sample cards use the in-page reader and matching Drive catalog',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const script=fs.readFileSync(path.join(__dirname,'../js/ml-pdf-samples.js'),'utf8');
 const runtime=JSON.parse(script.match(/const samples = (\{[\s\S]*?\n\});/)[1]);
 const cards=[...html.matchAll(/<button\b[^>]*data-ml-pdf="([^"]+)"[^>]*>/g)];
 assert.equal(cards.length,18);
 assert.equal(new Set(cards.map(card=>card[1])).size,18);
 for(const [tag,key] of cards){
  assert.equal(runtime[key].driveUrl,samples[key].driveUrl);
  assert.match(tag,/aria-controls="mlPdfPreview"/);
  assert.match(tag,/aria-haspopup="dialog"/);
  assert.doesNotMatch(tag,/target=|href=/);
 }
 assert.equal((html.match(/<dialog\b[^>]*id="mlPdfPreview"/g)||[]).length,1);
 assert.doesNotMatch(html,/<a\b[^>]*data-ml-pdf=/);
});
test('all 18 approved keys redirect to their original Drive viewer for GET and HEAD',()=>{
 assert.equal(Object.keys(samples).length,18);
 for(const [key,sample] of Object.entries(samples)){
  assert.match(sample.driveUrl, /^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]+\/view$/);
  for(const method of ['GET','HEAD']){
   const res=response();handler({method,url:'/api/pdf-sample?sample='+key},res);
   assert.equal(res.statusCode,307);assert.equal(res.headers.Location,sample.driveUrl);assert.equal(res.body,undefined);
  }
 }
});
