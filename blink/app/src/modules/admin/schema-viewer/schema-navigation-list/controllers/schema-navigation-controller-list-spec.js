/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Spec for schema-navigation-controller
 *
 *
 */

'use strict';

describe('schema-navigation-controller-list', function () {


    var basePath = getBasePath(document.currentScript.src),
        ctrl,
        items = [
            {
                id: 'a',
                getName: function() { return 'a'; }
            },
            {
                id: 'b',
                getName: function() { return 'b'; }
            },
            {
                id: 'c',
                getName: function() { return 'c'; }
            }
        ];

    beforeEach(function (done) {
        module('blink.app');
        freshImport(basePath, './full-schema-navigation-list-controller')
            .then(function(module) {
                ctrl = module.default;
                inject();
                done();
            });
    });

    it("should filter correctly on items", function () {

        var listItems = items.map(function(item){
            return ctrl.buildListItem(item, item.id, [], false);
        });

        var testedCtrl = new ctrl(items, _.noop);
        var filter = testedCtrl.getFilterByInput('a');

        expect(filter(listItems[0])).toBe(true);
        expect(filter(listItems[1])).toBe(false);
        expect(filter(listItems[2])).toBe(false);
    });
});
