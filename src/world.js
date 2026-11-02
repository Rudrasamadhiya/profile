// The Die — a procedural silicon city the whole site flies through.
// One fixed full-screen WebGL scene: instanced towers, circuit-trace ground,
// shader-driven packet traffic, landmark beacons, a scroll-driven camera rig,
// bloom + a filmic final pass, and a HUD (die map, telemetry) kept in sync.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { gpu } from './gpu.js';

// ---------------------------------------------------------------- world description
const HALF = 200;          // world spans [-200, 200]
const CELL = 4;            // one building per cell
const N = (HALF * 2) / CELL;
const STREET = 8;          // every 8th row/column is a major street
const FOG = new THREE.Color('#0b0908');

export const DISTRICTS = {
  core:      { x: 0,    z: 0,    r: 18, name: 'CORE · RUDRA',        note: 'full-stack · agents · systems' },
  agents:    { x: -92,  z: -44,  r: 30, name: 'AGENT TOOLKIT',        note: '3 packages on npm' },
  prepsharp: { x: 76,   z: -74,  r: 30, name: 'PREPSHARP.IN',         note: '133K+ questions · live' },
  kirana:    { x: 92,   z: 64,   r: 34, name: 'INSTANT KIRANA',       note: '7 microservices' },
  live:      { x: -36,  z: 92,   r: 22, name: 'MAIN BUS',             note: 'commits in flight' },
  wins:      { x: -104, z: 70,   r: 24, name: 'HALL OF WINS',         note: '2× first place' },
  skills:    { x: 20,   z: 132,  r: 30, name: 'STANDARD CELL LIBRARY', note: 'TS · Java · Kotlin · C++' },
};

// section → camera waypoint (position, look-at)
const SHOTS = {
  hero:    { pos: [-30, 210, 190], look: [0, 0, 10] },
  about:   { pos: [34, 34, 52],    look: [0, 26, 0] },
  agents:  { pos: [-52, 22, -8],   look: [-92, 14, -44] },
  work:    { pos: [34, 30, -24],   look: [76, 8, -74] },
  systems: { pos: [54, 26, 108],   look: [92, 6, 64] },
  live:    { pos: [-14, 5, 75],    look: [-60, 2, 92] },
  wins:    { pos: [-70, 10, 104],  look: [-104, 32, 70] },
  skills:  { pos: [-10, 70, 186],  look: [20, 0, 130] },
  contact: { pos: [0, 330, 24],    look: [0, 0, 0] },
};

// deterministic randomness
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rand = mulberry32(1337);
const hash2 = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const dist = (x, z, d) => Math.hypot(x - d.x, z - d.z);

function buildCity(mobile) {
  const blocks = []; // { x, z, w, d, h, kind }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (i % STREET === 0 || j % STREET === 0) continue;
      const x = -HALF + i * CELL + CELL / 2, z = -HALF + j * CELL + CELL / 2;
      const r = Math.hypot(x, z);
      if (r > HALF - 6) continue;
      if (mobile && r > 120 && rand() < 0.55) continue;
      if (dist(x, z, DISTRICTS.core) < DISTRICTS.core.r) continue;          // plaza around the core
      if (dist(x, z, DISTRICTS.kirana) < DISTRICTS.kirana.r) continue;      // replaced by service blocks
      if (dist(x, z, DISTRICTS.wins) < 14) continue;                         // beacon plaza

      const n = vnoise(x * 0.025, z * 0.025);
      const edge = 1 - Math.min(r / HALF, 1);
      let h = 0.4 + Math.pow(rand(), 3) * 7 * (0.4 + n) + edge * edge * 6;
      let w = CELL * (0.62 + rand() * 0.22), d = CELL * (0.62 + rand() * 0.22);
      let kind = 0;

      if (dist(x, z, DISTRICTS.prepsharp) < DISTRICTS.prepsharp.r) {       // the question bank: uniform towers
        h = 11 + rand() * 2.5; w = d = CELL * 0.74; kind = 1;
      } else if (dist(x, z, DISTRICTS.agents) < DISTRICTS.agents.r) {      // antenna spires
        if (rand() < 0.35) { h = 16 + rand() * 26; w = d = 1.1; kind = 2; } else h *= 0.6;
      } else if (dist(x, z, DISTRICTS.skills) < DISTRICTS.skills.r) {      // flat standard cells
        h = 0.3 + rand() * 0.9; kind = 3;
      } else if (dist(x, z, DISTRICTS.live) < DISTRICTS.live.r) {
        h *= 0.35;
      }
      if (rand() < 0.07 && kind === 0) continue; // the odd empty lot
      blocks.push({ x, z, w, d, h, kind });
    }
  }
  // Kirana: a hub and 7 service blocks around it
  const K = DISTRICTS.kirana;
  blocks.push({ x: K.x, z: K.z, w: 9, d: 9, h: 22, kind: 4 });
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    blocks.push({ x: K.x + Math.cos(a) * 21, z: K.z + Math.sin(a) * 21, w: 8, d: 8, h: 9 + (k % 3) * 3, kind: 4 });
  }
  return blocks;
}

// ---------------------------------------------------------------- shaders
const FOG_GLSL = /* glsl */ `
uniform vec3 uFog; uniform float uFogDensity;
vec3 fogit(vec3 c, float d){ float f = 1. - exp(-uFogDensity * uFogDensity * d * d); return mix(c, uFog, clamp(f, 0., 1.)); }
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
`;

const groundVert = /* glsl */ `
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;

const groundFrag = /* glsl */ `
uniform float uTime; uniform vec3 uRed; uniform vec3 uBone;
varying vec3 vW;
${FOG_GLSL}
float line(float c, float w){ float d = abs(fract(c) - .5); return 1. - smoothstep(w, w + fwidth(c) * 1.2, .5 - d); }
void main(){
  vec2 p = vW.xz;
  float r = length(p);
  vec3 col = vec3(.018, .016, .015);

  // minor traces on every cell edge
  vec2 g = p / ${CELL.toFixed(1)};
  float minor = max(line(g.x, .485), line(g.y, .485));
  col += uBone * minor * .025;

  // major streets: a band every ${STREET} cells, with lane markings
  vec2 s = (p + ${HALF.toFixed(1)}) / ${(CELL * STREET).toFixed(1)};
  vec2 sf = fract(s);
  float bandX = step(sf.y, ${(1 / STREET).toFixed(4)}), bandZ = step(sf.x, ${(1 / STREET).toFixed(4)});
  float street = max(bandX, bandZ);
  col = mix(col, vec3(.03, .026, .024), street);
  vec2 lane = abs(fract((p + ${HALF.toFixed(1)}) / ${CELL.toFixed(1)}) - .5);
  float dashX = bandX * step(lane.y, .03) * step(.5, fract(p.x * .25));
  float dashZ = bandZ * step(lane.x, .03) * step(.5, fract(p.y * .25));
  col += uBone * (dashX + dashZ) * .05;

  // signal pulses racing along the streets
  float idZ = floor(s.y), idX = floor(s.x);
  float px = fract((p.x + uTime * (14. + h21(vec2(idZ, 1.)) * 18.) + h21(vec2(idZ, 3.)) * 400.) / 90.);
  float pz = fract((p.y - uTime * (14. + h21(vec2(idX, 2.)) * 18.) + h21(vec2(idX, 4.)) * 400.) / 90.);
  float pulse = bandX * smoothstep(.0, .06, px) * (1. - smoothstep(.06, .09, px))
              + bandZ * smoothstep(.0, .06, pz) * (1. - smoothstep(.06, .09, pz));
  col += uRed * pulse * 2.4;

  // vias at intersections
  vec2 vi = abs(fract((p + ${HALF.toFixed(1)}) / ${CELL.toFixed(1)}) - .5);
  float via = (1. - smoothstep(.06, .1, length(vi - .5))) * street;
  col += uBone * via * .25;

  // die outline + seal ring
  float ring = 1. - smoothstep(0., 1.2, abs(r - ${(HALF - 2).toFixed(1)}));
  col += uRed * ring * 1.4;
  col *= smoothstep(${(HALF + 30).toFixed(1)}, ${(HALF - 20).toFixed(1)}, r) * .9 + .1;

  col = fogit(col, length(vW - cameraPosition));
  gl_FragColor = vec4(col, 1.);
}`;

const towerVert = /* glsl */ `
attribute float aSeed; attribute float aKind;
varying vec3 vW; varying vec3 vN; varying vec3 vL; varying float vSeed; varying float vKind; varying float vH;
void main(){
  vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.);
  vW = w.xyz; vL = position; vSeed = aSeed; vKind = aKind;
  vH = length(instanceMatrix[1].xyz);
  vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const towerFrag = /* glsl */ `
uniform float uTime; uniform vec3 uRed; uniform vec3 uBone; uniform vec3 uFocus; uniform float uFocusR;
varying vec3 vW; varying vec3 vN; varying vec3 vL; varying float vSeed; varying float vKind; varying float vH;
${FOG_GLSL}
void main(){
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vW);
  float top = step(.5, n.y);
  vec3 base = vec3(.035, .031, .028) + vSeed * .02;
  if (vKind == 1.) base = vec3(.05, .045, .04);
  vec3 col = base * (.55 + .45 * max(dot(n, normalize(vec3(-.5, .8, .3))), 0.));

  // floors + windows on the side faces
  float side = 1. - top;
  float fl = floor(vW.y / .62);
  float colId = floor((vW.x + vW.z) / .55);
  float on = step(.86 - vKind * .03, h21(vec2(fl + vSeed * 91., colId)));
  float cellY = fract(vW.y / .62), cellX = fract((vW.x + vW.z) / .55);
  float win = on * step(.25, cellY) * step(cellY, .7) * step(.2, cellX) * step(cellX, .75) * side;
  float hot = step(.985, h21(vec2(fl * 3.1, colId + vSeed * 17.)));
  float blink = .55 + .45 * sin(uTime * (1. + vSeed * 3.) + vSeed * 40.);
  col += mix(uBone * .6, uRed * 1.6 * blink, hot) * win;

  // PrepSharp towers: rows of tiny lit cells, like an index
  if (vKind == 1.) col += uBone * side * step(.92, fract(vW.y * 2.4)) * .18;

  // top edge glow + rooftop lights on tall towers
  float rim = smoothstep(.96, 1., vL.y) * side;
  col += uBone * rim * .5;
  if (vH > 14.) col += uRed * top * step(length(fract(vW.xz) - .5), .12) * 3. * blink;

  // spires burn red at the tip
  if (vKind == 2.) col += uRed * smoothstep(.85, 1., vL.y) * 3.2 * blink;
  // Kirana service blocks: a red seam around the middle
  if (vKind == 4.) col += uRed * side * (1. - smoothstep(0., .03, abs(vL.y - .5))) * 2.4;

  // the district the camera is visiting warms up
  float f = 1. - smoothstep(uFocusR * .6, uFocusR * 1.5, length(vW.xz - uFocus.xz));
  col += uRed * f * .05 + uBone * f * win * .3;

  // fresnel rim
  col += uRed * pow(1. - max(dot(n, v), 0.), 4.) * .12;

  col = fogit(col, length(vW - cameraPosition));
  gl_FragColor = vec4(col, 1.);
}`;

const trafficVert = /* glsl */ `
uniform float uTime;
attribute vec4 aLane; // axis, coord, offset, speed
attribute float aCol;
varying float vCol; varying vec3 vW;
void main(){
  float L = ${(HALF * 2).toFixed(1)};
  float along = mod(aLane.z + uTime * aLane.w, L) - ${HALF.toFixed(1)};
  vec3 off = aLane.x < .5 ? vec3(along, .35, aLane.y) : vec3(aLane.y, .35, along);
  vec3 p = position;
  if (aLane.x > .5) p = p.zyx;          // stretch along the direction of travel
  vec4 w = modelMatrix * vec4(p + off, 1.);
  vW = w.xyz; vCol = aCol;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const trafficFrag = /* glsl */ `
uniform vec3 uRed; uniform vec3 uBone;
varying float vCol; varying vec3 vW;
${FOG_GLSL}
void main(){
  vec3 c = vCol > .5 ? uRed * 3.2 : uBone * 1.6;
  if (length(vW.xz) > ${(HALF - 4).toFixed(1)}) discard;
  gl_FragColor = vec4(fogit(c, length(vW - cameraPosition)), 1.);
}`;

const beamFrag = /* glsl */ `
uniform vec3 uRed; uniform float uTime; varying vec2 vUv;
void main(){
  float a = pow(1. - vUv.y, 1.6);
  a *= .55 + .45 * sin(vUv.y * 40. - uTime * 3.);
  gl_FragColor = vec4(uRed * 1.6 * a, a);
}`;

const skyFrag = /* glsl */ `
uniform vec3 uRed; varying vec3 vDir;
void main(){
  float y = normalize(vDir).y;
  vec3 col = mix(vec3(.05, .025, .02), vec3(.006, .005, .005), smoothstep(-.05, .5, y));
  col += uRed * .06 * (1. - smoothstep(0., .25, abs(y)));
  gl_FragColor = vec4(col, 1.);
}`;

const finalPass = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAberr: { value: 0.0015 }, uDim: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uAberr; uniform float uDim; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 c = vUv - .5;
      float d = length(c);
      vec2 o = c * uAberr * (1. + d * 4.);
      vec3 col = vec3(texture2D(tDiffuse, vUv + o).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - o).b);
      col *= 1. - smoothstep(.35, .95, d) * .75;             // vignette
      col *= 1. - uDim * (.5 + .35 * (1. - smoothstep(.1, .75, vUv.x))); // dim behind content, more on the text side
      col += (h(gl_FragCoord.xy + fract(uTime * 7.) * 100.) - .5) * .02; // per-pixel grain: stays fine at any resolution
      gl_FragColor = vec4(col, 1.);
    }`,
};

// ---------------------------------------------------------------- init
export function initWorld(canvas) {
  // "mobile" here means "build a lighter city": phones and weak GPUs alike
  const mobile = innerWidth < 820 || matchMedia('(hover: none)').matches || gpu.tier === 'low';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false });
  // quality ladder the FPS governor walks down: [pixel ratio, bloom, SMAA]
  // top rung renders at the display's native resolution (Retina, 4K, up to an 8K pixel budget)
  const PX_8K = 7680 * 4320;
  const native = () => Math.min(devicePixelRatio, 3, Math.sqrt(PX_8K / (innerWidth * innerHeight)));
  const LEVELS = [[native(), true, true], [Math.min(devicePixelRatio, 2), true, false], [Math.min(devicePixelRatio, 1), true, false], [0.75, false, false], [0.5, false, false]];
  let level = gpu.tier === 'low' ? 2 : 0;
  renderer.setPixelRatio(LEVELS[level][0]);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(FOG);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 1600);
  camera.position.set(...SHOTS.hero.pos);

  const RED = new THREE.Color('#dc2f2f'), BONE = new THREE.Color('#ece6d8');
  const shared = {
    uTime: { value: 0 }, uFog: { value: FOG }, uFogDensity: { value: 0.0042 },
    uRed: { value: RED }, uBone: { value: BONE },
    uFocus: { value: new THREE.Vector3() }, uFocusR: { value: 30 },
  };

  // sky
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: shared,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: skyFrag,
  }));
  scene.add(sky);

  // ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2 + 400, HALF * 2 + 400), new THREE.ShaderMaterial({ uniforms: shared, vertexShader: groundVert, fragmentShader: groundFrag }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // towers
  const blocks = buildCity(mobile);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1); boxGeo.translate(0, 0.5, 0);
  const towers = new THREE.InstancedMesh(boxGeo, new THREE.ShaderMaterial({ uniforms: shared, vertexShader: towerVert, fragmentShader: towerFrag }), blocks.length);
  const seeds = new Float32Array(blocks.length), kinds = new Float32Array(blocks.length);
  const m = new THREE.Matrix4();
  blocks.forEach((b, i) => {
    m.makeScale(b.w, b.h, b.d); m.setPosition(b.x, 0, b.z);
    towers.setMatrixAt(i, m);
    seeds[i] = rand(); kinds[i] = b.kind;
  });
  boxGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  boxGeo.setAttribute('aKind', new THREE.InstancedBufferAttribute(kinds, 1));
  towers.frustumCulled = false;
  scene.add(towers);

  // the core monolith + landmark beacons
  const monolith = new THREE.InstancedMesh(boxGeo, towers.material, 1);
  m.makeScale(6, 46, 6); m.setPosition(0, 0, 0); monolith.setMatrixAt(0, m);
  monolith.frustumCulled = false;
  scene.add(monolith);
  const beamMat = new THREE.ShaderMaterial({
    uniforms: shared, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: beamFrag,
  });
  const beam = (x, z, h, w) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.3, w, h, 24, 1, true), beamMat);
    b.position.set(x, h / 2, z);
    scene.add(b);
  };
  beam(0, 0, 160, 3.6);
  const W = DISTRICTS.wins;
  [[0, 0, 52], [-9, 6, 44], [8, 7, 36]].forEach(([dx, dz, h], i) => {
    const t = new THREE.InstancedMesh(boxGeo, towers.material, 1);
    m.makeScale(3.2, h, 3.2); m.setPosition(W.x + dx, 0, W.z + dz); t.setMatrixAt(0, m); t.frustumCulled = false;
    scene.add(t);
    beam(W.x + dx, W.z + dz, 120 - i * 20, 2);
  });
  beam(DISTRICTS.kirana.x, DISTRICTS.kirana.z, 90, 2.4);

  // kirana: glowing links from the hub to each service
  const K = DISTRICTS.kirana;
  const linkPts = [];
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    linkPts.push(new THREE.Vector3(K.x, 12, K.z), new THREE.Vector3(K.x + Math.cos(a) * 21, 6, K.z + Math.sin(a) * 21));
  }
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(linkPts), new THREE.LineBasicMaterial({ color: new THREE.Color(2.4, 0.4, 0.4) })));

  // packet traffic on the major streets
  const lanes = [];
  for (let i = 0; i <= N; i += STREET) lanes.push(-HALF + i * CELL + CELL / 2);
  const COUNT = mobile ? 1100 : 2800;
  const pGeo = new THREE.InstancedBufferGeometry();
  const unit = new THREE.BoxGeometry(1.6, 0.18, 0.22);
  pGeo.setIndex(unit.index);
  pGeo.setAttribute('position', unit.getAttribute('position'));
  const laneAttr = new Float32Array(COUNT * 4), colAttr = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const axis = rand() < 0.5 ? 0 : 1;
    const dir = rand() < 0.5 ? -1 : 1;
    const coord = lanes[(rand() * lanes.length) | 0] + dir * 0.9; // two lanes per street
    laneAttr.set([axis, coord, rand() * HALF * 2, dir * (6 + rand() * 16)], i * 4);
    colAttr[i] = rand() < 0.3 ? 1 : 0;
  }
  pGeo.setAttribute('aLane', new THREE.InstancedBufferAttribute(laneAttr, 4));
  pGeo.setAttribute('aCol', new THREE.InstancedBufferAttribute(colAttr, 1));
  pGeo.instanceCount = COUNT;
  const traffic = new THREE.Mesh(pGeo, new THREE.ShaderMaterial({ uniforms: shared, vertexShader: trafficVert, fragmentShader: trafficFrag }));
  traffic.frustumCulled = false;
  scene.add(traffic);

  // floating dust / heat
  const DUST = mobile ? 600 : 1600;
  const dpos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) dpos.set([(rand() - 0.5) * 420, rand() * 90, (rand() - 0.5) * 420], i * 3);
  const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(dpos, 3)),
    new THREE.PointsMaterial({ color: new THREE.Color(0.9, 0.5, 0.4), size: 0.35, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  // ---------------------------------------------------------------- post-processing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), mobile ? 0.7 : 0.95, 0.65, 0.62);
  composer.addPass(bloom);
  const film = new ShaderPass(finalPass);
  composer.addPass(film);
  composer.addPass(new OutputPass());
  // SMAA on the final image: clean tower edges at full resolution, works on every GPU
  // (MSAA on the HDR buffer that bloom needs renders black on some GPUs)
  const smaa = new SMAAPass(innerWidth, innerHeight);
  composer.addPass(smaa);
  composer.setPixelRatio(LEVELS[level][0]);
  bloom.enabled = LEVELS[level][1];
  smaa.enabled = LEVELS[level][2];

  // ---------------------------------------------------------------- FPS governor
  // Measures real frame rate in 2s windows once the intro has landed. Too slow → step
  // down a quality level; still unusable at the bottom → stop 3D, show the static backdrop.
  let dead = false, winStart = 0, winFrames = 0, strikes = 0;
  const applyLevel = () => {
    const [pr, bl, aa] = LEVELS[level];
    renderer.setPixelRatio(pr); composer.setPixelRatio(pr);
    composer.setSize(innerWidth, innerHeight);
    bloom.enabled = bl;
    smaa.enabled = aa;
  };
  const fail = () => {
    if (dead) return;
    dead = true;
    document.documentElement.classList.remove('gpu-low', 'gpu-high');
    document.documentElement.classList.add('no-webgl');
  };
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fail(); });
  function govern(now, gap) {
    if (gap > 400 || document.hidden) { winStart = now; winFrames = 0; return; } // tab switch / hitch: don't judge
    if (!winStart) { winStart = now; return; }
    winFrames++;
    if (now - winStart < 2000) return;
    const rate = (winFrames * 1000) / (now - winStart);
    winStart = now; winFrames = 0;
    if (rate >= 30) { strikes = 0; return; }
    if (level < LEVELS.length - 1) { level++; applyLevel(); strikes = 0; }
    else if (rate < 15 && ++strikes >= 2) fail();
  }

  // ---------------------------------------------------------------- camera rig
  const shots = [];      // [{ id, t, pos, look }]
  const posCurve = new THREE.CatmullRomCurve3([], false, 'centripetal');
  const lookCurve = new THREE.CatmullRomCurve3([], false, 'centripetal');
  function measure() {
    const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    shots.length = 0;
    const ids = ['hero', ...Object.keys(SHOTS).filter((k) => k !== 'hero')];
    ids.forEach((id) => {
      const el = id === 'hero' ? document.querySelector('.hero') : document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + scrollY;
      shots.push({ id, t: id === 'hero' ? 0 : Math.min((top - innerHeight * 0.35) / max, 1), ...SHOTS[id] });
    });
    shots[shots.length - 1].t = 1;
    posCurve.points = shots.map((s) => new THREE.Vector3(...s.pos));
    lookCurve.points = shots.map((s) => new THREE.Vector3(...s.look));
  }

  const mouse = new THREE.Vector2(), mouseT = new THREE.Vector2();
  addEventListener('pointermove', (e) => mouseT.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1));

  const resize = () => {
    const w = innerWidth, h = innerHeight;
    LEVELS[0][0] = native(); // moving to another monitor can change the native ratio
    if (level === 0) { renderer.setPixelRatio(LEVELS[0][0]); composer.setPixelRatio(LEVELS[0][0]); }
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    camera.fov = w < 820 ? 58 : 42;
    camera.updateProjectionMatrix();
    measure();
  };
  addEventListener('resize', resize);
  addEventListener('load', measure);
  new ResizeObserver(() => measure()).observe(document.body);
  resize();

  // ---------------------------------------------------------------- HUD + district labels
  const hud = initHud(blocks);
  const labelsEl = document.getElementById('worldLabels');
  const labels = Object.entries(DISTRICTS).map(([id, d]) => {
    const el = document.createElement('div');
    el.className = 'wlabel mono';
    el.innerHTML = `<i></i><b>${d.name}</b><span>${d.note}</span>`;
    labelsEl.appendChild(el);
    const tall = { core: 50, wins: 56, kirana: 26, agents: 34, prepsharp: 17 }[id] ?? 10;
    return { el, p: new THREE.Vector3(d.x, tall, d.z), clear: false };
  });
  // a point is "empty" when the page under it is bare section background
  const BARE = new Set(['HTML', 'BODY', 'MAIN', 'SECTION', 'CANVAS']);
  const isEmpty = (x, y) => {
    const hit = document.elementFromPoint(x, y);
    return !hit || BARE.has(hit.tagName) || hit.classList.contains('world-labels');
  };
  let labelFrame = 0;

  // ---------------------------------------------------------------- loop
  let smooth = 0, intro = 0, introStart = 0, last = performance.now(), fps = 60;
  const camPos = new THREE.Vector3(), look = new THREE.Vector3(), lookSmooth = new THREE.Vector3(0, 0, 10);
  const tmp = new THREE.Vector3(), dir = new THREE.Vector3();
  const clock = new THREE.Clock();

  function sectionAt(p) {
    let i = 0;
    while (i < shots.length - 1 && p >= shots[i + 1].t) i++;
    return i;
  }

  function frame() {
    if (dead) return;
    requestAnimationFrame(frame);
    const now = performance.now();
    const gap = now - last;
    const dt = Math.min(gap / 1000, 0.05); last = now;
    if (intro >= 1) govern(now, gap);
    fps += ((1 / Math.max(dt, 0.001)) - fps) * 0.05;
    const t = clock.getElapsedTime();
    shared.uTime.value = reduced ? 0 : t;
    film.uniforms.uTime.value = t;

    // scroll → curve parameter, eased between section waypoints
    const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    const p = Math.min(Math.max(scrollY / max, 0), 1);
    smooth += (p - smooth) * (1 - Math.exp(-dt * 3.2));
    const i = sectionAt(smooth);
    const a = shots[i], b = shots[Math.min(i + 1, shots.length - 1)];
    const local = b === a ? 0 : Math.min(Math.max((smooth - a.t) / (b.t - a.t), 0), 1);
    const e = local * local * (3 - 2 * local);
    const u = (i + e) / Math.max(shots.length - 1, 1);
    posCurve.getPoint(u, camPos);
    lookCurve.getPoint(u, look);

    // intro: dive from orbit
    if (introStart) intro = Math.min((now - introStart) / 2600, 1);
    const k = 1 - Math.pow(1 - intro, 3);
    camPos.y += (1 - k) * 520;
    camPos.z += (1 - k) * 160;

    mouse.lerp(mouseT, 0.05);
    camPos.x += mouse.x * 3; camPos.y += mouse.y * 2;
    camera.position.copy(camPos);
    lookSmooth.lerp(look, 1 - Math.exp(-dt * 4));
    camera.lookAt(lookSmooth);
    // a hint of roll on lateral motion
    camera.rotateZ(-mouse.x * 0.02);

    // focus district under the camera's gaze
    shared.uFocus.value.copy(lookSmooth);
    dust.rotation.y = t * 0.004;
    // full brightness for the hero + final overview, dimmed behind content in between
    const sec = shots[Math.round(i + e)]?.id;
    const wantDim = sec === 'hero' || sec === 'contact' ? 0 : 1;
    film.uniforms.uDim.value += (wantDim - film.uniforms.uDim.value) * (1 - Math.exp(-dt * 2.5));
    // colour fringing only while the camera is moving fast; at rest the image stays sharp
    film.uniforms.uAberr.value = 0.0003 + Math.min(Math.abs(p - smooth) * 0.08, 0.004);

    composer.render(dt);

    // labels: only drawn where they land on empty space, never over copy or cards
    const probe = ++labelFrame % 6 === 0;
    labels.forEach((l) => {
      tmp.copy(l.p).project(camera);
      const distTo = l.p.distanceTo(camera.position);
      const sx = (tmp.x * 0.5 + 0.5) * innerWidth, sy = (-tmp.y * 0.5 + 0.5) * innerHeight;
      const onScreen = tmp.z < 1 && sx > 0 && sx < innerWidth - 150 && sy > 70 && sy < innerHeight - 40;
      if (probe) l.clear = onScreen && isEmpty(sx + 4, sy + 4) && isEmpty(sx + 130, sy + 4) && isEmpty(sx + 70, sy + 22);
      const visible = onScreen && l.clear && distTo < 300 && intro > 0.9;
      l.el.style.opacity = visible ? Math.min(1, (300 - distTo) / 80) : 0;
      l.el.style.transform = `translate(${sx}px, ${sy}px)`;
    });

    camera.getWorldDirection(dir);
    hud.update({ x: camera.position.x, y: camera.position.y, z: camera.position.z, yaw: Math.atan2(dir.x, -dir.z), section: shots[Math.round(i + e)]?.id || 'hero', fps, progress: p });
  }
  frame();

  return {
    reveal() {
      introStart = performance.now();
      const toggle = () => hud.show(scrollY > innerHeight * 0.55);
      addEventListener('scroll', toggle, { passive: true });
      toggle();
    },
    blocks: blocks.length,
  };
}

// ---------------------------------------------------------------- HUD: die map + telemetry
function initHud(blocks) {
  const root = document.getElementById('hud');
  const map = document.getElementById('hudMap');
  const size = 150;
  const dpr = Math.min(devicePixelRatio, 3);
  map.width = map.height = size * dpr;
  const g = map.getContext('2d');
  g.scale(dpr, dpr);
  const toMap = (v) => ((v + HALF) / (HALF * 2)) * size;

  // static base layer: blocks shaded by height, district rings
  const base = document.createElement('canvas');
  base.width = base.height = size * dpr;
  const b = base.getContext('2d');
  b.scale(dpr, dpr);
  b.fillStyle = '#0d0b0a'; b.fillRect(0, 0, size, size);
  b.beginPath(); b.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2); b.strokeStyle = 'rgba(220,47,47,.6)'; b.lineWidth = 1; b.stroke();
  blocks.forEach((k) => {
    const s = Math.min(k.h / 14, 1);
    b.fillStyle = k.kind === 4 ? 'rgba(220,47,47,.9)' : `rgba(236,230,216,${0.08 + s * 0.4})`;
    b.fillRect(toMap(k.x) - 0.5, toMap(k.z) - 0.5, Math.max(1, (k.w / (HALF * 2)) * size), Math.max(1, (k.d / (HALF * 2)) * size));
  });
  b.fillStyle = 'rgba(220,47,47,1)'; b.fillRect(size / 2 - 1.5, size / 2 - 1.5, 3, 3);
  Object.values(DISTRICTS).forEach((d) => {
    b.beginPath(); b.arc(toMap(d.x), toMap(d.z), (d.r / (HALF * 2)) * size, 0, Math.PI * 2);
    b.strokeStyle = 'rgba(220,47,47,.35)'; b.setLineDash([2, 2]); b.stroke(); b.setLineDash([]);
  });

  const els = {
    sec: document.getElementById('hudSec'), xyz: document.getElementById('hudXyz'),
    alt: document.getElementById('hudAlt'), fps: document.getElementById('hudFps'), bar: document.getElementById('hudBar'),
  };
  const NAMES = { hero: 'ORBIT', about: 'CORE', agents: 'AGENT TOOLKIT', work: 'PREPSHARP', systems: 'KIRANA', live: 'MAIN BUS', wins: 'HALL OF WINS', skills: 'CELL LIBRARY', contact: 'DIE OVERVIEW' };
  let frameN = 0;
  const pad = (v) => (v < 0 ? '-' : '+') + String(Math.abs(Math.round(v))).padStart(3, '0');

  // compass: a strip of ticks that slides with the camera heading
  const PX = 2.2; // px per degree
  const strip = document.getElementById('hudStrip');
  const DIRS = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
  let ticks = '';
  for (let d = -180; d <= 540; d += 15) {
    const n = ((d % 360) + 360) % 360;
    ticks += `<span class="${DIRS[n] ? 'is-dir' : ''}" style="left:${(d + 180) * PX}px">${DIRS[n] || (n % 45 ? '' : n)}</span>`;
  }
  strip.innerHTML = ticks;

  // event feed: one line per district the camera flies into
  const feedEl = document.getElementById('feed');
  const FEED = {
    about:   ['spawned at', 'IIIT Bhopal'],
    agents:  ['shipped', 'android-agent-bridge'],
    work:    ['deployed', 'prepsharp.in'],
    systems: ['scaled kirana to', '7 services'],
    live:    ['pushed to', 'main'],
    wins:    ['took 1st at', 'Strategy Blitz 2.0'],
    skills:  ['equipped', 'TS · Kotlin · C++'],
    contact: ['is', 'open to work'],
  };
  let lastSec = '', feedOn = false;
  const push = (sec) => {
    const f = FEED[sec];
    if (!f) return;
    const li = document.createElement('li');
    li.innerHTML = `<b>rudra</b><span>${f[0]}</span><em>${f[1]}</em>`;
    feedEl.prepend(li);
    requestAnimationFrame(() => li.classList.add('is-in'));
    [...feedEl.children].slice(4).forEach((old) => old.remove());
    setTimeout(() => li.classList.add('is-old'), 6000);
  };

  return {
    show(on = true) { root.classList.toggle('is-on', on); feedEl.classList.toggle('is-on', on); feedOn = on; },
    update(s) {
      strip.style.transform = `translateX(${-(((s.yaw * 180) / Math.PI + 360) % 360 + 180) * PX}px)`;
      if (feedOn && s.section !== lastSec) { lastSec = s.section; push(s.section); }
      if (++frameN % 2) return;
      g.drawImage(base, 0, 0, size, size);
      const x = toMap(s.x), z = toMap(s.z);
      // view cone
      g.save(); g.translate(x, z); g.rotate(s.yaw);
      const grd = g.createLinearGradient(0, 0, 0, -38);
      grd.addColorStop(0, 'rgba(236,230,216,.35)'); grd.addColorStop(1, 'rgba(236,230,216,0)');
      g.fillStyle = grd; g.beginPath(); g.moveTo(0, 0); g.lineTo(-16, -38); g.lineTo(16, -38); g.closePath(); g.fill();
      g.restore();
      g.fillStyle = '#ece6d8'; g.beginPath(); g.arc(x, z, 2.6, 0, Math.PI * 2); g.fill();
      if (frameN % 10 === 0) {
        els.sec.textContent = NAMES[s.section] || s.section;
        els.xyz.textContent = `X${pad(s.x)} Z${pad(s.z)}`;
        els.alt.textContent = `ALT ${String(Math.round(s.y)).padStart(3, '0')}m · HDG ${String(Math.round(((s.yaw * 180) / Math.PI + 360) % 360)).padStart(3, '0')}°`;
        els.fps.textContent = `${Math.round(s.fps)} FPS`;
      }
      els.bar.style.transform = `scaleX(${s.progress})`;
    },
  };
}
