import { E } from './geometry.js';

const R = 170, RING = R * 72 / 90;
const NAMES = { N: 'Nasion', I: 'Inion', LPA: 'LPA', RPA: 'RPA' };
const P = { N: [0, -R], I: [0, R], LPA: [-R, 0], RPA: [R, 0] };

function toXY([x, y, z]) {
  const colat = Math.acos(Math.max(-1, Math.min(1, z)));
  const az = Math.atan2(x, y);
  const r = (colat / (Math.PI / 2)) * R;
  return [r * Math.sin(az), -r * Math.cos(az)];
}
const pt = k => P[k] || toXY(E[k]);
const nm = k => NAMES[k] || k;
const f = n => n.toFixed(1);
const txt = (x, y, s) => `<text class="dist" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${s}</text>`;

const CHAINS = [
  { id: 'sag', base: 'ni', title: 'Cadena sagital (nasion → inion)',
    segs: [['N','Fpz',10],['Fpz','Fz',20],['Fz','Cz',20],['Cz','Pz',20],['Pz','Oz',20],['Oz','I',10]] },
  { id: 'cor', base: 'pa', title: 'Cadena coronal (preauricular → preauricular)',
    segs: [['LPA','T3',10],['T3','C3',20],['C3','Cz',20],['Cz','C4',20],['C4','T4',20],['T4','RPA',10]] },
  { id: 'cl', base: 'ci', title: 'Circunferencia (igual en ambos lados, desde Fpz)', sweep: 0,
    az: [-9, -36, -72, -108, -144, -171],
    segs: [['Fpz','Fp1',5],['Fp1','F7',10],['F7','T3',10],['T3','T5',10],['T5','O1',10],['O1','Oz',5]] },
  { id: 'cr', base: 'ci', sweep: 1, noTable: true,
    az: [9, 36, 72, 108, 144, 171],
    segs: [['Fpz','Fp2',5],['Fp2','F8',10],['F8','T4',10],['T4','T6',10],['T6','O2',10],['O2','Oz',5]] },
];

const FIELDS = [
  { id: 'ni', label: 'Distancia nasion–inion', min: 20, max: 50,
    hint: 'Cinta flexible sobre el cuero cabelludo, por la línea media, del nasion al inion pasando por el vértice. En adultos suele ser de unos 32 a 40 cm.' },
  { id: 'pa', label: 'Distancia entre preauriculares', min: 20, max: 50,
    hint: 'Cinta sobre la cabeza, de un punto preauricular al otro pasando por el vértice. En adultos suele ser de unos 32 a 40 cm.' },
  { id: 'ci', label: 'Circunferencia de la cabeza', min: 35, max: 70,
    hint: 'Cinta alrededor de la cabeza, a la altura de Fpz y Oz: sobre las cejas y por encima del inion. En adultos suele ser de unos 52 a 60 cm.' },
];

export function mountMeasure(root) {
  root.innerHTML = `
    <div class="box"><b>Cómo medir:</b> con cinta métrica flexible sobre el cuero cabelludo (no en línea recta). Palpa el nasion y el inion antes de medir.</div>
    ${FIELDS.map(fl => `
      <div class="fld">
        <div class="fh"><label for="m-${fl.id}">${fl.label}</label>
          <button type="button" class="q" data-h="h-${fl.id}" aria-label="Ayuda">?</button></div>
        <p class="hint" id="h-${fl.id}" hidden>${fl.hint}</p>
        <div class="inp"><input id="m-${fl.id}" inputmode="decimal" placeholder="0.0" autocomplete="off"><span>cm</span></div>
      </div>`).join('')}
    <p class="err" id="err"></p>
    <div class="row">
      <button class="btn go" id="calc">Calcular distancias</button>
      <button class="btn go" id="clear">Limpiar</button>
    </div>
    <div id="out"></div>`;

  const err = root.querySelector('#err'), out = root.querySelector('#out');

  root.querySelectorAll('.q').forEach(b => b.addEventListener('click', () => {
    const h = root.querySelector('#' + b.dataset.h);
    h.hidden = !h.hidden;
  }));

  function calc() {
    const v = {};
    for (const fl of FIELDS) {
      v[fl.id] = parseFloat(root.querySelector('#m-' + fl.id).value.replace(',', '.'));
      if (!(v[fl.id] >= fl.min && v[fl.id] <= fl.max)) {
        err.textContent = `${fl.label}: escribe un valor entre ${fl.min} y ${fl.max} cm.`;
        out.innerHTML = '';
        return;
      }
    }
    err.textContent = '';
    render(v);
  }

  function render(v) {
    const lines = [], labels = [], tables = [];
    CHAINS.forEach(ch => {
      const rows = ch.segs.map(([a, b, pct], i) => {
        const cm = pct / 100 * v[ch.base];
        const [x1, y1] = pt(a), [x2, y2] = pt(b);
        if (ch.az) {
          lines.push(`<path class="seg" d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${RING} ${RING} 0 0 ${ch.sweep} ${x2.toFixed(1)} ${y2.toFixed(1)}"/>`);
          const t = ch.az[i] * Math.PI / 180;
          labels.push(txt(190 * Math.sin(t), -190 * Math.cos(t) + 4, f(cm)));
        } else {
          lines.push(`<line class="seg" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`);
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          labels.push(ch.id === 'sag' ? txt(mx + 28, my + 4, f(cm)) : txt(mx, my - 20, f(cm)));
        }
        return `<tr><td>${nm(a)} – ${nm(b)}</td><td>${pct} %</td><td><b>${f(cm)}</b></td></tr>`;
      }).join('');
      if (!ch.noTable)
        tables.push(`<h3>${ch.title}</h3><table class="tbl"><tr><th>Tramo</th><th>%</th><th>cm</th></tr>${rows}</table>`);
    });

    const els = Object.keys(E).map(n => {
      const [x, y] = toXY(E[n]);
      return `<g class="el static"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}">${n}</text></g>`;
    }).join('');

    out.innerHTML = `
      <div class="box">Datos: nasion–inion <b>${f(v.ni)}</b> cm · preauriculares <b>${f(v.pa)}</b> cm · circunferencia <b>${f(v.ci)}</b> cm. Los datos no se guardan.</div>
      <svg viewBox="-215 -232 430 466" role="img" aria-label="Distancias en centímetros entre electrodos vecinos del sistema 10-20">
        <polygon class="outline" points="-18,-167 0,-198 18,-167"/>
        <ellipse class="outline" cx="-175" cy="0" rx="8" ry="26"/>
        <ellipse class="outline" cx="175" cy="0" rx="8" ry="26"/>
        <circle class="outline" cx="0" cy="0" r="${R}"/>
        <circle class="guide" cx="0" cy="0" r="${RING}"/>
        ${lines.join('')}${els}${labels.join('')}
        <text class="lm" x="0" y="-208">NASION</text>
        <text class="lm" x="0" y="224">INION</text>
        <text class="lm" x="-198" y="4">LPA</text>
        <text class="lm" x="198" y="4">RPA</text>
      </svg>
      <p><small>Distancias en cm sobre el cuero cabelludo. Esquema sin escala. Uso educativo.</small></p>
      ${tables.join('')}`;
  }

  root.querySelector('#calc').addEventListener('click', calc);
  root.querySelectorAll('input').forEach(i =>
    i.addEventListener('keydown', e => { if (e.key === 'Enter') calc(); }));
  root.querySelector('#clear').addEventListener('click', () => {
    root.querySelectorAll('input').forEach(i => { i.value = ''; });
    err.textContent = ''; out.innerHTML = '';
  });
}