precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float pointSize;

attribute vec2 uv;

attribute vec3 position;
attribute float weight;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying float vWeight;
varying vec2 vUv;
varying float vIsDiscarded;
varying float vVertexDataPointIndex;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl>

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main()	{
    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl>

    vWeight = weight;
    vVertexDataPointIndex = vertexDataPointIndex;

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-point-sizing.vertex.glsl>

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>
}