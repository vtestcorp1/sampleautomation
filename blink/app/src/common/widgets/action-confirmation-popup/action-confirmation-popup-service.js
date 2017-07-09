/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A service that manages singleton popups that allow user action within them and don't
 *               automatically disappear on mouseout
 */

'use strict';

blink.app.factory('actionablePopupService', ['$rootScope',
    'angularUtil',
    'blinkConstants',
    'strings',
    'Logger',
    'util',
    'CheckboxComponent',
    function (
        $rootScope,
        angularUtil,
        blinkConstants,
        strings,
        Logger,
        util,
        CheckboxComponent) {
        var _logger = Logger.create('actionable-popup-service'),
            $scope = $rootScope.$new(),
            $currentAnchor = null,
            me = {};

        var $popupHost = angularUtil.getCompiledElement(
            $('<div class="bk-action-confirmation-popup" blink-overlay="hide()"></div>'),
            $scope
        );
        var popupContentHTML = '<div><div ng-include="\'src/common/widgets/action-confirmation-popup/action-confirmation-popup-content.html\'"></div></div>';
        var $popupContent = angularUtil.getCompiledElement($(popupContentHTML), $scope);

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;

        $scope.toggleDoNotShowAgain = function () {
            $scope.doNotShowAgain = !$scope.doNotShowAgain;
        };

        function alignPopoverPlacement($target, $popover) {
        // Run this in the next loop so that bootstrap placement can happen.
            util.executeInNextEventLoop(function () {
                var offset = $target.offset();
                $popover.css({left: offset.left + $target.width(), top: offset.top - 15});
            });
        }

        function setEventListeners($popupContent) {
            $popupContent.on('mousedown', function(e){
                e.preventDefault();
                e.stopPropagation();
            });
        }

    /**
     * Shows the popup next to the given anchor $node
     * @param params A dictionary with the following fields
     *     $anchor: the $domNode that the popup should show next to
     *     popupText: the text of the message to be shown in the popup
     *     onAction: the callback to be called when the user confirms the action. the function is passed a boolean
     *               parameter which is true iff the suppress option was checked by the user
     *     onCancel: the callback to be called when the user cancels the action. gets the same boolean parameter
     *               as onAction
     *     showSuppressOption: whether to give the user an option to permanently disable any further popups
     *     actionButtonText (optional): the text of the action confirmation button (defaults to 'OK')
     *     cancelButtonText (optional): the text of the action cancellation button (defaults to 'Cancel')
     *
     */
        me.show = function (params) {
            var $anchor = params.$anchor,
                popupText = params.popupText,
                onAction = params.onAction,
                onCancel = params.onCancel,
                showSuppressOption = params.showSuppressOption,
                actionButtonText = params.actionButtonText,
                cancelButtonText = params.cancelButtonText;

            $scope.popupText = popupText;
            $scope.showSuppressOption = showSuppressOption;
            $scope.doNotShowAgain = false;
            $scope.dontShowAgainCheckboxCtrl = new CheckboxComponent(
                strings.dataPanel.popover.DONT_SHOW_AGAIN,
                function () {
                    return $scope.doNotShowAgain;
                }
            ).setOnClick(function($event) {
                $scope.toggleDoNotShowAgain();
            });
            $scope.actionButtonText = actionButtonText;
            $scope.cancelButtonText = cancelButtonText;

            $scope.onAction = function ($evt) {
                me.hide();

                if (!!onAction) {
                    onAction.call($scope, $scope.doNotShowAgain);
                }
            };
            $scope.onCancel = function ($evt) {
                me.hide();

                if (!!onCancel) {
                    onCancel.call($scope, $scope.doNotShowAgain);
                }
            };

            $anchor.popover({
                html: true,
                content: $popupContent,
                placement: 'right',
                trigger: 'manual',
                container: $popupHost,
                template:'<div class="popover"><div class="popover-content"></div></div>'
            });

            $anchor.popover('show');

            $anchor.on('hidden.bs.popover', function(){
                $popupContent.detach();
            });

            var $popover = $('.bk-action-confirmation-popup .popover');
            alignPopoverPlacement($anchor, $popover);

            $currentAnchor = $anchor;
        };

        $scope.hide = me.hide = function () {
            if (!$currentAnchor) {
                return;
            }
            $currentAnchor.popover('destroy');
        };

        setEventListeners($popupContent);
        $('body').append($popupHost);

        return me;
    }]);
