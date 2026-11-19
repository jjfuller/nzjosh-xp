const icons=document.getElementById('desktop-icons');
if(icons){
 function mount(){
  if(!icons.querySelector('[data-desktop="about"]')||icons.querySelector('[data-desktop="computer"]'))return false;
  const button=document.createElement('button');button.className='desktop-icon';button.dataset.desktop='computer';button.setAttribute('aria-label','Open My Computer');button.innerHTML='<img src="xp-icons/computer.png" alt=""><span>My Computer</span>';icons.prepend(button);
  function position(){
   const narrow=innerWidth<=700,top=narrow?15:31,step=narrow?106:130,height=narrow?98:112;
   const others=[...icons.querySelectorAll('[data-desktop]')].filter(icon=>icon!==button);
   button.style.left=others[0]?.style.left||(narrow?12:29)+'px';button.style.top=top+'px';
   others.forEach((icon,index)=>{icon.style.top=Math.max(0,Math.min(innerHeight-30-height,Math.max(top+(index+1)*step,parseFloat(icon.style.top)||0)))+'px';});
  }
  position();addEventListener('resize',position);return true;
 }
 if(!mount()){const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});observer.observe(icons,{childList:true});}
}
