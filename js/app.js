import { MODULES } from './course.js';

const view = document.getElementById('view');
const title = document.getElementById('title');

function home() {
    title.textContent = 'EEG 10-20 Trainer';
    view.innerHTML = '<h2>Micro curso</h2>' + MODULES.map(m =>
      `<a class="card" href="#/m/${m.id}">${m.id}. ${m.title}</a>`).join('') +
      '<a class="card" href="#/about">Acerca de esta app<small>Referencias, privacidad y límites</small></a>';
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

function about() {
    title.textContent = 'Acerca de';
    view.innerHTML = `
      <h2>Acerca de esta app</h2>
      <p>Micro curso para aprender a ubicar los electrodos del sistema 10-20 de EEG, con una práctica sobre fotos. <b>Uso educativo: no es un dispositivo médico ni sustituye la medición con cinta sobre el paciente.</b></p>
      <h3>Privacidad</h3>
      <p>No hay cuentas, servidor, analítica ni cookies. Las fotos y el video se procesan solo en tu dispositivo y la app no los guarda. Solo se descarga una imagen si pulsas "Descargar PNG".</p>
      <h3>Límites</h3>
      <p>La cabeza se modela como una esfera, así que las posiciones sobre la foto son aproximadas. Pueden variar con la inclinación de la cabeza, la distancia de la cámara y los puntos que marques.</p>
      <h3>Referencias</h3>
      <ul class="refs">
        <li>Klem GH, Lüders HO, Jasper HH, Elger C. (1999). The ten-twenty electrode system of the International Federation. <i>Electroencephalogr Clin Neurophysiol Suppl</i>, 52, 3–6.</li>
        <li>American Clinical Neurophysiology Society. Guideline 1: Minimum Technical Requirements for Performing Clinical EEG.</li>
        <li>American Clinical Neurophysiology Society. Guideline 5: Guidelines for Standard Electrode Position Nomenclature.</li>
        <li>Nuwer MR et al. (1998). IFCN guidelines for topographic and frequency analysis of EEGs and EPs. <i>Electroencephalogr Clin Neurophysiol</i>, 106(4), 259–261. (Contexto: reproducibilidad en EEG cuantitativo.)</li>
      </ul>
      <p><small>Consulta siempre la versión vigente de las guías ACNS.</small></p>
      <p><small>Autor: COGNITEK/ UPN MTIAE</small></p>
      <div class="nav"><a class="btn" href="#/">← Inicio</a></div>`;
    window.scrollTo(0, 0);
  }

  function route() {
    if (location.hash === '#/about') return about();
    const hit = location.hash.match(/^#\/m\/(\d+)$/);
    hit ? module(Number(hit[1])) : home();
  }
  
  window.addEventListener('hashchange', route);
  route();
  
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }