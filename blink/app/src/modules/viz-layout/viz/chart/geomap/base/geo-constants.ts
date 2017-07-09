/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview A file to keep all the constant parameters used in geo code at one place.
 */

export const
    MAX_DEFAULT_ZOOM_ZIP_AND_POINT = 10,
    MAX_DEFAULT_ZOOM_OTHERS = 8,
    IMAGE_TILE_SIZE = 512,
    CHOROPLETH_DIV_2_BOUNDARY_COLOR = 'rgba(255, 255, 255, 0.2)',
    CHOROPLETH_DIV_1_BOUNDARY_COLOR = 'rgba(255, 255, 255, 0.3)',
    BACKGROUND_WORLD_MAP_BOUNDARY_COLOR = 'rgba(255, 255, 255, 0.4)',
    BACKGROUND_WORLD_MAP_FILL_COLOR = 'rgba(200, 200, 200, 0.6)',
    VIEW_PROJECTION = 'EPSG:3857',
    DATA_PROJECTION = 'EPSG:4326';

export const DEFAULT_BOUNDARY_COLOR = 'black';
export const DEFAULT_FILL_COLOR = 'transparent';

export const HOVERED_BOUNDARY_COLOR = 'black';

export const BOUNDARY_THICKNESS = 1;
export const HOVERED_BOUNDARY_THICKNESS = 2;

export const DEFAULT_BUBBLE_RADIUS = 8;
export const DEFAULT_BUBBLE_COLOR = 'red';
export const MIN_BUBBLE_RADIUS = 3;
export const ADMIN_DIV_0_AND_1_MAX_BUBBLE_SIZE = 15;
export const DEFAULT_MAX_BUBBLE_SIZE = 8;
export const GEO_AREA_OPACITY = 0.70;
export const BUBBLE_OPACITY = 0.5;

export const GEO_NEARBY_OBJECTS_LAYER_BOUNDARY_COLOR = 'rgba(246, 120, 120, 1.0)';

// See http://openlayers.org/en/latest/apidoc/ol.layer.Heatmap.html to learn what these
// parameters signify.
export const HEATMAP_GRADIENT_COLORS = ['#5768EB', '#8733DF', '#DE59D5', '#FF7033', '#FFCC00'];
export const HEATMAP_WEIGHT_BASE = 0.12;
export const HEATMAP_WEIGHT_FRACTION = 0.28;

export const
    DATA_LABEL_FILL_COLOR = '#444',
    DATA_LABEL_STROKE_COLOR = 'white',
    DATA_LABEL_STROKE_WIDTH = 0.5,
    DATA_LABEL_FONT = '12px Verdana',
    // Openlayers decide it, this is our guessed value based on the font size above.
    DATA_LABEL_LINE_HEIGHT = 15,
    // This too should be in proportion to the font size above.
    DATA_LABEL_AVG_CHAR_WIDTH = 8;

export const DEFAULT_GEO_DATA_NORMALIZER = (value: string|number) => {
    return ('' + value).trim().toLowerCase();
};

export const CUSTOM_REGION_FILE_CATEGORY = 'GEO_CUSTOM_REGION';
