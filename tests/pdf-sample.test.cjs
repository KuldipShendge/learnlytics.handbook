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
test('all 18 approved keys redirect to real PDF assets for GET and HEAD',()=>{
 assert.equal(Object.keys(samples).length,18);
 for(const [key,sample] of Object.entries(samples)){
  const file=path.join(__dirname,'../pdfs/chapter-samples',sample.file);
  assert.equal(fs.readFileSync(file).subarray(0,5).toString(),'%PDF-');
  for(const method of ['GET','HEAD']){
   const res=response();handler({method,url:'/api/pdf-sample?sample='+key},res);
   assert.equal(res.statusCode,307);assert.equal(res.headers.Location,'/pdfs/chapter-samples/'+sample.file);assert.equal(res.body,undefined);
  }
 }
});
