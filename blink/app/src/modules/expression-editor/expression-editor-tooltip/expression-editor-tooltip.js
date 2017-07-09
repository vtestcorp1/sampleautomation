/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview View for Expression Editor bubble
 */

'use strict';

blink.app.directive('expressionEditorTooltip', ['$timeout', 'events', function ($timeout, events) {

    function linker(scope, $bubbleEl, attrs) {
        var timeoutPromise;

        scope.$on(events.SHOW_EXPRESSION_EDITOR_TOOLTIP, function (event, $node, bubbleData, mouseEvent) {
            clearTimeoutPromise();
            timeoutPromise = $timeout(function() {
                if (!!bubbleData) {
                    $bubbleEl.css('left', 0);
                    $bubbleEl.css('top', 0);
                    scope.bubbleData = bubbleData;
                    scope.$digest();

                    var isDummyNodeAdded = false;
                    var $dummyNode = $('<span id="dummy">&nbsp;</span>');
                    if (!$node.prev() || !$node.prev().length) {
                        $node.parent().prepend($dummyNode);
                        isDummyNodeAdded = true;
                    }
                    if (!$node.next() || !$node.next().length) {
                        $node.parent().append($dummyNode);
                        isDummyNodeAdded = true;
                    }

                    if ($node.height() == $node.prev().height()) {
                        $bubbleEl.css('left', $node.position().left + $node.width()/2 - $bubbleEl.width()/2);
                        $bubbleEl.css('top', $node.position().top - $bubbleEl.height() - 25);
                    } else if ((mouseEvent.pageX - $node.parent().offset().left) > $node.prev().position().left + $node.prev().width()) {
                        $bubbleEl.css('left', ($node.position().left + $node.width() + $node.prev().position().left + $node.prev().width() - $bubbleEl.width())/2);
                        $bubbleEl.css('top', $node.position().top - $bubbleEl.height() - 25);
                    } else {
                        $bubbleEl.css('left', ($node.next().position().left - $bubbleEl.width())/2);
                        $bubbleEl.css('top', $node.position().top + $node.height()/2 - $bubbleEl.height() - 25);
                    }

                    if (isDummyNodeAdded) {
                        $dummyNode.remove();
                    }

                    $bubbleEl.show();
                }
            }, 500);
        });

        scope.$on(events.HIDE_EXPRESSION_EDITOR_TOOLTIP, function (event) {
            clearTimeoutPromise();
            $bubbleEl.hide();
        });

        function clearTimeoutPromise() {
            if (!!timeoutPromise) {
                $timeout.cancel(timeoutPromise);
                timeoutPromise = null;
            }
        }
    }

    return {
        restrict: 'E',
        replace: true,
        scope: {},
        link: linker,
        templateUrl: 'src/modules/expression-editor/expression-editor-tooltip/expression-editor-tooltip.html'
    };
}]);
