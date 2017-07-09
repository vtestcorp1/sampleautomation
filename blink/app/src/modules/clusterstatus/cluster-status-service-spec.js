/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview tests for clusterStatusService.
 */

'use strict';

describe('service spec', function () {
    var $rootScope, $httpBackend, clusterStatusService;
    var ORION_PAGE = '/periscope/orion/getstats',
        FALCON_SUMMARY_PAGE = '/periscope/falcon/getsummary',
        SAGE_SUMMARY_PAGE = '/periscope/sage/getsummary',
        ALERT_PAGE = '/periscope/alert/getalerts',
        SNAPSHOT_PAGE = '/periscope/orion/listsnapshots';

    var alertService = {
        showUserActionFailureAlert: jasmine.createSpy()
    };
    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            $provide.value('alertService', alertService);
        });
        /* eslint camelcase: 1 */
        inject(function (_$rootScope_, _$httpBackend_, _clusterStatusService_, _alertConstants_) {
            alertService.alertConstants = angular.copy(_alertConstants_);
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            clusterStatusService = _clusterStatusService_;
        });
        /* eslint camelcase: 1 */
    });

    it('should respond correctly if sage data is received', function () {
        $httpBackend.when('GET', SAGE_SUMMARY_PAGE).respond('RESPOND');
        clusterStatusService.getSearchStatsSummary().then(function(data) {
            expect(data).toEqual('RESPOND');
        });
        $httpBackend.flush();
        $rootScope.$apply();
    });

    it('should receive alert if sage response is not correct', function () {
        $httpBackend.when('GET', SAGE_SUMMARY_PAGE).respond(401, 'Error Response message');
        clusterStatusService.getSearchStatsSummary();
        $httpBackend.flush();
        $rootScope.$apply();
        expect(alertService.showUserActionFailureAlert).toHaveBeenCalled();
    });

    it('should respond correctly if falcon data is received', function () {
        $httpBackend.when('GET', FALCON_SUMMARY_PAGE).respond('RESPOND');
        clusterStatusService.getDatabaseStatsSummary().then(function(data) {
            expect(data).toEqual('RESPOND');
        });
        $httpBackend.flush();
        $rootScope.$apply();
    });

    it('should receive alert if falcon response is not correct', function () {
        $httpBackend.when('GET', FALCON_SUMMARY_PAGE).respond(401, 'Error Response message');
        clusterStatusService.getDatabaseStatsSummary();
        $httpBackend.flush();
        $rootScope.$apply();
        expect(alertService.showUserActionFailureAlert).toHaveBeenCalled();
    });

    it('should respond correctly if orion data is received', function () {
        $httpBackend.when('GET', ORION_PAGE).respond('ORION');
        $httpBackend.when('GET', SNAPSHOT_PAGE).respond('SNAPSHOT');
        clusterStatusService.getClusterStatsSummary().then(function(data) {
            expect(data).toEqual(['ORION', 'SNAPSHOT']);
        });
        $httpBackend.flush();
        $rootScope.$apply();
    });

    it('should receive alert if orion response is not correct', function () {
        $httpBackend.when('GET', ORION_PAGE).respond(401, 'Error Response message');
        $httpBackend.when('GET', SNAPSHOT_PAGE).respond('SNAPSHOT');
        clusterStatusService.getClusterStatsSummary();
        $httpBackend.flush();
        $rootScope.$apply();
        expect(alertService.showUserActionFailureAlert).toHaveBeenCalled();
    });

    it('should respond correctly if alert data is received', function () {
        $httpBackend.when('GET', ALERT_PAGE).respond('RESPOND');
        clusterStatusService.getAlertSummary().then(function(data) {
            expect(data).toEqual('RESPOND');
        });
        $httpBackend.flush();
        $rootScope.$apply();
    });

    it('should receive alert if alert response is not correct', function () {
        $httpBackend.when('GET', ALERT_PAGE).respond(401, 'Error Response message');
        clusterStatusService.getAlertSummary();
        $httpBackend.flush();
        $rootScope.$apply();
        expect(alertService.showUserActionFailureAlert).toHaveBeenCalled();
    });
});
