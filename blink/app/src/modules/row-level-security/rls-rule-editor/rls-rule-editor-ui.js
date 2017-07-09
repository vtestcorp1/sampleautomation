/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview View for RLS Rule editor
 *
 */

'use strict';

blink.app.controller('NGRlsRuleEditorController', ['$scope',
    'Logger',
    function ($scope,
          Logger) {
        var _logger = Logger.create('rls-rule-editor-ui');
        if (!$scope.ctrl) {
            _logger.error('No controller passed in');
        }
        $.extend($scope, $scope.ctrl);
        $scope.$watch('ctrl', function(newVal, oldVal) {
            if(newVal === oldVal) {
                return;
            }
            $.extend($scope, $scope.ctrl);
        });
    }]);

blink.app.directive('rlsRuleEditor', ['Logger',
    'rlsRuleEditorPopupService',
    'util',
    function (Logger) {

        var logger = Logger.create('rls-rule-editor-ui');

        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/modules/row-level-security/rls-rule-editor/rls-rule-editor.html',
            controller: 'NGRlsRuleEditorController'
        };

    }]);
