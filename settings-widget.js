(function () {
  const DEFAULTS = {
    '--color-work':        '#CC6FAD',
    '--color-about':       '#4E9AC3',
    '--color-experiments': '#F1DFC1',
    '--size-h1':   '40px',
    '--size-h2':   '24px',
    '--size-h3':   '20px',
    '--size-body': '16px',
    '--size-nav':  '20px',
    '--pad-page-h':        '80px',
    '--gap-cols':          '80px',
    '--triangle-size':     '440px',
  };

  const GROUPS = [
    {
      label: 'Color',
      items: [
        { label: 'Work',         var: '--color-work',        type: 'color' },
        { label: 'About',        var: '--color-about',       type: 'color' },
        { label: 'Experiments',  var: '--color-experiments', type: 'color' },
      ],
    },
    {
      label: 'Grid',
      items: [
        { label: 'Page padding', var: '--pad-page-h',    type: 'range', min: 16,  max: 160, step: 4  },
        { label: 'Column gap',   var: '--gap-cols',      type: 'range', min: 16,  max: 160, step: 4  },
        { label: 'Triangle',     var: '--triangle-size', type: 'range', min: 0,   max: 800, step: 10 },
      ],
    },
    {
      label: 'Type',
      items: [
        { label: 'H1',   var: '--size-h1',   type: 'range', min: 24, max: 80, step: 1 },
        { label: 'H2',   var: '--size-h2',   type: 'range', min: 16, max: 48, step: 1 },
        { label: 'H3',   var: '--size-h3',   type: 'range', min: 14, max: 36, step: 1 },
        { label: 'Body', var: '--size-body', type: 'range', min: 12, max: 28, step: 1 },
      ],
    },
  ];

  /* ── helpers ──────────────────────────────────────── */

  function loadSaved() {
    try { return JSON.parse(localStorage.getItem('ml-settings') || '{}'); } catch (e) { return {}; }
  }

  function saveAll() {
    const s = {};
    panel.querySelectorAll('[data-mlvar]').forEach(el => {
      s[el.dataset.mlvar] = el.dataset.mltype === 'range' ? el.value + 'px' : el.value;
    });
    localStorage.setItem('ml-settings', JSON.stringify(s));
  }

  function applyVar(name, value) {
    document.documentElement.style.setProperty(name, value);
  }

  function rawDefault(varName) {
    return DEFAULTS[varName] || '';
  }

  function initialValue(varName, type) {
    const saved = loadSaved();
    const v = saved[varName] || DEFAULTS[varName] || '';
    return type === 'range' ? parseInt(v) : v;
  }

  /* ── styles ───────────────────────────────────────── */

  const style = document.createElement('style');
  style.textContent = `
    .mlw-trigger {
      position: fixed;
      bottom: 28px;
      left: 28px;
      z-index: 9999;
      width: 32px;
      height: 32px;
      background: #1A1A1A;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.35;
      transition: opacity 0.15s;
      padding: 0;
    }
    .mlw-trigger:hover { opacity: 0.85; }
    .mlw-trigger svg { display: block; }

    .mlw-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 9998;
      width: 280px;
      max-height: 100vh;
      overflow-y: auto;
      background: #FFFFFF;
      font-family: 'Inter', system-ui, sans-serif;
      transform: translateY(calc(100% + 4px));
      transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      padding-bottom: 72px;
    }
    .mlw-panel.open { transform: translateY(0); }

    .mlw-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 14px;
      border-bottom: 1px solid rgba(0,0,0,0.10);
    }
    .mlw-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: #1A1A1A;
    }
    .mlw-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      color: #1A1A1A;
      opacity: 0.5;
      transition: opacity 0.15s;
      line-height: 1;
    }
    .mlw-close:hover { opacity: 1; }

    .mlw-group { padding: 18px 20px 8px; }

    .mlw-group-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.4);
      margin-bottom: 14px;
    }

    .mlw-row {
      display: grid;
      grid-template-columns: 88px 1fr auto auto;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }

    .mlw-label {
      font-size: 13px;
      color: #1A1A1A;
      font-weight: 400;
    }

    .mlw-slider-wrap { position: relative; display: flex; align-items: center; }

    .mlw-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 14px;
      background: repeating-linear-gradient(
        90deg,
        rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px,
        transparent 1px, transparent 5px,
        rgba(0,0,0,0.2) 5px, rgba(0,0,0,0.2) 6px,
        transparent 6px, transparent 10px
      );
      background-size: 10px 14px;
      background-position: 0 center;
      outline: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin: 0;
    }
    .mlw-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 14px;
      background: #1A1A1A;
      cursor: grab;
      border: none;
      border-radius: 0;
    }
    .mlw-slider::-moz-range-thumb {
      width: 12px;
      height: 14px;
      background: #1A1A1A;
      cursor: grab;
      border: none;
      border-radius: 0;
    }
    .mlw-slider:active::-webkit-slider-thumb { cursor: grabbing; }

    .mlw-value {
      font-size: 13px;
      color: #1A1A1A;
      font-variant-numeric: tabular-nums;
      min-width: 24px;
      text-align: right;
    }

    .mlw-swatch-wrap {
      position: relative;
      width: 40px;
      height: 22px;
      cursor: pointer;
      border: 1px solid rgba(0,0,0,0.15);
      flex-shrink: 0;
    }
    .mlw-swatch-input {
      position: absolute;
      inset: 0;
      opacity: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      border: none;
      padding: 0;
    }

    .mlw-reset {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(0,0,0,0.4);
      font-size: 14px;
      padding: 0 2px;
      line-height: 1;
      opacity: 0.5;
      transition: opacity 0.15s;
      flex-shrink: 0;
    }
    .mlw-reset:hover { opacity: 1; }

    .mlw-divider {
      height: 1px;
      background: rgba(0,0,0,0.08);
      margin: 4px 20px 0;
    }

    /* Content editing section */
    .mlw-content-section { padding: 18px 20px 20px; }

    .mlw-content-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .mlw-lock-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 15px;
      padding: 0;
      line-height: 1;
      opacity: 0.6;
      transition: opacity 0.15s;
    }
    .mlw-lock-btn:hover { opacity: 1; }

    .mlw-pw-row { display: flex; gap: 6px; }

    .mlw-pw-input {
      flex: 1;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px;
      padding: 6px 10px;
      border: 1px solid rgba(0,0,0,0.15);
      background: #fff;
      outline: none;
      color: #1A1A1A;
    }
    .mlw-pw-input:focus { border-color: #C8341A; }

    .mlw-pw-submit {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      background: #1A1A1A;
      color: #fff;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .mlw-pw-submit:hover { opacity: 0.75; }

    .mlw-pw-error {
      font-size: 11px;
      color: #C8341A;
      margin-top: 6px;
    }

    .mlw-edit-active-label {
      font-size: 12px;
      color: rgba(0,0,0,0.5);
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .mlw-save-edits {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 600;
      padding: 7px 0;
      background: #1A1A1A;
      color: #fff;
      border: none;
      cursor: pointer;
      width: 100%;
      transition: opacity 0.15s;
    }
    .mlw-save-edits:hover { opacity: 0.75; }

    .mlw-clear-edits {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      padding: 6px 0;
      background: none;
      border: 1px solid rgba(0,0,0,0.15);
      cursor: pointer;
      color: #1A1A1A;
      width: 100%;
      transition: opacity 0.15s;
    }
    .mlw-clear-edits:hover { opacity: 0.6; }

    /* Editable text highlight */
    .mlw-editable {
      outline: 1.5px dashed rgba(200,52,26,0.35) !important;
      cursor: text !important;
      border-radius: 1px;
    }
    .mlw-editable:focus {
      outline: 1.5px solid #C8341A !important;
      background: rgba(200,52,26,0.04) !important;
    }

    /* ── Image drop zones ─────────────────────────── */
    .mlw-droppable {
      outline: 2px dashed rgba(200,52,26,0.3);
      cursor: copy;
      transition: outline-color 0.15s, background 0.15s;
    }
    .mlw-droppable.mlw-drag-over {
      outline-color: #C8341A;
      background: rgba(200,52,26,0.05) !important;
    }
    .page-inner.mlw-drag-over-page {
      outline: 2px dashed rgba(200,52,26,0.3);
    }

    /* Floated image wrapper */
    .mlw-float-wrap {
      box-sizing: border-box;
      position: relative;
    }
    .mlw-float-wrap img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Image controls toolbar */
    .mlw-img-menu {
      position: absolute;
      top: 6px;
      left: 6px;
      display: flex;
      align-items: center;
      gap: 2px;
      z-index: 200;
      background: rgba(10,10,10,0.82);
      padding: 4px 6px;
      border-radius: 3px;
      pointer-events: all;
    }
    .mlw-img-menu button {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10px;
      font-weight: 500;
      padding: 3px 6px;
      background: rgba(255,255,255,0.12);
      color: #fff;
      border: none;
      cursor: pointer;
      line-height: 1.3;
      border-radius: 2px;
      transition: background 0.1s;
    }
    .mlw-img-menu button:hover { background: rgba(255,255,255,0.28); }
    .mlw-img-menu button[data-del] { background: rgba(200,52,26,0.7); }
    .mlw-img-menu button[data-del]:hover { background: #C8341A; }
    .mlw-img-sep {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.2);
      margin: 0 2px;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);

  /* ── trigger button ───────────────────────────────── */

  const trigger = document.createElement('button');
  trigger.className = 'mlw-trigger';
  trigger.setAttribute('aria-label', 'Open settings');
  trigger.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="12" height="1.2" fill="white"/>
    <rect x="1" y="6.4" width="12" height="1.2" fill="white"/>
    <rect x="1" y="9.8" width="12" height="1.2" fill="white"/>
    <rect x="3.5" y="1.8" width="1.4" height="3.6" fill="white"/>
    <rect x="8" y="5.2" width="1.4" height="3.6" fill="white"/>
  </svg>`;
  document.body.appendChild(trigger);

  /* ── panel ────────────────────────────────────────── */

  const panel = document.createElement('div');
  panel.className = 'mlw-panel';

  panel.innerHTML = `
    <div class="mlw-header">
      <span class="mlw-title">Settings</span>
      <button class="mlw-close" aria-label="Close">&#9632;</button>
    </div>
  `;

  GROUPS.forEach((group, gi) => {
    if (gi > 0) {
      const div = document.createElement('div');
      div.className = 'mlw-divider';
      panel.appendChild(div);
    }

    const groupEl = document.createElement('div');
    groupEl.className = 'mlw-group';
    groupEl.innerHTML = `<div class="mlw-group-label">${group.label}</div>`;

    group.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'mlw-row';

      const label = document.createElement('span');
      label.className = 'mlw-label';
      label.textContent = item.label;
      row.appendChild(label);

      if (item.type === 'color') {
        row.style.gridTemplateColumns = '88px auto 1fr auto';

        const swatchWrap = document.createElement('div');
        swatchWrap.className = 'mlw-swatch-wrap';

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'mlw-swatch-input';
        colorInput.dataset.mlvar = item.var;
        colorInput.dataset.mltype = 'color';
        colorInput.value = initialValue(item.var, 'color');
        swatchWrap.style.background = colorInput.value;

        colorInput.addEventListener('input', () => {
          swatchWrap.style.background = colorInput.value;
          hexDisplay.textContent = colorInput.value.toUpperCase();
          applyVar(item.var, colorInput.value);
          saveAll();
        });

        swatchWrap.appendChild(colorInput);
        row.appendChild(swatchWrap);

        const hexDisplay = document.createElement('span');
        hexDisplay.className = 'mlw-value';
        hexDisplay.style.fontSize = '11px';
        hexDisplay.style.letterSpacing = '0.04em';
        hexDisplay.textContent = colorInput.value.toUpperCase();
        row.appendChild(hexDisplay);

        const resetBtn = document.createElement('button');
        resetBtn.className = 'mlw-reset';
        resetBtn.textContent = '↺';
        resetBtn.title = 'Reset';
        resetBtn.addEventListener('click', () => {
          const def = rawDefault(item.var);
          colorInput.value = def;
          swatchWrap.style.background = def;
          hexDisplay.textContent = def.toUpperCase();
          applyVar(item.var, def);
          saveAll();
        });
        row.appendChild(resetBtn);

      } else {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'mlw-slider';
        slider.dataset.mlvar = item.var;
        slider.dataset.mltype = 'range';
        slider.min = item.min;
        slider.max = item.max;
        slider.step = item.step;
        slider.value = initialValue(item.var, 'range');
        row.appendChild(slider);

        const valDisplay = document.createElement('span');
        valDisplay.className = 'mlw-value';
        valDisplay.textContent = slider.value;
        row.appendChild(valDisplay);

        slider.addEventListener('input', () => {
          valDisplay.textContent = slider.value;
          applyVar(item.var, slider.value + 'px');
          saveAll();
        });

        const resetBtn = document.createElement('button');
        resetBtn.className = 'mlw-reset';
        resetBtn.textContent = '↺';
        resetBtn.title = 'Reset';
        resetBtn.addEventListener('click', () => {
          const def = parseInt(rawDefault(item.var));
          slider.value = def;
          valDisplay.textContent = def;
          applyVar(item.var, def + 'px');
          saveAll();
        });
        row.appendChild(resetBtn);
      }

      groupEl.appendChild(row);
    });

    panel.appendChild(groupEl);
  });

  /* ── image management ─────────────────────────────── */

  const IMG_KEY = 'ml-img:' + location.pathname;

  function loadImgData() {
    try { return JSON.parse(localStorage.getItem(IMG_KEY) || '[]'); } catch(e) { return []; }
  }

  function saveImgData() {
    const out = [];
    // Thumb slot images
    document.querySelectorAll('[data-mlthumbid]').forEach(slot => {
      const img = slot.querySelector('img[data-mlimg]');
      if (img) {
        out.push({ type: 'thumb', slotId: slot.dataset.mlthumbid, src: img.src });
      }
    });
    // Floating images
    document.querySelectorAll('.mlw-float-wrap[data-mlimg]').forEach(wrap => {
      const img = wrap.querySelector('img');
      if (!img) return;
      out.push({
        type:   'float',
        id:     wrap.dataset.mlimg,
        src:    img.src,
        float:  wrap.dataset.mlfloat || 'left',
        width:  wrap.dataset.mlwidth || '50',
        target: wrap.dataset.mltarget || '.page-inner',
      });
    });
    localStorage.setItem(IMG_KEY, JSON.stringify(out));
  }

  function clearImgData() {
    localStorage.removeItem(IMG_KEY);
    document.querySelectorAll('.mlw-float-wrap').forEach(el => el.remove());
    document.querySelectorAll('[data-mlthumbid]').forEach(slot => {
      const img = slot.querySelector('img[data-mlimg]');
      if (!img) return;
      slot.innerHTML = '';
      const ph = document.createElement('span');
      ph.className = slot.dataset.mlthumbclass || '';
      ph.textContent = slot.dataset.mlthumbtext || '';
      if (ph.className) slot.appendChild(ph);
    });
  }

  function applyFloatStyle(wrap, floatDir, widthPct) {
    const margin = floatDir === 'right'
      ? '0 0 20px 28px'
      : floatDir === 'none'
      ? '0 0 24px 0'
      : '0 28px 20px 0';
    wrap.style.float   = floatDir === 'none' ? 'none' : floatDir;
    wrap.style.width   = widthPct + '%';
    wrap.style.margin  = margin;
    wrap.style.display = floatDir === 'none' ? 'block' : '';
    wrap.style.clear   = floatDir === 'none' ? 'both'  : '';
  }

  function showImgMenu(img, container, type) {
    container.querySelectorAll('.mlw-img-menu').forEach(el => el.remove());
    container.style.position = 'relative';

    const menu = document.createElement('div');
    menu.className = 'mlw-img-menu';

    if (type === 'float') {
      menu.innerHTML = `
        <button data-w="37">S</button>
        <button data-w="50">M</button>
        <button data-w="62">L</button>
        <button data-w="100">Full</button>
        <span class="mlw-img-sep"></span>
        <button data-f="left" title="Float left">◁</button>
        <button data-f="none" title="No float">▽</button>
        <button data-f="right" title="Float right">▷</button>
        <span class="mlw-img-sep"></span>
        <button data-del>✕</button>
      `;
      menu.querySelectorAll('[data-w]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          container.dataset.mlwidth = btn.dataset.w;
          applyFloatStyle(container, container.dataset.mlfloat || 'left', btn.dataset.w);
          saveImgData();
        });
      });
      menu.querySelectorAll('[data-f]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          container.dataset.mlfloat = btn.dataset.f;
          applyFloatStyle(container, btn.dataset.f, container.dataset.mlwidth || '50');
          saveImgData();
        });
      });
      menu.querySelector('[data-del]').addEventListener('click', e => {
        e.stopPropagation();
        container.remove();
        saveImgData();
      });
    } else {
      // Thumb type — just delete
      menu.innerHTML = `<button data-del>✕ Remove</button>`;
      menu.querySelector('[data-del]').addEventListener('click', e => {
        e.stopPropagation();
        container.innerHTML = '';
        const ph = document.createElement('span');
        ph.className = container.dataset.mlthumbclass || '';
        ph.textContent = container.dataset.mlthumbtext || '';
        if (ph.className) container.appendChild(ph);
        saveImgData();
      });
    }

    container.appendChild(menu);

    setTimeout(() => {
      function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== img) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      }
      document.addEventListener('click', closeMenu);
    }, 0);
  }

  function buildFloatWrap(src, floatDir, widthPct, id, targetSel) {
    floatDir = floatDir || 'left';
    widthPct = widthPct || '50';
    id = id || ('fi-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5));

    const wrap = document.createElement('div');
    wrap.className = 'mlw-float-wrap';
    wrap.dataset.mlimg    = id;
    wrap.dataset.mlfloat  = floatDir;
    wrap.dataset.mlwidth  = widthPct;
    wrap.dataset.mltarget = targetSel || '.page-inner';
    applyFloatStyle(wrap, floatDir, widthPct);

    const img = document.createElement('img');
    img.src = src;
    wrap.appendChild(img);

    img.addEventListener('click', e => {
      if (!editUnlocked) return;
      e.stopPropagation();
      showImgMenu(img, wrap, 'float');
    });

    return wrap;
  }

  function restoreImgData() {
    const stored = loadImgData();
    stored.forEach(data => {
      if (data.type === 'thumb') {
        const slot = document.querySelector(`[data-mlthumbid="${data.slotId}"]`);
        if (!slot) return;
        slot.innerHTML = '';
        const img = document.createElement('img');
        img.src = data.src;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        img.dataset.mlimg = 'thumb';
        slot.appendChild(img);
        img.addEventListener('click', e => {
          if (!editUnlocked) return;
          e.stopPropagation();
          showImgMenu(img, slot, 'thumb');
        });
      } else if (data.type === 'float') {
        const target = document.querySelector(data.target) ||
                       document.querySelector('.left-col, .bio, .content, .page-inner');
        if (!target) return;
        const wrap = buildFloatWrap(data.src, data.float, data.width, data.id, data.target);
        target.insertBefore(wrap, target.firstChild);
      }
    });
  }

  // Tag thumb slots with stable IDs and save placeholder info
  document.querySelectorAll('.experiment-thumb, .project-thumb').forEach((el, i) => {
    el.dataset.mlthumbid = 'thumb-' + i;
    const ph = el.querySelector('.experiment-thumb-placeholder, .project-thumb-placeholder');
    if (ph) {
      el.dataset.mlthumbclass = ph.className;
      el.dataset.mlthumbtext  = ph.textContent;
    }
  });

  restoreImgData();

  /* ── drag-and-drop ────────────────────────────────── */

  function enableImageDrop() {
    const page = document.querySelector('.page-inner');
    if (!page) return;

    document.querySelectorAll('[data-mlthumbid]').forEach(el => {
      el.classList.add('mlw-droppable');
    });

    page.addEventListener('dragover',  onDragOver);
    page.addEventListener('dragleave', onDragLeave);
    page.addEventListener('drop',      onDrop);
  }

  function disableImageDrop() {
    const page = document.querySelector('.page-inner');
    if (!page) return;

    document.querySelectorAll('.mlw-droppable').forEach(el => el.classList.remove('mlw-droppable', 'mlw-drag-over'));
    document.querySelectorAll('.mlw-img-menu').forEach(el => el.remove());
    page.classList.remove('mlw-drag-over-page');

    page.removeEventListener('dragover',  onDragOver);
    page.removeEventListener('dragleave', onDragLeave);
    page.removeEventListener('drop',      onDrop);
  }

  function onDragOver(e) {
    if (!e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const thumb = e.target.closest('[data-mlthumbid]');
    document.querySelectorAll('.mlw-drag-over').forEach(el => el.classList.remove('mlw-drag-over'));
    e.currentTarget.classList.remove('mlw-drag-over-page');
    if (thumb) thumb.classList.add('mlw-drag-over');
    else       e.currentTarget.classList.add('mlw-drag-over-page');
  }

  function onDragLeave(e) {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    e.currentTarget.classList.remove('mlw-drag-over-page');
    document.querySelectorAll('.mlw-drag-over').forEach(el => el.classList.remove('mlw-drag-over'));
  }

  function onDrop(e) {
    e.preventDefault();
    document.querySelectorAll('.mlw-drag-over').forEach(el => el.classList.remove('mlw-drag-over'));
    e.currentTarget.classList.remove('mlw-drag-over-page');

    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (!file) return;

    const thumbEl = e.target.closest('[data-mlthumbid]');
    const reader  = new FileReader();

    reader.onload = (ev) => {
      const src = ev.target.result;

      if (thumbEl) {
        thumbEl.innerHTML = '';
        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        img.dataset.mlimg = 'thumb';
        thumbEl.appendChild(img);
        img.addEventListener('click', ev2 => {
          if (!editUnlocked) return;
          ev2.stopPropagation();
          showImgMenu(img, thumbEl, 'thumb');
        });
      } else {
        // Float in nearest content area
        const contentSelectors = ['.left-col', '.bio', '.content'];
        let target = null, targetSel = '.page-inner';
        for (const sel of contentSelectors) {
          const el = document.querySelector(sel);
          if (el) { target = el; targetSel = sel; break; }
        }
        if (!target) target = document.querySelector('.page-inner');

        const wrap = buildFloatWrap(src, 'left', '50', null, targetSel);
        target.insertBefore(wrap, target.firstChild);
      }
      saveImgData();
    };
    reader.readAsDataURL(file);
  }

  /* ── content editing section ─────────────────────── */

  const EDIT_PASSWORD = '1California';
  const CONTENT_KEY   = 'ml-content:' + location.pathname;
  const EDIT_SEL      = '.page-inner h1, .page-inner h2, .page-inner h3, .bio p, .quote p, .quote cite, .experiment-label';

  function loadPageContent() {
    try { return JSON.parse(localStorage.getItem(CONTENT_KEY) || '{}'); } catch(e) { return {}; }
  }

  function savePageContent() {
    const out = {};
    document.querySelectorAll('.mlw-editable').forEach(el => {
      if (el.dataset.mltext) out[el.dataset.mltext] = el.innerHTML;
    });
    localStorage.setItem(CONTENT_KEY, JSON.stringify(out));
  }

  function tagAndRestoreContent() {
    const counts = {};
    const saved  = loadPageContent();
    document.querySelectorAll(EDIT_SEL).forEach(el => {
      const tag = el.tagName.toLowerCase();
      counts[tag] = (counts[tag] || 0) + 1;
      const key = tag + '[' + counts[tag] + ']';
      el.dataset.mltext = key;
      if (saved[key]) el.innerHTML = saved[key];
    });
  }

  function enableEditing() {
    document.querySelectorAll('[data-mltext]').forEach(el => {
      el.contentEditable = 'true';
      el.classList.add('mlw-editable');
      el.addEventListener('input', savePageContent);
    });
    enableImageDrop();
  }

  function disableEditing() {
    document.querySelectorAll('[data-mltext]').forEach(el => {
      el.contentEditable = 'false';
      el.classList.remove('mlw-editable');
    });
    disableImageDrop();
  }

  tagAndRestoreContent();

  // Build section
  const contentDivider = document.createElement('div');
  contentDivider.className = 'mlw-divider';
  panel.appendChild(contentDivider);

  const contentSection = document.createElement('div');
  contentSection.className = 'mlw-content-section';

  let editUnlocked = false;

  function renderContentSection() {
    contentSection.innerHTML = `
      <div class="mlw-content-header">
        <span class="mlw-group-label" style="margin:0">Content</span>
        <button class="mlw-lock-btn" aria-label="Lock/unlock content editing">
          ${editUnlocked ? '🔓' : '🔒'}
        </button>
      </div>
      ${editUnlocked ? `
        <div class="mlw-edit-active-label">Edit mode on — click text to edit, drag images onto the page</div>
        <button class="mlw-save-edits">Save &amp; lock</button>
        <button class="mlw-clear-edits" style="margin-top:6px">Clear all edits</button>
      ` : `
        <div class="mlw-pw-row">
          <input class="mlw-pw-input" type="password" placeholder="Password">
          <button class="mlw-pw-submit">Unlock</button>
        </div>
        <div class="mlw-pw-error" style="display:none">Incorrect password</div>
      `}
    `;

    contentSection.querySelector('.mlw-lock-btn').addEventListener('click', () => {
      if (editUnlocked) {
        editUnlocked = false;
        disableEditing();
        renderContentSection();
      }
    });

    if (editUnlocked) {
      contentSection.querySelector('.mlw-save-edits').addEventListener('click', () => {
        savePageContent();
        saveImgData();
        editUnlocked = false;
        disableEditing();
        renderContentSection();
      });

      contentSection.querySelector('.mlw-clear-edits').addEventListener('click', () => {
        localStorage.removeItem(CONTENT_KEY);
        clearImgData();
        tagAndRestoreContent();
        if (editUnlocked) enableEditing();
      });
    } else {
      const pwInput  = contentSection.querySelector('.mlw-pw-input');
      const pwSubmit = contentSection.querySelector('.mlw-pw-submit');
      const pwError  = contentSection.querySelector('.mlw-pw-error');

      function tryUnlock() {
        if (pwInput.value === EDIT_PASSWORD) {
          editUnlocked = true;
          enableEditing();
          renderContentSection();
        } else {
          pwError.style.display = 'block';
          pwInput.value = '';
        }
      }

      pwSubmit.addEventListener('click', tryUnlock);
      pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
    }
  }

  renderContentSection();
  panel.appendChild(contentSection);

  document.body.appendChild(panel);

  /* ── toggle ───────────────────────────────────────── */

  trigger.addEventListener('click', () => panel.classList.toggle('open'));
  panel.querySelector('.mlw-close').addEventListener('click', () => panel.classList.remove('open'));

  /* ── apply saved settings on load ────────────────── */

  const saved = loadSaved();
  Object.entries(saved).forEach(([k, v]) => applyVar(k, v));

})();
