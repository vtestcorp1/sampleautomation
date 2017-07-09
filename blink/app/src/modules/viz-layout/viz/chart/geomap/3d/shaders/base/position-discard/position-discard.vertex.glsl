/*BEGIN_BLINK_SHADER_LITERAL

bool isDiscarded = isDiscardedGeoPoint(position);
vIsDiscarded = isDiscarded ? 1.0 : 0.0;
if (isDiscarded) {
    return;
}

END_BLINK_SHADER_LITERAL*/
