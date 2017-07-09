#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;

#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>

uniform float uZoomLevel;
uniform sampler2D uTileTextures[MAX_NUM_TILES];
// x-index, y-index of ith corresponding texture in the textures array
uniform vec2 uTextureTileXYIndices[MAX_NUM_TILES];


varying float vIsDiscarded;
varying vec4 vVertexViewSpacePosition;
varying vec4 vOriginViewSpacePosition;
varying vec3 vPosition;

void main() {
    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>

    float numTiles = pow(2.0, uZoomLevel);

    float fragmentX = ((vPosition.x + WIDTH * 0.5)/WIDTH) * numTiles;
    float fragmentY = numTiles - ((vPosition.y + HEIGHT * 0.5)/HEIGHT) * numTiles;

    float tileX = floor(fragmentX);
    float tileY = floor(fragmentY);
    vec2 tileXY = vec2(tileX, tileY);

    gl_FragColor = vec4(0.0);

    for (int i=0; i<MAX_NUM_TILES; ++i) {
        vec2 textureTileXY = uTextureTileXYIndices[i];
        if (textureTileXY == tileXY) {
            float fragmentTileU = fragmentX - tileX;
            float fragmentTileV = fragmentY - tileY;

            vec4 color = texture2D(uTileTextures[i], vec2(fragmentTileU, 1.0 - fragmentTileV));
            //float gray = dot(vec3(0.375, 0.5, 0.125), color.rgb);
            //gl_FragColor = vec4(gray, gray, gray, 0.85);
            float luminance = dot(color, vec4(0.2126, 0.7152, 0.0722, 0.0));
            gl_FragColor = vec4(luminance, luminance, luminance, 0.5);

            break;
        }
    }


#ifdef GL_EXT_frag_depth
    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);
    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_EARTH_TILES_NEAR : FRAG_DEPTH_EARTH_TILES_FAR);
#endif
}