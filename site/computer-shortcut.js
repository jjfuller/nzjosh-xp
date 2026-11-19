// My Computer shares the same responsive layout and drag persistence as other icons.
const icons=document.getElementById('desktop-icons');
if(icons){
 function mount(){
  if(!icons.querySelector('[data-desktop="about"]')||icons.querySelector('[data-desktop="computer"]'))return false;
  const button=document.createElement('button');button.className='desktop-icon';button.dataset.desktop='computer';button.setAttribute('aria-label','Open My Computer');button.innerHTML='<img src="xp-icons/computer.png" alt=""><span>My Computer</span>';icons.prepend(button);
  document.dispatchEvent(new Event('desktop:icons-changed'));return true;
 }
 if(!mount()){const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});observer.observe(icons,{childList:true});}
}
