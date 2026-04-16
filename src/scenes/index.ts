import * as simple from "./simple/index.js";
import * as plane from "./plane/index.js";

export default {
  simple,
  plane,
} as Record<
  string,
  {
    init: (gl: WebGLRenderingContext, program: WebGLProgram) => unknown;
    frame: (ctx: unknown, delta: number) => void;
  }
>;
