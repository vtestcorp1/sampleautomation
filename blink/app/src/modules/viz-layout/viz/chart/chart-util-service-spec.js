/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Unit test for chart util service.
 */

'use strict';

describe('ChartUtilService', function () {
    var chartUtilService;
    var constants, blinkStrings;

    beforeEach(function () {
        module('blink.app');
        inject(function ($injector) {
            chartUtilService = $injector.get('chartUtilService');
            constants = $injector.get('blinkConstants');
            blinkStrings = $injector.get('strings');
        });
    });

    it("should check correctly duplicate x values", function() {
        var seriesWithXDuplicate = [{
            data: [{x: 1, y: 1}]
        }, {
            data: [{x: 1, y: 12}]
        }];
        var seriesWithoutXDuplicate = [{
            data: [{x: 1, y: 1}]
        }, {
            data: [{x: 12, y: 1}]
        }];

        expect(chartUtilService.checkForXDuplicateAcrossAllSeries(seriesWithXDuplicate)).toBeTruthy();
        // we expect an empty array to have no duplicate
        expect(chartUtilService.checkForXDuplicateAcrossAllSeries([])).toBeFalsy();
        expect(chartUtilService.checkForXDuplicateAcrossAllSeries(seriesWithoutXDuplicate)).toBeFalsy();
    });

    it("should check legend orientation correctly base off of chart height", function() {
        //With height below vertical legend threshold (return true)
        var isGeoMapChartType = false;
        var legendCardinality = 3;
        var chartSize = constants.tileSizes.LARGE;
        var chartDimensions = {
            width: 1000,
            height: 479
        };

        expect(chartUtilService.isLegendVertical(
            isGeoMapChartType,
            chartDimensions,
            legendCardinality,
            chartSize
        )).toBeTruthy();

        //With height above vertical legend threshold (return false)
        chartDimensions.height = 481;

        expect(chartUtilService.isLegendVertical(
            isGeoMapChartType,
            chartDimensions,
            legendCardinality,
            chartSize
        )).toBeFalsy();
    });
});
