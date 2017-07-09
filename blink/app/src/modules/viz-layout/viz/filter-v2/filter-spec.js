/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for base filter controller.
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

// TODO(Jasmeet): Enable/Add filter unit tests.
describe('Base Filter spec', function() {
    var $scope = null,
        filterCtrl = null,
        eventsService,
        mockFilterUtil,
        _serviceCallSucceeded,
        mockVizData = {},
        _isDataOnDemand,
        mockFilterModel;

    beforeEach(module('blink.app'));

    beforeEach(inject(function ($rootScope) {
        $scope = $rootScope.$new();

        mockFilterUtil = {
            updateFilterModelWithValues: function () {
                $scope.filterModel.setAndProcessFilterData();
                return {
                    then: function (callback1, callback2) {
                        if (_serviceCallSucceeded) {
                            callback1();
                        } else {
                            callback2();
                        }
                    }
                };
            }
        };

        _isDataOnDemand = true;
        mockFilterModel = {
            _onDemandData: _isDataOnDemand,
            _setDataOnDemandCalled: false,
            _setAndProcessCalled: false,
            getVizData: function () { return mockVizData; },
            isDataOnDemand: function () { return this._onDemandData; },
            setDataOnDemand: function (onDemandData) {
                this._setDataOnDemandCalled = true;
                this._onDemandData = onDemandData;
            },
            setAndProcessFilterData: function () {
                this._setAndProcessCalled = true;
            },
            getContainingAnswerModel: function () {},
            getColumn: function () {
                return {
                    getSageOutputColumnId: function () {
                        return 'sage-output-column-id';
                    }
                };
            }
        };
    }));

    xit('should make a failed service call to fetch filter data', function () {
        // Initial filter is closed.
        expect($scope.filter.isOpen).toBeFalsy();

        $scope.filterModel.isSupportedByUI = function () {
            return true;
        };

        // Click to load filter data and possibly expand.
        $scope.filter.onClick();
        // $digest needed for promised to resolved/rejected.
        $scope.$root.$digest();
        // Filter is still closed because of failed service call.
        expect($scope.filter.isOpen).toBeFalsy();
    });

    xit('should make a successful service call to fetch filter data', function () {
        expect($scope.filter.isOpen).toBeFalsy();
        expect($scope.filterModel._setAndProcessCalled).toBeFalsy();

        $scope.filterModel.isSupportedByUI = function () {
            return true;
        };

        var _filterExpansionEventTriggered = false,
            _openState;
        $scope.$on(eventsService.FILTER_DISPLAY_STATE_CHANGED_U, function ($ev, openState) {
            _filterExpansionEventTriggered = true;
            _openState = openState;
        });

        _serviceCallSucceeded = true;
        $scope.filter.onClick();
        $scope.$root.$digest();
        // After successful service call, the filter should open
        expect($scope.filter.isOpen).toBeTruthy();
        // Make sure that the expanded filter <=> no lazy loading of data.
        expect($scope.filterModel._onDemandData).toBeFalsy();
        // Make sure that the filter model consumed the result of service call.
        expect($scope.filterModel._setAndProcessCalled).toBeTruthy();
        expect(_filterExpansionEventTriggered).toBeTruthy();
        expect(_openState).toBeTruthy();
    });

    xit('should be a no-op when data fetch in flight', function () {
        _serviceCallSucceeded = true;
        $scope.filterModel.isSupportedByUI = function () {
            return true;
        };

        $scope.filter.onClick();
        // NO $digest called to block the promise from being resolved.

        // Check that first call makes a call to setDataOnDemand.
        expect($scope.filterModel._setDataOnDemandCalled).toBeTruthy();
        // Reset the test flag.
        $scope.filterModel._setDataOnDemandCalled = false;
        // A subsequent call to onClick with data fetch still in fligh (due to blocked promise) should be a no-op
        $scope.filter.onClick();
        expect($scope.filterModel._setDataOnDemandCalled).toBeFalsy();
    });

    xit('should throw if filter is already open and data not available', function () {
        $scope.filter.isOpen = true;
        expect(function () {
            $scope.filter.onClick();
        }).toThrow();
    });

    xit('should not make a service call if data already available', function () {
        mockVizData = {
            data: []
        };
        $scope.filter.onClick();
        $scope.$root.$digest();
        // After successful service call, the filter should open
        expect($scope.filter.isOpen).toBeTruthy();
        expect($scope.filterModel._setDataOnDemandCalled).toBeTruthy();
        // Make sure that the expanded filter <=> no lazy loading of data.
        expect($scope.filterModel._onDemandData).toBeFalsy();

        // A successive call should close the filter.
        $scope.filter.onClick();
        $scope.$root.$digest();
        // After successful service call, the filter should open
        expect($scope.filter.isOpen).toBeFalsy();
        // Make sure that the expanded filter <=> no lazy loading of data.
        expect($scope.filterModel._onDemandData).toBeTruthy();
    });

    xit('should not make a service call if requireFilterData is false even if data is not available', function () {
        $scope.filter.requireFilterData = false;
        $scope.filter.onClick();
        $scope.$root.$digest();
        // After successful service call, the filter should open
        expect($scope.filter.isOpen).toBeTruthy();
        expect($scope.filterModel._setDataOnDemandCalled).toBeTruthy();
        // In case of requireFilterData=false, we should always keep onDemandData to be true.
        expect($scope.filterModel._onDemandData).toBeTruthy();
    });
});
