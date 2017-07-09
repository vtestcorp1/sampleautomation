/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui(simon@thoughtspot.com)
 *
 * @fileoverview Used in search engine details pinboard to show table information.
 */

'use strict';

blink.app.directive('searchDetailTableViz', [function () {

    return {
        replace: true,
        scope: {
            viz: '='
        },
        templateUrl: 'src/modules/clusterstatus/vizs/search-detail-table-viz/search-detail-table-viz.html',
        controller: 'SearchDetailTableViz'
    };
}]);
