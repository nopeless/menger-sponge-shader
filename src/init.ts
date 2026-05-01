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
  dispose: null,
  frame: null,
  everySecond: null,
  onResize: null,
  mouseX: 0,
  mouseY: 0,
  zoom: 1,

  wasdX: 0,
  wasdY: 0,

  scroll: 0,

  // accumulation based
  accMouseX: 0,
  accMouseY: 0,
} as {
  dispose: null | (() => void);
  frame: null | ((delta: number) => void);
  everySecond: null | ((delta: number) => void);
  onResize: null | (() => void);
  mouseX: number;
  mouseY: number;
  zoom: number;

  wasdX: number;
  wasdY: number;

  scroll: number;

  accMouseX: number;
  accMouseY: number;
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

window.addEventListener("wheel", (event) => {
  const zoomFactor = 1.1;

  if (event.deltaY < 0) {
    context.zoom *= zoomFactor;
    context.scroll += 1;
  } else {
    context.zoom /= zoomFactor;
    context.scroll -= 1;
  }
});

let rafH = 0;

function f(ts: number) {
  context.frame?.(ts);
  rafH = requestAnimationFrame(f);
}

f(0);

const mouseMoveHandler = (e: MouseEvent) => {
  context.mouseX = e.clientX;
  context.mouseY = e.clientY;
};

window.addEventListener("mousemove", mouseMoveHandler);

let esT = performance.now();

const esH = setInterval(() => {
  const now = performance.now();
  context.everySecond?.(now - esT);
  esT = now;
}, 1000);

import.meta.hot?.dispose(() => {
  context.dispose?.();
  window.removeEventListener("resize", onWindowResize);
  window.removeEventListener("mousemove", mouseMoveHandler);
  cancelAnimationFrame(rafH);
  clearInterval(esH);
});

export { gl, context, setOverlayText };
