# Menger Sponge Shader Lab

A raw WebGL2 + GLSL lab that climbs from a single triangle to a DDA-stepped 3D Menger sponge.
It uses Three.js only where it helps (camera controls), keeping the render path in shaders.

## Getting started

```bash
bun install
bun dev
```

## Entry points

- `src/landing.html` — project overview page
- `src/index.html` — the live shader viewer

## Notes for devs

- The selected scene is stored in `localStorage`, so the app reopens where you left off.
- The viewer swaps shader programs live as you change scenes.
