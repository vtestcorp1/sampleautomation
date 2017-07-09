/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('status viewer controller', function () {
    var scope,
        $q,
        dataManagementService,
        userDialogs,
        schedulerService;

    beforeEach(function() {
        module('blink.app');
        inject(function (_$q_,
                         _$route_,
                         _dataManagementService_,
                         _userDialogs_,
                         _schedulerService_,
                         $rootScope,
                         $controller) {
            $q = _$q_;
            scope = $rootScope.$new();
            scope.itemDetails = {
                dataSource: {
                    id: 'ID'
                }
            };
            userDialogs = _userDialogs_;
            schedulerService = _schedulerService_;
            dataManagementService = _dataManagementService_;
            scope.refresh = angular.noop;

            $controller('StatusViewerController', {
                $scope: scope,
                dataManagementService: dataManagementService
            });
            scope.$apply();
        });
    });

    it('show download trace only when the job has completed', function () {
        var isDownloadTraceAvailable = scope.canDownloadTrace();
        expect(isDownloadTraceAvailable).toBe(false);

        isDownloadTraceAvailable = scope.canDownloadTrace({status: 'success'});
        expect(isDownloadTraceAvailable).toBe(true);

        isDownloadTraceAvailable = scope.canDownloadTrace({status: 'failed'});
        expect(isDownloadTraceAvailable).toBe(true);

        isDownloadTraceAvailable = scope.canDownloadTrace({status: 'inprogress'});
        expect(isDownloadTraceAvailable).toBe(false);

        isDownloadTraceAvailable = scope.canDownloadTrace({status: 'scheduled'});
        expect(isDownloadTraceAvailable).toBe(false);
    });

    it('Should make the correct API calls when Reload/Abort is clicked', function () {
        dataManagementService.reloadTasks = jasmine.createSpy().and.returnValue($q.when({}));
        scope.refreshStatus = jasmine.createSpy().and.returnValue($q.when({}));
        dataManagementService.stopLoadTasks = jasmine.createSpy().and.returnValue($q.when({}));
        var rows = [{
            name: 'table1'
        }];
        scope.actionItems[0].onClick(rows);
        scope.$apply();
        expect(dataManagementService.reloadTasks).toHaveBeenCalledWith('ID', ['table1']);

        scope.actionItems[1].onClick(rows);
        expect(dataManagementService.stopLoadTasks).toHaveBeenCalledWith('ID', ['table1']);
    });

    var schedulerConfigRef = {
        "hour": "13",
        "min": "55",
        "startHour": "05",
        "startMin": "00",
        "endHour": "00",
        "endMin": "00",
        "repeatHour": "23",
        "repeatMin": "10",
        "checkedDays": {
            "TUESDAY": true,
            "SATURDAY": true
        },
        "startDate": "04/05/2026",
        "interval": "MINUTELY",
        "frequency": 20,
        "timeRange": "between",
        "endDate": "04/25/2026",
        "repeatOption": "repeatUntil",
        "timeZone": 'America/Los_Angeles',
        "enabled": true
    };

    it("Should call updateScheduler when dialog confirm is clicked", function() {
        schedulerConfigRef.enabled = true;
        var data = {
            schedulerConfig: schedulerConfigRef,
            datasource : {
                id : 'mock-id'
            }
        };
        spyOn(userDialogs, 'showSchedulerDialog').and.callFake(
            function(scheduleConfig, datasource, confirmAsync, disableScheduleCtrl) {
                return confirmAsync(data);
            }
        );
        spyOn(dataManagementService, 'updateSchedule').and.returnValue( $q.when(
            "success"
        ));
        spyOn(dataManagementService, 'enableSchedule').and.returnValue( $q.when(
            "success"
        ));
        scope.openScheduler();
        scope.$apply();
        expect(dataManagementService.enableSchedule).toHaveBeenCalled();
        expect(dataManagementService.updateSchedule).toHaveBeenCalled();

    });

    it("Should call disableScheduler when confirm is clicked with enabled false", function() {
        schedulerConfigRef.enabled = false;
        var data = {
            schedulerConfig: schedulerConfigRef,
            datasource : {
                id : 'mock-id'
            }
        };
        spyOn(userDialogs, 'showSchedulerDialog').and.callFake(
            function(scheduleConfig, datasource, confirmAsync, disableScheduleCtrl) {
                return confirmAsync(data);
            }
        );
        spyOn(dataManagementService, 'disableSchedule').and.returnValue( $q.when(
            "success"
        ));
        scope.openScheduler();
        expect(dataManagementService.disableSchedule).toHaveBeenCalled();
        scope.$apply();
    });

    it("Should throw an error when scheduler is passed invalid config", function() {
        var mockConfig = _.cloneDeep(schedulerConfigRef);
        mockConfig.enabled = true;
        var data = {
            schedulerConfig: mockConfig,
            datasource : {
                id : 'mock-id'
            }
        };
        // starttime < now
        mockConfig.startDate = "04/05/2006";
        spyOn(userDialogs, 'showSchedulerDialog').and.callFake(
            function(scheduleConfig, datasource, confirmAsync, disableScheduleCtrl) {
                return confirmAsync(data);
            }
        );
        spyOn(schedulerService, 'getConfigFromBackendJson').and.returnValue(mockConfig);
        scope.openScheduler();
        expect(scope.itemDetails.schedule).toBe(void 0);
        scope.$apply();
        // endtime < starttime
        mockConfig.startDate = "04/05/2006";
        mockConfig.endDate = "04/04/2006";
        scope.openScheduler();
        expect(scope.itemDetails.schedule).toBe(void 0);
        scope.$apply();
    });
});
