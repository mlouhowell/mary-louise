(function () {
  var PROJECTS = [
    {
      href:  '/projects/guac-products-2025/',
      name:  'Guac Products',
      date:  '2026',
      pill:  'Product',
      thumb: { type: 'img', src: '/projects/guac-products-2025/images/GuacProducts_Hero_2.png', alt: 'Guac Products' },
    },
    {
      href:  'https://doodle.mary-louise.com',
      name:  'Doodles',
      date:  '2026',
      pill:  'Web App',
      thumb: { type: 'video', src: '/projects/Doodles/thumb.mp4' },
      external: true,
    },
    {
      href:  '/projects/postly/',
      name:  'Postly',
      date:  '2026',
      pill:  'Product',
      thumb: { type: 'img', src: '/projects/postly/Images/Postly%20hero.png', alt: 'Postly' },
    },
    {
      href:  '/projects/guac/',
      name:  'Guac Exhibition Booth',
      date:  '2025',
      pill:  'Branding',
      thumb: { type: 'img', src: '/projects/guac/Images/Hero.png', alt: 'Guac Exhibition Booth' },
    },
    {
      href:  '/projects/streetcleaningparking/',
      name:  'Street Cleaning Parking',
      date:  '2024',
      pill:  'Product',
      thumb: { type: 'img', src: '/projects/streetcleaningparking/Image 15.gif', alt: 'Street Cleaning Parking' },
    },
    {
      href:  '/projects/afresh-brand-refresh/',
      name:  'Afresh Refresh',
      date:  '2023',
      pill:  'Branding',
      thumb: { type: 'img', src: '/projects/afresh-brand-refresh/Images/Hero.png', alt: 'Afresh Refresh' },
    },
    {
      href:  '/projects/afreshdesignsystem/',
      name:  'Afresh Design System',
      date:  '2023',
      pill:  'Design Systems',
      thumb: { type: 'img', src: '/projects/afreshdesignsystem/images/Hero.png', alt: 'Afresh Design System' },
    },
  ];

  function buildThumb(t) {
    var wrap = document.createElement('div');
    wrap.className = 'project-thumb';
    if (t.type === 'video') {
      var v = document.createElement('video');
      v.autoplay = true; v.muted = true; v.loop = true; v.playsInline = true;
      v.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      var s = document.createElement('source');
      s.src = t.src; s.type = 'video/mp4';
      v.appendChild(s);
      wrap.appendChild(v);
    } else {
      var img = document.createElement('img');
      img.src = t.src; img.alt = t.alt || '';
      img.addEventListener('load', function () { img.classList.add('loaded'); });
      if (img.complete) img.classList.add('loaded');
      wrap.appendChild(img);
    }
    return wrap;
  }

  function buildCard(p) {
    var a = document.createElement('a');
    a.href = p.href;
    a.className = 'project-item';
    if (p.external) { a.target = '_blank'; a.rel = 'noopener'; }

    a.appendChild(buildThumb(p.thumb));

    var meta = document.createElement('div');
    meta.className = 'project-meta';
    meta.innerHTML =
      '<div class="project-meta-top">' +
        '<span class="project-meta-name">' + p.name + '</span>' +
        '<span class="project-meta-arrow">↗</span>' +
      '</div>' +
      '<div class="project-meta-bottom">' +
        '<span class="project-meta-date">' + p.date + '</span>' +
        '<span class="project-meta-pill">' + p.pill + '</span>' +
      '</div>';
    a.appendChild(meta);
    return a;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var currentPath = window.location.pathname.replace(/\/?$/, '/');

    var others = PROJECTS.filter(function (p) {
      var pPath = p.href.replace(/\/?$/, '/');
      return pPath !== currentPath;
    });

    if (!others.length) return;

    var footer = document.querySelector('footer');
    if (!footer) return;

    var section = document.createElement('div');
    section.className = 'more-projects';

    var label = document.createElement('h2');
    label.className = 'section-label more-projects-label';
    label.textContent = 'More Work';
    section.appendChild(label);

    var grid = document.createElement('div');
    grid.className = 'more-projects-grid';
    others.forEach(function (p) { grid.appendChild(buildCard(p)); });
    section.appendChild(grid);

    footer.parentNode.insertBefore(section, footer);
  });
})();
