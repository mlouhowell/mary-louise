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
    '--gap-cols':          '24px',
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

  /* ── contrast helpers ────────────────────────────── */

  function hexLuminance(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const r = parseInt(hex.slice(0,2), 16) / 255;
    const g = parseInt(hex.slice(2,4), 16) / 255;
    const b = parseInt(hex.slice(4,6), 16) / 255;
    const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }

  function contrastText(hex) {
    const L = hexLuminance(hex);
    const whiteContrast = 1.05 / (L + 0.05);
    const darkContrast  = (L + 0.05) / 0.0606; // #1A1A1A relative luminance + 0.05
    return whiteContrast >= darkContrast ? '#FFFFFF' : '#1A1A1A';
  }

  function currentPageBgVar() {
    const p = location.pathname;
    if (p.startsWith('/about'))       return '--color-about';
    if (p.startsWith('/experiments')) return '--color-experiments';
    if (p.startsWith('/projects'))    return null;
    return '--color-work';
  }

  function refreshTextColor() {
    const bgVar = currentPageBgVar();
    if (!bgVar) return;
    const saved = loadSaved();
    const hex   = (saved[bgVar] || DEFAULTS[bgVar] || '#ffffff').trim();
    const text  = contrastText(hex);
    applyVar('--color-text', text);
    applyVar('--illus-invert', text === '#FFFFFF' ? '1' : '0');
  }

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
    .page-inner { position: relative; }

    .mlw-trigger {
      position: absolute;
      top: var(--pad-page-v);
      right: var(--pad-page-h);
      z-index: 9999;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: background 0.15s;
      color: var(--color-text);
    }
    .mlw-trigger:hover { background: rgba(0,0,0,0.12); }
    .mlw-trigger svg { display: block; }
    .mlw-trigger.hidden { display: none; }

    .mlw-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #1A1A1A;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      margin: -4px;
      transition: opacity 0.15s;
    }
    .mlw-close:hover { opacity: 0.5; }
    .mlw-close svg { display: block; }

    .mlw-panel {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 9998;
      width: 280px;
      max-height: 88vh;
      overflow-y: auto;
      background: #FFFFFF;
      font-family: 'Inter', system-ui, sans-serif;
      transform: translateY(calc(-100% - 4px));
      transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
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
      .mlw-trigger {
        top: var(--pad-page-v);
        right: var(--pad-page-h);
      }
    }
  `;
  document.head.appendChild(style);

  /* ── skip on project pages ───────────────────────── */
  if (location.pathname.startsWith('/projects')) return;

  /* ── trigger button ───────────────────────────────── */

  const trigger = document.createElement('button');
  trigger.className = 'mlw-trigger';
  trigger.setAttribute('aria-label', 'Open settings');
  trigger.innerHTML = `<svg width="18" height="18" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M266.948 28.9252C280.742 28.2215 295.91 34.6103 309.279 37.257C346.677 44.6533 332.804 76.3015 325.495 102.345C327.982 105.735 330.493 108.438 333.307 111.556C347.1 109.533 369.697 81.9787 382.091 73.7588C385.129 71.7438 388.64 70.7603 392.238 71.5679C403.065 73.9987 417.202 93.453 423.215 102.233C429.395 111.268 438.327 123.55 435.744 135.08C432.602 149.153 412.548 165.593 400.73 173.085C402.497 179.922 403.296 185.895 405.679 192.755C418.089 191.716 442.765 189.621 454.191 191.028C458.485 195.01 465.993 203.326 466.993 209.307C469.447 223.988 473.182 264.456 467.001 276.722C459.732 291.13 426.621 293.233 412.132 297.919C402.721 300.957 403.04 308.57 397.683 318.221C404.344 326.992 414.827 338.939 422.063 347.238C426.725 348.534 431.13 349.733 434.865 353.004C437.775 355.546 439.63 359.32 439.67 363.222C439.782 373.129 403.664 415.956 396.228 424.112C389.471 431.516 379.021 437.145 368.81 437.409C365.259 437.497 361.949 436.954 358.767 435.33C346.693 429.181 329.389 405.433 318.499 394.935C307.808 398.301 298.053 404.306 288.562 408.072C262.223 418.539 273.665 418.987 267.948 440.36C266.261 446.637 263.494 452.562 259.776 457.887C254.347 465.747 249.261 469.441 240.09 471.129C237.499 470.009 232.03 469.529 228.935 469.106C218.205 467.73 207.458 466.523 196.687 465.483C183.886 464.252 162.504 463.956 161.577 447.524C160.873 435.027 162.904 414.749 164.32 402.219C154.477 398.117 136.509 384.852 128.753 377.447C115.952 382.885 87.3979 396.406 73.213 394.671C68.8072 394.135 62.9461 387.738 60.5233 383.284C52.0156 367.644 27.8836 322.235 30.3464 306.227C33.057 288.596 77.411 290.635 86.0466 285.325C89.1091 281.143 88.6693 273.955 88.8292 268.606C74.1965 255.26 44.7392 248.408 32.5293 232.2C29.9706 228.801 29.0031 223.764 30.0265 219.814C33.4089 208.755 39.3179 198.489 43.9316 187.814C51.5598 170.151 47.218 143.228 73.9727 144.627C89.8528 145.459 102.878 150.369 117.959 153.111C125.299 147.25 133.871 140.733 139.908 133.641C141.819 131.394 135.854 122.814 134.343 119.92C128.673 109.061 123.06 98.8263 119.678 86.9602C123.628 71.1601 129.553 62.7082 144.945 56.1915C159.17 50.2105 173.323 43.0621 187.796 37.7848C217.253 27.0461 217.781 87.8718 226.832 93.341L228.599 92.8373C242.872 78.7803 234.373 38.0486 266.948 28.9252ZM146.44 88.0317C161.137 117.729 181.959 135.36 145.257 161.539C139.956 165.281 126.219 179.034 119.542 178.123C105.965 176.268 89.0371 171.822 75.1401 169.423C71.9417 177.051 68.9112 189.485 66.0166 197.641C62.8422 206.581 60.4034 212.018 56.2854 220.534L57.1571 220.861C70.3825 226.011 96.2016 244.018 107.82 253.093C115.552 259.138 110.874 290.395 107.764 299.19C103.63 310.888 60.6913 313.887 56.9652 317.997C62.1546 331.63 69.3029 344.608 75.9876 357.577C77.9786 361.439 80.1295 364.078 82.1925 368.356C92.2675 373.905 128.897 345.535 139.036 353.627C151.654 363.694 166.463 375.12 179.968 384.084C193.209 392.872 185.205 424.4 185.597 438.753L185.637 439.96C187.876 440.488 190.147 440.904 192.426 441.199C202.852 442.527 229.815 445.389 239.37 444.638C246.487 444.078 243.936 399.412 259.656 391.696C275.96 383.692 294.647 379.75 309.887 371.106C324.816 362.647 331.212 374.465 340.943 383.62C350.946 393.303 360.59 403.866 371.096 412.958C383.586 402.555 401.585 383.7 408.63 368.868C397.467 352.844 377.653 334.485 368.074 317.141C370.945 306.939 378.245 296.959 383.538 287.788C396.372 265.567 419.648 271.892 444.444 266.671C446.475 256.004 445.843 227.826 444.108 217.791C442.805 210.243 406.063 224.428 393.085 215.104C382.163 208.564 381.515 194.259 377.189 182.281C369.433 160.803 400.122 146.858 409.901 130.163L410.397 129.307C406.743 118.872 397.131 108.254 390.095 99.562C367.602 117.705 334.163 159.1 310.135 125.109C292.967 100.833 309.807 90.9422 310.023 66.6343C310.079 60.8052 277.383 52.6893 272.106 55.0401C255.69 68.3535 261.975 108.813 237.795 116.833C204.156 127.98 199.038 83.8897 191.946 61.4049C176.242 67.322 158.434 76.1336 146.44 88.0317Z" fill="currentColor"/>
    <path d="M243.672 171.302C259.968 170.015 282.717 173.085 295.302 184.072C311.574 198.657 327.086 219.382 329.005 241.875C332.108 278.185 308.072 312.832 272.801 322.299C264.374 324.562 257.889 326.865 249.029 327.664C227.752 326.649 208.689 327.504 189.955 312.944C173.451 300.118 163.68 280.576 161.529 259.882C159.45 241.323 164.967 222.717 176.809 208.276C190.555 191.684 221.651 173.453 243.672 171.302ZM239.89 302.373C267.7 299.814 308.152 283.918 304.33 247.912C301.619 222.365 280.062 193.179 250.932 195.33C219.636 200.336 190.507 217.783 185.141 251.614C184.358 256.556 184.302 261.521 185.101 266.479C186.796 277.337 192.801 287.06 201.757 293.441C212.679 301.205 226.912 302.525 239.89 302.373Z" fill="currentColor"/>
  </svg>`;
  const pageEl = document.querySelector('.page-inner') || document.querySelector('.page') || document.body;
  pageEl.appendChild(trigger);

  /* ── panel ────────────────────────────────────────── */

  const panel = document.createElement('div');
  panel.className = 'mlw-panel';

  panel.innerHTML = `
    <div class="mlw-header">
      <span class="mlw-title">Settings</span>
      <button class="mlw-close" aria-label="Close settings"></button>
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
          refreshTextColor();
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
          refreshTextColor();
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

  pageEl.appendChild(panel);

  /* ── toggle ───────────────────────────────────────── */

  const ICON_BRUSH = `<svg width="18" height="18" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M266.948 28.9252C280.742 28.2215 295.91 34.6103 309.279 37.257C346.677 44.6533 332.804 76.3015 325.495 102.345C327.982 105.735 330.493 108.438 333.307 111.556C347.1 109.533 369.697 81.9787 382.091 73.7588C385.129 71.7438 388.64 70.7603 392.238 71.5679C403.065 73.9987 417.202 93.453 423.215 102.233C429.395 111.268 438.327 123.55 435.744 135.08C432.602 149.153 412.548 165.593 400.73 173.085C402.497 179.922 403.296 185.895 405.679 192.755C418.089 191.716 442.765 189.621 454.191 191.028C458.485 195.01 465.993 203.326 466.993 209.307C469.447 223.988 473.182 264.456 467.001 276.722C459.732 291.13 426.621 293.233 412.132 297.919C402.721 300.957 403.04 308.57 397.683 318.221C404.344 326.992 414.827 338.939 422.063 347.238C426.725 348.534 431.13 349.733 434.865 353.004C437.775 355.546 439.63 359.32 439.67 363.222C439.782 373.129 403.664 415.956 396.228 424.112C389.471 431.516 379.021 437.145 368.81 437.409C365.259 437.497 361.949 436.954 358.767 435.33C346.693 429.181 329.389 405.433 318.499 394.935C307.808 398.301 298.053 404.306 288.562 408.072C262.223 418.539 273.665 418.987 267.948 440.36C266.261 446.637 263.494 452.562 259.776 457.887C254.347 465.747 249.261 469.441 240.09 471.129C237.499 470.009 232.03 469.529 228.935 469.106C218.205 467.73 207.458 466.523 196.687 465.483C183.886 464.252 162.504 463.956 161.577 447.524C160.873 435.027 162.904 414.749 164.32 402.219C154.477 398.117 136.509 384.852 128.753 377.447C115.952 382.885 87.3979 396.406 73.213 394.671C68.8072 394.135 62.9461 387.738 60.5233 383.284C52.0156 367.644 27.8836 322.235 30.3464 306.227C33.057 288.596 77.411 290.635 86.0466 285.325C89.1091 281.143 88.6693 273.955 88.8292 268.606C74.1965 255.26 44.7392 248.408 32.5293 232.2C29.9706 228.801 29.0031 223.764 30.0265 219.814C33.4089 208.755 39.3179 198.489 43.9316 187.814C51.5598 170.151 47.218 143.228 73.9727 144.627C89.8528 145.459 102.878 150.369 117.959 153.111C125.299 147.25 133.871 140.733 139.908 133.641C141.819 131.394 135.854 122.814 134.343 119.92C128.673 109.061 123.06 98.8263 119.678 86.9602C123.628 71.1601 129.553 62.7082 144.945 56.1915C159.17 50.2105 173.323 43.0621 187.796 37.7848C217.253 27.0461 217.781 87.8718 226.832 93.341L228.599 92.8373C242.872 78.7803 234.373 38.0486 266.948 28.9252ZM146.44 88.0317C161.137 117.729 181.959 135.36 145.257 161.539C139.956 165.281 126.219 179.034 119.542 178.123C105.965 176.268 89.0371 171.822 75.1401 169.423C71.9417 177.051 68.9112 189.485 66.0166 197.641C62.8422 206.581 60.4034 212.018 56.2854 220.534L57.1571 220.861C70.3825 226.011 96.2016 244.018 107.82 253.093C115.552 259.138 110.874 290.395 107.764 299.19C103.63 310.888 60.6913 313.887 56.9652 317.997C62.1546 331.63 69.3029 344.608 75.9876 357.577C77.9786 361.439 80.1295 364.078 82.1925 368.356C92.2675 373.905 128.897 345.535 139.036 353.627C151.654 363.694 166.463 375.12 179.968 384.084C193.209 392.872 185.205 424.4 185.597 438.753L185.637 439.96C187.876 440.488 190.147 440.904 192.426 441.199C202.852 442.527 229.815 445.389 239.37 444.638C246.487 444.078 243.936 399.412 259.656 391.696C275.96 383.692 294.647 379.75 309.887 371.106C324.816 362.647 331.212 374.465 340.943 383.62C350.946 393.303 360.59 403.866 371.096 412.958C383.586 402.555 401.585 383.7 408.63 368.868C397.467 352.844 377.653 334.485 368.074 317.141C370.945 306.939 378.245 296.959 383.538 287.788C396.372 265.567 419.648 271.892 444.444 266.671C446.475 256.004 445.843 227.826 444.108 217.791C442.805 210.243 406.063 224.428 393.085 215.104C382.163 208.564 381.515 194.259 377.189 182.281C369.433 160.803 400.122 146.858 409.901 130.163L410.397 129.307C406.743 118.872 397.131 108.254 390.095 99.562C367.602 117.705 334.163 159.1 310.135 125.109C292.967 100.833 309.807 90.9422 310.023 66.6343C310.079 60.8052 277.383 52.6893 272.106 55.0401C255.69 68.3535 261.975 108.813 237.795 116.833C204.156 127.98 199.038 83.8897 191.946 61.4049C176.242 67.322 158.434 76.1336 146.44 88.0317Z" fill="currentColor"/>
    <path d="M243.672 171.302C259.968 170.015 282.717 173.085 295.302 184.072C311.574 198.657 327.086 219.382 329.005 241.875C332.108 278.185 308.072 312.832 272.801 322.299C264.374 324.562 257.889 326.865 249.029 327.664C227.752 326.649 208.689 327.504 189.955 312.944C173.451 300.118 163.68 280.576 161.529 259.882C159.45 241.323 164.967 222.717 176.809 208.276C190.555 191.684 221.651 173.453 243.672 171.302ZM239.89 302.373C267.7 299.814 308.152 283.918 304.33 247.912C301.619 222.365 280.062 193.179 250.932 195.33C219.636 200.336 190.507 217.783 185.141 251.614C184.358 256.556 184.302 261.521 185.101 266.479C186.796 277.337 192.801 287.06 201.757 293.441C212.679 301.205 226.912 302.525 239.89 302.373Z" fill="currentColor"/>
  </svg>`;

  const ICON_CLOSE = `<svg width="18" height="18" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M405.938 46.0368C415.641 46.5928 422.802 46.9841 430.224 54.7485C433.2 57.8597 434.57 66.0154 433.397 68.9068C418.836 104.779 325.294 226.759 300.82 244.269C309.043 253.871 318.966 261.835 326.351 270.311C350.616 298.429 380.537 321.795 406.914 347.698C425.168 365.624 445.617 366.298 450.83 393.253C456.56 422.872 426.434 432.345 405.533 422.037C364.337 401.72 331.516 367.858 296.537 338.855C282.436 326.829 271.945 312.613 256.015 300.751C243.184 313.754 232.429 328.045 219.762 341.016C183.306 377.927 144.651 412.598 104.008 444.84C95.1152 452.046 86.4216 452.601 75.6559 453.963C66.2752 448.919 51.7922 439.731 48.4581 429.01C48.505 424.051 52.1016 419.415 55.4384 415.895C96.0595 373.054 141.565 335.201 181.746 291.766C193.598 278.956 206.617 268.012 217.577 254.191C185.059 219.805 121.74 133.912 128.132 79.6363C128.394 77.4001 133.285 70.9661 134.979 68.7433C146.465 66.633 166.389 53.4221 177.325 65.6228C195.625 86.0408 202.447 121.107 217.166 143.918C230.965 165.307 250.212 191.629 269.188 208.538C327.216 145.143 359.098 117.732 405.938 46.0368Z" fill="currentColor"/>
  </svg>`;

  const closeBtn = panel.querySelector('.mlw-close');
  closeBtn.innerHTML = ICON_CLOSE;

  trigger.addEventListener('click', () => {
    panel.classList.add('open');
    trigger.classList.add('hidden');
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    trigger.classList.remove('hidden');
  });


  /* ── apply saved settings on load ────────────────── */

  const isMobile = window.innerWidth <= 800;
  const saved = loadSaved();
  Object.entries(saved).forEach(([k, v]) => {
    if (isMobile && k === '--pad-page-h') return;
    applyVar(k, v);
  });
  refreshTextColor();

})();
