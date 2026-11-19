import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const site=path.join(root,'site');
const fail=message=>{throw new Error(message);};
async function walk(folder){const out=[];for(const d of await fs.readdir(folder,{withFileTypes:true})){if(['.git','node_modules'].includes(d.name))continue;const p=path.join(folder,d.name);if(d.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const profile=JSON.parse(await fs.readFile(path.join(site,'profile.json'),'utf8'));
for(const key of ['name','headline','location','email','phone','availability','avatar','botAvatar','resumeUrl','resumeText','publicResumeUrl','websiteUrl'])if(profile[key])fail('Public profile field must be blank: '+key);
for(const key of ['gallery','projects','skills','software','personalBio','resumePages'])if(profile[key]?.length)fail('Personal collection must be empty: '+key);
if(profile.bio?.some(Boolean)||Object.values(profile.socials||{}).some(Boolean))fail('Public biography/social links must be blank');
const files=await walk(root);let checked=0;
for(const file of files){
 const rel=path.relative(root,file).replaceAll('\\','/');
 if(rel.startsWith('site/uploads/')||/\.(pdf|env)$/i.test(rel)||/(^|\/)editor\.js$/.test(rel))fail('Private-content file in public tree: '+rel);
 if(!/\.(js|mjs|json|css|html|svg|md|yml)$/.test(file))continue;
 const text=await fs.readFile(file,'utf8');
 if(/\b(?:ghp_|github_pat_|sk-proj-)[A-Za-z0-9_]{16,}/.test(text))fail('Possible secret in '+rel);
 if(/https?:\/\/(?:www\.)?(?:linkedin\.com\/in\/|skills\.google\/public_profiles\/|steamcommunity\.com\/profiles\/)/i.test(text))fail('Personal account URL in '+rel);
 if(/\.(?:js|mjs)$/.test(file)){
  const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0)fail(r.stderr);
  for(const m of text.matchAll(/(?:from\s*|import\s*\(?)["'](\.[^"']+\.js)["']/g)){
   const dest=path.resolve(path.dirname(file),m[1]);try{await fs.access(dest);}catch{fail('Missing local module: '+rel+' → '+m[1]);}
  }
  checked++;
 }
 if(file.endsWith('.json'))JSON.parse(text);
}
const certificates=await fs.readFile(path.join(site,'certificates.js'),'utf8');
for(const name of ['recentCertificates','honors','fema','courses'])if(!certificates.includes('const '+name+'=[];'))fail('Personal credential collection must be empty: '+name);
console.log(`Public checks passed: ${checked} JavaScript modules; blank profile and credential collections; local imports resolve. Review new images and prose manually before publishing.`);
