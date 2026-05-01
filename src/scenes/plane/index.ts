export function init(gl: WebGLRenderingContext, program: WebGLProgram) {
  // Create buffer
  const positionBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Initialize buffer
  const positions = [0, 0, 0, 250, 1000, 0, 500, 500, 250, 250, 750, 250];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // ---

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);

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

  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  console.log("init");
  return {
    gl,
    program,
  };
}
export function frame(ctx: ReturnType<typeof init>) {
  const { gl, program } = ctx;

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Finally draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
