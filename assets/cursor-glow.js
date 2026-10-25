/* Tiny cursor light: directly centered on the pointer, no trailing offset. */
(() => {
  'use strict';
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reducedMotion.matches) return;

  let frame = 0;
  let x = -100, y = -100;
  let showing = false;

  function position() {
    // The second translate centers the element, so no fixed radius is needed.
    glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    frame = 0;
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    x = event.clientX;
    y = event.clientY;
    if (!showing) {
      glow.classList.add('is-visible');
      showing = true;
    }
    if (!frame) frame = requestAnimationFrame(position);
  }, { passive: true });

  function hide() {
    glow.classList.remove('is-visible');
    showing = false;
  }
  document.addEventListener('mouseout', event => {
    if (!event.relatedTarget) hide();
  });
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hide();
  });
})();
