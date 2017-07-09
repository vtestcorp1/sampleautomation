/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class representing config per chart for chart configurations.
 */

import {Provide} from '../../../base/decorators';
@Provide('AllowedChartConfigurationsConfig')
export class AllowedChartConfigurationsConfig {
    constructor(public geoProjectionType: boolean,
                public showYAxisAsPercent: boolean,
                public overlayHeatMap: boolean,
                public zoomPanStateToggle: boolean,
                public showDataLabels: boolean,
                public yAxisRange: boolean
    ) {}
}
