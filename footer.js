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

/* Email links copy the address to the clipboard instead of firing up a
   mail client. Delegated from the document so it covers every mailto on
   the site (homepage "Find me" window, footer, about page) without each
   one needing its own markup. Falls back to the normal mailto: behaviour
   if the clipboard isn't available. */
(function () {
  var TOAST_MS = 1100;

  function showToast(el, text) {
    var old = document.querySelector('.copy-toast');
    if (old) old.remove();

    var r = el.getBoundingClientRect();
    var toast = document.createElement('span');
    toast.className = 'copy-toast';
    toast.textContent = text;
    toast.style.left = (r.left + r.width / 2) + 'px';
    toast.style.top = (r.top - 8) + 'px';
    document.body.appendChild(toast);

    el.classList.add('is-copied');
    setTimeout(function () {
      el.classList.remove('is-copied');
      toast.classList.add('is-leaving');
      toast.addEventListener('animationend', function () { toast.remove(); });
    }, TOAST_MS);
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Older Safari / non-secure contexts: hidden textarea + execCommand.
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      ok ? resolve() : reject();
    });
  }

  document.addEventListener('click', function (e) {
    // Let modified clicks (new tab/window) and non-left clicks behave normally.
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!link) return;

    var address = decodeURIComponent(link.getAttribute('href').slice(7).split('?')[0]);
    if (!address) return;

    e.preventDefault();
    copy(address).then(
      function () { showToast(link, 'Copied!'); },
      function () { window.location.href = link.getAttribute('href'); }
    );
  });
})();
