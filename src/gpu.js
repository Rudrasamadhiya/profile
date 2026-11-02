// What can this device draw? Decided once, before any WebGL scene is built.
//   webgl: false → no 3D at all; the page falls back to a static CSS backdrop
//   tier:  'low' | 'high' → low trims pixel ratio, geometry, particles and bloom
function probe() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return { webgl: false, renderer: '' };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { webgl: true, renderer };
  } catch {
    return { webgl: false, renderer: '' };
  }
}

const { webgl, renderer } = probe();
const software = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
const weakGpu = /intel\(r\) (hd|uhd) graphics [2-6]\d{2}\b|mali-[gt][0-7]\d\b|adreno \(tm\) [1-5]\d{2}\b|powervr/i.test(renderer);
const cores = navigator.hardwareConcurrency || 4;
const memory = navigator.deviceMemory || 4;
const touch = matchMedia('(hover: none)').matches;
const saveData = navigator.connection?.saveData === true;

// ?gl=off or ?gl=low forces a mode, handy for checking the fallbacks on a fast machine
const force = new URLSearchParams(location.search).get('gl');

export const gpu = force === 'off' ? { webgl: false, tier: 'low' } : force === 'low' ? { webgl, tier: 'low' } : {
  // software renderers still get a try at the lowest quality; the FPS governor in world.js
  // drops to the static backdrop if even that can't hold a usable frame rate
  webgl,
  tier: software || weakGpu || cores <= 4 || memory <= 4 || saveData || (touch && innerWidth < 820) ? 'low' : 'high',
};
document.documentElement.classList.add(gpu.webgl ? `gpu-${gpu.tier}` : 'no-webgl');
