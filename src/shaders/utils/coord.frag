vec2 mosaic(vec2 uv, float n){
    return vec2((floor(uv.x * n) + 0.5) / n, (floor(uv.y * n * 9. / 16.) + 0.5) / (n*9./16.));
}

// UV座標をタイリングする
vec2 tileUV(vec2 uv, float scale) {
    return fract(uv * scale);
}

// UV座標をスケーリングする
vec2 scaleUV(vec2 uv, float scale) {
    return uv * scale;
}

// UV座標を中心を中心に回転する
vec2 rotateUV(vec2 uv, float angle) {
    vec2 center = vec2(0.5, 0.5);
    uv -= center;
    uv = vec2(uv.x * cos(angle) - uv.y * sin(angle), uv.x * sin(angle) + uv.y * cos(angle));
    uv += center;
    return uv;
}

// UV座標をミラー反転する
vec2 mirror(vec2 uv) {
    return vec2(1.0 - uv.x, uv.y);
}