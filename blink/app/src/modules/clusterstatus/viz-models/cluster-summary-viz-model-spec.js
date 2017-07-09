/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview tests for ClusterSummaryVizModel.
 */

'use strict';

describe('ClusterSummaryVizModel tests', function () {
    var ClusterSummaryVizModel, MockData, jsonConstants, constants, adminUIMsg;

    beforeEach(function () {

        module('blink.app');
        module(function ($provide) {
            $provide.value('VisualizationModel', angular.noop);
        });
        inject(function ($injector) {
            ClusterSummaryVizModel = $injector.get('ClusterSummaryVizModel');
            jsonConstants = $injector.get('jsonConstants');
            constants = $injector.get('blinkConstants');
            adminUIMsg = $injector.get('strings');
        });
    });

    it('should load local cluster summary information', function() {
        var clusterSummaryVizModel = new ClusterSummaryVizModel({});
        expect(clusterSummaryVizModel.getClusterName()).toEqual('');
        expect(clusterSummaryVizModel.release).toEqual('');
        expect(clusterSummaryVizModel.getRelease()).toEqual(adminUIMsg.adminUI.messages.NOT_AVAILABLE_MESSAGE);
        expect(clusterSummaryVizModel.getNumNodes()).toEqual(0);

        clusterSummaryVizModel.updateData([blink.app.fakeData.adminUI.fakeLocalCluster, {}]);
        expect(clusterSummaryVizModel.getClusterName()).toEqual('local');
        expect(clusterSummaryVizModel.getNumNodes()).toEqual(3);
        expect(clusterSummaryVizModel.getRelease()).toEqual(adminUIMsg.adminUI.messages.NOT_AVAILABLE_MESSAGE);
    });

    it('should load distributed cluster summary information', function() {
        var clusterSummaryVizModel = new ClusterSummaryVizModel({});
        expect(clusterSummaryVizModel.getClusterName()).toEqual('');
        expect(clusterSummaryVizModel.release).toEqual('');
        expect(clusterSummaryVizModel.getRelease()).toEqual(adminUIMsg.adminUI.messages.NOT_AVAILABLE_MESSAGE);
        expect(clusterSummaryVizModel.getNumNodes()).toEqual(0);

        clusterSummaryVizModel.updateData([blink.app.fakeData.adminUI.fakeDistributedCluster, {}]);
        expect(clusterSummaryVizModel.getClusterName()).toEqual('dogfood');
        expect(clusterSummaryVizModel.getNumNodes()).toEqual(3);
        expect(clusterSummaryVizModel.getRelease()).toEqual('3.1.0');
    });
});
