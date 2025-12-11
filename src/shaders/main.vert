// Vertex shader for post-processing
// Passes texture coordinates and positions for full-screen quad rendering
// Attributes:
// - aPosition: vec4, vertex position
// - aTexCoord: vec2, texture coordinate
// Varyings:
// - vTexCoord: vec2, flipped texture coordinate

attribute vec4 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

// プログラムの処理
void main(){
    vTexCoord = aTexCoord;
    vTexCoord.y = vTexCoord.y * -1. + 1.;

    vec4 position = aPosition * 2. - 1.;

    gl_Position = position;
}
