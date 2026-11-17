import {downloadFile} from './profile.js';

export function calculator(root){
  let current='0',stored=null,operation=null,fresh=true,memory=0;
  root.innerHTML=`<div class="calculator"><nav>Edit &nbsp; View &nbsp; Help</nav><input class="calculator-display" aria-label="Calculator display" value="0" readonly><div class="calculator-top"><span data-memory></span><button data-key="back">Backspace</button><button data-key="CE">CE</button><button data-key="C">C</button></div><div class="calculator-keys">${['MC','7','8','9','/','sqrt','MR','4','5','6','*','%','MS','1','2','3','-','1/x','M+','0','±','.','+','='].map(k=>`<button data-key="${k}" class="${/^[0-9.]$/.test(k)?'digit':''}">${k==='sqrt'?'√':k==='*'?'×':k==='/'?'÷':k==='back'?'Backspace':k}</button>`).join('')}</div></div>`;
  const display=root.querySelector('input');
  const compute=(a,b,op)=>op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:op==='/'?a/b:b;
  function press(key){
    if(/^[0-9]$/.test(key)){current=fresh||current==='0'?key:current.length<15?current+key:current;fresh=false;}
    else if(key==='.'){if(fresh){current='0.';fresh=false;}else if(!current.includes('.'))current+='.';}
    else if(['+','-','*','/'].includes(key)){if(operation!==null&&!fresh)current=String(compute(stored,+current,operation));stored=+current;operation=key;fresh=true;}
    else if(key==='='||key==='Enter'){if(operation!==null){current=String(compute(stored,+current,operation));operation=null;stored=null;}fresh=true;}
    else if(key==='C'||key==='Escape'){current='0';stored=null;operation=null;fresh=true;}
    else if(key==='CE'){current='0';fresh=true;}
    else if(key==='back'||key==='Backspace'){current=current.length>1?current.slice(0,-1):'0';}
    else if(key==='±')current=String(-Number(current));
    else if(key==='%')current=String(+current/100);
    else if(key==='sqrt')current=String(Math.sqrt(+current));
    else if(key==='1/x')current=String(1/Number(current));
    else if(key==='MC')memory=0;
    else if(key==='MR'){current=String(memory);fresh=true;}
    else if(key==='MS')memory=+current;
    else if(key==='M+')memory+=+current;
    if(!Number.isFinite(+current)){current='Error';fresh=true;operation=null;}
    else if(current.length>17)current=Number(current).toPrecision(12);
    display.value=current;root.querySelector('[data-memory]').textContent=memory?'M':'';
  }
  root.querySelectorAll('[data-key]').forEach(button=>button.onclick=()=>press(button.dataset.key));
  root.addEventListener('keydown',event=>{if(/^[0-9.+\-*/=%]$/.test(event.key)||['Enter','Backspace','Escape'].includes(event.key)){event.preventDefault();press(event.key);}});
}

export function minesweeper(root){
  let size=9,mineCount=10,board=[],mines=new Set(),flags=new Set(),open=new Set(),started=false,finished=false,seconds=0,timer;
  root.innerHTML='<div class="minesweeper"><nav><select aria-label="Difficulty"><option value="9">Beginner</option><option value="16">Intermediate</option></select><button data-new>New game</button></nav><header><span class="mine-digits" data-count>010</span><button data-face aria-label="New game">🙂</button><span class="mine-digits" data-timer>000</span></header><div class="mine-board" role="grid" aria-label="Minesweeper board"></div><p class="mine-status" role="status">Left-click to reveal. Right-click to flag.</p></div>';
  const grid=root.querySelector('.mine-board'),status=root.querySelector('.mine-status'),face=root.querySelector('[data-face]');
  const neighbours=index=>{const x=index%size,y=Math.floor(index/size),result=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if((dx||dy)&&nx>=0&&ny>=0&&nx<size&&ny<size)result.push(ny*size+nx);}return result;};
  function reset(){clearInterval(timer);board=Array(size*size).fill(0);mines=new Set();flags=new Set();open=new Set();started=false;finished=false;seconds=0;face.textContent='🙂';status.textContent='Left-click to reveal. Right-click to flag.';grid.style.gridTemplateColumns=`repeat(${size},22px)`;grid.innerHTML=board.map((_,i)=>`<button role="gridcell" class="mine-cell" data-cell="${i}" aria-label="Covered cell row ${Math.floor(i/size)+1} column ${i%size+1}"></button>`).join('');render();}
  function generate(first){const safe=new Set([first,...neighbours(first)]);while(mines.size<mineCount){const i=Math.floor(Math.random()*size*size);if(!safe.has(i))mines.add(i);}for(const index of mines)for(const next of neighbours(index))board[next]++;timer=setInterval(()=>{seconds=Math.min(999,seconds+1);root.querySelector('[data-timer]').textContent=String(seconds).padStart(3,'0');},1000);started=true;}
  function render(){root.querySelector('[data-count]').textContent=String(Math.max(0,mineCount-flags.size)).padStart(3,'0');root.querySelector('[data-timer]').textContent=String(seconds).padStart(3,'0');grid.querySelectorAll('button').forEach((button,i)=>{button.className='mine-cell';button.textContent='';if(open.has(i)){button.classList.add('revealed');if(mines.has(i)){button.textContent='✹';button.classList.add('mine');}else if(board[i]){button.textContent=board[i];button.dataset.number=board[i];}button.setAttribute('aria-label',mines.has(i)?'Mine':board[i]+' adjacent mines');}else if(flags.has(i)){button.textContent='⚑';button.classList.add('flagged');button.setAttribute('aria-label','Flagged cell');}if(finished&&mines.has(i))button.textContent='✹';});}
  function reveal(index){if(finished||flags.has(index)||open.has(index))return;if(!started)generate(index);if(mines.has(index)){open.add(index);finished=true;clearInterval(timer);face.textContent='😵';status.textContent='Game over. Click the face to try again.';render();return;}
    const queue=[index];while(queue.length){const cell=queue.pop();if(open.has(cell)||flags.has(cell)||mines.has(cell))continue;open.add(cell);if(board[cell]===0)for(const adjacent of neighbours(cell))if(!open.has(adjacent))queue.push(adjacent);}
    if(open.size===size*size-mineCount){finished=true;clearInterval(timer);face.textContent='😎';status.textContent='You found every safe cell!';flags=new Set(mines);}render();
  }
  grid.onclick=event=>{const button=event.target.closest('[data-cell]');if(button)reveal(+button.dataset.cell);};grid.oncontextmenu=event=>{event.preventDefault();const button=event.target.closest('[data-cell]');if(!button||finished)return;const index=+button.dataset.cell;if(open.has(index))return;if(flags.has(index))flags.delete(index);else if(flags.size<mineCount)flags.add(index);render();};face.onclick=reset;root.querySelector('[data-new]').onclick=reset;root.querySelector('select').onchange=event=>{size=+event.target.value;mineCount=size===9?10:40;const frame=root.closest('.app-window');frame.style.width=(size*22+40)+'px';frame.style.height=(size*22+180)+'px';reset();};reset();return()=>clearInterval(timer);
}

export function paint(root){
  let tool='pencil',color='#000000',lineWidth=2,drawing=false,origin=null,snapshot=null;
  const colors=['#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#808040','#004040','#0080ff','#004080','#8000ff','#804000','#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ffff80','#00ff80','#80ffff','#8080ff','#ff0080','#ff8040'];
  root.innerHTML=`<div class="paint-app"><nav><button data-file="new">New</button><button data-file="open">Open…</button><button data-file="save">Save As…</button><button data-undo>Undo</button></nav><div class="paint-workspace"><aside class="paint-tools">${[['select','▧'],['erase','▱'],['fill','▨'],['picker','◢'],['pencil','✎'],['brush','▰'],['line','╱'],['text','A'],['rect','□'],['ellipse','○']].map(([id,label])=>`<button data-tool="${id}" title="${id}" aria-label="${id}" class="${id===tool?'active':''}">${label}</button>`).join('')}<label>Size<input type="range" min="1" max="24" value="2" aria-label="Brush size"></label></aside><div class="paint-canvas-wrap"><canvas width="1000" height="650" aria-label="Drawing canvas" tabindex="0"></canvas></div></div><div class="paint-palette"><label class="current-color"><input type="color" value="#000000" aria-label="Paint color"></label><div>${colors.map(c=>`<button style="background:${c}" data-color="${c}" title="${c}" aria-label="Color ${c}"></button>`).join('')}</div></div><footer>For help, select a tool. <span data-position>0, 0</span></footer><input type="file" accept="image/*" class="hidden"></div>`;
  const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true}),history=[];
  ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
  const remember=()=>{history.push(ctx.getImageData(0,0,canvas.width,canvas.height));if(history.length>8)history.shift();};
  const point=event=>{const box=canvas.getBoundingClientRect();return{x:Math.round((event.clientX-box.left)*canvas.width/box.width),y:Math.round((event.clientY-box.top)*canvas.height/box.height)};};
  function fill(x,y){const image=ctx.getImageData(0,0,canvas.width,canvas.height),pixels=image.data,w=canvas.width,h=canvas.height,first=(y*w+x)*4,target=pixels.slice(first,first+4),replacement=[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16),255];if(target.every((v,i)=>v===replacement[i]))return;const queue=new Int32Array(w*h);let read=0,write=0;const set=index=>{const offset=index*4;if(target.some((v,i)=>pixels[offset+i]!==v))return;replacement.forEach((v,i)=>pixels[offset+i]=v);queue[write++]=index;};set(y*w+x);while(read<write){const index=queue[read++],px=index%w,py=Math.floor(index/w);if(px)set(index-1);if(px<w-1)set(index+1);if(py)set(index-w);if(py<h-1)set(index+w);}ctx.putImageData(image,0,0);}
  canvas.onpointerdown=event=>{if(event.button!==0)return;const p=point(event);if(p.x<0||p.y<0||p.x>=canvas.width||p.y>=canvas.height)return;canvas.setPointerCapture(event.pointerId);origin=p;
    if(tool==='picker'){const pixel=ctx.getImageData(p.x,p.y,1,1).data;color='#'+[...pixel].slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('');root.querySelector('input[type=color]').value=color;return;}
    if(tool==='select')return;
    if(tool==='text'){const text=prompt('Text to place on the canvas:');if(text){remember();ctx.fillStyle=color;ctx.font=Math.max(16,lineWidth*4)+'px Arial';ctx.fillText(text,p.x,p.y);}return;}
    remember();if(tool==='fill'){fill(p.x,p.y);return;}drawing=true;snapshot=ctx.getImageData(0,0,canvas.width,canvas.height);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.strokeStyle=tool==='erase'?'#ffffff':color;ctx.lineWidth=tool==='erase'?lineWidth*4:tool==='brush'?lineWidth*3:lineWidth;ctx.lineTo(p.x+.1,p.y+.1);ctx.stroke();
  };
  canvas.onpointermove=event=>{const p=point(event);root.querySelector('[data-position]').textContent=p.x+', '+p.y;if(!drawing)return;ctx.strokeStyle=tool==='erase'?'#fff':color;if(['line','rect','ellipse'].includes(tool)){ctx.putImageData(snapshot,0,0);ctx.beginPath();if(tool==='line'){ctx.moveTo(origin.x,origin.y);ctx.lineTo(p.x,p.y);}if(tool==='rect')ctx.rect(origin.x,origin.y,p.x-origin.x,p.y-origin.y);if(tool==='ellipse')ctx.ellipse((origin.x+p.x)/2,(origin.y+p.y)/2,Math.abs(p.x-origin.x)/2,Math.abs(p.y-origin.y)/2,0,0,Math.PI*2);ctx.stroke();}else{ctx.lineTo(p.x,p.y);ctx.stroke();}};
  canvas.onpointerup=()=>{drawing=false;snapshot=null;};canvas.onpointercancel=()=>drawing=false;
  root.querySelectorAll('[data-tool]').forEach(button=>button.onclick=()=>{tool=button.dataset.tool;root.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b===button));});root.querySelectorAll('[data-color]').forEach(button=>button.onclick=()=>{color=button.dataset.color;root.querySelector('input[type=color]').value=color;});root.querySelector('input[type=color]').oninput=e=>color=e.target.value;root.querySelector('input[type=range]').oninput=e=>lineWidth=+e.target.value;
  root.querySelector('[data-undo]').onclick=()=>{if(history.length)ctx.putImageData(history.pop(),0,0);};root.querySelector('[data-file=new]').onclick=()=>{remember();ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);};root.querySelector('[data-file=save]').onclick=()=>{const link=document.createElement('a');link.download='Untitled.png';link.href=canvas.toDataURL('image/png');link.click();};const fileInput=root.querySelector('input[type=file]');root.querySelector('[data-file=open]').onclick=()=>fileInput.click();fileInput.onchange=async event=>{const file=event.target.files[0];if(!file)return;try{const bitmap=await createImageBitmap(file);remember();ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,Math.min(bitmap.width,canvas.width),Math.min(bitmap.height,canvas.height));bitmap.close();}catch{}};
}
