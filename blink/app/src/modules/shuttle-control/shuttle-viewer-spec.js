/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Rahul Balakavi
 */


'use strict';

/*jshint camelcase: false , undef: false */

describe('Shuttle Viewer', function () {
    var $q, itemViewerService, scope, util;

    beforeEach(function() {
        module('blink.app');
        inject(function (_$q_,
                         _$route_,
                         $rootScope,
                         $controller,
                         _itemViewerService_,
                         _util_) {
            $q = _$q_;
            util = _util_;
            itemViewerService = _itemViewerService_;
            scope = $rootScope.$new();

            $controller('ShuttleViewerController', {
                $scope: scope,
                itemViewerService: itemViewerService,
                util: util
            });
            scope.$apply();
        });

    });

    it('move left should not filter un-checked subItems', function () {
        scope.shuttleModel = {};
        scope.shuttleModel.selectedItems = [{name:'mock-table-1',
            checkedState: 'checked',
            subItems: [
                {
                    isChecked: true,
                    name: 'mock-col1',
                    isDisabled: false
                },
                {
                    isChecked: false,
                    name: 'mock-col2',
                    isDisabled: false
                }
            ]}];
        scope.shuttleModel.availableItems=[];
        scope.moveLeft();
        expect(scope.shuttleModel.availableItems.length).toBe(1);
        expect(scope.shuttleModel.availableItems[0].subItems.length).toBe(2);
        expect(scope.shuttleModel.selectedItems.length).toBe(0);

    });

    it('move right should not filter un-checked subItems', function () {
        scope.shuttleModel = {};
        scope.shuttleModel.availableItems = [{name:'mock-table-1',
            checkedState: 'checked',
            subItems: [
                {
                    isChecked: true,
                    name: 'mock-col1',
                    isDisabled: false
                },
                {
                    isChecked: false,
                    name: 'mock-col2',
                    isDisabled: false
                }
            ]}];
        scope.shuttleModel.selectedItems=[];
        scope.moveRight();
        expect(scope.shuttleModel.selectedItems.length).toBe(1);
        expect(scope.shuttleModel.selectedItems[0].subItems.length).toBe(2);
        expect(scope.shuttleModel.availableItems.length).toBe(0);

    });
});
