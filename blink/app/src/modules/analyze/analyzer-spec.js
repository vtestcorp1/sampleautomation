/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh
 *
 * @fileoverview Unit test for Analyzer Component. Analyzer component analyzes a metatada object,
 * fetches the list of remarks and then presents in the UI via the Analyzer Component.
 *
 * Conceptually this is similar to linting of TS files. We anaylze (lint) the metadata object by
 * performing static analysis of metadata.
 *
 * More info in:
 * PRD: https://docs.google.com/document/d/1Q6djsiZ0J-sJLu3cwIoqc626Ao_CDr9HONfNGD0bXZ4
 * Rules: https://docs.google.com/spreadsheets/d/1GvyRDtXWbnx7KtC6XOMcmEU7_Oz4tTPevwvx1tcZFq8
 *
 */

'use strict';

describe('verify analyzer remarks are fetched and processed.', function () {

    var testTableId = 'TestLogicalTableGuid';
    var AnalyzerComponent;
    var jsonConstants;
    var mockMetadataService = {};
    var metadataPromiseDeferred;
    var onSaveFromAnalyzer;
    var logicalModel;
    var ViolationConstants;
    var CommonPrefixAnalyzerComponent;

    var longTableName = 'TableNameWhichIsMoreThan50CharsLong' + '1234567890' + '1234567890'
        + '1234567890' + '1234567890' + '1234567890';

    var longColumnName = 'ColumnNameWhichIsMoreThan50CharsLong' + '1234567890' + '1234567890'
        + '1234567890' + '1234567890' + '1234567890';

    var _$q;
    var _$scope;

    beforeEach(function() {
        module('blink.app');
        module(function ($provide) {
            $provide.value('metadataService', mockMetadataService);
        });


        inject(function ($rootScope,
                         $injector,
                         $q) {
            _$scope = $rootScope.$new();
            _$q = $q;
            AnalyzerComponent = $injector.get('AnalyzerComponent');
            CommonPrefixAnalyzerComponent = $injector.get('CommonPrefixAnalyzerComponent');
            ViolationConstants = $injector.get('ViolationConstants');
            jsonConstants = $injector.get('jsonConstants');
        });

        metadataPromiseDeferred = _$q.defer();
        mockMetadataService.analyze = jasmine.createSpy().and
            .returnValue(metadataPromiseDeferred.promise);

        onSaveFromAnalyzer = jasmine.createSpy();

        logicalModel = {
            getMetadataType : function() {
                return ViolationConstants.metadataTypes.LogicalTable;
            },
            getId : function() {
                return testTableId;
            },
            getMetadataSubType : function() {
                return 'subType';
            },
            getName : function () {
                return longTableName;
            },
            getDescription : function () {
                return 'dontCareAboutDescription';
            },
            getColumnsMap : function () {
                return {
                    'ColumnId1': {
                        name: longColumnName,
                        getGuid: function() {
                            return 'guid'
                        },
                        getName: function () {
                            return this.name;
                        },
                        setName : function (columnName) {
                            this.name = columnName;
                        }
                    }
                }
            }
        };

    });

    function failTest(error) {
        expect(error).toBeUndefined();
    }

    function resolve(deferred, data, isResolve) {
        if (isResolve) {
            deferred.resolve(data);
        } else {
            deferred.reject(data);
        }
        _$scope.$apply();
    }

    it('should handle empty suggestions gracefully', function (done) {
        var analyzer = new AnalyzerComponent(
            onSaveFromAnalyzer,
            logicalModel
        );

        expect(analyzer.id).toBe(testTableId);
        expect(analyzer.isReady).toBe(false);
        expect(analyzer.totalViolationsCount).toBe(0);
        expect(analyzer.violations).toBeUndefined();

        // expect all controllers to be undefined
        expect(analyzer.longTableNameAnalyzer).toBeUndefined();
        expect(analyzer.longColumnNamesAnalyzer).toBeUndefined();
        expect(analyzer.chasmTrapAnalyzer).toBeUndefined();
        expect(analyzer.highColumnNumbersAnalyzer).toBeUndefined();
        expect(analyzer.highIndexedColumnNumbersAnalyzer).toBeUndefined();
        expect(analyzer.systemKeywordsAnalyzer).toBeUndefined();
        expect(analyzer.commonPrefixAnalyzer).toBeUndefined();

        // Now fake that we fetched empty remarks from callosum.
        var analyzeResponse = {
            data: []
        };

        // after fetching empty remarks, expect that all sub controllers are set explicitly to null.
        analyzer.fetchRemarks()
            .then(function () {
                expect(mockMetadataService.analyze).toHaveBeenCalled();
                expect(mockMetadataService.analyze).toHaveBeenCalledTimes(1);

                // expect that analyzer control is ready with zero violations count.
                expect(analyzer.isReady).toBe(true);
                expect(analyzer.totalViolationsCount).toBe(0);
                expect(analyzer.violations).toBeDefined();
                expect(analyzer.violations.totalCount()).toBe(0);

                // expect all controllers to be initialized to null since we have no suggestions.
                expect(analyzer.longTableNameAnalyzer).toBeNull();
                expect(analyzer.longColumnNamesAnalyzer).toBeNull();
                expect(analyzer.chasmTrapAnalyzer).toBeNull();
                expect(analyzer.highColumnNumbersAnalyzer).toBeNull();
                expect(analyzer.highIndexedColumnNumbersAnalyzer).toBeNull();
                expect(analyzer.systemKeywordsAnalyzer).toBeNull();
                expect(analyzer.commonPrefixAnalyzer).toBeNull();
            })
            .catch(failTest)
            .finally(done);

        resolve(metadataPromiseDeferred, analyzeResponse, true);
    });

    it('should handle long table name suggestion', function (done) {
        var analyzer = new AnalyzerComponent(
            onSaveFromAnalyzer,
            logicalModel
        );

        var analyzeResponse = {
            data: [
                {
                    'ruleType': 'MaxLengthExceeded',
                    'ruleId': 10001,
                    'ruleName': 'Name length exceeded limit',
                    'rationale': 'Long names are hard to search',
                    'ruleSubType': 'Naming',
                    'violationMessage': {
                        'type': ViolationConstants.metadataTypes.LogicalTable,
                        'id': '191111f7-2922-4393-8402-12684cce4f61',
                        'recommendedValue': '50',
                        'actualValue': ""
                    }
                }
            ]
        };

        analyzer.fetchRemarks()
            .then(function() {
                expect(mockMetadataService.analyze).toHaveBeenCalled();
                expect(mockMetadataService.analyze).toHaveBeenCalledTimes(1);
                expect(analyzer.isReady).toBe(true);
                expect(analyzer.totalViolationsCount).toBe(1);
                expect(analyzer.violations).toBeDefined();
                expect(analyzer.violations.totalCount()).toBe(1);

                // expect all other controllers to be null.
                expect(analyzer.longColumnNamesAnalyzer).toBeNull();
                expect(analyzer.chasmTrapAnalyzer).toBeNull();
                expect(analyzer.highColumnNumbersAnalyzer).toBeNull();
                expect(analyzer.highIndexedColumnNumbersAnalyzer).toBeNull();
                expect(analyzer.systemKeywordsAnalyzer).toBeNull();
                expect(analyzer.commonPrefixAnalyzer).toBeNull();

                // Expect the longTableNameAnalyzer to be instantiated and having expected values.
                expect(analyzer.longTableNameAnalyzer).toBeDefined();
                expect(analyzer.longTableNameAnalyzer.tableName).toBe(longTableName);
                expect(analyzer.longTableNameAnalyzer.recommendedLength).toBe(50);
                expect(analyzer.longTableNameAnalyzer.tableNameLength).toBe(longTableName.length);
                expect(analyzer.longTableNameAnalyzer.status).toBe(ViolationConstants.status.Fail);

                // if we save the table name, it should call the
                // dataExplorerController.onSaveClickFromAnalyzer()
                analyzer.longTableNameAnalyzer.tableName = 'CoolShortName';
                expect(analyzer.isSaveDisabled()).toBe(true);
                analyzer.longTableNameAnalyzer.onChange();
                expect(analyzer.isSaveDisabled()).toBe(false);

                // save the table
                analyzer.saveTable();
                expect(onSaveFromAnalyzer).toHaveBeenCalledTimes(1);
            })
            .catch(failTest)
            .finally(done);


        // Resolve the metadataService
        resolve(metadataPromiseDeferred, analyzeResponse, true);
    });

    it('should handle chasm trap suggestion', function (done) {
        var analyzer = new AnalyzerComponent(
            onSaveFromAnalyzer,
            logicalModel
        );

        var analyzeResponse = {
            data: [
                {
                    'ruleType': 'ChasmTrapQueryExists',
                    'ruleId': 12001,
                    'ruleName': 'A query on this Table may involve a chasm trap',
                    'ruleSubType': 'Chasm',
                    'violationMessage': {
                        'type': 'logical_table_type_enum',
                        'id': 'f6884dc3-43f0-4116-b887-376bfa9d31cf',
                        'recommendedValue': "",
                        'actualValue': ""
                    }
                }
            ]
        };

        analyzer.fetchRemarks()
            .then(function() {
                expect(mockMetadataService.analyze).toHaveBeenCalled();
                expect(mockMetadataService.analyze).toHaveBeenCalledTimes(1);
                expect(analyzer.isReady).toBe(true);
                expect(analyzer.totalViolationsCount).toBe(1);
                expect(analyzer.violations).toBeDefined();
                expect(analyzer.violations.totalCount()).toBe(1);

                // expect all other controllers to be null.
                expect(analyzer.longColumnNamesAnalyzer).toBeNull();
                expect(analyzer.longTableNameAnalyzer).toBeNull();
                expect(analyzer.highColumnNumbersAnalyzer).toBeNull();
                expect(analyzer.highIndexedColumnNumbersAnalyzer).toBeNull();
                expect(analyzer.systemKeywordsAnalyzer).toBeNull();
                expect(analyzer.commonPrefixAnalyzer).toBeNull();

                // Expect the chasmAnalyzer to be instantiated
                expect(analyzer.chasmTrapAnalyzer).toBeDefined();
            })
            .catch(failTest)
            .finally(done);


        // Resolve the metadataService
        resolve(metadataPromiseDeferred, analyzeResponse, true);
    });

    it('should handle contains keywords suggestion', function (done) {
        var analyzer = new AnalyzerComponent(
            onSaveFromAnalyzer,
            logicalModel
        );

        var analyzeResponse = {
            data: [
                {
                    'ruleType': 'ContainsSearchKeywords',
                    'ruleId': 10005,
                    'ruleName': 'Name contains search related keywords',
                    'rationale': 'Presence of search keywords may affect readablity and usablity of search bar involving keywords.',
                    'ruleSubType': 'Naming',
                    'violationMessage': {
                        'keywords': [
                            'top',
                            'bottom'
                        ],
                        'type': 'LogicalColumn',
                        'id': 'ColumnId1',
                        'recommendedValue': '',
                        'actualValue': ''
                    }
                }
            ]
        };

        expect(analyzer.fetchCount).toBe(0);
        expect(analyzer.isReady).toBe(false);


        analyzer.fetchRemarks()
            .then(function() {
                expect(mockMetadataService.analyze).toHaveBeenCalled();
                expect(mockMetadataService.analyze).toHaveBeenCalledTimes(1);
                expect(analyzer.isReady).toBe(true);
                expect(analyzer.totalViolationsCount).toBe(1);
                expect(analyzer.violations).toBeDefined();
                expect(analyzer.violations.totalCount()).toBe(1);

                // expect all other controllers to be null.
                expect(analyzer.longColumnNamesAnalyzer).toBeNull();
                expect(analyzer.chasmTrapAnalyzer).toBeNull();
                expect(analyzer.highColumnNumbersAnalyzer).toBeNull();
                expect(analyzer.highIndexedColumnNumbersAnalyzer).toBeNull();
                expect(analyzer.longTableNameAnalyzer).toBeNull();
                expect(analyzer.commonPrefixAnalyzer).toBeNull();

                // Expect the systemKeywordsAnalyzer to be instantiated and having expected values.
                expect(analyzer.systemKeywordsAnalyzer).toBeDefined();
                expect(analyzer.systemKeywordsAnalyzer.systemKeywordsColumns.length).toBe(1);
                var column = analyzer.systemKeywordsAnalyzer.systemKeywordsColumns[0];
                expect(column.newName).toBe(longColumnName);
                expect(column.keywords.length).toBe(2);
                expect(column.keywordsString).toBe('top, bottom');
                expect(analyzer.isSaveDisabled()).toBe(true);

                // if we save the column name, verify save methods are invoked.
                column.newName = 'NewColumnName';
                analyzer.systemKeywordsAnalyzer.onChange(column);
                expect(analyzer.isSaveDisabled()).toBe(false);
                expect(column.origColumn.getName()).toBe('NewColumnName');
            })
            .catch(failTest)
            .finally(done);


        // Resolve the metadataService
        resolve(metadataPromiseDeferred, analyzeResponse, true);
    });

    it('should display no result when fetch remarks fail.', function (done) {
        var analyzer = new AnalyzerComponent(
            onSaveFromAnalyzer,
            logicalModel
        );

        analyzer.fetchRemarks()
            .then(function () {
                expect(mockMetadataService.analyze).toHaveBeenCalled();
                expect(mockMetadataService.analyze).toHaveBeenCalledTimes(1);

                expect(analyzer.isReady).toBe(false);
                expect(analyzer.totalViolationsCount).toBe(0);
                expect(analyzer.violations).toBeUndefined();

                // expect all controllers to be undefined
                expect(analyzer.longTableNameAnalyzer).toBeUndefined();
                expect(analyzer.longColumnNamesAnalyzer).toBeUndefined();
                expect(analyzer.chasmTrapAnalyzer).toBeUndefined();
                expect(analyzer.highColumnNumbersAnalyzer).toBeUndefined();
                expect(analyzer.highIndexedColumnNumbersAnalyzer).toBeUndefined();
                expect(analyzer.systemKeywordsAnalyzer).toBeUndefined();
                expect(analyzer.commonPrefixAnalyzer).toBeUndefined();
            })
            .finally(done);

        // Reject the metadataService with unresolved analyzeResponse
        resolve(metadataPromiseDeferred, null, false);

    });

    it('should find the correct prefix of set of columns', function() {
        var prefix = CommonPrefixAnalyzerComponent.commonPrefix(null);
        expect(prefix).toBe('');
        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['']);
        expect(prefix).toBe('');
        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['abcd']);
        expect(prefix).toBe('abcd');
        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['','abcd']);
        expect(prefix).toBe('');
        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['a','abcd']);
        expect(prefix).toBe('a');
        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['abcd','a']);
        expect(prefix).toBe('a');
        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['abcd','ab']);
        expect(prefix).toBe('ab');
        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['ab','abcd']);
        expect(prefix).toBe('ab');
        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['abcd','abcd']);
        expect(prefix).toBe('abcd');
        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['abc','abcd', 'abcdf','abcde']);
        expect(prefix).toBe('abc');

        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['abc','1', 'abcdf','abcde']);
        expect(prefix).toBe('');

        prefix = CommonPrefixAnalyzerComponent.commonPrefix(['-1','abcd', 'abcdf','abcde']);
        expect(prefix).toBe('');
    });
});

