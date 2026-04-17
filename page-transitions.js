(function () {
  const page    = document.querySelector('.page');
  const pageTurn = document.querySelector('.page-turn');
  if (!page || !pageTurn) return;

  /* ── Enter: slide in from right if arriving via page-turn ── */
  if (sessionStorage.getItem('pt-enter')) {
    sessionStorage.removeItem('pt-enter');
    page.style.transition = 'none';
    page.style.transformOrigin = 'left center';
    page.style.transform = 'perspective(2500px) rotateY(90deg)';

    requestAnimationFrame(() => requestAnimationFrame(() => {
      page.style.transition = 'transform 0.45s cubic-bezier(0.0, 0.0, 0.2, 1)';
      page.style.transform   = '';
    }));
  }

  /* ── Exit: fold away to the left, then navigate ─────────── */
  pageTurn.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.href;

    sessionStorage.setItem('pt-enter', '1');
    page.style.transformOrigin = 'left center';
    page.style.transition      = 'transform 0.4s cubic-bezier(0.4, 0, 1, 1)';
    page.style.transform       = 'perspective(2500px) rotateY(-90deg)';

    setTimeout(() => { window.location.href = href; }, 420);
  });
})();
