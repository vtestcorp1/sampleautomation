/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview TS pattern library
 */

'use strict';

blink.app.directive('bkStyleGuide', [function () {

    return {
        restrict: 'E',
        templateUrl: 'src/style-guide/style-guide.html',
        controller: [
            '$scope',
            'WidgetsBrowserComponent',
            function($scope, WidgetsBrowserComponent) {
                $scope.widgetBrowserCtrl = new WidgetsBrowserComponent();
            }
        ]
    };
}]);
