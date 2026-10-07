import { VIEWS, projectElectrodes } from './geometry.js';

const VIEW_NAMES = { frontal: 'Frontal', izquierda: 'Lateral izq.', derecha: 'Lateral der.', posterior: 'Posterior', superior: 'Superior' };
const LM_TEXT = { N: 'el NASION', I: 'el INION', LPA: 'el preauricular IZQUIERDO (LPA)', RPA: 'el preauricular DERECHO (RPA)', V: 'el VÉRTICE (punto más alto de la cabeza)' };
const MAX = 1000; // lado mayor de la imagen en memoria (px)

export function mountPhoto(root, opts = {}) {
  root.innerHTML = `
    <div class="box"><b>Protocolo:</b> cámara a la altura de la cabeza, a 1,5–2 m, con zoom 2×. Cabello aplastado o con gorro, orejas y nasion visibles, cabeza recta.</div>
    <div class="views">${Object.entries(VIEW_NAMES).map(([k, n]) =>
      `<button class="chip" data-v="${k}">${n}</button>`).join('')}</div>
    <div class="row">
      <label class="btn go">📷 Tomar foto<input id="cam" type="file" accept="image/*" capture="environment" hidden></label>
      <label class="btn go">🖼 Galería<input id="gal" type="file" accept="image/*" hidden></label>
    </div>
    <p id="step"></p>
    <canvas id="cv" width="300" height="300"></canvas>
    <div class="row">
      <button class="btn go" id="undo">Deshacer punto</button>
      <button class="btn go" id="save">Descargar PNG</button>
    </div>
    <div class="box">La foto se procesa solo en este dispositivo y no se guarda en la app. Los electrodos son una aproximación sobre una esfera: no reemplazan la medición con cinta sobre el paciente.</div>`;

  const cv = root.querySelector('#cv'), ctx = cv.getContext('2d');
  const step = root.querySelector('#step');
  if (opts.hideCapture) root.querySelector('#cam').closest('label').hidden = true;
  let view = 'frontal', bg = null, clicks = {}, over = {}, drag = null, res = null;
  const viewListeners = [];

  const ask = () => VIEWS[view].ask;
  const nextLM = () => ask().find(k => !clicks[k]);
  const R = () => cv.width / 30;

  function setStep() {
    const n = nextLM();
    step.innerHTML = !bg ? `Vista <b>${VIEW_NAMES[view]}</b>: toma o elige una foto.`
      : n ? `Toca ${LM_TEXT[n]} (${ask().indexOf(n) + 1} de ${ask().length}).`
      : 'Arrastra cualquier punto para corregirlo. Los cuadrados azules son los puntos de referencia.';
  }

  function draw(forExport = false) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (bg) ctx.drawImage(bg, 0, 0);
    else { ctx.fillStyle = '#222'; ctx.fillRect(0, 0, cv.width, cv.height); }
    res = null;
    if (bg && !nextLM()) {
      res = projectElectrodes(view, clicks).map(e => ({ ...e, xy: over[e.name] || e.xy }));
      const r = R();
      ctx.font = `bold ${Math.round(r * 0.85)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      res.forEach(e => {
        ctx.globalAlpha = e.visible ? 1 : 0.25;
        ctx.beginPath(); ctx.arc(e.xy[0], e.xy[1], r, 0, 7);
        ctx.fillStyle = 'rgba(20,30,50,.75)'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = '#ffb703'; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.fillText(e.name, e.xy[0], e.xy[1]);
      });
      ctx.globalAlpha = 1;
    }
    if (!forExport) {
      Object.entries(clicks).forEach(([k, [x, y]]) => {
        const s = R() * 0.55;
        ctx.strokeStyle = '#7cc4ff'; ctx.lineWidth = 4;
        ctx.strokeRect(x - s, y - s, 2 * s, 2 * s);
        ctx.fillStyle = '#7cc4ff'; ctx.font = `bold ${Math.round(R() * 0.8)}px sans-serif`;
        ctx.textAlign = 'left'; ctx.fillText(k, x + s + 4, y - s);
      });
    } else {
      ctx.font = `${Math.round(R() * 0.7)}px sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, cv.width, R() * 1.2);
      ctx.fillStyle = '#fff'; ctx.fillText('Uso educativo, aproximación 10-20. No es un dispositivo médico.', 8, 4);
    }
    setStep();
  }

  function reset() { clicks = {}; over = {}; drag = null; draw(); }

  function load(file) {
    if (!file) return;
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      bg = document.createElement('canvas');
      bg.width = Math.round(img.naturalWidth * k); bg.height = Math.round(img.naturalHeight * k);
      bg.getContext('2d').drawImage(img, 0, 0, bg.width, bg.height);
      cv.width = bg.width; cv.height = bg.height;
      URL.revokeObjectURL(url);
      reset();
    };
    img.onerror = () => { URL.revokeObjectURL(url); step.textContent = 'No se pudo abrir la imagen.'; };
    img.src = url;
  }

  const pos = e => {
    const b = cv.getBoundingClientRect();
    return [(e.clientX - b.left) * cv.width / b.width, (e.clientY - b.top) * cv.height / b.height];
  };
  const near = (a, b, d) => Math.hypot(a[0] - b[0], a[1] - b[1]) < d;

  cv.addEventListener('pointerdown', e => {
    if (!bg) return;
    const p = pos(e), n = nextLM();
    if (n) { clicks[n] = p; draw(); return; }
    const hitL = Object.keys(clicks).find(k => near(clicks[k], p, R() * 1.2));
    const hitE = res.find(x => near(x.xy, p, R() * 1.3));
    if (hitL) drag = { t: 'L', k: hitL };
    else if (hitE) drag = { t: 'E', k: hitE.name };
    if (drag) cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    const p = pos(e);
    if (drag.t === 'L') { clicks[drag.k] = p; over = {}; } else over[drag.k] = p;
    draw();
  });
  const stop = () => { drag = null; };
  cv.addEventListener('pointerup', stop);
  cv.addEventListener('pointercancel', stop);

  root.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => {
    view = b.dataset.v;
    viewListeners.forEach(f => f(view));
    root.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b));
    reset();
  }));
  root.querySelector('.chip').classList.add('on');
  root.querySelector('#cam').addEventListener('change', e => load(e.target.files[0]));
  root.querySelector('#gal').addEventListener('change', e => load(e.target.files[0]));
  root.querySelector('#undo').addEventListener('click', () => {
    const last = [...ask()].reverse().find(k => clicks[k]);
    if (last) { delete clicks[last]; over = {}; draw(); }
  });
  root.querySelector('#save').addEventListener('click', () => {
    if (!bg || nextLM()) { step.textContent = 'Primero marca todos los puntos de referencia.'; return; }
    draw(true);
    cv.toBlob(b => {
      const u = URL.createObjectURL(b), a = document.createElement('a');
      a.href = u; a.download = `eeg-10-20-${view}.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(u), 2000);
      draw();
    }, 'image/png');
  });

  draw();
  return { load, getView: () => view, onView: f => viewListeners.push(f) };
}