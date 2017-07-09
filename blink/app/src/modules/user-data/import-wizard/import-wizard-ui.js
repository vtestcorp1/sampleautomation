/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Directive implementing 'blink-import-wizard' directive.
 */

'use strict';

blink.app.directive('blinkImportWizard', ['Logger',
    function (Logger) {

        var _logger = Logger.create('import-wizard-ui');

        function linker(scope, $wizard, attrs) {

            scope.scrollToFirstErrorCell = function () {
                $wizard.find('.bk-error-cell').first().scrollintoview({
                    duration: 400,
                    direction: "both"
                });
            };

        }

        return {
            restrict: 'E',
            scope: {},
            replace: true,
            templateUrl: 'src/modules/user-data/import-wizard/import-wizard.html',
            link: linker,
            controller: 'ImportWizardController'
        };

    }]);
