let currentDocument=null;
export async function openDocument(document){
 currentDocument=document;const {openApp}=await import('./desktop.js');await openApp('document');
 const root=window.document.querySelector('[data-app="document"] .window-content');if(root)renderDocument(root,currentDocument);
}
export function renderDocument(root,document){
 if(!document){root.textContent='Choose a document from Certificates & Awards.';return;}
 const shell=root.closest('.app-window');root.replaceChildren();root.style.cssText='display:flex;flex-direction:column;padding:0;background:#525659;color:#111';
 shell.querySelectorAll(':scope > .addressbar,:scope > .window-toolbar').forEach(n=>n.remove());
 const toolbar=window.document.createElement('div');toolbar.style.cssText='display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px;background:#ece9d8;color:#111';
 const title=window.document.createElement('strong');title.textContent=document.title;toolbar.append(title);
 const download=window.document.createElement('a');download.textContent='Download';download.href=document.download||document.src;download.download='';download.className='xp-button';toolbar.append(download);
 const print=window.document.createElement('button');print.textContent='Print';print.className='xp-button';toolbar.append(print);
 const zoom=window.document.createElement('button');zoom.textContent='Zoom +';zoom.className='xp-button';toolbar.append(zoom);
 const fit=window.document.createElement('button');fit.textContent='Fit';fit.className='xp-button';toolbar.append(fit);root.append(toolbar);
 const stage=window.document.createElement('div');stage.style.cssText='flex:1;min-height:0;overflow:auto;padding:12px;text-align:center';root.append(stage);
 let scale=1;const images=[];
 if(document.pages?.length||!document.src.toLowerCase().endsWith('.pdf')){
  for(const src of document.pages||[document.src]){const image=window.document.createElement('img');image.src=src;image.alt=document.title;image.style.cssText='display:block;max-width:100%;height:auto;margin:0 auto 12px;background:white';stage.append(image);images.push(image);}
 }else{const frame=window.document.createElement('iframe');frame.src=document.src;frame.title=document.title;frame.style.cssText='width:100%;height:100%;min-height:350px;border:0;background:white';stage.append(frame);zoom.disabled=true;fit.disabled=true;}
 print.onclick=async()=>{
  if(!images.length){try{stage.querySelector('iframe').contentWindow.print();}catch{print.title='Use the PDF toolbar Print control.';}return;}
  print.disabled=true;
  const frame=window.document.createElement('iframe');frame.title='Print document';frame.style.cssText='position:fixed;width:1px;height:1px;left:-10000px;top:0;border:0';window.document.body.append(frame);
  const paper=frame.contentDocument;paper.open();paper.write('<!doctype html><html><head><title>Print document</title><style>@page{margin:10mm}body{margin:0}img{display:block;width:100%;height:auto;break-after:page}img:last-child{break-after:auto}</style></head><body></body></html>');paper.close();
  const copies=images.map(image=>{const copy=paper.createElement('img');copy.src=image.src;copy.alt=image.alt;paper.body.append(copy);return copy;});
  try{await Promise.all(copies.map(image=>image.decode()));frame.contentWindow.focus();frame.contentWindow.print();}finally{print.disabled=false;setTimeout(()=>frame.remove(),1000);}
 };
 const resize=()=>images.forEach(image=>{image.style.maxWidth=scale===1?'100%':'none';image.style.width=scale===1?'auto':(stage.clientWidth*scale-24)+'px';});zoom.onclick=()=>{scale=Math.min(3,scale+.25);resize();};fit.onclick=()=>{scale=1;resize();};
}

