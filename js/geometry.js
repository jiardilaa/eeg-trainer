const D = Math.PI / 180;
// x = derecha, y = frente, z = arriba. az: 0 = frente, +90 = derecha
const sph = (colat, az) => {
  const t = colat * D, a = az * D;
  return [Math.sin(t) * Math.sin(a), Math.sin(t) * Math.cos(a), Math.cos(t)];
};
const slerp = (a, b, t) => {
  const d = Math.min(1, Math.max(-1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2]));
  const w = Math.acos(d), s = Math.sin(w);
  const k1 = Math.sin((1 - t) * w) / s, k2 = Math.sin(t * w) / s;
  return a.map((v, i) => k1 * v + k2 * b[i]);
};

// Cadena sagital y coronal: 36° = 20 % del arco nasion-inion (180°)
const E = {
  Fpz: sph(72, 0),  Fz: sph(36, 0),   Cz: sph(0, 0),   Pz: sph(36, 180), Oz: sph(72, 180),
  C3: sph(36, -90), C4: sph(36, 90),
  // Anillo de circunferencia (colatitud 72°); 5 % del perímetro = 18° de azimut
  Fp1: sph(72, -18), Fp2: sph(72, 18),  F7: sph(72, -54), F8: sph(72, 54),
  T3: sph(72, -90),  T4: sph(72, 90),   T5: sph(72, -126), T6: sph(72, 126),
  O1: sph(72, -162), O2: sph(72, 162),
};
// Cadena parasagital Fp1-F3-C3-P3-O1 equiespaciada (25 % cada tramo)
E.F3 = slerp(E.Fp1, E.C3, 0.5); E.P3 = slerp(E.O1, E.C3, 0.5);
E.F4 = slerp(E.Fp2, E.C4, 0.5); E.P4 = slerp(E.O2, E.C4, 0.5);

// Landmarks anatómicos en el mismo sistema
const LM = { N: [0,1,0], I: [0,-1,0], LPA: [-1,0,0], RPA: [1,0,0], V: [0,0,1] };

// Vistas: proyección ortográfica, dirección de la cámara y landmarks que se piden
const VIEWS = {
  frontal:   { p: v => [v[0], v[2]], dir: [0, 1, 0],  ask: ['LPA','RPA','N','V'] },
  posterior: { p: v => [v[0], v[2]], dir: [0,-1, 0],  ask: ['LPA','RPA','I','V'] },
  izquierda: { p: v => [v[1], v[2]], dir: [-1,0, 0],  ask: ['N','I','LPA','V'] },
  derecha:   { p: v => [v[1], v[2]], dir: [1, 0, 0],  ask: ['N','I','RPA','V'] },
  superior:  { p: v => [v[0], v[1]], dir: [0, 0, 1],  ask: ['N','I','LPA','RPA'] },
};

// Ajuste afín por mínimos cuadrados: [u v 1] -> pixel
function fitAffine(src, dst) {
  const N = [[0,0,0],[0,0,0],[0,0,0]], bx = [0,0,0], by = [0,0,0];
  src.forEach(([u, v], k) => {
    const r = [u, v, 1];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) N[i][j] += r[i] * r[j];
      bx[i] += r[i] * dst[k][0]; by[i] += r[i] * dst[k][1];
    }
  });
  const px = solve3(N, bx), py = solve3(N, by);
  return ([u, v]) => [px[0]*u + px[1]*v + px[2], py[0]*u + py[1]*v + py[2]];
}
function solve3(M, b) {
  const A = M.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < 3; i++) {
    let p = i;
    for (let r = i + 1; r < 3; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]];
    for (let r = i + 1; r < 3; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < 4; c++) A[r][c] -= f * A[i][c];
    }
  }
  const x = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    let s = A[i][3];
    for (let j = i + 1; j < 3; j++) s -= A[i][j] * x[j];
    x[i] = s / A[i][i];
  }
  return x;
}

// Uso: clicks = { LPA:[px,py], RPA:[...], N:[...], V:[...] } tocados por el usuario
function projectElectrodes(viewName, clicks) {
  const { p, dir, ask } = VIEWS[viewName];
  const f = fitAffine(ask.map(k => p(LM[k])), ask.map(k => clicks[k]));
  return Object.entries(E).map(([name, v]) => ({
    name, xy: f(p(v)),
    visible: v[0]*dir[0] + v[1]*dir[1] + v[2]*dir[2] > 0,
  }));
}
export { E, LM, VIEWS, projectElectrodes };