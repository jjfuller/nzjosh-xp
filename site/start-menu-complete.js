import {catalog} from './programs.js';
import {EDITOR_MODE} from './mode.js';
import {profile} from './profile.js';
export function completeStartMenu(){
  const start=document.getElementById('start-menu');if(!start)return;
  const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('./start-menu-complete.css',import.meta.url).href;document.head.append(sheet);
  const order=['about','resume','contact','achievements','gallery','messenger','paint','minesweeper','calculator','notepad','cmd','web','nas','display','profile','credits'];
  const labels={messenger:'JoshBot',notepad:'Notepad'};
  function reconcile(){
    start.querySelectorAll('[data-open="media"]').forEach(button=>button.remove());
    const right=start.querySelector('.start-right');
    // A real anchor reuses the desktop's accessible external-link confirmation.
    if(right&&!right.querySelector('[data-github-repository]')){
      const link=document.createElement('a');link.className='menu-item';link.dataset.githubRepository='';
      link.href='https://github.com/jjfuller/nzjosh-xp';link.target='_blank';link.rel='noopener noreferrer';
      link.title='View the public NZJOSH XP repository on GitHub';
      link.style.cssText='text-decoration:none;box-sizing:border-box';
      const image=document.createElement('img');image.src='assets/e3555b8ab0bac10d.webp';image.alt='';
      const span=document.createElement('span'),label=document.createElement('b');label.textContent='GitHub';
      span.append(label);link.append(image,span);
      const steam=right.querySelector('[data-open="social:steam"]');
      if(steam)steam.after(link);else right.prepend(link);
    }
    if(right&&!right.querySelector('[data-open="minesweeper"]')){
      const button=document.createElement('button');button.className='menu-item';button.dataset.open='minesweeper';
      const image=document.createElement('img');image.src='assets/minesweeper.svg';image.alt='';const span=document.createElement('span'),label=document.createElement('b');label.textContent='Minesweeper';span.append(label);button.append(image,span);right.insertBefore(button,right.querySelector('[data-open="notepad"]'));
    }
    const menu=start.querySelector('.programs-submenu');if(!menu)return;
    const racing=document.documentElement.dataset.raceTheme==='active';
    const ids=[...new Set([...order,...Object.keys(catalog)])].filter(id=>catalog[id]&&!['media','projects','gallery3d','web'].includes(id)&&(racing||id!=='timing')&&(EDITOR_MODE||id!=='profile'));
    const signature=JSON.stringify(ids.map(id=>[id,labels[id]||catalog[id].title]));
    if(menu.dataset.completeSignature===signature)return;
    menu.dataset.completeSignature=signature;menu.setAttribute('role','menu');menu.setAttribute('aria-label','All Programs');
    const buttons=ids.map(id=>{const button=document.createElement('button');button.className='menu-item';button.dataset.open=id;button.setAttribute('role','menuitem');const image=document.createElement('img');image.src=id==='messenger'&&profile.botAvatar?profile.botAvatar:'assets/'+catalog[id].icon;image.alt='';const span=document.createElement('span'),name=document.createElement('b');name.textContent=labels[id]||catalog[id].title;span.append(name);button.append(image,span);return button;});menu.replaceChildren(...buttons);
    menu.onkeydown=event=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;event.preventDefault();const i=buttons.indexOf(document.activeElement),delta=event.key==='ArrowUp'?-1:1;const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+delta+buttons.length)%buttons.length;buttons[next].focus();};
  }
  const observer=new MutationObserver(reconcile);observer.observe(start,{childList:true,subtree:true});observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-race-theme']});reconcile();return()=>{observer.disconnect();sheet.remove();};
}
