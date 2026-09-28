const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,'../js',n),'utf8');
function checkout(){
 const forms=[],clicks=[]; let observer;
 const context={window:{},setTimeout,clearTimeout,MutationObserver:class{constructor(fn){observer=fn}observe(){}disconnect(){}},document:{getElementById:()=>null,body:{append:f=>forms.push(f)},createElement:tag=>({dataset:{},setAttribute(){},remove(){},querySelector(){return this.button},append(script){this.button={click:()=>clicks.push(script.dataset.payment_button_id)};observer()}})}};
 vm.runInNewContext(read('kit-payments.js'),context); return {...context,forms,clicks};
}
const ids={ 'data-analyst':['pl_ThVHCCQ2yen4NY','pl_ThXweHqkLlL64U'], 'ai-automation':['pl_ThY1yderWIYPj0','pl_ThY3jfk29pD143'], 'data-science':['pl_ThY5ZHwc4wAyAL','pl_ThYC9dN6TDPgpj'], 'ds-genai-ml':['pl_ThYEBdhXwq6ycx','pl_ThYGVEIFLYXbbq']};
for(const country of ['IN','US','DE','FR']) test('checkout mapping '+country,async()=>{const c=checkout();c.window.configureKitPayments(country,new Set(['IN']),new Set(),new Set(['DE','FR']));for(const [kit,pair] of Object.entries(ids)){await c.window.openKitPayment(kit);assert.equal(c.clicks.at(-1),pair[country==='IN'?0:1]);}assert.ok(c.forms.every(f=>f.hidden));});
test('waits for region and reuses loaded native button',async()=>{const c=checkout();let ready;c.window.checkoutRegionReady=new Promise(r=>ready=r);const p=c.window.openKitPayment('data-science');assert.equal(c.forms.length,0);c.window.configureKitPayments('US',new Set(),new Set(),new Set());ready();await p;await c.window.openKitPayment('data-science');assert.equal(c.forms.length,1);assert.equal(c.clicks.length,2);});
test('Meta only uses opted-in real normalized matching fields',()=>{const calls=[];const c={window:{fbq:(...a)=>calls.push(a)}};vm.runInNewContext(read('meta-matching.js'),c);const send=c.window.submitMetaMatching;assert.equal(send({email:'person@example.org'}),false);assert.equal(send({email:'email@email.com',phone:'1234567890',consent:true}),false);assert.equal(calls.length,0);assert.equal(send({email:' PERSON@example.org ',phone:'+91 98765 43210',consent:true}),true);assert.deepEqual(JSON.parse(JSON.stringify(calls[0])),['init','1441817607724869',{em:'person@example.org',ph:'919876543210'}]);assert.equal(send({email:'person@example.org',phone:'+919876543210',consent:true}),false);assert.equal(calls.length,2);});
