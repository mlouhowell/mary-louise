(function () {
  const page     = document.querySelector('.page');
  const pageTurn = document.querySelector('.page-turn');
  if (!page || !pageTurn) return;

  pageTurn.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.href;

    // Grow the corner triangle to cover the full page diagonal
    const pw   = page.offsetWidth;
    const ph   = page.offsetHeight;
    const size = Math.ceil(Math.sqrt(pw * pw + ph * ph));

    this.style.transition = 'width 0.38s cubic-bezier(0.4, 0, 0.2, 1), height 0.38s cubic-bezier(0.4, 0, 0.2, 1)';
    this.style.width      = size + 'px';
    this.style.height     = size + 'px';

    setTimeout(() => { window.location.href = href; }, 400);
  });
})();
