#version 300 es
precision highp float;

uniform vec2 u_resolution;
float focalLength = 1000.0;

uniform float u_x;
uniform float u_y;
uniform float u_z;
uniform mat3 u_rotation;

out vec4 outColor;

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

const int ss = 16;

// track cell stack
// 32 / 2 bit store
// 0: 0-1, 1: 1-2, 2: 2-3
int x_stack[ss];
int x_stackPointer = 0;
int x_current = 0;

int y_stack[ss];
int y_stackPointer = 0;
int y_current = 0;

int z_stack[ss];
int z_stackPointer = 0;
int z_current = 0;

void push(inout int stack[ss], inout int stackPointer, out int current, int level) {
  int shift = (stackPointer & 0xf) << 1;
  int idx = stackPointer >> 4;

  stack[idx] |= (level & 3) << shift;

  stackPointer++;
  current = level;
}

void pop(inout int stack[ss], inout int stackPointer, out int current) {
  stackPointer--;

  // clear removed top element
  int oldShift = (stackPointer & 0xf) << 1;
  int oldIdx = stackPointer >> 4;
  stack[oldIdx] &= ~(3 << oldShift);

  // set current to new top element
  int shift = ((stackPointer - 1) & 0xf) << 1;
  int idx = (stackPointer - 1) >> 4;
  current = (stack[idx] >> shift) & 3;
}

void inc(inout int stack[ss], inout int stackPointer, out int current) {
  stack[stackPointer >> 4] += 1 << (stackPointer & 0xf);

  current += 1;
}

bool _drawRay(
  inout vec3 pos, vec3 dir,
  //colors
  vec4 cx, vec4 cy, vec4 cz
) {
  float r_x = (3.0 - pos.x) / dir.x;
  float r_y = (3.0 - pos.y) / dir.y;
  float r_z = (3.0 - pos.z) / dir.z;

  if (r_x < r_y && r_x < r_z) {
    if (x_stackPointer == -1) {
      return true;
    }

    pos += r_x * dir;

    if (1.0 < pos.y && pos.y < 2.0 && 1.0 < pos.z && pos.z < 2.0) {
      // entering hole
      if (x_current == 2) {
        // leaving entirely
        pop(x_stack, x_stackPointer, x_current);
        pop(y_stack, y_stackPointer, y_current);
        pop(z_stack, z_stackPointer, z_current);

        outColor = vec4(0.45f, 0.91f, 0.32f, 1.0f);
      } else {
        // go adjacent
        inc(x_stack, x_stackPointer, x_current);

        outColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    } else {
      // push new cell
      push(x_stack, x_stackPointer, x_current, 0);
      push(y_stack, y_stackPointer, y_current, int(pos.y));
      push(z_stack, z_stackPointer, z_current, int(pos.z));

      outColor = cx;
    }
  }

  return false;
}

void drawRay(vec3 pos, vec3 dir) {
  vec4 cx;
  if (dir.x > 0.0) {
    cx = C_E;
  } else {
    cx = C_W;
    dir.x *= -1.0;
    return;
  }
  
  vec4 cy;
  if (dir.y > 0.0) {
    cy = C_N;
  } else {
    cy = C_S;
    dir.y *= -1.0;
    return;
  }

  vec4 cz;
  if (dir.z > 0.0) {
    cz = C_T;
  } else {
    cz = C_B;
    dir.z *= -1.0;
    return;
  }

  for (int i = 0; i < 1; i++) {
    if (_drawRay(pos, dir, cx, cy, cz)) {
      break;
    } 
  }
}

void main() {
  vec3 camPos = vec3(u_x, u_y, u_z);
  vec3 rayDir = vec3(
    gl_FragCoord.xy - u_resolution.xy * 0.5,
    -focalLength
  );

  rayDir = normalize(u_rotation * rayDir);
  drawRay(camPos, rayDir);
}
