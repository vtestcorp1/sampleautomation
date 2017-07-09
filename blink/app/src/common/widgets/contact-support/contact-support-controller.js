/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for widget showing contact support.
 */

'use strict';

blink.app.controller('ContactSupportController', ['$scope',
    'blinkConstants',
    'strings',
    'sessionService',
    function ($scope,
              blinkConstants,
              strings,
              sessionService) {
        $scope.showSupportPopup = false;

        $scope.toggleSupportPopup = function () {
            $scope.showSupportPopup = !$scope.showSupportPopup;
        };

        $scope.getTitleText = function () {
            return strings.contactSupport.CONTACT_SUPPORT;
        };

        $scope.getAdminEmail = function () {
            return sessionService.getCustomerAdminEmail() || blinkConstants.help.support.EMAIL;
        };

        $scope.getAdminPhoneNumber = function () {
            return sessionService.getCustomerAdminPhoneNumber() || blinkConstants.help.support.PHONE;
        };
    }]);
