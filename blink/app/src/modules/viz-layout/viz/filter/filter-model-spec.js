/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Test modeling for filters.
 */

'use strict';

describe('Filter model', function() {
    var basePath = getBasePath(document.currentScript.src);
    var FilterModel, Filter;

    beforeEach(function(done) {
        module('blink.app');
        Promise.all([
            freshImport(basePath, './filter-model'),
            freshImport(basePath, './filter')
        ]).then(function(modules) {
            inject();
            Filter = modules[1].Filter;
            FilterModel = modules[0].FilterModel;
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('SCAL-18606 Filter panel should not show geo filter', function() {
        var mockFilterJson = {
            filterContent: {
                type: 'SIMPLE',
                rows: [
                    {
                        column: {
                            effectiveType: 'a',
                            effectiveDataType: 'a'
                        },
                        oper: 'EQ',
                        type: 'GEO',
                        values: []
                    }
                ]
            }
        };
        var filter = new Filter(mockFilterJson);
        var mockFilterModelJson = {
            header: {

            },
            vizContent: {
                compoundRowIndices: [0]
            }
        };
        var filterModel = new FilterModel(
            {
                vizJson: mockFilterModelJson
            },
            filter
        );
        expect(filterModel.shouldDisplay()).toBe(false);
    });
});
