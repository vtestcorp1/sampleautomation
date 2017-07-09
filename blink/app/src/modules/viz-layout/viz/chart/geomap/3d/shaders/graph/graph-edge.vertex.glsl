precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uMinBarHeight;
uniform float uMaxBarHeight;

attribute vec3 position;
attribute float featureWeight;
attribute float featureColor;
attribute float vertexHiddenState;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying vec2 vPosition;
varying vec3 vColor;
varying float vVertexHiddenState;
varying float vIsDiscarded;
varying float vWeight;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl>

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main() {

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl>

    vPosition = position.xy;
    vColor = isHighlighted ? HIGHLIGHT_COLOR.rgb : floatColorToRGB(isPickingMesh ? vertexDataPointIndex : featureColor);
    vWeight = featureWeight;

    vec3 vertexPosition = position;
    if (isHighlighted) {
        vertexPosition.z *= mix(1.0, EDGE_ON_HOVER_SCALE, uHighlightTransitionInterval);
    } else if (wasHighlighted) {
        vertexPosition.z *= mix(EDGE_ON_HOVER_SCALE, 1.0, uHighlightTransitionInterval);
    }

    vVertexHiddenState = vertexHiddenState;

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>
}