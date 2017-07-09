precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute float vertexHiddenState;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying float vVertexHiddenState;
varying float vIsDiscarded;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main(){

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>

    vVertexHiddenState = vertexHiddenState;

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>
}