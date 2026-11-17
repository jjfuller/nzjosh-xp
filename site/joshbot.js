import {profile,escapeHTML as esc} from './profile.js';
export const botMessages={
  help:"I can show you Josh's resume, tell you a bit about Josh, or show you where to send a message.",
  intro:"Hey, I'm JoshBot. Have a look around, or message me if you're trying to find something.",
  projects:"Here's a bit about Josh.",resume:"Here's Josh's resume.",about:"Here's a bit about Josh.",contact:"You can message Josh here.",
  wellbeing:'Good thanks. What are you looking for?',thanks:'No worries.',goodbye:'Catch you later.',laughter:'Haha hey.',
  identity:"Nah, I'm just a very committed bit of JavaScript.",creator:'Joshua Fuller & ChatGPT made me.',repeat:'Yep, here it is again.',
  greeting:"Hey, how's it going?",fallback:'What did you want to have a look at?',
  josh:"Yeah, what do you want to know? I can show you Josh's resume, or where to get in touch.",
  idle:["Have a look at Josh's resume.","Give me a shout if you're trying to find something.","If you want to work with Josh, I can show you where to send a message."],
  nudges:['Oi.',"Yeah yeah, I'm here.",'Haha hey.','What?','Alright, alright.']
};
const after={projects:'resume',resume:'about',about:'resume',contact:'about'};
export function replyTo(message,lastProgram='',availability=''){
  const text=String(message).normalize('NFD').replace(/\p{M}/gu,'').trim().toLowerCase().replace(/[^a-z0-9'?]+/g,' ').trim();
  const open=requested=>{const program=requested==='projects'?'about':requested;return {text:program===lastProgram?botMessages.repeat:botMessages[program],program};};
  if(/\b(what (?:can|do) you do|what are you for|show me what you can do)\b/.test(text))return{text:botMessages.help};
  if(/\b(what else|anything else|something else|show me more)\b/.test(text))return after[lastProgram]?open(after[lastProgram]):{text:botMessages.fallback};
  if(/\b(who (?:made|built|created) you|your (?:maker|creator))\b/.test(text))return{text:botMessages.creator};
  if(/\b(are you (?:real|an? ai|a bot|human)|you(?:'re| are) (?:an? ai|a bot)|what are you)\b/.test(text))return{text:botMessages.identity};
  if(/\b(avail(?:a|i)ble|availability|hire|hiring|freelance|collab(?:orate|oration)?|jobs?|commission|work together)\b|\bwork(?:ing)?\s+with\b/.test(text))return lastProgram==='contact'?open('contact'):{text:availability?availability+' '+botMessages.contact:botMessages.contact,program:'contact'};
  if(/\b(projects?|youtube|portfolio|porfolio|work|websites?|web sites?|designs?|videos?|vids?|case studies)\b/.test(text))return open('projects');
  if(/\b(resumes?|resme|resumee|cvs?|experience|qualifications?)\b/.test(text))return open('resume');
  if(/\b(contacts?|emails?|messages?|reach|enquir\w*|inquir\w*|contactt|contat|conact)\b/.test(text))return open('contact');
  if(/\b(about|who(?:'s| is) josh|tell me about josh)\b/.test(text))return open('about');
  if(/\bjosh\b/.test(text))return{text:botMessages.josh};
  if(/\bhelp\b/.test(text))return{text:botMessages.help};
  if(/\b(how are you|how(?:'s| is) it going|you good)\b/.test(text))return{text:botMessages.wellbeing};
  if(/^(thanks|thank you|cheers|ta)(?: mate)?$/.test(text))return{text:botMessages.thanks};
  if(/^(bye|goodbye|see ya|see you|cya|later|gtg)$/.test(text))return{text:botMessages.goodbye};
  if(/^(lol|lmao|haha+|hehe+)$/.test(text))return{text:botMessages.laughter};
  if(/^(hi|hello|hey|yo|sup|hiya)(?: there| mate| man| joshbot)?[?]*$/.test(text))return{text:botMessages.greeting};
  return{text:botMessages.fallback};
}
export function messenger(root,context){
  let lastProgram='',blocked=false,nudge=0;
  const avatar=profile.botAvatar||'assets/user.png';
  root.innerHTML=`<div class="messenger-app"><div class="messenger-tabs"><span>♟ &nbsp; JoshBot &nbsp; ×</span></div><header><img src="assets/4e5f4a17a66eea46.webp" alt=""><div><b>JoshBot</b><small>${esc(profile.availability||'Explore Josh’s desktop')}</small></div></header><nav><span>♟ &nbsp; ▧ &nbsp; ☎ &nbsp; ▤ &nbsp;</span><button type="button" data-block aria-pressed="false">♟ Block</button></nav><div class="messenger-main"><div class="messenger-left"><div class="messenger-log" role="log" aria-live="polite"></div><form><div class="messenger-format"><span>☺ &nbsp; ☀</span><button type="button" data-nudge title="Nudge" aria-label="Nudge">😮</button><button type="button" data-intro title="Show intro" aria-label="Show intro">♟</button><span> A▧</span></div><textarea aria-label="Message" placeholder="Type your message here…"></textarea><footer><span>A &nbsp;▱</span><button class="xp-button" type="submit">Send</button></footer></form><small class="messenger-private">JoshBot runs entirely in your browser. Messages stay on this device.</small></div><aside><div class="messenger-avatar"><img src="${esc(avatar)}" alt="JoshBot cartoon avatar"></div><div class="messenger-avatar"><img src="assets/visitor-avatar.svg" alt="Empty visitor profile picture"></div></aside></div></div>`;
  const log=root.querySelector('.messenger-log'),area=root.querySelector('textarea');
  const say=(text,program)=>{const line=document.createElement('div');line.className='chat-reply';const label=document.createElement('small');label.textContent='JoshBot says:';const p=document.createElement('p');p.textContent=text;line.append(label,p);if(program){const button=document.createElement('button');button.className='messenger-link';button.textContent='Open '+({projects:'My Projects',resume:'My Resume',about:'About Me',contact:'Contact Me'}[program]);button.onclick=()=>context.open(program);line.append(button);}log.append(line);log.scrollTop=1e7;};
  say(botMessages.intro);
  root.querySelector('form').onsubmit=e=>{e.preventDefault();const message=area.value.trim();if(!message||blocked)return;const p=document.createElement('p');p.className='chat-sent';p.textContent='You say: '+message;log.append(p);area.value='';const reply=replyTo(message,lastProgram,profile.availability);if(reply.program)lastProgram=reply.program;say(reply.text,reply.program);};
  area.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();root.querySelector('form').requestSubmit();}};
  root.querySelector('[data-intro]').onclick=()=>{if(!blocked)say(botMessages.intro);};
  root.querySelector('[data-nudge]').onclick=()=>{if(blocked)return;context.window.classList.remove('nudge');void context.window.offsetWidth;context.window.classList.add('nudge');setTimeout(()=>context.window.classList.remove('nudge'),400);say(botMessages.nudges[nudge++%botMessages.nudges.length]);};
  root.querySelector('[data-block]').onclick=e=>{blocked=!blocked;e.currentTarget.setAttribute('aria-pressed',blocked);e.currentTarget.textContent=blocked?'♟ Unblock':'♟ Block';area.disabled=blocked;root.querySelector('button[type=submit]').disabled=blocked;root.querySelector('[data-intro]').disabled=blocked;root.querySelector('[data-nudge]').disabled=blocked;};
  const timers=botMessages.idle.map((text,i)=>setTimeout(()=>{if(!blocked)say(text,i===0?'resume':i===2?'contact':undefined);},(i+1)*60000));
  return()=>timers.forEach(clearTimeout);
}
