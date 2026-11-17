// Desktop selection is transient; only icon positions are persisted by the owner.
export function desktopSelection({desktop,icons,open,save,menuOpen,closeMenu}) {
  const items=[...icons.children],selected=new Set();let drag=null,frame=0,suppress=false;
  icons.setAttribute('role','listbox');icons.setAttribute('aria-multiselectable','true');
  const paint=()=>items.forEach(el=>{el.classList.toggle('selected',selected.has(el));el.setAttribute('aria-selected',String(selected.has(el)));});
  const choose=(el,toggle=false)=>{if(!toggle)selected.clear();if(el){if(toggle&&selected.has(el))selected.delete(el);else selected.add(el);}paint();};
  items.forEach(el=>{el.setAttribute('role','option');el.tabIndex=0;el.querySelector('img').draggable=false;});
  const bounds=()=>{const r=desktop.getBoundingClientRect(),bar=desktop.querySelector('.taskbar').getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:bar.top-r.top};};
  const cache=()=>items.map(el=>({el,rect:el.getBoundingClientRect()}));
  const update=()=>{frame=0;if(!drag)return;const d=drag,dx=d.x-d.startX,dy=d.y-d.startY;if(!d.moved&&Math.hypot(dx,dy)<4)return;d.moved=true;desktop.classList.add('desktop-selecting');
    if(d.group){const minX=Math.min(...d.group.map(p=>p.x)),minY=Math.min(...d.group.map(p=>p.y)),maxX=Math.max(...d.group.map(p=>p.x+p.el.offsetWidth)),maxY=Math.max(...d.group.map(p=>p.y+p.el.offsetHeight));const x=Math.max(-minX,Math.min(d.bounds.width-maxX,dx)),y=Math.max(-minY,Math.min(d.bounds.height-maxY,dy));d.group.forEach(p=>{p.el.style.left=p.x+x+'px';p.el.style.top=p.y+y+'px';});return;}
    if(!d.box){d.box=document.createElement('div');d.box.className='desktop-selection-box';desktop.append(d.box);}
    const x=Math.min(d.startX,d.x),y=Math.min(d.startY,d.y),w=Math.abs(dx),h=Math.abs(dy);Object.assign(d.box.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
    selected.clear();d.base.forEach(el=>selected.add(el));d.rects.forEach(({el,rect:r})=>{if(r.right>=x+d.bounds.left&&r.left<=x+w+d.bounds.left&&r.bottom>=y+d.bounds.top&&r.top<=y+h+d.bounds.top)selected.add(el);});paint();
  };
  desktop.addEventListener('pointerdown',e=>{if(e.button!==0)return;const el=e.target.closest('[data-desktop]');if(!el&&e.target.closest('.app-window,.taskbar,#start-menu,#context-menu,.tray-popup,.hidden-tray,.modal-shade'))return;
    if(menuOpen()){closeMenu();if(!el)return;}
    if(el){if(e.ctrlKey||e.metaKey){choose(el,true);return;}if(!selected.has(el))choose(el);el.focus({preventScroll:true});}
    else {if(!(e.shiftKey||e.ctrlKey||e.metaKey))choose(null);if(e.pointerType==='touch')return;}
    const b=bounds();drag={pointer:e.pointerId,startX:e.clientX-b.left,startY:e.clientY-b.top,x:e.clientX-b.left,y:e.clientY-b.top,bounds:b,rects:cache(),base:new Set(el?[]:selected),group:el?[...selected].map(el=>({el,x:parseFloat(el.style.left),y:parseFloat(el.style.top)})):null,moved:false};
    if(!el)e.preventDefault();
    // Capture on the icon so native click and double-click keep their target.
    drag.capture=el||desktop;drag.capture.setPointerCapture(e.pointerId);
  });
  desktop.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;drag.x=Math.max(0,Math.min(drag.bounds.width,e.clientX-drag.bounds.left));drag.y=Math.max(0,Math.min(drag.bounds.height,e.clientY-drag.bounds.top));if(!frame)frame=requestAnimationFrame(update);});
  const finish=e=>{if(!drag||drag.pointer!==e.pointerId)return;if(frame){cancelAnimationFrame(frame);update();}const d=drag;drag=null;d.box?.remove();desktop.classList.remove('desktop-selecting');if(d.moved){suppress=true;setTimeout(()=>suppress=false,400);if(d.group)save(d.group.map(p=>p.el));}if(d.capture.hasPointerCapture(e.pointerId))d.capture.releasePointerCapture(e.pointerId);};
  desktop.addEventListener('pointerup',finish);desktop.addEventListener('pointercancel',finish);
  icons.addEventListener('click',e=>{if(suppress){e.preventDefault();e.stopImmediatePropagation();}},true);
  icons.ondblclick=e=>{const el=e.target.closest('[data-desktop]');if(el&&!suppress)open(el.dataset.desktop);};
  icons.onkeydown=e=>{const el=e.target.closest('[data-desktop]');if(!el)return;let i=items.indexOf(el);if(e.key.startsWith('Arrow')){e.preventDefault();i=(i+(['ArrowUp','ArrowLeft'].includes(e.key)?-1:1)+items.length)%items.length;choose(items[i]);items[i].focus();}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'){e.preventDefault();items.forEach(el=>selected.add(el));paint();}else if(e.key==='Enter'){e.preventDefault();open(el.dataset.desktop);}else if(e.key==='Escape')choose(null);};
  desktop.addEventListener('contextmenu',e=>{const el=e.target.closest('[data-desktop]');if(el){if(!selected.has(el))choose(el);}else if(!e.target.closest('.app-window,.taskbar,#start-menu'))choose(null);},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')choose(null);});
  addEventListener('resize',()=>{if(drag){drag.bounds=bounds();drag.rects=cache();}});
  desktop.addEventListener('dragstart',e=>{if(drag||e.target.closest('[data-desktop]'))e.preventDefault();});
  return {canOpen:()=>!suppress};
}
