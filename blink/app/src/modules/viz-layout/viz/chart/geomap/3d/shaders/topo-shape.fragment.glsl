#extension GL_EXT_frag_depth : enable

precision highp float;
precision mediump int;

uniform float uHighlightedFeatureIndex;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying float vVertexFeatureIndex;
varying vec4 vColor;
varying float vIsDiscarded;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main(){

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>

    bool isHighlighted = int(vVertexFeatureIndex) == int(uHighlightedFeatureIndex);
    gl_FragColor = isHighlighted ? HIGHLIGHT_COLOR : vColor;

#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_TOPO_SHAPE_NEAR : FRAG_DEPTH_TOPO_SHAPE_FAR);
#endif
}