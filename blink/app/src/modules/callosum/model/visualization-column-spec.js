/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview Unit tests for visualization column model.
 */
'use strict';

describe('Visualization Column model', function() {
    var basePath = getBasePath(document.currentScript.src);
    var VisualizationColumnModel;

    beforeEach(function(done) {
        module('blink.app');

        freshImport(basePath, './visualization-column').
            then(function(module) {
                inject();
                VisualizationColumnModel = module.VisualizationColumnModel;
                done();
            });
    });

    it('support bucketization change for TIME columns', () => {
        let vizColumn = new VisualizationColumnModel({
            effectiveDataType: 'TIME',
            effectiveType: 'ATTRIBUTE'
        });

        expect(vizColumn.supportsDateBucketizationChange()).toBe(true);
    });
});
