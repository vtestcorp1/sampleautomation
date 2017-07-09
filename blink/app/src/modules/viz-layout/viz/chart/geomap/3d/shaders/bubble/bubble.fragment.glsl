#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying vec4 vColor;
varying float vIsDiscarded;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main() {

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>

    float distanceFromCenter = length(vec2(gl_PointCoord.s - 0.5, gl_PointCoord.t - 0.5));
    if (distanceFromCenter > 0.5) {
        discard;
    }

    float alpha = vColor.a;
    if (distanceFromCenter >= 0.4) {
        alpha = ((0.5 - distanceFromCenter)/(0.5 - 0.4)) * alpha;
    }

    gl_FragColor = vec4(vColor.r, vColor.g, vColor.b, alpha);

#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_METRIC_NEAR : FRAG_DEPTH_METRIC_FAR);
#endif
}