import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {server} from './serve.mjs';
const root=new URL('../site/',import.meta.url);
async function files(url,prefix=''){
 const result=[];
 for(const e of await readdir(url,{withFileTypes:true})){
  if(e.isDirectory())result.push(...await files(new URL(e.name+'/',url),prefix+e.name+'/'));
  else result.push(prefix+e.name);
 }
 return result;
}
try{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base='http://127.0.0.1:'+server.address().port;
 const names=await files(root);
 for(const name of names){
  const response=await fetch(base+'/'+name,{signal:AbortSignal.timeout(5000)});
  assert.equal(response.status,200,name);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(new URL(name,root)),name);
  if(name.endsWith('.js'))assert.match(response.headers.get('content-type'),/javascript/,name);
 }
 const home=await fetch(base+'/');assert.equal(home.status,200);assert.match(await home.text(),/desktop/);
 for(const route of ['/about','/about/','/privacy','/privacy/']){
  const page=await fetch(base+route);assert.equal(page.status,200,route);assert.match(await page.text(),/bsod-profile/,route);
 }
 assert.equal((await fetch(base+'/missing-file')).status,404);
 assert.equal((await fetch(base+'/%2e%2e%2fpackage.json')).status,404);
 console.log(`Local HTTP preview passed: ${names.length} public files match disk; home, JavaScript MIME, missing-file and path-boundary checks passed. Browser interaction testing is separate.`);
}finally{await new Promise(resolve=>server.close(resolve));}
