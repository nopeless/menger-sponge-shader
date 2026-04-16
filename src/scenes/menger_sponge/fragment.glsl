#version 300 es
precision highp float;
precision highp int;

uniform vec2 u_resolution;
uniform int u_size;

out vec4 outColor;

bool inCarpet(ivec2 p) {
  for (int i = 0; i < 10; ++i) {
    if (i >= u_size) break;

    // is in middle?
    if ((p.x % 3 == 1) && (p.y % 3 == 1)) {
      return false;
    }

    p /= 3;
  }

  return true;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  int scale = 1;

  for (int i = 0; i < 10; ++i) {
    if (i >= u_size) break;
    scale *= 3;
  }

  ivec2 p = ivec2(floor(uv * vec2(scale)));

  bool inside = inCarpet(p);

  if (!inside) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    outColor = vec4(
      gl_FragCoord.x / u_resolution.x,
      gl_FragCoord.y / u_resolution.y,
      0.5,
      1.0
    );
  }
}
