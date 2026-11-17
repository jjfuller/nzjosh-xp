import('./desktop-racer.js').then(module=>{const install=()=>module.installDesktopRacer();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();}).catch(()=>{});
import {mountCircuit} from './race-circuit.js';
const THEME_TRIGGER = String.fromCharCode(112,97,112,97,121,97);
const THEME_RESET = String.fromCharCode(99,108,97,115,115,105,99);
const STORAGE_KEY = 'nzjosh.appearance';
const sheet = document.createElement('link');
sheet.rel = 'stylesheet'; sheet.href = new URL('./race-theme.css', import.meta.url).href;
document.head.append(sheet);
let circuit;
let pendingCircuit;
let countdown=null;
let prepareCircuit=()=>{};
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function cancelCountdown(){if(countdown){clearInterval(countdown.timer);countdown=null;}document.getElementById('race-start-lights')?.remove();}
function completeCountdown(){cancelCountdown();setAppearance(true);}
function startLights(){
  if(reducedMotion.matches){setAppearance(true);return;}
  const lights=document.createElement('div');lights.id='race-start-lights';lights.setAttribute('aria-hidden','true');
  lights.innerHTML='<div class="race-gantry"></div><div class="race-light-columns">'+Array.from({length:5},()=>'<div class="race-light-column"><i></i><i></i></div>').join('')+'</div>';document.body.append(lights);
  const columns=[...lights.querySelectorAll('.race-light-column')],started=performance.now();
  const update=()=>{const elapsed=performance.now()-started;if(elapsed>=5000){completeCountdown();return;}columns.forEach((column,index)=>column.classList.toggle('lit',index<=Math.floor(elapsed/1000)));};
  countdown={timer:setInterval(update,25)};update();prepareCircuit();
}
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches&&countdown)completeCountdown();});
function setAppearance(active) {
  if (active) document.documentElement.dataset.raceTheme = 'active';
  else delete document.documentElement.dataset.raceTheme;
  if(!active){cancelCountdown();document.querySelector('.app-window[data-app="timing"] [data-action="close"]')?.click();}
  try { if (active) localStorage.setItem(STORAGE_KEY,'pit-wall'); else localStorage.removeItem(STORAGE_KEY); } catch {}
  circuit?.refresh();
}
try { if (localStorage.getItem(STORAGE_KEY) === 'pit-wall') document.documentElement.dataset.raceTheme = 'active'; } catch {}
function mount() {
  const desktop=document.getElementById('desktop');
  if(!desktop)return;
  function ensureCircuit(preparing=false){
    if(!circuit&&!pendingCircuit&&(preparing===true||document.documentElement.dataset.raceTheme==='active')&&!desktop.classList.contains('hidden')){
      pendingCircuit=mountCircuit().then(instance=>{circuit=instance;circuit.refresh();}).catch(()=>{document.getElementById('race-circuit')?.remove();}).finally(()=>{pendingCircuit=null;});
    }
    circuit?.refresh();
  }
  prepareCircuit=()=>ensureCircuit(true);
  new MutationObserver(()=>ensureCircuit()).observe(desktop,{attributes:true,attributeFilter:['class']});
  new MutationObserver(()=>ensureCircuit()).observe(document.documentElement,{attributes:true,attributeFilter:['data-race-theme']});
  ensureCircuit();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
export function handleAppearanceCommand(raw) {
  const parts = raw.toLowerCase().split(/\s+/);
  if (![THEME_TRIGGER,THEME_RESET].includes(parts[0])) return null;
  if (parts.length !== 1) return 'Command is not recognized. Type HELP for commands.';
  const active = document.documentElement.dataset.raceTheme === 'active';
  if (parts[0] === THEME_TRIGGER) {
    if(active)return 'Pit-wall theme is already active.';
    if(countdown)return 'Start sequence is already in progress.';
    startLights();
    return reducedMotion.matches?'Box this lap. Pit-wall theme engaged.':'Stand by. Five-second start sequence initiated.';
  }
  setAppearance(false);
  return 'Standard desktop restored.';
}
