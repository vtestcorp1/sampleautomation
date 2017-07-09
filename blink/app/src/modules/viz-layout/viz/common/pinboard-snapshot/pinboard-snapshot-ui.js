/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview View for Pinboard Drawer
 */

'use strict';

blink.app.directive('blinkPinboardSnapshot', ['Logger', '$timeout', function (Logger, $timeout) {

    var _logger = Logger.create('pinboard-snapshot-dialog-ui');

    function linker(scope, $el, attrs) {
        scope.focusOnNewSnapshotInput = function () {
            $timeout(function() {
                // TODO: change focus to name not description
                $el.find('.bk-new-snapshot-input input').focus();
            });
        };
    }

    return {
        restrict: 'AE',
        replace: true,
        scope: {
            pinboardModel: '='
        },
        link: linker,
        templateUrl: 'src/modules/viz-layout/viz/common/pinboard-snapshot/pinboard-snapshot.html',
        controller: 'PinboardSnapshotController'
    };

}]);
