#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;

uniform vec4 uLineColor;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying float vVertexHiddenState;
varying float vIsDiscarded;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main(){

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>

    if (vVertexHiddenState == 1.0) {
        discard;
    }

    gl_FragColor = uLineColor;

#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_TOPO_BOUNDARY_NEAR : FRAG_DEPTH_TOPO_BOUNDARY_FAR);
#endif
}