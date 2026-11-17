import {EDITOR_MODE} from './mode.js';
export const emptyProfile = {name:'',headline:'',location:'',email:'',phone:'',availability:'',avatar:'',botAvatar:'',bio:['','',''],personalBio:[],skills:[],software:[],resumeUrl:'',publicResumeUrl:'',resumeText:'',resumePages:[],socials:{instagram:'',github:'',linkedin:'',letterboxd:'',steam:''},projects:[],gallery:[],websiteUrl:'',desktopTitle:'NZJOSH XP',wallpaper:'assets/bliss.jpg',crt:true,startupSound:true};
const storageKey = 'nzjosh.profile.v1';
export let profile = structuredClone(emptyProfile);
export const escapeHTML = (value='') => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value, image=false) {
  const url=String(value||'').trim();
  if (!url) return '';
  if (/^["']|^[a-z]:[\\/]|^file:|^\\\\/i.test(url)) return '';
  if (image && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(url)) return url;
  if (/^(assets|uploads)\/[A-Za-z0-9_./ -]+$/.test(url) && !url.split('/').includes('..')) return url;
  try { const parsed=new URL(url); return ['http:','https:'].includes(parsed.protocol) ? parsed.href : ''; } catch { return ''; }
}
export function normalizeProfile(data) {
  const clean=structuredClone(emptyProfile);
  for(const key of ['name','headline','location','email','phone','availability','resumeText']) clean[key]=String(data?.[key]||'').slice(0,key==='resumeText'?20000:1000);
  for(const key of ['avatar','botAvatar','wallpaper']) clean[key]=safeURL(data?.[key],true)||(key==='wallpaper'?'assets/bliss.jpg':'');
  for(const key of ['resumeUrl','publicResumeUrl','websiteUrl']) clean[key]=safeURL(data?.[key]);
  clean.resumePages=(Array.isArray(data?.resumePages)?data.resumePages:[]).slice(0,10).map(p=>safeURL(p,true)).filter(Boolean);
  clean.desktopTitle=String(data?.desktopTitle||'NZJOSH XP').slice(0,40);
  clean.personalBio=(Array.isArray(data?.personalBio)?data.personalBio:[]).slice(0,12).map(value=>String(value||'').slice(0,10000));
  clean.bio=Array.from({length:3},(_,i)=>String(data?.bio?.[i]||'').slice(0,10000));
  for(const key of ['skills','software']) clean[key]=(Array.isArray(data?.[key])?data[key]:[]).map(x=>String(x).trim().slice(0,100)).filter(Boolean).slice(0,25);
  for(const key of Object.keys(clean.socials)) clean.socials[key]=safeURL(data?.socials?.[key]);
  clean.projects=(Array.isArray(data?.projects)?data.projects:[]).slice(0,30).map(p=>({title:String(p.title||'').slice(0,200),category:['App','Client','Personal','Website'].includes(p.category)?p.category:'Personal',description:String(p.description||'').slice(0,10000),date:String(p.date||'').slice(0,100),image:safeURL(p.image,true),url:safeURL(p.url)}));
  clean.gallery=(Array.isArray(data?.gallery)?data.gallery:[]).slice(0,50).map(p=>({title:String(p.title||'').slice(0,200),album:String(p.album||'').slice(0,100),image:safeURL(p.image,true),thumbnail:safeURL(p.thumbnail,true),description:String(p.description||'').slice(0,1000)})).filter(p=>p.image);
  clean.crt=data?.crt!==false;clean.startupSound=data?.startupSound!==false;
  return clean;
}
export async function loadProfile() {
  let data=emptyProfile;
  try { const response=await fetch('profile.json',{cache:'no-store'}); if(response.ok) data=await response.json(); } catch {}
  try { if(EDITOR_MODE){const local=localStorage.getItem(storageKey); if(local) data=JSON.parse(local);}else{const preferences=JSON.parse(localStorage.getItem('nzjosh.preferences.v1')||'{}');for(const key of ['wallpaper','crt','startupSound'])if(key in preferences)data[key]=preferences[key];} } catch {}
  profile=normalizeProfile(data); return profile;
}
export function saveProfile(value) {
  const next=normalizeProfile(value);
  if(EDITOR_MODE)localStorage.setItem(storageKey,JSON.stringify(next));
  else localStorage.setItem('nzjosh.preferences.v1',JSON.stringify({wallpaper:next.wallpaper,crt:next.crt,startupSound:next.startupSound}));
  profile=next;
  window.dispatchEvent(new CustomEvent('profilechange',{detail:profile}));
  return profile;
}
export function downloadFile(name,content,type='text/plain') {
  const url=URL.createObjectURL(new Blob([content],{type}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
