/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Controller table context menu data copy option
 */

'use strict';


blink.app.controller('TableContextMenuCopyDataController', ['$scope', 'events', 'Logger', 'tableUtil',
    function ($scope, events, Logger, tableUtil) {

        var logger = Logger.create('table-context-menu-copy-controller');

        $scope.getSelectionData = function () {
            var data = $scope.getData(),
                grid = data.grid;
            if (!data.grid) {
                logger.warn("data must have 'grid' property", data);
                return;
            }

            return tableUtil.getDataForCurrentSelection(grid);
        };
    }]);


blink.app.directive('tableContextMenuCopyData', ['vizContextMenuUtil', function (vizContextMenuUtil) {
    function linker(scope, $el, attrs) {
        $el.on('click', function($evt){
            $evt.stopPropagation();
        });

        var $clipboardHost = $el.find('.context-sub-menu-title-container');
        $clipboardHost.attr('data-clipboard-text', scope.getSelectionData());

        ZeroClipboard.config({
            forceHandCursor: true,
            cacheBust: false,
            swfPath: 'resources/zeroclipboard/ZeroClipboard.swf'
        });
        var client = new ZeroClipboard($clipboardHost[0]);
        client.on("copy", function (event) {
            scope.close(vizContextMenuUtil.VizContextMenuOptionType.COPY_TO_CLIPBOARD);
        });
    }

    return {
        restrict: 'A',
        link: linker,
        controller: 'TableContextMenuCopyDataController'
    };
}]);
