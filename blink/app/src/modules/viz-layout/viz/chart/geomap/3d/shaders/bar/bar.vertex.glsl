precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uMinBarHeight;
uniform float uMaxBarHeight;

attribute vec3 position;
attribute float isTopVertex;
attribute float featureWeight;
attribute float featureColor;
attribute float featureCenterLatitude;
attribute float featureCenterLongitude;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying vec2 vPosition;
varying float vIsDiscarded;
varying vec3 vColor;
varying vec2 vFeatureCenter;
varying float vIsTopFace;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl>

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main() {
    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl>

    vPosition = position.xy;
    vColor = isHighlighted ? HIGHLIGHT_COLOR.rgb : floatColorToRGB(isPickingMesh ? vertexDataPointIndex : featureColor);
    vFeatureCenter = vec2(featureCenterLatitude, featureCenterLongitude);
    vIsTopFace = isTopVertex;

    vec3 vertexPosition = position;
    vertexPosition.z = mix(0.0, mix(uMinBarHeight, uMaxBarHeight, featureWeight), isTopVertex);
    if (isTopVertex == 1.0) {
        if (isHighlighted) {
            vertexPosition.z *= mix(1.0, BAR_ON_HOVER_SCALE, uHighlightTransitionInterval);
        } else if (wasHighlighted) {
            vertexPosition.z *= mix(BAR_ON_HOVER_SCALE, 1.0, uHighlightTransitionInterval);
        }
    }

    vec3 worldCoords = convertLatLongAltToXYZ(vertexPosition);
    vVertexViewSpacePosition = modelViewMatrix * vec4(worldCoords, 1.0);
    // TODO: make this a uniform
    vOriginViewSpacePosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);

    gl_Position = projectionMatrix * vVertexViewSpacePosition;
}