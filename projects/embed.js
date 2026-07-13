/* Chrome bar behaviour for the embed pages: measure the fixed nav,
   render the Lucide icons, wire up copy + open-in-new-tab. */
(function () {
  var bar = document.querySelector('.embed-bar');
  if (!bar) return;

  var url = bar.dataset.url;

  /* Nav is fixed and its padding shrinks on mobile — measure rather
     than hardcode, so the bar always sits flush beneath it. */
  function measureNav() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
  }
  measureNav();
  window.addEventListener('resize', measureNav);

  if (window.lucide) lucide.createIcons();

  var copyBtn = bar.querySelector('.embed-copy');
  var copyIcon = copyBtn && copyBtn.querySelector('svg');
  var revert;

  copyBtn && copyBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(url).then(function () {
      if (!copyIcon) return;
      copyBtn.innerHTML = '<i data-lucide="check"></i>';
      copyBtn.setAttribute('aria-label', 'Link copied');
      if (window.lucide) lucide.createIcons();
      clearTimeout(revert);
      revert = setTimeout(function () {
        copyBtn.innerHTML = '<i data-lucide="copy"></i>';
        copyBtn.setAttribute('aria-label', 'Copy link');
        if (window.lucide) lucide.createIcons();
      }, 1600);
    });
  });
})();
