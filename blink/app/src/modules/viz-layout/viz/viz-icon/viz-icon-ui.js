/**
 * Copyright: ThoughtSpot Inc. 2014-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Directive for a viz icon rendered as part of the viz selector control
 */

'use strict';

blink.app.directive('vizIcon', [function () {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            vizType: '=',
            vizTypeSelectorModel: '=',
            vizTypeCategory: '=',
            vizTypePanel: '@'
        },
        link: function ($scope) {

            $scope.getIconClass = function () {
                var vizTypeCategory = $scope.vizTypeCategory;
                var vizType = $scope.vizType;
                if (!!vizTypeCategory) {
                    return 'bk-style-icon-{1}-{2}'.assign(vizTypeCategory.toLowerCase(), vizType.toLowerCase());
                }
                return 'bk-style-icon-{1}'.assign(vizType.toLowerCase());
            };
        },
        templateUrl: 'src/modules/viz-layout/viz/viz-icon/viz-icon.html'
    };
}]);
