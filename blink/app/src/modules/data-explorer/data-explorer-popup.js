/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Directive/Controller to show data explorer as a modal.
 */

'use strict';

blink.app.controller('blinkDataExplorerPopupController', ['$scope',
    '$q',
    'alertService',
    'jsonConstants',
    'metadataService',
    'metadataPermissionService',
    'UserAction',
    function($scope,
         $q,
         alertService,
         jsonConstants,
         metadataService,
         metadataPermissionService,
         UserAction) {
        var callosumType = jsonConstants.metadataType.LOGICAL_TABLE;
        $scope.selectedTable = {};

        function getData(model) {
            var userAction = new UserAction(UserAction.FETCH_TABLE_LIST);

            return metadataService.getMetadataList(callosumType)
            .then(function (response) {
                var data = response.data;
                if (!data) {
                    return model;
                }
                var items = data[jsonConstants.MULTIPLE_HEADER_KEY];
                if(!items || !items.length) {
                    return model;
                }
                model.data = items.map(function(header, idx) {
                    return {
                        rowIdx: idx,
                        values: header
                    };
                }, function(response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                });
                return model;
            });
        }

    // TODO(Ashish): Permissions could be set inside the data object itslef.
        function getPermissions(model) {
            var userAction = new UserAction(UserAction.FETCH_TABLE_PERMISSIONS);
            return metadataPermissionService.fetchItemPermissions(
            model.data,
            callosumType
        ).then(function(response) {
            model.permissions = response.data;
            return model;
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
        }

        getData({})
        .then(getPermissions)
        .then(function(model) {
            $scope.data = model.data;
            $scope.permissions = model.permissions;
            $scope.selectedTable.tableId = $scope.tableId || $scope.data[0].values.id;
            $scope.dataAvailable = true;
        });
    }]);

blink.app.directive('blinkDataExplorerPopup', [ function(){
    function linker(scope, $el) {
        scope.hide = function() {
            //Used evalAsync because https://github.com/angular/angular.js/issues/5658
            scope.$evalAsync(function() {
                scope.$destroy();
            });
            $el.remove();
        };
    }

    return {
        restrict: 'E',
        templateUrl: 'src/modules/data-explorer/blink-data-explorer-popup.html',
        scope: {
            tableId: '=selectedTableId',
            title: '=dataExplorerTitle',
            mode: '=',
            selectableColumnPredicate: '='
        },
        controller: 'blinkDataExplorerPopupController',
        link: linker
    };
}]);
