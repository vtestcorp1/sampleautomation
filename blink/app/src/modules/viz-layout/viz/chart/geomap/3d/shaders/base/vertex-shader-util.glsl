uniform int uProjectionType;
uniform float uProjectionMix;

#define FRAG_DEPTH_EARTH_TILES_NEAR 0.006
#define FRAG_DEPTH_EARTH_TILES_FAR 0.004
#define FRAG_DEPTH_EARTH_NEAR 0.0055
#define FRAG_DEPTH_EARTH_FAR 0.0045
#define FRAG_DEPTH_TOPO_BOUNDARY_NEAR 0.007
#define FRAG_DEPTH_TOPO_BOUNDARY_FAR 0.003
#define FRAG_DEPTH_METRIC_NEAR 0.01
#define FRAG_DEPTH_METRIC_FAR 0.0
#define FRAG_DEPTH_TOPO_SHAPE_NEAR 0.008
#define FRAG_DEPTH_TOPO_SHAPE_FAR 0.002

#define TOO_FAR 1000000.0

#define M_PI 3.1415926535897932384626433832795
#define EARTH_RADIUS 1.0

#define HEIGHT 4.0
#define WIDTH 4.0

// web mercator defines this constant
#define MAX_LATITUDE_MERCATOR 85.051129
#define MIN_LATITUDE_MERCATOR -85.051129
#define MIN_LATITUDE_DRAWN -63.21333

// we artificially extend longitudes to create some horizontal padding in flat maps
#define MIN_LONGITUDE_2D -180.0
#define MAX_LONGITUDE_2D 180.0
#define MIN_LONGITUDE_SPHERE -180.0
#define MAX_LONGITUDE_SPHERE 180.0

#define MIN_LATITUDE -90.0
#define MAX_LATITUDE 90.0

#define MAX_NUM_TILES 16

#define POINT_ON_HOVER_SCALE 1.5
#define BAR_ON_HOVER_SCALE 1.5
#define EDGE_ON_HOVER_SCALE 1.5

#define HIGHLIGHT_COLOR vec4(1.0, 1.0, 0.0, 0.55)


bool isEarthGlobe() {
    // the threshold on uProjectionMix is dervied for manual tuning
    // and reduces artifacts while changing projection type
    return uProjectionType == 0 && uProjectionMix >= 0.75;
}

bool isEarthMap() {
    return uProjectionType == 1;
}

bool isEarthPerspectivePlane() {
    return uProjectionType == 2;
}

// floatValue should be [0, 1]
// Source: http://stackoverflow.com/a/18454838
vec4 floatToVec4(float floatValue) {
    const vec4 bitSh = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
    const vec4 bitMsk = vec4(0.0,vec3(1.0/256.0));
    const vec4 bitShifts = vec4(1.0) / bitSh;

    vec4 comp = fract(floatValue * bitSh);
    comp -= comp.xxyz * bitMsk;
    return comp;
}

vec3 floatColorToRGB(float color) {
    float r = floor(color / 256.0 / 256.0);
    float g = floor((color - r * 256.0 * 256.0) / 256.0);
    float b = floor(color - r * 256.0 * 256.0 - g * 256.0);
    return vec3(r/255.0, g/255.0, b/255.0);
}

vec3 getGlobeCoordinates(vec3 latLongAlt) {
    float phi = (90.0 - latLongAlt.x) * M_PI/180.0;
    float theta = (180.0 - latLongAlt.y) * M_PI/180.0 + 180.0;

    float sinPhi = sin(phi);
    float cosPhi = cos(phi);
    float sinTheta = sin(theta);
    float cosTheta = cos(theta);

    float x = EARTH_RADIUS * sinPhi * cosTheta;
    float y = EARTH_RADIUS * cosPhi;
    float z = EARTH_RADIUS * sinPhi * sinTheta;

    return vec3(x, y, z) * ((1.0 + latLongAlt.z)/EARTH_RADIUS);
}

vec3 getMapCoordinates(vec3 latLongAlt) {
    float x = ((WIDTH/(MAX_LONGITUDE_2D - MIN_LONGITUDE_2D)) * latLongAlt.y);

    float latRad = latLongAlt.x * M_PI/180.0;
    float mercN = log(tan((M_PI/4.0) + (latRad/2.0)));
    float y = HEIGHT/2.0 - (((HEIGHT/2.0)-(WIDTH * mercN/(2.0 * M_PI))));

    return vec3(x, y, latLongAlt.z);
}

bool isDiscardedGeoPoint(vec3 latLongAlt) {
    if (isEarthGlobe()) {
        // no extra padding needed in globular earth
        return latLongAlt.y > MAX_LONGITUDE_SPHERE || latLongAlt.y < MIN_LONGITUDE_SPHERE;
    }
    return latLongAlt.x > MAX_LATITUDE_MERCATOR || latLongAlt.x < MIN_LATITUDE_DRAWN;
}

vec3 convertLatLongAltToXYZ(vec3 latLongAlt) {
    if (isDiscardedGeoPoint(latLongAlt)) {
        return vec3(TOO_FAR, TOO_FAR, TOO_FAR);
    }
    return mix(getMapCoordinates(latLongAlt), getGlobeCoordinates(latLongAlt), uProjectionMix);
}

bool isCloserPointOfIntersectionOnGlobe(vec4 vVertexViewSpacePosition, vec4 vOriginViewSpacePosition) {
    if (!isEarthGlobe()) {
        return true;
    }

    // We decide if this point is the closer of the two points that the ray from camera to this point
    // intersects the sphere by some simple 3d geometry (base on whether the perpendicular from the
    // center of the sphere intersects the ray after the point or before it). If the point is the
    // closer of the pair it gets a lower fragment depth so that it is always visible. Note that the
    // constants chosen here are related to the ones in the shaders of the sphere that represents the
    // solid earth. Together they ensure that for the points closer to the camera the topo layer is
    // at the top but for the points away from the camera the sphere is at the top (so that the inner
    // faces of the topo on the other end of the sphere are not visible from the front).
    float fragmentDistanceFromCamera = length(vVertexViewSpacePosition);
    float angle = dot(vVertexViewSpacePosition, vOriginViewSpacePosition);
    float radiusSquared = fragmentDistanceFromCamera * fragmentDistanceFromCamera;
    return abs(angle/radiusSquared) >= EARTH_RADIUS;
}