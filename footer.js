/* Wheel input over the body (the gutters beside the page card) has
   nothing to scroll — forward it to the real scroller, .page-inner. */
(function () {
  document.addEventListener('wheel', function (e) {
    if (e.target !== document.body && e.target !== document.documentElement) return;
    var s = document.querySelector('.page-inner');
    if (s) s.scrollTop += e.deltaY;
  }, { passive: true });
})();

/* Keyboard scrolling (space, page up/down, arrows, home/end) also targets
   the locked document — forward it to .page-inner the same way. Only fires
   when focus is on the body itself; a focused element inside .page-inner
   already scrolls it natively. */
(function () {
  var KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (KEYS.indexOf(e.key) === -1) return;
    if (e.target !== document.body && e.target !== document.documentElement) return;
    var s = document.querySelector('.page-inner');
    if (!s) return;
    e.preventDefault();
    var page = s.clientHeight * 0.9;
    switch (e.key) {
      case 'ArrowUp':   s.scrollBy({ top: -60 }); break;
      case 'ArrowDown': s.scrollBy({ top: 60 }); break;
      case 'PageUp':    s.scrollBy({ top: -page, behavior: 'smooth' }); break;
      case 'PageDown':  s.scrollBy({ top: page, behavior: 'smooth' }); break;
      case ' ':         s.scrollBy({ top: e.shiftKey ? -page : page, behavior: 'smooth' }); break;
      case 'Home':      s.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'End':       s.scrollTo({ top: s.scrollHeight, behavior: 'smooth' }); break;
    }
  });
})();

(function () {
  var footer = document.querySelector('footer');
  if (!footer) return;
  footer.innerHTML =
    '<div class="footer-cols">' +
      '<div class="footer-col footer-col--pages">' +
        '<span class="footer-head">Pages</span>' +
        '<a href="/#work">Work</a>' +
        '<a href="/about/">About</a>' +
        '<a href="/experiments/">Experiments</a>' +
      '</div>' +
      '<div class="footer-col">' +
        '<span class="footer-head">Social</span>' +
        '<a href="https://x.com/marlouiise" target="_blank" rel="noopener">X</a>' +
        '<a href="https://www.linkedin.com/in/marylouisehowell/" target="_blank" rel="noopener">Linkedin</a>' +
        '<a href="https://github.com/mlouhowell" target="_blank" rel="noopener">Github</a>' +
      '</div>' +
      '<div class="footer-col">' +
        '<span class="footer-head">Contact</span>' +
        '<a href="mailto:marylouisehowell@gmail.com">marylouisehowell@gmail.com</a>' +
      '</div>' +
      '<div class="footer-col">' +
        '<span class="footer-head">Download</span>' +
        '<a href="/ML Howell Resume.pdf" target="_blank">Resume</a>' +
      '</div>' +
      '<div class="footer-col">' +
        '<span class="footer-head">2026 © ML Howell V3.1</span>' +
        '<span class="footer-credit">This site was made by me, with a little help from Claude</span>' +
      '</div>' +
    '</div>';
})();
