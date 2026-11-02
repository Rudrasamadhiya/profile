import { animate, inView, scroll, stagger } from 'motion';
import Lenis from 'lenis';
import { initWorld } from './world.js';
import { initPhone } from './phone.js';
import { initTerminal } from './terminal.js';
import { initArch } from './arch.js';
import { initLive } from './live.js';
import { gpu } from './gpu.js';

const EASE = [0.22, 1, 0.36, 1];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

document.body.classList.add('is-loading');

// ---------------------------------------------------------------- 3D
// Every scene is optional: if WebGL is missing or a scene throws, the page still loads
// and falls back to the static backdrop (html.no-webgl) instead of hanging on the loader.
const safe = (init, stub) => {
  if (!gpu.webgl) return stub;
  try { return init(); } catch (err) { console.warn('[3d] disabled:', err); return stub; }
};
const world = safe(() => initWorld($('#bg')), { reveal() {}, blocks: 12000 });
const phone = safe(() => initPhone($('#phone'), $('#term'), $$('.agent'), $$('#stageTabs span')), { setMode() {}, release() {} });
if (!gpu.webgl) document.documentElement.classList.add('no-webgl');
const touch = matchMedia('(hover: none)').matches;
const narrow = () => innerWidth <= 960;

// ---------------------------------------------------------------- smooth scroll
const lenis = new Lenis({ lerp: 0.09, smoothWheel: !reduced });
const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
requestAnimationFrame(raf);
lenis.stop();
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    e.preventDefault();
    lenis.scrollTo(id === '#top' ? 0 : id, { offset: -40, duration: 1.6 });
  })
);

// ---------------------------------------------------------------- terminal, architecture explorer, live data
initTerminal({
  scrollTo: (id) => lenis.scrollTo(id === '#top' ? 0 : id, { offset: -40, duration: 1.4 }),
  onSudoHire: () => animate('body', { filter: ['brightness(1.6) saturate(1.5)', 'none'] }, { duration: 0.6 }),
});
safe(() => initArch());
try { initLive(); } catch (err) { console.warn('[live] disabled:', err); }

// ---------------------------------------------------------------- split text into words
$$('.split').forEach((el) => {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.textContent = part;
          w.appendChild(i); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('w')) {
        // wrap whole inline element (em) as one word
        const w = document.createElement('span'); w.className = 'w';
        const i = document.createElement('span');
        n.replaceWith(w); i.appendChild(n); w.appendChild(i);
      }
    });
  };
  walk(el);
  $$('.w > span', el).forEach((s) => { s.style.transform = 'translateY(110%)'; });
});

// ---------------------------------------------------------------- loader → intro
(function loader() {
  const root = $('#loader'), bar = $('#loaderBar'), count = $('#loaderCount'), log = $('#loaderLog');
  const heroWords = $$('.hero__title .word');
  heroWords.forEach((w) => { w.style.transform = 'translateY(110%)'; });
  $$('.reveal-up').forEach((el) => { el.style.opacity = 0; el.style.transform = 'translateY(30px)'; });

  const LOG = [
    [2, 'init webgl2 renderer'],
    [18, `generating die: ${world.blocks.toLocaleString()} towers`],
    [36, 'routing 2,800 packets'],
    [54, 'compiling bloom + film shaders'],
    [70, 'brewing chai'],
    [86, 'summoning rudra.dev'],
  ];
  let logged = 0;
  let fontsReady = false;
  const fontLoad = document.fonts ? document.fonts.load('700 250px "Grenze Gotisch"').catch(() => {}) : Promise.resolve();
  Promise.race([fontLoad, new Promise((r) => setTimeout(r, 1500))]).then(() => { fontsReady = true; root.classList.add('is-drawing'); });

  const start = performance.now();
  const min = reduced ? 400 : 2600;
  const tick = (now) => {
    const k = Math.min((now - start) / min, fontsReady ? 1 : 0.3);
    const v = Math.round((k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) * 100);
    bar.style.width = v + '%';
    count.textContent = v;
    while (logged < LOG.length && v >= LOG[logged][0]) {
      log.lastElementChild?.classList.add('ok');
      const d = document.createElement('div'); d.textContent = LOG[logged][1]; log.appendChild(d);
      animate(d, { opacity: [0, 1], x: [-8, 0] }, { duration: 0.3 });
      logged++;
    }
    if (k < 1) return requestAnimationFrame(tick);
    log.lastElementChild?.classList.add('ok');
    setTimeout(finish, 250);
  };
  requestAnimationFrame(tick);

  function finish() {
    root.classList.add('is-open');
    animate('.loader__stage', { opacity: [1, 0], scale: [1, 0.96] }, { duration: 0.45, ease: EASE });
    animate('.loader__panel--top', { y: ['0%', '-101%'] }, { duration: 1.15, delay: 0.35, ease: [0.76, 0, 0.24, 1] });
    animate('.loader__panel--bot', { y: ['0%', '101%'] }, { duration: 1.15, delay: 0.35, ease: [0.76, 0, 0.24, 1] })
      .then(() => root.remove());
    setTimeout(() => root.isConnected && root.remove(), 2600);
    setTimeout(() => {
      document.body.classList.remove('is-loading');
      lenis.start();
      world.reveal();
      animate(heroWords, { y: ['110%', '0%'] }, { duration: 1.3, delay: stagger(0.12), ease: EASE });
      animate('.reveal-up', { opacity: [0, 1], y: [30, 0] }, { duration: 1, delay: stagger(0.1, { startDelay: 0.5 }), ease: EASE });
    }, 600);
  }
})();

// ---------------------------------------------------------------- reveals on scroll
inView('.split', (entry) => {
  const el = entry.target || entry;
  animate($$('.w > span', el), { y: ['110%', '0%'] }, { duration: 1, delay: stagger(0.035), ease: EASE });
}, { amount: 0.3 });

const fadeIn = (sel, opts = {}) =>
  $$(sel).forEach((el) => {
    el.style.opacity = 0;
    inView(el, () => {
      animate(el, { opacity: [0, 1], y: [opts.y ?? 50, 0], rotateX: [opts.rx ?? 0, 0] }, { duration: 1.1, delay: opts.delay ?? 0, ease: EASE });
    }, { amount: 0.15 });
  });
fadeIn('.stat');
fadeIn('.agent', { y: 40 });
fadeIn('.kit__head', { y: 20 });
fadeIn('.arch', { y: 80 });
fadeIn('.gitlog', { y: 60 });
fadeIn('.npm', { y: 60 });
fadeIn('.activity', { y: 60 });
fadeIn('.win', { y: 90, rx: 10 });
if (!narrow()) fadeIn('.project', { y: 90, rx: 12 });
fadeIn('.sg', { y: 20 });
fadeIn('.tl', { y: 30 });
if (!narrow()) fadeIn('.agents__stage', { y: 60 });
fadeIn('.contact__links a', { y: 20 });
fadeIn('.muted', { y: 20 });

// stagger index-based delays for groups
$$('.stats .stat').forEach((el, i) => (el.style.transitionDelay = `${i * 60}ms`));

// counters
$$('[data-count]').forEach((el) => {
  inView(el, () => {
    const to = +el.dataset.count;
    animate(0, to, { duration: 2, ease: EASE, onUpdate: (v) => { el.textContent = Math.round(v); } });
  }, { amount: 0.6 });
});

// parallax on the big contact line + marquee speed
scroll(animate('.contact__big', { scale: [0.85, 1], opacity: [0.2, 1] }, { ease: 'linear' }), {
  target: $('.contact'), offset: ['start end', 'center center'],
});
scroll(animate('.hero__title', { y: [0, -120], opacity: [1, 0.2] }, { ease: 'linear' }), {
  target: $('.hero'), offset: ['start start', 'end start'],
});

// ---------------------------------------------------------------- cursor
if (matchMedia('(hover: hover)').matches) {
  const cur = $('#cursor'), dot = $('#cursorDot');
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; });
  const loop = () => { cx += (x - cx) * 0.16; cy += (y - cy) * 0.16; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
  loop();
  document.addEventListener('pointerover', (e) => { if (e.target.closest('[data-hover], a, button')) cur.classList.add('is-hover'); });
  document.addEventListener('pointerout', (e) => { if (e.target.closest('[data-hover], a, button')) cur.classList.remove('is-hover'); });

  // magnetic
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      animate(el, { x: dx * 0.3, y: dy * 0.4 }, { duration: 0.4, ease: EASE });
    });
    el.addEventListener('pointerleave', () => animate(el, { x: 0, y: 0 }, { type: 'spring', stiffness: 220, damping: 12 }));
  });

  // 3D tilt + spotlight
  $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      const max = el.classList.contains('project') ? 7 : 5;
      animate(el, { rotateY: (px - 0.5) * max * 2, rotateX: -(py - 0.5) * max * 2, transformPerspective: 1000 }, { duration: 0.5, ease: EASE });
    });
    el.addEventListener('pointerleave', () => animate(el, { rotateY: 0, rotateX: 0 }, { type: 'spring', stiffness: 160, damping: 14 }));
  });
}

// ---------------------------------------------------------------- skills sphere
(function sphere() {
  const root = $('#sphere');
  const skills = [
    ['TypeScript', 'k'], ['React', ''], ['Next.js', 'k'], ['React Native', 'k'], ['Expo', 'v'], ['NestJS', 'k'],
    ['Node.js', ''], ['PostgreSQL', ''], ['MongoDB', ''], ['Redis', 'v'], ['Firebase', ''], ['Docker', ''],
    ['Kotlin', 'v'], ['Java', 'k'], ['C++', ''], ['Python', ''], ['Three.js', 'v'], ['Tailwind', ''],
    ['MCP', 'k'], ['Socket.IO', ''], ['Razorpay', ''], ['KaTeX', ''], ['Nginx', ''], ['Git', ''],
    ['Linux', ''], ['Vercel', ''], ['DSA', 'v'], ['System Design', 'k'], ['Claude Code', 'v'], ['Zustand', ''],
    ['Android SDK', ''], ['OCR', ''], ['RAG', 'v'], ['Microservices', ''], ['CTF', 'v'], ['DBMS', ''],
  ];
  const N = skills.length;
  const nodes = skills.map(([s, c], i) => {
    const el = document.createElement('span');
    el.textContent = s; if (c) el.className = c;
    root.appendChild(el);
    const phi = Math.acos(-1 + (2 * i + 1) / N);
    const theta = Math.sqrt(N * Math.PI) * phi;
    return { el, x: Math.cos(theta) * Math.sin(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(phi) };
  });

  let ax = 0.002, ay = 0.004, tx = ax, ty = ay, visible = false;
  const wrap = root.parentElement;
  wrap.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    ty = ((e.clientX - r.left) / r.width - 0.5) * 0.03;
    tx = -((e.clientY - r.top) / r.height - 0.5) * 0.03;
  });
  wrap.addEventListener('pointerleave', () => { tx = 0.002; ty = 0.004; });
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(wrap);

  const loop = () => {
    requestAnimationFrame(loop);
    if (!visible) return;
    ax += (tx - ax) * 0.05; ay += (ty - ay) * 0.05;
    const R = wrap.clientWidth * 0.4;
    const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
    nodes.forEach((n) => {
      // rotate around X then Y
      let y = n.y * cx - n.z * sx, z = n.y * sx + n.z * cx;
      let x = n.x * cy + z * sy; z = -n.x * sy + z * cy;
      n.x = x; n.y = y; n.z = z;
      const s = (z + 2) / 3;
      n.el.style.transform = `translate(-50%,-50%) translate3d(${x * R}px,${y * R}px,${z * R}px) scale(${0.6 + s * 0.5})`;
      n.el.style.opacity = 0.25 + s * 0.75;
      n.el.style.zIndex = Math.round(s * 100);
      n.el.style.filter = z < -0.3 ? `blur(${(-z - 0.3) * 2}px)` : 'none';
    });
  };
  loop();
})();

// ---------------------------------------------------------------- live clock (IST)
const clock = $('#clock');
const tickClock = () => {
  clock.textContent = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date());
};
tickClock(); setInterval(tickClock, 15000);

// ---------------------------------------------------------------- about: words light up as you scroll
(function scrub() {
  const el = $('.about__big');
  const words = [];
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
        const w = document.createElement('span'); w.className = 'sw'; w.textContent = part;
        words.push(w); frag.appendChild(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) { n.classList.add('sw'); words.push(n); }
  });
  const update = () => {
    const r = el.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0), 1);
    const lit = p * words.length * 1.1;
    words.forEach((w, i) => { w.style.opacity = Math.min(Math.max(lit - i, 0.14), 1); });
  };
  lenis.on('scroll', update);
  addEventListener('resize', update);
  update();
})();

// ---------------------------------------------------------------- nav: glass on scroll, hide on the way down, progress + active section
(function nav() {
  const n = $('.nav'), bar = $('#navProgress');
  const links = $$('.nav__links a, .menu__links a');
  let last = 0;
  lenis.on('scroll', ({ scroll: y, progress }) => {
    n.classList.toggle('is-scrolled', y > 40);
    n.classList.toggle('is-hidden', y > last && y > 500);
    bar.style.transform = `scaleX(${progress || 0})`;
    last = y;
  });

  // the section crossing the middle of the screen is the active one
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = '#' + e.target.id;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => io.observe(s));

  // mobile menu
  const burger = $('#navBurger'), menu = $('#menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', !open);
    open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false), { capture: true }));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });
})();

// ---------------------------------------------------------------- marquee driven by scroll velocity
(function marquee() {
  const track = $('.marquee__track');
  let x = 0, dir = -1, skew = 0;
  const loop = () => {
    const v = lenis.velocity || 0;
    if (Math.abs(v) > 0.5) dir = v > 0 ? -1 : 1;
    x += dir * (0.5 + Math.min(Math.abs(v) * 0.35, 14));
    const half = track.scrollWidth / 2;
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    skew += (Math.max(Math.min(v * 0.4, 12), -12) - skew) * 0.1;
    track.style.transform = `translate3d(${x}px,0,0) skewX(${-skew}deg)`;
    requestAnimationFrame(loop);
  };
  if (!reduced) loop();
})();

// ---------------------------------------------------------------- touch & narrow screens: scroll replaces hover
(function scrollFocus() {
  // whatever crosses the middle band of the screen gets the "hover" look
  if (touch || narrow()) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-focus', e.isIntersecting));
    }, { rootMargin: '-42% 0px -42% 0px' });
    $$('.project, .tl, .sg, .win').forEach((el) => io.observe(el));
  }

  // agents: on narrow screens the phone is sticky, and the card you scroll to drives it
  if (narrow()) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) phone.setMode(e.target.dataset.screen, true); });
    }, { rootMargin: '-62% 0px -22% 0px' });
    $$('.agent').forEach((el) => io.observe(el));

    // projects stack like a deck: each card sinks back as the next slides over it
    const cards = $$('.project');
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      scroll(animate(card, { rotateX: [18, 0], y: [60, 0], opacity: [0.3, 1] }, { ease: 'linear' }), {
        target: card, offset: ['start end', 'start 60%'],
      });
      if (!next) return;
      scroll(animate(card, { scale: [1, 0.9], filter: ['brightness(1)', 'brightness(0.45)'] }, { ease: 'linear' }), {
        target: next, offset: ['start end', 'start 90px'],
      });
    });

    // wins + timeline slide in from the side as they scroll through
    $$('.tl').forEach((el, i) => {
      scroll(animate(el, { x: [i % 2 ? 40 : -40, 0] }, { ease: 'linear' }), { target: el, offset: ['start end', 'start 70%'] });
    });
  }

  // medals spin a little faster while you scroll past
  $$('.medal').forEach((m) => {
    scroll(animate(m, { rotateZ: [-25, 25], scale: [0.8, 1.05] }, { ease: 'linear' }), { target: m.closest('.win'), offset: ['start end', 'end start'] });
  });
})();
