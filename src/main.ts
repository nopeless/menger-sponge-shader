const canvas = document.querySelector<HTMLCanvasElement>("#glcanvas")!;
const gl = canvas.getContext("webgl")!;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

async function loadShaderSource(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load shader: ${url}`);
  }
  return await response.text();
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${message}`);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${message}`);
  }

  return program;
}

async function main() {
  const vertexUrl = new URL("./vertex.glsl", import.meta.url);
  const fragmentUrl = new URL("./fragment.glsl", import.meta.url);
  const [vertexSource, fragmentSource] = await Promise.all([
    loadShaderSource(vertexUrl.href),
    loadShaderSource(fragmentUrl.href),
  ]);

  const program = createProgram(gl, vertexSource, fragmentSource);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "aVertexPosition");
  const timeLocation = gl.getUniformLocation(program, "uTime");
  const resolutionLocation = gl.getUniformLocation(program, "uResolution");

  function drawScene(time = 0) {
    time *= 0.001;
    resizeCanvas();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(drawScene);
  }

  requestAnimationFrame(drawScene);
}

main().catch((error) => {
  console.error(error);
  alert("Shader initialization failed. See console for details.");
});
