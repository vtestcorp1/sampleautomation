/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 */

'use strict';

describe('metadata item selector', function () {

    var basePath = getBasePath(document.currentScript.src),
        MetadataItemSelector,
        MetadataItemType;

    beforeEach(function(done) {
        module('blink.app');
        freshImport(basePath, './metadata-item-selector').then(function(module) {
            inject();
            MetadataItemSelector = module.MetadataItemSelector;
            MetadataItemType = module.MetadataItemType;
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('[SCAL-18422] should make a copy of item set from outside', function() {
        var metadataItemSelector = new MetadataItemSelector(
            MetadataItemType.PINBOARD,
            (item) => {}
        );
        var itemJson = {id: 'abc', owner: 'bcd', name: 'hello', type: 'yo'};
        metadataItemSelector.setSelectedItem(itemJson);
        var retrievedSelectedItem = metadataItemSelector.getSelectedItems()[0];
        expect(retrievedSelectedItem).not.toBe(itemJson);
        expect(retrievedSelectedItem).toEqual(itemJson);

    });
});
