#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;


uniform sampler2D colorGradientTexture;
uniform sampler2D blendingTexture;
uniform vec2 blendingTextureSize;
uniform float uIsPickingMesh;

varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying float vWeight;
varying float vIsDiscarded;
varying float vVertexDataPointIndex;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

void main()	{

    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>

    float distanceFromCenter = length(vec2(gl_PointCoord.s - 0.5, gl_PointCoord.t - 0.5));
    if (distanceFromCenter > 0.5) {
        discard;
    }

    bool isPickingMesh = uIsPickingMesh == 1.0;
    if (isPickingMesh) {
        vec3 rgb = floatColorToRGB(vVertexDataPointIndex);
        gl_FragColor = vec4(rgb.r, rgb.g, rgb.b, 1.0);
    } else {

        vec2 texelPosition = vec2(gl_FragCoord.x/blendingTextureSize.x, gl_FragCoord.y/blendingTextureSize.y);
        vec4 textureRGBA = texture2D(blendingTexture, texelPosition);
        if (textureRGBA.w == 0.0) {
            discard;
        }

        // this factor adds anti-aliasing effect on the edges of the point
        float edgeAlphaFactor = 1.0;
        if (distanceFromCenter >= 0.4) {
            edgeAlphaFactor = ((0.5 - distanceFromCenter)/(0.5 - 0.4));
        }

        vec4 heatMapRGBA = texture2D(colorGradientTexture, vec2(textureRGBA.w, 0.5));
        gl_FragColor = vec4(heatMapRGBA.x, heatMapRGBA.y, heatMapRGBA.z, vWeight * edgeAlphaFactor);
    }

#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_METRIC_NEAR : FRAG_DEPTH_METRIC_FAR);
#endif

}