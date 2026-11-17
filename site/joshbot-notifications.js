import {appendMessage,actionFor,actions} from './joshbot-messages.js';
if(!document.getElementById('joshbot-balloon-styles')){const sheet=document.createElement('link');sheet.id='joshbot-balloon-styles';sheet.rel='stylesheet';sheet.href=new URL('./joshbot-notifications.css',import.meta.url).href;document.head.append(sheet);}
export const JOSHBOT_INTERVAL_MS=120000;
export const JOSHBOT_MAX_PER_SESSION=8;
// A single deadline pauses while hidden. No network requests except the local message pool.
export function notifications({desktop,open,state,ding,avatar,interval=JOSHBOT_INTERVAL_MS,max=JOSHBOT_MAX_PER_SESSION}){
 const preference='nzjosh.bot-balloons.disabled';let timer,hideTimer,deadline=0,remaining=interval,started=false,balloon=null,pool=[],bag=[],last='',dismissals=0,backoff=1;
 let count=Number(sessionStorage.getItem('nzjosh.bot-balloons.count')||0);
 const disabled=()=>{try{return localStorage.getItem(preference)==='true';}catch{return false;}};
 const schedule=(ms=interval*backoff)=>{clearTimeout(timer);remaining=ms;if(!started||disabled()||count>=max||document.hidden)return;deadline=Date.now()+ms;timer=setTimeout(show,ms);};
 const remove=()=>{clearTimeout(hideTimer);balloon?.remove();balloon=null;};
 const engage=(entry,navigate=false)=>{dismissals=0;remove();const destination=navigate?actions[entry.action]?.[1]:'messenger';open(destination||'messenger');schedule();};
 const dismiss=()=>{remove();dismissals++;if(dismissals>=3)backoff=2;schedule();};
 function next(){if(!bag.length){bag=[...pool];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag.length>1&&bag.at(-1)===last)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];}last=bag.pop()||'Need help exploring Joshua’s desktop?';return last;}
 function show(){const s=state();if(!started||disabled()||document.hidden||count>=max)return;
   if(s.chatOpen||s.gameFocused||s.dialogOpen||balloon){schedule(s.chatOpen?interval*backoff:30000);return;}
   let question=next();const messageAction=actionFor(question);if(s.resumeOpen)question+=' I can help with the resume you have open.';else if(s.certificatesOpen)question+=' I can explain the certificates you’re viewing.';else if(s.photosOpen)question+=' I can list the photo albums you’re browsing.';
   const entry=appendMessage({role:'assistant',text:question,action:messageAction,source:'notification'});
   count++;sessionStorage.setItem('nzjosh.bot-balloons.count',String(count));balloon=document.createElement('aside');balloon.className='joshbot-balloon';balloon.setAttribute('role','status');balloon.setAttribute('aria-live','polite');
   // Keep desktop drag-selection from capturing the pointer before a button's click.
   balloon.addEventListener('pointerdown',event=>event.stopPropagation());
   const image=document.createElement('img');image.src=avatar();image.alt='';const title=document.createElement('strong');title.textContent='JoshBot · New message';const close=document.createElement('button');close.className='balloon-close';close.textContent='×';close.setAttribute('aria-label','Dismiss Josh Bot notification');close.onclick=dismiss;
   const message=document.createElement('button');message.className='balloon-message';message.textContent=question;message.onclick=()=>engage(entry,true);
   const links=document.createElement('div');const chat=document.createElement('button');chat.textContent='Chat now';chat.onclick=()=>engage(entry);const off=document.createElement('button');off.textContent="Don’t show these";off.onclick=()=>{try{localStorage.setItem(preference,'true');}catch{}remove();clearTimeout(timer);setting.textContent='Josh Bot notifications: Off';};const destination=document.createElement('button');destination.textContent='Open '+actions[entry.action][0];destination.onclick=()=>engage(entry,true);links.append(chat,destination,off);balloon.append(image,title,close,message,links);balloon.onclick=e=>{if(!e.target.closest('button'))engage(entry);};desktop.append(balloon);position();ding();hideTimer=setTimeout(dismiss,10000);schedule();
 }
 function position(){if(!balloon)return;const tray=document.querySelector('#messenger-tray');if(!tray)return;const anchor=tray.getBoundingClientRect();balloon.style.right=Math.max(10,innerWidth-anchor.right-18)+'px';balloon.style.bottom=Math.max(42,innerHeight-anchor.top+12)+'px';const box=balloon.getBoundingClientRect();balloon.style.setProperty('--tail-right',Math.max(17,Math.min(box.width-25,box.right-(anchor.left+anchor.width/2)-6))+'px');}
 window.addEventListener('resize',position);
 const setting=document.createElement('button');setting.id='joshbot-notifications-toggle';setting.textContent='Josh Bot notifications: '+(disabled()?'Off':'On');setting.onclick=()=>{const off=!disabled();try{localStorage.setItem(preference,String(off));}catch{}setting.textContent='Josh Bot notifications: '+(off?'Off':'On');remove();if(off)clearTimeout(timer);else schedule();};desktop.querySelector('#hidden-tray').append(setting);
 fetch('joshbot-notifications.json').then(r=>r.ok?r.json():[]).then(data=>{pool=Array.isArray(data)?data.filter(x=>typeof x==='string'):[];}).catch(()=>{});
 document.addEventListener('joshbot:activity',()=>{remove();dismissals=0;schedule();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){remaining=Math.max(0,deadline-Date.now());clearTimeout(timer);remove();}else schedule(remaining||interval*backoff);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&balloon)dismiss();});
 return {start(){if(started)return;started=true;schedule();},stop(){started=false;clearTimeout(timer);remove();},reset(){remove();schedule();}};
}
