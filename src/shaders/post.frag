precision mediump float;

varying vec2 vTexCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_tex;

#include "./utils/util.frag"

void main(void) {
    vec2 uv = vTexCoord;
    vec4 col = texture2D(u_tex, uv);

    col.rgb = vec3(0.5);

    gl_FragColor = col;
}
