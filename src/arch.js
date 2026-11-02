// Instant Kirana's real topology as an explorable 3D graph, with request packets flowing through it.
import * as THREE from 'three';
import { gpu } from './gpu.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const COLORS = { client: 0xece6d8, svc: 0xdc2f2f, data: 0x9a9285, ext: 0xe8a23a };

const NODES = [
  // clients
  { id: 'customer', label: 'customer-app', kind: 'client', pos: [-4.8, 3.3, 0], tags: ['react-native', 'zustand', 'mmkv'], body: 'Shoppers browse nearby kirana stores and order. Optimistic cart updates, predictive prefetch, and a stale-while-revalidate cache so it opens instantly, even offline.' },
  { id: 'kirana', label: 'kirana-app', kind: 'client', pos: [-1.6, 3.3, 0], tags: ['react-native', 'socket.io'], body: 'The shop owner\'s app. New orders arrive over Socket.IO, and inventory updates go straight to store-service.' },
  { id: 'rider', label: 'rider-app', kind: 'client', pos: [1.6, 3.3, 0], tags: ['react-native', 'gps'], body: 'Delivery partners stream live GPS through the realtime layer. If the socket drops on 3G, a 5s REST poll keeps tracking alive.' },
  { id: 'admin', label: 'admin-web', kind: 'client', pos: [4.8, 3.3, 0], tags: ['web', 'ops'], body: 'Operations dashboard for stores, riders, payouts and feature flags.' },
  // edge
  { id: 'gateway', label: 'api-gateway', kind: 'svc', pos: [0, 1.7, 0], tags: ['nginx', 'jwt', 'rate-limit'], body: 'Nginx in front of every service. It handles TLS, routing, auth checks and rate limits. Server-driven home layouts are edge-cached here with stale-while-revalidate.' },
  // services
  { id: 'auth', label: 'auth-service', kind: 'svc', pos: [-6, 0, 0.8], tags: ['nestjs', 'passport', 'jwt'], body: 'Phone/OTP login, JWT issue and refresh, and role-based access for customers, owners, riders and admins.' },
  { id: 'store', label: 'store-service', kind: 'svc', pos: [-4, 0, -0.8], tags: ['nestjs', 'typeorm'], body: 'Stores, hours, delivery radius and inventory. Store inventory is cached in Redis for 30 minutes.' },
  { id: 'product', label: 'product-service', kind: 'svc', pos: [-2, 0, 0.8], tags: ['nestjs', 'mongo $text'], body: 'Catalog and search. A weighted MongoDB text index (name 10×, brand 5×, Hindi 5×), a ReDoS-safe regex fallback, and payloads trimmed to only what the screen shows.' },
  { id: 'order', label: 'order-service', kind: 'svc', pos: [0, 0, -0.8], tags: ['nestjs', 'state-machine'], body: 'The order lifecycle from placed to delivered. It broadcasts every status change in real time. Placing an order deliberately waits for the server, because correctness beats speed for payments.' },
  { id: 'earnings', label: 'earnings-service', kind: 'svc', pos: [2, 0, 0.8], tags: ['nestjs', 'razorpay'], body: 'Payments, payouts and ledgers for stores and riders, settled through Razorpay.' },
  { id: 'media', label: 'media-service', kind: 'svc', pos: [4, 0, -0.8], tags: ['webp', 'cdn'], body: 'Server-side image resizing to WebP at q72, behind a CDN, so product grids load fast on mid-range phones.' },
  { id: 'notification', label: 'notification-service', kind: 'svc', pos: [6, 0, 0.8], tags: ['push', 'sms'], body: 'Push and SMS fan-out for order events, driven by the realtime bus.' },
  // data
  { id: 'postgres', label: 'postgresql', kind: 'data', pos: [-3.2, -1.9, 0], tags: ['typeorm', 'acid'], body: 'The source of truth for users, stores, orders and ledgers.' },
  { id: 'mongo', label: 'mongodb', kind: 'data', pos: [0, -1.9, 0], tags: ['catalog', 'search'], body: 'Product catalog and the weighted full-text search index.' },
  { id: 'redis', label: 'redis', kind: 'data', pos: [3.2, -1.9, 0], tags: ['cache', 'upstash'], body: 'Hot cache: store inventory (30 min), search results (90 s) and session data.' },
  // realtime + payments
  { id: 'socket', label: 'socket.io', kind: 'ext', pos: [-7.6, 1.9, -0.4], tags: ['realtime', 'jittered-backoff'], body: 'Live order status and rider GPS. Reconnects forever with jittered backoff and idempotent room subscriptions, plus a 30 s safety sync.' },
  { id: 'razorpay', label: 'razorpay', kind: 'ext', pos: [7.6, -1.5, -0.4], tags: ['payments', 'upi'], body: 'UPI, cards and netbanking. Webhooks reconcile back into earnings-service.' },
];

const EDGES = [
  ['customer', 'gateway'], ['kirana', 'gateway'], ['rider', 'gateway'], ['admin', 'gateway'],
  ['customer', 'socket'], ['kirana', 'socket'], ['rider', 'socket'],
  ['gateway', 'auth'], ['gateway', 'store'], ['gateway', 'product'], ['gateway', 'order'], ['gateway', 'earnings'], ['gateway', 'media'], ['gateway', 'notification'],
  ['auth', 'postgres'], ['auth', 'redis'], ['store', 'postgres'], ['store', 'redis'], ['product', 'mongo'], ['product', 'redis'],
  ['order', 'postgres'], ['order', 'redis'], ['order', 'socket'], ['earnings', 'postgres'], ['earnings', 'razorpay'], ['media', 'mongo'], ['notification', 'redis'], ['notification', 'socket'],
];

export function initArch() {
  const wrap = document.getElementById('arch');
  const canvas = document.getElementById('archCanvas');
  const labelsEl = document.getElementById('archLabels');
  const touch = matchMedia('(hover: none)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: gpu.tier !== 'low', alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, gpu.tier === 'low' ? 1.25 : 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0a09, 16, 30);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 3.5, 17);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(4, 8, 6); scene.add(key);
  const rim = new THREE.PointLight(0xdc2f2f, 30, 30); rim.position.set(0, -3, 4); scene.add(rim);

  const graph = new THREE.Group(); scene.add(graph);

  // floor grid, faint — a "server room" plane
  const grid = new THREE.GridHelper(30, 30, 0x2a2622, 0x1a1714);
  grid.position.y = -3; graph.add(grid);

  // nodes
  const byId = {};
  const boxGeo = new RoundedBoxGeometry(1.7, 0.5, 0.6, 4, 0.12);
  const dataGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.7, 32);
  NODES.forEach((n) => {
    const geo = n.kind === 'data' ? dataGeo : boxGeo;
    const mat = new THREE.MeshStandardMaterial({ color: 0x15120f, metalness: 0.4, roughness: 0.45, emissive: COLORS[n.kind], emissiveIntensity: 0.04 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...n.pos);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: COLORS[n.kind], transparent: true, opacity: 0.75 }));
    mesh.add(edges);
    mesh.userData = { node: n, edges };
    graph.add(mesh);
    const label = document.createElement('button');
    label.className = `arch__label mono k-${n.kind}`;
    label.textContent = innerWidth < 700 ? n.label.replace(/-(service|app|web)$/, '') : n.label;
    label.addEventListener('click', () => { if (selected !== n.id) select(n.id); });
    labelsEl.appendChild(label);
    byId[n.id] = { n, mesh, label, links: [] };
  });

  // links
  const links = EDGES.map(([a, b]) => {
    const A = byId[a].mesh.position, B = byId[b].mesh.position;
    const mid = A.clone().lerp(B, 0.5); mid.z += 0.6;
    const curve = new THREE.QuadraticBezierCurve3(A.clone(), mid, B.clone());
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
    const mat = new THREE.LineBasicMaterial({ color: 0x3a3530, transparent: true, opacity: 0.8 });
    const line = new THREE.Line(geo, mat);
    graph.add(line);
    const link = { a, b, curve, line };
    byId[a].links.push(link); byId[b].links.push(link);
    return link;
  });

  // packets: requests hop client → gateway → service → datastore, then a fresh one starts
  const PACKETS = touch ? 36 : 70;
  const pGeo = new THREE.SphereGeometry(0.06, 10, 10);
  const packets = [];
  const startFrom = () => {
    const clients = ['customer', 'kirana', 'rider', 'admin'];
    return clients[(Math.random() * clients.length) | 0];
  };
  const nextLink = (from) => {
    const out = links.filter((l) => l.a === from);
    return out.length ? out[(Math.random() * out.length) | 0] : null;
  };
  for (let i = 0; i < PACKETS; i++) {
    const m = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: 0xdc2f2f }));
    graph.add(m);
    const p = { m, link: nextLink(startFrom()), t: Math.random(), speed: 0.006 + Math.random() * 0.01 };
    packets.push(p);
  }

  // controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true;
  controls.autoRotate = true; controls.autoRotateSpeed = 0.5;
  controls.minPolarAngle = 1.0; controls.maxPolarAngle = 1.75;
  controls.target.set(touch ? 0 : -1.6, 0.6, 0);
  if (touch) controls.enableRotate = false; // keep page scroll free on phones; tap to select instead

  // selection
  let selected = null, hovered = null;
  const panel = {
    kind: document.getElementById('archKind'), title: document.getElementById('archTitle'),
    body: document.getElementById('archBody'), tags: document.getElementById('archTags'),
  };
  function paint() {
    const focus = hovered || selected;
    Object.values(byId).forEach(({ n, mesh, label }) => {
      const on = focus === n.id;
      const near = focus && byId[focus].links.some((l) => l.a === n.id || l.b === n.id);
      mesh.userData.edges.material.opacity = !focus || on || near ? 0.85 : 0.2;
      mesh.material.emissiveIntensity = on ? 0.5 : 0.04;
      label.classList.toggle('is-on', on);
      label.classList.toggle('is-dim', !!focus && !on && !near);
    });
    links.forEach((l) => {
      const hit = focus && (l.a === focus || l.b === focus);
      l.line.material.color.set(hit ? 0xdc2f2f : 0x3a3530);
      l.line.material.opacity = !focus || hit ? 0.85 : 0.25;
    });
  }
  function select(id) {
    selected = selected === id ? null : id;
    const n = selected ? byId[selected].n : null;
    panel.kind.textContent = n ? n.kind.replace('svc', 'service').replace('ext', 'realtime / payments') : 'system';
    panel.title.textContent = n ? n.label : 'Instant Kirana';
    panel.body.textContent = n ? n.body : 'Hyperlocal quick commerce for Tier-2/3 India. Click a node to see what it does and how it talks to the rest.';
    panel.tags.innerHTML = (n ? n.tags : ['nestjs', 'docker-compose', 'socket.io']).map((t) => `<span>${t}</span>`).join('');
    const outs = n ? byId[n.id].links.map((l) => (l.a === n.id ? '→ ' + l.b : '← ' + l.a)) : [];
    if (outs.length) panel.tags.innerHTML += `<div class="arch__conn">${outs.join('<br/>')}</div>`;
    paint();
  }

  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const meshes = Object.values(byId).map((x) => x.mesh);
  const pick = (e) => {
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    return ray.intersectObjects(meshes, false)[0]?.object.userData.node.id || null;
  };
  let downAt = 0;
  canvas.addEventListener('pointerdown', () => (downAt = performance.now()));
  canvas.addEventListener('pointerup', (e) => { if (performance.now() - downAt < 250) { const id = pick(e); if (id) select(id); else if (selected) select(selected); } });
  canvas.addEventListener('pointermove', (e) => {
    if (touch) return;
    const id = pick(e);
    if (id !== hovered) { hovered = id; canvas.style.cursor = id ? 'pointer' : 'grab'; paint(); }
  });
  canvas.addEventListener('pointerleave', () => { hovered = null; paint(); });

  // fake-but-plausible live metrics
  const statsEl = document.getElementById('archStats');
  let rps = 1180;
  setInterval(() => {
    rps = Math.max(820, Math.min(1680, rps + (Math.random() - 0.5) * 120));
    const p95 = (34 + Math.random() * 12) | 0, hit = (90 + Math.random() * 6).toFixed(1);
    statsEl.innerHTML = `simulated · rps <b>${rps | 0}</b> · p95 <b>${p95}ms</b> · cache hit <b>${hit}%</b>`;
  }, 900);

  const resize = () => {
    const r = wrap.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    // back the camera off until the ~17-unit-wide graph fits the frame
    const dist = Math.max(17, 16 / (2 * Math.tan(THREE.MathUtils.degToRad(19)) * camera.aspect));
    camera.position.setLength(dist);
    scene.fog.near = dist - 4; scene.fog.far = dist + 16;
    controls.target.y = camera.aspect < 1 ? -3.2 : 0.6;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(wrap); resize();

  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '100px' }).observe(wrap);

  const v = new THREE.Vector3();
  const loop = () => {
    requestAnimationFrame(loop);
    if (!visible) return;
    controls.update();
    packets.forEach((p) => {
      if (!p.link) p.link = nextLink(startFrom());
      p.t += p.speed;
      if (p.t >= 1) { p.t = 0; p.link = nextLink(p.link.b) || nextLink(startFrom()); }
      p.link.curve.getPoint(p.t, p.m.position);
      const focus = hovered || selected;
      const lit = !focus || p.link.a === focus || p.link.b === focus;
      p.m.material.color.set(lit ? (byId[p.link.a].n.kind === 'client' ? 0xece6d8 : 0xdc2f2f) : 0x3a3530);
    });
    renderer.render(scene, camera);
    // DOM labels follow their nodes
    const r = canvas.getBoundingClientRect();
    Object.values(byId).forEach(({ mesh, label }) => {
      v.copy(mesh.position).add(new THREE.Vector3(0, mesh.userData.node.kind === 'data' ? -0.65 : -0.5, 0)).project(camera);
      label.style.transform = `translate(-50%, 0) translate(${(v.x * 0.5 + 0.5) * r.width}px, ${(-v.y * 0.5 + 0.5) * r.height}px)`;
    });
  };
  loop();
}
