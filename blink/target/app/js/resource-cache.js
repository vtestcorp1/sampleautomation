angular.module('resourceCache', ['src/modules/viz-layout/viz/chart/geomap/3d/shaders/bar/bar.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/bar/bar.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/bubble/bubble.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/bubble/bubble.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-feature.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-feature.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-surface.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-surface.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-tiles.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-tiles.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/graph/graph-edge.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/graph/graph-edge.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-blending-texture.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-blending-texture.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-feature.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-feature.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-point-sizing.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-boundary.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-boundary.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-shape.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-shape.vertex.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/viewport-computer/viewport-computer.fragment.glsl','src/modules/viz-layout/viz/chart/geomap/3d/shaders/viewport-computer/viewport-computer.vertex.glsl'])
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/bar/bar.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/bar/bar.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'const float SQRT_2 = 1.4142;\n'+
'\n'+
'uniform float uOpacity;\n'+
'uniform float uBarWidth;\n'+
'uniform float uIsPickingMesh;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying vec2 vPosition;\n'+
'varying vec3 vColor;\n'+
'varying vec2 vFeatureCenter;\n'+
'varying float vIsTopFace;\n'+
'varying float vIsDiscarded;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>\n'+
'\n'+
'    bool isPickingMesh = uIsPickingMesh == 1.0;\n'+
'    bool isOnTheEdge = vIsTopFace == 1.0 || distance(vPosition, vFeatureCenter)/(uBarWidth/2.0) > SQRT_2 - 0.01;\n'+
'\n'+
'    vec4 color = vec4(vColor.r, vColor.g, vColor.b, isPickingMesh ? 1.0 : uOpacity);\n'+
'    gl_FragColor = isOnTheEdge ? color * 0.75 : color;\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_METRIC_NEAR : FRAG_DEPTH_METRIC_FAR);\n'+
'#endif\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/bar/bar.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/bar/bar.vertex.glsl', 'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'uniform float uMinBarHeight;\n'+
'uniform float uMaxBarHeight;\n'+
'\n'+
'attribute vec3 position;\n'+
'attribute float isTopVertex;\n'+
'attribute float featureWeight;\n'+
'attribute float featureColor;\n'+
'attribute float featureCenterLatitude;\n'+
'attribute float featureCenterLongitude;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying vec2 vPosition;\n'+
'varying float vIsDiscarded;\n'+
'varying vec3 vColor;\n'+
'varying vec2 vFeatureCenter;\n'+
'varying float vIsTopFace;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl>\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl>\n'+
'\n'+
'    vPosition = position.xy;\n'+
'    vColor = isHighlighted ? HIGHLIGHT_COLOR.rgb : floatColorToRGB(isPickingMesh ? vertexDataPointIndex : featureColor);\n'+
'    vFeatureCenter = vec2(featureCenterLatitude, featureCenterLongitude);\n'+
'    vIsTopFace = isTopVertex;\n'+
'\n'+
'    vec3 vertexPosition = position;\n'+
'    vertexPosition.z = mix(0.0, mix(uMinBarHeight, uMaxBarHeight, featureWeight), isTopVertex);\n'+
'    if (isTopVertex == 1.0) {\n'+
'        if (isHighlighted) {\n'+
'            vertexPosition.z *= mix(1.0, BAR_ON_HOVER_SCALE, uHighlightTransitionInterval);\n'+
'        } else if (wasHighlighted) {\n'+
'            vertexPosition.z *= mix(BAR_ON_HOVER_SCALE, 1.0, uHighlightTransitionInterval);\n'+
'        }\n'+
'    }\n'+
'\n'+
'    vec3 worldCoords = convertLatLongAltToXYZ(vertexPosition);\n'+
'    vVertexViewSpacePosition = modelViewMatrix * vec4(worldCoords, 1.0);\n'+
'    // TODO: make this a uniform\n'+
'    vOriginViewSpacePosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);\n'+
'\n'+
'    gl_Position = projectionMatrix * vVertexViewSpacePosition;\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl', '/*BEGIN_BLINK_SHADER_LITERAL\n'+
'\n'+
'bool isPickingMesh = uIsPickingMesh == 1.0;\n'+
'bool isHighlighted = uHighlightedDataPointIndex == vertexDataPointIndex;\n'+
'bool wasHighlighted = uLastHighlightedDataPointIndex == vertexDataPointIndex;\n'+
'\n'+
'END_BLINK_SHADER_LITERAL*/\n'+
'\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl', 'uniform float uHighlightedDataPointIndex;\n'+
'uniform float uLastHighlightedDataPointIndex;\n'+
'uniform float uHighlightTransitionInterval;\n'+
'uniform float uIsPickingMesh;\n'+
'\n'+
'attribute float vertexDataPointIndex;\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl', '/*BEGIN_BLINK_SHADER_LITERAL\n'+
'\n'+
'vec3 worldCoords = convertLatLongAltToXYZ(position);\n'+
'vVertexViewSpacePosition = modelViewMatrix * vec4(worldCoords, 1.0);\n'+
'// TODO: make this a uniform\n'+
'vOriginViewSpacePosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);\n'+
'\n'+
'gl_Position = projectionMatrix * vVertexViewSpacePosition;\n'+
'\n'+
'END_BLINK_SHADER_LITERAL*/\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl', '/*BEGIN_BLINK_SHADER_LITERAL\n'+
'\n'+
'// all the vertices of the triangle should be non-discarded\n'+
'if (vIsDiscarded != 0.0) {\n'+
'    discard;\n'+
'}\n'+
'\n'+
'END_BLINK_SHADER_LITERAL*/\n'+
'\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl', '/*BEGIN_BLINK_SHADER_LITERAL\n'+
'\n'+
'bool isDiscarded = isDiscardedGeoPoint(position);\n'+
'vIsDiscarded = isDiscarded ? 1.0 : 0.0;\n'+
'if (isDiscarded) {\n'+
'    return;\n'+
'}\n'+
'\n'+
'END_BLINK_SHADER_LITERAL*/\n'+
'\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl', 'uniform int uProjectionType;\n'+
'uniform float uProjectionMix;\n'+
'\n'+
'#define FRAG_DEPTH_EARTH_TILES_NEAR 0.006\n'+
'#define FRAG_DEPTH_EARTH_TILES_FAR 0.004\n'+
'#define FRAG_DEPTH_EARTH_NEAR 0.0055\n'+
'#define FRAG_DEPTH_EARTH_FAR 0.0045\n'+
'#define FRAG_DEPTH_TOPO_BOUNDARY_NEAR 0.007\n'+
'#define FRAG_DEPTH_TOPO_BOUNDARY_FAR 0.003\n'+
'#define FRAG_DEPTH_METRIC_NEAR 0.01\n'+
'#define FRAG_DEPTH_METRIC_FAR 0.0\n'+
'#define FRAG_DEPTH_TOPO_SHAPE_NEAR 0.008\n'+
'#define FRAG_DEPTH_TOPO_SHAPE_FAR 0.002\n'+
'\n'+
'#define TOO_FAR 1000000.0\n'+
'\n'+
'#define M_PI 3.1415926535897932384626433832795\n'+
'#define EARTH_RADIUS 1.0\n'+
'\n'+
'#define HEIGHT 4.0\n'+
'#define WIDTH 4.0\n'+
'\n'+
'// web mercator defines this constant\n'+
'#define MAX_LATITUDE_MERCATOR 85.051129\n'+
'#define MIN_LATITUDE_MERCATOR -85.051129\n'+
'#define MIN_LATITUDE_DRAWN -63.21333\n'+
'\n'+
'// we artificially extend longitudes to create some horizontal padding in flat maps\n'+
'#define MIN_LONGITUDE_2D -180.0\n'+
'#define MAX_LONGITUDE_2D 180.0\n'+
'#define MIN_LONGITUDE_SPHERE -180.0\n'+
'#define MAX_LONGITUDE_SPHERE 180.0\n'+
'\n'+
'#define MIN_LATITUDE -90.0\n'+
'#define MAX_LATITUDE 90.0\n'+
'\n'+
'#define MAX_NUM_TILES 16\n'+
'\n'+
'#define POINT_ON_HOVER_SCALE 1.5\n'+
'#define BAR_ON_HOVER_SCALE 1.5\n'+
'#define EDGE_ON_HOVER_SCALE 1.5\n'+
'\n'+
'#define HIGHLIGHT_COLOR vec4(1.0, 1.0, 0.0, 0.55)\n'+
'\n'+
'\n'+
'bool isEarthGlobe() {\n'+
'    // the threshold on uProjectionMix is dervied for manual tuning\n'+
'    // and reduces artifacts while changing projection type\n'+
'    return uProjectionType == 0 && uProjectionMix >= 0.75;\n'+
'}\n'+
'\n'+
'bool isEarthMap() {\n'+
'    return uProjectionType == 1;\n'+
'}\n'+
'\n'+
'bool isEarthPerspectivePlane() {\n'+
'    return uProjectionType == 2;\n'+
'}\n'+
'\n'+
'// floatValue should be [0, 1]\n'+
'// Source: http://stackoverflow.com/a/18454838\n'+
'vec4 floatToVec4(float floatValue) {\n'+
'    const vec4 bitSh = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);\n'+
'    const vec4 bitMsk = vec4(0.0,vec3(1.0/256.0));\n'+
'    const vec4 bitShifts = vec4(1.0) / bitSh;\n'+
'\n'+
'    vec4 comp = fract(floatValue * bitSh);\n'+
'    comp -= comp.xxyz * bitMsk;\n'+
'    return comp;\n'+
'}\n'+
'\n'+
'vec3 floatColorToRGB(float color) {\n'+
'    float r = floor(color / 256.0 / 256.0);\n'+
'    float g = floor((color - r * 256.0 * 256.0) / 256.0);\n'+
'    float b = floor(color - r * 256.0 * 256.0 - g * 256.0);\n'+
'    return vec3(r/255.0, g/255.0, b/255.0);\n'+
'}\n'+
'\n'+
'vec3 getGlobeCoordinates(vec3 latLongAlt) {\n'+
'    float phi = (90.0 - latLongAlt.x) * M_PI/180.0;\n'+
'    float theta = (180.0 - latLongAlt.y) * M_PI/180.0 + 180.0;\n'+
'\n'+
'    float sinPhi = sin(phi);\n'+
'    float cosPhi = cos(phi);\n'+
'    float sinTheta = sin(theta);\n'+
'    float cosTheta = cos(theta);\n'+
'\n'+
'    float x = EARTH_RADIUS * sinPhi * cosTheta;\n'+
'    float y = EARTH_RADIUS * cosPhi;\n'+
'    float z = EARTH_RADIUS * sinPhi * sinTheta;\n'+
'\n'+
'    return vec3(x, y, z) * ((1.0 + latLongAlt.z)/EARTH_RADIUS);\n'+
'}\n'+
'\n'+
'vec3 getMapCoordinates(vec3 latLongAlt) {\n'+
'    float x = ((WIDTH/(MAX_LONGITUDE_2D - MIN_LONGITUDE_2D)) * latLongAlt.y);\n'+
'\n'+
'    float latRad = latLongAlt.x * M_PI/180.0;\n'+
'    float mercN = log(tan((M_PI/4.0) + (latRad/2.0)));\n'+
'    float y = HEIGHT/2.0 - (((HEIGHT/2.0)-(WIDTH * mercN/(2.0 * M_PI))));\n'+
'\n'+
'    return vec3(x, y, latLongAlt.z);\n'+
'}\n'+
'\n'+
'bool isDiscardedGeoPoint(vec3 latLongAlt) {\n'+
'    if (isEarthGlobe()) {\n'+
'        // no extra padding needed in globular earth\n'+
'        return latLongAlt.y > MAX_LONGITUDE_SPHERE || latLongAlt.y < MIN_LONGITUDE_SPHERE;\n'+
'    }\n'+
'    return latLongAlt.x > MAX_LATITUDE_MERCATOR || latLongAlt.x < MIN_LATITUDE_DRAWN;\n'+
'}\n'+
'\n'+
'vec3 convertLatLongAltToXYZ(vec3 latLongAlt) {\n'+
'    if (isDiscardedGeoPoint(latLongAlt)) {\n'+
'        return vec3(TOO_FAR, TOO_FAR, TOO_FAR);\n'+
'    }\n'+
'    return mix(getMapCoordinates(latLongAlt), getGlobeCoordinates(latLongAlt), uProjectionMix);\n'+
'}\n'+
'\n'+
'bool isCloserPointOfIntersectionOnGlobe(vec4 vVertexViewSpacePosition, vec4 vOriginViewSpacePosition) {\n'+
'    if (!isEarthGlobe()) {\n'+
'        return true;\n'+
'    }\n'+
'\n'+
'    // We decide if this point is the closer of the two points that the ray from camera to this point\n'+
'    // intersects the sphere by some simple 3d geometry (base on whether the perpendicular from the\n'+
'    // center of the sphere intersects the ray after the point or before it). If the point is the\n'+
'    // closer of the pair it gets a lower fragment depth so that it is always visible. Note that the\n'+
'    // constants chosen here are related to the ones in the shaders of the sphere that represents the\n'+
'    // solid earth. Together they ensure that for the points closer to the camera the topo layer is\n'+
'    // at the top but for the points away from the camera the sphere is at the top (so that the inner\n'+
'    // faces of the topo on the other end of the sphere are not visible from the front).\n'+
'    float fragmentDistanceFromCamera = length(vVertexViewSpacePosition);\n'+
'    float angle = dot(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    float radiusSquared = fragmentDistanceFromCamera * fragmentDistanceFromCamera;\n'+
'    return abs(angle/radiusSquared) >= EARTH_RADIUS;\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/bubble/bubble.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/bubble/bubble.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying vec4 vColor;\n'+
'varying float vIsDiscarded;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>\n'+
'\n'+
'    float distanceFromCenter = length(vec2(gl_PointCoord.s - 0.5, gl_PointCoord.t - 0.5));\n'+
'    if (distanceFromCenter > 0.5) {\n'+
'        discard;\n'+
'    }\n'+
'\n'+
'    float alpha = vColor.a;\n'+
'    if (distanceFromCenter >= 0.4) {\n'+
'        alpha = ((0.5 - distanceFromCenter)/(0.5 - 0.4)) * alpha;\n'+
'    }\n'+
'\n'+
'    gl_FragColor = vec4(vColor.r, vColor.g, vColor.b, alpha);\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_METRIC_NEAR : FRAG_DEPTH_METRIC_FAR);\n'+
'#endif\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/bubble/bubble.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/bubble/bubble.vertex.glsl', 'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'uniform float uOpacity;\n'+
'uniform float uMinBubbleRadius;\n'+
'uniform float uMaxBubbleRadius;\n'+
'\n'+
'attribute vec3 position;\n'+
'attribute float weight;\n'+
'attribute float color;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying vec4 vColor;\n'+
'varying float vIsDiscarded;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl>\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl>\n'+
'\n'+
'    vec3 rgb = floatColorToRGB(isPickingMesh ? vertexDataPointIndex : color);\n'+
'    // TODO (sunny): we are using only 24 out of 32 available bits\n'+
'    vColor = vec4(rgb.r, rgb.g, rgb.b, isPickingMesh ? 1.0 : uOpacity);\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>\n'+
'\n'+
'    float radius = mix(uMinBubbleRadius, uMaxBubbleRadius, weight);\n'+
'\n'+
'    float distanceFromCamera = length(vVertexViewSpacePosition);\n'+
'    if (distanceFromCamera > 1.0) {\n'+
'        radius /= distanceFromCamera;\n'+
'    }\n'+
'\n'+
'    if (isHighlighted) {\n'+
'        gl_PointSize = radius * mix(1.0, POINT_ON_HOVER_SCALE, uHighlightTransitionInterval);\n'+
'    } else if (wasHighlighted) {\n'+
'        gl_PointSize = radius * mix(POINT_ON_HOVER_SCALE, 1.0, uHighlightTransitionInterval);\n'+
'    } else {\n'+
'        gl_PointSize = radius;\n'+
'    }\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-feature.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-feature.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform vec3 uColor;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'    gl_FragColor = vec4(uColor.r, uColor.g, uColor.b, 0.75);\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_METRIC_NEAR : FRAG_DEPTH_METRIC_FAR);\n'+
'#endif\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-feature.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-feature.vertex.glsl', 'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'attribute vec3 position;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-surface.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-surface.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'\n'+
'varying float vIsDiscarded;\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'\n'+
'void main() {\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>\n'+
'\n'+
'    gl_FragColor = vec4(0.13, 0.13, 0.13, 1.0);\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_EARTH_NEAR : FRAG_DEPTH_EARTH_FAR);\n'+
'#endif\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-surface.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-surface.vertex.glsl', 'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'attribute vec3 position;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vIsDiscarded;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-tiles.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-tiles.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'uniform float uZoomLevel;\n'+
'uniform sampler2D uTileTextures[MAX_NUM_TILES];\n'+
'// x-index, y-index of ith corresponding texture in the textures array\n'+
'uniform vec2 uTextureTileXYIndices[MAX_NUM_TILES];\n'+
'\n'+
'\n'+
'varying float vIsDiscarded;\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying vec3 vPosition;\n'+
'\n'+
'void main() {\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>\n'+
'\n'+
'    float numTiles = pow(2.0, uZoomLevel);\n'+
'\n'+
'    float fragmentX = ((vPosition.x + WIDTH * 0.5)/WIDTH) * numTiles;\n'+
'    float fragmentY = numTiles - ((vPosition.y + HEIGHT * 0.5)/HEIGHT) * numTiles;\n'+
'\n'+
'    float tileX = floor(fragmentX);\n'+
'    float tileY = floor(fragmentY);\n'+
'    vec2 tileXY = vec2(tileX, tileY);\n'+
'\n'+
'    gl_FragColor = vec4(0.0);\n'+
'\n'+
'    for (int i=0; i<MAX_NUM_TILES; ++i) {\n'+
'        vec2 textureTileXY = uTextureTileXYIndices[i];\n'+
'        if (textureTileXY == tileXY) {\n'+
'            float fragmentTileU = fragmentX - tileX;\n'+
'            float fragmentTileV = fragmentY - tileY;\n'+
'\n'+
'            vec4 color = texture2D(uTileTextures[i], vec2(fragmentTileU, 1.0 - fragmentTileV));\n'+
'            //float gray = dot(vec3(0.375, 0.5, 0.125), color.rgb);\n'+
'            //gl_FragColor = vec4(gray, gray, gray, 0.85);\n'+
'            float luminance = dot(color, vec4(0.2126, 0.7152, 0.0722, 0.0));\n'+
'            gl_FragColor = vec4(luminance, luminance, luminance, 0.5);\n'+
'\n'+
'            break;\n'+
'        }\n'+
'    }\n'+
'\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_EARTH_TILES_NEAR : FRAG_DEPTH_EARTH_TILES_FAR);\n'+
'#endif\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-tiles.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/earth-tiles.vertex.glsl', 'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'attribute vec3 position;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vIsDiscarded;\n'+
'varying vec2 vUv;\n'+
'varying vec3 vPosition;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>\n'+
'\n'+
'    if (isEarthGlobe() || uProjectionMix != 1.0) {\n'+
'        vPosition = getMapCoordinates(position);\n'+
'    } else {\n'+
'        vPosition = worldCoords.xyz;\n'+
'    }\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/graph/graph-edge.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/graph/graph-edge.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vVertexHiddenState;\n'+
'varying float vIsDiscarded;\n'+
'varying vec3 vColor;\n'+
'varying float vWeight;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main(){\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>\n'+
'\n'+
'    if (vVertexHiddenState == 1.0) {\n'+
'        discard;\n'+
'    }\n'+
'\n'+
'    gl_FragColor = vec4(vColor.r, vColor.g, vColor.b, /*vWeight*/1.0);\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_METRIC_NEAR : FRAG_DEPTH_METRIC_FAR);\n'+
'#endif\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/graph/graph-edge.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/graph/graph-edge.vertex.glsl', 'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'uniform float uMinBarHeight;\n'+
'uniform float uMaxBarHeight;\n'+
'\n'+
'attribute vec3 position;\n'+
'attribute float featureWeight;\n'+
'attribute float featureColor;\n'+
'attribute float vertexHiddenState;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying vec2 vPosition;\n'+
'varying vec3 vColor;\n'+
'varying float vVertexHiddenState;\n'+
'varying float vIsDiscarded;\n'+
'varying float vWeight;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl>\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl>\n'+
'\n'+
'    vPosition = position.xy;\n'+
'    vColor = isHighlighted ? HIGHLIGHT_COLOR.rgb : floatColorToRGB(isPickingMesh ? vertexDataPointIndex : featureColor);\n'+
'    vWeight = featureWeight;\n'+
'\n'+
'    vec3 vertexPosition = position;\n'+
'    if (isHighlighted) {\n'+
'        vertexPosition.z *= mix(1.0, EDGE_ON_HOVER_SCALE, uHighlightTransitionInterval);\n'+
'    } else if (wasHighlighted) {\n'+
'        vertexPosition.z *= mix(EDGE_ON_HOVER_SCALE, 1.0, uHighlightTransitionInterval);\n'+
'    }\n'+
'\n'+
'    vVertexHiddenState = vertexHiddenState;\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-blending-texture.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-blending-texture.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vIsDiscarded;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main()	{\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>\n'+
'\n'+
'    float distanceFromCenter = length(vec2(gl_PointCoord.s - 0.5, gl_PointCoord.t - 0.5));\n'+
'    if (distanceFromCenter > 0.5) {\n'+
'        discard;\n'+
'    }\n'+
'\n'+
'    float relativeDistanceFromCenter = distanceFromCenter/0.5;\n'+
'    // TODO (sunny): consider doing a gaussian blur rather than this naive radial blur\n'+
'    float alpha = 1.0 - relativeDistanceFromCenter;\n'+
'\n'+
'    gl_FragColor = vec4(0, 0, 0, alpha);\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? gl_FragCoord.z : FRAG_DEPTH_METRIC_FAR);\n'+
'#endif\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-blending-texture.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-blending-texture.vertex.glsl', 'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'uniform float pointSize;\n'+
'\n'+
'attribute vec3 position;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vIsDiscarded;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl>\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main()	{\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl>\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-point-sizing.vertex.glsl>\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-feature.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-feature.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'\n'+
'uniform sampler2D colorGradientTexture;\n'+
'uniform sampler2D blendingTexture;\n'+
'uniform vec2 blendingTextureSize;\n'+
'uniform float uIsPickingMesh;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vWeight;\n'+
'varying float vIsDiscarded;\n'+
'varying float vVertexDataPointIndex;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main()	{\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>\n'+
'\n'+
'    float distanceFromCenter = length(vec2(gl_PointCoord.s - 0.5, gl_PointCoord.t - 0.5));\n'+
'    if (distanceFromCenter > 0.5) {\n'+
'        discard;\n'+
'    }\n'+
'\n'+
'    bool isPickingMesh = uIsPickingMesh == 1.0;\n'+
'    if (isPickingMesh) {\n'+
'        vec3 rgb = floatColorToRGB(vVertexDataPointIndex);\n'+
'        gl_FragColor = vec4(rgb.r, rgb.g, rgb.b, 1.0);\n'+
'    } else {\n'+
'\n'+
'        vec2 texelPosition = vec2(gl_FragCoord.x/blendingTextureSize.x, gl_FragCoord.y/blendingTextureSize.y);\n'+
'        vec4 textureRGBA = texture2D(blendingTexture, texelPosition);\n'+
'        if (textureRGBA.w == 0.0) {\n'+
'            discard;\n'+
'        }\n'+
'\n'+
'        // this factor adds anti-aliasing effect on the edges of the point\n'+
'        float edgeAlphaFactor = 1.0;\n'+
'        if (distanceFromCenter >= 0.4) {\n'+
'            edgeAlphaFactor = ((0.5 - distanceFromCenter)/(0.5 - 0.4));\n'+
'        }\n'+
'\n'+
'        vec4 heatMapRGBA = texture2D(colorGradientTexture, vec2(textureRGBA.w, 0.5));\n'+
'        gl_FragColor = vec4(heatMapRGBA.x, heatMapRGBA.y, heatMapRGBA.z, vWeight * edgeAlphaFactor);\n'+
'    }\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_METRIC_NEAR : FRAG_DEPTH_METRIC_FAR);\n'+
'#endif\n'+
'\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-feature.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-feature.vertex.glsl', 'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'uniform float pointSize;\n'+
'\n'+
'attribute vec2 uv;\n'+
'\n'+
'attribute vec3 position;\n'+
'attribute float weight;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vWeight;\n'+
'varying vec2 vUv;\n'+
'varying float vIsDiscarded;\n'+
'varying float vVertexDataPointIndex;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-variables.vertex.glsl>\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main()	{\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/pickable/pickable-main.vertex.glsl>\n'+
'\n'+
'    vWeight = weight;\n'+
'    vVertexDataPointIndex = vertexDataPointIndex;\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-point-sizing.vertex.glsl>\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-point-sizing.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/heat-map/heat-map-point-sizing.vertex.glsl', '/*BEGIN_BLINK_SHADER_LITERAL\n'+
'\n'+
'if (isHighlighted) {\n'+
'    gl_PointSize = pointSize * mix(1.0, POINT_ON_HOVER_SCALE, uHighlightTransitionInterval);\n'+
'} else if (wasHighlighted) {\n'+
'    gl_PointSize = pointSize * mix(POINT_ON_HOVER_SCALE, 1.0, uHighlightTransitionInterval);\n'+
'} else {\n'+
'    gl_PointSize = pointSize;\n'+
'}\n'+
'\n'+
'END_BLINK_SHADER_LITERAL*/\n'+
'\n'+
'\n'+
'\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-boundary.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-boundary.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform vec4 uLineColor;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vVertexHiddenState;\n'+
'varying float vIsDiscarded;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main(){\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>\n'+
'\n'+
'    if (vVertexHiddenState == 1.0) {\n'+
'        discard;\n'+
'    }\n'+
'\n'+
'    gl_FragColor = uLineColor;\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_TOPO_BOUNDARY_NEAR : FRAG_DEPTH_TOPO_BOUNDARY_FAR);\n'+
'#endif\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-boundary.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-boundary.vertex.glsl', 'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'attribute vec3 position;\n'+
'attribute float vertexHiddenState;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vVertexHiddenState;\n'+
'varying float vIsDiscarded;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main(){\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>\n'+
'\n'+
'    vVertexHiddenState = vertexHiddenState;\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-shape.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-shape.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision highp float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform float uHighlightedFeatureIndex;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vVertexFeatureIndex;\n'+
'varying vec4 vColor;\n'+
'varying float vIsDiscarded;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main(){\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>\n'+
'\n'+
'    bool isHighlighted = int(vVertexFeatureIndex) == int(uHighlightedFeatureIndex);\n'+
'    gl_FragColor = isHighlighted ? HIGHLIGHT_COLOR : vColor;\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragDepthEXT = gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_TOPO_SHAPE_NEAR : FRAG_DEPTH_TOPO_SHAPE_FAR);\n'+
'#endif\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-shape.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/topo-shape.vertex.glsl', 'precision highp float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'uniform float uHighlightedFeatureIndex;\n'+
'uniform float uOpacity;\n'+
'\n'+
'attribute vec3 position;\n'+
'attribute float vertexHiddenState;\n'+
'attribute float vertexFeatureIndex;\n'+
'attribute float color;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vVertexFeatureIndex;\n'+
'varying vec4 vColor;\n'+
'varying float vIsDiscarded;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main(){\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>\n'+
'\n'+
'    vVertexFeatureIndex = vertexFeatureIndex;\n'+
'\n'+
'    vec3 rgb = floatColorToRGB(color);\n'+
'    vColor = vec4(rgb.r, rgb.g, rgb.b, (vertexHiddenState == 1.0 || color == 0.0) ? 0.0 : uOpacity);\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>\n'+
'\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/viewport-computer/viewport-computer.fragment.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/viewport-computer/viewport-computer.fragment.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform float uIsLatitudeViewportComputer;\n'+
'\n'+
'varying float vIsDiscarded;\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying vec3 vPosition;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.fragment.glsl>\n'+
'\n'+
'    float latRange = MAX_LATITUDE_MERCATOR - MIN_LATITUDE_MERCATOR;\n'+
'    float lonRange = MAX_LONGITUDE_2D - MIN_LONGITUDE_2D;\n'+
'\n'+
'    gl_FragColor = floatToVec4(\n'+
'        uIsLatitudeViewportComputer == 1.0\n'+
'            ? (vPosition.x - MIN_LATITUDE_MERCATOR)/latRange :\n'+
'                (vPosition.y - MIN_LONGITUDE_2D)/lonRange\n'+
'    );\n'+
'\n'+
'#ifdef GL_EXT_frag_depth\n'+
'    bool isCloserPOI = isCloserPointOfIntersectionOnGlobe(vVertexViewSpacePosition, vOriginViewSpacePosition);\n'+
'    gl_FragCoord.z - (isCloserPOI ? FRAG_DEPTH_EARTH_NEAR : FRAG_DEPTH_EARTH_FAR);\n'+
'#endif\n'+
'}\n');}]);
angular.module('src/modules/viz-layout/viz/chart/geomap/3d/shaders/viewport-computer/viewport-computer.vertex.glsl', []).run(['resourceCachingService', function(resourceCachingService) { resourceCachingService.putResource('src/modules/viz-layout/viz/chart/geomap/3d/shaders/viewport-computer/viewport-computer.vertex.glsl', '#extension GL_EXT_frag_depth : enable\n'+
'\n'+
'precision mediump float;\n'+
'precision mediump int;\n'+
'\n'+
'uniform mat4 modelViewMatrix;\n'+
'uniform mat4 projectionMatrix;\n'+
'\n'+
'attribute vec3 position;\n'+
'\n'+
'varying vec4 vVertexViewSpacePosition;\n'+
'varying vec4 vOriginViewSpacePosition;\n'+
'varying float vIsDiscarded;\n'+
'varying vec3 vPosition;\n'+
'\n'+
'#include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/vertex-shader-util.glsl>\n'+
'\n'+
'void main() {\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-discard/position-discard.vertex.glsl>\n'+
'\n'+
'    vPosition = position;\n'+
'\n'+
'    #include<src/modules/viz-layout/viz/chart/geomap/3d/shaders/base/position-computation.vertex.glsl>\n'+
'}\n');}]);
