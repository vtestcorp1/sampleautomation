#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;

uniform vec3 uColor;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main() {
    gl_FragColor = vec4(uColor.r, uColor.g, uColor.b, 0.75);

#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_METRIC_NEAR : FRAG_DEPTH_METRIC_FAR);
#endif
}