/* Wheel input over the body (the gutters beside the page card) has
   nothing to scroll — forward it to the real scroller, .page-inner. */
(function () {
  document.addEventListener('wheel', function (e) {
    if (e.target !== document.body && e.target !== document.documentElement) return;
    var s = document.querySelector('.page-inner');
    if (s) s.scrollTop += e.deltaY;
  }, { passive: true });
})();

(function () {
  var footer = document.querySelector('footer');
  if (!footer) return;
  footer.innerHTML =
    '<span class="footer-copy">2026 © ML Howell V2.1</span>' +
    '<a href="mailto:marylouisehowell@gmail.com">Email</a>' +
    '<a href="https://www.linkedin.com/in/marylouisehowell/" target="_blank">LinkedIn</a>' +
    '<a href="https://twitter.com/marlouiise" target="_blank">X</a>' +
    '<a href="https://github.com/mlouhowell" target="_blank">GitHub</a>' +
    '<a href="/ML Howell Resume.pdf" target="_blank">Resume</a>' +
    '<span class="footer-credit">This site was designed and built by me with a little help from Claude</span>';
})();
