// Viewing deterrents only: public images remain accessible to the browser.
const scope='.program-gallery,.program-gallery3d,[data-personal-pictures]';
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('./picture-protection.css',import.meta.url).href;document.head.append(sheet);
function photoTarget(event){return event.target instanceof Element&&event.target.closest(scope);}
for(const type of ['contextmenu','dragstart'])document.addEventListener(type,event=>{
  if(photoTarget(event)&&event.target.closest('img,.image-stage,.album-cover-photo')){event.preventDefault();event.stopPropagation();}
},true);
document.addEventListener('keydown',event=>{
  const window=document.querySelector('.app-window.active');
  if((event.ctrlKey||event.metaKey)&&['p','s'].includes(event.key.toLowerCase())&&(photoTarget(event)||window?.querySelector(scope))){event.preventDefault();}
},true);
export function protectPictures(root){
 root.dataset.personalPictures='';
 root.querySelectorAll('img').forEach(image=>{image.draggable=false;});
 // No download or print controls are offered for personal photographs.
 root.querySelectorAll('a[download],[data-print],[data-download]').forEach(control=>control.remove());
}
