precision mediump float;

varying vec2 vTexCoord;
uniform float u_time;
uniform float u_beat;
uniform vec2 u_resolution;
uniform sampler2D u_tex;
uniform sampler2D ui_tex;
uniform float u_faderValues[8];
uniform float u_faderMaster;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float luma(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

vec3 sampleScene(vec2 uv) {
    return texture2D(u_tex, uv).rgb;
}

void main(void) {
    float f0 = clamp(u_faderValues[0], 0.0, 1.0); // vignette
    float f1 = clamp(u_faderValues[1], 0.0, 1.0); // block displacement
    float f2 = clamp(u_faderValues[2], 0.0, 1.0); // scanline/chromatic
    float f3 = clamp(u_faderValues[3], 0.0, 1.0); // distortion/tear
    float f4 = clamp(u_faderValues[4], 0.0, 1.0); // posterize
    float f5 = clamp(u_faderValues[5], 0.0, 1.0); // bloom
    float f6 = clamp(u_faderValues[6], 0.0, 1.0); // threshold
    float f7 = clamp(u_faderValues[7], 0.0, 1.0); // mirror/pixelate
    float master = clamp(u_faderMaster, 0.0, 1.0); // invert

    vec2 uv = vTexCoord;
    vec2 px = 1.0 / max(u_resolution, vec2(1.0));

    // sway系のブロック変位
    if (f1 > 0.0001) {
        vec2 blockUv = floor(uv * vec2(22.0, 14.0)) / vec2(22.0, 14.0);
        float blockNoise = random(blockUv + floor(u_time * 8.0));
        uv += (vec2(random(blockUv * 3.1), random(blockUv * 7.9)) - 0.5) * 0.12 * f1 * step(0.55, blockNoise);
    }

    // VJ-sync系の歪み + ==1.0 で強めのtear
    if (f3 > 0.0001) {
        float freq = mix(3.0, 28.0, f3);
        float amp = mix(0.005, 0.03, f3);
        uv.x += sin(uv.y * freq + u_time * 1.3) * amp;
    }
    if (f3 >= 0.999) {
        float rowNoise = random(vec2(floor(uv.y * 190.0), floor(u_time * 18.0 + u_beat)));
        uv.x += (rowNoise - 0.5) * 0.11;
    }

    uv = fract(uv);
    vec3 col = sampleScene(uv);

    // VJ-sync系のクロマ収差 + scanline
    if (f2 > 0.0001) {
        vec2 shift = vec2(0.012 * f2, 0.0);
        float line = sin((uv.y * u_resolution.y + u_time * 65.0) * 1.4) * 0.5 + 0.5;
        vec3 c;
        c.r = texture2D(u_tex, fract(uv + shift)).r;
        c.g = texture2D(u_tex, uv).g;
        c.b = texture2D(u_tex, fract(uv - shift)).b;
        col = mix(col, c * (0.8 + 0.2 * line), f2);
    }

    // posterize
    if (f4 > 0.0001) {
        float levels = mix(32.0, 3.0, f4);
        col = floor(col * levels) / levels;
    }

    // bloom
    if (f5 > 0.0001) {
        vec3 blur = (
            sampleScene(fract(uv + vec2(px.x, 0.0))) +
            sampleScene(fract(uv - vec2(px.x, 0.0))) +
            sampleScene(fract(uv + vec2(0.0, px.y))) +
            sampleScene(fract(uv - vec2(0.0, px.y)))
        ) * 0.25;
        col = mix(col, max(col, blur * 1.2), f5);
    }

    // threshold
    if (f6 > 0.0001) {
        float thr = mix(0.9, 0.2, f6);
        vec3 clipped = step(vec3(thr), col);
        col = mix(col, clipped, f6);
    }

    // mirror/pixelate
    if (f7 > 0.0001) {
        vec2 mirrored = vec2(abs(uv.x - 0.5) * 2.0, uv.y);
        vec3 mcol = sampleScene(fract(mirrored));
        col = mix(col, mcol, f7 * 0.7);
    }
    if (f7 >= 0.999) {
        vec2 grid = vec2(64.0);
        vec2 puv = floor(uv * grid) / grid;
        col = sampleScene(puv);
    }

    // vignette
    if (f0 > 0.0001) {
        float dist = length(vTexCoord - vec2(0.5));
        float vig = 1.0 - smoothstep(0.2, 0.75, dist);
        col *= mix(1.0, vig, f0);
    }

    // master: invert
    col = mix(col, vec3(1.0) - col, master);

    vec4 outCol = vec4(clamp(col, 0.0, 1.0), 1.0);

    vec4 uiCol = texture2D(ui_tex, uv);
    outCol = mix(outCol, uiCol, uiCol.a);

    gl_FragColor = outCol;
}