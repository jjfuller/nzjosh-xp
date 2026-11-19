import {setExplorerPath} from './explorer-path.js';
import {openDocument} from './document-viewer.js';
import {refreshWindowIcons} from './xp-icon-refresh.js';
const recentCertificates=[];
const linkedin='';
const honors=[];
const fema=[];
const courses=[];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function achievements(root){
 const shell=root.closest('.app-window');
 const oldToolbar=shell?.querySelector('.connected-toolbar');
 if(oldToolbar){
 const nav=[['about','About Me','xp-icons/about.png'],['resume','My Resume','xp-icons/resume.webp'],['gallery','Pictures','xp-icons/pictures.png'],['achievements','Certificates & Awards','xp-icons/certificates.png']].map(([id,name,icon])=>'<button data-cert-open="'+id+'"><img src="'+icon+'" alt="">'+name+'</button>').join('');
 oldToolbar.outerHTML='<div class="window-menubar"><button data-cert-menu="file">File</button><button data-cert-menu="view">View</button><button data-cert-menu="help">Help</button><span class="window-flag"><img src="assets/windows-logo.svg" alt="Windows"></span></div><div class="window-toolbar"><button data-history="back" disabled><span class="nav-circle">➜</span>Back</button><button disabled><span class="nav-circle">➜</span>Forward</button><i class="toolbar-separator"></i>'+nav+'</div><div class="addressbar"><span>Address</span><div class="address-input"><img src="xp-icons/certificates.png" alt=""><span>Certificates & Awards</span><span>⌄</span></div><span class="address-go"><b>➜</b>Go</span></div>';
 shell.querySelectorAll('[data-cert-open]').forEach(button=>button.onclick=()=>shell.explorerNavigate?shell.explorerNavigate(button.dataset.certOpen):import('./desktop.js').then(m=>m.openApp(button.dataset.certOpen)));

 }

 const menuEvents=new AbortController();
 const bar=shell?.querySelector('.window-menubar');
 let menu=null,menuButton=null;
 function dismissMenu(restoreFocus=false){
  menu?.remove();menu=null;
  menuButton?.setAttribute('aria-expanded','false');
  if(restoreFocus)menuButton?.focus();
  menuButton=null;
 }
 function showMenu(button){
  if(menuButton===button){dismissMenu(true);return;}
  dismissMenu();menuButton=button;button.setAttribute('aria-expanded','true');
  menu=document.createElement('div');menu.className='certificate-menu';menu.setAttribute('role','menu');
  menu.setAttribute('aria-label',button.textContent);
  const actions=button.dataset.certMenu==='file'?[['Close',()=>shell.querySelector('[data-action="close"]').click()]]:
   button.dataset.certMenu==='view'?[['Maximize / Restore',()=>shell.querySelector('[data-action="maximize"]').click()]]:
   [['About this computer',()=>import('./desktop.js').then(m=>m.openApp('credits'))],['Ask JoshBot',()=>import('./desktop.js').then(m=>m.openApp('messenger'))]];
  for(const [label,action] of actions){const item=document.createElement('button');item.type='button';item.setAttribute('role','menuitem');item.textContent=label;item.onclick=()=>{dismissMenu(true);action();};menu.append(item);}
  bar.append(menu);menu.style.left=button.offsetLeft+'px';menu.querySelector('button').focus();
 }
 bar?.querySelectorAll('[data-cert-menu]').forEach(button=>{
  button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');
  button.onclick=()=>showMenu(button);
  button.onkeydown=event=>{if(event.key==='ArrowDown'){event.preventDefault();event.stopPropagation();showMenu(button);}};
 });
 document.addEventListener('pointerdown',event=>{if(menu&&!menu.contains(event.target)&&!menuButton.contains(event.target))dismissMenu();},{signal:menuEvents.signal});
 bar?.addEventListener('keydown',event=>{
  if(!menu)return;
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismissMenu(true);}
  else if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   event.preventDefault();const items=[...menu.querySelectorAll('button')],index=items.indexOf(document.activeElement);
   items[event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length].focus();
  }
 });
 shell.addEventListener('certificates:navigate',event=>{if(Object.hasOwn(labels,event.detail)){section=event.detail;draw();}},{signal:menuEvents.signal});
 let section='home'; const labels={home:'Certificates & Awards',linkedin:'LinkedIn Certificates/Credentials',fema:'FEMA Certs',google:'Google Certs',certificates:'View All',awards:'Awards & Medals',courses:'Courses'};
 function draw(){
  refreshWindowIcons(shell);
  const link=(url,label)=>`<a style="color:#0645ad" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
  root.innerHTML=`<div class="achievement-explorer">${section==='home'?`<h1>Certificates, Awards & Courses</h1><div class="achievement-folders">${[['linkedin','LinkedIn Certificates/Credentials'],['fema','FEMA Certs'],['google','Google Certs'],['certificates','View All'],['awards','Awards & Medals'],['courses','Courses']].map(([key,name])=>`<button data-section="${key}"><img src="xp-icons/certificates.png" alt=""><span>${name}</span></button>`).join('')}</div>`:['certificates','linkedin','fema','google'].includes(section)?`<h1>${esc(labels[section])}</h1><div class="achievement-list">${recentCertificates.map(cert=>`<article class="achievement-certificate"><a style="color:#0645ad" href="${esc(cert.download)}" target="_blank" rel="noopener noreferrer" aria-label="Open certificate for ${esc(cert.title)}"><img src="${esc(cert.image)}" alt="${esc(cert.issuer)} certificate for ${esc(cert.title)}" loading="lazy"></a><div><h2>${esc(cert.title)}</h2><small>${esc(cert.issuer)} · Issued ${esc(cert.issued)}${cert.credential?` · ${esc(cert.credential)}`:""}</small><p>${esc(cert.description)}</p><p>${link(cert.source,"View original on LinkedIn")} · <a style="color:#0645ad" href="${esc(cert.download)}" download="Certificate-${esc(cert.title.replaceAll(/[^a-z0-9]+/gi,"-"))}.${cert.download.endsWith(".pdf")?"pdf":"webp"}">Download certificate ↓</a></p></div></article>`).join('')}${fema.map(cert=>`<article class="achievement-certificate"><a style="color:#0645ad" href="${esc(cert.image)}" target="_blank" rel="noopener"><img src="${esc(cert.image)}" alt="FEMA certificate for ${esc(cert.title)}" loading="lazy"></a><div><h2>${esc(cert.title)}</h2><small>${esc(cert.issuer)} · Issued ${esc(cert.issued)} · ${esc(cert.credential)}</small><p>${esc(cert.description)}</p><p>${link(cert.source,'View original on LinkedIn')} · <a style="color:#0645ad" href="${esc(cert.image)}" download="Certificate-FEMA-${esc(cert.credential)}.png">Download certificate ↓</a></p></div></article>`).join('')}</div><div class="achievement-sources">${link('','LinkedIn certifications')}${link('','Google Skills profile')}</div>`:section==='awards'?`<h1>Awards & Medals</h1><div class="achievement-list">${honors.map(([name,issuer,date,description])=>`<article><h2>${esc(name)}</h2><small>${esc(issuer)} · ${esc(date)}</small><p>${esc(description)}</p></article>`).join('')}</div>`:`<h1>Courses</h1><div class="achievement-list">${courses.map(name=>`<article><h2>${esc(name)}</h2></article>`).join('')}</div>`}<footer>Public template — personal credentials omitted.</footer></div>`;
  if(section!=='home'){const list=root.querySelector('.achievement-list');if(list&&!list.querySelector('article'))list.innerHTML='<p>Personal credentials are omitted from this public template.</p>';}
  const app=root.closest('.app-window');
  const address=app?.querySelector('.address-input > span');if(address)address.textContent='Certificates & Awards'+(section==='home'?'':' \u203a '+labels[section]);
  setExplorerPath(shell,[['Computer','computer'],['Desktop','desktop'],['Certificates & Awards','achievements','home'],...(section==='home'?[]:[[labels[section],'achievements',section]])]);
  root.querySelectorAll('.achievement-certificate').forEach(card=>{const image=card.querySelector('img');if(!image)return;const previewLink=image.closest('a');if(previewLink)previewLink.replaceWith(image);image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label','Open '+card.querySelector('h2').textContent+' in PDF Viewer');const show=event=>{event.preventDefault();event.stopPropagation();openDocument({title:card.querySelector('h2').textContent,src:card.querySelector('a[download]')?.getAttribute('href')||image.getAttribute('src'),path:[['Computer','computer'],['Desktop','desktop'],['Certificates & Awards','achievements','home'],[labels[section],'achievements',section]]});};image.onclick=show;image.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){show(event);}};});
  const back=app?.querySelector('[data-history="back"]');if(back){back.disabled=section==='home';back.onclick=()=>{section='home';draw();};}
  const up=app?.querySelector('[data-cert-home]');if(up)up.onclick=()=>{section='home';draw();};
  root.querySelectorAll('.achievement-certificate').forEach(card=>{const issuer=card.querySelector('small')?.textContent||'';const group=issuer.startsWith('FEMA')?'fema':issuer.startsWith('Google')?'google':'linkedin';if(['linkedin','fema','google'].includes(section)&&group!==section)card.remove();});
  root.querySelector('.achievement-sources')?.remove();
  root.insertAdjacentHTML('afterbegin','<style>.achievement-certificate img[role="button"]{cursor:pointer;outline:2px solid transparent;outline-offset:2px}.achievement-certificate img[role="button"]:hover,.achievement-certificate img[role="button"]:focus-visible{outline-color:#245edb}:root[data-race-theme="active"] .achievement-certificate img[role="button"]:hover,:root[data-race-theme="active"] .achievement-certificate img[role="button"]:focus-visible{outline-color:#b45300}.app-window:has(.certificate-menu) .window-menubar{position:relative}.app-window .certificate-menu{position:absolute;top:100%;z-index:20;min-width:180px;padding:3px;background:#ece9d8;color:#111;border:1px solid #777;box-shadow:2px 2px 3px #0004}.app-window .certificate-menu button{display:block;width:100%;padding:6px 18px;text-align:left;color:#111;background:transparent;border:0}.app-window .certificate-menu button:hover,.app-window .certificate-menu button:focus-visible{color:#fff;background:#245edb;outline:none}:root[data-race-theme="active"] .app-window .certificate-menu button:hover,:root[data-race-theme="active"] .app-window .certificate-menu button:focus-visible{background:#ff8000;color:#111}.program-achievements .achievement-certificate>div{min-width:0}.program-achievements .achievement-certificate small{overflow-wrap:anywhere}.program-achievements .achievement-folders{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;padding:12px}.program-achievements .achievement-folders button{min-height:110px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}.program-achievements .achievement-folders img{width:48px;height:48px}.program-achievements .achievement-folders span{white-space:normal;text-align:center}.program-achievements .achievement-folders button:focus-visible{outline:2px solid #235ac5;outline-offset:2px}</style>');
  root.querySelectorAll('[data-section]').forEach(button=>{
    button.setAttribute('aria-pressed','false');
    button.onclick=event=>{if(event.pointerType==='touch'||event.pointerType==='pen'||matchMedia('(pointer: coarse)').matches){enter();return;}root.querySelectorAll('[data-section]').forEach(item=>{item.classList.toggle('selected',item===button);item.setAttribute('aria-pressed',String(item===button));});};
    const enter=()=>{section=button.dataset.section;draw();};
    button.ondblclick=enter;
    button.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();enter();}};
  });
 }
 draw();
 return ()=>{dismissMenu();menuEvents.abort();};
}





