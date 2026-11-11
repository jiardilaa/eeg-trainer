import { MODULES, GROUPS } from './course.js';

const view = document.getElementById('view');
const titleEl = document.getElementById('title');
const drawer = document.getElementById('drawer');
const backdrop = document.getElementById('backdrop');
const homeBtn = document.querySelector('.home');

function openDrawer() {
  drawer.classList.remove('hidden');
  backdrop.classList.remove('hidden');
}
function closeDrawer() {
  drawer.classList.add('hidden');
  backdrop.classList.add('hidden');
}

homeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (drawer.classList.contains('hidden')) openDrawer();
  else closeDrawer();
});
backdrop.addEventListener('click', closeDrawer);

function renderMenuInDrawer() {
  drawer.innerHTML = `<h2>Contenido</h2>`;
  function addGroup(group, container) {
    const gEl = document.createElement('div');
    gEl.className = 'group';
    gEl.innerHTML = `<h3>${group.title}</h3>`;
    container.appendChild(gEl);
    if (group.modules) {
      group.modules.forEach(mod => {
        const btn = document.createElement('button');
        btn.className = 'menu-item';
        btn.textContent = mod.title;
        btn.onclick = () => {
          location.hash = `#/module/${mod.id}`;
          closeDrawer();
        };
        gEl.appendChild(btn);
      });
    }
    if (group.subgroups) group.subgroups.forEach(sub => addGroup(sub, gEl));
  }
  GROUPS.forEach(g => addGroup(g, drawer));
}

function renderModule(id) {
  const mod = MODULES.find(m => String(m.id) === String(id));
  if (!mod) { view.innerHTML = `<p>Elige un módulo del menú ☰</p>`; return; }
  titleEl.textContent = mod.title;
  view.innerHTML = '';
  const el = document.createElement('section');
  el.className = 'module';
  el.innerHTML = `<h2>${mod.title}</h2>${mod.html || ''}`;
  view.appendChild(el);
  if (mod.mount) {
    try { mod.mount(el); } catch (e) { console.error('Error en mount', mod.id, e); }
  }
}

function router() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/module/')) {
    renderModule(hash.replace('#/module/', ''));
  } else {
    titleEl.textContent = 'EEG 10-20 Trainer';
    view.innerHTML = `<p>Usa el menú ☰ arriba a la izquierda para abrir el contenido.</p>`;
  }
}

renderMenuInDrawer();
window.addEventListener('hashchange', router);
router();