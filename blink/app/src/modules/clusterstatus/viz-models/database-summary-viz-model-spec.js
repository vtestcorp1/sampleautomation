/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview tests for DatabaseSummaryVizModel.
 */

'use strict';

describe('DatabaseSummaryVizModel tests', function () {
    var DatabaseSummaryVizModel, MockData, jsonConstants;

    beforeEach(function () {
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
        inject(function ($injector) {
            DatabaseSummaryVizModel = $injector.get('DatabaseSummaryVizModel');
            jsonConstants = $injector.get('jsonConstants');
        });
    });

    it('should load database summary information', function() {
        var databaseSummaryVizModel = new DatabaseSummaryVizModel({});

        databaseSummaryVizModel.updateData(blink.app.fakeData.adminUI.fakeDatabaseSummary);
        expect(databaseSummaryVizModel.getStatus()).toEqual('READY');
        expect(databaseSummaryVizModel.getNumReadyTables()).toEqual(54);
        expect(databaseSummaryVizModel.getNumRows()).toEqual(3188);
        expect(databaseSummaryVizModel.getNumInProgressTables()).toEqual(0);
        expect(databaseSummaryVizModel.getNumStaleTables()).toEqual(0);
        expect(databaseSummaryVizModel.getNumErrorTables()).toEqual(0);
        expect(databaseSummaryVizModel.getLastUpdateTime()).toEqual('Nov 03, 2015, 2:08:12 PM PST');
        expect(databaseSummaryVizModel.getNumLoadedInLastDay()).toEqual(54);
    });
});
