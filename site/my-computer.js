import {setExplorerPath} from './explorer-path.js';
import {refreshWindowIcons} from './xp-icon-refresh.js';
export function computer(root,context,profile){
 const shell=context.window;
 const icons={desktop:'xp-icons/computer.png',computer:'xp-icons/computer.png',about:'xp-icons/about.png',contact:'xp-icons/contact.webp',resume:'xp-icons/resume.webp',gallery:'xp-icons/pictures.png',achievements:'xp-icons/certificates.png',credits:'xp-icons/windows-flag.png',nas:'xp-icons/nas.webp'};
 const labels={desktop:'Desktop',about:'About Me',contact:'Contact Me',resume:'My Resume',gallery:'Pictures',achievements:'Certificates & Awards',credits:'About Desktop',nas:'Fuller NAS'};
 const button=(id,large=false)=>`<button type="button" class="${large?'computer-item':'computer-link'}" data-computer-open="${id}"><img src="${icons[id]}" alt=""><span>${labels[id]}</span></button>`;
 const card=(title,body)=>`<section class="explorer-card"><h3>${title}<button type="button" aria-label="Toggle ${title}" aria-expanded="true"><span aria-hidden="true" class="card-chevron"></span></button></h3><div class="explorer-card-body">${body}</div></section>`;
 const chrome=document.createElement('div');chrome.className='computer-chrome';
 chrome.innerHTML=`<div class="window-menubar"><details><summary>File</summary><div class="computer-menu"><button data-computer-close>Close</button></div></details><details><summary>View</summary><div class="computer-menu"><button data-computer-maximize>Maximize / Restore</button></div></details><details><summary>Help</summary><div class="computer-menu">${button('credits').replace('About Desktop','About')}${button('contact')}<button data-computer-open="messenger">Ask JoshBot</button></div></details><span class="window-flag"><img src="xp-icons/windows-flag.png" alt="Windows"></span></div><div class="window-toolbar"><button disabled><span class="nav-circle">➜</span>Back</button><button disabled><span class="nav-circle">➜</span>Forward</button><i class="toolbar-separator"></i>${button('about')}${button('resume')}${button('gallery')}${button('achievements')}</div><div class="addressbar"><span>Address</span><div class="address-input"><img src="${icons.computer}" alt=""><span>My Computer</span><span>⌄</span></div><span class="address-go"><b>➜</b>Go</span></div>`;
 shell.insertBefore(chrome,root);
 root.innerHTML=`<style>
 .program-computer{padding:0!important;background:#fff!important;color:#111!important}
 .computer-layout{display:grid;grid-template-columns:195px minmax(0,1fr);min-height:100%}
 .computer-sidebar{padding:12px;background:linear-gradient(#7ba3e5,#647bd3);color:#16499a}
 .computer-sidebar .explorer-card{margin-bottom:14px}.computer-sidebar .explorer-card-body{padding:10px}
 .computer-link{display:flex;align-items:center;gap:6px;text-align:left;width:100%;border:0;background:transparent;color:inherit;padding:4px 0;cursor:pointer}
 .computer-link img{width:16px;height:16px;flex-shrink:0}.computer-link:hover span{text-decoration:underline}
 .computer-main{padding:16px 20px;min-width:0}.computer-main h2{font-size:13px;margin:0 0 12px;border-bottom:1px solid #b6ccec;padding:0 0 5px}
 .computer-main section{margin-bottom:26px}.computer-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
 .computer-item{display:flex;align-items:center;gap:12px;padding:9px;text-align:left;border:1px solid transparent;background:transparent;color:inherit;min-height:66px;cursor:pointer}
 .computer-item img{width:48px;height:48px;flex-shrink:0}.computer-item:hover{background:#e8f0fc}.computer-item.computer-selected{background:#316ac5;color:#fff}:root[data-race-theme="active"] .computer-item.computer-selected{background:#ff8000;color:#111}.computer-item:focus-visible,.computer-link:focus-visible{outline:2px solid #245edb;outline-offset:1px}
 .computer-user{display:flex;align-items:center;gap:12px;padding:9px}.computer-user img{width:48px;height:48px;object-fit:cover}.computer-user small{display:block;margin-top:4px;color:#555}
 .computer-chrome .window-toolbar .computer-link{width:auto;display:inline-flex;white-space:nowrap;padding:0 6px}.computer-chrome .window-menubar{position:relative;display:flex}.computer-chrome details{position:relative}.computer-chrome summary{list-style:none;cursor:pointer;padding:3px 8px}.computer-chrome summary::-webkit-details-marker{display:none}
 .computer-menu{position:absolute;top:100%;left:0;z-index:30;min-width:180px;padding:4px;background:#ece9d8;color:#111;border:1px solid #888;box-shadow:2px 2px 3px #0004}.computer-menu img{width:16px;height:16px;flex-shrink:0}.computer-menu button{align-items:center;gap:6px;display:flex;width:100%;padding:5px 9px;text-align:left;color:inherit;background:transparent;border:0}.computer-menu button:hover,.computer-menu button:focus-visible{background:#245edb;color:#fff}
 :root[data-race-theme="active"] .computer-sidebar{background:#30363d;color:#fff}:root[data-race-theme="active"] .computer-sidebar .explorer-card-body{background:#dce4ec;color:#111}:root[data-race-theme="active"] .computer-item:hover{background:#ffe5cc}:root[data-race-theme="active"] .computer-menu button:hover{background:#ff8000;color:#111}
 @media(max-width:540px){.computer-layout{grid-template-columns:145px minmax(0,1fr)}.computer-sidebar{padding:8px}.computer-main{padding:12px 10px}.computer-items{grid-template-columns:minmax(0,1fr)}.computer-item{gap:6px;padding:6px}.computer-item img{width:36px;height:36px}.computer-user{flex-wrap:wrap}.computer-chrome .window-toolbar{overflow-x:auto}}
 </style><div class="computer-layout"><aside class="computer-sidebar">${card('System Info',['about','contact','resume'].map(id=>button(id)).join(''))}${card('Other Places',['desktop','gallery','achievements','credits','nas'].map(id=>button(id)).join(''))}${card('Details','<strong>My Computer</strong><br><span>System Folder</span>')}</aside><article class="computer-main"><section><h2>Files Stored on This Computer</h2><div class="computer-items">${button('achievements',true)}${button('gallery',true)}</div></section><section><h2>Hard Disk Drives</h2><div class="computer-items">${button('nas',true)}</div></section></article></div>`;

 const sourceStyle=root.querySelector('style');if(!document.querySelector('[data-computer-styles]')){sourceStyle.dataset.computerStyles='';document.head.append(sourceStyle);}else sourceStyle.remove();
 const activate=event=>{const target=event.target.closest('[data-computer-open]');if(!target)return;if(target.classList.contains('computer-item')&&event.type==='click'&&event.detail>0&&event.pointerType!=='touch'&&event.pointerType!=='pen'&&!matchMedia('(pointer: coarse)').matches){root.querySelectorAll('.computer-item').forEach(item=>{item.classList.toggle('computer-selected',item===target);item.setAttribute('aria-pressed',String(item===target));});return;}event.stopPropagation();chrome.querySelectorAll('details').forEach(d=>d.open=false);if(target.dataset.computerOpen==='desktop')showDesktop();else navigate(target.dataset.computerOpen);};
 const events=new AbortController();
 root.addEventListener('click',activate,{signal:events.signal});root.addEventListener('dblclick',activate,{signal:events.signal});chrome.addEventListener('click',activate);
 chrome.querySelector('[data-computer-close]').onclick=context.close;
 chrome.querySelector('[data-computer-maximize]').onclick=()=>{chrome.querySelectorAll('details').forEach(d=>d.open=false);shell.querySelector('[data-action="maximize"]').click();};
 root.querySelectorAll('.explorer-card h3 button').forEach(b=>b.onclick=()=>{const collapsed=b.closest('.explorer-card').classList.toggle('collapsed');b.setAttribute('aria-expanded',String(!collapsed));});
 document.addEventListener('pointerdown',event=>{chrome.querySelectorAll('details[open]').forEach(d=>{if(!d.contains(event.target))d.open=false;});},{signal:events.signal});
 chrome.addEventListener('keydown',event=>{if(event.key==='Escape')chrome.querySelectorAll('details[open]').forEach(d=>{d.open=false;d.querySelector('summary').focus();});});
 const homeHTML=root.innerHTML,homeClass=root.className;
 let childDispose=null,view='computer';
 const clearChrome=()=>{delete root.dataset.personalPictures;shell.querySelectorAll(':scope > .window-menubar,:scope > .window-toolbar,:scope > .addressbar,:scope > .computer-chrome,:scope > .connected-toolbar').forEach(n=>n.remove());};
 function restoreHome(){childDispose?.();childDispose=null;clearChrome();shell.insertBefore(chrome,root);root.className=homeClass;root.style.cssText='';root.innerHTML=homeHTML;view='computer';root.querySelectorAll('.explorer-card h3 button').forEach(b=>b.onclick=()=>{const collapsed=b.closest('.explorer-card').classList.toggle('collapsed');b.setAttribute('aria-expanded',String(!collapsed));});setExplorerPath(shell,[['Computer','computer']]);}
 async function navigate(id,section){
  if(id==='computer'){restoreHome();return;}
  if(id==='desktop'){showDesktop();return;}
  if(['about','contact','resume','credits','messenger','nas'].includes(id)){context.open(id);return;}
  if(!['achievements','gallery'].includes(id))return;
  if(view===id){if(section)shell.dispatchEvent(new CustomEvent(id==='gallery'?'gallery:navigate':'certificates:navigate',{detail:section}));return;}
  childDispose?.();childDispose=null;clearChrome();root.style.cssText='';
  if(['achievements','gallery'].includes(id)){const toolbar=document.createElement('nav');toolbar.className='window-toolbar connected-toolbar';shell.insertBefore(toolbar,root);}
  else shell.insertBefore(chrome,root);
  view=id;
  const {renderProgram}=await import('./programs.js');if(view!==id)return;
  childDispose=renderProgram(id,root,{...context,open:navigate});
  if(section)shell.dispatchEvent(new CustomEvent(id==='gallery'?'gallery:navigate':'certificates:navigate',{detail:section}));
 }
 function showDesktop(){
  restoreHome();view='desktop';
  root.querySelector('.computer-main').innerHTML='<section><h2>Desktop</h2><div class="computer-items">'+['about','resume','contact','achievements','gallery'].map(id=>button(id,true)).join('')+'</div></section>';
  setExplorerPath(shell,[['Computer','computer'],['Desktop','desktop']]);
 }
 const history=[];let historyIndex=-1,replaying=false,pendingLocation=null,locationQueued=false;
 function syncNavigation(){
  const buttons=[...shell.querySelectorAll('.window-toolbar button')].filter(b=>b.querySelector('.nav-circle'));
  if(buttons.length<2)return;
  buttons[0].disabled=historyIndex<=0;buttons[1].disabled=historyIndex>=history.length-1;
  buttons[0].onclick=()=>goHistory(-1);buttons[1].onclick=()=>goHistory(1);
 }
 async function goHistory(delta){
  const next=historyIndex+delta;if(next<0||next>=history.length)return;
  historyIndex=next;replaying=true;const parts=history[next],last=parts.at(-1);
  try{await navigate(last[1],last[2]);}finally{replaying=false;syncNavigation();}
 }
 shell.addEventListener('explorer:location',event=>{
  pendingLocation=event.detail;if(locationQueued)return;locationQueued=true;
  queueMicrotask(()=>{locationQueued=false;const parts=pendingLocation;
   if(!replaying&&JSON.stringify(history[historyIndex])!==JSON.stringify(parts)){history.splice(historyIndex+1);history.push(parts);historyIndex=history.length-1;}
   syncNavigation();
  });
 },{signal:events.signal});
 shell.explorerNavigate=navigate;
 root.addEventListener('click',event=>{const target=event.target.closest('[data-open]');if(target){event.preventDefault();event.stopPropagation();navigate(target.dataset.open);}},{capture:true,signal:events.signal});
 setExplorerPath(shell,[['Computer','computer']]);
 refreshWindowIcons(shell);
 return ()=>{childDispose?.();events.abort();delete shell.explorerNavigate;};
}


