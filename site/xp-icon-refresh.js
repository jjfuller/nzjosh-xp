// Original navigation drawings follow the supplied XP toolbar guidance.
export function refreshWindowIcons(window){
 if(!window)return;
 if(!document.querySelector('[data-xp-icon-styles]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./xp-icon-refresh.css',import.meta.url).href;link.dataset.xpIconStyles='';document.head.append(link);}
 window.querySelectorAll('.window-flag img').forEach(img=>{if(!img.src.endsWith('/xp-icons/windows-flag.png'))img.src='xp-icons/windows-flag.png';});
 window.querySelectorAll('.window-toolbar .nav-circle').forEach(span=>{if(span.dataset.xpNavigation)return;const button=span.closest('button'),back=button.matches('[data-history="back"],[data-gallery-back]')||/Back/.test(button.textContent);span.dataset.xpNavigation=back?'back':'forward';span.setAttribute('aria-hidden','true');const img=document.createElement('img');img.src='xp-icons/nav-'+(back?'back':'forward')+'.svg';img.alt='';span.replaceChildren(img);});
}
