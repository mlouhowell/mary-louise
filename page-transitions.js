(function () {
  const page     = document.querySelector('.page');
  const pageTurn = document.querySelector('.page-turn');
  if (!page || !pageTurn) return;

  const FULL    = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
  const TO_BR   = 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)'; // collapse to bottom-right
  const FROM_TL = 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)';                 // start from top-left

  /* ── Enter: unfold from top-left corner ───────────── */
  if (sessionStorage.getItem('pt-enter')) {
    sessionStorage.removeItem('pt-enter');
    page.style.clipPath   = FROM_TL;
    page.style.transition = 'none';

    requestAnimationFrame(() => requestAnimationFrame(() => {
      page.style.transition = 'clip-path 0.32s cubic-bezier(0.2, 0, 0.0, 1)';
      page.style.clipPath   = FULL;

      // Clean up inline styles once settled
      page.addEventListener('transitionend', () => {
        page.style.clipPath   = '';
        page.style.transition = '';
      }, { once: true });
    }));
  }

  /* ── Exit: snap to bottom-right corner ────────────── */
  pageTurn.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.href;

    sessionStorage.setItem('pt-enter', '1');
    page.style.clipPath   = FULL;
    page.style.transition = 'none';

    requestAnimationFrame(() => requestAnimationFrame(() => {
      page.style.transition = 'clip-path 0.22s cubic-bezier(0.4, 0, 1, 0.6)';
      page.style.clipPath   = TO_BR;
      setTimeout(() => { window.location.href = href; }, 230);
    }));
  });
})();
