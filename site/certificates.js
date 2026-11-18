// Public template: add only your own approved certificate data.
const recentCertificates=[];
const honors=[];
const fema=[];
const courses=[];
const linkedin="";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function achievements(root){
 const shell=root.closest('.app-window');
 const oldToolbar=shell?.querySelector('.connected-toolbar');
 if(oldToolbar){
 const nav=[['about','About Me','xp-icons/about.webp'],['resume','My Resume','xp-icons/resume.webp'],['gallery','Image Viewer','xp-icons/pictures.webp'],['achievements','Certificates & Awards','xp-icons/folder.webp']].map(([id,name,icon])=>'<button data-cert-open="'+id+'"><img src="'+icon+'" alt="">'+name+'</button>').join('');
 oldToolbar.outerHTML='<div class="window-menubar"><button data-cert-menu="file">File</button><button data-cert-menu="view">View</button><button data-cert-open="credits">Help</button><span class="window-flag"><img src="assets/windows-logo.svg" alt="Windows"></span></div><div class="window-toolbar"><button data-history="back" disabled><span class="nav-circle">➜</span>Back</button><button disabled><span class="nav-circle">➜</span>Forward</button><i class="toolbar-separator"></i>'+nav+'</div><div class="addressbar"><span>Address</span><div class="address-input"><img src="xp-icons/folder.webp" alt=""><span>Certificates & Awards</span><span>⌄</span></div><span class="address-go"><b>➜</b>Go</span></div>';
 shell.querySelectorAll('[data-cert-open]').forEach(button=>button.onclick=()=>import('./desktop.js').then(m=>m.openApp(button.dataset.certOpen)));
 shell.querySelector('[data-cert-menu="file"]').onclick=()=>shell.querySelector('[data-action="close"]').click();
 shell.querySelector('[data-cert-menu="view"]').onclick=()=>shell.querySelector('[data-action="maximize"]').click();
 }

 let section='home'; const labels={home:'Certificates & Awards',linkedin:'LinkedIn Certificates/Credentials',fema:'FEMA Certs',google:'Google Certs',certificates:'View All',awards:'Awards & Medals',courses:'Courses'};
 function draw(){
  const link=(url,label)=>`<a style="color:#0645ad" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
  root.innerHTML=`<div class="achievement-explorer">${section==='home'?`<h1>Certificates, Awards & Courses</h1><div class="achievement-folders">${[['linkedin','LinkedIn Certificates/Credentials'],['fema','FEMA Certs'],['google','Google Certs'],['certificates','View All'],['awards','Awards & Medals'],['courses','Courses']].map(([key,name])=>`<button data-section="${key}"><img src="xp-icons/folder.webp" alt=""><span>${name}</span></button>`).join('')}</div>`:['certificates','linkedin','fema','google'].includes(section)?`<h1>${esc(labels[section])}</h1><div class="achievement-list">${recentCertificates.map(cert=>`<article class="achievement-certificate"><a style="color:#0645ad" href="${esc(cert.download)}" target="_blank" rel="noopener noreferrer" aria-label="Open certificate for ${esc(cert.title)}"><img src="${esc(cert.image)}" alt="${esc(cert.issuer)} certificate for ${esc(cert.title)}" loading="lazy"></a><div><h2>${esc(cert.title)}</h2><small>${esc(cert.issuer)} · Issued ${esc(cert.issued)}${cert.credential?` · ${esc(cert.credential)}`:""}</small><p>${esc(cert.description)}</p><p>${link(cert.source,"View original on LinkedIn")} · <a style="color:#0645ad" href="${esc(cert.download)}" download="Joshua-Fuller-${esc(cert.title.replaceAll(/[^a-z0-9]+/gi,"-"))}.${cert.download.endsWith(".pdf")?"pdf":"webp"}">Download certificate ↓</a></p></div></article>`).join('')}${fema.map(cert=>`<article class="achievement-certificate"><a style="color:#0645ad" href="${esc(cert.image)}" target="_blank" rel="noopener"><img src="${esc(cert.image)}" alt="FEMA certificate for ${esc(cert.title)}" loading="lazy"></a><div><h2>${esc(cert.title)}</h2><small>${esc(cert.issuer)} · Issued ${esc(cert.issued)} · ${esc(cert.credential)}</small><p>${esc(cert.description)}</p><p>${link(cert.source,'View original on LinkedIn')} · <a style="color:#0645ad" href="${esc(cert.image)}" download="Joshua-Fuller-FEMA-${esc(cert.credential)}.png">Download certificate ↓</a></p></div></article>`).join('')}</div><div class="achievement-sources">${link('https://www.linkedin.com/','LinkedIn certifications')}${link('https://www.skills.google/','Google Skills profile')}</div>`:section==='awards'?`<h1>Awards & Medals</h1><p>${link('https://www.linkedin.com/','View original awards on LinkedIn')}</p><div class="achievement-list">${honors.map(([name,issuer,date,description])=>`<article><h2>${esc(name)}</h2><small>${esc(issuer)} · ${esc(date)}</small><p>${esc(description)}</p></article>`).join('')}</div>`:`<h1>Courses</h1><p>${link('https://www.linkedin.com/','View original courses on LinkedIn')}</p><div class="achievement-list">${courses.map(name=>`<article><h2>${esc(name)}</h2></article>`).join('')}</div>`}<footer>Public template · Personal certificate and award records are excluded.</footer></div>`;
  const app=root.closest('.app-window');
  const address=app?.querySelector('.address-input > span');if(address)address.textContent='Certificates & Awards'+(section==='home'?'':' \u203a '+labels[section]);
  const back=app?.querySelector('[data-history="back"]');if(back){back.disabled=section==='home';back.onclick=()=>{section='home';draw();};}
  const up=app?.querySelector('[data-cert-home]');if(up)up.onclick=()=>{section='home';draw();};
  root.querySelectorAll('.achievement-certificate').forEach(card=>{const issuer=card.querySelector('small')?.textContent||'';const group=issuer.startsWith('FEMA')?'fema':issuer.startsWith('Google')?'google':'linkedin';if(['linkedin','fema','google'].includes(section)&&group!==section)card.remove();});
  root.querySelector('.achievement-sources')?.remove(); const list=root.querySelector('.achievement-list');if(list&&!list.children.length){const empty=document.createElement('p');empty.textContent='No personal certificates, awards or course records are included in this public template.';list.append(empty);}
  root.insertAdjacentHTML('afterbegin','<style>.program-achievements .achievement-folders{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;padding:12px}.program-achievements .achievement-folders button{min-height:110px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}.program-achievements .achievement-folders img{width:48px;height:48px}.program-achievements .achievement-folders span{white-space:normal;text-align:center}.program-achievements .achievement-folders button:focus-visible{outline:2px solid #235ac5;outline-offset:2px}</style>');
  root.querySelectorAll('[data-section]').forEach(button=>{
    button.setAttribute('aria-pressed','false');
    button.onclick=event=>{if(event.pointerType==='touch'||event.pointerType==='pen'||matchMedia('(pointer: coarse)').matches){enter();return;}root.querySelectorAll('[data-section]').forEach(item=>{item.classList.toggle('selected',item===button);item.setAttribute('aria-pressed',String(item===button));});};
    const enter=()=>{section=button.dataset.section;draw();};
    button.ondblclick=enter;
    button.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();enter();}};
  });
 }
 draw();
}
