(function () {
  const page     = document.querySelector('.page');
  const pageTurn = document.querySelector('.page-turn');
  if (!page || !pageTurn) return;

  /* ── Enter: drift in from top-left ──────────────────── */
  if (sessionStorage.getItem('pt-enter')) {
    sessionStorage.removeItem('pt-enter');
    page.style.transition = 'none';
    page.style.opacity    = '0';
    page.style.transform  = 'translate(-16px, -16px)';

    requestAnimationFrame(() => requestAnimationFrame(() => {
      page.style.transition = 'opacity 0.28s ease, transform 0.28s cubic-bezier(0.2, 0, 0, 1)';
      page.style.opacity    = '';
      page.style.transform  = '';

      page.addEventListener('transitionend', () => {
        page.style.transition = '';
        page.style.transform  = '';
        page.style.opacity    = '';
      }, { once: true });
    }));
  }

  /* ── Exit: drift out toward bottom-right ────────────── */
  pageTurn.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.href;

    sessionStorage.setItem('pt-enter', '1');
    page.style.transition = 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 1, 1)';
    page.style.opacity    = '0';
    page.style.transform  = 'translate(16px, 16px)';

    setTimeout(() => { window.location.href = href; }, 210);
  });
})();
