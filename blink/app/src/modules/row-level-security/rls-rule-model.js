/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

'use strict';

blink.app.factory('RlsRuleModel', ['TableFilterModel',
    'util',
    function (TableFilterModel,
          util) {

        function RlsRuleModel () {
            RlsRuleModel.__super.apply(this, arguments);
        }

        util.inherits(RlsRuleModel, TableFilterModel);

        return RlsRuleModel;
    }]);
