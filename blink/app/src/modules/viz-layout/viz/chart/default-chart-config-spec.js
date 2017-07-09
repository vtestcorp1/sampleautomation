/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for chart default config service
 */

'use strict';

describe('Chart Model default configuration service', function (){
    var chartModelTestUtilService, defaultChartConfigService, ChartModel;

    function initSuite() {
        beforeEach(function() {
            module('blink.app');
            // This load will override the real definitions with the mocks specified above.
            inject(function($injector) {
                // TODO(Jasmeet): Remove dependency from chartModelTestUtilService.
                chartModelTestUtilService = $injector.get('chartModelTestUtilService');
                defaultChartConfigService = $injector.get('defaultChartConfigService');
                ChartModel = $injector.get('ChartModel');
            });
        });
    }

    describe('chart configuration', function() {
        initSuite();

        var DEFAULT_CHART_TYPE_MAPPING = [
            ['1Mx1A, non-timeseries', 1, 1, ['VARCHAR'], [null], ['attr'], ['measure'], undefined, undefined, 'COLUMN', [['attr'], ['measure'], [], null]],
            ['1Mx1A, state-level-map', 1, 1, ['VARCHAR'], [{type: 'ADMIN_DIV_1'}], ['attr'], ['measure'], undefined, undefined, 'GEO_AREA', [['attr'], ['measure'], [], null]],
            ['1Mx1A, non-timeseries', 1, 1, ['VARCHAR'], [{type: 'LATITUDE'}], ['attr'], ['measure'], undefined, undefined, 'COLUMN', [['attr'], ['measure'], [], null]],
            ['1Mx1A zipcode-level-map', 1, 1, ['VARCHAR'], [{type: 'ZIP_CODE'}], ['attr'], ['measure'], void 0, void 0, 'GEO_BUBBLE', [['attr'], ['measure'], [], null]],
            ['1Mx1T, timeseries', 1, 1, ['DATE'], [], ['attr'], ['measure'], undefined, undefined, 'LINE', [['attr'], ['measure'], [], null]],
            ['1Mx1Ax1T, timeseries', 1, 2, ['DATE', 'VARCHAR'], [], ['attr-date', 'attr-non-date'], ['measure'], undefined, undefined, 'LINE', [['attr-date'], ['measure'], ['attr-non-date'], null]],
            ['1Mx2A, column case 1', 1, 2, ['VARCHAR', 'VARCHAR'], [], ['attr1', 'attr2'], ['measure'], [5, 9], undefined, 'COLUMN', [['attr2'], ['measure'], ['attr1'], null]],
            ['1Mx2A, column case 2', 1, 2, ['VARCHAR', 'VARCHAR'], [], ['attr1', 'attr2'], ['measure'], [41, 45], undefined, 'COLUMN', [['attr2'], ['measure'], [], null]],
            ['1Mx2A, stacked case 1', 1, 2, ['VARCHAR', 'VARCHAR'], [], ['attr1', 'attr2'], ['measure'], [29, 31], undefined, 'STACKED_COLUMN', [['attr2'], ['measure'], ['attr1'], null]],
            ['1Mx2A, stacked case 2', 1, 2, ['VARCHAR', 'VARCHAR'], [], ['attr1', 'attr2'], ['measure'], [13, 14], undefined, 'STACKED_COLUMN', [['attr2'], ['measure'], ['attr1'], null]],
            ['1Mx2Ax1T, timeseries', 1, 3, ['VARCHAR', 'DATE', 'VARCHAR'], [], ['attr-non-date1', 'attr-date', 'attr-non-date2'], ['measure'], [4, 6, 5], undefined, 'LINE', [['attr-date'], ['measure'], ['attr-non-date1', 'attr-non-date2'], null]],
            ['1Mx3A, no timeseries', 1, 3, ['VARCHAR', 'VARCHAR', 'VARCHAR'], [], ['attr1', 'attr2', 'attr3'], ['measure'], [4, 6, 5], undefined, null, [[], [], [], null]],
            ['2Mx1T, timseries', 2, 1, ['DATE'], [], ['attr'], ['measure1', 'measure2'], [6], undefined, 'LINE', [['attr'], ['measure1', 'measure2'], [], null]],
            ['2Mx1A, low cardinality column chart', 2, 1, ['VARCHAR'], [], ['attr'], ['measure1', 'measure2'], [29], [1, 1], 'COLUMN', [['attr'], ['measure1', 'measure2'], [], null]],
            ['2Mx1A, high cardinality scatter chart', 2, 1, ['VARCHAR'], [], ['attr'], ['measure1', 'measure2'], [41], [1, 1000], 'SCATTER', [['measure1'], ['measure2'], [], null]],
            ['2Mx1Ax1T, at least one attr timeseries', 2, 1, ['DATE', 'VARCHAR'], [], ['attr1', 'attr2'], ['measure1', 'measure2'], [6, 4], [1, 1], 'LINE', [['attr1'], ['measure1', 'measure2'], [], null]],
            ['2Mx2T, both attr timeseries', 2, 2, ['DATE', 'DATE'], [], ['attr1', 'attr2'], ['measure1', 'measure2'], [6, 5], [1, 1], 'LINE', [['attr1'], ['measure1', 'measure2'], [], null]],
            ['2Mx2A, both attr cardinality high', 2, 2, ['VARCHAR', 'VARCHAR'], [], ['attr1', 'attr2'], ['measure1', 'measure2'], [6, 6], [1, 1], 'SCATTER', [['measure1'], ['measure2'], ['attr1', 'attr2'], null]],
            ['3Mx1T, ', 3, 1, ['DATE'], [], ['attr'], ['measure1', 'measure2', 'measure3'], [6], [1000, 1, 1], 'LINE', [['attr'], ['measure1', 'measure2', 'measure3'], [], null]],
            ['3Mx1A, column chart', 3, 1, ['VARCHAR'], [], ['attr'], ['measure1', 'measure2', 'measure3'], [10], [1000, 1, 1], 'COLUMN', [['attr'], ['measure1','measure2', 'measure3'], [], null]],
            ['3Mx1A, bubble chart', 3, 1, ['VARCHAR'], [], ['attr'], ['measure1', 'measure2', 'measure3'], [11], [1, 1000, 1], 'BUBBLE', [['measure1'], ['measure2'], ['attr'], 'measure3']],
            ['3Mx1Ax1T, ', 3, 2, ['DATE', 'VARCHAR'], [], ['attr-date', 'attr-non-date'], ['measure1', 'measure2', 'measure3'], [6, 7], [1000, 1, 1], 'LINE', [['attr-date'], ['measure1', 'measure2', 'measure3'], [], null]],
            ['3Mx2A, ', 3, 2, ['VARCHAR', 'VARCHAR'], [], ['attr1', 'attr2'], ['measure1', 'measure2', 'measure3'], [39, 100], [1000, 1, 1], 'BUBBLE', [['measure1'], ['measure2'], ['attr1'], 'measure3' ]],
            ['4Mx1A, bubble chart', 4, 1, ['VARCHAR'], [], ['attr1'], ['measure1', 'measure2', 'measure3', 'measure4'], [11], [100, 100000, 1, 1], 'BUBBLE', [['measure2'], ['measure3'], ['attr1'], 'measure4']],
            ['4Mx1T, line chart', 4, 1, ['DATE'], [], ['date'], ['measure1', 'measure2', 'measure3', 'measure4'], [9], [100, 100000, 1, 1], 'LINE', [['date'], ['measure1', 'measure2', 'measure3', 'measure4'], [], null]],
            ['4Mx1A, column chart', 4, 1, ['VARCHAR'], [], ['attr1'], ['measure1', 'measure2', 'measure3', 'measure4'], [8], [100, 100000, 1, 1], 'COLUMN', [['attr1'], ['measure1', 'measure2', 'measure3', 'measure4'], [], null]],
            ['5Mx1A, no chart', 5, 1, ['VARCHAR'], [], ['attr1'], ['measure1', 'measure2', 'measure3', 'measure4', 'measure5'], [8], [100, 100000, 1, 1], null, [[], [], [], null]],
        ];

        DEFAULT_CHART_TYPE_MAPPING.forEach(function(config){
            var testCaseName = config[0],
                numMeasures = config[1],
                numAttributes = config[2],
                attributeDataTypes = config[3],
                attributeGeoConfigs = config[4],
                attributeNames = config[5],
                measureNames = config[6],
                attributeCardinalities = config[7],
                measureMinValues = config[8],
                chartType = config[9],
                axisColMapping = config[10];

            it(testCaseName, function() {
                var chartData = chartModelTestUtilService.getChartModelData(numMeasures, numAttributes, undefined, attributeDataTypes, attributeGeoConfigs, attributeNames, measureNames, attributeCardinalities, measureMinValues),
                    allColumns = chartData.allColumns;

                var chartModel = new ChartModel({
                    vizJson: chartData.vizJson,
                    allColumns: allColumns
                });

                var defaultConfig = defaultChartConfigService.getDefaultAxisConfigAndChartType(chartModel);

                expect(defaultConfig.chartType).toBe(chartType);
                if (chartType) {
                    expect(defaultConfig.axisConfig.xAxisColumns.map('getName')).toEqual(axisColMapping[0]);
                    expect(defaultConfig.axisConfig.yAxisColumns.map('getName')).toEqual(axisColMapping[1]);
                    expect(defaultConfig.axisConfig.legendColumns.map('getName')).toEqual(axisColMapping[2]);
                    expect(
                        defaultConfig.axisConfig.radialColumn
                        && defaultConfig.axisConfig.radialColumn.getName()
                    ).toEqual(axisColMapping[3]);
                }
            });
        });
    });
});
