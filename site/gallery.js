import {profile,escapeHTML as esc} from './profile.js';
import {EDITOR_MODE} from './mode.js';
export function gallery(root,context,threeD=false){
  let home=!threeD,album='',index=0,page=0,rotation=0,zoom=1,photoRotation=0;
  let coverTimer=null,lastCover=-1;
  const rotateCover=()=>{if(document.hidden||context.window?.dataset.minimized==='true')return;const image=root.querySelector('[data-album-choice="0"] img');if(!image||!profile.gallery.length)return;let next=Math.floor(Math.random()*profile.gallery.length);if(profile.gallery.length>1&&next===lastCover)next=(next+1)%profile.gallery.length;lastCover=next;const photo=profile.gallery[next];image.src=photo.thumbnail||photo.image;};
  const albums=[...new Set(profile.gallery.map(p=>p.album).filter(Boolean))];
  const edit=EDITOR_MODE?'<button class="xp-button" data-open="profile">Edit pictures</button>':'';
  function paint(){
    clearInterval(coverTimer);
    if(home){
      const choices=[{name:'All pictures',value:'',pictures:profile.gallery},...albums.map(name=>({name,value:name,pictures:profile.gallery.filter(p=>p.album===name)}))];
      root.innerHTML=`<div class="album-home"><header><img src="assets/7a25160013c98a4f.webp" alt=""><div><h1>My Pictures</h1><p>Choose an album to explore</p></div></header><nav class="album-covers" aria-label="Photo albums">${choices.map((choice,i)=>`<button class="album-cover" data-album-choice="${i}" aria-label="Open ${esc(choice.name)} album"><span class="album-cover-photo">${choice.pictures[0]?`<img src="${esc(choice.pictures[0].thumbnail||choice.pictures[0].image)}" alt="" loading="lazy">`:'▧'}</span><strong>${esc(choice.name)}</strong><small>${choice.pictures.length} photos</small></button>`).join('')}</nav>${edit}</div>`;
      root.querySelectorAll('[data-album-choice]').forEach(button=>button.onclick=()=>{album=choices[+button.dataset.albumChoice].value;index=page=rotation=photoRotation=0;zoom=1;home=false;paint();});rotateCover();if(profile.gallery.length>1)coverTimer=setInterval(rotateCover,4000);return;
    }
    const pictures=profile.gallery.filter(p=>!album||p.album===album);
    index=Math.min(index,Math.max(0,pictures.length-1));
    const select=`<label>Album <select class="xp-input" aria-label="Picture album"><option value="">All pictures (${profile.gallery.length})</option>${albums.map(a=>`<option value="${esc(a)}" ${a===album?'selected':''}>${esc(a)} (${profile.gallery.filter(p=>p.album===a).length})</option>`).join('')}</select></label>`;
    if(threeD){
      const pages=Math.max(1,Math.ceil(pictures.length/8));page=Math.min(page,pages-1);
      const slice=pictures.slice(page*8,page*8+8),count=Math.max(slice.length,1),radius=Math.max(230,count*34);
      root.innerHTML=`<div class="gallery-3d"><header class="gallery-albums">${select}<span>${pictures.length} pictures</span></header><div class="gallery-room"><div class="gallery-ring">${slice.length?slice.map((p,i)=>`<figure style="transform:rotateY(${i*360/count}deg) translateZ(${radius}px)"><img src="${esc(p.thumbnail||p.image)}" alt="${esc(p.title)}"><figcaption>${esc(p.title)}</figcaption></figure>`).join(''):'<figure><span>▧</span><figcaption>No pictures added</figcaption></figure>'}</div></div><footer><button class="xp-button" data-left aria-label="Rotate gallery left">←</button><span>Drag to rotate</span><button class="xp-button" data-right aria-label="Rotate gallery right">→</button><button class="xp-button" data-page-prev ${page?'':'disabled'}>Previous set</button><span>Set ${page+1} of ${pages}</span><button class="xp-button" data-page-next ${page<pages-1?'':'disabled'}>Next set</button>${edit}</footer></div>`;
      const ring=root.querySelector('.gallery-ring'),turn=amount=>{rotation+=amount;ring.style.transform=`rotateY(${rotation}deg)`;};turn(0);
      root.querySelector('[data-left]').onclick=()=>turn(360/count);root.querySelector('[data-right]').onclick=()=>turn(-360/count);
      root.querySelector('[data-page-prev]').onclick=()=>{page--;rotation=0;paint();};root.querySelector('[data-page-next]').onclick=()=>{page++;rotation=0;paint();};
      const room=root.querySelector('.gallery-room');room.onpointerdown=event=>{room.setPointerCapture(event.pointerId);let x=event.clientX;room.onpointermove=e=>{turn((e.clientX-x)*.4);x=e.clientX;};room.onpointerup=room.onpointercancel=()=>room.onpointermove=null;};
    }else{
      const picture=pictures[index];
      root.innerHTML=`<div class="image-viewer"><header class="gallery-albums"><button class="xp-button" data-albums-home>← Albums</button>${select}<span>${picture?index+1:0} of ${pictures.length}</span></header><div class="photo-tools"><button class="xp-button" data-fit>Fit to window</button><button class="xp-button" data-zoom-out aria-label="Zoom out">−</button><button class="xp-button" data-zoom-in aria-label="Zoom in">+</button><button class="xp-button" data-rotate>Rotate ↻</button></div><div class="image-stage">${picture?`<img src="${esc(picture.image)}" alt="${esc(picture.title)}" style="transform:rotate(${photoRotation}deg) scale(${zoom})">${picture.description?`<p>${esc(picture.description)}</p>`:''}`:`<div class="empty-picture"><span>▧</span><p>No pictures added</p>${edit}</div>`}</div><footer><button class="xp-button" data-prev aria-label="Previous picture" ${pictures.length?'':'disabled'}>◀</button><span>${picture?esc(picture.title):'My Pictures'}</span><button class="xp-button" data-next aria-label="Next picture" ${pictures.length?'':'disabled'}>▶</button></footer>${pictures.length?`<nav aria-label="Picture thumbnails">${pictures.map((p,i)=>`<button data-index="${i}" aria-label="View ${esc(p.title)}" aria-pressed="${i===index}" class="${i===index?'active':''}"><img src="${esc(p.thumbnail||p.image)}" alt="" loading="lazy"></button>`).join('')}</nav>`:''}</div>`;
      root.querySelector('[data-albums-home]').onclick=()=>{home=true;paint();};
      root.querySelector('[data-fit]').onclick=()=>{zoom=1;photoRotation=0;paint();};root.querySelector('[data-zoom-out]').onclick=()=>{zoom=Math.max(.5,zoom-.25);paint();};root.querySelector('[data-zoom-in]').onclick=()=>{zoom=Math.min(3,zoom+.25);paint();};root.querySelector('[data-rotate]').onclick=()=>{photoRotation=(photoRotation+90)%360;paint();};
      root.querySelector('[data-prev]').onclick=()=>{index=(index+pictures.length-1)%pictures.length;zoom=1;photoRotation=0;paint();};root.querySelector('[data-next]').onclick=()=>{index=(index+1)%pictures.length;zoom=1;photoRotation=0;paint();};root.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>{index=+b.dataset.index;zoom=1;photoRotation=0;paint();});
    }
    const strip=root.querySelector('.image-viewer>nav'),selected=strip?.querySelector('.active');if(selected)strip.scrollLeft=Math.max(0,selected.offsetLeft-strip.offsetLeft-strip.clientWidth/2+selected.clientWidth/2);
    root.querySelector('select').onchange=e=>{album=e.target.value;index=page=rotation=0;paint();};
  }
  paint();
  return()=>clearInterval(coverTimer);
}
