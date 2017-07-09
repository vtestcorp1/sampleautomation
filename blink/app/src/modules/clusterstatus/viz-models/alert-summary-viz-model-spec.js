/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview tests for AlertSummaryVizModel.
 */

'use strict';

describe('AlertSummaryVizModel tests', function () {
    var AlertSummaryVizModel, MockData;

    beforeEach(function() {
        module('blink.app');
        module(function ($provide) {
            $provide.value('VisualizationModel', angular.noop);
        });
        inject(function($injector) {
            AlertSummaryVizModel = $injector.get('AlertSummaryVizModel');
        });
    });

    it('should load single valid alert information from JSON object successfully', function () {
        var alertSummaryVizModel = new AlertSummaryVizModel({});

        expect(alertSummaryVizModel.getNumAlerts()).toBe(0);

        alertSummaryVizModel.updateData(blink.app.fakeData.adminUI.fakeSingleAlert);

        expect(alertSummaryVizModel.getNumAlerts()).toBe(0);
        expect(alertSummaryVizModel.getAlerts().length).toBe(0);
        expect(alertSummaryVizModel.getRecentAlerts().length).toBe(0);
    });

    it('should load multiple valid alert information from JSON object successfully',  function () {
        var alertSummaryVizModel = new AlertSummaryVizModel({});

        alertSummaryVizModel.updateData(blink.app.fakeData.adminUI.fakeMultipleAlerts);

        expect(alertSummaryVizModel.getNumAlerts()).toBe(0);
        expect(alertSummaryVizModel.getAlerts().length).toBe(0);
        expect(alertSummaryVizModel.getRecentAlerts().length).toBe(0);
    });

    it('should load empty JSON object successfully', function () {
        var alertSummaryVizModel = new AlertSummaryVizModel({});

        alertSummaryVizModel.updateData(blink.app.fakeData.adminUI.fakeEmptyAlert);

        expect(alertSummaryVizModel.getNumAlerts()).toBe(0);
        expect(alertSummaryVizModel.getAlerts()).toEqual([]);
        expect(alertSummaryVizModel.getRecentAlerts()).toEqual([]);
    });

});
