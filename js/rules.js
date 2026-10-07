export const RULES = {
    Fpz: 'Línea media. 10 % de la distancia nasion–inion, medido desde el nasion.',
    Fz:  'Línea media. 30 % desde el nasion.',
    Cz:  'Vértice. 50 % nasion–inion y 50 % entre los preauriculares. Se marca primero: es el cruce de las dos cadenas.',
    Pz:  'Línea media. 70 % desde el nasion (30 % desde el inion).',
    Oz:  'Línea media. 90 % desde el nasion, es decir, 10 % por delante del inion.',
    C3:  'Cadena coronal. 20 % a la izquierda de Cz (30 % desde el preauricular izquierdo).',
    C4:  'Cadena coronal. 20 % a la derecha de Cz (30 % desde el preauricular derecho).',
    T3:  'Cadena coronal. 10 % por encima del preauricular izquierdo. En 10-10 se llama T7.',
    T4:  'Cadena coronal. 10 % por encima del preauricular derecho. En 10-10 se llama T8.',
    Fp1: 'Circunferencia que pasa por Fpz. 5 % de la circunferencia a la izquierda de Fpz.',
    Fp2: 'Circunferencia que pasa por Fpz. 5 % de la circunferencia a la derecha de Fpz.',
    F7:  'Circunferencia. 15 % a la izquierda de Fpz (10 % después de Fp1).',
    F8:  'Circunferencia. 15 % a la derecha de Fpz (10 % después de Fp2).',
    T5:  'Circunferencia. 35 % a la izquierda de Fpz. En 10-10 se llama P7.',
    T6:  'Circunferencia. 35 % a la derecha de Fpz. En 10-10 se llama P8.',
    O1:  'Circunferencia. 45 % a la izquierda de Fpz (5 % antes de Oz).',
    O2:  'Circunferencia. 45 % a la derecha de Fpz (5 % antes de Oz).',
    F3:  'Cadena parasagital Fp1–F3–C3–P3–O1. A mitad de camino entre Fp1 y C3.',
    F4:  'Cadena parasagital Fp2–F4–C4–P4–O2. A mitad de camino entre Fp2 y C4.',
    P3:  'Cadena parasagital Fp1–F3–C3–P3–O1. A mitad de camino entre C3 y O1.',
    P4:  'Cadena parasagital Fp2–F4–C4–P4–O2. A mitad de camino entre C4 y O2.',
  };
  
  const LOBES = { Fp: 'Frontal polar', F: 'Frontal', C: 'Central', T: 'Temporal', P: 'Parietal', O: 'Occipital' };
  
  export function describe(name) {
    const lobe = LOBES[name.match(/^[A-Z][a-z]?(?=[0-9z]|$)/) ? name.replace(/[0-9z]/g, '') : name[0]];
    const last = name.slice(-1);
    const side = last === 'z' ? 'línea media' : (Number(last) % 2 ? 'hemisferio izquierdo' : 'hemisferio derecho');
    return { lobe, side, rule: RULES[name] };
  }