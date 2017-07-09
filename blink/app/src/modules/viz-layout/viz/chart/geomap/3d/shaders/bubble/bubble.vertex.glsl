precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uOpacity;
uniform float uMinBubbleRadius;
uniform float uMaxBubbleRadius;

attribute vec3 position;
attribute float weight;
attribute float color;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying vec4 vColor;
varying float vIsDiscarded;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl>

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main() {

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl>

    vec3 rgb = floatColorToRGB(isPickingMesh ? vertexDataPointIndex : color);
    // TODO (sunny): we are using only 24 out of 32 available bits
    vColor = vec4(rgb.r, rgb.g, rgb.b, isPickingMesh ? 1.0 : uOpacity);

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>

    float radius = mix(uMinBubbleRadius, uMaxBubbleRadius, weight);

    float distanceFromCamera = length(vVertexViewSpacePosition);
    if (distanceFromCamera > 1.0) {
        radius /= distanceFromCamera;
    }

    if (isHighlighted) {
        gl_PointSize = radius * mix(1.0, POINT_ON_HOVER_SCALE, uHighlightTransitionInterval);
    } else if (wasHighlighted) {
        gl_PointSize = radius * mix(POINT_ON_HOVER_SCALE, 1.0, uHighlightTransitionInterval);
    } else {
        gl_PointSize = radius;
    }
}