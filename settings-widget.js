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

  /* ── color shift helpers ─────────────────────────── */

  function hexToHsl(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.slice(0,2), 16) / 255;
    const g = parseInt(hex.slice(2,4), 16) / 255;
    const b = parseInt(hex.slice(4,6), 16) / 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h * 360, s * 100, l * 100];
  }

  function hslToHex(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    let r, g, b;
    if (s === 0) { r = g = b = l; } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  }

  function shiftColor(hex) {
    const [h, s, l] = hexToHsl(hex);
    const newL = l > 55 ? Math.max(10, l - 20) : Math.min(90, l + 20);
    return hslToHex(h, s, newL);
  }

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

  function refreshTextColor(hexOverride) {
    const bgVar = currentPageBgVar();
    if (!bgVar && !hexOverride) return;
    let hex = hexOverride;
    if (!hex) {
      const saved = loadSaved();
      hex = (saved[bgVar] || DEFAULTS[bgVar] || '#ffffff').trim();
    }
    const text    = contrastText(hex);
    const isLight = text === '#FFFFFF';
    applyVar('--color-text',    text);
    applyVar('--color-muted',   isLight ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)');
    applyVar('--color-subtle',  isLight ? 'rgba(255,255,255,0.2)'  : 'rgba(0,0,0,0.13)');
    applyVar('--color-pill-bg', isLight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)');
    applyVar('--illus-invert',  isLight ? '1' : '0');
  }

  /* ── helpers ──────────────────────────────────────── */

  function loadSaved() {
    try { return JSON.parse(sessionStorage.getItem('ml-settings') || '{}'); } catch (e) { return {}; }
  }

  function saveAll() {
    const s = {};
    panel.querySelectorAll('[data-mlvar]').forEach(el => {
      s[el.dataset.mlvar] = el.dataset.mltype === 'range' ? el.value + 'px' : el.value;
    });
    sessionStorage.setItem('ml-settings', JSON.stringify(s));
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

  const SWATCH_BLOBS = [
    { viewBox: '0 0 188 191', d: 'M124.941 19.8216C131.498 19.611 135.767 20.4 141.834 22.8298C151.958 26.7907 160.046 34.6821 164.255 44.7053C164.975 46.4043 166.414 50.3704 166.685 52.1858C168.113 61.7362 168.389 72.3749 163.895 81.1714C160.605 87.6109 156.424 93.5624 155.424 100.806C154.856 104.914 155.458 108.015 156.247 112.016C157.232 118.963 158.771 126.451 156.482 133.247C155.67 135.657 154.047 137.317 152.993 139.938C150.257 141.486 148.296 143.182 145.214 144.491C141.937 145.882 140.841 145.797 137.492 145.95C130.945 146.248 126.62 144.002 120.765 141.585C118.156 140.508 113.509 138.478 110.731 138.227C104.645 137.676 101.86 139.824 97.6216 143.746C95.9005 145.339 94.105 146.754 92.3941 148.495C91.4257 149.48 89.5285 151.544 88.5132 152.318C84.0298 155.738 80.0682 158.957 74.8471 161.29C73.7774 161.804 72.3917 162.034 71.3335 162.485C66.3533 164.605 61.263 164.92 55.9072 164.947C53.062 164.961 49.8681 164.996 46.9586 164.66L46.8626 164.645C39.9354 163.507 32.1589 159.198 26.9527 154.527C20.7092 149.175 17.005 142.939 16.5663 134.675C15.591 121.674 25.089 110.684 34.5686 102.94C43.6003 96.1188 43.6057 89.9981 35.5039 81.9392C25.9902 72.476 16.0449 59.7685 26.5832 46.8192C27.7617 45.3711 32.5859 42.2753 34.3977 41.6656C45.5078 37.9271 56.4199 40.4121 67.6609 41.7327C71.4029 42.1711 75.554 43.9229 79.3173 42.7473C84.829 41.0254 89.0106 37.6132 93.1634 33.7676C102.003 25.9788 113.112 20.3772 124.941 19.8216Z' },
    { viewBox: '0 0 187 173', d: 'M85.0731 25.015C92.8327 24.6671 97.5308 28.8188 102.945 33.5765C110 39.7753 120.307 41.7063 129.154 38.6948C132.761 37.4671 135.838 34.6141 139.921 34.5703C164.622 31.1317 179.382 60.8442 161.669 78.4328C161.014 79.0833 159.639 79.8367 158.827 80.3948C157.591 81.2445 156.321 82.0121 155.101 82.8981C152.199 84.9995 149.599 87.489 147.374 90.2971C142.619 96.2129 139.864 107.331 141.386 114.657C142.078 117.987 143.354 120.702 143.873 124.359C145.52 135.938 140.683 146.194 130.876 152.456C128.386 154.018 121.491 155.643 118.473 155.946C108.226 156.323 98.6523 150.855 93.77 141.838C91.8729 138.341 90.7986 134.461 88.6765 130.834C85.4893 125.388 80.259 120.81 74.8748 117.618C72.3572 116.125 64.484 113.399 61.5216 113.025C54.1275 112.287 49.3276 113.798 42.3311 110.429C33.3456 106.102 27.3394 99.468 25.5812 89.4127C25.309 87.8549 24.699 86.4096 24.5336 84.6411C24.2915 82.0526 24.8018 80.0212 25.5189 77.5378C26.3236 73.3694 27.305 71.8358 29.5527 68.4101C32.9973 63.1605 37.0155 59.3273 42.964 57.0359C48.5169 55.0215 54.4932 54.0814 59.1802 50.2342C65.8453 44.7631 68.9635 37.4403 73.6893 30.5733C75.7891 27.5221 81.3447 25.3802 85.0731 25.015Z' },
    { viewBox: '0 0 184 164', d: 'M131.745 10.8011C139.463 10.3579 148.682 14.1574 153.552 20.2529C155.061 22.1419 158.277 27.1694 158.905 29.5919C159.841 33.1991 160.248 38.1883 159.89 41.8807C159.849 44.981 158.879 46.9639 157.764 49.6649C154.821 56.7935 148.379 59.7461 142.594 64.1367C139.196 66.7158 137.135 71.0352 136.075 75.0689C135.092 78.8097 135.208 80.8198 136.318 84.5995C138.378 95.0387 148.244 96.6465 154.313 103.894C159.668 110.362 160.283 116.829 159.731 124.913C159.218 132.431 155.525 137.62 149.928 142.484C147.844 144.295 146.766 144.301 144.508 145.417C139.767 147.797 134.728 148.457 129.48 147.829C121.513 146.875 115.673 142.559 110.893 136.309C110.184 135.383 109.185 133.806 108.472 133.064C105.766 130.245 102.759 127.726 98.6629 127.632C91.8164 127.095 88.1775 128.783 83.0397 132.983C78.9092 136.859 75.3494 137.666 70.1818 138.384C53.8685 140.653 41.4022 132.428 38.2465 116.004C38.0899 115.189 35.9813 110.72 35.4366 109.592C29.678 97.6676 19.297 87.0392 17.9386 73.3617C17.6898 69.8408 17.6387 64.4453 18.7672 61.074C19.2155 59.7353 21.0735 54.6649 21.6577 53.6455C23.4287 50.8242 25.9387 46.977 28.1311 44.5637C35.1437 36.8441 44.4548 30.0349 54.5194 27.0182C57.5463 26.1109 60.1088 24.6676 63.5163 24.4162C65.1658 24.2944 67.5825 23.2225 69.3449 23.1279C74.5482 22.5816 80.8649 22.2007 86.0585 22.8956C94.447 24.018 104.221 28.7172 111.239 21.4501C117.537 14.928 122.544 11.6437 131.745 10.8011Z' },
  ];

  const _blobKnobSvg = `<svg viewBox="0 0 210 183" xmlns="http://www.w3.org/2000/svg"><path d="M72.168 26.2671C74.626 26.1421 76.1481 26.1737 78.0215 26.5259C81.6176 27.202 84.4663 29.5513 89.3809 33.811C93.6785 37.5361 99.9974 43.1269 109.042 44.062C120.073 45.2025 129.674 39.6729 135.918 36.687C137.284 36.0641 138.826 35.2607 139.729 34.8149C140.858 34.2587 141.661 33.9097 142.356 33.6929C151.42 30.919 159.459 33.6772 163.376 40.8853V40.8862C165.331 44.4835 165.982 49.1051 165.066 52.769V52.77C164.724 54.1415 163.777 56.184 162.22 58.7778C160.716 61.2825 159.008 63.7167 157.446 65.9829H157.445C154.704 69.9615 149.535 76.169 149.576 85.3589C149.574 86.8968 149.68 88.4063 149.734 89.4771V89.4761C149.879 93.3616 151.087 96.617 152.171 99.0815C153.526 102.162 154.129 103.038 154.891 105.08V105.081C156.979 110.679 156.364 116.085 153.24 121.815C149.575 128.537 145.165 132.907 138.361 137.821C136.41 139.23 135.406 140.017 134.312 140.599L134.196 140.661L134.082 140.727C128.394 143.999 123.961 146.272 118.162 148.185H118.161C118.194 148.174 118.125 148.198 117.893 148.251C117.668 148.303 117.396 148.358 117.026 148.429C116.579 148.516 115.822 148.655 115.052 148.832L114.288 149.02C111.873 149.666 110.556 150.055 109.105 150.226L109.029 150.236C103.247 150.975 97.4122 149.338 92.8574 145.7L92.8486 145.694L92.5 145.404C88.93 142.332 86.6217 136.759 86.1094 130.583C86.0217 129.527 86.009 128.453 85.9814 126.958C85.956 125.577 85.917 123.844 85.7061 122.042C84.8866 115.039 82.4748 108.472 76.9062 102.901L76.3574 102.365C69.3407 95.6726 62.0869 93.761 56.3369 92.4321C50.489 91.0806 47.084 90.3995 43.6494 87.6675C39.8982 84.6835 36.9028 78.3919 36.2402 72.5151C35.8857 69.3705 37.0229 64.0934 39.6592 57.8687C42.1911 51.8904 45.5698 46.2838 48.2939 42.8726C52.7152 37.3361 59.5968 30.8788 64.7666 28.4634C64.9052 28.3986 65.176 28.2946 65.79 28.1089C66.2049 27.9835 67.3233 27.6676 68.1572 27.3882L68.1562 27.3872C70.1758 26.7108 71.1526 26.4009 72.168 26.2671Z" fill="white" stroke="%231A1A1A" stroke-width="16"/></svg>`;
  const _blobKnobUrl = 'url("data:image/svg+xml,' + _blobKnobSvg.replace(/"/g,"'").replace(/</g,'%3C').replace(/>/g,'%3E') + '")';

  const style = document.createElement('style');
  style.textContent = `
    .mlw-trigger {
      display: block;
      width: 100%;
      color: var(--color-text);
    }
    .mlw-trigger svg { display: block; width: 100%; height: auto; }
    .mlw-trigger path[data-action], .mlw-trigger path[data-color] { cursor: pointer; }
    .mlw-trigger path[data-color]:hover { opacity: 0.75; transition: opacity 0.15s; }
    .mlw-brush-group { cursor: pointer; }
    .mlw-tooltip {
      position: fixed;
      z-index: 9999;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #1A1A1A;
      background: #FFFFFF;
      padding: 5px 10px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      white-space: nowrap;
    }
    .mlw-tooltip.visible { opacity: 1; }

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
      position: fixed;
      z-index: 9998;
      max-height: 80vh;
      overflow-y: auto;
      background: #FFFFFF;
      font-family: 'Inter', system-ui, sans-serif;
      opacity: 0;
      transform: translateY(-8px) scaleY(0.96);
      transform-origin: top center;
      transition: opacity 0.3s ease-out, transform 0.3s ease-out;
      pointer-events: none;
      padding-bottom: 24px;
    }
    .mlw-panel.open { opacity: 1; transform: translateY(0) scaleY(1); pointer-events: auto; }

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
      width: 22px;
      height: 20px;
      background: ${_blobKnobUrl} center/contain no-repeat;
      cursor: grab;
      border: none;
      border-radius: 0;
    }
    .mlw-slider::-moz-range-thumb {
      width: 22px;
      height: 20px;
      background: ${_blobKnobUrl} center/contain no-repeat;
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
      height: 40px;
      cursor: pointer;
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

  /* ── apply saved settings on all pages ──────────── */
  const isMobile = window.innerWidth <= 800;
  if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
    sessionStorage.removeItem('ml-settings');
  }
  const saved = loadSaved();
  Object.entries(saved).forEach(([k, v]) => {
    if (isMobile && k === '--pad-page-h') return;
    applyVar(k, v);
  });
  refreshTextColor();

  /* ── UI only on home page ────────────────────────── */
  if (!location.pathname.match(/^\/?(index\.html)?$/)) return;

  /* ── trigger button ───────────────────────────────── */

  const trigger = document.createElement('div');
  trigger.className = 'mlw-trigger';
  trigger.innerHTML = `<svg viewBox="0 0 766 563" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g class="mlw-brush-group">
    <path data-action="settings" style="cursor:pointer" d="M445.657 555.559C443.528 554.556 440.986 553.369 440.453 550.934C437.369 536.913 457.931 541.2 461.089 527.541C466.257 505.162 458.796 482.087 471.446 461.508C480.63 445.977 490.62 439.891 507.463 435.074C516.917 422.504 514.181 410.582 520.261 396.096C525.603 383.392 531.795 371.041 537.814 358.649C548.77 335.687 560.193 312.952 572.068 290.453C581.222 273.284 592.443 255.913 601.915 238.682L654.435 142.178C673.402 106.72 691.338 71.2798 713.402 37.4789C717.357 31.42 725.369 13.9396 730.367 10.5274C738.816 9.76833 742.483 16.1381 743.229 23.6911C743.239 24.3268 743.244 24.9588 743.247 25.5931C743.357 47.5461 730.373 73.6401 722.327 93.8754C716.952 107.38 708.198 122.211 701.286 135.214C690.088 156.243 679.367 177.522 669.142 199.041C663.149 211.968 656.97 224.922 651.178 237.922C630.683 283.928 613.235 331.55 587.953 375.331C573.048 401.344 554.741 425.254 533.517 446.429C545.814 473.523 542.221 500.954 520.404 521.941C505.387 536.385 483.49 540.583 465.419 549.892C459.45 552.966 452.408 555.713 445.657 555.559ZM729.975 39.7796L730.004 36.5791L729.293 36.1484C726.825 38.3214 722.287 47.2949 720.224 50.6361C708.226 69.7098 696.947 89.2275 686.41 109.146C679.025 123.103 672.581 137.98 664.81 151.616C641.559 192.42 620.794 234.987 596.805 275.312C575.029 311.925 557.691 350.187 538.141 387.976C532.733 398.427 527.835 411.213 526.273 422.913C525.595 427.744 522.425 428.245 526.03 432.683C540.044 418.939 556.708 395.746 567.978 378.922C595.009 338.552 613.322 291.438 633.206 247.339C642.681 226.117 653.292 204.991 663.283 183.959C671.031 167.448 679.235 151.156 687.891 135.103C702.594 107.314 722.453 70.3211 729.975 39.7796ZM521.893 450.005C518.827 449.184 515.324 448.339 512.38 447.274C476.644 461.219 471.643 479.182 474.066 515.01C474.247 517.684 471.735 527.769 472.978 529.612C498.297 519.915 511.049 520.044 525.264 491.499C531.454 479.071 526.663 463.022 521.893 450.005Z" fill="currentColor"/>
    </g>
    <path d="M248.762 50.464C265.487 49.2837 289.553 50.531 306.094 53.5041C320.697 56.1294 335.267 59.2751 350.281 61.4403C364.784 63.5326 381.851 70.0377 396.533 73.0606C404.761 74.7552 416.701 83.478 425.214 86.163C432.678 89.612 447.998 96.0926 454.439 99.7832C469.301 109.178 487.038 118.44 499.861 130.479C517.678 147.207 536.783 163.459 548.245 185.366C559.919 207.691 565.384 231.008 557.96 255.618C554.992 265.45 547.455 277.177 540.601 284.981C522.971 300.927 496.654 320.783 475.689 331.255C434.856 351.654 422.611 360.98 406.209 405.543C389.886 449.9 354.252 489.443 311.832 511.726C295.025 521.278 273.124 530.086 253.492 530.684C234.185 531.274 212.041 530.093 193.316 525.539C186.634 523.913 180.215 521.218 173.84 518.676C147.212 508.069 122.78 494.102 101.893 474.249C89.0178 462.008 66.3533 439.183 57.257 424.935C42.2166 401.379 18.7002 317.407 18.0069 288.148C17.6948 274.977 18.8244 262.269 19.8524 249.191C23.0485 208.531 28.2388 176.512 49.2949 140.661C54.8411 131.218 60.8416 121.822 68.4451 113.879C80.7143 101.064 107.534 80.3874 123.58 72.9623C132.372 68.8933 143.16 67.8087 152.559 65.5704C174.469 60.3511 196.014 53.9893 218.509 51.5499C228.446 50.4719 238.754 50.6843 248.762 50.464ZM312.868 497.694C343.813 477.375 371.903 450.278 386.227 415.531C394.853 396.993 402.005 363.892 417.378 350.067C449.001 321.629 490.272 309.589 521.888 280C566.905 237.875 540.781 182.977 501.262 148.333C484.78 133.886 469.706 118.774 448.576 109.605C432.492 103.009 408.851 87.4654 393.126 82.937C344.597 68.961 292.926 58.1546 242.208 61.0115C232.743 61.5253 221.072 62.1187 211.912 63.7456C194.196 66.892 176.566 71.7954 159.133 76.2228C152.187 77.9872 139.373 78.8501 133.489 81.8365C114.244 91.6054 94.9903 105.572 80.6214 121.65C72.6154 130.609 67.2306 139.951 61.586 149.857C43.6683 181.304 33.9789 216.14 32.9961 252.323C32.6482 265.146 31.2749 275.698 32.3414 289.231C33.2651 300.945 34.143 313.093 36.938 324.658C39.399 334.842 42.9451 346.334 46.0031 356.447C51.4531 374.472 58.1502 400.718 67.4225 416.826C78.4486 435.98 99.1733 456.844 115.544 471.985C123.858 479.678 134.545 486.21 143.98 492.144C168.502 507.564 192.762 517.62 222.091 519.492C229.826 519.99 238.848 521.085 246.703 520.335C269.139 518.198 293.65 508.865 312.868 497.694Z" fill="currentColor"/>
    <path data-color="#C8341A" d="M114.379 255.433C124.489 254.559 140.574 262.504 146.633 270.645C154.2 280.816 145.979 294.086 144.069 304.856C148.72 315.505 156.465 316.77 155.939 329.086C155.658 335.698 152.385 343.522 147.342 347.856C140.43 353.793 136.149 353.734 127.998 353.437C120.436 358.073 117.849 360.285 109.016 361.933C99.779 363.091 85.8935 359.751 78.879 353.78C61.181 338.718 54.9641 313.173 80.2284 301.464C83.5852 299.908 92.8887 300.491 93.9233 297.211C97.3738 286.271 90.532 273.776 98.6163 263.755C101.637 260.011 109.712 255.925 114.379 255.433Z" fill="#C8341A"/>
    <path data-color="#F5C842" d="M252.662 85.2149C265.022 84.3526 266.457 89.0436 275.096 95.8348C277.899 97.5732 281.299 98.8391 284.181 100.374C300.324 108.992 317.596 125.34 300.145 142.733C295.742 147.122 290.25 150.762 287.089 156.225C283.39 162.621 286.133 172.947 279.419 177.596C273.39 181.524 266.198 182.203 259.087 180.821C249.285 180.937 248.023 181.071 239.944 175.101C229.759 167.575 216.701 162.526 209.575 151.33C207.523 148.105 210.104 142.092 211.741 139.064C215.655 132.341 221.635 127.566 226.132 121.164C224.12 118.792 222.091 116.098 220.159 113.634C220.451 112.096 221.2 108.53 221.678 107.237C224.73 98.9997 244.638 88.8637 252.662 85.2149Z" fill="#F5C842"/>
    <path data-color="#4E9AC3" d="M126.44 137.933C130.765 137.472 139.713 139.547 144.096 141.168C159.368 146.818 170.833 171.126 164.355 186.167C163.709 187.667 160.84 194.07 160.81 195.261C160.49 208.047 158.481 218.416 145.055 223.571C134.311 227.676 125.248 225.461 114.845 220.872C107.969 220.264 99.6818 220.45 92.3864 219.931C83.1181 213.351 73.3836 209.239 71.8755 196.565C71.238 191.207 68.682 181.663 72.3669 177.023C77.3733 169.342 99.1758 181.273 99.7057 168.449C100.54 148.245 103.59 141.13 126.44 137.933Z" fill="#4E9AC3"/>
    <path data-color="#5BB870" d="M166.957 385.502C188.447 383.903 186.747 407.195 194.492 418.367C201.169 427.996 221.69 436.522 218.699 451.488C215.053 469.729 201.78 456.771 191.301 461.922C185.67 465.069 182.97 473.014 176.494 477.309C169.871 479.38 170.091 477.389 164.368 476.081C161.809 475.49 158.051 478.617 153.971 475.052C135.964 459.307 112.344 432.438 130.641 408.142C139.203 396.487 152.674 388.144 166.957 385.502Z" fill="#5BB870"/>
    <path data-color="#F58A42" d="M495.9 244.077C496.446 265.094 473.828 262.341 462.576 269.363C452.879 275.416 443.603 295.013 429.16 291.393C411.556 286.982 424.808 274.658 420.281 264.203C417.48 258.567 409.864 255.561 405.984 249.049C404.278 242.497 406.208 242.806 407.752 237.289C408.448 234.824 405.578 231.014 409.244 227.206C425.435 210.399 452.732 188.646 475.547 207.621C486.502 216.513 493.998 230.034 495.9 244.077Z" fill="#F58A42"/>
    <path data-color="#9B6DD9" d="M393.187 98.2571C399.422 97.8542 411.966 103.247 415.087 108.98C420.758 119.404 415.446 133.403 419.835 144.233C422.233 150.139 428.634 155.851 426.463 162.918C421.429 176.177 394.335 173.076 383.983 170.26C381.725 171.129 380.125 171.894 377.966 172.95C358.27 186.191 339.079 168.309 344.85 147.763C346.835 140.686 354.286 118.248 358.868 113.076C365.947 105.079 382.668 99.6643 393.187 98.2571Z" fill="#9B6DD9"/>
    <path d="M322.161 395.147C336.69 393.835 359.328 405.293 359.401 421.831C359.435 428.832 351.34 438.293 346.392 443.013C337.255 451.735 319.657 453.129 307.638 452.638C300.539 452.206 280.71 451.409 275.703 445.953C260.39 429.295 272.217 411.606 289.429 403.027C301.276 397.125 308.919 395.663 322.161 395.147Z" fill="none" stroke="currentColor" stroke-width="14"/>
  </svg>`;
  const illusSlot = document.getElementById('mlw-illus');
  const pageEl = document.querySelector('.page') || document.body;
  (illusSlot || pageEl).appendChild(trigger);

  /* ── panel ────────────────────────────────────────── */

  const panel = document.createElement('div');
  panel.className = 'mlw-panel';

  panel.innerHTML = `
    <div class="mlw-header">
      <span class="mlw-title">Settings</span>
      <button class="mlw-close" aria-label="Close settings"></button>
    </div>
  `;

  let _colorIdx = 0;
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

        const blob = SWATCH_BLOBS[_colorIdx % SWATCH_BLOBS.length];
        _colorIdx++;
        const blobSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        blobSvg.setAttribute('viewBox', blob.viewBox);
        blobSvg.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
        const blobPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        blobPath.setAttribute('d', blob.d);
        blobPath.setAttribute('fill', colorInput.value);
        blobSvg.appendChild(blobPath);
        swatchWrap.appendChild(blobSvg);
        swatchWrap.appendChild(colorInput);
        row.appendChild(swatchWrap);

        const hexDisplay = document.createElement('span');
        hexDisplay.className = 'mlw-value';
        hexDisplay.style.fontSize = '11px';
        hexDisplay.style.letterSpacing = '0.04em';
        hexDisplay.textContent = colorInput.value.toUpperCase();
        row.appendChild(hexDisplay);

        colorInput.addEventListener('input', () => {
          blobPath.setAttribute('fill', colorInput.value);
          hexDisplay.textContent = colorInput.value.toUpperCase();
          applyVar(item.var, colorInput.value);
          saveAll();
          refreshTextColor();
        });

        const resetBtn = document.createElement('button');
        resetBtn.className = 'mlw-reset';
        resetBtn.textContent = '↺';
        resetBtn.title = 'Reset';
        resetBtn.addEventListener('click', () => {
          const def = rawDefault(item.var);
          colorInput.value = def;
          blobPath.setAttribute('fill', def);
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
          if (!(isMobile && item.var === '--pad-page-h')) applyVar(item.var, slider.value + 'px');
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
          if (!(isMobile && item.var === '--pad-page-h')) applyVar(item.var, def + 'px');
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

  const ICON_BRUSH = `<svg width="18" height="18" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M266.948 28.9252C280.742 28.2215 295.91 34.6103 309.279 37.257C346.677 44.6533 332.804 76.3015 325.495 102.345C327.982 105.735 330.493 108.438 333.307 111.556C347.1 109.533 369.697 81.9787 382.091 73.7588C385.129 71.7438 388.64 70.7603 392.238 71.5679C403.065 73.9987 417.202 93.453 423.215 102.233C429.395 111.268 438.327 123.55 435.744 135.08C432.602 149.153 412.548 165.593 400.73 173.085C402.497 179.922 403.296 185.895 405.679 192.755C418.089 191.716 442.765 189.621 454.191 191.028C458.485 195.01 465.993 203.326 466.993 209.307C469.447 223.988 473.182 264.456 467.001 276.722C459.732 291.13 426.621 293.233 412.132 297.919C402.721 300.957 403.04 308.57 397.683 318.221C404.344 326.992 414.827 338.939 422.063 347.238C426.725 348.534 431.13 349.733 434.865 353.004C437.775 355.546 439.63 359.32 439.67 363.222C439.782 373.129 403.664 415.956 396.228 424.112C389.471 431.516 379.021 437.145 368.81 437.409C365.259 437.497 361.949 436.954 358.767 435.33C346.693 429.181 329.389 405.433 318.499 394.935C307.808 398.301 298.053 404.306 288.562 408.072C262.223 418.539 273.665 418.987 267.948 440.36C266.261 446.637 263.494 452.562 259.776 457.887C254.347 465.747 249.261 469.441 240.09 471.129C237.499 470.009 232.03 469.529 228.935 469.106C218.205 467.73 207.458 466.523 196.687 465.483C183.886 464.252 162.504 463.956 161.577 447.524C160.873 435.027 162.904 414.749 164.32 402.219C154.477 398.117 136.509 384.852 128.753 377.447C115.952 382.885 87.3979 396.406 73.213 394.671C68.8072 394.135 62.9461 387.738 60.5233 383.284C52.0156 367.644 27.8836 322.235 30.3464 306.227C33.057 288.596 77.411 290.635 86.0466 285.325C89.1091 281.143 88.6693 273.955 88.8292 268.606C74.1965 255.26 44.7392 248.408 32.5293 232.2C29.9706 228.801 29.0031 223.764 30.0265 219.814C33.4089 208.755 39.3179 198.489 43.9316 187.814C51.5598 170.151 47.218 143.228 73.9727 144.627C89.8528 145.459 102.878 150.369 117.959 153.111C125.299 147.25 133.871 140.733 139.908 133.641C141.819 131.394 135.854 122.814 134.343 119.92C128.673 109.061 123.06 98.8263 119.678 86.9602C123.628 71.1601 129.553 62.7082 144.945 56.1915C159.17 50.2105 173.323 43.0621 187.796 37.7848C217.253 27.0461 217.781 87.8718 226.832 93.341L228.599 92.8373C242.872 78.7803 234.373 38.0486 266.948 28.9252ZM146.44 88.0317C161.137 117.729 181.959 135.36 145.257 161.539C139.956 165.281 126.219 179.034 119.542 178.123C105.965 176.268 89.0371 171.822 75.1401 169.423C71.9417 177.051 68.9112 189.485 66.0166 197.641C62.8422 206.581 60.4034 212.018 56.2854 220.534L57.1571 220.861C70.3825 226.011 96.2016 244.018 107.82 253.093C115.552 259.138 110.874 290.395 107.764 299.19C103.63 310.888 60.6913 313.887 56.9652 317.997C62.1546 331.63 69.3029 344.608 75.9876 357.577C77.9786 361.439 80.1295 364.078 82.1925 368.356C92.2675 373.905 128.897 345.535 139.036 353.627C151.654 363.694 166.463 375.12 179.968 384.084C193.209 392.872 185.205 424.4 185.597 438.753L185.637 439.96C187.876 440.488 190.147 440.904 192.426 441.199C202.852 442.527 229.815 445.389 239.37 444.638C246.487 444.078 243.936 399.412 259.656 391.696C275.96 383.692 294.647 379.75 309.887 371.106C324.816 362.647 331.212 374.465 340.943 383.62C350.946 393.303 360.59 403.866 371.096 412.958C383.586 402.555 401.585 383.7 408.63 368.868C397.467 352.844 377.653 334.485 368.074 317.141C370.945 306.939 378.245 296.959 383.538 287.788C396.372 265.567 419.648 271.892 444.444 266.671C446.475 256.004 445.843 227.826 444.108 217.791C442.805 210.243 406.063 224.428 393.085 215.104C382.163 208.564 381.515 194.259 377.189 182.281C369.433 160.803 400.122 146.858 409.901 130.163L410.397 129.307C406.743 118.872 397.131 108.254 390.095 99.562C367.602 117.705 334.163 159.1 310.135 125.109C292.967 100.833 309.807 90.9422 310.023 66.6343C310.079 60.8052 277.383 52.6893 272.106 55.0401C255.69 68.3535 261.975 108.813 237.795 116.833C204.156 127.98 199.038 83.8897 191.946 61.4049C176.242 67.322 158.434 76.1336 146.44 88.0317Z" fill="currentColor"/>
    <path d="M243.672 171.302C259.968 170.015 282.717 173.085 295.302 184.072C311.574 198.657 327.086 219.382 329.005 241.875C332.108 278.185 308.072 312.832 272.801 322.299C264.374 324.562 257.889 326.865 249.029 327.664C227.752 326.649 208.689 327.504 189.955 312.944C173.451 300.118 163.68 280.576 161.529 259.882C159.45 241.323 164.967 222.717 176.809 208.276C190.555 191.684 221.651 173.453 243.672 171.302ZM239.89 302.373C267.7 299.814 308.152 283.918 304.33 247.912C301.619 222.365 280.062 193.179 250.932 195.33C219.636 200.336 190.507 217.783 185.141 251.614C184.358 256.556 184.302 261.521 185.101 266.479C186.796 277.337 192.801 287.06 201.757 293.441C212.679 301.205 226.912 302.525 239.89 302.373Z" fill="currentColor"/>
  </svg>`;

  const ICON_CLOSE = `<svg width="18" height="18" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M405.938 46.0368C415.641 46.5928 422.802 46.9841 430.224 54.7485C433.2 57.8597 434.57 66.0154 433.397 68.9068C418.836 104.779 325.294 226.759 300.82 244.269C309.043 253.871 318.966 261.835 326.351 270.311C350.616 298.429 380.537 321.795 406.914 347.698C425.168 365.624 445.617 366.298 450.83 393.253C456.56 422.872 426.434 432.345 405.533 422.037C364.337 401.72 331.516 367.858 296.537 338.855C282.436 326.829 271.945 312.613 256.015 300.751C243.184 313.754 232.429 328.045 219.762 341.016C183.306 377.927 144.651 412.598 104.008 444.84C95.1152 452.046 86.4216 452.601 75.6559 453.963C66.2752 448.919 51.7922 439.731 48.4581 429.01C48.505 424.051 52.1016 419.415 55.4384 415.895C96.0595 373.054 141.565 335.201 181.746 291.766C193.598 278.956 206.617 268.012 217.577 254.191C185.059 219.805 121.74 133.912 128.132 79.6363C128.394 77.4001 133.285 70.9661 134.979 68.7433C146.465 66.633 166.389 53.4221 177.325 65.6228C195.625 86.0408 202.447 121.107 217.166 143.918C230.965 165.307 250.212 191.629 269.188 208.538C327.216 145.143 359.098 117.732 405.938 46.0368Z" fill="currentColor"/>
  </svg>`;

  const closeBtn = panel.querySelector('.mlw-close');
  closeBtn.innerHTML = ICON_CLOSE;

  // Blob click — change page color, then shift blob to next shade
  trigger.addEventListener('click', (e) => {
    const path = e.target.closest('path[data-color]');
    if (!path) return;
    const hex = path.dataset.color;
    applyVar('--color-work', hex);
    refreshTextColor(hex);
    const s = loadSaved();
    s['--color-work'] = hex;
    sessionStorage.setItem('ml-settings', JSON.stringify(s));
    const input = panel.querySelector('[data-mlvar="--color-work"]');
    if (input) {
      input.value = hex;
      const swatchWrap = input.parentElement;
      const swatchPath = swatchWrap && swatchWrap.querySelector('path');
      if (swatchPath) swatchPath.setAttribute('fill', hex);
      const hexDisplay = swatchWrap && swatchWrap.nextElementSibling;
      if (hexDisplay) hexDisplay.textContent = hex.toUpperCase();
    }
    const nextColor = shiftColor(hex);
    path.setAttribute('fill', nextColor);
    path.dataset.color = nextColor;
  });

  const brushPath = trigger.querySelector('.mlw-brush-group');

  const tooltip = document.createElement('div');
  tooltip.className = 'mlw-tooltip';
  tooltip.textContent = 'Page settings';
  document.body.appendChild(tooltip);

  if (brushPath) {
    brushPath.addEventListener('mouseenter', (e) => {
      tooltip.style.left = e.clientX + 14 + 'px';
      tooltip.style.top = e.clientY + 14 + 'px';
      tooltip.classList.add('visible');
    });
    brushPath.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.clientX + 14 + 'px';
      tooltip.style.top = e.clientY + 14 + 'px';
    });
    brushPath.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  }

  brushPath && brushPath.addEventListener('click', (e) => {
    tooltip.classList.remove('visible');

    const col = document.getElementById('mlw-illus') || document.querySelector('.right-col');
    const rect = col ? col.getBoundingClientRect() : null;
    if (rect) {
      panel.style.left  = rect.left + 'px';
      panel.style.width = rect.width + 'px';
    }

    if (!panel.classList.contains('open')) {
      const panelH = panel.offsetHeight || 400;
      const margin = 8;
      // Prefer above the click; clamp so panel is always fully on-screen
      let top = e.clientY - panelH - 10;
      top = Math.max(margin, top);
      if (top + panelH > window.innerHeight - margin) {
        top = window.innerHeight - panelH - margin;
      }
      panel.style.top = Math.max(margin, top) + 'px';
    }

    panel.classList.toggle('open');
  });

  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !trigger.contains(e.target)) {
      panel.classList.remove('open');
    }
  });


})();
