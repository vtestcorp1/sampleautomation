/**
 * Created by rahul on 6/29/15.
 */

'use strict';

blink.app.directive('slackChannels', ['$timeout', function($timeout) {
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
        templateUrl: 'src/modules/slack/slack-channels/slack-channels.html',
        controller: 'SlackChannelsController',
        scope: {
            onChannelClicked: '=',
            fileId: '='
        },
        replace: true,
        link:linker
    };
}]);

blink.app.controller('SlackChannelsController', ['$scope', 'slackService', '$location', 'util', function($scope, slackService, $location, util) {
    slackService.getChannels().then(function(channels) {
        $scope.slackChannels = channels;
        refreshSelectedChannels();
    });

    var refreshSelectedChannels = function() {
        if (!!$scope.fileId) {
            slackService.getFileInfo($scope.fileId).then(function(fileInfo) {
                $scope.slackChannels.forEach(function(channel) {
                    if (fileInfo.file.channels.any(channel.id)) {
                        channel.selected = true;
                    }
                });
            });
        }
    };

    $scope.onShareWithChannelClicked = function(channel) {
        channel.loading = true;
        $scope.onChannelClicked(channel)
            .then(function() {
                channel.loading = false;
                refreshSelectedChannels();
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
}]);
