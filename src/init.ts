import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color("#000");

export const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);
camera.position.set(1.5, 1.5, 1.5);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, document.body);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ antialias: true });

document.body.appendChild(renderer.domElement);

const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", onResize);
onResize();

// Simple keymap
window.addEventListener("keydown", (event) => {
  if (event.key === "w") {
    camera.position.z -= 0.1;
  }
});

export const runtime = {
  animationCallback: () => {}
};

(function f() {
  renderer.render(scene, camera);
  controls.update();

  runtime.animationCallback();

  requestAnimationFrame(f);
})();
