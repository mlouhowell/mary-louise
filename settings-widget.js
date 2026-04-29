(function () {
  const DEFAULTS = {
    '--color-work':        '#CC6FAD',
    '--color-about':       '#4E9AC3',
    '--color-experiments': '#F1DFC1',
    '--color-triangle':    '#C8341A',
    '--size-h1':   '40px',
    '--size-h2':   '24px',
    '--size-h3':   '20px',
    '--size-body': '16px',
    '--size-nav':  '20px',
    '--pad-page-h':        '80px',
    '--gap-cols':          '80px',
    '--triangle-size':     '180px',
  };

  const GROUPS = [
    {
      label: 'Color',
      items: [
        { label: 'Work',         var: '--color-work',        type: 'color' },
        { label: 'About',        var: '--color-about',       type: 'color' },
        { label: 'Experiments',  var: '--color-experiments', type: 'color' },
        { label: 'Triangle',     var: '--color-triangle',    type: 'color' },
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
      top: 24px;
      right: 24px;
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
      top: 0;
      right: 0;
      z-index: 9998;
      width: 280px;
      max-height: 100vh;
      overflow-y: auto;
      background: #FFFFFF;
      font-family: 'Inter', system-ui, sans-serif;
      transform: translateY(calc(-100% - 4px));
      transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      padding-top: 72px;
      padding-bottom: 24px;
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

    @media (max-width: 800px) {
      .mlw-trigger, .mlw-panel { display: none !important; }
    }
  `;
  document.head.appendChild(style);

  /* ── trigger button ───────────────────────────────── */

  const trigger = document.createElement('button');
  trigger.className = 'mlw-trigger';
  trigger.setAttribute('aria-label', 'Open settings');
  trigger.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4.5 9.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M4.5 9.5L3 11" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M2.5 12.5C2.5 12.5 1.5 11 2.5 10C3.5 9 5 10 4.5 11.5C4.2 12.5 3 13.5 2.5 12.5Z" fill="white"/>
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

  document.body.appendChild(panel);

  /* ── toggle ───────────────────────────────────────── */

  trigger.addEventListener('click', () => panel.classList.toggle('open'));
  panel.querySelector('.mlw-close').addEventListener('click', () => panel.classList.remove('open'));

  /* ── apply saved settings on load ────────────────── */

  const saved = loadSaved();
  Object.entries(saved).forEach(([k, v]) => applyVar(k, v));

})();
