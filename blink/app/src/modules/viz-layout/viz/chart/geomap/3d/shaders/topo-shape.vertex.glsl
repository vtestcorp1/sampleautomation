precision highp float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uHighlightedFeatureIndex;
uniform float uOpacity;

attribute vec3 position;
attribute float vertexHiddenState;
attribute float vertexFeatureIndex;
attribute float color;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying float vVertexFeatureIndex;
varying vec4 vColor;
varying float vIsDiscarded;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main(){
    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>

    vVertexFeatureIndex = vertexFeatureIndex;

    vec3 rgb = floatColorToRGB(color);
    vColor = vec4(rgb.r, rgb.g, rgb.b, (vertexHiddenState == 1.0 || color == 0.0) ? 0.0 : uOpacity);

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>

}