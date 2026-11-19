export function setExplorerPath(shell,parts){
 let address=shell.querySelector('.address-input');
 if(!address){const bar=document.createElement('div');bar.className='addressbar';bar.innerHTML='<span>Address</span><div class="address-input"></div>';shell.insertBefore(bar,shell.querySelector('.window-content'));address=bar.querySelector('.address-input');}
 address.replaceChildren();address.style.overflowX='auto';const icon=shell.querySelector('.window-titlebar > img')?.cloneNode();if(icon){icon.alt='';icon.style.cssText='width:16px;height:16px;flex-shrink:0';address.append(icon);}
 for(const [index,[label,id,section]] of parts.entries()){
  if(index){const divider=document.createElement('span');divider.textContent=' › ';divider.setAttribute('aria-hidden','true');address.append(divider);}
  const button=document.createElement('button');button.type='button';button.textContent=label==='Computer'?'My Computer':label;button.style.cssText='flex-shrink:0;border:0;background:transparent;color:inherit;padding:1px 3px;cursor:pointer;font:inherit';
  button.onclick=async()=>{if(shell.explorerNavigate){await shell.explorerNavigate(id,section);return;}const {openApp}=await import('./desktop.js');await openApp(id==='desktop'?'computer':id);const app=document.querySelector('[data-app="'+(id==='desktop'?'computer':id)+'"]');if(id==='desktop'||id==='computer')await app?.explorerNavigate?.(id);if(section)app?.dispatchEvent(new CustomEvent(id==='gallery'?'gallery:navigate':'certificates:navigate',{detail:section}));};
  address.append(button);
 }
 shell.dispatchEvent(new CustomEvent('explorer:location',{detail:parts}));
}

