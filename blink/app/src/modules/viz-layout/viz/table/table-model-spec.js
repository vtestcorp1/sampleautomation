/**
 * Copyright: ThoughtSpot Inc. 2013
 *
 * @fileoverview Jasmine spec for table model
 */

'use strict';

describe('Table model', function() {

    var TableModel, tableModel, mocks;
    beforeEach(function() {
        module('blink.app');
        // This load will override the real definitions with the mocks specified above.
        inject(function($injector) {
            TableModel = $injector.get('TableModel');
            mocks = $injector.get('mocks');
        });

        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'TABLE',
                    columns: [
                        mocks.getVisualizationColumn('c1', 'n1', {
                            effectiveType: 'ATTRIBUTE',
                            effectiveAggrType: 'NONE',
                            effectiveDataType: 'VARCHAR'
                        }),
                        mocks.getVisualizationColumn('c2', 'n2', {
                            effectiveType: 'MEASURE',
                            effectiveAggrType: 'AVERAGE',
                            effectiveDataType: 'DOUBLE'
                        })
                    ]
                }
            },
            data = {};

        tableModel = new TableModel({
            vizJson: metadata,
            vizData: data
        });
    });

    it('should initialize with no data', function() {
        expect(tableModel.hasError()).toBeFalsy();
    });
});
