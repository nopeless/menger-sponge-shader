#version 300 es
precision mediump float;

uniform vec2 u_resolution;
float focalLength = 1000.0;

uniform float u_angle;

uniform float u_x;
uniform float u_y;
uniform float u_z;
uniform mat3 u_rotation;

out vec4 outColor;

bool drawPlane(
  vec3 pos,
  vec3 dir,
  vec3 origin,
  vec3 normal,
  // half side length
  float s2,
  vec3 color
) {
  float denom = dot(dir, normal);

  if (abs(denom) < 0.0001) return false;

  float t = dot(origin - pos, normal) / denom;

  if (t < 0.0) return false;

  vec3 point = pos + dir * t;
  
  // check cartasian
  vec3 d = point - origin;

  if (abs(d.x) > s2 || abs(d.y) > s2 || abs(d.z) > s2) {
    return false;
  }

  vec2 uv;

  // heuristics
  if (abs(normal.x) > 0.5) {
    uv = d.yz;
  } else if (abs(normal.y) > 0.5) {
    uv = d.xz;
  } else {
    uv = d.xy;
  }

  float checker = sin((uv.x + uv.y) * 20.0 + 3.0 * u_angle);

  if (checker > 0.5) {
    return false;
  }

  color *= 1.5 - length(d) / (s2 * sqrt(2.0));

  vec3 axis = normalize(vec3(1.0));
  float cosA = cos(u_angle);
  float sinA = sin(u_angle);

  vec3 rotated =
      color * cosA +
      cross(axis, color) * sinA +
      axis * dot(axis, color) * (1.0 - cosA);

  outColor = vec4(rotated, 1.0);

  return true;
}

void main() {
  // Camera vector
  vec3 camPos = vec3(u_x, u_y, u_z);
  // Ray direction
  vec3 rayDir = vec3(
    (gl_FragCoord.xy - u_resolution.xy * 0.5),
    -focalLength
  );

  rayDir = u_rotation * rayDir;

  vec3 origin = camPos;

  float t = dot(-origin, rayDir) / dot(rayDir, rayDir);

  if (t < 0.0) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  if (drawPlane(
    camPos,
    rayDir,
    vec3(0.5, 0.0, 0.0),
    vec3(1.0, 0.0, 0.0),
    0.5,
    vec3(1.0, 0.0, 0.0)
  )) return;

  if (drawPlane(
    camPos,
    rayDir,
    vec3(0.0, 0.5, 0.0),
    vec3(0.0, 1.0, 0.0),
    0.5,
    vec3(0.0, 1.0, 0.0)
  )) return;

  if (drawPlane(
    camPos,
    rayDir,
    vec3(0.0, 0.0, 0.5),
    vec3(0.0, 0.0, 1.0),
    0.5,
    vec3(0.0, 0.0, 1.0)
  )) return;

  outColor = vec4(0.0, 0.0, 0.0, 1.0);
}
