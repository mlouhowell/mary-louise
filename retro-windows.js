/* ============================================================
   Retro windows — drag, close, and load-in typing.
   Self-contained: depends only on #retro-windows markup and
   /styles/retro-windows.css. Safe to delete with the section.
   ============================================================ */
(function () {
  var section = document.getElementById('retro-windows');
  if (!section) return;

  var stage = document.getElementById('retro-stage');
  var windows = [].slice.call(section.querySelectorAll('[data-window]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia('(max-width: 800px)');

  /* Cache each string up front so we can clear it, then type it back. */
  var typers = [].slice.call(section.querySelectorAll('[data-type]'));
  typers.forEach(function (el) {
    // keep intentional line breaks but drop source indentation
    el.dataset.text = el.textContent.split('\n').map(function (line) {
      return line.trim();
    }).join('\n');
    if (!reduce) el.textContent = '';
  });

  function typeText(el, speed) {
    var full = el.dataset.text || '';
    el.textContent = '';
    el.classList.add('retro-caret');
    var i = 0;
    (function step() {
      el.textContent = full.slice(0, i);
      if (i < full.length) {
        i++;
        setTimeout(step, speed);
      } else {
        el.classList.remove('retro-caret');
      }
    })();
  }

  /* ── Close buttons ──────────────────────────────────────── */
  [].slice.call(section.querySelectorAll('.retro-close')).forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var win = btn.closest('[data-window]');
      if (win) win.style.display = 'none';
    });
    // don't let a click on the X start a window drag
    btn.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  });

  /* ── Dragging (clamped to the stage) ────────────────────── */
  var topZ = 10;
  function initDrag(win) {
    var handle = win.querySelector('[data-drag-handle]');
    if (!handle) return;

    handle.addEventListener('pointerdown', function (e) {
      if (mqMobile.matches) return;                 // stacked layout — no drag
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();

      var stageRect = stage.getBoundingClientRect();
      var winRect = win.getBoundingClientRect();
      var offsetX = e.clientX - winRect.left;
      var offsetY = e.clientY - winRect.top;

      // pin to pixel coordinates relative to the stage, raise to front
      win.style.left = (winRect.left - stageRect.left) + 'px';
      win.style.top = (winRect.top - stageRect.top) + 'px';
      win.style.zIndex = ++topZ;
      win.classList.add('is-dragging');
      handle.setPointerCapture(e.pointerId);

      function onMove(ev) {
        var sRect = stage.getBoundingClientRect();
        var x = ev.clientX - sRect.left - offsetX;
        var y = ev.clientY - sRect.top - offsetY;
        var maxX = stage.clientWidth - win.offsetWidth;
        var maxY = stage.clientHeight - win.offsetHeight;
        win.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        win.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
      }
      function onUp() {
        win.classList.remove('is-dragging');
        try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
      }

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  }
  windows.forEach(initDrag);

  /* ── Fit the fixed-size cluster to its column ───────────────
     Scales the canvas down on narrow / mobile screens so the
     windows stay grouped and overlapping rather than spilling
     out; never scales up past 1:1. Uses zoom so the layout box
     shrinks too and the canvas stays centered. */
  var STAGE_W = 820;
  function fitStage() {
    var avail = stage.parentElement ? stage.parentElement.clientWidth : STAGE_W;
    var s = Math.min(1, avail / STAGE_W);
    stage.style.zoom = s;
  }
  fitStage();
  window.addEventListener('resize', fitStage);

  /* ── Load-in: stagger windows, then type their text ─────── */
  function reveal() {
    windows.forEach(function (win, idx) {
      var els = [].slice.call(win.querySelectorAll('[data-type]'));
      if (reduce) {
        win.classList.add('is-visible');
        return;
      }
      setTimeout(function () {
        win.classList.add('is-visible');
        els.forEach(function (el, j) {
          var len = (el.dataset.text || '').length;
          setTimeout(function () {
            typeText(el, len > 40 ? 16 : 38);
          }, 240 + j * 140);
        });
      }, idx * 130);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reveal);
  } else {
    reveal();
  }
})();
