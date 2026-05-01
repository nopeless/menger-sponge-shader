#version 300 es
precision mediump float;

uniform vec2 u_resolution;
float focalLength = 1000.0;

uniform float u_x;
uniform float u_y;
uniform float u_z;

// Z
uniform float u_roll;
// Y
uniform float u_yaw;
// X
uniform float u_pitch;

out vec4 outColor;

bool drawPlane(
  vec3 rayDir,
  vec3 origin,
  vec3 normal,
  // half side length
  float s2,
  vec3 color
) {
  float denom = dot(rayDir, normal);

  if (abs(denom) < 0.0001) return false;

  float t = dot(-origin, normal) / denom;

  if (t < 0.0) return false;

  vec3 point = origin + rayDir * t;
  // legacy code
  if (abs(point.x) > s2 || abs(point.y) > s2 || abs(point.z) > s2) {
    return false;
  }

  outColor = vec4(color, 1.0);
  return true;
}

void main() {
  // Camera vector
  vec3 camPos = vec3(u_x, u_y, u_z);
  // Ray direction
  vec3 rayDir = vec3(
    (gl_FragCoord.xy - u_resolution.xy * 0.5),
    focalLength
  );

  // Alias variables
  float sina = sin(u_yaw);
  float cosa = cos(u_yaw);
  float sinb = sin(u_pitch);
  float cosb = cos(u_pitch);
  float sinc = sin(u_roll);
  float cosc = cos(u_roll);

  mat3 Rx = mat3(
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, cosb, sinb),
    vec3(0.0, -sinb, cosb)
  );

  mat3 Ry = mat3(
    vec3(cosa, 0.0, -sina),
    vec3(0.0, 1.0, 0.0),
    vec3(sina, 0.0, cosa)
  );

  mat3 Rz = mat3(
    vec3(cosc, sinc, 0.0),
    vec3(-sinc, cosc, 0.0),
    vec3(0.0, 0.0, 1.0)
  );

  mat3 rotation = Rx * Ry * Rz;
  rayDir = rotation * rayDir;

  vec3 origin = camPos;

  float t = dot(-origin, rayDir) / dot(rayDir, rayDir);
  vec3 point = origin + rayDir * t;

  if (t < 0.0) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  if (distance(point, vec3(0.0)) < 0.5) {
    outColor = vec4(1.0f);
    return;
  }

    if (drawPlane(
    rayDir,
    origin,
    vec3(0.0, 0.0, -1.0),
    1.0,
    vec3(0.0, 1.0, 0.0)
  )) return;

  if (drawPlane(
    rayDir,
    origin,
    vec3(0.0, -1.0, 0.0),
    1.0,
    vec3(1.0, 0.0, 0.0)
  )) return;


  outColor = vec4(0.0, 0.0, 0.0, 1.0);
}
