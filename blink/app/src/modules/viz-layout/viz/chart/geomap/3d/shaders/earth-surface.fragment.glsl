#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>


varying float vIsDiscarded;
varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;

void main() {
    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>

    gl_FragColor = vec4(0.13, 0.13, 0.13, 1.0);

#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_EARTH_NEAR : FRAG_DEPTH_EARTH_FAR);
#endif
}