const GUIDES = {
    frontal: `<line x1="50%" y1="0" x2="50%" y2="100%"/><line x1="0" y1="45%" x2="100%" y2="45%"/><ellipse cx="50%" cy="50%" rx="24%" ry="34%"/>`,
    posterior: `<line x1="50%" y1="0" x2="50%" y2="100%"/><line x1="0" y1="45%" x2="100%" y2="45%"/><ellipse cx="50%" cy="50%" rx="24%" ry="34%"/>`,
    izquierda: `<line x1="0" y1="55%" x2="100%" y2="55%"/><line x1="50%" y1="0" x2="50%" y2="100%"/><ellipse cx="50%" cy="50%" rx="30%" ry="34%"/>`,
    derecha: `<line x1="0" y1="55%" x2="100%" y2="55%"/><line x1="50%" y1="0" x2="50%" y2="100%"/><ellipse cx="50%" cy="50%" rx="30%" ry="34%"/>`,
    superior: `<line x1="50%" y1="0" x2="50%" y2="100%"/><line x1="0" y1="50%" x2="100%" y2="50%"/><ellipse cx="50%" cy="50%" rx="30%" ry="34%"/>`,
  };
  const TIPS = {
    frontal: 'Frontal: centra el nasion en la línea vertical y las cejas sobre la línea horizontal.',
    posterior: 'Posterior: centra la nuca en la línea vertical y las orejas a la altura de la horizontal.',
    izquierda: 'Lateral: la línea horizontal une el borde inferior de la órbita con el conducto auditivo (plano de Frankfurt).',
    derecha: 'Lateral: la línea horizontal une el borde inferior de la órbita con el conducto auditivo (plano de Frankfurt).',
    superior: 'Superior: nariz hacia arriba, vértice en el cruce de las líneas.',
  };
  
  export function mountLive(root, photo) {
    root.innerHTML = `
      <div class="box"><b>Cámara en vivo:</b> el video se procesa solo en este dispositivo. La captura no se guarda en la galería. Pide a otra persona que sostenga el celular a 1,5–2 m.</div>
      <button class="btn go" id="on">🎥 Abrir cámara</button>
      <div class="stage" id="stage" hidden>
        <video id="vid" playsinline muted autoplay></video>
        <svg id="guide" aria-hidden="true"></svg>
      </div>
      <p id="tip"></p>
      <label id="zl" hidden>Zoom <input id="zoom" type="range" min="1" max="4" step="0.1" value="1"></label>
      <div class="row" id="ctl" hidden>
        <button class="btn go" id="shot">📸 Capturar</button>
        <button class="btn go" id="flip">🔄 Cambiar cámara</button>
        <button class="btn go" id="off">Cerrar</button>
      </div>
      <p id="msg"></p>`;
  
    const $ = s => root.querySelector(s);
    const vid = $('#vid'), msg = $('#msg');
    let stream = null, facing = 'environment';
  
    function setGuide() {
      const v = photo.getView();
      $('#guide').innerHTML = GUIDES[v];
      $('#tip').textContent = TIPS[v];
    }
    photo.onView(setGuide);
  
    function stop() {
      if (stream) stream.getTracks().forEach(t => t.stop());
      stream = null; vid.srcObject = null;
      $('#stage').hidden = true; $('#ctl').hidden = true; $('#zl').hidden = true;
      $('#on').hidden = false; $('#tip').textContent = '';
    }
  
    async function start() {
      msg.textContent = '';
      if (!window.isSecureContext || !navigator.mediaDevices) {
        msg.textContent = 'La cámara en vivo exige HTTPS o localhost. Usa la versión publicada o el reenvío de puertos por USB.';
        return;
      }
      stop();
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch (err) {
        msg.textContent = err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Actívalo en los ajustes del sitio (candado junto a la dirección).'
          : err.name === 'NotFoundError' ? 'No se encontró ninguna cámara.'
          : 'No se pudo abrir la cámara: ' + err.name;
        return;
      }
      vid.srcObject = stream;
      $('#on').hidden = true; $('#stage').hidden = false; $('#ctl').hidden = false;
      setGuide();
      const track = stream.getVideoTracks()[0];
      const cap = track.getCapabilities ? track.getCapabilities() : {};
      if (cap.zoom) {
        const z = $('#zoom');
        z.min = cap.zoom.min; z.max = cap.zoom.max; z.step = cap.zoom.step || 0.1;
        z.value = Math.min(2, cap.zoom.max);
        track.applyConstraints({ advanced: [{ zoom: Number(z.value) }] }).catch(() => {});
        $('#zl').hidden = false;
      }
    }
  
    $('#zoom').addEventListener('input', e => {
      const t = stream && stream.getVideoTracks()[0];
      if (t) t.applyConstraints({ advanced: [{ zoom: Number(e.target.value) }] }).catch(() => {});
    });
  
    $('#shot').addEventListener('click', () => {
      if (!vid.videoWidth) return;
      const c = document.createElement('canvas');
      c.width = vid.videoWidth; c.height = vid.videoHeight;
      c.getContext('2d').drawImage(vid, 0, 0);
      c.toBlob(b => {
        stop();
        photo.load(b);
        msg.textContent = 'Foto capturada. Marca los puntos de referencia más abajo.';
        document.getElementById('cv').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 'image/jpeg', 0.92);
    });
  
    $('#flip').addEventListener('click', () => {
      facing = facing === 'environment' ? 'user' : 'environment';
      start();
    });
    $('#on').addEventListener('click', start);
    $('#off').addEventListener('click', stop);
  
    window.addEventListener('hashchange', stop, { once: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  }