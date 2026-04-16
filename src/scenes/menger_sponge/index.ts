/**
 * Create packed int32 in bits
 */
// function createMengerSpongeLut(size: number) {
//   const lut = new Int32Array(Math.ceil(3 ** size / 32));

//   // lol
//   let ms = "101";
//   for (let i = 1; i < size; i++) {
//     ms = ms + "0".repeat(ms.length) + ms;
//   }

//   for (let i = 0; i < ms.length; i++) {
//     lut[i >>> 5] |= (ms[i] === "1" ? 1 : 0) << (i & 31);
//   }

//   return lut;
// }

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

  const u_power = gl.getUniformLocation(program, "u_power")!;

  const u_resolution = gl.getUniformLocation(program, "u_resolution")!;
  gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);

  // const u_lut = gl.getUniformLocation(program, "u_lut")!;
  // gl.uniform1iv(u_lut, createMengerSpongeLut(5));

  const u_size = gl.getUniformLocation(program, "u_size")!;
  gl.uniform1i(u_size, 7);

  return {
    gl,
    program,
    start: 0,
  };
}
export function frame(ctx: ReturnType<typeof init>, delta: number) {
  ctx.start += delta;

  const { gl } = ctx;

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
