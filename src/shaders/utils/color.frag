float gray (vec3 col){
    return dot(col, vec3(0.299, 0.587, 0.114));
}

vec3 hsv2rgb(in float h){
    float s = 1.;
    float v = 1.;

    vec4 K = vec4(1., 2. / 3., 1. / 3., 3.);
    vec3 p = abs(fract(vec3(h) + K.xyz) * 6. - K.w);
    vec3 rgb = v * mix(vec3(K.x), clamp(p - K.x, 0., 1.), s);

    return rgb;
}

// 色ベクトルをポスタライズする
vec3 posterizeColor(vec3 col, float levels) {
    return floor(col * levels) / levels;
}

// 各色チャンネルに閾値を適用する
vec3 thresholdColor(vec3 col, float thresh) {
    return vec3(
        col.r > thresh ? 1.0 : 0.0,
        col.g > thresh ? 1.0 : 0.0,
        col.b > thresh ? 1.0 : 0.0
    );
}

// 色を反転する
vec3 invert(vec3 col) {
    return 1.0 - col;
}

// RGBをHSVに変換する
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}