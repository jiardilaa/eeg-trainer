const Q = [
    { q: '¿Por qué el 10-20 usa porcentajes y no distancias fijas?',
      o: ['Porque es más fácil de recordar', 'Porque se adapta al tamaño de cada cabeza', 'Porque los electrodos vienen en tres tallas'],
      a: 1, why: 'Los porcentajes se calculan sobre las medidas de cada paciente (nasion-inion y preauriculares).' },
    { q: '¿Qué electrodo está al 50 % en ambas cadenas?',
      o: ['Fz', 'Pz', 'Cz'],
      a: 2, why: 'Cz es el vértice: cruce de la cadena sagital y la coronal. Se marca primero.' },
    { q: 'Fpz se ubica a qué porcentaje del nasion hacia el inion:',
      o: ['10 %', '30 %', '50 %'],
      a: 0, why: 'Fpz está al 10 % sobre el nasion; luego Fz 30 %, Cz 50 %, Pz 70 % y Oz 90 %.' },
    { q: 'Los números impares (F3, C3, P3...) corresponden a:',
      o: ['Hemisferio derecho', 'Línea media', 'Hemisferio izquierdo'],
      a: 2, why: 'Impares a la izquierda, pares a la derecha y "z" en la línea media.' },
    { q: 'En la nomenclatura 10-10, T3 se llama:',
      o: ['T7', 'P7', 'T5'],
      a: 0, why: 'T3→T7 y T4→T8. Además T5→P7 y T6→P8.' },
    { q: 'En la nomenclatura 10-10, T6 se llama:',
      o: ['T8', 'P8', 'O2'],
      a: 1, why: 'T6 pasó a llamarse P8 (y T5 pasó a P7).' },
    { q: '¿Cómo se ubica correctamente el inion?',
      o: ['Es el borde más bajo del cabello', 'Se palpa la protuberancia ósea en la base posterior del cráneo', 'Se mide 10 cm sobre la nuca'],
      a: 1, why: 'El borde del cabello varía entre personas; el inion es un punto óseo que se palpa.' },
    { q: 'Fp1 está a qué distancia de Fpz, medida sobre la circunferencia:',
      o: ['5 % a la izquierda', '10 % a la izquierda', '5 % a la derecha'],
      a: 0, why: 'Fp1 está al 5 % a la izquierda de Fpz y Fp2 al 5 % a la derecha.' },
  ];
  
  export function mountQuiz(root) {
    let i = 0, score = 0;
  
    function show() {
      if (i >= Q.length) return end();
      const q = Q[i];
      root.innerHTML = `<p><small>Pregunta ${i + 1} de ${Q.length}</small></p>
        <p><b>${q.q}</b></p>
        ${q.o.map((t, k) => `<button class="opt" data-k="${k}">${t}</button>`).join('')}
        <div id="fb"></div>`;
      root.querySelectorAll('.opt').forEach(b =>
        b.addEventListener('click', () => answer(Number(b.dataset.k))));
    }
  
    function answer(k) {
      const q = Q[i], ok = k === q.a;
      if (ok) score++;
      root.querySelectorAll('.opt').forEach((b, n) => {
        b.disabled = true;
        if (n === q.a) b.classList.add('good');
        else if (n === k) b.classList.add('bad');
      });
      root.querySelector('#fb').innerHTML =
        `<div class="box">${ok ? '✔ Correcto.' : '✖ Incorrecto.'} ${q.why}</div>
         <button class="btn go" id="next">${i + 1 < Q.length ? 'Siguiente' : 'Ver resultado'}</button>`;
      root.querySelector('#next').addEventListener('click', () => { i++; show(); });
    }
  
    function end() {
      const msg = score >= 7 ? 'Excelente: ya puedes pasar a la práctica con fotos.'
                : score >= 5 ? 'Bien. Repasa los módulos 3 y 4 y vuelve a intentarlo.'
                : 'Repasa los módulos 2, 3 y 4 antes de la práctica.';
      root.innerHTML = `<div class="box"><b>Resultado: ${score} / ${Q.length}</b><br>${msg}</div>
        <button class="btn go" id="again">Reintentar</button>`;
      root.querySelector('#again').addEventListener('click', () => { i = 0; score = 0; show(); });
    }
  
    show();
  }