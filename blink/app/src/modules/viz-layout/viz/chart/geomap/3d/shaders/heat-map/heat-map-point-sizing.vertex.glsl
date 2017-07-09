/*BEGIN_BLINK_SHADER_LITERAL

if (isHighlighted) {
    gl_PointSize = pointSize * mix(1.0, POINT_ON_HOVER_SCALE, uHighlightTransitionInterval);
} else if (wasHighlighted) {
    gl_PointSize = pointSize * mix(POINT_ON_HOVER_SCALE, 1.0, uHighlightTransitionInterval);
} else {
    gl_PointSize = pointSize;
}

END_BLINK_SHADER_LITERAL*/


