/* Catch-the-skill intro game.
   Kept deliberately light: single requestAnimationFrame loop,
   max 5 falling items at once, icons are small pre-loaded SVGs,
   obstacle + background + sound are all drawn/synthesised on the
   fly (no extra image/audio assets to load), game auto-ends after
   CATCH_TARGET catches or TIME_LIMIT_MS.

   Defensive by design: the Skip button is wired up FIRST, before
   anything else runs, and everything else is wrapped in try/catch.
   If any unexpected error happens, we auto-skip to the portfolio
   instead of leaving a broken, unresponsive overlay on screen. */

(function () {
  const overlay = document.getElementById('game-overlay');
  const canvas = document.getElementById('game-canvas');
  const skipBtn = document.getElementById('skip-intro');
  const muteBtn = document.getElementById('mute-toggle');
  const scoreEl = document.getElementById('game-score');
  const endScreen = document.getElementById('game-end');
  const endBtn = document.getElementById('game-end-continue');

  if (!overlay) return;

  function hardClose(markSeen) {
    try { if (rafIdRef) cancelAnimationFrame(rafIdRef); } catch (e) {}
    try { if (musicTimerRef) clearTimeout(musicTimerRef); } catch (e) {}
    document.body.style.overflow = '';
    overlay.hidden = true;
    if (markSeen) {
      try { sessionStorage.setItem('introSeen', '1'); } catch (e) { /* ignore */ }
    }
  }
  let rafIdRef = null;
  let musicTimerRef = null;

  // Skip / continue buttons work no matter what happens below.
  if (skipBtn) skipBtn.addEventListener('click', () => hardClose(true));
  if (endBtn) endBtn.addEventListener('click', () => hardClose(true));

  if (!canvas) { hardClose(false); return; }

  try {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem('introSeen') === '1';
    } catch (e) {
      alreadySeen = false;
    }

    if (prefersReduced || alreadySeen) {
      hardClose(false);
      return;
    }

    // Falling icons come straight from js/data.js's SKILLS list — add
    // a skill there and it's automatically eligible to appear here too.
    // Skills without a real icon (the `emoji` fallback ones) are skipped
    // since the game draws actual images, not text badges.
    const ICONS = (typeof SKILLS !== 'undefined' ? SKILLS : []).filter((s) => !s.emoji);

    const CATCH_TARGET = 5;
    const TIME_LIMIT_MS = 22000;
    const MAX_FALLING = 5;
    const SPAWN_EVERY_MS = 750;
    const BASKET_BOTTOM_GAP = 46;
    const OBSTACLE_CHANCE = 0.22; // ~1 in 4-5 spawns is a bomb to dodge, not catch

    const ctx = canvas.getContext('2d');
    let W, H, iconSize, basketW, basketH;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      iconSize = Math.max(34, Math.min(56, W * 0.09));
      basketW = Math.max(70, Math.min(110, W * 0.2));
      basketH = 34;
      buildBackgroundDots();
    }

    const images = {};
    ICONS.forEach((icon) => {
      const img = new Image();
      img.src = icon.src || `https://cdn.simpleicons.org/${icon.slug}/FBF7F1`;
      images[icon.slug] = img;
    });

    // ---------- Sound (synthesised, no audio files needed) ----------
    let audioCtx = null;
    let muted = false;
    let musicStarted = false;

    function ensureAudio() {
      if (muted) return;
      if (!audioCtx) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          audioCtx = null;
        }
        if (audioCtx && !musicStarted) {
          musicStarted = true;
          scheduleMusic();
        }
      } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playTone(freq, duration, type, gainVal) {
      if (muted || !audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = gainVal;
      osc.connect(gain).connect(audioCtx.destination);
      const now = audioCtx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.start(now);
      osc.stop(now + duration);
    }

    function sfxCatch() {
      playTone(660, 0.1, 'sine', 0.16);
      setTimeout(() => playTone(920, 0.1, 'sine', 0.13), 45);
    }
    function sfxObstacle() {
      playTone(110, 0.22, 'sawtooth', 0.15);
    }
    function sfxEnd() {
      [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.16, 'sine', 0.14), i * 90));
    }

    // Gentle, relaxed looping background melody — low volume, synthesised.
    const MUSIC_NOTES = [392.0, 440.0, 523.25, 440.0, 392.0, 349.23];
    let musicStep = 0;
    function scheduleMusic() {
      if (muted || !audioCtx) {
        musicTimerRef = setTimeout(scheduleMusic, 500);
        return;
      }
      const freq = MUSIC_NOTES[musicStep % MUSIC_NOTES.length];
      playTone(freq, 0.55, 'sine', 0.035);
      musicStep++;
      musicTimerRef = setTimeout(scheduleMusic, 560);
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        muted = !muted;
        muteBtn.textContent = muted ? 'Suara: Mati' : 'Suara: Aktif';
        muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
      });
    }

    // ---------- Background: soft drifting dot grid, not a flat fill ----------
    let bgDots = [];
    function buildBackgroundDots() {
      bgDots = [];
      const spacing = 58;
      for (let gx = spacing / 2; gx < W; gx += spacing) {
        for (let gy = spacing / 2; gy < H; gy += spacing) {
          bgDots.push({ x: gx, y: gy, phase: Math.random() * Math.PI * 2 });
        }
      }
    }

    function drawBackground(ts) {
      ctx.fillStyle = '#16213E';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(251,247,241,0.10)';
      const t = ts / 1000;
      bgDots.forEach((d) => {
        const bob = Math.sin(t * 0.8 + d.phase) * 5;
        ctx.beginPath();
        ctx.arc(d.x, d.y + bob, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    let basketX = 0;
    let falling = [];
    let caughtCount = 0;
    let caughtSlugs = new Set();
    let lastSpawn = 0;
    let startTime = 0;
    let running = false;
    let flash = 0;

    function pickIcon() {
      return ICONS[Math.floor(Math.random() * ICONS.length)];
    }

    function spawnIcon(ts) {
      if (falling.length >= MAX_FALLING) return;
      if (ts - lastSpawn < SPAWN_EVERY_MS) return;
      lastSpawn = ts;
      const isObstacle = Math.random() < OBSTACLE_CHANCE;
      const icon = isObstacle ? null : pickIcon();
      falling.push({
        obstacle: isObstacle,
        slug: icon ? icon.slug : null,
        x: Math.random() * (W - iconSize) + iconSize / 2,
        y: -iconSize,
        speed: H * (0.00018 + Math.random() * 0.00014)
      });
    }

    function update(dt) {
      const basketY = H - basketH - BASKET_BOTTOM_GAP;
      falling.forEach((f) => (f.y += f.speed * dt));
      if (flash > 0) flash = Math.max(0, flash - dt);

      falling = falling.filter((f) => {
        const caught =
          f.y + iconSize / 2 > basketY &&
          f.y - iconSize / 2 < basketY + basketH &&
          Math.abs(f.x - basketX) < basketW / 2 + iconSize / 2;

        if (caught) {
          if (f.obstacle) {
            flash = 160;
            sfxObstacle();
          } else {
            caughtCount++;
            caughtSlugs.add(f.slug);
            scoreEl.textContent = caughtCount;
            sfxCatch();
          }
          return false;
        }
        return f.y - iconSize / 2 < H;
      });
    }

    // Playful bomb/TNT obstacle instead of a plain red X.
    function drawObstacle(f) {
      ctx.save();
      ctx.translate(f.x, f.y + iconSize * 0.08);
      const r = iconSize * 0.42;

      // body
      ctx.fillStyle = '#1B1C1A';
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r, 0, Math.PI * 2);
      ctx.fill();

      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.1, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // fuse
      ctx.strokeStyle = '#8a6a4a';
      ctx.lineWidth = Math.max(2, r * 0.14);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(r * 0.15, -r * 0.85);
      ctx.quadraticCurveTo(r * 0.6, -r * 1.3, r * 0.35, -r * 1.7);
      ctx.stroke();

      // spark
      ctx.fillStyle = '#FD6A49';
      ctx.beginPath();
      ctx.arc(r * 0.35, -r * 1.75, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFE4DA';
      ctx.beginPath();
      ctx.arc(r * 0.3, -r * 1.8, r * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function draw(ts) {
      drawBackground(ts);

      const basketY = H - basketH - BASKET_BOTTOM_GAP;
      ctx.fillStyle = 'rgba(253,106,73,0.95)';
      ctx.beginPath();
      const r = 10;
      const x = basketX - basketW / 2, y = basketY, w = basketW, h = basketH;
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();

      falling.forEach((f) => {
        if (f.obstacle) {
          drawObstacle(f);
          return;
        }
        const img = images[f.slug];
        if (img && img.complete && img.naturalWidth) {
          ctx.drawImage(img, f.x - iconSize / 2, f.y - iconSize / 2, iconSize, iconSize);
        } else {
          ctx.fillStyle = 'rgba(251,247,241,0.5)';
          ctx.beginPath();
          ctx.arc(f.x, f.y, iconSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (flash > 0) {
        ctx.fillStyle = `rgba(253,106,73,${(flash / 160) * 0.28})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    let lastFrame = 0;
    function loop(ts) {
      if (!running) return;
      if (!lastFrame) lastFrame = ts;
      const dt = ts - lastFrame;
      lastFrame = ts;

      spawnIcon(ts);
      update(dt);
      draw(ts);

      if (caughtCount >= CATCH_TARGET || ts - startTime > TIME_LIMIT_MS) {
        endGame();
        return;
      }
      rafIdRef = requestAnimationFrame(loop);
    }

    function setBasketFromClientX(clientX) {
      const rect = canvas.getBoundingClientRect();
      basketX = Math.max(basketW / 2, Math.min(W - basketW / 2, clientX - rect.left));
    }

    function onPointerMove(e) {
      ensureAudio();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setBasketFromClientX(clientX);
    }

    function onKeyDown(e) {
      ensureAudio();
      const step = W * 0.05;
      if (e.key === 'ArrowLeft') basketX = Math.max(basketW / 2, basketX - step);
      if (e.key === 'ArrowRight') basketX = Math.min(W - basketW / 2, basketX + step);
      if (e.key === 'Escape') closeGame(true);
    }

    function startGame() {
      resize();
      basketX = W / 2;
      startTime = performance.now();
      running = true;
      document.body.style.overflow = 'hidden';

      window.addEventListener('resize', resize);
      canvas.addEventListener('mousemove', onPointerMove);
      canvas.addEventListener('touchstart', onPointerMove, { passive: true });
      canvas.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('keydown', onKeyDown);

      rafIdRef = requestAnimationFrame(loop);
    }

    function endGame() {
      running = false;
      if (rafIdRef) cancelAnimationFrame(rafIdRef);
      if (musicTimerRef) clearTimeout(musicTimerRef);
      sfxEnd();
      highlightCaughtSkills();
      if (endScreen) endScreen.hidden = false;
    }

    function highlightCaughtSkills() {
      caughtSlugs.forEach((slug) => {
        const chip = document.querySelector(`.skill-chip[data-slug="${slug}"]`);
        if (chip) chip.classList.add('just-caught');
      });
    }

    function closeGame(markSeen) {
      running = false;
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onPointerMove);
      canvas.removeEventListener('touchstart', onPointerMove);
      canvas.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('keydown', onKeyDown);
      hardClose(markSeen);
    }

    // Replace the safety-net listeners with the full versions now that
    // setup succeeded, so Skip/Continue also clean up game state properly.
    if (skipBtn) {
      skipBtn.replaceWith(skipBtn.cloneNode(true));
    }
    const skipBtn2 = document.getElementById('skip-intro');
    if (skipBtn2) skipBtn2.addEventListener('click', () => closeGame(true));
    if (endBtn) endBtn.addEventListener('click', () => closeGame(true));

    startGame();
  } catch (err) {
    console.error('Intro game failed to start, skipping to portfolio:', err);
    hardClose(true);
  }
})();