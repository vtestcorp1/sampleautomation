/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Controller for Sage bubble
 */

'use strict';

blink.app.controller('SageBubbleController', ['$scope', '$timeout', 'events', 'strings', function ($scope, $timeout, events, strings) {

    var _bubbleShowHideTimer = null,
        _lastDismissedBubbleData = null,

        // One-item stack for a sticky bubble (having an 'x' to close). Suppose a sticky bubble is showing and user
        // hovers over another token to see lineage in a non-sticky bubble. When the user hovers out of the token,
        // we should continue to show the last sticky bubble until user closes it or another sticky bubble is shown.
        _lastStickyBubbleData = null,

        // The bubble title is based on what the content severity is
        _severityToTitleMap = {};

    function createTitleMap() {
        _severityToTitleMap[sage.ErrorSeverity.ERROR] = 'Error';
        _severityToTitleMap[sage.ErrorSeverity.WARNING] = 'Warning';
        _severityToTitleMap[sage.ErrorSeverity.SUGGESTION] = 'Help';
    }

    createTitleMap();

    $scope.bubbleData = {};

    $scope.isErrorMessage = function () {
        return $scope.bubbleData.severity === sage.ErrorSeverity.ERROR;
    };

    $scope.isWarningMessage = function () {
        return $scope.bubbleData.severity === sage.ErrorSeverity.WARNING;
    };

    $scope.isSuggestionMessage = function () {
        return $scope.bubbleData.severity === sage.ErrorSeverity.SUGGESTION;
    };

    $scope.getTitle = function () {
        return _severityToTitleMap[$scope.bubbleData.severity] || 'Source';
    };

    $scope.dismissSageBubble = function () {
        _lastDismissedBubbleData = $scope.bubbleData;
        $scope.$broadcast(events.HIDE_SAGE_BUBBLE_D, true);
    };

    $scope.$on(events.SHOW_SAGE_BUBBLE_D, function (event, bubbleData) {
        if (!bubbleData.content) {
            return;
        }

        // If user dismissed an (error) bubble and then clicked on sage bar, then don't show same error bubble.
        // But if user clicks the error indicator then we can ignore if the bubble was explicitly dismissed before.
        if (!!_lastDismissedBubbleData && bubbleData.content === _lastDismissedBubbleData.content && !bubbleData.force) {
            return;
        }

        if (_bubbleShowHideTimer) {
            $timeout.cancel(_bubbleShowHideTimer);
        }

        _bubbleShowHideTimer = $timeout(function () {
            _lastDismissedBubbleData = null;
            if (bubbleData.isSticky) {
                bubbleData.onShow();
                _lastStickyBubbleData = bubbleData;
            }
            $scope.showBubble(bubbleData);
        }, 0);
    });

    $scope.$on(events.HIDE_SAGE_BUBBLE_D, function (event, force) {
        if ($scope.bubbleData.isSticky && !force) { return; }

        if (_bubbleShowHideTimer) {
            $timeout.cancel(_bubbleShowHideTimer);
        }

        _bubbleShowHideTimer = $timeout(function () {
            if ($scope.bubbleData.isSticky) {
                if (_lastStickyBubbleData) {
                    _lastStickyBubbleData.onHide();
                }
                _lastStickyBubbleData = null;
                $scope.hideBubble();
            } else if (!!_lastStickyBubbleData) {
                $scope.showBubble(_lastStickyBubbleData);
            } else {
                $scope.hideBubble();
            }
        }, 200);
    });
}]);
