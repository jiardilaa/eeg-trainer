import { E } from './geometry.js';
import { describe } from './rules.js';

const R = 170; // radio de la cabeza (colatitud 90°) en unidades del SVG

function toXY([x, y, z]) {
  const colat = Math.acos(Math.max(-1, Math.min(1, z)));
  const az = Math.atan2(x, y);
  const r = (colat / (Math.PI / 2)) * R;
  return [r * Math.sin(az), -r * Math.cos(az)];
}

export function mountTopView(root) {
  const els = Object.keys(E).map(name => {
    const [x, y] = toXY(E[name]);
    return `<g class="el" data-name="${name}">
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16"/>
      <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}">${name}</text></g>`;
  }).join('');

  root.innerHTML = `
    <svg viewBox="-205 -205 410 410" role="img" aria-label="Vista superior de la cabeza con los electrodos del sistema 10-20">
      <polygon class="outline" points="-18,-167 0,-198 18,-167"/>
      <ellipse class="outline" cx="-175" cy="0" rx="8" ry="26"/>
      <ellipse class="outline" cx="175" cy="0" rx="8" ry="26"/>
      <circle class="outline" cx="0" cy="0" r="${R}"/>
      <circle class="guide" cx="0" cy="0" r="${R * 72 / 90}"/>
      <line class="guide" x1="0" y1="${-R}" x2="0" y2="${R}"/>
      <line class="guide" x1="${-R}" y1="0" x2="${R}" y2="0"/>
      ${els}
    </svg>
    <div id="info" class="box">Toca un electrodo para ver su regla de medición.</div>`;

  const info = root.querySelector('#info');
  root.querySelector('svg').addEventListener('click', e => {
    const g = e.target.closest('.el');
    if (!g) return;
    root.querySelectorAll('.el.sel').forEach(n => n.classList.remove('sel'));
    g.classList.add('sel');
    const n = g.dataset.name, d = describe(n);
    info.innerHTML = `<b>${n}</b> · ${d.lobe} · ${d.side}<br>${d.rule}`;
  });
}