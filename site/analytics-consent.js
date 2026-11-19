// Basic consent mode: do not contact Google at all before an explicit opt-in.
// Set your own GA4 measurement ID only in your configured deployment.
const ID = '';
const KEY = 'nzjosh-analytics-consent-v1';
const allowedApps = new Set(['computer','about','resume','contact','messenger','minesweeper','solitaire','pinball','paint','notepad','calculator','display','credits','cmd']);
let accepted = false, loaded = false, panel, previousFocus;
const readChoice = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const remember = value => { try { localStorage.setItem(KEY, value); } catch {} };
function safePage() {
  const path = ['/about/','/privacy/'].includes(location.pathname) ? location.pathname : '/';
  return {page_location: location.origin + path, page_title: 'NZJOSH XP', page_referrer: ''};
}
function command() { window.dataLayer.push(arguments); }
function event(name, parameters = {}) {
  if (accepted) command('event', name, {...safePage(), ...parameters});
}
function enable() {
  if (!ID) return; // The public template never sends analytics by default.
  if (accepted) return;
  accepted = true;
  window['ga-disable-' + ID] = false;
  if (!loaded) {
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    command('consent', 'default', {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    command('js', new Date());
    command('consent', 'update', {analytics_storage:'granted'});
    command('config', ID, {...safePage(), send_page_view:false, allow_google_signals:false, allow_ad_personalization_signals:false, cookie_expires:5184000, cookie_update:false});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    script.id = 'nzjosh-google-analytics';
    document.head.append(script);
  } else command('consent', 'update', {analytics_storage:'granted'});
  event('page_view');
}
function removeCookies() {
  for (const entry of document.cookie.split(';')) {
    const name = entry.split('=')[0].trim();
    if (!/^_ga(?:_|$)/.test(name)) continue;
    for (const domain of ['', location.hostname, '.' + location.hostname]) {
      document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
    }
  }
}
function choose(value) {
  remember(value);
  if (value === 'accepted') enable();
  else {
    accepted = false;
    window['ga-disable-' + ID] = true;
    removeCookies();
    // Reload on withdrawal to discard the already-loaded Google script entirely.
    if (loaded) { location.reload(); return; }
  }
  close();
}
function close() {
  panel?.remove(); panel = null;
  if (previousFocus?.isConnected) previousFocus.focus();
}
function show() {
  if (panel) { panel.querySelector('[data-choice="accepted"]').focus(); return; }
  previousFocus = document.activeElement;
  panel = document.createElement('section');
  panel.className = 'app-window analytics-consent';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-labelledby','analytics-title');
  panel.setAttribute('aria-describedby','analytics-description');
  panel.innerHTML = `<header class="analytics-title"><strong id="analytics-title">Privacy preferences</strong><button type="button" aria-label="Close privacy preferences">×</button></header><div class="analytics-body"><p id="analytics-description">Allow Google Analytics cookies to measure visits and app usage? Google receives basic browser, device and approximate location information.</p><p>No messages, photos or personal profile content. No advertising features.</p><p><a href="/privacy/">Privacy details</a> · Change your choice in the tray menu.</p><p class="analytics-current"></p><div class="analytics-actions"><button type="button" data-choice="declined">No thanks</button><button type="button" data-choice="accepted">Allow analytics</button></div></div>`;
  panel.querySelector('.analytics-current').textContent = 'Current choice: ' + (readChoice() === 'accepted' ? 'allowed' : readChoice() === 'declined' ? 'declined' : 'not chosen');
  panel.addEventListener('pointerdown', e => e.stopPropagation());
  panel.addEventListener('click', e => {
    e.stopPropagation();
    const value = e.target.closest('[data-choice]')?.dataset.choice;
    if (value) choose(value);
    else if (e.target.closest('[aria-label="Close privacy preferences"]')) close();
  });
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
  document.body.append(panel);
  panel.querySelector('[data-choice="accepted"]').focus();
}
const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/analytics-consent.css'; document.head.append(css);
const preferences = document.createElement('button');
preferences.type = 'button'; preferences.textContent = 'Analytics preferences'; preferences.className = 'analytics-preferences';
preferences.addEventListener('click', show);
(document.querySelector('#hidden-tray') || document.querySelector('footer') || document.body).append(preferences);
const tray = document.querySelector('#hidden-tray');
if (tray) {
  const updateTrayState = () => {
    const expanded = !tray.classList.contains('hidden');
    document.querySelector('#tray-chevron')?.setAttribute('aria-expanded', String(expanded));
    const toggle = tray.querySelector('#joshbot-notifications-toggle');
    if (toggle) toggle.setAttribute('aria-pressed', String(/:\s*On\s*$/i.test(toggle.textContent)));
  };
  new MutationObserver(updateTrayState).observe(tray, {attributes:true, attributeFilter:['class'], childList:true, subtree:true, characterData:true});
  updateTrayState();
}
if (readChoice() === 'accepted') enable();
else if (!readChoice()) {
  // Watch actual login visibility; never show this during boot or login.
  const desktop = document.querySelector('main#desktop');
  if (desktop) {
    const afterLogin = () => {
      if (desktop.classList.contains('hidden')) return;
      loginObserver.disconnect();
      if (!readChoice()) show();
    };
    const loginObserver = new MutationObserver(afterLogin);
    loginObserver.observe(desktop, {attributes:true, attributeFilter:['class']});
    afterLogin();
  }
}
// Track only whitelisted app identifiers, never window titles or user content.
const windows = document.querySelector('#windows');
if (windows) new MutationObserver(records => {
  for (const record of records) for (const node of record.addedNodes) {
    if (node.nodeType === 1 && node.matches('.app-window[data-app]') && allowedApps.has(node.dataset.app)) event('app_open', {app_name:node.dataset.app});
  }
}).observe(windows,{childList:true});
window.addEventListener('storage', e => {
  if (e.key !== KEY) return;
  if (e.newValue === 'accepted') enable();
  else { accepted = false; window['ga-disable-' + ID] = true; removeCookies(); if (loaded) location.reload(); }
});
