/**
 * Copyright: ThoughtSpot Inc. 2013
 *
 * @fileoverview Jasmine spec for visualization model
 */

'use strict';

describe('Visualization model', function() {

    var basePath = getBasePath(document.currentScript.src);
    var VisualizationModel, vizModel, VisualizationColumnModel, dateUtil, vizContextMenuUtil;

    function getVizColumn(effectiveType, effectiveDataType, optBaseType, formatPattern) {
        var metadata = {
                header: {},
                vizContent: {
                    vizType: 'HEADLINE',
                    columns: [
                        {
                            column: {
                                header: {
                                    id: 'c1',
                                    name: 'n1'
                                },
                                type: optBaseType || effectiveType,
                                dataType: ' '
                            },
                            effectiveType: effectiveType,
                            effectiveAggrType: 'NONE',
                            effectiveDataType: effectiveDataType,
                            formatPattern: formatPattern || 'MM/dd/yyyy'
                        }
                    ]
                }
            },
            data = {};

        var vizModel = new VisualizationModel({
            vizJson: metadata,
            vizData: data
        });
        return new VisualizationColumnModel(vizModel.getColumns()[0], 0);
    }

    beforeEach(function(done) {
        module('blink.app');

        /* global mockSessionTimezone */
        mockSessionTimezone();
        System.import('src/modules/viz-layout/viz/visualization-model').
            then(function() {
                inject(function($injector) {
                    dateUtil = $injector.get('dateUtil');
                    VisualizationModel = $injector.get('VisualizationModel');
                    VisualizationColumnModel = $injector.get('VisualizationColumnModel');
                    vizContextMenuUtil = $injector.get('vizContextMenuUtil');
                    dateUtil.initialize();
                });

                var metadata = {
                        complete: true,
                        header: {},
                        vizContent: {
                            vizType: 'TABLE',
                            columns: [
                                {
                                    column: {
                                        header: {
                                            id: 'c1',
                                            name: 'n1'
                                        },
                                        type: ' ',
                                        dataType: ' '
                                    },
                                    effectiveType: 'ATTRIBUTE',
                                    effectiveAggrType: 'NONE',
                                    effectiveDataType: 'VARCHAR'
                                }, {
                                    column: {
                                        header: {
                                            id: 'c2',
                                            name: 'n2'
                                        },
                                        type: ' ',
                                        dataType: ' '
                                    },
                                    effectiveType: 'MEASURE',
                                    effectiveAggrType: 'AVERAGE',
                                    effectiveDataType: 'DOUBLE'
                                }
                            ]
                        }
                    },
                    data = {};

                vizModel = new VisualizationModel({
                    vizJson: metadata,
                    vizData: data
                });
                done();
            });
    });

    describe('Visualization column convertValueToSageValue', function(){
        it('should be a noop for {Null}', function(){
            expect(getVizColumn('ATTRIBUTE', 'DATE').convertValueToSageValue('{Null}')).toBe('{Null}');
        });
    });

    describe('Column formatter tests', function () {
        var currentDate = new Date(),
            epoch = currentDate.getTime(),
            dateUtil;

        /* eslint camelcase: 1 */
        beforeEach(inject(function (_dateUtil_) {
            dateUtil = _dateUtil_;
        }));



        function formattedDate(format) {
            format = format || 'MM/dd/yyyy';
            return dateUtil.formatDate(epoch, format);
        }

        it('should return base type formatter for numeric attribute + no aggr', function () {
            expect(getVizColumn('ATTRIBUTE', 'INT64').getDataFormatter()(1000)).toBe(1000);
            expect(getVizColumn('ATTRIBUTE', 'INT32').getDataFormatter()(1000)).toBe(1000);
            expect(getVizColumn('ATTRIBUTE', 'DOUBLE').getDataFormatter()(1000.12)).toBe(1000.12);
            expect(getVizColumn('ATTRIBUTE', 'FLOAT').getDataFormatter()(1000.12)).toBe(1000.12);
        });

        it('should return floating type formatter for measure + avg aggr', function () {
            expect(getVizColumn('MEASURE', 'INT64', void 0, '#,###.00').getDataFormatter('AVERAGE')(
                1000,
                {noShorten: true}
            )).toBe('1,000.00');
        });

        it('should return numeric type formatter for measure + count aggr', function () {
            expect(getVizColumn('MEASURE', 'DOUBLE').getDataFormatter('COUNT')(
                1000))
                .toBe('1K');
        });

        it('should return base type formatter for non-numeric attribute + min/max aggr', function () {
            expect(getVizColumn('ATTRIBUTE', 'VARCHAR').getDataFormatter()(1000)).toBe(1000);
            expect(getVizColumn('ATTRIBUTE', 'VARCHAR').getDataFormatter('MIN')(1000)).toBe(1000);
            expect(getVizColumn('ATTRIBUTE', 'VARCHAR').getDataFormatter('MAX')(1000)).toBe(1000);
        });

        it('should return numeric type formatter for non-numeric attribute + count aggr', function () {
            expect(getVizColumn('ATTRIBUTE', 'VARCHAR').getDataFormatter('COUNT')(1000)).toBe('1K');
            expect(getVizColumn('ATTRIBUTE', 'VARCHAR').getDataFormatter('COUNT_DISTINCT')(1000)).toBe('1K');
        });

        it('should return base type formatter for date attribute + min/max aggr', function () {
            expect(getVizColumn('ATTRIBUTE', 'DATE').getDataFormatter()(epoch)).toBe(formattedDate());
            expect(getVizColumn('ATTRIBUTE', 'DATE').getDataFormatter('MIN')(epoch)).toBe(formattedDate());
            expect(getVizColumn('ATTRIBUTE', 'DATE').getDataFormatter('MAX')(epoch)).toBe(formattedDate());
        });

        it('should correctly optimize date formats for date attribute', function() {
            expect(getVizColumn('ATTRIBUTE', 'DATE').getDataFormatter()(epoch, {omitYear: true})).toBe(formattedDate('MMM dd'));
            var vizColumn = getVizColumn('ATTRIBUTE', 'DATE', null, 'MM/dd/yyyy \'Week\'');
            expect(vizColumn.getDataFormatter()(epoch, {omitYear: true})).toBe(formattedDate('MMM dd'));
            expect(vizColumn.getDataFormatter()(epoch)).toBe(formattedDate('MM/dd/yyyy'));
        });

        it('should return base type formatter for date attribute + count aggr', function () {
            expect(getVizColumn('ATTRIBUTE', 'DATE').getDataFormatter('COUNT')(1000000)).toBe('1M');
        });

        it('should convert datetime to sage value in a non-localized format', function(){
            // there would be a comma in the date in the date localized for en_US
            var vizCol = getVizColumn('ATTRIBUTE', 'DATE_TIME');
            var sageValue = vizCol.convertValueToSageValue(1464144079483);
            expect(sageValue).toBe('05/24/2016 19:41:19');
        });

        it('should be able to convert localized numeric strings to raw numbers for sage', function(){
            var vizCol = getVizColumn('MEASURE', 'INT64');
            var sageValue = vizCol.convertValueToSageValue('100,000');
            expect(sageValue).toBe(100000);
        });
    });

    describe('Model client state tests', function () {
        it('should be able to get/set client state value', function () {
            var key1 = 'key1';
            var key2 = 'a.b';
            var value1 = 'value1';
            var value2 = 'value2';

            // Test1 : values directly set in JSON should be queryable.
            vizModel._vizJson.header.clientState = {};
            vizModel._vizJson.header.clientState.key1 = value1;
            vizModel._vizJson.header.clientState.a = {};
            vizModel._vizJson.header.clientState.a.b = value2;

            expect(vizModel.getUserData(key1)).toBe(value1);
            expect(vizModel.getUserData(key2)).toBe(value2);

            vizModel.clearUserData(key1);
            vizModel.clearUserData(key2);

            expect(vizModel.getUserData(key1)).toBe(void 0);
            expect(vizModel.getUserData(key2)).toBe(void 0);

            // Test2: set values using API should set the json.
            vizModel.setUserData(key1, value1);
            vizModel.setUserData(key2, value2);

            expect(vizModel._vizJson.header.clientState.key1).toBe(value1);
            expect(vizModel._vizJson.header.clientState.a.b).toBe(value2);
        });
    });

    describe('underlying data access permission test', function () {

        function createDocPermission(isMissingUnderlyingAccess) {
            return {
                isMissingUnderlyingAccess: jasmine.createSpy()
                    .and.returnValue(isMissingUnderlyingAccess),
            };
        }

        it('should respect individual viz permission', function () {
            var ansModel = {
                getPermission: jasmine.createSpy().and.returnValue(createDocPermission(true))
            };

            ansModel.getPermission().getAnswerDocumentPermission = function (vizAnsBookId) {
                var m = {
                    VIZ_1_ANS_ID: createDocPermission(true),
                    VIZ_2_ANS_ID: createDocPermission(false)
                };
                return m[vizAnsBookId];
            };

            var vizModels = {
                VIZ_1_ANS_ID: _.cloneDeep(vizModel),
                VIZ_2_ANS_ID: _.cloneDeep(vizModel)
            };
            _.forEach(vizModels, function (viz, vizAnsDocId) {
                viz.setContainingAnswerModel(ansModel);
                spyOn(viz, 'isPinboardViz').and.returnValue(true);
                spyOn(viz, 'getAnswerBookIdThroughReferencingViz').and.returnValue(vizAnsDocId);
            });

            vizContextMenuUtil.isVizContextMenuAllowedOnData = function () {
                return true;
            };
            // if it is pinboard viz, it should get permission for it's own permission object.
            expect(vizModels.VIZ_1_ANS_ID.isMissingUnderlyingDataAccess()).toBe(true);
            expect(vizModels.VIZ_2_ANS_ID.isMissingUnderlyingDataAccess()).toBe(false);

            // if it is not a pinboard viz, it should return containing ans model's permission
            vizModels.VIZ_2_ANS_ID.isPinboardViz.and.returnValue(false);
            expect(vizModels.VIZ_2_ANS_ID.isMissingUnderlyingDataAccess()).toBe(true);
        });
    });
});
