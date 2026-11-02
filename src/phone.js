import * as THREE from 'three';
import { gpu } from './gpu.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const W = 600, H = 1300; // screen canvas
const LIME = '#dc2f2f', VIOLET = '#5a554d', CORAL = '#dc2f2f', BONE = '#ece6d8';

// ---------------------------------------------------------------- scenarios
// each: duration (s), terminal script [[time, html]], draw(ctx, t)
const SCENES = {
  android: {
    dur: 9,
    term: [
      [0.4, '<span class="p">❯</span> phone_screen --mode marks'],
      [1.4, '<span class="ok">✓</span> 12 elements · Pixel 7 · Android 14'],
      [2.4, '<span class="p">❯</span> phone_tap 5'],
      [3.1, '<span class="ok">✓</span> opened YouTube'],
      [3.6, '<span class="p">❯</span> phone_type "lofi music" --submit'],
      [6.0, '<span class="ok">✓</span> 20 results — playing the first one'],
    ],
    draw: drawAndroid,
  },
  expo: {
    dur: 10,
    term: [
      [0.4, '<span class="p">❯</span> app_snapshot'],
      [1.3, '<span class="ok">✓</span> 9 nodes · route /sign-up · Expo Go'],
      [2.2, '<span class="p">❯</span> app_type 2 "rudra@" · app_tap 4'],
      [4.2, '<span style="color:#dc2f2f">⚠</span> console.error: Invalid email address'],
      [5.4, '<span style="color:#dc2f2f">⚠</span> network: POST /auth/signup → 400'],
      [7.0, '<span class="ok">✓</span> agent: fixed email validation in SignUp.tsx'],
    ],
    draw: drawExpo,
  },
  video: {
    dur: 11,
    term: [
      [0.3, '<span class="p">❯</span> "make a 45s launch video of the app"'],
      [1.2, '<span class="ok">✓</span> recorded 5 takes on the phone · picked the best 3'],
      [3.4, '<span class="p">❯</span> captions · zooms · pop-outs · sound'],
      [6.2, '<span class="p">❯</span> render --1080p'],
      [9.2, '<span class="ok">✓</span> launch.mp4 · 1080×1920 · 45s'],
    ],
    draw: drawVideo,
  },
};

const ORDER = ['android', 'expo', 'video'];

export function initPhone(canvas, termEl, cards, tabs = []) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: gpu.tier !== 'low', alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, gpu.tier === 'low' ? 1.25 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9.5);

  const phone = new THREE.Group();
  scene.add(phone);

  const bw = 2.1, bh = 4.4, bd = 0.24;
  const frameMat = new THREE.MeshPhysicalMaterial({ color: 0x1b1922, metalness: 0.9, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(bw, bh, bd, 8, 0.28), frameMat);
  phone.add(body);

  // back plate with lime accent
  const backMat = new THREE.MeshPhysicalMaterial({ color: 0x15130f, metalness: 0.2, roughness: 0.55, clearcoat: 0.6 });
  const back = new THREE.Mesh(new RoundedBoxGeometry(bw - 0.06, bh - 0.06, 0.02, 6, 0.26), backMat);
  back.position.z = -bd / 2 - 0.001;
  phone.add(back);

  // camera bump
  const bump = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.85, 0.08, 6, 0.2), frameMat);
  bump.position.set(-0.5, 1.5, -bd / 2 - 0.04);
  phone.add(bump);
  const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x050508, metalness: 1, roughness: 0.05, clearcoat: 1 });
  [[-0.68, 1.68], [-0.32, 1.68], [-0.68, 1.32]].forEach(([x, y]) => {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 32), lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(x, y, -bd / 2 - 0.1);
    phone.add(lens);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.015, 8, 32), new THREE.MeshBasicMaterial({ color: 0xdc2f2f }));
    ring.position.set(x, y, -bd / 2 - 0.13);
    phone.add(ring);
  });
  // side buttons
  [[1.2, 0.5], [0.7, 0.3]].forEach(([y, h]) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.04, h, 0.08, 2, 0.02), frameMat);
    b.position.set(bw / 2 + 0.01, y, 0);
    phone.add(b);
  });

  // screen
  const sc = document.createElement('canvas');
  sc.width = W; sc.height = H;
  const ctx = sc.getContext('2d');
  const tex = new THREE.CanvasTexture(sc);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const screenGeo = roundedPlane(bw - 0.16, bh - 0.16, 0.22);
  const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  screen.position.z = bd / 2 + 0.002;
  phone.add(screen);
  // glass
  const glass = new THREE.Mesh(screenGeo, new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0.12, roughness: 0, metalness: 0, clearcoat: 1, color: 0xffffff }));
  glass.position.z = bd / 2 + 0.006;
  phone.add(glass);

  // floating glow disc under phone
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uC: { value: new THREE.Color(0xdc2f2f) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'uniform vec3 uC; varying vec2 vUv; void main(){ float d=length(vUv-.5); gl_FragColor=vec4(uC, smoothstep(.5,0.,d)*.18); }',
    })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -2.7;
  scene.add(glow);

  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xdc2f2f, 3); rim.position.set(-4, 2, -3); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xffe8d0, 1.2); rim2.position.set(4, -2, -3); scene.add(rim2);

  // ------------------------------------------------------------ interaction
  let rotY = -0.35, rotX = 0.08, velY = 0, dragging = false, lastX = 0, lastY = 0, idle = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    velY = dx * 0.008; rotY += velY; rotX = THREE.MathUtils.clamp(rotX + dy * 0.004, -0.5, 0.5);
    lastX = e.clientX; lastY = e.clientY; idle = 0;
  });
  const up = () => { dragging = false; };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  // ------------------------------------------------------------ scenario control
  let mode = 'android', modeStart = performance.now(), printed = 0, pinned = false;
  const setMode = (m, pin = false) => {
    if (m === mode && !pin) return;
    mode = m; modeStart = performance.now(); printed = 0; termEl.innerHTML = '';
    if (pin) pinned = true;
    cards.forEach((c) => c.classList.toggle('is-active', c.dataset.screen === m));
    tabs.forEach((t) => t.classList.toggle('on', t.dataset.s === m));
  };
  tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.s, true)));
  cards.forEach((c) => {
    c.addEventListener('mouseenter', () => { if (c.dataset.screen !== mode) setMode(c.dataset.screen, true); });
    c.addEventListener('click', () => setMode(c.dataset.screen, true));
    c.addEventListener('mouseleave', () => { pinned = false; });
  });
  mode = '';
  setMode('android');

  // ------------------------------------------------------------ loop
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(canvas);

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.position.z = camera.aspect < 0.75 ? 11.5 : 9.5;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let lastDraw = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const sceneDef = SCENES[mode];
    let t = (now - modeStart) / 1000;
    if (t > sceneDef.dur) {
      if (pinned) { modeStart = now; printed = 0; termEl.innerHTML = ''; t = 0; }
      else { setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]); t = 0; }
    }
    // terminal
    const lines = SCENES[mode].term;
    while (printed < lines.length && t >= lines[printed][0]) {
      const old = termEl.querySelector('.caret'); if (old) old.remove();
      const div = document.createElement('div');
      div.innerHTML = lines[printed][1] + ' <span class="caret"></span>';
      termEl.appendChild(div);
      while (termEl.children.length > 4) termEl.firstChild.remove();
      printed++;
    }
    // screen @ ~40fps
    if (now - lastDraw > 24) {
      SCENES[mode].draw(ctx, t);
      tex.needsUpdate = true;
      lastDraw = now;
    }
    // motion
    idle += 1 / 60;
    if (!dragging) {
      velY *= 0.94;
      rotY += velY;
      if (idle > 1.2) rotY += (Math.sin(now / 2400) * 0.38 - 0.1 - rotY) * 0.02;
      rotX += (0.06 - rotX) * 0.03;
    }
    phone.rotation.set(rotX, rotY, Math.sin(now / 3000) * 0.04);
    phone.position.y = Math.sin(now / 1100) * 0.08 + (camera.aspect < 0.75 ? 0.75 : 0.12);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  return { setMode, release: () => { pinned = false; } };
}

function roundedPlane(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 24);
  // map UVs to 0..1
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - x) / w, (p.getY(i) - y) / h);
  return g;
}

// ---------------------------------------------------------------- drawing
const ease = (k) => 1 - Math.pow(1 - Math.min(Math.max(k, 0), 1), 3);
const F = (w, s, fam = 'Inter') => `${w} ${s}px ${fam}, system-ui, sans-serif`;

function rr(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

function statusBar(ctx, color = '#fff', island = false) {
  ctx.fillStyle = color; ctx.font = F(600, 26);
  ctx.textAlign = 'left'; ctx.fillText('9:41', 48, 62);
  ctx.textAlign = 'right'; ctx.fillText('5G ▮▮▮ 87%', W - 44, 62);
  ctx.textAlign = 'left';
  if (island) rr(ctx, W / 2 - 90, 26, 180, 52, 26, '#000');
  else { ctx.beginPath(); ctx.arc(W / 2, 52, 14, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill(); }
}

function wallpaper(ctx, a, b, c) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, a); g.addColorStop(0.55, b); g.addColorStop(1, c);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function mark(ctx, n, x, y, w, h, alpha) {
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 3; rr(ctx, x - 6, y - 6, w + 12, h + 12, 16, null, LIME);
  rr(ctx, x - 14, y - 16, 36, 30, 8, LIME);
  ctx.fillStyle = BONE; ctx.font = F(600, 20, 'IBM Plex Mono'); ctx.textAlign = 'center';
  ctx.fillText(String(n), x + 4, y + 6); ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

function ripple(ctx, x, y, k) {
  if (k <= 0 || k >= 1) return;
  ctx.globalAlpha = 1 - k;
  ctx.beginPath(); ctx.arc(x, y, 20 + k * 90, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(220,47,47,0.35)'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fillStyle = LIME; ctx.fill();
  ctx.globalAlpha = 1;
}

const APPS = [
  ['Chrome', '#4285f4'], ['Gmail', '#ea4335'], ['Maps', '#34a853'], ['Photos', '#fbbc05'],
  ['YouTube', '#ff0033'], ['Spotify', '#1db954'], ['Camera', '#5f6368'], ['Settings', '#8ab4f8'],
  ['PrepSharp', '#dc2f2f'], ['Kirana', '#ff7a3d'], ['Files', '#6b6358'], ['Clock', '#3a3530'],
];

function appGrid(ctx, topY, marksAlpha, rounded = 36, labels = true) {
  const cols = 4, size = 104, gapX = (W - cols * size) / (cols + 1), gapY = 64;
  const pos = [];
  APPS.forEach(([name, c], i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = gapX + col * (size + gapX), y = topY + row * (size + gapY);
    const g = ctx.createLinearGradient(x, y, x + size, y + size);
    g.addColorStop(0, c); g.addColorStop(1, shade(c, -40));
    rr(ctx, x, y, size, size, rounded, g);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = F(700, 52, 'Grenze Gotisch'); ctx.textAlign = 'center';
    ctx.fillText(name[0], x + size / 2, y + size / 2 + 16);
    if (labels) { ctx.font = F(500, 20); ctx.fillStyle = '#fff'; ctx.fillText(name, x + size / 2, y + size + 30); }
    ctx.textAlign = 'left';
    pos.push([x, y, size]);
  });
  if (marksAlpha > 0) pos.forEach(([x, y, s], i) => mark(ctx, i + 1, x, y, s, s, marksAlpha));
  return pos;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

function drawAndroid(ctx, t) {
  if (t < 3) {
    wallpaper(ctx, '#14110e', '#1f1915', '#2a0f0d');
    // clock widget
    ctx.fillStyle = BONE; ctx.font = F(600, 130, 'Grenze Gotisch'); ctx.fillText('9:41', 48, 250);
    ctx.font = F(500, 26); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('Sunday, 1 November', 54, 296);
    const pos = appGrid(ctx, 420, ease((t - 0.8) / 0.4) * (t < 2.9 ? 1 : 0));
    const [x, y, s] = pos[4];
    ripple(ctx, x + s / 2, y + s / 2, (t - 2.4) / 0.6);
    // dock search
    rr(ctx, 40, H - 170, W - 80, 84, 42, 'rgba(255,255,255,0.14)');
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = F(500, 26); ctx.fillText('Search', 100, H - 118);
    statusBar(ctx);
  } else {
    // YouTube-ish
    ctx.fillStyle = '#0f0f12'; ctx.fillRect(0, 0, W, H);
    const k = ease((t - 3) / 0.4);
    ctx.globalAlpha = k;
    rr(ctx, 36, 120, 70, 50, 14, '#ff0033');
    ctx.beginPath(); ctx.moveTo(62, 132); ctx.lineTo(62, 158); ctx.lineTo(84, 145); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = F(600, 40, 'Grenze Gotisch'); ctx.fillText('YouTube', 122, 158);
    rr(ctx, 36, 210, W - 72, 80, 40, '#22222a', '#33333d');
    const q = 'lofi music';
    const typed = q.slice(0, Math.max(0, Math.floor((t - 3.7) / 0.18)));
    ctx.fillStyle = '#fff'; ctx.font = F(500, 30); ctx.fillText(typed, 76, 262);
    if (Math.floor(t * 2) % 2 === 0 && t < 5.8) { ctx.fillStyle = LIME; ctx.fillRect(78 + ctx.measureText(typed).width, 232, 3, 40); }
    if (t > 5.8) {
      for (let i = 0; i < 4; i++) {
        const a = ease((t - 5.8 - i * 0.15) / 0.4);
        ctx.globalAlpha = a;
        const y = 330 + i * 230 + (1 - a) * 40;
        const g = ctx.createLinearGradient(36, y, 300, y + 180);
        g.addColorStop(0, ['#5a554d', '#dc2f2f', '#8b8478', '#3a2a24'][i]); g.addColorStop(1, '#1a1a22');
        rr(ctx, 36, y, 280, 180, 18, g);
        ctx.fillStyle = '#fff'; ctx.font = F(600, 24); ctx.fillText(['lofi hip hop radio 📚', 'chill beats to code to', 'late night lofi ☕', 'rainy day study mix'][i], 340, y + 50);
        ctx.fillStyle = '#9a9aa6'; ctx.font = F(400, 20); ctx.fillText(['2.1M watching', '8.4M views', '3.2M views', '1.1M views'][i], 340, y + 88);
        if (i === 0) { rr(ctx, 340, y + 112, 76, 32, 8, '#ff0033'); ctx.fillStyle = '#fff'; ctx.font = F(700, 18); ctx.fillText('LIVE', 356, y + 135); }
      }
      ctx.globalAlpha = 1;
      if (t > 6.6) mark(ctx, 1, 36, 330, 280, 180, ease((t - 6.6) / 0.3) * 0.9);
      ripple(ctx, 176, 420, (t - 7.6) / 0.6);
    }
    ctx.globalAlpha = 1;
    statusBar(ctx);
  }
}

function drawExpo(ctx, t) {
  ctx.fillStyle = '#0e0c0a'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W, 0, 0, W, 0, 700); g.addColorStop(0, 'rgba(220,47,47,0.14)'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  statusBar(ctx);
  // header
  rr(ctx, 48, 130, 64, 64, 18, LIME);
  ctx.fillStyle = BONE; ctx.font = F(700, 46, 'Grenze Gotisch'); ctx.fillText('P', 68, 178);
  ctx.fillStyle = BONE; ctx.font = F(600, 36, 'Grenze Gotisch'); ctx.fillText('PrepSharp', 128, 174);
  ctx.font = F(600, 80, 'Grenze Gotisch'); ctx.fillText('Create your', 48, 330); ctx.fillText('account', 48, 404);
  ctx.fillStyle = '#8e899c'; ctx.font = F(400, 24); ctx.fillText('Your JEE practice starts here.', 48, 454);

  const fields = [['Name', 'Rudra'], ['Email', 'rudra@'], ['Password', '••••••••']];
  const typedEmail = 'rudra@'.slice(0, Math.max(0, Math.floor((t - 2.4) / 0.15)));
  fields.forEach(([label, val], i) => {
    const y = 520 + i * 140;
    const err = i === 1 && t > 4.1;
    ctx.fillStyle = err ? CORAL : '#8e899c'; ctx.font = F(500, 20); ctx.fillText(label, 48, y);
    rr(ctx, 48, y + 16, W - 96, 84, 20, '#17151f', err ? CORAL : '#2a2733');
    ctx.fillStyle = '#fff'; ctx.font = F(500, 28);
    ctx.fillText(i === 1 ? typedEmail : val, 76, y + 70);
  });
  // button
  const pressed = t > 3.6 && t < 3.9;
  rr(ctx, 48, 950 + (pressed ? 4 : 0), W - 96, 96, 48, LIME);
  ctx.fillStyle = BONE; ctx.font = F(600, 30); ctx.textAlign = 'center'; ctx.fillText('Sign up →', W / 2, 1010 + (pressed ? 4 : 0)); ctx.textAlign = 'left';

  // agent marks
  const mA = ease((t - 0.9) / 0.3) * (t < 2.2 ? 1 : 0);
  if (mA > 0) {
    [[48, 536, W - 96, 84], [48, 676, W - 96, 84], [48, 816, W - 96, 84], [48, 950, W - 96, 96]].forEach(([x, y, w, h], i) => mark(ctx, i + 1, x, y, w, h, mA));
  }
  ripple(ctx, W / 2, 998, (t - 3.5) / 0.6);

  // error toast
  if (t > 4.1) {
    const k = ease((t - 4.1) / 0.4);
    ctx.globalAlpha = k;
    rr(ctx, 36, 1080 + (1 - k) * 40, W - 72, 110, 24, 'rgba(255,106,61,0.14)', CORAL);
    ctx.fillStyle = CORAL; ctx.font = F(500, 20, 'IBM Plex Mono'); ctx.fillText('console.error', 66, 1124 + (1 - k) * 40);
    ctx.fillStyle = '#fff'; ctx.font = F(500, 24); ctx.fillText('Invalid email address', 66, 1162 + (1 - k) * 40);
    ctx.globalAlpha = 1;
  }
  // failed request, then the agent's fix
  if (t > 5.4) {
    const k = ease((t - 5.4) / 0.4);
    ctx.globalAlpha = k;
    rr(ctx, 36, 210 + (1 - k) * -30, W - 72, 96, 20, 'rgba(11,10,9,0.92)', 'rgba(236,230,216,0.2)');
    ctx.fillStyle = CORAL; ctx.font = F(500, 19, 'IBM Plex Mono'); ctx.fillText('network', 62, 248);
    ctx.fillStyle = BONE; ctx.font = F(500, 22, 'IBM Plex Mono'); ctx.fillText('POST /auth/signup  400', 62, 282);
    ctx.globalAlpha = 1;
  }
  if (t > 7) {
    const k = ease((t - 7) / 0.5);
    ctx.globalAlpha = k;
    ctx.fillStyle = 'rgba(11,10,9,0.55)'; ctx.fillRect(0, 0, W, H);
    rr(ctx, 60, 520, W - 120, 260, 28, '#14110e', 'rgba(236,230,216,0.2)');
    ctx.fillStyle = CORAL; ctx.font = F(500, 20, 'IBM Plex Mono'); ctx.fillText('agent', 100, 580);
    ctx.fillStyle = BONE; ctx.font = F(600, 50, 'Grenze Gotisch'); ctx.fillText('Bug fixed.', 100, 650);
    ctx.fillStyle = '#b3ac9f'; ctx.font = F(400, 22); ctx.fillText('SignUp.tsx · email validation', 100, 700);
    ctx.fillText('re-tested on device ✓', 100, 736);
    ctx.globalAlpha = 1;
  }
}

function drawVideo(ctx, t) {
  ctx.fillStyle = '#0b0a09'; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 520, 0, W / 2, 520, 600);
  glow.addColorStop(0, 'rgba(220,47,47,0.22)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  statusBar(ctx);

  // REC → RENDER badge
  const rendering = t > 6.2;
  rr(ctx, 36, 108, 250, 52, 26, 'rgba(0,0,0,0.6)', 'rgba(236,230,216,0.15)');
  if (rendering || Math.floor(t * 2) % 2 === 0) { ctx.beginPath(); ctx.arc(66, 134, 9, 0, Math.PI * 2); ctx.fillStyle = CORAL; ctx.fill(); }
  ctx.fillStyle = BONE; ctx.font = F(500, 20, 'IBM Plex Mono');
  ctx.fillText(rendering ? 'rendering…' : `take ${Math.min(5, 1 + Math.floor(t / 0.5))}/5`, 88, 141);

  // the app "pop-out" — a mini CBT screen that zooms and tilts
  const z = 0.82 + 0.1 * ease((t - 1) / 1.2) - 0.06 * ease((t - 4) / 1);
  const cx = W / 2, cy = 520;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(Math.sin(t * 0.8) * 0.04 - 0.05); ctx.scale(z, z);
  ctx.shadowColor = 'rgba(220,47,47,0.5)'; ctx.shadowBlur = 50;
  rr(ctx, -200, -250, 400, 500, 30, '#16130f');
  ctx.shadowBlur = 0;
  rr(ctx, -200, -250, 400, 500, 30, null, 'rgba(236,230,216,0.25)');
  ctx.fillStyle = CORAL; ctx.font = F(500, 16, 'IBM Plex Mono'); ctx.fillText('JEE MAIN · PHYSICS · Q.14', -170, -200);
  ctx.fillStyle = BONE; ctx.font = F(400, 20);
  ['A block of mass m slides down', 'a smooth incline of angle θ.', 'Find its acceleration.'].forEach((l, i) => ctx.fillText(l, -170, -150 + i * 30));
  ['g sin θ', 'g cos θ', 'g tan θ', 'g'].forEach((o, i) => {
    const sel = i === 0 && t > 2.2;
    rr(ctx, -170, -40 + i * 66, 340, 52, 12, sel ? 'rgba(220,47,47,0.25)' : '#1f1b17', sel ? CORAL : 'rgba(236,230,216,0.1)');
    ctx.fillStyle = BONE; ctx.font = F(500, 20, 'IBM Plex Mono'); ctx.fillText(`(${'ABCD'[i]})  ${o}`, -146, -6 + i * 66);
  });
  ctx.restore();

  // kinetic captions
  const caps = [['Practice JEE', 0.6], ['on the real', 2.6], ['exam interface.', 4.4]];
  caps.forEach(([txt, at], i) => {
    const k = ease((t - at) / 0.45);
    if (k <= 0) return;
    ctx.globalAlpha = k;
    ctx.fillStyle = i === 2 ? CORAL : BONE;
    ctx.font = F(700, 64, 'Grenze Gotisch');
    ctx.fillText(txt, 44 + (1 - k) * -60, 860 + i * 70);
  });
  ctx.globalAlpha = 1;

  // timeline
  const ty = 1080;
  rr(ctx, 24, ty - 20, W - 48, 160, 18, 'rgba(236,230,216,0.04)', 'rgba(236,230,216,0.1)');
  const tracks = [[[0, 0.3], [0.32, 0.62], [0.64, 1]], [[0.05, 0.45], [0.5, 0.95]], [[0, 1]]];
  tracks.forEach((clips, r) => clips.forEach(([a, b], i) => {
    const x0 = 44 + a * (W - 88), x1 = 44 + b * (W - 88);
    rr(ctx, x0, ty + r * 40, x1 - x0 - 4, 30, 6, r === 0 ? (i % 2 ? '#3a2a24' : '#5e1513') : r === 1 ? '#2a2622' : 'rgba(236,230,216,0.12)');
  }));
  const ph = 44 + ((t / 6.2) % 1) * (W - 88);
  if (!rendering) { ctx.fillStyle = CORAL; ctx.fillRect(ph, ty - 10, 3, 130); }
  if (rendering) {
    const p = Math.min(1, (t - 6.2) / 2.8);
    rr(ctx, 44, ty + 54, W - 88, 14, 7, 'rgba(236,230,216,0.1)');
    rr(ctx, 44, ty + 54, (W - 88) * p, 14, 7, CORAL);
    ctx.fillStyle = BONE; ctx.font = F(500, 20, 'IBM Plex Mono');
    ctx.fillText(p < 1 ? `exporting ${Math.round(p * 100)}%` : 'launch.mp4 · 1080p ✓', 44, ty + 110);
  }

}
