(function () {
  var PAGE_COLORS = {
    '/':              '#FFFFFF',
    '/about/':        '#4E9AC3',
    '/experiments/':  '#000000',
  };

  // Overlay element used to flash the target color on exit
  var overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:9999',
    'pointer-events:none',
    'opacity:0',
    'transition:opacity 0.15s ease',
  ].join(';');
  document.documentElement.appendChild(overlay);

  // Fade content in on every page load
  var inner = document.querySelector('.page-inner');
  if (inner) {
    inner.style.opacity = '0';
    inner.style.transition = 'opacity 0.2s ease';
    // Double rAF ensures the opacity:0 is painted before we flip to 1
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        inner.style.opacity = '1';
      });
    });
  }

  // Resolve the color for a given href, respecting any user-set CSS vars
  function colorFor(path) {
    var root = document.documentElement;
    var key = path === '/' ? '--color-work'
            : path === '/about/' ? '--color-about'
            : path === '/experiments/' ? '--color-experiments'
            : null;
    if (key) {
      var v = root.style.getPropertyValue(key).trim();
      if (v) return v;
    }
    return PAGE_COLORS[path] || null;
  }

  // Intercept nav clicks
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;

    var href = link.getAttribute('href');
    // Only handle internal same-origin links to known pages
    if (!href || link.target || href.indexOf('//') !== -1 || href.indexOf('#') === 0) return;

    var path = href.replace(/([^/])$/, '$1/'); // normalise trailing slash
    var color = colorFor(path);
    if (!color) return;

    e.preventDefault();

    overlay.style.backgroundColor = color;
    overlay.style.pointerEvents   = 'all';

    // Trigger reflow so transition fires
    overlay.getBoundingClientRect();
    overlay.style.opacity = '1';

    if (inner) inner.style.opacity = '0';

    setTimeout(function () {
      window.location.href = href;
    }, 80);
  }, true);
})();
