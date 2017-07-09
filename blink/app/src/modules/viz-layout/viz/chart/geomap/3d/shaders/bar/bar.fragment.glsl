#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;

const float SQRT_2 = 1.4142;

uniform float uOpacity;
uniform float uBarWidth;
uniform float uIsPickingMesh;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying vec2 vPosition;
varying vec3 vColor;
varying vec2 vFeatureCenter;
varying float vIsTopFace;
varying float vIsDiscarded;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main() {

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>

    bool isPickingMesh = uIsPickingMesh == 1.0;
    bool isOnTheEdge = vIsTopFace == 1.0 || distance(vPosition, vFeatureCenter)/(uBarWidth/2.0) > SQRT_2 - 0.01;

    vec4 color = vec4(vColor.r, vColor.g, vColor.b, isPickingMesh ? 1.0 : uOpacity);
    gl_FragColor = isOnTheEdge ? color * 0.75 : color;

#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_METRIC_NEAR : FRAG_DEPTH_METRIC_FAR);
#endif
}