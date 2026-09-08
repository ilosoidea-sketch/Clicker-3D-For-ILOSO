import { initCamera } from './camera.js';
import { initObjectStudio } from './object.js';
import { isSoundEnabled, setSoundEnabled, playClickSound } from './animation.js';
function init() {
  initObjectStudio();
  initCamera();
  document.getElementById('soundToggle').addEventListener('click', event => {
    setSoundEnabled(!isSoundEnabled());
    event.currentTarget.setAttribute('aria-pressed', String(isSoundEnabled()));
    event.currentTarget.textContent = 'Suara: ' + (isSoundEnabled() ? 'aktif' : 'mati');
    if (isSoundEnabled()) playClickSound();
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
