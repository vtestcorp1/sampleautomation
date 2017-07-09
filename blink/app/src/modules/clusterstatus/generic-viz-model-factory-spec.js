/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview tests for GenericVizModelFactory.
 */

'use strict';

describe('GenericVizModelFactory tests', function () {
    var genericVizModelFactory;

    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            $provide.value('VisualizationModel', angular.noop);
            $provide.value('SearchSummaryVizModel', function () {
                this.type = 'SearchSummary';
            });
            $provide.value('DatabaseSummaryVizModel', function () {
                this.type = 'DatabaseSummary';
            });
            $provide.value('ClusterSummaryVizModel', function () {
                this.type = 'ClusterSummary';
            });
            $provide.value('AlertSummaryVizModel', function () {
                this.type = 'AlertSummary';
            });
        });
        inject(function ($injector) {
            genericVizModelFactory = $injector.get('genericVizModelFactory');
        });
    });

    it('should create generic viz with correct subtype', function() {
        var vizContent;
        vizContent = {};
        expect(genericVizModelFactory.createGenericVizModel('INVALID', vizContent)).toBeNull();

        vizContent = {
            vizType: 'GENERIC_VIZ',
            vizSubtype: 'SEARCH_SUMMARY_VIZ'
        };
        var genericVizModel = genericVizModelFactory.createGenericVizModel(vizContent.vizSubtype, vizContent);
        expect(genericVizModel.type).toBe('SearchSummary');

        vizContent = {
            vizType: 'GENERIC_VIZ',
            vizSubtype: 'DATABASE_SUMMARY_VIZ'
        };
        genericVizModel = genericVizModelFactory.createGenericVizModel(vizContent.vizSubtype, vizContent);
        expect(genericVizModel.type).toBe('DatabaseSummary');

        vizContent = {
            vizType: 'GENERIC_VIZ',
            vizSubtype: 'CLUSTER_SUMMARY_VIZ'
        };
        genericVizModel = genericVizModelFactory.createGenericVizModel(vizContent.vizSubtype, vizContent);
        expect(genericVizModel.type).toBe('ClusterSummary');

        vizContent = {
            vizType: 'GENERIC_VIZ',
            vizSubtype: 'ALERT_SUMMARY_VIZ'
        };
        genericVizModel = genericVizModelFactory.createGenericVizModel(vizContent.vizSubtype, vizContent);
        expect(genericVizModel.type).toBe('AlertSummary');

    });
});
