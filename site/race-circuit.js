// Original schematic geometry; approximate layout, not a surveyed circuit map.
export const CIRCUIT_PATH = 'M428 313 L388 296 Q377 291 375 279 L372 237 Q372 206 355 187 L301 142 Q286 130 294 120 L331 98 Q343 82 322 78 Q285 69 265 78 Q259 80 254 89 L150 282 Q139 303 146 318 Q153 335 166 331 L189 327 Q204 325 211 337 Q221 354 207 366 Q200 374 183 370 L132 358 Q89 346 79 309 L36 175 Q31 160 44 147 Q70 122 121 105 L196 81 Q214 76 228 63 Q245 45 267 49 L292 52 Q312 56 328 40 Q343 16 360 18 Q375 19 391 36 Q413 60 450 69 L611 113 L668 135 Q693 146 688 172 Q685 188 667 199 L599 270 Q584 287 589 296 L602 306 Q612 314 606 325 Q590 349 569 356 Q561 360 548 355 L428 313 Z';
export const PIT_LANE_PATH = 'M599 270 L561 331 Q551 346 535 339 L397 281 Q382 268 372 237';
export const PIT_RELEASE_GAP_SECONDS = 7;
export const PIT_TRANSIT_SECONDS = 6;
export const MIN_LAP_SECONDS = 89.337;
export const MAX_LAP_SECONDS = 90.337;
export const BASE_SECTORS = [28.705,36.333,24.299];
// Approximate timing-line locations on the schematic, replace with surveyed fractions if available.
export const SECTOR_ENDS = [0.30,0.67,1];
let motionProfile=null;
// User-supplied corner-speed references (km/h), mapped by corner number to our schematic.
// These guide relative animation speed only; sector clocks determine simulated duration.
export const CORNER_SPEED_REFERENCES = [
  {corner:1,x:375,y:279,kph:290},{corner:2,x:372,y:237,kph:290},
  {corner:3,x:294,y:120,kph:120},{corner:4,x:331,y:98,kph:100},
  {corner:5,x:265,y:78,kph:245},{corner:6,x:146,y:318,kph:180},
  {corner:7,x:207,y:366,kph:125},{corner:8,x:79,y:309,kph:280},
  {corner:9,x:36,y:175,kph:290},{corner:10,x:228,y:63,kph:310},
  {corner:11,x:267,y:49,kph:300},{corner:12,x:292,y:52,kph:275},
  {corner:13,x:360,y:18,kph:230},{corner:14,x:450,y:69,kph:265},
  {corner:15,x:688,y:172,kph:250},{corner:16,x:589,y:296,kph:110},
  {corner:17,x:606,y:325,kph:130},{corner:18,x:561,y:356,kph:225}
];
// Precompute distance-to-time tables once; all movement still follows the SVG path.
export function buildMotionProfile(path, sampledGeometry) {
  const length=path.getTotalLength(),count=384;
  const point=d=>path.getPointAtLength((d%length+length)%length);
  const geometry=sampledGeometry||Array.from({length:count},(_,i)=>point(i/count*length));
  const corners=CORNER_SPEED_REFERENCES.map(c=>{let nearest=0,best=Infinity;geometry.forEach((p,i)=>{const distance=Math.hypot(p.x-c.x,p.y-c.y);if(distance<best){best=distance;nearest=i;}});return {at:nearest/count,speed:c.kph};}).sort((a,b)=>a.at-b.at);
  const anchors=[];
  corners.forEach((c,i)=>{const next=corners[(i+1)%corners.length],end=next.at+(i===corners.length-1?1:0),gap=end-c.at;anchors.push(c);
    // An illustrative acceleration peak on longer links, not a claimed speed trap value.
    if(gap>0.045)anchors.push({at:((c.at+end)/2)%1,speed:Math.min(330,Math.max(c.speed,next.speed)+35)});
  });anchors.sort((a,b)=>a.at-b.at);
  const speeds=Array.from({length:count},(_,i)=>{
    const at=i/count;let upper=anchors.findIndex(a=>a.at>at);if(upper<0)upper=0;
    const a=anchors[(upper-1+anchors.length)%anchors.length],b=anchors[upper];
    const end=b.at+(b.at<=a.at?1:0),position=at+(at<a.at?1:0),p=(position-a.at)/(end-a.at),ease=p*p*(3-2*p);
    return (a.speed+(b.speed-a.speed)*ease)/330;
  });
  // Braking begins before a bend; acceleration builds gradually after it.
  const smooth=speeds.map((_,i)=>{let sum=0;for(let j=-8;j<=12;j++)sum+=speeds[(i+j+count)%count];return sum/21;});
  let start=0;
  return SECTOR_ENDS.map(end=>{
    const table=[{distance:start,time:0}];let total=0;
    const steps=Math.ceil((end-start)*count);
    for(let j=1;j<=steps;j++){
      const distance=start+(end-start)*j/steps,mid=distance-(end-start)/steps/2;
      total+=(end-start)/steps/smooth[Math.floor(mid*count)%count];table.push({distance,time:total});
    }
    table.forEach(p=>p.time/=total);start=end;return table;
  });
}
export function setMotionProfile(profile){motionProfile=profile;}
export function progressAtTime(elapsed,sectors) {
  let start=0;
  for(let i=0;i<3;i++){
    if(elapsed<=sectors[i]){
      const p=Math.max(0,elapsed/sectors[i]),table=motionProfile?.[i];
      if(!table)return start+(SECTOR_ENDS[i]-start)*p;
      let lo=0,hi=table.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(table[mid].time<p)lo=mid;else hi=mid;}
      const a=table[lo],b=table[hi],fraction=(p-a.time)/(b.time-a.time||1);
      return a.distance+(b.distance-a.distance)*fraction;
    }
    elapsed-=sectors[i];start=SECTOR_ENDS[i];
  }
  return 1;
}
function timeAtProgress(progress,sectors){let lo=0,hi=sectors.reduce((a,b)=>a+b,0);for(let i=0;i<40;i++){const mid=(lo+hi)/2;if(progressAtTime(mid,sectors)<progress)lo=mid;else hi=mid;}return (lo+hi)/2;}
let timingSnapshot={active:false,drivers:[]};
export function getTimingSnapshot(){return timingSnapshot;}
export class SimulatedDriver {
  constructor(name, phase=0, random=Math.random) { this.name=name; this.random=random; this.lap=1; this.last=null; this.duration=this.nextDuration(); this.sectors=this.split(this.duration); this.lastSectors=null;this.bestSectors=[null,null,null];this.bestLap=null; this.elapsed=phase*this.duration; }
  split(duration){const extra=Math.round((duration-MIN_LAP_SECONDS)*1000),a=Math.round(extra*0.31),b=Math.round(extra*0.40);return [BASE_SECTORS[0]+a/1000,BASE_SECTORS[1]+b/1000,BASE_SECTORS[2]+(extra-a-b)/1000];}
  nextDuration() { return Math.round((MIN_LAP_SECONDS + Math.min(1,Math.max(0,this.random())) * (MAX_LAP_SECONDS-MIN_LAP_SECONDS))*1000)/1000; }
  recordSectors(){let boundary=0;this.sectors.forEach((value,i)=>{boundary+=value;if(this.elapsed+1e-9>=boundary)this.bestSectors[i]=Math.min(this.bestSectors[i]??Infinity,value);});}
  advance(seconds) {
    let remaining=Math.max(0,seconds);
    do {const step=Math.min(remaining,this.duration-this.elapsed);this.elapsed+=step;remaining-=step;this.recordSectors();
      if(this.elapsed+1e-9>=this.duration){this.last=this.duration;this.lastSectors=[...this.sectors];this.bestLap=Math.min(this.bestLap??Infinity,this.duration);this.elapsed=0;this.lap++;this.duration=this.nextDuration();this.sectors=this.split(this.duration);}
    }while(remaining>1e-9);
  }
  get progress() {return progressAtTime(this.elapsed,this.sectors);}
}
export class PitEntryDriver {
  constructor(name, delay, joinProgress, start=0.4) {
    this.racer=new SimulatedDriver(name);this.name=name;this.delay=delay;
    this.joinProgress=joinProgress;this.start=start;this.clock=0;this.stage='waiting';this.pitProgress=start;
    this.outlapRemaining=this.racer.duration-timeAtProgress(joinProgress,this.racer.sectors);
  }
  advance(seconds) {
    let remaining=Math.max(0,seconds);
    if(this.clock<this.delay){const used=Math.min(remaining,this.delay-this.clock);this.clock+=used;remaining-=used;}
    if(this.clock<this.delay)return;
    if(this.clock<this.delay+PIT_TRANSIT_SECONDS){
      this.stage='pit';const used=Math.min(remaining,this.delay+PIT_TRANSIT_SECONDS-this.clock);this.clock+=used;remaining-=used;
      this.pitProgress=this.start+(1-this.start)*(this.clock-this.delay)/PIT_TRANSIT_SECONDS;
      if(this.clock<this.delay+PIT_TRANSIT_SECONDS)return;
    }
    if(this.stage!=='racing'){
      this.stage='outlap';const used=Math.min(remaining,this.outlapRemaining);this.outlapRemaining-=used;remaining-=used;
      if(this.outlapRemaining>0)return;
      this.stage='racing';
    }
    this.racer.advance(remaining);
  }
  get progress(){return this.stage==='outlap'?progressAtTime(this.racer.duration-this.outlapRemaining,this.racer.sectors):this.racer.progress;}
}
export async function mountCircuit() {
  const panel=document.createElement('aside'); panel.id='race-circuit'; panel.setAttribute('aria-label','Decorative racing simulation');
  panel.innerHTML=`<header><strong>Silverstone</strong><span>SIMULATION</span></header><svg viewBox="0 0 720 410" role="img" aria-label="Approximate Silverstone circuit minimap with Norris and Piastri"><path class="circuit-edge" d="${CIRCUIT_PATH}"/><path class="circuit-road" d="${CIRCUIT_PATH}"/><path class="pit-lane" d="${PIT_LANE_PATH}"/><path class="finish-line" d="M423 322 L433 304"/><g class="driver"><circle r="9"/><text>NOR</text></g><g class="driver"><circle r="9"/><text>PIA</text></g></svg><div class="race-times"></div><footer>Decorative simulation · Approximate circuit · Not live data</footer>`;
  document.body.append(panel);
  const path=panel.querySelector('.circuit-road'),length=path.getTotalLength();
  const sampleCount=384;
  const geometry=[];
  for(let i=0;i<sampleCount;i++){
    geometry.push(path.getPointAtLength(i/sampleCount*length));
    // Yield between small batches so the activation transition and input remain responsive.
    if(i%24===23)await new Promise(resolve=>setTimeout(resolve,0));
  }
  function sampledPoint(fraction){const index=((fraction%1+1)%1)*sampleCount,i=Math.floor(index),a=geometry[i],b=geometry[(i+1)%sampleCount],t=index-i;return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
  setMotionProfile(buildMotionProfile(path,geometry));
  const sectorColors=['#ff997a','#73d5ff','#ffe078'];
  SECTOR_ENDS.forEach((end,index)=>{const start=index?SECTOR_ENDS[index-1]:0;const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('d',Array.from({length:101},(_,j)=>{const p=sampledPoint(start+(end-start)*j/100);return(j?'L':'M')+p.x+' '+p.y;}).join(' '));line.setAttribute('stroke',sectorColors[index]);line.setAttribute('stroke-width','3');panel.querySelector('svg').insertBefore(line,panel.querySelector('.finish-line'));});
  const timingButton=document.createElement('button');timingButton.className='race-timing-open';timingButton.textContent='Sector timing';timingButton.onclick=async()=>{await(await import('./desktop.js')).openApp('timing');};panel.append(timingButton);
  const pit=panel.querySelector('.pit-lane'),pitLength=pit.getTotalLength();
  // Join the main circuit exactly at the pit exit, in the circuit's direction.
  const exit=pit.getPointAtLength(pitLength);let nearest=0,best=Infinity;
  geometry.forEach((p,i)=>{const distance=Math.hypot(p.x-exit.x,p.y-exit.y);if(distance<best){best=distance;nearest=i;}});
  let low=Math.max(0,(nearest-1)/sampleCount),high=Math.min(1,(nearest+1)/sampleCount);
  const distanceAt=f=>{const p=path.getPointAtLength(f*length);return Math.hypot(p.x-exit.x,p.y-exit.y);};
  for(let i=0;i<12;i++){const a=low+(high-low)/3,b=high-(high-low)/3;if(distanceAt(a)<distanceAt(b))high=b;else low=a;}
  const joinProgress=(low+high)/2;
  let drivers;
  function resetDrivers(){drivers=[new PitEntryDriver('NOR',1,joinProgress,0.46),new PitEntryDriver('PIA',1+PIT_RELEASE_GAP_SECONDS,joinProgress,0.40)];}
  resetDrivers();
  const groups=[...panel.querySelectorAll('.driver')];
  const driverNodes=groups.map(group=>({group,circle:group.querySelector('circle'),text:group.querySelector('text')}));
  const times=panel.querySelector('.race-times');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,last=0,visible=false,queued=0,wasActive=false,lastTiming=0;
  function draw() {
    if(panel.classList.contains('visible'))drivers.forEach((driver,i)=>{
      const inPit=motion.matches||['waiting','pit'].includes(driver.stage);
      const p=inPit?pit.getPointAtLength((motion.matches?driver.start:driver.pitProgress)*pitLength):path.getPointAtLength(driver.progress*length);
      driverNodes[i].group.dataset.stage=motion.matches?'waiting':driver.stage;
      const label={x:p.x-18,y:p.y};
      driverNodes[i].circle.setAttribute('cx',p.x);driverNodes[i].circle.setAttribute('cy',p.y);
      const text=driverNodes[i].text;text.setAttribute('text-anchor','end');text.style.textAnchor='end';text.setAttribute('x',label.x);text.setAttribute('y',label.y);
    });
    const timing=drivers.map(d=>{const r=d.racer;return `${d.name} ${motion.matches||d.stage==='waiting'?'in pits':d.stage==='pit'?'pit exit':d.stage==='outlap'?'out lap':`L${r.lap} ${format(r.last??r.duration)}${r.last?' last':' target'}`}`;}).join(' · ');
    if(times.textContent!==timing)times.textContent=timing;
    if(!lastTiming||performance.now()-lastTiming>=100){lastTiming=performance.now();
      timingSnapshot={active:document.documentElement.dataset.raceTheme==='active',reduced:motion.matches,drivers:drivers.map(d=>({name:d.name,stage:motion.matches?'waiting':d.stage,lap:d.racer.lap,elapsed:d.racer.elapsed,sectors:[...d.racer.sectors],lastSectors:d.racer.lastSectors,last:d.racer.last,bestSectors:[...d.racer.bestSectors],bestLap:d.racer.bestLap,target:d.racer.duration}))};
      window.dispatchEvent(new CustomEvent('race-timing',{detail:timingSnapshot}));
    }
  }
  function format(seconds){return '1:'+ (seconds-60).toFixed(3).padStart(6,'0');}
  function tick(now){frame=0;if(!visible||motion.matches)return;if(last)drivers.forEach(d=>d.advance((now-last)/1000));last=now;draw();frame=requestAnimationFrame(tick);}
  function refresh(){
    queued=0;
    const active=document.documentElement.dataset.raceTheme==='active';
    lastTiming=0;
    if(active&&!wasActive)resetDrivers();wasActive=active;
    const desktop=document.querySelector('#desktop');
    let show=document.documentElement.dataset.raceTheme==='active'&&!document.hidden&&innerWidth>=600&&desktop&&!desktop.classList.contains('hidden');
    if(show){const a=panel.getBoundingClientRect();show=![...document.querySelectorAll('.app-window,#start-menu,#context-menu,.tray-popup,.hidden-tray,.messenger-toast,.modal-shade,.desktop-icon')].some(el=>{
      if(el.closest('#race-circuit'))return false;
      const style=getComputedStyle(el);if(style.display==='none'||style.visibility==='hidden'||!el.getClientRects().length)return false;
      const b=el.getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    });}
    panel.classList.toggle('visible',Boolean(show));
    const timingWindow=document.querySelector('.app-window[data-app="timing"]');
    const timingVisible=timingWindow&&getComputedStyle(timingWindow).display!=='none'&&desktop&&!desktop.classList.contains('hidden');
    visible=Boolean((show||timingVisible)&&active&&!document.hidden);
    if(!visible||motion.matches){cancelAnimationFrame(frame);frame=0;last=0;}else if(!frame){last=0;frame=requestAnimationFrame(tick);}
    draw();
  }
  function schedule(){if(!queued)queued=requestAnimationFrame(refresh);}
  const observer=new MutationObserver(records=>{if(records.some(r=>!panel.contains(r.target)&&!(r.target instanceof Element&&r.target.closest('.window-content'))))schedule();});
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','data-minimized']});
  addEventListener('resize',schedule);document.addEventListener('visibilitychange',refresh);motion.addEventListener('change',refresh);sheetReady();
  function sheetReady(){document.querySelector('link[href$="race-theme.css"]')?.addEventListener('load',refresh,{once:true});}
  draw(); return {refresh};
}
