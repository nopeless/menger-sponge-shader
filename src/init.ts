const canvas = document.querySelector<HTMLCanvasElement>("#glcanvas")!;
const overlay = document.querySelector<HTMLDivElement>("#overlay")!;

function setOverlayText(text: string | null) {
  if (!text) {
    overlay.classList.remove("active");
    return;
  }

  overlay.textContent = text;
  overlay.classList.add("active");
}

let gl: WebGLRenderingContext;

try {
  gl = canvas.getContext("webgl2")!;
} catch (e) {
  setOverlayText("WebGL2 not supported");
  throw e;
}

const context = {
  frame: null,
  everySecond: null,
  onResize: null,
} as {
  frame: null | ((delta: number) => void);
  everySecond: null | ((delta: number) => void);
  onResize: null | (() => void);
};

let debounce: number | null = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  context.onResize?.();

  debounce = null;
}

function onWindowResize() {
  if (debounce) {
    return;
  }

  debounce = window.setTimeout(() => {
    resizeCanvas();
  }, 500);
}

resizeCanvas();

window.addEventListener("resize", onWindowResize);
onWindowResize();

let rafNow = performance.now();

let rafH = 0;

function f(ts: number) {
  context.frame?.(ts - rafNow);
  rafNow = ts;
  rafH = requestAnimationFrame(f);
}

f(0);

let esT = performance.now();

const esH = setInterval(() => {
  const now = performance.now();
  context.everySecond?.(now - esT);
  esT = now;
}, 1000);

import.meta.hot?.dispose(() => {
  window.removeEventListener("resize", onWindowResize);
  cancelAnimationFrame(rafH);
  clearInterval(esH);
});

export { gl, context, setOverlayText };
