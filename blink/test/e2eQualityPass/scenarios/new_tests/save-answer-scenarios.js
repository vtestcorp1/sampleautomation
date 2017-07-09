/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou
 *
 * @fileoverview e2e scenarios around charts
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('test save: ', function() {
    var title;

    beforeEach(function() {
        title = 'save_test_' + Math.floor(Math.random() * 1000);
        deselectAllTableSources();
        goToAnswer();
        callFunctionWithElement(null, function($body, window, $){
            window.blink.env.enableUnsavedChangesAlert = true;
        });
    });

    afterEach(function(){
        callFunctionWithElement(null, function($body, window, $){
            window.blink.env.enableUnsavedChangesAlert = false;
        });
    });


    it('should save answer', function() {
        addAnswerSimple(title, ['LINEORDER', 'CUSTOMER'], 'revenue by customer nation sort by customer nation');
        openSavedAnswer(title, 'table');
        checkSimpleHeadlines([
            {
                hv: '25',
                hc: 'Customer Nation'
            },
            {
                hv: '18.1B',
                hc: 'Revenue'
            }
        ]);
        deleteSavedAnswer(title);
    });
});
