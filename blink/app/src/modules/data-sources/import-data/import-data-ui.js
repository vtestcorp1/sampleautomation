/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Pradeep Dorairaj (pradeep.dorairaj@thoughtspot.com)
 *
 * @fileoverview Directive implementing 'blink-import-data' directive.
 */

'use strict';

blink.app.directive('blinkImportData', [function () {

    return {
        restrict: 'E',
        scope: {},
        replace: true,
        templateUrl: 'src/modules/data-sources/import-data/import-data.html',
        controller: 'ImportDataController'
    };

}]);
