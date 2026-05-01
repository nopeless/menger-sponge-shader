#version 300 es
precision highp float;
precision highp int;

uniform vec2 u_resolution;
uniform float u_x;
uniform float u_y;
uniform float u_z;
uniform mat3 u_rotation;

out vec4 outColor;

const int LEVELS = 19;
const int MAX_STEPS = 256;
const int SIDE_I = 1162261467;
const float SIDE = 1162261467.0;
const float FOCAL_LENGTH = 1000.0;
const float RAY_EPS = 128.0;
const float INF = 1.0e30;

// Colors
// x: east / west
const vec4 C_E = vec4(1.0, 0.0, 0.0, 1.0);
const vec4 C_W = vec4(0.0, 1.0, 1.0, 1.0);
// y: north / south
const vec4 C_N = vec4(0.0, 1.0, 0.0, 1.0);
const vec4 C_S = vec4(1.0, 0.0, 1.0, 1.0);
// z: top / bottom
const vec4 C_T = vec4(0.0, 0.0, 1.0, 1.0);
const vec4 C_B = vec4(1.0, 1.0, 0.0, 1.0);

vec4 colorForNormal(vec3 n) {
  if (n.x > 0.5) return C_E;
  if (n.x < -0.5) return C_W;
  if (n.y > 0.5) return C_N;
  if (n.y < -0.5) return C_S;
  if (n.z > 0.5) return C_T;
  return C_B;
}

bool hitBox(vec3 ro, vec3 rd, out float tNear, out float tFar, out vec3 normal) {
  vec3 inv = 1.0 / rd;
  vec3 a = -ro * inv;
  vec3 b = (vec3(SIDE) - ro) * inv;
  vec3 lo = min(a, b);
  vec3 hi = max(a, b);

  tNear = max(max(lo.x, lo.y), lo.z);
  tFar = min(min(hi.x, hi.y), hi.z);

  if (tFar < max(tNear, 0.0)) return false;

  if (lo.x >= lo.y && lo.x >= lo.z) {
    normal = rd.x > 0.0 ? vec3(-1.0, 0.0, 0.0) : vec3(1.0, 0.0, 0.0);
  } else if (lo.y >= lo.z) {
    normal = rd.y > 0.0 ? vec3(0.0, -1.0, 0.0) : vec3(0.0, 1.0, 0.0);
  } else {
    normal = rd.z > 0.0 ? vec3(0.0, 0.0, -1.0) : vec3(0.0, 0.0, 1.0);
  }

  tNear = max(tNear, 0.0);
  return true;
}

ivec3 cellAt(vec3 p) {
  return ivec3(clamp(floor(p), vec3(0.0), vec3(float(SIDE_I - 1))));
}

int centerDigitCount(ivec3 d) {
  int n = 0;
  if (d.x == 1) n++;
  if (d.y == 1) n++;
  if (d.z == 1) n++;
  return n;
}

int lodScale(float t) {
  float pixelSize = max(RAY_EPS, t / FOCAL_LENGTH);
  int scale = 1;

  for (int i = 0; i < LEVELS; i++) {
    if (float(scale) >= pixelSize) return scale;
    scale *= 3;
  }

  return SIDE_I;
}

int emptyBlockSize(ivec3 cell, int minScale) {
  ivec3 q = clamp(cell, ivec3(0), ivec3(SIDE_I - 1));
  int scale = 1;
  int empty = 0;

  for (int i = 0; i < LEVELS; i++) {
    ivec3 digit = q - (q / 3) * 3;

    if (scale >= minScale && centerDigitCount(digit) >= 2) {
      empty = scale;
    }

    q /= 3;
    scale *= 3;
  }

  return empty;
}

float nextPlane(float p, float d, float low, float high) {
  if (d > 0.0) return (high - p) / d;
  if (d < 0.0) return (low - p) / d;
  return INF;
}

float exitBlock(vec3 p, vec3 rd, ivec3 cell, int size, out vec3 normal) {
  ivec3 lowI = (cell / size) * size;
  ivec3 highI = lowI + ivec3(size);
  vec3 low = vec3(lowI);
  vec3 high = vec3(highI);

  float tx = nextPlane(p.x, rd.x, low.x, high.x);
  float ty = nextPlane(p.y, rd.y, low.y, high.y);
  float tz = nextPlane(p.z, rd.z, low.z, high.z);

  if (tx <= ty && tx <= tz) {
    normal = rd.x > 0.0 ? vec3(-1.0, 0.0, 0.0) : vec3(1.0, 0.0, 0.0);
    return tx;
  }

  if (ty <= tz) {
    normal = rd.y > 0.0 ? vec3(0.0, -1.0, 0.0) : vec3(0.0, 1.0, 0.0);
    return ty;
  }

  normal = rd.z > 0.0 ? vec3(0.0, 0.0, -1.0) : vec3(0.0, 0.0, 1.0);
  return tz;
}

void drawRay(vec3 ro, vec3 rd) {
  float tNear;
  float tFar;
  vec3 normal;

  if (!hitBox(ro, rd, tNear, tFar, normal)) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float t = tNear + RAY_EPS;
  vec3 lastNormal = normal;
  int maxSteps = int(clamp(ceil((tFar - tNear) / float(lodScale(tNear))) + 8.0, 8.0, float(MAX_STEPS)));

  for (int i = 0; i < MAX_STEPS; i++) {
    if (i >= maxSteps || t > tFar) break;

    vec3 p = ro + rd * t;
    ivec3 cell = cellAt(p);
    int holeSize = emptyBlockSize(cell, lodScale(t));

    if (holeSize == 0) {
      outColor = colorForNormal(lastNormal);
      return;
    }

    t += max(exitBlock(p, rd, cell, holeSize, lastNormal), 0.0) + RAY_EPS;
  }

  outColor = vec4(0.0, 0.0, 0.0, 1.0);
}

void main() {
  vec3 camPos = vec3(u_x, u_y, u_z);
  vec3 rayDir = vec3(
    gl_FragCoord.xy - u_resolution.xy * 0.5,
    -FOCAL_LENGTH
  );

  rayDir = normalize(u_rotation * rayDir);
  drawRay(camPos, rayDir);
}
