import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// create fake camera
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);

const SIDE = 3 ** 19;

const controls = new OrbitControls(camera, document.documentElement);
controls.rotateSpeed = 0.1;
controls.panSpeed = 1;
controls.zoomSpeed = 0.3;
controls.target = new THREE.Vector3(SIDE, SIDE, SIDE);
controls.keys = {
  LEFT: "KeyA",
  UP: "KeyW",
  RIGHT: "KeyD",
  BOTTOM: "KeyS",
};
controls.update();

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
  // Right handed coordinate system
  // Y up Z forward X right
  const u = {
    // set up a camera system
    x: gl.getUniformLocation(program, "u_x")!,
    y: gl.getUniformLocation(program, "u_y")!,
    z: gl.getUniformLocation(program, "u_z")!,
    rotation: gl.getUniformLocation(program, "u_rotation")!,
  };

  camera.position.set(1.5 * SIDE, 1.5 * SIDE, 1.5 * SIDE);
  camera.lookAt(SIDE, SIDE, SIDE);

  return {
    gl,
    u,
    program,
  };
}

// reuse existing matrix to avoid allocation
const m = new THREE.Matrix3();

export function frame(ctx: ReturnType<typeof init>, ts: number) {
  const { gl } = ctx;

  camera.updateMatrixWorld();

  // set camera
  gl.uniform1f(ctx.u.x, camera.position.x);
  gl.uniform1f(ctx.u.y, camera.position.y);
  gl.uniform1f(ctx.u.z, camera.position.z);

  // clamp target
  controls.target = controls.target.clampScalar(0, SIDE);

  m.setFromMatrix4(camera.matrixWorld);
  gl.uniformMatrix3fv(ctx.u.rotation, false, m.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
