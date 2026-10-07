import { mountTopView } from './topview.js';import { mountQuiz } from './quiz.js';import { mountPhoto } from './photo.js';
export const MODULES = [
    {
      id: 1,
      title: '¿Por qué estandarizar?',
      html: `
        <p>Si dos técnicos colocan los electrodos en sitios distintos, los registros no son comparables, ni entre sesiones ni entre laboratorios.</p>
        <p>El <b>Sistema Internacional 10-20</b> (Klem et al., 1999) define posiciones a partir de <b>proporciones</b> de la cabeza de cada persona, no de distancias fijas. Así se adapta a cabezas grandes y pequeñas.</p>
        <div class="box">Idea clave: 10 % y 20 % son porcentajes de la distancia nasion-inion y de la circunferencia de cada paciente.</div>
        <p>Beneficios: reproducibilidad, comparación con la literatura y correlación entre posición y corteza subyacente.</p>`
    },
    {
      id: 2,
      title: 'Puntos de referencia',
      html: `
        <svg viewBox="0 0 300 220" role="img" aria-label="Vista lateral de la cabeza con puntos de referencia">
          <path class="outline" d="M60 150 C40 80 90 30 160 30 C230 30 260 90 245 150 C240 175 215 190 190 190 L120 190 C90 190 65 175 60 150 Z"/>
          <circle class="pt" cx="248" cy="105" r="6"/><text class="lbl" x="205" y="100">Nasion</text>
          <circle class="pt" cx="52" cy="125" r="6"/><text class="lbl" x="62" y="120">Inion</text>
          <circle class="pt" cx="150" cy="140" r="6"/><text class="lbl" x="158" y="145">Preauricular</text>
        </svg>
        <p><b>Nasion:</b> depresión entre la frente y el puente de la nariz.</p>
        <p><b>Inion:</b> protuberancia ósea en la base posterior del cráneo, que se palpa subiendo desde la nuca.</p>
        <p><b>Puntos preauriculares (LPA / RPA):</b> depresión justo delante del trago, a ambos lados.</p>
        <div class="box">Error típico: confundir el inion con la parte más baja del cabello. Siempre se palpa.</div>`
    },
    {
        id: 3,
        title: 'El sistema 10-20',
        html: `
          <p>Se parte de dos cadenas que se cruzan en el vértice (<b>Cz</b>):</p>
          <p><b>1. Sagital (nasion → inion):</b> Fpz 10 %, Fz 30 %, Cz 50 %, Pz 70 %, Oz 90 %.</p>
          <p><b>2. Coronal (preauricular → preauricular):</b> T3 10 %, C3 30 %, Cz 50 %, C4 70 %, T4 90 %.</p>
          <p><b>3. Circunferencia</b> por Fpz, T3/T4 y Oz: Fp1 5 %, F7 15 %, T3 25 %, T5 35 %, O1 45 % (y lo mismo a la derecha).</p>
          <p><b>4. Cadena parasagital</b> Fp1–F3–C3–P3–O1, con los tramos iguales.</p>
          <div id="topview"></div>
          <div class="box">Vista desde arriba: la nariz apunta hacia arriba. Impares a la izquierda, pares a la derecha, "z" en la línea media.</div>`,
        mount: root => mountTopView(root.querySelector('#topview')),
      },
      {
        id: 4,
        title: 'Nomenclatura',
        html: `
          <p><b>Letras:</b> indican la región. <b>Fp</b> frontopolar, <b>F</b> frontal, <b>C</b> central, <b>T</b> temporal, <b>P</b> parietal, <b>O</b> occipital.</p>
          <p><b>Números:</b> impares a la izquierda, pares a la derecha. Cuanto mayor el número, más lejos de la línea media. La <b>z</b> marca la línea media.</p>
          <p><b>Equivalencias 10-20 → 10-10</b> (la nomenclatura actual recomendada por la ACNS):</p>
          <table class="tbl">
            <tr><th>10-20 clásico</th><th>10-10</th></tr>
            <tr><td>T3</td><td>T7</td></tr>
            <tr><td>T4</td><td>T8</td></tr>
            <tr><td>T5</td><td>P7</td></tr>
            <tr><td>T6</td><td>P8</td></tr>
          </table>
          <div class="box">Las posiciones físicas no cambian, solo el nombre. Es frecuente encontrar ambos nombres en equipos y artículos. Confirma el detalle en la ACNS Guideline 5 vigente.</div>`
      },
      {
        id: 5,
        title: 'Errores comunes y quiz',
        html: `
          <p><b>Errores frecuentes:</b></p>
          <p>• Usar el borde del cabello en vez de palpar el inion.<br>
          • Medir con la cinta floja o sobre el cabello suelto.<br>
          • Marcar Cz sin comprobar que el punto sea el 50 % en ambas direcciones.<br>
          • Confundir izquierda y derecha: son las del paciente.<br>
          • Cinta torcida o fuera del plano nasion–inion.</p>
          <div id="quiz"></div>`,
        mount: root => mountQuiz(root.querySelector('#quiz')),
      },
      {
        id: 6,
        title: 'Práctica con fotos',
        html: `
          <p>Elige una vista, toma la foto y marca los puntos de referencia que te pida la app. Luego se dibujan los 21 electrodos sobre la foto. Los que quedan al otro lado de la cabeza se ven atenuados.</p>
          <div id="photo"></div>`,
        mount: root => mountPhoto(root.querySelector('#photo')),
      },
      {
        id: 7,
        title: 'Cámara en vivo',
        html: `
          <p>Elige la vista, abre la cámara y encuadra con la guía. Al capturar, la foto pasa directamente a la práctica de abajo.</p>
          <div id="live"></div>
          <div id="photo"></div>`,
        mount: root => {
          const photo = mountPhoto(root.querySelector('#photo'));
          mountLive(root.querySelector('#live'), photo);
        },
      },
  ];