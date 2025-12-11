precision mediump float;

varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_tex;
uniform sampler2D ui_tex;

// Bundled at build time via vite-plugin-glsl; VS Code warnings are expected.
#include "./utils/math.frag"
#include "./utils/coord.frag"
#include "./utils/color.frag"

void main(void) {
    vec2 uv = vTexCoord;
    vec4 col = texture2D(u_tex, uv);

    vec4 uiCol = texture2D(ui_tex, uv);
    col = mix(col, uiCol, uiCol.a);

    gl_FragColor = col;
}