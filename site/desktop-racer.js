// Local decorative racer. Distances are in screen pixels, durations in milliseconds.
export const RACER_SETTINGS={minDelayMs:20000,maxDelayMs:45000,raceMinDelayMs:8000,raceMaxDelayMs:16000,targetPixelsPerSecond:750,minFastPassMs:900,maxFastPassMs:2800,slowPassMs:7000};
export function delayBounds(settings,racing){return racing?[settings.raceMinDelayMs??8000,settings.raceMaxDelayMs??16000]:[settings.minDelayMs,settings.maxDelayMs];}
export function carWidthForViewport(width){return Math.max(124,Math.min(164,width*.18));}
export function passDuration(viewportWidth,carWidth,settings=RACER_SETTINGS,speedFactor=1){
  const ms=(viewportWidth+carWidth)/(settings.targetPixelsPerSecond*speedFactor)*1000;
  return Math.max(settings.minFastPassMs,Math.min(settings.maxFastPassMs,ms));
}
export function distanceProgress(t){
  t=Math.max(0,Math.min(1,t));const a=.18,b=.86,c=.14,integral=x=>x*x*x-.5*x*x*x*x;
  const distance=t<a?.25*t+.75*a*integral(t/a):t<b?.625*a+t-a:.625*a+b-a+c*((t-b)/c-.25*integral((t-b)/c));
  return distance/.915;
}
const trayIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 64" aria-hidden="true"><path fill="currentColor" d="M4 29C31 10 62 1 79 3C96 5 96 17 84 30C74 41 60 51 47 57C61 41 66 29 54 24C43 19 22 23 4 29Z"/><path class="racer-off" d="M12 6 84 58" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>';
const car="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"62 141 614 159\" aria-hidden=\"true\"><defs><clipPath id=\"racer-photo-outline\"><path d=\"M66 206 103 200 80 190 104 193 111 188 129 188 129 200 143 209 179 215 204 208 250 190 311 181 312 176 324 173 329 184 332 210 366 204 394 201 420 202 439 219 490 228 517 222 524 213 539 211 551 217 562 228 588 241 630 249 654 267 668 274 678 278 664 284 601 285 581 282 575 292 523 297 178 298 157 294 103 291 89 276 76 265 70 252Z\"/><circle cx=\"135\" cy=\"257\" r=\"42\"/><circle cx=\"545\" cy=\"257\" r=\"42\"/></clipPath><clipPath id=\"racer-photo-wheel\"><circle r=\"41\"/></clipPath></defs><ellipse cx=\"367\" cy=\"298\" rx=\"303\" ry=\"2\" fill=\"#000\" opacity=\".16\"/><g class=\"racer-trail\" fill=\"none\" stroke=\"#d9cfba\" opacity=\".15\"><path d=\"M25 292H70M40 296H75\"/></g><g class=\"racer-body\"><image href=\"/racer-car-transparent.png\" width=\"735\" height=\"490\"/></g><g data-wheel=\"rear\" transform=\"translate(135 257)\"><g class=\"racer-wheel-spin\" clip-path=\"url(#racer-photo-wheel)\"><g class=\"racer-spokes\"><image href=\"/racer-car-transparent.png\" x=\"-135\" y=\"-257\" width=\"735\" height=\"490\"/></g><g class=\"racer-wheel-blur\" opacity=\"0\"><circle r=\"41\" fill=\"#14171a\"/><circle r=\"32\" fill=\"#333c42\" stroke=\"#bdc5c7\" stroke-width=\"2\"/><circle r=\"20\" fill=\"#afc33b\"/><circle r=\"15\" fill=\"#203943\"/><circle r=\"9\" fill=\"#bfca31\"/></g></g></g><g data-wheel=\"front\" transform=\"translate(545 257)\"><g class=\"racer-wheel-spin\" clip-path=\"url(#racer-photo-wheel)\"><g class=\"racer-spokes\"><image href=\"/racer-car-transparent.png\" x=\"-545\" y=\"-257\" width=\"735\" height=\"490\"/></g><g class=\"racer-wheel-blur\" opacity=\"0\"><circle r=\"41\" fill=\"#14171a\"/><circle r=\"32\" fill=\"#333c42\" stroke=\"#bdc5c7\" stroke-width=\"2\"/><circle r=\"20\" fill=\"#afc33b\"/><circle r=\"15\" fill=\"#203943\"/><circle r=\"9\" fill=\"#bfca31\"/></g></g></g></svg>";
export function installDesktopRacer(settings=RACER_SETTINGS){
  const desktop=document.getElementById('desktop'),bar=desktop?.querySelector('.taskbar'),tray=desktop?.querySelector('.system-tray');
  if(!desktop||!bar||!tray||document.getElementById('desktop-racer-toggle'))return;
  const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('./desktop-racer.css',import.meta.url).href;document.head.append(sheet);
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),key='nzjosh.desktop-racer';let choice=null;
  try{choice=localStorage.getItem(key);}catch{}
  let enabled=choice==='on'||(choice!=='off'&&!motion.matches),timer=0,frame=0,deadline=0,remaining=null,run=null,nextDirection=1,runner=null,ground=30,carWidth=164,lastAvailability=false,photoRequested=false,lastTheme=null;
  const button=document.createElement('button');button.id='desktop-racer-toggle';button.type='button';button.innerHTML=trayIcon;tray.insertBefore(button,tray.querySelector('time'));
  const layer=document.createElement('div');layer.id='desktop-racer-layer';layer.setAttribute('aria-hidden','true');desktop.append(layer);
  function measure(){
    ground=innerHeight-bar.getBoundingClientRect().top;carWidth=carWidthForViewport(innerWidth);
    if(runner){runner.style.bottom=ground+'px';runner.style.width=carWidth+'px';runner.style.height=carWidth*159/614+'px';}
    if(run&&run.viewportWidth!==innerWidth){
      const remainingDistance=Math.max(0,run.direction===1?innerWidth-run.x:run.x+carWidth);
      const fullDistance=innerWidth+carWidth;
      const fullDuration=run.slow?settings.slowPassMs:passDuration(innerWidth,carWidth,settings,run.speedFactor);
      run.startX=run.x;run.travelDistance=remainingDistance;run.duration=Math.max(1,fullDuration*remainingDistance/fullDistance);
      run.elapsed=0;run.last=0;run.lastDistance=0;run.viewportWidth=innerWidth;
    }
  }
  function desktopVisible(){return !desktop.classList.contains('hidden');}
  function allowed(){return enabled&&desktopVisible()&&!document.hidden;}
  function updateButton(){const label='Race car: '+(enabled?'on':'off');button.title=label;button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(enabled));button.classList.toggle('available',desktopVisible());button.tabIndex=desktopVisible()?0:-1;}
  function stop(clearRun=true){clearTimeout(timer);cancelAnimationFrame(frame);timer=frame=0;if(clearRun){run=null;runner?.remove();runner=null;remaining=null;layer.dataset.phase='idle';}else if(run)run.last=0;}
  function schedule(){if(!allowed()||timer||frame||run)return;if(!photoRequested){photoRequested=true;const image=new Image();image.src=new URL('./racer-car-transparent.png',import.meta.url).href;}const [min,max]=delayBounds(settings,document.documentElement.dataset.raceTheme==='active');const delay=remaining??(min+Math.random()*(max-min));remaining=null;deadline=performance.now()+delay;layer.dataset.phase='waiting';timer=setTimeout(()=>{timer=0;startRun();},delay);}
  function startRun(){if(!allowed())return;measure();runner=document.createElement('div');runner.className='desktop-racer';runner.innerHTML='<div class="racer-facing">'+car+'</div>';layer.append(runner);measure();const direction=nextDirection;nextDirection*=-1;runner.querySelector('.racer-facing').style.transform=direction===1?'none':'scaleX(-1)';const speedFactor=.94+Math.random()*.12;run={direction,speedFactor,viewportWidth:innerWidth,startX:direction===1?-carWidth:innerWidth,x:direction===1?-carWidth:innerWidth,travelDistance:innerWidth+carWidth,angle:0,elapsed:0,last:0,lastDistance:0,duration:motion.matches?settings.slowPassMs:passDuration(innerWidth,carWidth,settings,speedFactor),slow:motion.matches,wheels:[...runner.querySelectorAll('.racer-wheel-spin')],spokes:[...runner.querySelectorAll('.racer-spokes')],discs:[...runner.querySelectorAll('.racer-wheel-blur')],body:runner.querySelector('.racer-body'),trail:runner.querySelector('.racer-trail')};layer.dataset.phase='running';draw(0);frame=requestAnimationFrame(tick);}
  function draw(delta){const t=Math.min(1,run.elapsed/run.duration),distance=run.travelDistance*distanceProgress(t),radius=43*carWidth/614,rotationStep=Math.abs(distance-run.lastDistance)/radius*180/Math.PI,angle=run.angle+rotationStep,x=run.startX+run.direction*distance;run.angle=angle;run.x=x;
    runner.style.transform=`translateX(${x}px)`;for(const w of run.wheels)w.style.transform=`rotate(${angle}deg)`;const blurred=!run.slow&&delta>0&&rotationStep>45;run.spokes.forEach(s=>s.style.opacity=blurred?'0':'1');run.discs.forEach(s=>s.style.opacity=blurred?'.75':'0');run.body.style.transform=run.slow?'none':`translateY(${Math.sin(distance/13)*.35}px)`;run.trail.style.opacity=run.slow?'0':String(.10+.09*Math.sin(Math.PI*t));run.trail.style.transform=`scaleX(${.7+.3*Math.sin(Math.PI*t)})`;run.lastDistance=distance;
  }
  function tick(now){frame=0;if(!allowed()||!run)return;const delta=run.last?now-run.last:0;run.last=now;run.elapsed+=delta;draw(delta);if(run.elapsed>=run.duration){runner.remove();runner=null;run=null;layer.dataset.phase='idle';schedule();}else frame=requestAnimationFrame(tick);}
  function reconcile(){const racing=document.documentElement.dataset.raceTheme==='active';if(lastTheme!==null&&lastTheme!==racing&&!run){clearTimeout(timer);timer=0;remaining=null;}lastTheme=racing;updateButton();const visible=desktopVisible();if(!enabled||!visible){stop();lastAvailability=visible;return;}if(document.hidden){if(timer)remaining=Math.max(0,deadline-performance.now());stop(false);return;}if(!lastAvailability)remaining=null;lastAvailability=visible;if(run&&!frame){run.last=0;frame=requestAnimationFrame(tick);}else schedule();}
  button.onclick=()=>{enabled=!enabled;choice=enabled?'on':'off';try{localStorage.setItem(key,choice);}catch{}stop();reconcile();};
  const changeMotion=()=>{if(choice!=='on')enabled=choice!=='off'&&!motion.matches;stop();reconcile();};motion.addEventListener('change',changeMotion);
  const observer=new MutationObserver(reconcile);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-race-theme']});observer.observe(desktop,{attributes:true,attributeFilter:['class']});const resizeObserver=new ResizeObserver(measure);resizeObserver.observe(bar);addEventListener('resize',measure);addEventListener('orientationchange',measure);document.addEventListener('visibilitychange',reconcile);measure();reconcile();
  return()=>{stop();observer.disconnect();resizeObserver.disconnect();motion.removeEventListener('change',changeMotion);removeEventListener('resize',measure);removeEventListener('orientationchange',measure);document.removeEventListener('visibilitychange',reconcile);button.remove();layer.remove();sheet.remove();};
}
