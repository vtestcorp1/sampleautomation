/*BEGIN_BLINK_SHADER_LITERAL

vec3 worldCoords = convertLatLongAltToXYZ(position);
vVertexViewSpacePosition = modelViewMatrix * vec4(worldCoords, 1.0);
// TODO: make this a uniform
vOriginViewSpacePosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);

gl_Position = projectionMatrix * vVertexViewSpacePosition;

END_BLINK_SHADER_LITERAL*/