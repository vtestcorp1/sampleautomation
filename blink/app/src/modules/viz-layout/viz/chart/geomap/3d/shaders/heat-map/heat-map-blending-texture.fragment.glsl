#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying float vIsDiscarded;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main()	{
    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>

    float distanceFromCenter = length(vec2(gl_PointCoord.s - 0.5, gl_PointCoord.t - 0.5));
    if (distanceFromCenter > 0.5) {
        discard;
    }

    float relativeDistanceFromCenter = distanceFromCenter/0.5;
    // TODO (sunny): consider doing a gaussian blur rather than this naive radial blur
    float alpha = 1.0 - relativeDistanceFromCenter;

    gl_FragColor = vec4(0, 0, 0, alpha);

#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? gl_FragCoord.z : FRAG_DEPTH_METRIC_FAR);
#endif
}