import * as simple from "./simple/index.js";
import * as plane from "./plane/index.js";
import * as menger_sponge from "./menger_sponge/index.js";

export default {
  simple,
  plane,
  menger_sponge,
} as Record<
  string,
  {
    init: (gl: WebGLRenderingContext, program: WebGLProgram) => unknown;
    frame: (ctx: unknown, delta: number) => void;
  }
>;
