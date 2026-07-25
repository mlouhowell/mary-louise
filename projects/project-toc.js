/* ============================================================
   Project page table of contents.
   Auto-builds the left TOC from each .section-label inside
   .project-body, then highlights the current section on scroll.
   A section can override its (often long) label text for the TOC
   with data-toc="Short label" on the .section or its .section-label.
   ============================================================ */
(function () {
  var list = document.querySelector('.toc-list');
  var body = document.querySelector('.project-body');
  if (!list || !body) return;

  var sections = Array.prototype.slice
    .call(body.querySelectorAll('.section'))
    .filter(function (s) { return s.querySelector('.section-label'); });

  var links = [];
  sections.forEach(function (section, i) {
    var label = section.querySelector('.section-label');
    if (!section.id) section.id = 'section-' + (i + 1);

    var text = section.getAttribute('data-toc') ||
               label.getAttribute('data-toc') ||
               label.textContent.trim();

    var a = document.createElement('a');
    a.href = '#' + section.id;
    a.className = 'toc-link';
    a.textContent = text;
    list.appendChild(a);
    links.push({ a: a, section: section });
  });

  // Scroll-spy: the active link is the last section whose top has
  // passed the nav line.
  var current = null;
  function update() {
    var line = 120; // px from top, roughly clearing the fixed nav
    var active = links[0];
    for (var i = 0; i < links.length; i++) {
      if (links[i].section.getBoundingClientRect().top - line <= 0) active = links[i];
      else break;
    }
    if (active && active !== current) {
      if (current) current.a.classList.remove('active');
      active.a.classList.add('active');
      current = active;
    }
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
})();
