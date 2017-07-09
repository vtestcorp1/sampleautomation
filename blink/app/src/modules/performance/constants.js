/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Maxim Leonovich (maksim.leanovich@thoughtspot.com)
 *
 */

'use strict';

blink.app.constant('perfEvents', {
    PINBOARD_RENDERED: 'pinboard-rendered',
    PINBOARD_VIZ_RENDERED: 'pinboard-viz-rendered',
    LEFT_PANEL_RENDERED: 'left-panel-rendered',

    // Read tests.
    LOGIN:'login',
    LOAD_HOME_PAGE: 'load-home-page',
    LOAD_ANSWER_PAGE: 'load-answer-page',
    LOAD_ANSWER_LIST_PAGE: 'load-answer-list-page',
    LOAD_PINBOARD_LIST_PAGE: 'load-pinboard-list-page',
    LOAD_SAVED_ANSWER: 'load-saved-answer',
    LOAD_WORKSHEET: 'load-saved-answer',
    LOAD_PINBOARD: 'load-pinboard',
    LOAD_SCHEMA_VIEWER: 'load-schema-viewer',

    // Write tests.
    ADHOC_ANSWER: 'adhoc-answer',
    DRILL_DOWN: 'drill-down',
    ADD_FILTER: 'add-filter',
    ADD_COLUMN: 'add-column',
    ADD_PINBOARD_VIZ: 'add-pinboard-viz',
    CREATE_WORKSHEET: 'create-worksheet'
});

blink.app.constant('serviceNames', {
    CALLOSUM: 'callosum',
    SAGE: 'sage',
    RENDER: 'render'
});
