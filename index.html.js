import { initCamera } from './camera.js';
import { initObjectStudio } from './object.js';

document.addEventListener("DOMContentLoaded", () => {
  initCamera();
  initObjectStudio();
});