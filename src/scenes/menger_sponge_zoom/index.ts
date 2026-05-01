import { context } from "../../init.js";

export function init(gl: WebGLRenderingContext, program: WebGLProgram) {
  // Create buffer
  const positionBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Initialize buffer
  const positions = [-1, -1, 3, -1, -1, 3];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // ---

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Draw entire screen
  gl.vertexAttribPointer(
    positionAttributeLocation,
    // size. x, y
    2,
    // data type
    gl.FLOAT,
    // data normalization
    false,
    // how much to offset to the next vertex. 0 = use type and size above
    0,
    // offset of the first vertex in the buffer
    0,
  );

  gl.clearColor(0, 0, 0, 0);

  const u_center = gl.getUniformLocation(program, "u_center")!;

  const u_zoom = gl.getUniformLocation(program, "u_zoom")!;

  const u_resolution = gl.getUniformLocation(program, "u_resolution")!;
  gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);

  const u_size = gl.getUniformLocation(program, "u_size")!;
  gl.uniform1i(u_size, 7);

  const u_angle = gl.getUniformLocation(program, "u_angle")!;

  return {
    gl,
    u_angle,
    u_zoom,
    // zoom: 1,
    u_center,
    centerX: 0.5,
    centerY: 0.5,
    program,
    last: performance.now(),
  };
}

export function frame(ctx: ReturnType<typeof init>, ts: number) {
  const delta = ts - ctx.last;
  ctx.last = ts;

  const { gl } = ctx;

  // get mouse position
  const umx = context.mouseX / gl.canvas.width;
  const umy = 1 - context.mouseY / gl.canvas.height;

  const zoomFactor = 1.001;

  ctx.centerX += ((umx - 0.5) / context.zoom) * (zoomFactor - 1) * 2;
  ctx.centerY += ((umy - 0.5) / context.zoom) * (zoomFactor - 1) * 2;

  gl.uniform1f(ctx.u_zoom, context.zoom);
  gl.uniform2f(ctx.u_center, ctx.centerX, ctx.centerY);

  gl.uniform1f(ctx.u_angle, ((2 * ts) / 1000) % (Math.PI * 2));

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
