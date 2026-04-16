import GUI from "./lil-gui.js";
import { gl, context } from "./init.js";
import scenes from "./scenes/index.js";

const gui = new GUI();

// background load as this is io heavy
const sceneShaders = Object.fromEntries(
  ["simple", "plane"].map((name) => [
    name,
    {
      fragment: `./scenes/${name}/fragment.glsl`,
      vertex: `./scenes/${name}/vertex.glsl`,
      name,
    },
  ]),
);

const selectedSceneName = localStorage.getItem("selected") ?? "simple";

const options = {
  scene: sceneShaders[selectedSceneName],
};

let program: WebGLProgram | null = null;

type Status = "compiling_shaders" | "downloading_shaders" | "linking_program" | "ready";

function changeStatus(status: Status) {
  console.log(`Status: ${status}`);
}

const scenePicker = gui
  .add(options, "scene", sceneShaders)
  .onChange(async (value: (typeof sceneShaders)[keyof typeof sceneShaders]) => {
    localStorage.setItem("selected", value.name);

    scenePicker.disable();
    const scene = scenes[value.name];

    if (!scene) {
      throw new Error(`Scene ${value.name} not found`);
    }

    context.frame = null;
    gl.deleteProgram(program);

    changeStatus("downloading_shaders");
    const vsSource = await fetch(value.vertex).then((res) => res.text());
    const fsSource = await fetch(value.fragment).then((res) => res.text());

    changeStatus("compiling_shaders");
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(vs);
      gl.deleteShader(vs);
      throw new Error(`Vertex shader compile failed: ${message}`);
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(fs);
      gl.deleteShader(fs);
      throw new Error(`Fragment shader compile failed: ${message}`);
    }

    changeStatus("linking_program");
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      // it died
      console.error({ program });
      throw new Error(`Program link failed`);
    }

    // delete after linking
    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    const ctx = scene.init(gl, program);

    changeStatus("ready");

    context.frame = (delta) => scene.frame(ctx, delta);
    scenePicker.enable();
  });

scenePicker.trigger();
