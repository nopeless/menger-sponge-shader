#version 300 es
precision mediump float;

uniform float u_angle;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;

out vec4 outColor;

void main() {
  vec2 offset_uv = (gl_FragCoord.xy / u_resolution - 0.5) / u_zoom;
  
  vec2 uv = offset_uv + u_center;


  int scale = 1;
  int maxSize = int(max(u_resolution.x, u_resolution.y) * u_zoom);

  int maxIter = 0;
  for (; maxIter < 100; ++maxIter) {
    if (scale >= maxSize) break;
    scale *= 3;
  }

  ivec2 p = ivec2(floor(uv * vec2(scale)));

  for (int i = 0; i < 100; ++i) {
    if (i >= maxIter) break;

    if ((p.x % 3 == 1) && (p.y % 3 == 1)) {
      outColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    p /= 3;
  }

  vec3 color = vec3(
    gl_FragCoord.x / u_resolution.x,
    gl_FragCoord.y / u_resolution.y,
    0.5
  );

  vec3 axis = normalize(vec3(1.0));
  float cosA = cos(u_angle);
  float sinA = sin(u_angle);

  vec3 rotated =
      color * cosA +
      cross(axis, color) * sinA +
      axis * dot(axis, color) * (1.0 - cosA);

  outColor = vec4(rotated, 1.0);
}
