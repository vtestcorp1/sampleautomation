/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview tests for SearchSummaryVizModel.
 */

'use strict';

describe('SearchSummaryVizModel tests', function () {
    var SearchSummaryVizModel, MockData;

    beforeEach(function() {
        module('blink.app');
        module(function ($provide) {
            $provide.value('VisualizationModel', angular.noop);
            $provide.value('session', {
                getInfo: function() {
                    return {
                        timezone: 'America/Los_Angeles'
                    };
                }
            });
        });
        inject(function($injector) {
            SearchSummaryVizModel = $injector.get('SearchSummaryVizModel');
        });
    });

    it('should load mock search summary from JSON object', function () {
        var searchSummaryVizModel = new SearchSummaryVizModel({});
        expect(searchSummaryVizModel.getStatus()).toEqual('');
        expect(searchSummaryVizModel.getLastBuildFinishTime()).toEqual('Dec 31, 1969, 4:00:00 PM PST');
        expect(searchSummaryVizModel.getFailTime()).toEqual(0);
        expect(searchSummaryVizModel.getFailReason()).toEqual('');

        searchSummaryVizModel.updateData(blink.app.fakeData.adminUI.fakeSearchSummary);
        expect(searchSummaryVizModel.getStatus()).toEqual('BUILDING AND NOT READY');
        expect(searchSummaryVizModel.getNumReadyTables()).toEqual(49);
        expect(searchSummaryVizModel.getNumBuildingAndServing()).toEqual(0);
        expect(searchSummaryVizModel.getNumBuildingAndNotServing()).toEqual(0);
        expect(searchSummaryVizModel.getNumWorkers()).toEqual(3);
        expect(searchSummaryVizModel.getNumTokens()).toEqual(11865330);
        expect(searchSummaryVizModel.getLastBuildFinishTime()).toEqual('Nov 03, 2015, 2:08:17 PM PST');
        expect(searchSummaryVizModel.getFailTime()).toEqual(0);
        expect(searchSummaryVizModel.getFailReason()).toEqual('TEST');
        expect(searchSummaryVizModel.getFailTimeHumanReadable()).toEqual('Dec 31, 1969, 4:00:00 PM PST');
    });
});
