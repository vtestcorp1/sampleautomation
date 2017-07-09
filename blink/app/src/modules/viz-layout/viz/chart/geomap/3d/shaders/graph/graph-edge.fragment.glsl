#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying float vVertexHiddenState;
varying float vIsDiscarded;
varying vec3 vColor;
varying float vWeight;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main(){

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>

    if (vVertexHiddenState == 1.0) {
        discard;
    }

    gl_FragColor = vec4(vColor.r, vColor.g, vColor.b, /*vWeight*/1.0);

#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_METRIC_NEAR : FRAG_DEPTH_METRIC_FAR);
#endif
}