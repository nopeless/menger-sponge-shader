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

  const u_resolution = gl.getUniformLocation(program, "u_resolution")!;
  gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);

  // https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/geometry/coordinate-systems.html
  const u = {
    // set up a camera system
    x: gl.getUniformLocation(program, "u_x")!,
    y: gl.getUniformLocation(program, "u_y")!,
    z: gl.getUniformLocation(program, "u_z")!,
    /** z */
    roll: gl.getUniformLocation(program, "u_roll")!,
    /** y */
    yaw: gl.getUniformLocation(program, "u_yaw")!,
    /** x */
    pitch: gl.getUniformLocation(program, "u_pitch")!,
  };

  return {
    gl,
    u,
    program,
  };
}
export function frame(ctx: ReturnType<typeof init>, ts: number) {
  const { gl } = ctx;

  // set camera
  // translation
  gl.uniform1f(ctx.u.x, 0);
  gl.uniform1f(ctx.u.y, 5);
  gl.uniform1f(ctx.u.z, 1);

  // rotation (look center)
  // + is camera rolling ccwise (background rotate clockwise)
  gl.uniform1f(ctx.u.roll, 0);
  // + is camera pan right (background pan left)
  gl.uniform1f(ctx.u.yaw, 0);
  gl.uniform1f(ctx.u.pitch, Math.PI * 0.5);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
