# Rudra Samadhiya — Portfolio

**Live:** https://rudrasamadhiya.github.io/profile/

A 3D portfolio you scroll *through*. The whole site flies a camera across a procedural
silicon die — a city of thousands of instanced towers, circuit-trace streets and packet traffic —
and each section of the page lands on its own district.

Full-stack engineer · founder of [PrepSharp.in](https://prepsharp.in) · CSE (Data Science) @ IIIT Bhopal.

## What's inside

| | |
|---|---|
| **The Die** (`src/world.js`) | Full-screen WebGL city: instanced towers, shader-driven traffic, bloom + film pass, scroll-driven camera rig, district labels that only appear over empty space |
| **HUD** | Live minimap with view cone, heading compass, sector telemetry and an event feed that updates per district |
| **Agent phone** (`src/phone.js`) | A 3D phone that plays a live demo of each agent package (Android Agent Bridge, expo-mcp-bridge, expo-launch-video) |
| **Architecture explorer** (`src/arch.js`) | Instant Kirana's real topology — 4 clients, gateway, 7 NestJS services, 3 datastores — as a clickable 3D graph |
| **Live data** (`src/live.js`) | Recent GitHub commits, 30-day commit activity and npm downloads, fetched in the browser (no keys) |
| **rudra-sh** (`src/terminal.js`) | A built-in terminal — open with `⌘K` / `Ctrl+K` / `` ` `` |

## Runs on weak hardware too

The site is built to load on any laptop or phone, not just gaming machines (`src/gpu.js`):

- **Device check before any 3D is built.** Old integrated GPUs, ≤4 CPU cores, ≤4 GB RAM,
  data-saver and phones get a lighter city, lower pixel ratio, no antialiasing and no glass blur.
- **FPS governor.** After the intro, frame rate is measured in 2-second windows. If it drops
  below 30 FPS the renderer steps down (pixel ratio → bloom off → half resolution).
- **Static fallback.** With no WebGL, a lost GPU context, or a device that still can't hold
  15 FPS at the lowest setting, the 3D switches off and a flat drawing of the die takes its place.
  Every section still works.
- Off-screen scenes stop rendering; `prefers-reduced-motion` is respected.

Test the fallbacks on a fast machine with `?gl=low` or `?gl=off`.

## Stack

Three.js · Motion · Lenis · Vite — plain JavaScript, no framework.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Deploy

Every push to `main` builds and publishes to GitHub Pages via `.github/workflows/deploy.yml`.
The Vite `base` is `/profile/` to match the Pages URL; change it in `vite.config.js` if the repo is renamed.

## Contact

[Email](mailto:Samadhiyarudra123@gmail.com) · [LinkedIn](https://linkedin.com/in/rudra-samadhiya) · [GitHub](https://github.com/Rudrasamadhiya) · [LeetCode](https://rudrasamadhiya.github.io/leetcode/)
