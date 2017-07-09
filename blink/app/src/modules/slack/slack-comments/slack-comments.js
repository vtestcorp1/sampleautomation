/**
 * Created by rahul on 6/29/15.
 */

'use strict';

blink.app.directive('slackComments', ['$timeout', function($timeout) {
    function linker(scope, $el, attrs) {
        scope.onWindowClick = function (callback) {
            $(window).on('mousedown.vizDropDown', function(evt) {
                if ($(evt.target).closest('.bk-viz-menu').hasClass('bk-open')) {
                    return;
                }
                callback();
            });
        };

        scope.unbindWindowClick = function () {
            $(window).off('mousedown.vizDropDown');
        };

        scope.focusOnNewPinboardInput = function () {
            $timeout(function() {
                $el.find('.bk-new-pinboard-input input').focus();
            });
        };
    }

    return {
        restrict: 'E',
        templateUrl: 'src/modules/slack/slack-comments/slack-comments.html',
        controller: 'SlackCommentsController',
        scope: {
            fileId: '='
        },
        replace: true,
        link:linker
    };
}]);

blink.app.controller('SlackCommentsController', ['$scope', 'slackService', '$location', function($scope, slackService, $location) {
    $scope.newComment = null;
    var usersMap = {};

    slackService.getUsers().then(function(users) {
        usersMap = users;
    });

    $scope.refreshComments = function() {
        slackService.getFileInfo($scope.fileId).then(function(fileInfo) {
            $scope.fileComments = fileInfo.comments;
        });
    };

    $scope.addComment = function() {
        slackService.addComment($scope.fileId, $scope.newComment).then(function() {
            $scope.refreshComments();
            $scope.newComment = null;
        });
    };

    /**
     * Drop down icon was clicked, toggle the drop down
     */
    $scope.onDropDownClick = function () {
        if (!this.isOpen) {
            $scope.open();
        } else {
            $scope.close();
        }
    };

    /**
     * Open the drop down
     */
    $scope.open = function () {
        $scope.isOpen = true;
        $scope.onWindowClick(function () {
            $scope.close();
        });
    };

    /**
     * Close the drop down
     */
    $scope.close = function () {
        $scope.unbindWindowClick();
        $scope.isOpen = false;
    };

    $scope.getAuthorName = function(comment) {
        return usersMap[comment.user].name;
    };

    $scope.refreshComments();
}]);
