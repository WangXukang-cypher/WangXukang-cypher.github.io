const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
const languageToggle = document.querySelector('#language-toggle');
const progressBar = document.querySelector('#reading-progress-bar');
const navLinks = [...document.querySelectorAll('.section-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
};

/* ---------- theme: dark neon by default, yellow "daylight" optional ---------- */
root.dataset.theme = store.get('wx-cyber-theme') || 'dark';
themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  store.set('wx-cyber-theme', next);
  glitchBurst();
});

/* ---------- language ---------- */
let language = store.get('wx-language') || 'en';

function applyLanguage() {
  root.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-en][data-zh]').forEach((node) => {
    node.textContent = node.dataset[language];
  });
  document.querySelectorAll('.glitch').forEach((node) => { node.dataset.text = node.textContent; });
  languageToggle.textContent = language === 'en' ? '中文' : 'EN';
  languageToggle.setAttribute('aria-label', language === 'en' ? '切换至中文' : 'Switch to English');
  document.title = language === 'en' ? 'Wang Xukang · AI Research' : '汪旭康 · 人工智能研究';
}

languageToggle.addEventListener('click', () => {
  language = language === 'en' ? 'zh' : 'en';
  store.set('wx-language', language);
  applyLanguage();
  glitchBurst();
});

applyLanguage();

/* ---------- glitch ---------- */
const glitchNodes = [...document.querySelectorAll('.glitch')];
function glitch(node) {
  node.classList.remove('is-glitching');
  void node.offsetWidth;
  node.classList.add('is-glitching');
  setTimeout(() => node.classList.remove('is-glitching'), 480);
}
function glitchBurst() { if (!reduceMotion) glitchNodes.forEach(glitch); }
if (!reduceMotion) {
  setInterval(() => {
    const node = glitchNodes[Math.floor(Math.random() * glitchNodes.length)];
    glitch(node);
  }, 3200);
  glitchNodes.forEach((node) => node.addEventListener('mouseenter', () => glitch(node)));
}

/* ---------- boot sequence (once per session) ---------- */
(function boot() {
  const el = document.querySelector('#boot');
  let seen = false;
  try { seen = sessionStorage.getItem('wx-booted') === '1'; } catch { seen = true; }
  if (seen || reduceMotion) return;
  try { sessionStorage.setItem('wx-booted', '1'); } catch { /* ignore */ }

  const log = el.querySelector('#boot-log');
  const bar = el.querySelector('.boot-bar span');
  const lines = [
    '> BIOS v2.0.77 :: neural-link handshake',
    '> mounting /dev/multimodal ........ <span class="ok">[OK]</span>',
    '> loading weights: LLM · VLM · MoE . <span class="ok">[OK]</span>',
    '> calibrating post-training core ... <span class="ok">[OK]</span>',
    '> route CHONGQING → TOKYO .......... <span class="ok">[LINKED]</span>',
    '> identity: WANG_XUKANG / 汪旭康',
    '> <span class="warn">ACCESS GRANTED</span>',
  ];
  el.classList.add('on');
  let i = 0;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    el.classList.add('off');
    setTimeout(() => { el.remove(); glitchBurst(); }, 460);
  };
  const timer = setInterval(() => {
    log.innerHTML += (i ? '\n' : '') + lines[i];
    i += 1;
    bar.style.width = `${(i / lines.length) * 100}%`;
    if (i >= lines.length) { clearInterval(timer); setTimeout(finish, 380); }
  }, 150);
  el.addEventListener('click', () => { clearInterval(timer); finish(); });
  document.addEventListener('keydown', () => { clearInterval(timer); finish(); }, { once: true });
})();

/* ---------- reveal + counters ---------- */
function countUp(node) {
  const target = Number(node.dataset.count);
  if (reduceMotion || !target) return;
  const start = performance.now();
  const duration = 900;
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const value = Math.round(target * (1 - Math.pow(1 - t, 3)));
    node.textContent = String(value).padStart(2, '0');
    if (t < 1) requestAnimationFrame(step);
  };
  node.textContent = '00';
  requestAnimationFrame(step);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    entry.target.querySelectorAll('[data-count]').forEach(countUp);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
// safety net: never leave content hidden if the observer doesn't fire
setTimeout(() => document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
  if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
}), 1500);

/* ---------- nav highlighting ---------- */
const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => {
    const active = link.getAttribute('href') === `#${visible.target.id}`;
    link.classList.toggle('active', active);
    if (active && window.innerWidth <= 980) link.scrollIntoView({ block: 'nearest', inline: 'center' });
  });
}, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.2, 0.5] });

sections.forEach((section) => sectionObserver.observe(section));

/* ---------- progress ---------- */
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ---------- Tokyo clock + uptime ---------- */
const clock = document.querySelector('#clock');
const uptime = document.querySelector('#uptime');
const bootTime = Date.now();
const tokyo = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
function tick() {
  clock.textContent = `${tokyo.format(new Date())} JST`;
  const s = Math.floor((Date.now() - bootTime) / 1000);
  uptime.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
tick();
setInterval(tick, 1000);

/* ---------- background: neon horizon grid + data rain ---------- */
(function background() {
  const canvas = document.querySelector('#bg-canvas');
  const ctx = canvas.getContext('2d');
  const glyphs = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ<>/{}[]#$%&';
  let w = 0;
  let h = 0;
  let dpr = 1;
  let drops = [];

  function palette() {
    const light = root.dataset.theme === 'light';
    return light
      ? { grid: 'rgba(10,10,18,', rain: 'rgba(209,0,75,', sun: ['rgba(209,0,75,0.18)', 'rgba(0,112,143,0)'] }
      : { grid: 'rgba(255,42,109,', rain: 'rgba(0,240,255,', sun: ['rgba(255,42,109,0.22)', 'rgba(185,103,255,0)'] };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.floor(w / 26);
    drops = Array.from({ length: Math.floor(cols * 0.35) }, () => ({
      x: Math.floor(Math.random() * cols) * 26 + 6,
      y: Math.random() * h,
      speed: 0.6 + Math.random() * 1.6,
      len: 6 + Math.floor(Math.random() * 14),
    }));
    if (reduceMotion) draw(0);
  }

  function draw(t) {
    const p = palette();
    ctx.clearRect(0, 0, w, h);

    // horizon glow
    const horizon = h * 0.62;
    const sun = ctx.createRadialGradient(w * 0.5, horizon, 0, w * 0.5, horizon, Math.max(w, h) * 0.55);
    sun.addColorStop(0, p.sun[0]);
    sun.addColorStop(1, p.sun[1]);
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, h);

    // perspective floor grid
    ctx.lineWidth = 1;
    const vx = w * 0.5;
    for (let i = -24; i <= 24; i += 1) {
      const alpha = 0.18 * (1 - Math.abs(i) / 26);
      ctx.strokeStyle = `${p.grid}${alpha})`;
      ctx.beginPath();
      ctx.moveTo(vx + i * 6, horizon);
      ctx.lineTo(vx + i * w * 0.09, h);
      ctx.stroke();
    }
    const offset = ((t || 0) / 2600) % 1;
    for (let j = 0; j < 14; j += 1) {
      const z = (j + offset) / 14;
      const y = horizon + (h - horizon) * z * z;
      ctx.strokeStyle = `${p.grid}${0.04 + 0.22 * z})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // data rain (upper area, fades toward horizon)
    ctx.font = '13px "JetBrains Mono", monospace';
    drops.forEach((d) => {
      for (let k = 0; k < d.len; k += 1) {
        const y = d.y - k * 16;
        if (y < 0 || y > horizon) continue;
        const fade = (1 - k / d.len) * (1 - y / horizon);
        ctx.fillStyle = `${p.rain}${(k === 0 ? 0.55 : 0.16) * fade})`;
        ctx.fillText(glyphs[(Math.floor(y / 16) + k + d.x) % glyphs.length], d.x, y);
      }
      d.y += d.speed;
      if (d.y - d.len * 16 > horizon) { d.y = -Math.random() * 200; d.speed = 0.6 + Math.random() * 1.6; }
    });
  }

  let running = true;
  function loop(t) {
    if (running) draw(t);
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });
  if (reduceMotion) {
    draw(0);
    themeToggle.addEventListener('click', () => draw(0));
  } else {
    requestAnimationFrame(loop);
  }
})();
