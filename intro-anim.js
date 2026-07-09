/* ============================================================
   Intro animation — wave → sun → spiral scenes on a fullscreen
   overlay, then the retro windows pop in and the overlay fades
   to reveal the page. Replaces retro-windows.js (drag/close/
   typing behaviors are carried over here).

   Depends on: #intro-overlay (+ #ascii canvas inside it),
   #retro-windows section markup, /styles/intro-anim.css,
   /styles/retro-windows.css.
   ============================================================ */
(function () {
  var overlay = document.getElementById('intro-overlay')
  var canvas = document.getElementById('ascii')
  var section = document.getElementById('retro-windows')
  if (!overlay || !canvas || !section) return

  /* ═══ Timeline (ms) — tune everything here ═══════════ */
  var T = {
    waveFadeIn:   400,    // wave letters fade in
    toOlive:      1100,   // bg tweens to olive, wave fades
    sunStart:     1600,   // sun ray-reveal begins
    sunReveal:    1300,   // duration of ray reveal
    toRust:       3100,   // bg tweens to rust, sun fades
    spiralStart:  3400,   // spiral reveal begins
    spiralReveal: 2800,   // duration of spiral reveal
    windows:      6000,   // retro windows pop in (right as spiral completes)
    toPaper:      7100,   // overlay fades out, page revealed
    fadeOut:      600,    // sun/spiral fade-out duration
  }

  var WAVE = {
    text: 'ML', rows: 12,
    amplitude: 40, frequency: 2,
    colSpacing: 28, rowSpacing: 32,
    fontSize: 16, color: '#F7F5F0', animSpeed: 2,
  }

  var SUN = {
    text: 'ML', rays: 8,
    innerRadius: 60, rayLength: 180,
    fontSize: 18, letterSpacing: 24, color: '#141414',
  }

  var SPIRAL = {
    text: 'ML', turns: 4,
    letterSpacing: 20, startRadius: 20, spiralGrowth: 30,
    fontSize: 14, color: '#141414',
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var mqMobile = window.matchMedia('(max-width: 800px)')

  /* ═══ Canvas: full viewport, rebuilt on resize ═══════ */
  var ctx = canvas.getContext('2d')
  var dpr = Math.min(window.devicePixelRatio || 1, 2)

  var W = 0, H = 0
  var waveLetters = []
  var sunLetters = []
  var sunMaxStep = 0

  function layout() {
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    /* Wave letters — edge to edge */
    waveLetters.length = 0
    var chars = WAVE.text
    var columns = Math.ceil(W / WAVE.colSpacing) + 1
    var i = 0
    for (var row = 0; row < WAVE.rows; row++) {
      var rowOffset = (row - (WAVE.rows - 1) / 2) * WAVE.rowSpacing
      var phaseOffset = (row / WAVE.rows) * Math.PI * 2
      for (var col = 0; col < columns; col++) {
        var frac = col / columns
        waveLetters.push({
          x: col * WAVE.colSpacing,
          baseY: H / 2 + rowOffset + Math.sin(frac * Math.PI * 2 * WAVE.frequency + phaseOffset) * WAVE.amplitude,
          phase: frac * Math.PI * 2 * WAVE.frequency,
          char: chars[i % chars.length],
        })
        i++
      }
    }

    /* Sun letters — centered */
    sunLetters.length = 0
    sunMaxStep = 0
    var stepsOnRay = Math.floor(SUN.rayLength / SUN.letterSpacing)
    var j = 0
    for (var ray = 0; ray < SUN.rays; ray++) {
      var angle = (ray / SUN.rays) * Math.PI * 2 - Math.PI / 2
      for (var step = 0; step <= stepsOnRay; step++) {
        var dist = SUN.innerRadius + step * SUN.letterSpacing
        sunLetters.push({
          x: W / 2 + Math.cos(angle) * dist,
          y: H / 2 + Math.sin(angle) * dist,
          step: step, char: SUN.text[j % SUN.text.length],
        })
        sunMaxStep = Math.max(sunMaxStep, step)
        j++
      }
    }
  }
  layout()
  window.addEventListener('resize', layout)

  /* Spiral points — size-independent, drawn at canvas center */
  var spiralPoints = []
  var spiralMinR = Infinity, spiralMaxR = 0
  ;(function () {
    var totalAngle = SPIRAL.turns * Math.PI * 2
    var angle = 0, i = 0
    while (angle < totalAngle) {
      var r = SPIRAL.startRadius + (angle / (Math.PI * 2)) * SPIRAL.spiralGrowth
      spiralPoints.push({ angle: angle, r: r, char: SPIRAL.text[i % SPIRAL.text.length] })
      spiralMinR = Math.min(spiralMinR, r)
      spiralMaxR = Math.max(spiralMaxR, r)
      i++
      angle += SPIRAL.letterSpacing / Math.max(1, r)
    }
  })()
  var spiralRange = Math.max(1, spiralMaxR - spiralMinR)

  /* ═══ Draw helpers ═══════════════════════════════════ */
  function drawWave(elapsed, alpha) {
    ctx.font = WAVE.fontSize + "px 'GT Mechanik Mono', monospace"
    ctx.fillStyle = WAVE.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    var animAmp = WAVE.amplitude * 0.4
    var frac = ((elapsed / 1000) % WAVE.animSpeed) / WAVE.animSpeed
    ctx.globalAlpha = alpha
    for (var k = 0; k < waveLetters.length; k++) {
      var L = waveLetters[k]
      ctx.fillText(L.char, L.x, L.baseY + Math.sin(L.phase + frac * Math.PI * 2) * animAmp)
    }
    ctx.globalAlpha = 1
  }

  function drawSun(t, globalAlpha) {
    ctx.font = SUN.fontSize + "px 'GT Mechanik Mono', monospace"
    ctx.fillStyle = SUN.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (var k = 0; k < sunLetters.length; k++) {
      var L = sunLetters[k]
      var turnOn = (L.step / Math.max(1, sunMaxStep)) * T.sunReveal * 0.9
      var o = (t < turnOn ? 0 : Math.min(1, (t - turnOn) / 180)) * globalAlpha
      if (o <= 0) continue
      ctx.globalAlpha = o
      ctx.fillText(L.char, L.x, L.y)
    }
    ctx.globalAlpha = 1
  }

  function drawSpiral(t, globalAlpha) {
    ctx.font = SPIRAL.fontSize + "px 'GT Mechanik Mono', monospace"
    ctx.fillStyle = SPIRAL.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (var k = 0; k < spiralPoints.length; k++) {
      var P = spiralPoints[k]
      var norm = (P.r - spiralMinR) / spiralRange
      var turnOn = norm * T.spiralReveal * 0.9
      var o = (t < turnOn ? 0 : Math.min(1, (t - turnOn) / 320)) * globalAlpha
      if (o <= 0) continue
      ctx.globalAlpha = o
      ctx.fillText(P.char,
        W / 2 + Math.cos(P.angle - Math.PI / 2) * P.r,
        H / 2 + Math.sin(P.angle - Math.PI / 2) * P.r)
    }
    ctx.globalAlpha = 1
  }

  /* ═══ Retro windows (from retro-windows.js) ══════════ */
  var retroStage = document.getElementById('retro-stage')
  var windows = [].slice.call(section.querySelectorAll('[data-window]'))

  /* Rich typewriter: wrap chars in spans, keep accent coloring */
  var bio = section.querySelector('[data-type-rich]')
  ;(function wrapChars(root) {
    if (!root) return
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    var textNodes = []
    while (walker.nextNode()) textNodes.push(walker.currentNode)
    textNodes.forEach(function (node) {
      var frag = document.createDocumentFragment()
      var txt = node.textContent
      for (var i = 0; i < txt.length; i++) {
        var s = document.createElement('span')
        s.className = 'ch'
        s.textContent = txt[i]
        frag.appendChild(s)
      }
      node.parentNode.replaceChild(frag, node)
    })
  })(bio)
  var bioChars = bio ? [].slice.call(bio.querySelectorAll('.ch')) : []

  function typeBio(speed) {
    var i = 0
    bio.classList.add('retro-caret')
    ;(function step() {
      if (i < bioChars.length) {
        bioChars[i].style.visibility = 'visible'
        i++
        setTimeout(step, speed)
      } else {
        bio.classList.remove('retro-caret')
      }
    })()
  }

  function finishBio() {
    bioChars.forEach(function (c) { c.style.visibility = 'visible' })
    if (bio) bio.classList.remove('retro-caret')
  }

  /* ── Name ticker: type once, idle with occasional blink,
     re-animate every 2–3 minutes ── */
  var NAME = {
    typeMs:      38,
    scrollMs:    850,
    gapMs:       350,
    blinkMinMs:  4000,
    blinkMaxMs:  9000,
    repeatMinMs: 120000,
    repeatMaxMs: 180000,
  }
  var nameTrack = document.getElementById('name-track')
  var NAME_TEXT = nameTrack ? nameTrack.textContent : ''
  if (nameTrack) nameTrack.textContent = ''
  var nameTimers = []
  var nameRunning = false

  function nameSchedule(ms, fn) { nameTimers.push(setTimeout(fn, ms)) }

  function stopNameLoop() {
    nameTimers.forEach(clearTimeout)
    nameTimers = []
    nameRunning = false
    if (!nameTrack) return
    nameTrack.style.transition = 'none'
    nameTrack.style.transform = 'translateX(0)'
    nameTrack.textContent = ''
    nameTrack.classList.remove('retro-caret', 'retro-caret-idle', 'caret-blink')
  }

  function rand(min, max) { return min + Math.random() * (max - min) }

  function startNameLoop() {
    if (nameRunning || !nameTrack) return
    nameRunning = true
    if (reduce) {
      nameTrack.textContent = NAME_TEXT
      nameTrack.classList.add('retro-caret-idle')
      return
    }
    ;(function cycle() {
      nameTrack.style.transition = 'none'
      nameTrack.style.transform = 'translateX(0)'
      nameTrack.textContent = ''
      nameTrack.classList.remove('retro-caret-idle', 'caret-blink')
      nameTrack.classList.add('retro-caret')
      var i = 0
      ;(function step() {
        nameTrack.textContent = NAME_TEXT.slice(0, i)
        if (i < NAME_TEXT.length) {
          i++
          nameSchedule(NAME.typeMs, step)
        } else {
          nameTrack.classList.remove('retro-caret')
          nameTrack.classList.add('retro-caret-idle')
          ;(function idleBlink() {
            nameSchedule(rand(NAME.blinkMinMs, NAME.blinkMaxMs), function () {
              nameTrack.classList.add('caret-blink')
              nameSchedule(1700, function () {
                nameTrack.classList.remove('caret-blink')
                idleBlink()
              })
            })
          })()
          nameSchedule(rand(NAME.repeatMinMs, NAME.repeatMaxMs), function () {
            nameTimers.forEach(clearTimeout)
            nameTimers = []
            nameTrack.classList.remove('retro-caret-idle', 'caret-blink')
            nameTrack.style.transition = 'transform ' + NAME.scrollMs + 'ms cubic-bezier(0.5, 0, 0.9, 0.6)'
            nameTrack.style.transform = 'translateX(calc(-100% - 48px))'
            nameSchedule(NAME.scrollMs + NAME.gapMs, cycle)
          })
        }
      })()
    })()
  }

  /* Close buttons */
  ;[].slice.call(section.querySelectorAll('.retro-close')).forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation()
      var win = btn.closest('[data-window]')
      if (win) win.style.display = 'none'
    })
    btn.addEventListener('pointerdown', function (e) { e.stopPropagation() })
  })

  /* Dragging (clamped to the stage) */
  var topZ = 10
  function initDrag(win) {
    var handle = win.querySelector('[data-drag-handle]')
    if (!handle) return
    // Windows can be dragged across the full page content column, not just the
    // 820px stage. Horizontal bounds come from .page-inner; vertical stays in
    // the stage band so windows don't fly off into the work grid.
    var dragLayer = win.closest('.page-inner') || retroStage
    handle.addEventListener('pointerdown', function (e) {
      if (mqMobile.matches) return
      if (e.button !== undefined && e.button !== 0) return
      e.preventDefault()
      var stageRect = retroStage.getBoundingClientRect()
      // On-screen scale of the stage (fitStage() shrinks it on narrow
      // viewports); left/top are authored in the stage's unscaled units.
      var scale = stageRect.width / retroStage.offsetWidth || 1
      var winRect = win.getBoundingClientRect()
      var offsetX = e.clientX - winRect.left
      var offsetY = e.clientY - winRect.top
      // Full-width horizontal bounds (page content box), captured at drag start.
      var layerRect = dragLayer.getBoundingClientRect()
      var lcs = getComputedStyle(dragLayer)
      var boundL = layerRect.left + (parseFloat(lcs.paddingLeft) || 0)
      var boundR = layerRect.right - (parseFloat(lcs.paddingRight) || 0)
      win.style.left = ((winRect.left - stageRect.left) / scale) + 'px'
      win.style.top = ((winRect.top - stageRect.top) / scale) + 'px'
      win.style.zIndex = ++topZ
      win.classList.add('is-dragging')
      handle.setPointerCapture(e.pointerId)
      function onMove(ev) {
        var sRect = retroStage.getBoundingClientRect()
        var s = sRect.width / retroStage.offsetWidth || 1
        var winW = win.offsetWidth * s
        // Clamp the window's on-screen left edge within the page column,
        // then convert back into the stage's local (unscaled) coordinates.
        var screenX = Math.max(boundL, Math.min(ev.clientX - offsetX, boundR - winW))
        var y = (ev.clientY - sRect.top - offsetY) / s
        var maxY = retroStage.clientHeight - win.offsetHeight
        win.style.left = ((screenX - sRect.left) / s) + 'px'
        win.style.top = Math.max(0, Math.min(y, maxY)) + 'px'
      }
      function onUp() {
        win.classList.remove('is-dragging')
        try { handle.releasePointerCapture(e.pointerId) } catch (err) {}
        handle.removeEventListener('pointermove', onMove)
        handle.removeEventListener('pointerup', onUp)
        handle.removeEventListener('pointercancel', onUp)
      }
      handle.addEventListener('pointermove', onMove)
      handle.addEventListener('pointerup', onUp)
      handle.addEventListener('pointercancel', onUp)
    })
  }
  windows.forEach(initDrag)

  /* Fit the fixed-size cluster to its column (desktop only —
     mobile uses the stacked CSS layout) */
  var STAGE_W = 900
  var STAGE_H = 560
  function fitStage() {
    if (mqMobile.matches) {
      retroStage.style.transform = 'none'
      retroStage.style.marginLeft = ''
      retroStage.style.marginBottom = ''
      return
    }
    var avail = retroStage.parentElement ? retroStage.parentElement.clientWidth : STAGE_W
    var s = Math.min(1, avail / STAGE_W)
    if (s < 1) {
      retroStage.style.transformOrigin = 'top center'
      retroStage.style.transform = 'scale(' + s + ')'
      retroStage.style.marginLeft = ((avail - STAGE_W) / 2) + 'px'
      retroStage.style.marginBottom = (-(STAGE_H * (1 - s))) + 'px'
    } else {
      retroStage.style.transform = 'none'
      retroStage.style.marginLeft = ''
      retroStage.style.marginBottom = ''
    }
  }
  fitStage()
  window.addEventListener('resize', fitStage)
  window.addEventListener('load', fitStage)

  /* Load-in: all windows at once, then type */
  var revealed = false
  function reveal() {
    if (revealed) return
    revealed = true
    windows.forEach(function (win) {
      win.classList.add('is-visible')
      if (reduce) {
        finishBio()
        startNameLoop()
        return
      }
      if (win.querySelector('[data-type-rich]')) {
        setTimeout(function () { typeBio(16) }, 240)
      }
      if (win.querySelector('#name-track')) {
        setTimeout(startNameLoop, 240)
      }
    })
  }

  /* ═══ Master timeline ════════════════════════════════ */
  var timers = []
  var start = null
  var finished = false
  var rafId = null

  function schedule(at, fn) { timers.push(setTimeout(fn, at)) }

  function lockScroll(on) {
    document.documentElement.classList.toggle('intro-lock', on)
  }

  function run() {
    finished = false
    start = null
    revealed = false
    timers.forEach(clearTimeout)
    timers.length = 0
    if (rafId) cancelAnimationFrame(rafId)
    overlay.style.display = ''
    overlay.classList.remove('olive', 'rust', 'out')
    windows.forEach(function (w) { w.classList.remove('is-visible'); w.style.display = '' })
    bioChars.forEach(function (c) { c.style.visibility = '' })
    stopNameLoop()
    lockScroll(true)
    window.scrollTo(0, 0)

    schedule(T.toOlive, function () { overlay.classList.add('olive') })
    schedule(T.toRust, function () { overlay.classList.add('rust') })
    schedule(T.windows, reveal)
    // The moment the animation is over and the overlay begins clearing,
    // release the scroll lock so you can scroll straight to the work — no
    // waiting for the windows to finish typing. The overlay is transparent
    // and non-interactive (.out) during its fade, so scrolling is clean.
    schedule(T.toPaper, function () { overlay.classList.add('out'); lockScroll(false) })
    schedule(T.toPaper + 900, finish)

    rafId = requestAnimationFrame(frame)
  }

  function finish() {
    finished = true
    overlay.style.display = 'none'
    lockScroll(false)
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
  }

  function frame(ts) {
    if (!start) start = ts
    var t = ts - start
    ctx.clearRect(0, 0, W, H)

    if (t < T.toOlive + 400) {
      var fadeIn = Math.min(1, t / T.waveFadeIn)
      var fadeOut = t > T.toOlive ? Math.max(0, 1 - (t - T.toOlive) / 400) : 1
      drawWave(t, fadeIn * fadeOut)
    }

    if (t >= T.sunStart) {
      var g = 1
      if (t > T.toRust) g = Math.max(0, 1 - (t - T.toRust) / 400)
      if (g > 0) drawSun(t - T.sunStart, g)
    }

    if (t >= T.spiralStart) {
      var g2 = 1
      if (t > T.toPaper) g2 = Math.max(0, 1 - (t - T.toPaper) / T.fadeOut)
      if (g2 > 0) drawSpiral(t - T.spiralStart, g2)
    }

    rafId = requestAnimationFrame(frame)
  }

  /* Skip to final state */
  function skip() {
    if (finished) return
    timers.forEach(clearTimeout)
    timers.length = 0
    revealed = true
    windows.forEach(function (w) { w.classList.add('is-visible') })
    finishBio()
    startNameLoop()
    finish()
  }

  overlay.addEventListener('click', skip)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'r' || e.key === 'R') run()
  })

  /* "Work" nav → the project tiles. Arriving with #work skips the
     intro and lands on the tiles; clicking it while already on the
     homepage smooth-scrolls to them. */
  var workEl = document.getElementById('work')
  ;[].slice.call(document.querySelectorAll('a[href="#work"], a[href="/#work"]')).forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!workEl) return
      e.preventDefault()
      if (!finished) skip()
      workEl.scrollIntoView({ behavior: 'smooth' })
      history.replaceState(null, '', '#work')
    })
  })

  var wantsWork = location.hash === '#work' && workEl

  if (reduce || wantsWork) {
    skip()
    if (wantsWork) {
      requestAnimationFrame(function () { workEl.scrollIntoView() })
    }
  } else if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run)
  } else {
    run()
  }
})()
