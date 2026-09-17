/* Catch-the-skill intro game.
   Kept deliberately light: single requestAnimationFrame loop,
   max 5 falling icons at once, icons are small pre-loaded SVGs,
   game auto-ends after CATCH_TARGET catches or TIME_LIMIT_MS. */

(function () {
  const overlay = document.getElementById('game-overlay');
  const canvas = document.getElementById('game-canvas');
  const skipBtn = document.getElementById('skip-intro');
  const scoreEl = document.getElementById('game-score');
  const endScreen = document.getElementById('game-end');
  const endBtn = document.getElementById('game-end-continue');

  if (!overlay || !canvas) return;

  // Respect reduced-motion / first-run only: skip the game entirely.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadySeen = sessionStorage.getItem('introSeen') === '1';

  if (prefersReduced || alreadySeen) {
    closeGame(false);
    return;
  }

  const ICONS = [
    { slug: 'docker', name: 'Docker' },
    { slug: 'nginx', name: 'Nginx' },
    { slug: 'linux', name: 'Linux' },
    { slug: 'github', name: 'GitHub' },
    { slug: 'n8n', name: 'n8n' },
    { slug: 'whatsapp', name: 'WhatsApp' },
    { slug: 'ollama', name: 'Ollama' },
    { slug: 'microsoftazure', name: 'Azure' },
    { slug: 'html5', name: 'HTML5' },
    { slug: 'css3', name: 'CSS3' },
    { slug: 'javascript', name: 'JavaScript' },
    { slug: 'c', name: 'C' },
    { slug: 'cplusplus', name: 'C++' },
    { slug: 'postgresql', name: 'PostgreSQL' },
    { slug: 'ubiquiti', name: 'UniFi' },
    { slug: 'python', name: 'Python' }
  ];

  const CATCH_TARGET = 10;
  const TIME_LIMIT_MS = 20000;
  const MAX_FALLING = 5;
  const SPAWN_EVERY_MS = 750;
  const BASKET_BOTTOM_GAP = 46; // distance from the very bottom edge

  const ctx = canvas.getContext('2d');
  let W, H, iconSize, basketW, basketH;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    // Measure the box the canvas actually got from the flex layout
    // (overlay's total height would include the header/hint rows too).
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    iconSize = Math.max(34, Math.min(56, W * 0.09));
    basketW = Math.max(70, Math.min(110, W * 0.2));
    basketH = 34;
  }

  // Preload icon images once (lightweight SVGs from Simple Icons CDN).
  const images = {};
  ICONS.forEach((icon) => {
    const img = new Image();
    img.src = `https://cdn.simpleicons.org/${icon.slug}/FBF7F1`;
    images[icon.slug] = img;
  });

  let basketX = 0;
  let falling = [];
  let caughtCount = 0;
  let caughtSlugs = new Set();
  let lastSpawn = 0;
  let startTime = 0;
  let running = false;
  let rafId = null;

  function pickIcon() {
    return ICONS[Math.floor(Math.random() * ICONS.length)];
  }

  function spawnIcon(ts) {
    if (falling.length >= MAX_FALLING) return;
    if (ts - lastSpawn < SPAWN_EVERY_MS) return;
    lastSpawn = ts;
    const icon = pickIcon();
    falling.push({
      slug: icon.slug,
      x: Math.random() * (W - iconSize) + iconSize / 2,
      y: -iconSize,
      speed: H * (0.00018 + Math.random() * 0.00014)
    });
  }

  function update(dt) {
    const basketY = H - basketH - BASKET_BOTTOM_GAP;
    falling.forEach((f) => (f.y += f.speed * dt));

    falling = falling.filter((f) => {
      const caught =
        f.y + iconSize / 2 > basketY &&
        f.y - iconSize / 2 < basketY + basketH &&
        Math.abs(f.x - basketX) < basketW / 2 + iconSize / 2;

      if (caught) {
        caughtCount++;
        caughtSlugs.add(f.slug);
        scoreEl.textContent = caughtCount;
        return false;
      }
      return f.y - iconSize / 2 < H;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // basket
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

    // falling icons
    falling.forEach((f) => {
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
  }

  let lastFrame = 0;
  function loop(ts) {
    if (!running) return;
    if (!lastFrame) lastFrame = ts;
    const dt = ts - lastFrame;
    lastFrame = ts;

    spawnIcon(ts);
    update(dt);
    draw();

    if (caughtCount >= CATCH_TARGET || ts - startTime > TIME_LIMIT_MS) {
      endGame();
      return;
    }
    rafId = requestAnimationFrame(loop);
  }

  function setBasketFromClientX(clientX) {
    const rect = canvas.getBoundingClientRect();
    basketX = Math.max(basketW / 2, Math.min(W - basketW / 2, clientX - rect.left));
  }

  function onPointerMove(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setBasketFromClientX(clientX);
  }

  function onKeyDown(e) {
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
    canvas.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    highlightCaughtSkills();
    endScreen.hidden = false;
  }

  function highlightCaughtSkills() {
    caughtSlugs.forEach((slug) => {
      const chip = document.querySelector(`.skill-chip[data-slug="${slug}"]`);
      if (chip) chip.classList.add('just-caught');
    });
  }

  function closeGame(markSeen) {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('mousemove', onPointerMove);
    canvas.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('keydown', onKeyDown);
    document.body.style.overflow = '';
    overlay.hidden = true;
    if (markSeen) sessionStorage.setItem('introSeen', '1');
  }

  skipBtn.addEventListener('click', () => closeGame(true));
  endBtn.addEventListener('click', () => closeGame(true));

  startGame();
})();