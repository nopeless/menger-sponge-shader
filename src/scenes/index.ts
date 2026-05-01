import * as simple from "./simple/index.js";
import * as plane from "./plane/index.js";
import * as menger_sponge from "./menger_sponge/index.js";
import * as menger_sponge_zoom from "./menger_sponge_zoom/index.js";
import * as shader_cross_section from "./shader_cross_section/index.js";
import * as shader_cube from "./shader_cube/index.js";
import * as shader_cube_animated from "./shader_cube_animated/index.js";
import * as shader_cube_camera from "./shader_cube_camera/index.js";
import * as shader_cube_menger_v1 from "./shader_cube_menger_v1/index.js";

export default {
  simple,
  plane,
  menger_sponge,
  menger_sponge_zoom,
  shader_cross_section,
  shader_cube,
  shader_cube_animated,
  shader_cube_camera,
  shader_cube_menger_v1,
} as Record<
  string,
  {
    init: (gl: WebGLRenderingContext, program: WebGLProgram) => unknown;
    frame: (ctx: unknown, delta: number) => void;
  }
>;
