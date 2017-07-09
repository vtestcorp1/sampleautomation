/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Class to represent mapping of visualization columns to chart axes.
 */

'use strict';

import {ngRequire, Provide} from 'src/base/decorators';
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';

let util = ngRequire('util');

@Provide('ChartAxisConfig')
export class ChartAxisConfig {
    public xAxisColumns: Array<VisualizationColumnModel>;
    public yAxisColumns: Array<VisualizationColumnModel>;
    public legendColumns: Array<VisualizationColumnModel>;
    public radialColumn: VisualizationColumnModel;

    constructor (
        xAxisColumns: Array<VisualizationColumnModel> = [],
        yAxisColumns: Array<VisualizationColumnModel> = [],
        legendColumns: Array<VisualizationColumnModel> = [],
        radialColumn: VisualizationColumnModel = null
    ) {
        this.xAxisColumns = xAxisColumns;
        this.yAxisColumns = yAxisColumns;
        this.legendColumns = legendColumns;
        this.radialColumn = radialColumn;
    }

    public isAxisConfigEqual(axisConfig : ChartAxisConfig) {
        var keysToCompare = [
            'xAxisColumns',
            'yAxisColumns',
            'legendColumns'
        ];

        for(var i = 0; i< keysToCompare.length; i++) {
            var key = keysToCompare[i];
            var isEqual = util.areArraysEqual(
                axisConfig[key],
                this[key],
                (column : VisualizationColumnModel) => {
                    return column.getSageOutputColumnId();
                }
            );
            if(!isEqual) {
                return false;
            }
        }

        if(axisConfig.radialColumn !== this.radialColumn) {
            return false;
        }

        return true;
    }
}
