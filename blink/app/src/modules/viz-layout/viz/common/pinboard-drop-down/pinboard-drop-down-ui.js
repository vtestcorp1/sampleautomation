/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview View for Pinboard Drawer
 */

'use strict';

blink.app.directive('blinkPinboardDropDown', ['Logger', '$timeout', function (Logger, $timeout) {

    var _logger = Logger.create('pinboard-dialog-ui');

    function linker(scope, $el, attrs) {
        scope.focusOnNewPinboardInput = function () {
            $timeout(function() {
                $el.find('.bk-new-pinboard-input input').focus();
            });
        };
    }

    return {
        restrict: 'AE',
        replace: true,
        scope: {
            vizModel: '='
        },
        link: linker,
        templateUrl: 'src/modules/viz-layout/viz/common/pinboard-drop-down/pinboard-drop-down.html',
        controller: 'PinboardDropDownController'
    };

}]);
