precision mediump float;
uniform float uTime;
uniform vec2 uResolution;

void main(void) {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float pulse = 0.5 + 0.5 * sin(uTime + uv.x * 10.0);
  gl_FragColor = vec4(pulse, uv.y, 1.0 - pulse, 1.0);
}
