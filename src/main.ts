import { AmbientLight, Box3, BoxGeometry, DirectionalLight, InstancedMesh, Matrix4, Mesh, MeshNormalMaterial, MeshPhongMaterial, MeshStandardMaterial, Object3D, PerspectiveCamera, Vector3 } from "three";
import { scene, camera, runtime } from "./init.js";

const material = new MeshPhongMaterial({
  color: "#fff",
});

const im = new InstancedMesh(
  new BoxGeometry(1, 1, 1),
  material,
  20 ** 5
);

function buildSponge(camera: PerspectiveCamera, frustrum: Box3, cutoffFactor: number, im: InstancedMesh, pos: Vector3, level: number, maxLevel: number) {
  let s3 = 1 / 3 ** level;

  // Frustrum culling
//   const box = new Box3().setFromCenterAndSize(pos, new Vector3(s3, s3, s3));
//   if (!frustrum.intersectsBox(box)) {
//     console.log("culling")
//     return
// };

  if (
    level >= maxLevel
    // || s3 / camera.position.distanceTo(pos) < cutoffFactor
  ) {
    const matrix = new Matrix4();

    matrix.setPosition(pos);
    matrix.scale(new Vector3(s3, s3, s3));

    im.setMatrixAt(im.count++, matrix);

    return;
  }

  level++;
  s3 /= 3;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (
          (x === 0 && y === 0) ||
          (x === 0 && z === 0) ||
          (y === 0 && z === 0)
        ) continue;

        buildSponge(camera, frustrum, cutoffFactor, im, new Vector3(pos.x + s3 * x, pos.y + s3 * y, pos.z + s3 * z), level, maxLevel);
      }
    }
  }
}


const buildCube = () => {
  im.count = 0;
  
  const frustrum = new Box3();

  frustrum.setFromCenterAndSize(camera.position, new Vector3(10, 10, 10));

  buildSponge(camera, frustrum, 0.001, im, new Vector3(), 0, 5);

  im.instanceMatrix.needsUpdate = true;
};

buildCube();

// setInterval(() => {
//     buildCube();
// }, 1000);

const light = new DirectionalLight("#fff", 1);
light.position.set(2, 3, 4);
light.lookAt(0, 0, 0);

scene.add(light);

scene.add(im);

// console.log(scene, camera);
