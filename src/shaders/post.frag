// Post-processing fragment shader
// Applies effects to the rendered visual texture
// Uniforms:
// - u_tex: sampler2D, the visual texture
// - u_resolution: vec2, screen resolution
// - u_time: float, elapsed time in seconds
// - u_beat: float, current beat value

precision mediump float;

varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_tex;

// Bundled at build time via vite-plugin-glsl; VS Code warnings are expected.
#include "./utils/util.frag"

void main(void) {
    vec2 uv = vTexCoord;
    vec4 col = texture2D(u_tex, uv);

    gl_FragColor = col;
}
