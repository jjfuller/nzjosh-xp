// Substitute an optimized copy only for the existing default wallpaper.
// Personal wallpaper choices and the separate theme remain in control.
const style=document.createElement('style');
style.textContent='#desktop[data-optimized-wallpaper="true"]{background-image:url("/classic-wallpaper.webp")!important}';
document.head.append(style);
function mount(){
  const desktop=document.getElementById('desktop');if(!desktop)return;
  const refresh=()=>{const useDefault=/["'(\/]assets\/bliss\.jpg["')]/.test(desktop.style.backgroundImage);desktop.toggleAttribute('data-optimized-wallpaper',useDefault);if(useDefault)desktop.dataset.optimizedWallpaper='true';};
  new MutationObserver(refresh).observe(desktop,{attributes:true,attributeFilter:['style']});refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
