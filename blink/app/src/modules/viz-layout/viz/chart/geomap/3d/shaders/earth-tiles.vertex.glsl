precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying float vIsDiscarded;
varying vec2 vUv;
varying vec3 vPosition;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main() {

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>

    if (isEarthGlobe() || uProjectionMix != 1.0) {
        vPosition = getMapCoordinates(position);
    } else {
        vPosition = worldCoords.xyz;
    }
}