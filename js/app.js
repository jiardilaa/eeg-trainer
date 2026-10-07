import { MODULES } from './course.js';

const view = document.getElementById('view');
const title = document.getElementById('title');

function home() {
  title.textContent = 'EEG 10-20 Trainer';
  view.innerHTML = '<h2>Micro curso</h2>' + MODULES.map(m =>
    `<a class="card" href="#/m/${m.id}">${m.id}. ${m.title}</a>`).join('');
}

function module(id) {
  const i = MODULES.findIndex(m => m.id === id);
  if (i < 0) return home();
  const m = MODULES[i], prev = MODULES[i - 1], next = MODULES[i + 1];
  title.textContent = `Módulo ${m.id}`;
  view.innerHTML = `<h2>${m.title}</h2>${m.html}
    <div class="nav">
      <a class="btn ${prev ? '' : 'off'}" href="#/m/${prev ? prev.id : m.id}">← Anterior</a>
      <a class="btn ${next ? '' : 'off'}" href="#/m/${next ? next.id : m.id}">Siguiente →</a>
    </div>`;
    if (m.mount) m.mount(view);
  window.scrollTo(0, 0);
}
function route() {
    const hit = location.hash.match(/^#\/m\/(\d+)$/);
    hit ? module(Number(hit[1])) : home();
  }
  
  window.addEventListener('hashchange', route);
  route();
  
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }