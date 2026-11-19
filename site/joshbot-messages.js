// One tab-local conversation log for replies AND application notifications.
export const CHAT_KEY='nzjosh.chat.v2';
export const actions={resume:['My Resume','resume'],certificates:['Certificates & Awards','achievements'],personal:['Pictures','gallery'],contact:['Contact Me','contact'],games:['Minesweeper','minesweeper'],about:['About Me','about']};
export function readMessages(){try{return JSON.parse(sessionStorage.getItem(CHAT_KEY)||'[]').filter(x=>['user','assistant'].includes(x.role)&&typeof x.text==='string').slice(-100);}catch{return [];}}
export function actionFor(text){const value=String(text).toLowerCase();if(/r[eé]sum[eé]|cv\b/.test(value))return 'resume';if(/certificat|award/.test(value))return 'certificates';if(/photo|album|picture/.test(value))return 'personal';if(/contact|touch|message josh/.test(value))return 'contact';if(/game|minesweeper/.test(value))return 'games';return 'about';}
export function appendMessage(entry){const message={...entry,id:entry.id||crypto.randomUUID(),time:entry.time||Date.now()};const history=readMessages();if(!history.some(x=>x.id===message.id)){history.push(message);try{sessionStorage.setItem(CHAT_KEY,JSON.stringify(history.slice(-100)));}catch{}document.dispatchEvent(new CustomEvent('joshbot:message',{detail:message}));}return message;}
export function clearMessages(){try{sessionStorage.removeItem(CHAT_KEY);}catch{}}
