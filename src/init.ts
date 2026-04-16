const canvas = document.querySelector<HTMLCanvasElement>("#glcanvas")!;
const gl = canvas.getContext("webgl")!;

let debounce: number | null = null;

function resizeCanvas() {
  if (debounce) {
    return;
  }

  console.log("Resizing canvas");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  debounce = window.setTimeout(() => {
    debounce = null;
  }, 100);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const context = {
  frame: null,
} as {
  frame: null | ((delta: number) => void);
};

function f(delta: number) {
  context.frame?.(delta);
  requestAnimationFrame(f);
}

requestAnimationFrame(f);

export { gl, context };
