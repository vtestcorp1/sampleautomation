#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;

uniform float uIsLatitudeViewportComputer;

varying float vIsDiscarded;
varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying vec3 vPosition;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main() {
    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>

    float latRange = MAX_LATITUDE_MERCATOR - MIN_LATITUDE_MERCATOR;
    float lonRange = MAX_LONGITUDE_2D - MIN_LONGITUDE_2D;

    gl_FragColor = floatToVec4(
        uIsLatitudeViewportComputer == 1.0
            ? (vPosition.x - MIN_LATITUDE_MERCATOR)/latRange :
                (vPosition.y - MIN_LONGITUDE_2D)/lonRange
    );

#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_EARTH_NEAR : FRAG_DEPTH_EARTH_FAR);
#endif
}