float PI = 3.14159265358979;

float random(vec2 st){
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

mat2 rot(float angle){
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float atan2(float y, float x){
    return x == 0. ? sign(y) * PI / 2. : atan(y, x);
}

vec2 xy2pol(vec2 xy){
    return vec2(atan2(xy.y, xy.x), length(xy));
}

vec2 pol2xy(vec2 pol){
    return pol.y * vec2(cos(pol.x), sin(pol.x));
}

// 値をスケーリングする
float scale(float value, float factor) {
    return value * factor;
}

// タイリングパターンを作成する
float tile(float value, float period) {
    return mod(value, period);
}

// 色のレベル数を減らす（ポスタライズ）
float posterize(float value, float levels) {
    return floor(value * levels) / levels;
}

// 閾値を適用する（2値化）
float threshold(float value, float thresh) {
    return value > thresh ? 1.0 : 0.0;
}