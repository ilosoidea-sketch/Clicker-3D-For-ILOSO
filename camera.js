export function initCamera() {
  const root = document.getElementById('keychainRoot');
  const stage = document.getElementById('viewportStage');
  const fit = document.getElementById('modelFit');
  let rotX = -12, rotY = -22;
  let drag = null;
  const render = () => { root.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`; };
  function resize() {
    // Reserve room for ring, charm, perspective, hint and bottom controls.
    const diagonal = Math.hypot(root.offsetWidth + 65, root.offsetHeight + 20);
    const scale = Math.min(1.65, Math.max(0.25, (stage.clientHeight - 160) / diagonal), (stage.clientWidth - 90) / diagonal);
    fit.style.setProperty('--model-scale', scale);
  }
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || event.target.closest('button, input, a')) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
    stage.style.cursor = 'grabbing';
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    rotY = (rotY + (event.clientX - drag.x) * 0.5) % 360;
    rotX = Math.max(-65, Math.min(65, rotX - (event.clientY - drag.y) * 0.4));
    drag.x = event.clientX; drag.y = event.clientY;
    render();
  });
  function end() { drag = null; stage.style.cursor = ''; }
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('lostpointercapture', end);
  document.getElementById('resetCamBtn').addEventListener('click', () => { rotX = -12; rotY = -22; render(); });
  const observer = new ResizeObserver(resize);
  observer.observe(stage); observer.observe(root);
  render(); resize();
}
