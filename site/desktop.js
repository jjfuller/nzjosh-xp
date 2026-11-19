import {iconLayout} from './desktop-icon-layout.js';
import './picture-protection.js';
import {softwareLogo} from './software-logos.js';
import {notifications} from './joshbot-notifications.js';
import {EDITOR_MODE} from './mode.js';
import {profile,loadProfile,saveProfile,escapeHTML as esc,safeURL} from './profile.js';
import {catalog,renderProgram,softwareIcon} from './programs.js';

const $=selector=>document.querySelector(selector);
const running=new Map();let layer=20,active='',volume=.6,mute=false;
const icon=id=>id==='messenger'&&profile.botAvatar?profile.botAvatar:`assets/${catalog[id]?.icon||catalog.about.icon}`;
const desktop=$('#desktop'),windows=$('#windows'),startMenu=$('#start-menu');
document.addEventListener('error',event=>{const image=event.target;if(image instanceof HTMLImageElement&&!image.dataset.fallbackApplied){image.dataset.fallbackApplied='true';image.src='assets/user.png';}},true);
function applyProfile(){
  document.title=document.querySelector('meta[name="site-page-title"]')?.content||profile.desktopTitle;
  document.querySelectorAll('[data-name]').forEach(el=>el.textContent=profile.name||'Your name');
  document.querySelectorAll('[data-headline]').forEach(el=>el.textContent=profile.headline);
  document.querySelectorAll('[data-brand]').forEach(el=>{if(el.tagName==='STRONG')el.innerHTML=esc(profile.desktopTitle.replace(/\s*XP$/i,''))+'<span>xp</span>';else el.textContent=profile.desktopTitle;});
  document.querySelectorAll('.avatar').forEach(el=>el.src=profile.avatar||'assets/user.png');
  desktop.style.backgroundImage=`url(${JSON.stringify(profile.wallpaper||'assets/bliss.jpg')})`;
  document.body.classList.toggle('crt-off',!profile.crt);
  const botTray=$('#messenger-tray img');if(botTray)botTray.src=profile.botAvatar||'assets/user.png';
  const crtButton=$('#crt-quick');if(crtButton){crtButton.setAttribute('aria-pressed',String(profile.crt));crtButton.textContent=profile.crt?'CRT On':'CRT Off';crtButton.title='Toggle CRT screen effect';}
  renderStart();
}
function closeMenus(){startMenu.classList.add('hidden');startMenu.querySelector('.all-programs')?.classList.remove('expanded');startMenu.querySelector('[data-all-programs]')?.setAttribute('aria-expanded','false');$('#context-menu').classList.add('hidden');$('#start-button').classList.remove('open');$('#start-button').setAttribute('aria-expanded','false');}
function taskbar(){
  $('#task-buttons').innerHTML=[...running].map(([id,app])=>`<button class="task-button ${active===id&&!app.minimized?'active':''}" data-task="${id}" title="${esc(app.title)}"><img src="${app.icon||icon(id)}" alt=""><span>${esc(app.title)}</span></button>`).join('');
}
function focus(id){
  const app=running.get(id);if(!app)return;
  active=id;app.minimized=false;app.el.dataset.minimized='false';app.el.style.zIndex=++layer;
  for(const [key,item]of running)item.el.classList.toggle('inactive',key!==id);
  taskbar();
}
function minimize(id){const app=running.get(id);if(!app)return;app.minimized=true;app.el.dataset.minimized='true';if(active===id){active='';const next=[...running].filter(([key,item])=>key!==id&&!item.minimized).sort((a,b)=>+b[1].el.style.zIndex-+a[1].el.style.zIndex)[0];if(next)focus(next[0]);}taskbar();}
function maximize(id){const app=running.get(id);if(!app)return;const el=app.el;if(!app.maximized){app.restore={left:el.style.left,top:el.style.top,width:el.style.width,height:el.style.height};Object.assign(el.style,{left:'0px',top:'0px',width:'100%',height:'100%'});}else Object.assign(el.style,app.restore);app.maximized=!app.maximized;el.classList.toggle('maximized',app.maximized);focus(id);el.dispatchEvent(new Event('windowresize'));}
function close(id){const app=running.get(id);if(!app)return;app.dispose?.();app.el.remove();running.delete(id);if(active===id){active='';const next=[...running].filter(([,item])=>!item.minimized).pop();if(next)focus(next[0]);}taskbar();}
const connectedNavigation=()=>['about','resume','gallery','achievements'].map(id=>`<button data-open="${id}"><img src="${icon(id)}" alt="">${esc(catalog[id].title)}</button>`).join('');
const toolbar=id=>{
  const projects=id==='projects',about=id==='about',resume=id==='resume';
  if(['achievements','gallery'].includes(id))return `<nav class="window-toolbar connected-toolbar" aria-label="Website navigation">${connectedNavigation()}</nav>`;
  if(!['about','projects','resume','contact','gallery3d'].includes(id))return '';
  return `<div class="window-menubar"><button data-menu="file">File</button><button data-menu="view">View</button>${projects?'<button disabled>Tools</button>':''}<button data-open="credits">Help</button><span class="window-flag"><img src="assets/windows-logo.svg" alt="Windows"></span></div>${id==='contact'?'':`<div class="window-toolbar">${projects?'<button disabled><span style="font-size:25px">⌂</span>Home</button>':''}<button data-history="back" disabled><span class="nav-circle">➜</span>Back</button><button disabled><span class="nav-circle">➜</span>Forward</button><i class="toolbar-separator"></i>${about||resume?connectedNavigation():projects?'<button disabled><span style="color:#e9be35;font-size:29px">★</span>Favorites</button><i class="toolbar-separator"></i><button data-project-theme>🌗 Light/Dark</button>':'<button data-open="about"><img src="'+icon('about')+'" alt="">About Me</button>'}</div><div class="addressbar"><span>Address</span><div class="address-input"><img src="${icon(id)}" alt=""><span>${projects?'https://www.myprojects.com':esc(catalog[id].title)}</span><span>⌄</span></div><span class="address-go"><b>➜</b>Go</span></div>`}`;
};
export async function openApp(id){
  if(id==='gallery3d')id='gallery';
  // Folders always navigate inside the single My Computer window.
  // Desktop shortcuts, toolbars, Start and Josh Bot all enter through here.
  if(['achievements','gallery'].includes(id)){
    await openApp('computer');
    const explorer=running.get('computer');
    if(explorer?.el.explorerNavigate){
      await explorer.el.explorerNavigate(id,'home');
      focus('computer');
    }
    return;
  }
  if(id==='messenger')document.dispatchEvent(new Event('joshbot:activity'));
  if(id==='nas'){info('Link not configured','Configure your own NAS link in a private copy.');return;}

  if(id==='projects')return;
  if(id==='profile'&&!EDITOR_MODE)return;
  closeMenus();$('#toast').classList.add('hidden');
  if(id.startsWith('social:')){const key=id.split(':')[1],url=safeURL(profile.socials[key]);if(url)confirmExternal(url);else info('Link not configured',EDITOR_MODE?'Add your '+key+' link in My Profile.':'This link is not available yet.');return;}
  if(!catalog[id])return;
  if(running.has(id)){focus(id);return;}
  const spec=catalog[id];const width=Math.min(spec.width||650,innerWidth-(innerWidth<700?10:174));
  const height=Math.min(spec.height||550,innerHeight-40);const offset=(running.size%4)*20;
  const x=innerWidth<700?5:Math.min(154+offset,innerWidth-width-5),y=innerWidth<700?4:Math.min((id==='projects'?0:29)+offset,innerHeight-height-32);
  const el=document.createElement('section');el.className='app-window';el.dataset.app=id;el.setAttribute('aria-label',spec.title);el.setAttribute('role','dialog');Object.assign(el.style,{width:width+'px',height:height+'px',left:x+'px',top:Math.max(0,y)+'px'});
  el.innerHTML=`<header class="window-titlebar"><img src="${icon(id)}" alt=""><strong>${esc(spec.title)}</strong><div class="window-controls"><button aria-label="Minimize ${esc(spec.title)}" title="Minimize" data-action="minimize"></button><button aria-label="Maximize ${esc(spec.title)}" title="Maximize" data-action="maximize"></button><button aria-label="Close ${esc(spec.title)}" title="Close" data-action="close"></button></div></header>${toolbar(id)}<div class="window-content"></div>${spec.status===false?'':'<div class="statusbar">'+(id==='projects'?'Done':'Ready')+'</div>'}<div class="resize-handle" aria-hidden="true"></div>`;
  const app={el,title:spec.title,minimized:false,maximized:false};running.set(id,app);windows.append(el);focus(id);
  if(id==='computer'){
    const folderIcons={computer:'xp-icons/computer.png',desktop:'xp-icons/computer.png',achievements:'xp-icons/certificates.png',gallery:'xp-icons/pictures.png'};
    el.addEventListener('explorer:location',event=>{
      const location=Array.isArray(event.detail)?event.detail.at(-1):null;
      if(!location||!folderIcons[location[1]])return;
      app.title=location[1]==='computer'?'My Computer':String(location[0]);
      app.icon=folderIcons[location[1]];
      el.setAttribute('aria-label',app.title);
      el.querySelector('.window-titlebar strong').textContent=app.title;
      el.querySelector('.window-titlebar > img').src=app.icon;
      for(const [action,label]of Object.entries({minimize:'Minimize',maximize:'Maximize',close:'Close'})){
        const control=el.querySelector('[data-action="'+action+'"]');
        control.setAttribute('aria-label',label+' '+app.title);control.title=label;
      }
      taskbar();
    });
  }
  const content=el.querySelector('.window-content');
  if(id==='profile'){content.textContent='The private profile editor is not included in this public template.';}else if(id==='web'){content.innerHTML='<div class="in-site-browser"><form class="web-address"><label>Address <input aria-label="Web address" spellcheck="false" autocomplete="off"></label><button type="submit">Go</button></form><div class="web-status" role="status">Loading page…</div><div class="web-blocked hidden"><h2>This website blocks embedded pages</h2><p>You can copy the address above or open the live website in another tab. NZJOSH stays open here.</p></div><iframe title="Web page" referrerpolicy="no-referrer"></iframe><img class="web-image hidden" alt="Document preview"><p class="web-hint">If the page does not appear, <button type="button" data-live-site>open the live website in a new tab</button>.</p></div>';content.querySelector('[data-live-site]').onclick=()=>{const current=content.dataset.currentUrl;if(current)window.open(current,'_blank','noopener,noreferrer');};content.querySelector('.web-address').onsubmit=event=>{event.preventDefault();const field=event.currentTarget.querySelector('input');let url;try{url=new URL(field.value,location.href);}catch{content.querySelector('.web-status').textContent='Enter a valid nzjosh.com address.';return;}if(url.origin!==location.origin){content.querySelector('.web-status').textContent='Address navigation is limited to nzjosh.com links.';return;}loadWeb(url.href);};}else app.dispose=renderProgram(id,content,{open:openApp,close:()=>close(id),notify:info,icon,window:el});
  el.addEventListener('pointerdown',()=>{if(active!==id)focus(id);});
  el.querySelectorAll('[data-action]').forEach(button=>button.onclick=()=>({close,minimize,maximize}[button.dataset.action])(id));
  const titlebar=el.querySelector('.window-titlebar');titlebar.ondblclick=event=>{if(!event.target.closest('button'))maximize(id);};
  titlebar.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.target.closest('button')||app.maximized)return;
    event.preventDefault();titlebar.setPointerCapture(event.pointerId);
    const original={x:event.clientX,y:event.clientY,left:parseFloat(el.style.left),top:parseFloat(el.style.top)};
    titlebar.onpointermove=move=>{el.style.left=Math.max(0,Math.min(innerWidth-100,original.left+move.clientX-original.x))+'px';el.style.top=Math.max(0,Math.min(innerHeight-62,original.top+move.clientY-original.y))+'px';};
    titlebar.onpointerup=()=>{titlebar.onpointermove=null;};
  });
  const resize=el.querySelector('.resize-handle');resize.onpointerdown=event=>{
    if(app.maximized)return;event.preventDefault();resize.setPointerCapture(event.pointerId);const start={x:event.clientX,y:event.clientY,w:el.offsetWidth,h:el.offsetHeight};
    resize.onpointermove=move=>{el.style.width=Math.max(250,Math.min(innerWidth-el.offsetLeft,start.w+move.clientX-start.x))+'px';el.style.height=Math.max(160,Math.min(innerHeight-30-el.offsetTop,start.h+move.clientY-start.y))+'px';el.dispatchEvent(new Event('windowresize'));};resize.onpointerup=()=>resize.onpointermove=null;
  };
}
function loadWeb(url){const app=running.get('web');if(!app)return;const parsed=new URL(url,location.href),field=app.el.querySelector('.web-address input'),frame=app.el.querySelector('iframe'),preview=app.el.querySelector('.web-image');field.value=parsed.href;const blocked=/(^|\.)(linkedin\.com|letterboxd\.com|steamcommunity\.com)$/.test(parsed.hostname),localImage=parsed.origin===location.origin&&/\.(png|jpe?g|webp)$/i.test(parsed.pathname);app.el.querySelector('.window-content').dataset.currentUrl=parsed.href;app.el.querySelector('.web-blocked').classList.toggle('hidden',!blocked);frame.classList.toggle('hidden',blocked||localImage);preview.classList.toggle('hidden',!localImage);if(localImage){preview.src=parsed.href;frame.removeAttribute('src');}else if(!blocked){frame.src=parsed.href;preview.removeAttribute('src');}else{frame.removeAttribute('src');preview.removeAttribute('src');}app.el.querySelector('.web-status').textContent=blocked?'This site cannot be shown inside NZJOSH.':('Viewing '+parsed.hostname);app.title=parsed.hostname;app.el.querySelector('.window-titlebar strong').textContent=parsed.hostname;taskbar();focus('web');}
async function openWeb(url){const parsed=safeURL(url);if(!parsed)return;await openApp('web');loadWeb(parsed);}
function confirmExternal(value){
  const url=safeURL(value);if(!url)return;
  const parsed=new URL(url,location.href);
  const host=parsed.hostname.replace(/^www\./,'');
  const belongsTo=domain=>host===domain||host.endsWith('.'+domain);
  const service=belongsTo('linkedin.com')?'LinkedIn':belongsTo('letterboxd.com')?'Letterboxd':belongsTo('steamcommunity.com')?'Steam':host;
  const logo=service==='LinkedIn'?'18bb588512d43a49.webp':service==='Letterboxd'?'letterboxd.svg':service==='Steam'?'steam.svg':service==='Fuller NAS'?'nas.svg':'display.svg';
  closeMenus();
  desktop.querySelector('.external-link-shade')?.remove();
  const shade=document.createElement('div');shade.className='modal-shade external-link-shade';
  shade.innerHTML=`<section class="app-window external-link-dialog" role="alertdialog" aria-modal="true" aria-labelledby="external-link-title" aria-describedby="external-link-question"><header class="window-titlebar"><img src="assets/${logo}" alt=""><strong id="external-link-title">Open Link</strong><div class="window-controls"><button type="button" data-action="close" aria-label="Cancel"></button></div></header><div class="external-link-body"><img src="assets/${logo}" alt=""><div><p id="external-link-question">Leave NZJOSH to visit ${esc(service)}?</p><small>${esc(parsed.href)}</small></div></div><footer><button class="xp-button" type="button" data-cancel>Cancel</button><button class="xp-button" type="button" data-visit>Visit ${esc(service)}</button></footer></section>`;
  desktop.append(shade);
  const cancel=()=>shade.remove();
  shade.querySelector('[data-action="close"]').onclick=cancel;
  shade.querySelector('[data-cancel]').onclick=cancel;
  shade.querySelector('[data-visit]').onclick=()=>{cancel();window.open(parsed.href,'_blank','noopener,noreferrer');};
  shade.querySelector('[data-cancel]').focus();
}
document.addEventListener('click',event=>{const anchor=event.target.closest('a[href]');if(!anchor||anchor.hasAttribute('download'))return;let url;try{url=new URL(anchor.href,location.href);}catch{return;}if(!['http:','https:'].includes(url.protocol))return;if(url.origin!==location.origin){event.preventDefault();confirmExternal(url.href);return;}if(/\.(png|jpe?g|webp)$/i.test(url.pathname)){event.preventDefault();openWeb(url.href);}},true);
function info(title,text,autoCloseMs=0){
  closeMenus();const shade=document.createElement('div');shade.className='modal-shade';shade.innerHTML=`<section class="app-window" role="alertdialog" aria-label="${esc(title)}" style="width:340px;position:relative"><header class="window-titlebar"><img src="assets/windows-logo.svg" alt=""><strong>${esc(title)}</strong></header><div style="padding:25px 22px;display:flex;align-items:center;gap:15px"><span style="font:bold 32px Georgia;color:#2367be">ⓘ</span><p style="line-height:18px">${esc(text)}</p></div><footer style="padding:0 15px 15px;text-align:right">${EDITOR_MODE?'<button class="xp-button" data-profile>My Profile</button>':''} ${autoCloseMs?`<span class="auto-close-countdown" data-countdown role="timer">Closing in ${Math.ceil(autoCloseMs/1000)}s</span>`:''}<button class="xp-button" data-ok>OK</button></footer></section>`;
  desktop.append(shade);let timer=null,ticker=null;const dismiss=()=>{clearTimeout(timer);clearInterval(ticker);shade.remove();};if(autoCloseMs){const deadline=Date.now()+autoCloseMs;timer=setTimeout(dismiss,autoCloseMs);ticker=setInterval(()=>{if(!shade.isConnected){dismiss();return;}shade.querySelector('[data-countdown]').textContent='Closing in '+Math.max(1,Math.ceil((deadline-Date.now())/1000))+'s';},100);}shade.querySelector('[data-ok]').onclick=dismiss;const profileButton=shade.querySelector('[data-profile]');if(profileButton)profileButton.onclick=()=>{dismiss();openApp('profile');};shade.querySelector('[data-ok]').focus();
}
function renderStart(){
  const item=(id,label,sub='',extra='')=>`<button class="menu-item ${sub?'primary':''}" data-open="${id}" ${extra}><img src="${icon(id)}" alt=""><span><b>${esc(label||catalog[id]?.title||id)}</b>${sub?'<small>'+esc(sub)+'</small>':''}</span></button>`;
  const social=(id,label,file)=>`<button class="menu-item" data-open="social:${id}"><img src="assets/${file}" alt=""><span><b>${label}</b></span></button>`;
  startMenu.innerHTML=`<header class="start-header"><img class="avatar" src="${esc(profile.avatar||'assets/user.png')}" alt=""><strong>${esc(profile.name||'Your name')}</strong></header><div class="start-columns"><div class="start-left">${item('contact','Contact Me','Send me a message')}<hr>${item('about','About Me')}${item('resume','My Resume')}${item('achievements','Certificates & Awards')}${EDITOR_MODE?item('profile','My Profile'):''}${item('messenger','JoshBot')}<div class="all-programs"><button class="menu-item" data-all-programs aria-expanded="false"><b>All Programs</b><img src="assets/80a19b5338078b84.webp" alt=""></button><div class="programs-submenu">${['paint','minesweeper','calculator','notepad','cmd','media','display','profile','credits'].filter(id=>EDITOR_MODE||id!=='profile').map(id=>item(id)).join('')}</div></div></div><div class="start-right">${social('linkedin','LinkedIn','18bb588512d43a49.webp')}${social('letterboxd','Letterboxd','letterboxd.svg')}${social('steam','Steam','steam.svg')}${item('nas','Fuller NAS')}<button class="menu-item" data-recent><img src="assets/1ff3255c020ebdc7.webp" alt=""><span><b>Recently Used</b></span><span class="arrow">►</span></button><hr>${item('media','Media Player')}${item('gallery','Image Viewer')}${item('notepad','Notepad')}${item('cmd','Command Prompt')}</div></div><footer class="start-footer"><button data-logoff><img src="assets/9b6fb4e8dc21d9b7.webp" alt="">Log Off</button><button data-shutdown><img src="assets/79e9cd623e255141.webp" alt="">Shut Down</button></footer>`;
  startMenu.querySelector('[data-all-programs]').onclick=event=>{event.stopPropagation();const group=startMenu.querySelector('.all-programs');group.classList.toggle('expanded');event.currentTarget.setAttribute('aria-expanded',group.classList.contains('expanded'));};
  startMenu.querySelector('[data-logoff]').onclick=()=>shutdownDialog(true);
  startMenu.querySelector('[data-shutdown]').onclick=()=>shutdownDialog(false);
  startMenu.querySelector('[data-recent]').onclick=()=>{const software=[...new Set([...profile.software,'Claude','ChatGPT'])];contextMenu(Math.min(330,innerWidth-260),Math.max(10,innerHeight-480),software.map(name=>({label:name,icon:softwareLogo(name),action:()=>info(name,name+' is part of Josh’s software toolkit.',3000)})));};
}
function contextMenu(x,y,items){
  const menu=$('#context-menu');menu.innerHTML=items.map((item,i)=>item===null?'<hr>':`<button data-context="${i}">${item.icon?`<img src="${esc(item.icon)}" alt="">`:``}<span>${esc(item.label)}</span></button>`).join('');menu.classList.remove('hidden');menu.style.left=Math.max(0,Math.min(x,innerWidth-200))+'px';menu.style.top=Math.max(0,Math.min(y,innerHeight-menu.offsetHeight-35))+'px';menu.querySelectorAll('button').forEach(b=>b.onclick=()=>{menu.classList.add('hidden');items[+b.dataset.context].action();});
}
function shutdownDialog(logoff){
  closeMenus();const shade=document.createElement('div');shade.className='modal-shade';shade.innerHTML=`<section class="shutdown-panel" role="dialog" aria-label="${logoff?'Log Off Windows':'Turn off computer'}"><h2>${logoff?'Log Off Windows':'Turn off computer'}</h2><div class="shutdown-choices">${logoff?'<button data-choice="logoff"><img src="assets/9b6fb4e8dc21d9b7.webp" alt="">Log Off</button>':'<button data-choice="off"><img src="assets/79e9cd623e255141.webp" alt="">Turn Off</button><button data-choice="restart"><img src="assets/9b6fb4e8dc21d9b7.webp" alt="">Restart</button>'}</div><footer><button class="xp-button" data-choice="cancel">Cancel</button></footer></section>`;desktop.append(shade);
  shade.onclick=async event=>{const choice=event.target.closest('[data-choice]')?.dataset.choice;if(!choice)return;shade.remove();if(choice==='cancel')return;const logoffSound=playSystemSound('logoff');botNotifications.stop();for(const id of [...running.keys()])close(id);sessionStorage.removeItem('nzjosh.logged-in');desktop.classList.add('hidden');if(choice==='off'){const boot=$('#boot-screen');boot.classList.remove('hidden');boot.innerHTML='<p style="color:#e8a44b;font:24px Arial">It is now safe to close this tab.</p><button class="xp-button" id="power-on">Restart desktop</button>';$('#power-on').onclick=()=>location.reload();}else if(choice==='restart'){$('#boot-screen').classList.remove('hidden');await logoffSound;location.reload();}else $('#login-screen').classList.remove('hidden');};
}
// Supplied XP audio plays only from user-initiated login/logoff controls.
// Add licensed audio privately, then enable this setting. See sounds/README.md.
const SYSTEM_AUDIO_ENABLED=false;
let stopSystemSound=()=>{};
function playSystemSound(kind){
  if(!SYSTEM_AUDIO_ENABLED)return Promise.resolve();
  stopSystemSound();
  if(mute||volume<=0||(kind==='login'&&!profile.startupSound))return Promise.resolve();
  const audio=document.createElement('audio');
  audio.src=kind==='login'?'/sounds/xp-login.mp3':'/sounds/xp-logoff.mp3';
  audio.preload='auto';audio.hidden=true;audio.volume=volume;audio.muted=mute;
  audio.dataset.systemSound=kind;
  document.body.append(audio);
  return new Promise(resolve=>{
    let finished=false;
    const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);audio.pause();audio.remove();if(stopSystemSound===finish)stopSystemSound=()=>{};resolve();};
    const timer=setTimeout(finish,12000);
    stopSystemSound=finish;
    audio.addEventListener('ended',finish,{once:true});
    audio.addEventListener('error',finish,{once:true});
    try{audio.play().catch(finish);}catch{finish();}
  });
}
function startupTone(){void playSystemSound('login');}
// Public profile links open only these destinations, after normal desktop login.
function openRequestedApp(){
  const id={'#open=resume':'resume','#open=achievements':'achievements','#open=contact':'contact'}[location.hash];
  if(!id||desktop.classList.contains('hidden'))return false;
  history.replaceState(history.state,'',location.pathname+location.search);
  void openApp(id);
  return true;
}
window.addEventListener('hashchange',openRequestedApp);
function login(){
  botNotifications.start();
  $('#login-screen').classList.add('hidden');$('#boot-screen').classList.add('hidden');desktop.classList.remove('hidden');placeIcons();sessionStorage.setItem('nzjosh.logged-in','true');startupTone();
  if(!openRequestedApp()&&!sessionStorage.getItem('nzjosh.welcomed')){sessionStorage.setItem('nzjosh.welcomed','true');setTimeout(()=>{if(!desktop.classList.contains('hidden')&&!running.size)openApp('messenger');},1400);}
}
function showLogin(){ if(!desktop.classList.contains('hidden'))return;$('#boot-screen').classList.add('hidden');$('#login-screen').classList.remove('hidden');$('#login-button').focus(); }
function clock(){const date=new Date();$('#clock').textContent=date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});$('#clock').title=date.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});}
document.addEventListener('click',event=>{
  const opener=event.target.closest('[data-open]');if(opener){event.preventDefault();openApp(opener.dataset.open);}
  if(!event.target.closest('#start-menu,#start-button,#context-menu'))closeMenus();
  if(!event.target.closest('#volume-popup,#volume-button'))$('#volume-popup').classList.add('hidden');
  if(!event.target.closest('#hidden-tray,#tray-chevron'))$('#hidden-tray').classList.add('hidden');
  if(event.target.closest('[data-project-theme]'))event.target.closest('.app-window').querySelector('.project-browser')?.classList.toggle('light');
  const menu=event.target.closest('[data-menu]');if(menu){const box=menu.getBoundingClientRect();contextMenu(box.left,box.bottom,menu.dataset.menu==='file'?[...(EDITOR_MODE?[{label:'My Profile…',action:()=>openApp('profile')}]:[]),{label:'Close',action:()=>close(active)}]:[{label:'CRT effect',action:()=>saveProfile({...profile,crt:!profile.crt})},{label:'Display Properties…',action:()=>openApp('display')}]);}
});
$('#start-button').onclick=event=>{event.stopPropagation();const open=startMenu.classList.contains('hidden');closeMenus();if(open){startMenu.classList.remove('hidden');$('#start-button').classList.add('open');$('#start-button').setAttribute('aria-expanded','true');}};
$('#task-buttons').onclick=event=>{const button=event.target.closest('[data-task]');if(!button)return;const id=button.dataset.task;if(active===id&&!running.get(id).minimized)minimize(id);else focus(id);};
desktop.addEventListener('contextmenu',event=>{if(event.target.closest('.app-window'))return;event.preventDefault();closeMenus();contextMenu(event.clientX,event.clientY,[{label:'Refresh',action:()=>applyProfile()},null,...(EDITOR_MODE?[{label:'My Profile…',action:()=>openApp('profile')}]:[]),{label:'Display Properties…',action:()=>openApp('display')},{label:'About this desktop',action:()=>openApp('credits')}]);});
$('#crt-quick').onclick=()=>saveProfile({...profile,crt:!profile.crt});
$('#volume-button').onclick=()=>$('#volume-popup').classList.toggle('hidden');$('#tray-chevron').onclick=()=>$('#hidden-tray').classList.toggle('hidden');$('#volume-range').oninput=event=>{volume=event.target.value/100;document.querySelectorAll('audio,video').forEach(el=>el.volume=volume);};$('#mute-audio').onchange=event=>{mute=event.target.checked;document.querySelectorAll('audio,video').forEach(el=>el.muted=mute);};$('#login-button').onclick=login;$('#login-restart').onclick=()=>location.reload();$('#skip-boot').onclick=showLogin;
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenus();desktop.querySelector('.modal-shade')?.remove();}if(event.altKey&&event.key==='F4'){event.preventDefault();close(active);}});
window.addEventListener('resize',()=>{for(const app of running.values())if(!app.maximized){const el=app.el;if(el.offsetWidth>innerWidth-10)el.style.width=innerWidth-10+'px';el.style.left=Math.max(0,Math.min(el.offsetLeft,innerWidth-el.offsetWidth))+'px';el.style.top=Math.max(0,Math.min(el.offsetTop,innerHeight-80))+'px';}});
const contentSignature=value=>JSON.stringify({...value,crt:undefined,startupSound:undefined,wallpaper:undefined});
let renderedContent='';
window.addEventListener('profilechange',()=>{const next=contentSignature(profile),unchanged=next===renderedContent;renderedContent=next;applyProfile();if(unchanged)return;for(const [id,app]of running){if(['profile','notepad','paint','media','cmd','minesweeper','calculator'].includes(id))continue;app.dispose?.();app.dispose=renderProgram(id,app.el.querySelector('.window-content'),{open:openApp,close:()=>close(id),notify:info,icon,window:app.el});}});
await loadProfile();renderedContent=contentSignature(profile);applyProfile();
const desktopIds=['about','resume','contact','achievements','gallery'];
let iconPositions={};try{iconPositions=JSON.parse(localStorage.getItem('nzjosh.desktop-icons.v1')||'{}');}catch{}
function placeIcons(){
  const elements=[...$('#desktop-icons').querySelectorAll('[data-desktop]')];
  const rect=desktop.getBoundingClientRect(),bar=$('.taskbar').getBoundingClientRect();
  const positions=iconLayout(elements.map(el=>el.dataset.desktop),iconPositions,{width:rect.width||innerWidth,height:rect.height?bar.top-rect.top:innerHeight-30,narrow:innerWidth<=700});
  for(const el of elements){const p=positions.get(el.dataset.desktop);el.style.left=p.x+'px';el.style.top=p.y+'px';}
}
document.addEventListener('desktop:icons-changed',placeIcons);
$('#desktop-icons').innerHTML=desktopIds.map(id=>`<button class="desktop-icon" aria-label="Open ${esc(catalog[id].title)}" data-desktop="${id}"><img src="${icon(id)}" alt=""><span>${esc(id==='gallery'?'Pictures':catalog[id].title)}</span></button>`).join('');
placeIcons();addEventListener('resize',placeIcons);
const {desktopSelection}=await import('./desktop-selection.js');
const selection=desktopSelection({desktop,icons:$('#desktop-icons'),open:openApp,menuOpen:()=>!startMenu.classList.contains('hidden'),closeMenu:closeMenus,save:elements=>{elements.forEach(el=>iconPositions[el.dataset.desktop]={x:parseFloat(el.style.left),y:parseFloat(el.style.top)});try{localStorage.setItem('nzjosh.desktop-icons.v1',JSON.stringify(iconPositions));}catch{}}});
if(matchMedia('(pointer: coarse)').matches)$('#desktop-icons').addEventListener('click',event=>{const target=event.target.closest('[data-desktop]');if(target&&selection.canOpen())openApp(target.dataset.desktop);});
const botNotifications=notifications({desktop,open:openApp,avatar:()=>profile.botAvatar||'assets/user.png',state:()=>({chatOpen:running.has('messenger')&&!running.get('messenger').minimized,gameFocused:['minesweeper'].includes(active),dialogOpen:!!desktop.querySelector('.modal-shade'),resumeOpen:running.has('resume'),certificatesOpen:running.has('achievements'),photosOpen:running.has('gallery')}),ding:()=>{if(mute)return;try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(880,a.currentTime);o.frequency.exponentialRampToValueAtTime(660,a.currentTime+.2);g.gain.setValueAtTime(volume*.035,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.4);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.4);setTimeout(()=>a.close(),500);}catch{}}});
clock();setInterval(clock,1000);
// Login belongs to this document only: a refresh always starts logged out.
sessionStorage.removeItem('nzjosh.logged-in');
setTimeout(showLogin,2000);
if(EDITOR_MODE&&new URLSearchParams(location.search).has('edit')){login();openApp('profile');}

