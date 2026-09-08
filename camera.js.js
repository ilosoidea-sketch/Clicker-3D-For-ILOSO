export function initCamera() {
  const keychainRoot = document.getElementById("keychainRoot");
  const viewportStage = document.getElementById("viewportStage");
  const resetBtn = document.getElementById("resetCamBtn");

  let rotX = 15, rotY = -25;
  let isDragging = false, startX, startY;

  function handleStart(e) {
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX; startY = clientY;
  }

  function handleMove(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startX; const dy = clientY - startY;
    rotY += dx * 0.55; rotX -= dy * 0.45;
    rotX = Math.max(-75, Math.min(75, rotX));
    keychainRoot.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    startX = clientX; startY = clientY;
  }

  function handleEnd() { isDragging = false; }

  viewportStage.addEventListener("mousedown", handleStart);
  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleEnd);
  viewportStage.addEventListener("touchstart", handleStart, { passive: true });
  viewportStage.addEventListener("touchmove", handleMove, { passive: true });
  viewportStage.addEventListener("touchend", handleEnd);

  resetBtn.addEventListener("click", () => {
    rotX = 15; rotY = -25;
    keychainRoot.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });
}