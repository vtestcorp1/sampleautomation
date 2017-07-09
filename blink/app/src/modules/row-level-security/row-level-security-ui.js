/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview UI for row level security filters
 */

'use strict';

function NGRowLevelSecurityController($scope) {
    if (!this.ctrl) {
        return;
    }
    var ctrl = this;

    $.extend(ctrl, ctrl.ctrl);

    $scope.$watch('$ctrl.ctrl', function(newVal, oldVal) {
        if(newVal === oldVal) {
            return;
        }
        $.extend(ctrl, ctrl.ctrl);
    });
}

blink.app.component('rowLevelSecurity',  {
    bindings: {
        ctrl:'<'
    },
    controller: ['$scope', NGRowLevelSecurityController],
    templateUrl: 'src/modules/row-level-security/row-level-security.html'
});
