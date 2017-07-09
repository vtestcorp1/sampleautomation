/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Test modeling for filters.
 */

'use strict';

describe('Filter model', function() {
    var basePath = getBasePath(document.currentScript.src);
    var AttributeFilterModel, Filter;

    beforeEach(function(done) {
        module('blink.app');
        Promise.all([
            freshImport(basePath, './attribute-filter-model'),
            freshImport(basePath, './filter')
        ]).then(function(modules) {
            inject();
            Filter = modules[1].Filter;
            AttributeFilterModel = modules[0].AttributeFilterModel;
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    it('SCAL-18140 should view value as null in attribute filter', function() {
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
                        type: 'SIMPLE',
                        values: [{
                            keyNull: true,
                            selected: true
                        }]
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
        var filterModel = new AttributeFilterModel(
            {
                vizJson: mockFilterModelJson
            },
            filter
        );
        var selectedItems = filterModel.getSelectedFilterItems();
        var selectedKeys = Object.keys(selectedItems);
        expect(selectedKeys[0]).toBe('{Null}');
    });

    it('SCAL-20002 should not show null in attribute filter', function() {
        var mockFilterJson = {
            filterContent: {
                type: 'SIMPLE',
                rows: [
                    {
                        column: {
                            effectiveType: 'a',
                            effectiveDataType: 'a'
                        },
                        negation: true,
                        oper: 'EQ',
                        type: 'SIMPLE',
                        values: [{
                            keyNull: true,
                            selected: true
                        }]
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
        var filterModel = new AttributeFilterModel(
            {
                vizJson: mockFilterModelJson
            },
            filter
        );
        var selectedItems = filterModel.getSelectedFilterItems();
        var selectedKeys = Object.keys(selectedItems);
        expect(selectedKeys.length).toBe(0);
    });
});
