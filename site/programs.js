import './computer-shortcut.js';
import {setExplorerPath} from './explorer-path.js';
import {renderDocument} from './document-viewer.js';
import {computer} from './my-computer.js';
import {refreshWindowIcons} from './xp-icon-refresh.js';
import './desktop-performance.js';
import {renderTiming} from './race-timing.js';
import {handleAppearanceCommand} from './race-theme.js';
import('./start-menu-complete.js').then(module=>module.completeStartMenu()).catch(()=>{});
// Retire legacy CRT controls without changing the desktop bootstrap or layout.
import('./desktop-cleanup.js').then(module=>module.removeCRT()).catch(()=>{});
import {renderLegalNotices} from './legal-notices.js';
import {VERSION,RELEASE_DATE,RELEASE_NOTES,RELEASE_HISTORY} from './version.js';
import {gallery} from './gallery-explorer.js';

import {EDITOR_MODE} from './mode.js';
import {profile,saveProfile,escapeHTML as esc,safeURL,downloadFile} from './profile.js';
import {minesweeper,calculator} from './recreation.js';
import {paint} from './paint-fixed.js';
import {achievements} from './certificates.js';
export const catalog={
  document:{title:'PDF Viewer',icon:'../xp-icons/resume.webp',width:800,height:700},
  computer:{title:'My Computer',icon:'../xp-icons/computer.png',width:760,height:580},
  timing:{title:'Race Timing',icon:'../race-timing-icon.svg',width:760,height:490,status:false},
  about:{title:'About Me',icon:'../xp-icons/about.png',width:805,height:630},
  resume:{title:'My Resume',icon:'../xp-icons/resume.webp',width:800,height:700},
  achievements:{title:'Certificates & Awards',icon:'../xp-icons/certificates.png',width:700,height:560},
  nas:{title:'Fuller NAS',icon:'../xp-icons/nas.webp'},
  web:{title:'Web Browser',icon:'display.svg',width:920,height:650,status:false},
  projects:{title:'My Projects',icon:'74baefe8470766de.webp',width:850,height:770},
  contact:{title:'Contact Me',icon:'../xp-icons/contact.webp',width:545,height:400},
  profile:{title:'My Profile',icon:'user.png',width:680,height:650},
  messenger:{title:'Conversation with JoshBot',icon:'4e5f4a17a66eea46.webp',width:560,height:560,status:false},
  notepad:{title:'Untitled - Notepad',icon:'../xp-icons/notepad.webp',width:600,height:430,status:false},
  cmd:{title:'Command Prompt',icon:'683327ed317d1f06.webp',width:660,height:390,status:false},
  gallery:{title:'Pictures',icon:'../xp-icons/pictures.png',width:820,height:650,status:false},
  paint:{title:'Paint',icon:'../xp-icons/paint.webp',width:790,height:600,status:false},
  minesweeper:{title:'Minesweeper',icon:'minesweeper.svg',width:300,height:390,status:false},
  calculator:{title:'Calculator',icon:'calculator.svg',width:300,height:340,status:false},
  display:{title:'Display Properties',icon:'../xp-icons/display.webp',width:450,height:470,status:false},
  credits:{title:'About this desktop',icon:'../xp-icons/windows-flag.png',width:490,height:420,status:false}
};
const editButton=EDITOR_MODE?'<button class="xp-button small-edit" data-open="profile">Edit my details</button>':'';
const blankLines='<div class="blank-lines"><i></i><i></i><i></i></div>';
const socialIcons={instagram:'3cf598c104a1b617.webp',github:'e3555b8ab0bac10d.webp',linkedin:'18bb588512d43a49.webp',letterboxd:'letterboxd.svg',steam:'steam.svg'};
export const softwareIcon=value=>{const name=value.toLowerCase();return ['salesforce','finale','cin7','talech','quickbooks','shipstation','google','excel','word','powerpoint','outlook','teams','claude','chatgpt'].find(key=>name.includes(key))||'word';};
function about(root){
  const social=Object.entries(profile.socials).filter(([key,value])=>value && !['instagram','github'].includes(key)).map(([key,value])=>value?`<a href="${esc(value)}" target="_blank" rel="noopener noreferrer"><img src="assets/${socialIcons[key]}" alt="">${key[0].toUpperCase()+key.slice(1)}</a>`:`<span class="unavailable"><img src="assets/${socialIcons[key]}" alt="">${key[0].toUpperCase()+key.slice(1)}</span>`).join('');
  const card=(title,body)=>`<section class="explorer-card"><h3>${title}<button aria-label="Toggle ${title}" aria-expanded="true"><span aria-hidden="true" class="card-chevron"></span></button></h3><div class="explorer-card-body">${body}</div></section>`;
  root.innerHTML=`<div class="about-blue"><aside class="explorer-sidebar">${card('Social Links',social)}${card('Skills',profile.skills.length?profile.skills.map(v=>`<span>▧ &nbsp;${esc(v)}</span>`).join(''):blankLines)}${card('Software',profile.software.length?profile.software.map(v=>`<span><img src="assets/software-${softwareIcon(v)}.svg" alt="">${esc(v)}</span>`).join(''):blankLines)}</aside><article class="about-copy"><header><h1>About Me</h1>${editButton}</header><nav class="bio-tabs" role="tablist" aria-label="Biography"><button type="button" role="tab" id="bio-tab-personal" aria-controls="biography-panel" aria-selected="true" data-bio-tab="personal">Personal</button><button type="button" role="tab" id="bio-tab-professional" aria-controls="biography-panel" aria-selected="false" data-bio-tab="professional">Professional</button></nav><div id="biography-panel" role="tabpanel" aria-labelledby="bio-tab-personal" tabindex="0" data-biography></div></article></div>`;
  function showBiography(kind){
    const paragraphs=kind==='personal'?(profile.personalBio.length?profile.personalBio:['']):profile.bio;
    const panel=root.querySelector('[data-biography]');panel.setAttribute('aria-labelledby','bio-tab-'+kind);
    panel.innerHTML=`<h2 class="bio-section-title">${kind==='personal'?'Personal biography':'Professional biography'}</h2>${paragraphs.map((paragraph,i)=>`<section class="bio-paragraph ${i>0?'without-portrait':''}">${i===0?`<div class="portrait-placeholder">${profile.avatar?`<img src="${esc(profile.avatar)}" alt="Your profile picture">`:'<span>♟</span>'}</div>`:''}${paragraph?`<p>${esc(paragraph).replace(/\n/g,'<br>')}</p>`:`<button class="empty-paragraph" data-open="profile" aria-label="${EDITOR_MODE?'Add biography paragraph '+(i+1):'Biography coming soon'}" ${EDITOR_MODE?'':'disabled'}>${EDITOR_MODE?(i===0?'Add your introduction':i===1?'Add your story':'Add more about you'):'Coming soon'}${blankLines}</button>`}</section>`).join('')}`;
    root.querySelectorAll('[data-bio-tab]').forEach(button=>{const selected=button.dataset.bioTab===kind;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
  }
  root.querySelectorAll('[data-bio-tab]').forEach(button=>{button.onclick=()=>showBiography(button.dataset.bioTab);button.onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const kind=event.key==='Home'?'personal':event.key==='End'?'professional':button.dataset.bioTab==='personal'?'professional':'personal';showBiography(kind);root.querySelector('[data-bio-tab="'+kind+'"]').focus();}};});
  showBiography('personal');
  root.querySelectorAll('.explorer-card h3 button').forEach(button=>button.onclick=()=>{const collapsed=button.closest('.explorer-card').classList.toggle('collapsed');button.setAttribute('aria-expanded',String(!collapsed));});
}
function projects(root,context){
  let category='All',search='';
  function paint(){
    const available=profile.projects.filter(p=>p.title);
    const visible=available.filter(p=>(category==='All'||p.category===category)&&(`${p.title} ${p.description}`.toLowerCase().includes(search.toLowerCase())));
    root.innerHTML=`<div class="project-browser"><header class="project-topbar"><strong><span class="projects-mark">♟</span>MyProjects</strong><form><input aria-label="Search My Projects" placeholder="Search" value="${esc(search)}"><button aria-label="Search">⌕</button></form><nav>${['linkedin','instagram','github'].map(key=>`<button title="${key}" data-open="social:${key}"><img src="assets/${socialIcons[key]}" alt="${key}"></button>`).join('')}</nav></header><div class="project-main"><nav class="project-categories">${[['All','⌂'],['App','⠿'],['Client','◎'],['Personal','♧'],['Website','▤']].map(([label,symbol])=>`<button title="${label==='All'?'All projects':label+' projects'}" aria-label="${label} projects" class="${category===label?'active':''}" data-category="${label}">${symbol}</button>`).join('')}</nav><section class="project-grid">${available.length?visible.map((p,i)=>`<button class="project-card" data-project="${available.indexOf(p)}"><div class="project-thumbnail">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.title)}">`:'<span>▧</span>'}<small>${esc(p.category)}</small></div><div class="project-caption"><img src="${esc(profile.avatar||'assets/user.png')}" alt=""><span><b>${esc(p.title)}</b><small>${esc(p.date)}</small></span></div></button>`).join('')||'<p class="project-empty">No projects match your search.</p>':Array.from({length:6},(_,i)=>`<button class="project-card blank-project" data-open="profile" aria-label="${EDITOR_MODE?'Add project '+(i+1):'Project coming soon'}" ${EDITOR_MODE?'':'disabled'}><div class="project-thumbnail"><span>＋</span></div><div class="project-caption"><span class="blank-avatar"></span><span><b>${EDITOR_MODE?'Add a project':'Coming soon'}</b><small>${EDITOR_MODE?'Your work will appear here':''}</small></span></div></button>`).join('')}</section></div></div>`;
    root.querySelector('form').onsubmit=event=>{event.preventDefault();search=event.currentTarget.querySelector('input').value;paint();};
    root.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category;paint();});
    root.querySelectorAll('[data-project]').forEach(button=>button.onclick=()=>{const p=available[+button.dataset.project];root.innerHTML=`<article class="project-detail"><button class="xp-button" data-back>← My Projects</button>${p.image?`<img class="project-hero" src="${esc(p.image)}" alt="${esc(p.title)}">`:''}<h1>${esc(p.title)}</h1><p class="muted">${esc(p.category)} ${p.date?' · '+esc(p.date):''}</p><p>${esc(p.description).replace(/\n/g,'<br>')}</p>${p.url?`<a class="xp-button" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">View project ↗</a>`:''}</article>`;root.querySelector('[data-back]').onclick=paint;});
  }
  paint();
}
function contact(root){
  const ready=!!profile.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
  root.innerHTML=`<form class="contact-form"><div class="contact-toolbar"><button type="submit" ${ready?'':'disabled'}><img src="xp-icons/contact.webp" alt="">Send Message</button><button type="reset"><span>▤</span>New Message</button><i></i><span class="contact-tools">✂ &nbsp;▧ &nbsp;▤</span><i></i><button type="button" data-open="social:linkedin"><img src="assets/18bb588512d43a49.webp" alt="LinkedIn"></button></div><div class="contact-address"><label>To:<input readonly value="${esc(ready?(profile.name?profile.name+' <'+profile.email+'>':profile.email):'')}" placeholder="Recipient not configured" aria-label="To"></label><label>From:<input type="email" name="from" placeholder="Your email address" required></label><label>Subject:<input name="subject" placeholder="Subject of your message" required></label></div><textarea name="message" aria-label="Message" placeholder="Write your message here" required></textarea>${!ready?'<div class="contact-notice">Contact details have not been added yet.</div>':'<div class="contact-notice">Send opens your email app with this draft.</div>'}</form>`;
  root.querySelector('form').onsubmit=event=>{event.preventDefault();if(!ready)return;const data=new FormData(event.currentTarget);location.href=`mailto:${encodeURIComponent(profile.email)}?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(data.get('message')+'\n\nFrom: '+data.get('from'))}`;};
}
function resumeBody(text){
  const headings=['Summary','Experience','Experience (continued)','Education','Tools'];
  return text.split(/\n/).map(line=>{const trimmed=line.trim();return headings.includes(trimmed)?`<h2>${esc(trimmed)}</h2>`:trimmed?`<div class="resume-line">${esc(line)}</div>`:'<div class="resume-gap"></div>';}).join('');
}
function resume(root){
  const document=profile.resumePages.length?`<div class="resume-document">${profile.resumePages.map((page,i)=>`<img src="${esc(page)}" alt="Résumé page ${i+1} of ${profile.resumePages.length}" loading="lazy">`).join('')}<pre class="resume-accessible">${esc(profile.resumeText)}</pre></div>`:`<article class="resume-paper"><h1>${esc(profile.name)}</h1><p class="resume-subtitle">${esc(profile.headline)}</p><p class="resume-contact">${[profile.email,profile.location].filter(Boolean).map(esc).join(' · ')}</p><hr>${profile.resumeText?`<div class="resume-text formatted-resume">${resumeBody(profile.resumeText)}</div>`:`<section><h2>Profile</h2>${blankLines}</section><section><h2>Experience</h2>${blankLines}${blankLines}</section><section><h2>Education</h2>${blankLines}</section><section><h2>Skills</h2>${profile.skills.length?esc(profile.skills.join(' · ')):blankLines}</section>`}</article>`;
  root.innerHTML=`<div class="resume-view"><div class="resume-actions">${editButton}<a class="xp-button" href="${esc(profile.resumeUrl||'#')}" target="_blank" rel="noopener noreferrer" ${profile.resumeUrl?'':'aria-disabled="true"'} download="Resume.pdf">Download PDF</a>${profile.resumePages.length?`<button class="xp-button" data-resume-fit>Fit to window</button><button class="xp-button" data-resume-minus aria-label="Zoom résumé out">−</button><button class="xp-button" data-resume-plus aria-label="Zoom résumé in">+</button>${profile.publicResumeUrl?`<a class="xp-button" href="${esc(profile.publicResumeUrl)}" target="_blank" rel="noopener noreferrer">Open full size</a>`:''}`:''}<button class="xp-button" data-print>Print</button></div>${document}</div>`;
  root.querySelector('[data-print]').onclick=()=>{if(profile.publicResumeUrl)window.open(profile.publicResumeUrl,'_blank','noopener,noreferrer');else window.print();};
  let zoom=1;const setZoom=value=>{zoom=value;root.querySelector('.resume-document').style.width=zoom===1?'min(100%,750px)':Math.round(750*zoom)+'px';};root.querySelector('[data-resume-fit]')?.addEventListener('click',()=>setZoom(1));root.querySelector('[data-resume-minus]')?.addEventListener('click',()=>setZoom(Math.max(.75,zoom-.25)));root.querySelector('[data-resume-plus]')?.addEventListener('click',()=>setZoom(Math.min(2.5,zoom+.25)));
  root.querySelector('[aria-disabled]')?.addEventListener('click',e=>e.preventDefault());
}
function notepad(root){
  let text='';try{text=localStorage.getItem('nzjosh.notepad')||'';}catch{}
  root.innerHTML=`<div class="notepad"><nav><button data-new>New</button><button data-open-text>Open…</button><button data-save-text>Save As…</button><button data-wrap>Word Wrap</button></nav><textarea aria-label="Notepad document" spellcheck="false">${esc(text)}</textarea><footer>Plain text document <span>Ln 1, Col 1</span></footer><input type="file" accept="text/*,.txt,.md" class="hidden"></div>`;
  const area=root.querySelector('textarea');area.oninput=()=>{try{localStorage.setItem('nzjosh.notepad',area.value);}catch{}const lines=area.value.slice(0,area.selectionStart).split('\n');root.querySelector('footer span').textContent=`Ln ${lines.length}, Col ${lines.at(-1).length+1}`;};root.querySelector('[data-new]').onclick=()=>{area.value='';area.oninput();};root.querySelector('[data-save-text]').onclick=()=>downloadFile('Untitled.txt',area.value);root.querySelector('[data-open-text]').onclick=()=>root.querySelector('input').click();root.querySelector('input').onchange=async event=>{if(event.target.files[0]){area.value=await event.target.files[0].text();area.oninput();}};root.querySelector('[data-wrap]').onclick=()=>area.classList.toggle('nowrap');
}
function commandPrompt(root,context){
  root.innerHTML='<div class="command-prompt"><div class="terminal-output">Microsoft Windows XP [Version 5.1.2600]\nA browser desktop. Type HELP for commands.\n</div><form><label><span>C:\\Documents and Settings\\User&gt;</span><input aria-label="Command" autocomplete="off" spellcheck="false"></label></form></div>';
  const output=root.querySelector('.terminal-output');output.textContent='NZJOSH XP [Site version '+VERSION+']\nWindows XP-style browser desktop. Type HELP for commands.\n';const input=root.querySelector('input'),prompt=root.querySelector('label span');const history=[];let at=0;
  prompt.textContent='C:\\Documents and Settings\\'+(profile.name||'User')+'>';
  root.querySelector('form').onsubmit=event=>{event.preventDefault();const raw=input.value.trim();if(!raw)return;const appearanceResponse=handleAppearanceCommand(raw);if(appearanceResponse!==null){input.value='';output.textContent+='\n'+appearanceResponse+'\n';root.querySelector('.command-prompt').scrollTop=1e7;return;}history.push(raw);at=history.length;input.value='';const [command,...rest]=raw.toLowerCase().split(/\s+/);let response='';switch(command){case'help':response='HELP    Display available commands\nVER / VERSION    Display site release version\nCHANGELOG    Display latest release notes\nRESUME    Open My Resume\nCONTACT   Open Contact Me\nPHOTOS    Open Pictures\nDIR     List desktop programs\nCLS     Clear screen\nDATE    Display date\nTIME    Display time\nWHOAMI  Display profile name\nABOUT   Open About Me\nSTART <program> Open a program\nECHO <text> Display text\nEXIT    Close Command Prompt';break;case'ver':case'version':response='NZJOSH XP\nSite version: '+VERSION+'\nRelease date: '+RELEASE_DATE+'\nEarlier deployments were unnumbered; CHANGELOG shows the latest release notes.\nType CHANGELOG for release notes.';break;case'changelog':response='NZJOSH XP '+VERSION+' ('+RELEASE_DATE+')\n'+RELEASE_NOTES.map(note=>' - '+note).join('\n');break;case'resume':case'contact':context.open(command);break;case'photos':case'projects':context.open('gallery');break;case'dir':response='Desktop\n'+Object.entries(catalog).filter(([id])=>(EDITOR_MODE||id!=='profile')&&!['projects','media','gallery3d'].includes(id)&&(id!=='timing'||document.documentElement.dataset.raceTheme==='active')).map(([id,app])=>id.padEnd(16)+app.title).join('\n');break;case'cls':output.textContent='';return;case'date':response=new Date().toLocaleDateString();break;case'time':response=new Date().toLocaleTimeString();break;case'whoami':response=profile.name||'Profile name is blank.';break;case'echo':response=raw.slice(5);break;case'about':context.open(command);break;case'profile':if(EDITOR_MODE)context.open(command);else response='Command not available.';break;case'start':if(rest[0]==='projects')context.open('gallery');else if(catalog[rest[0]]&&(EDITOR_MODE||rest[0]!=='profile')&&(rest[0]!=='timing'||document.documentElement.dataset.raceTheme==='active'))context.open(rest[0]);else response='Program not found. Type DIR for a list.';break;case'exit':context.close();return;case'':break;default:response="'"+raw+"' is not recognized. Type HELP for commands.";}
    output.textContent+='\n'+prompt.textContent+raw+'\n'+response+'\n';root.querySelector('.command-prompt').scrollTop=1e7;
  };input.onkeydown=event=>{if(event.key==='ArrowUp'){event.preventDefault();at=Math.max(0,at-1);input.value=history[at]||'';}if(event.key==='ArrowDown'){event.preventDefault();at=Math.min(history.length,at+1);input.value=history[at]||'';}};root.onclick=()=>input.focus();input.focus();
}
function iframe(root,url,title){root.innerHTML=`<iframe class="program-frame" src="${url}" title="${esc(title)}" allow="autoplay; fullscreen; gamepad" loading="eager" referrerpolicy="no-referrer"></iframe>`;}
function display(root){root.innerHTML=`<div class="display-properties"><nav> <span>Themes</span><b>Desktop</b><span>Screen Saver</span><span>Appearance</span></nav><div class="monitor-preview"><div style="background-image:url(${JSON.stringify(profile.wallpaper)})"><span>▧</span></div><i></i></div><form><label>Background:<select class="xp-input" name="wallpaper"><option value="assets/bliss.jpg">Bliss</option>${EDITOR_MODE?'<option value="custom">Custom (use My Profile)</option>':''}</select></label><label class="editor-check"><input type="checkbox" name="startupSound" ${profile.startupSound?'checked':''}> Startup sound</label><p class="muted">${EDITOR_MODE?'Personal pictures and colors can be set in My Profile.':'Changes apply to this browser.'}</p><footer>${EDITOR_MODE?'<button class="xp-button" type="button" data-open="profile">My Profile…</button>':''}<button class="xp-button" type="submit">Apply</button></footer><span role="status"></span></form></div>`;root.querySelector('form').onsubmit=e=>{e.preventDefault();saveProfile({...profile,wallpaper:e.currentTarget.wallpaper.value==='assets/bliss.jpg'?'assets/bliss.jpg':profile.wallpaper,crt:false,startupSound:e.currentTarget.startupSound.checked});};}
export function renderProgram(id,root,context){
  root.className='window-content program-'+id;
  refreshWindowIcons(context.window);
  if(id==='timing')return renderTiming(root);
    else if(id==='computer')return computer(root,context,profile);
    else if(id==='about'){about(root);context.window.querySelectorAll(':scope > .window-toolbar,:scope > .addressbar').forEach(n=>n.remove());}
  else if(id==='projects')projects(root,context);
  else if(id==='contact')contact(root);
  else if(id==='resume')renderDocument(root,{title:'Resume',src:profile.publicResumeUrl||profile.resumeUrl,pages:profile.resumePages,download:profile.resumeUrl,path:[['Computer','computer'],['Desktop','desktop'],['Resume','resume']]});
  else if(id==='document')renderDocument(root,null);
  else if(id==='achievements')return achievements(root);
  else if(id==='notepad')notepad(root);
  else if(id==='cmd')commandPrompt(root,context);
  else if(id==='gallery'||id==='gallery3d')return gallery(root,context,id==='gallery3d');
  else if(id==='messenger'){let dispose,cancelled=false;import('./joshbot-chat.js').then(m=>m.messenger(root,context)).then(fn=>{if(cancelled)fn?.();else dispose=fn;}).catch(()=>{if(root.isConnected)root.textContent='Josh Bot is unavailable. Please use Contact Me.';});return()=>{cancelled=true;dispose?.();};}
  else if(id==='media')return media(root);
  else if(id==='paint')return paint(root);
  else if(id==='calculator')calculator(root);
  else if(id==='minesweeper')return minesweeper(root);
  else if(id==='display')display(root);
  else if(id==='credits'){
    root.innerHTML='<div class="credits"><div><img src="xp-icons/windows-flag.png" alt=""><h1>NZJOSH.com</h1></div><h2>Joshua Fuller &amp; ChatGPT</h2><p>Design adaptation, development, and personal desktop implementation.</p><hr><p>A personal space built for the web.</p><section data-legal></section></div>';
    return renderLegalNotices(root,context);
  }
}


