// Retire legacy CRT controls without rescanning the whole desktop after every UI update.
export function removeCRT(){
  window.nzjoshCRT?.destroy?.();
  document.getElementById('nzjosh-crt-styles')?.remove();
  try{localStorage.removeItem('nzjosh.crt.art.v1');const key='nzjosh.preferences.v1',prefs=JSON.parse(localStorage.getItem(key)||'{}');delete prefs.crt;localStorage.setItem(key,JSON.stringify(prefs));}catch{}
  const retired='#crt-overlay,#crt-quick,#crt-art-settings,.crt-settings,input[name="crt"]';
  function retire(node){
    if(node.id==='crt-quick'){
      // Bootstrap still assigns this handler; detach only after it has done so.
      node.hidden=true;node.style.display='none';if(typeof node.onclick==='function')node.remove();
    }else if(node.matches('input[name="crt"]')){
      node.checked=false;node.tabIndex=-1;const label=node.closest('label');if(label){label.hidden=true;label.style.display='none';}
    }else node.remove();
  }
  function menuButton(node){if(node.matches('button')&&node.closest('#context-menu')&&/^CRT effect$/i.test(node.textContent.trim()))node.remove();}
  document.querySelectorAll(retired).forEach(retire);
  document.querySelectorAll('#context-menu button').forEach(menuButton);
  const observer=new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes){
      if(!(node instanceof Element))continue;
      if(node.matches(retired))retire(node);
      node.querySelectorAll(retired).forEach(retire);menuButton(node);
      if(node.id==='context-menu')node.querySelectorAll('button').forEach(menuButton);
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
  let attempts=0;const wait=setInterval(()=>{const quick=document.getElementById('crt-quick');if(quick)retire(quick);if(!document.getElementById('crt-quick')||++attempts>30)clearInterval(wait);},100);
  return()=>{observer.disconnect();clearInterval(wait);};
}
