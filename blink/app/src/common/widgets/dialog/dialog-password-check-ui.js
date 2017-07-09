/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Checks whether two passwords are equal in a dialog
 */

'use strict';

blink.app.directive('blinkDialogPasswordCheck', function () {
    function comparePasswords(scope) {
        var password = scope.data.customData.password,
            confirmPassword = scope.data.customData.confirmPassword;
        // This first check is needed so that if one value is undefined and the other empty string, match is true
        if (!password && !confirmPassword) {
            scope.data.customData.matchingPasswords = true;
        } else {
            scope.data.customData.matchingPasswords = (password == confirmPassword);
        }
    }

    function linker(scope, $el, attrs) {
        // For each input change, check if the passwords are matching
        scope.$watch('data.customData.editedUser.password', angular.bind(null, comparePasswords, scope));
        scope.$watch('data.customData.editedUser.confirmPassword', angular.bind(null, comparePasswords, scope));
    }

    return {
        restrict: 'A',
        link: linker
    };
});
