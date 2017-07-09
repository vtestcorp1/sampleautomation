/**
 * Copyright: ThoughtSpot Inc. 2012-2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for font metric service
 */

'use strict';

describe('FontMetricService', function() {
    var fontMetricService;

    beforeEach(function() {
        module('blink.app');
        inject(function($injector) {
            fontMetricService = $injector.get('fontMetricService');
        });
    });

    describe('should truncate text fit in given width', function() {
        var cases = [
            ['invalid text', '', 10, '11px monospace', ''],
            ['single character monospace too short text', 'a', 10, '11px monospace', 'a'],
            ['single character monospace too short width', 'a', 2, '11px monospace', ''],
            ['multi character monospace too long text', 'abcdef', 36, '11px monospace', 'ab...'],
            ['multi character variable space font too short text', 'aWWW', 26, '11px Arial', 'aW...']
        ];

        cases.forEach(function(caze){
            it('for ' + caze[0], function(){
                expect(fontMetricService.truncateTextToWidth(caze[1], caze[2], caze[3])).toEqual(caze[4]);
            });
        });
    });
});
