/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Vishwas B Sharma (vishwas.sharma@thoughtspot.com)
 *
 * @fileoverview Unit tests for metadata-util methods.
 */

'use strict';

describe('metadataUtil', function() {

    var metadataUtil;

    beforeEach(function() {
        module('blink.app');
        inject(function($injector) {
            metadataUtil = $injector.get('metadataUtil');
        });
    });

    it('should correctly stitch together the URL parameters provided', function () {
        expect(metadataUtil.stitchQueryParametersIntoAString({
            'col1key': 'col1val',
            'col2key': 'col2val',
            'col3key': 'col3val'
        })).toEqual("col1key=col1val&col2key=col2val&col3key=col3val");
        expect(metadataUtil.stitchQueryParametersIntoAString({
            'col1key': 'col1val',
            'col2key': ['col2val1', 'col2val2', 'col2val3']
        })).toEqual("col1key=col1val&col2key=col2val1&col2key=col2val2&col2key=col2val3");

    });
});
