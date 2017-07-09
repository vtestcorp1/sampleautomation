/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for worksheet builder service
 */

'use strict';

/* eslint camelcase: 1 */
describe('Worksheet builder', function () {
    var mockAutoCompleteService,
        mockJoinLauncher,
        mockLoadingIndicator,
        mockDialog,
        mockWorksheetService,
        mockAlertService;

    var columnGuidCounter = 0;

    function initMockServices() {
        // sageService
        mockAutoCompleteService = jasmine.createSpyObj('autoCompleteService', [
            'updateWorksheet',
            'transformWorksheet',
            'removeAllBrokenColumnsFromWorksheet'
        ]);

        mockWorksheetService = jasmine.createSpyObj('worksheetService', [
            'getWorksheet'
        ]);

        mockJoinLauncher = jasmine.createSpyObj('joinLauncher', [
            'launch'
        ]);

        mockLoadingIndicator = jasmine.createSpyObj('loadingIndicator', [
            'show',
            'hide'
        ]);

        mockDialog = jasmine.createSpyObj('dialog', [
            'show'
        ]);

        mockAlertService = jasmine.createSpyObj('alertService', [
            'showAlert'
        ]);
    }

    var LogicalColumn,
        _WorksheetModel,
        _$q,
        _$rootScope,
        _blinkConstants,
        _strings,
        _events,
        _jsonConstants,
        _autoCompleteObjectUtil,
        _alertConstants;
    var _worksheetBuilder, _SageResponse;
    beforeEach(function () {
        module('blink.app', function ($provide) {
            initMockServices();
            $provide.value('autoCompleteService', mockAutoCompleteService);
            $provide.value('worksheetService', mockWorksheetService);
            $provide.value('joinWorkflowLauncher', mockJoinLauncher);
            $provide.value('loadingIndicator', mockLoadingIndicator);
            $provide.value('dialog', mockDialog);
            $provide.value('alertService', mockAlertService);
        });

        inject(function ($rootScope, $q, LogicalTableModel, WorksheetModel, worksheetBuilder, jsonConstants,
                         blinkConstants, strings, events, alertConstants, autoCompleteObjectUtil, SageResponse) {
            _$rootScope = $rootScope;
            _$q = $q;
            LogicalColumn = LogicalTableModel.LogicalColumn;
            _WorksheetModel = WorksheetModel;
            _worksheetBuilder = worksheetBuilder;
            _jsonConstants = jsonConstants;
            _blinkConstants = blinkConstants;
            _strings = strings;
            _events = events;
            _alertConstants = alertConstants;
            _autoCompleteObjectUtil = autoCompleteObjectUtil;
            _SageResponse = SageResponse;
        });
    });

    function createExistingWorksheetModel(tokensList) {
        var model = createWorksheetModel(tokensList);
        var context = new sage.ACContext();
        var table = new sage.ACTable();
        var tokens = tokensList.map(function (token) {
            var rt = sage.RecognizedToken.createAttributeToken(token);
            rt.guid = token;
            return rt;
        });
        table.setTokens(tokens);
        context.setTables([table]);
        model.setSageContext(context);
        return model;
    }
    function createDocumentConfig(model) {
        var context = !!model ? model.getSageContext() : _autoCompleteObjectUtil.getNewACContextWithTable();

        return {
            model: model,
            sageClient: {
                getContext: function() {
                    return context;
                },
                setContext: function(newContext) {
                    context = newContext;
                }
            },
            updateFromModel: function (newModel) {
                this.model = newModel;
            }
        };
    }
    function createLogicalColumn(columnName, columnGuid) {
        columnGuid = columnGuid || columnName;
        return (function(){
            return {
                getName: function () {
                    return columnName;
                },
                getGuid: function () {
                    return columnGuid;
                },
                getSageOutputColumnId: function () {
                    return columnGuid;
                },
                isFormula: function () {
                    return false;
                },
                setName: function (newName) {
                    columnName = newName;
                }
            };
        })();
    }
    function createWorksheetModel(columns) {
        var question = {};
        question[_jsonConstants.SAGE_CONTEXT_PROTO_KEY] = _autoCompleteObjectUtil.getNewACContextWithTable();
        question[_jsonConstants.SAGE_CONTEXT_INDEX_KEY] = 0;

        return (function(){
            var sageContext = question[_jsonConstants.SAGE_CONTEXT_PROTO_KEY];
            var shouldForceSave = false;
            return {
                getColumns: function () {
                    return columns;
                },
                shouldForceSave: function () {
                    return shouldForceSave;
                },
                setShouldForceSave: function (val) {
                    shouldForceSave = val;
                },
                setSageContext: function (newSageContext) {
                    sageContext = newSageContext;
                },
                getSageContext: function () {
                    return sageContext;
                },
                getRecognizedTokens: function () {
                    var table = sageContext.getTables()[0];
                    return table ? table.getTokens() : [];
                }
            };
        })();
    }

    function getWorksheetResponse (query, errorCode) {
        var worksheetResponse = new sage.WorksheetResponse();

        var error = new sage.ErrorCollection();
        error.error = new sage.Error();
        error.error.error_code = errorCode;
        error.error.error_message = '';

        var table = new sage.ACTable({
            query: query,
            error: error
        });

        table.setTokens([]);

        var context = new sage.ACContext();
        context.table = [table];

        worksheetResponse.context = context;
        worksheetResponse.resp = new sage.ACTableResponse();
        worksheetResponse.info = new sage.ACResponseInfo();

        return worksheetResponse;
    }

    it('should not make any backend calls when invalid input is provided', function () {
        _worksheetBuilder.addColumns();
        _worksheetBuilder.addColumns([], createDocumentConfig());
        expect(mockAutoCompleteService.updateWorksheet.calls.count()).toBe(0);
        expect(mockAutoCompleteService.transformWorksheet.calls.count()).toBe(0);
        expect(mockWorksheetService.getWorksheet.calls.count()).toBe(0);
        expect(mockLoadingIndicator.show.calls.count()).toBe(0);
    });

    it('should make sage transform call for new columns addition', function () {
        mockAutoCompleteService.transformWorksheet.and.returnValue(_$q.defer().promise);
        expect(mockAutoCompleteService.transformWorksheet.calls.count()).toBe(0);
        _worksheetBuilder.addColumns([createLogicalColumn('color')], createDocumentConfig());
        expect(mockAutoCompleteService.transformWorksheet.calls.count()).toBe(1);
        expect(mockAutoCompleteService.transformWorksheet.calls.mostRecent().args[0]).toBeDefined();
        expect(mockAutoCompleteService.transformWorksheet.calls.mostRecent().args[1].length).toBe(1);
        expect(mockAutoCompleteService.transformWorksheet.calls.mostRecent().args[1][0].type).toBe(sage.QueryTransformType.ADD_COLUMN);
        expect(mockAutoCompleteService.transformWorksheet.calls.mostRecent().args[1][0].column_guid).toBe('color');
        expect(mockLoadingIndicator.show.calls.count()).toBe(1);
        // Hide isn't called until callosum call is done (or one of the error cases).
        expect(mockLoadingIndicator.hide.calls.count()).toBe(0);
    });

    it('should make a callosum post query call for new columns addition', function () {
        var transformedTokensResponseDeferred = _$q.defer();
        mockAutoCompleteService.transformWorksheet.and.returnValue(transformedTokensResponseDeferred.promise);
        _worksheetBuilder.addColumns([createLogicalColumn('color')], createDocumentConfig());

        mockWorksheetService.getWorksheet.and.returnValue(_$q.defer().promise);

        expect(mockWorksheetService.getWorksheet.calls.count()).toBe(0);

        var query = new sage.SageProgram({
            program_type: "CHASM_TRAP"
        });
        var resolvedObject = new _SageResponse(getWorksheetResponse(query, sage.ErrorCode.SUCCESS));
        transformedTokensResponseDeferred.resolve(resolvedObject);

        _$rootScope.$apply();
        expect(mockWorksheetService.getWorksheet.calls.count()).toBe(1);
        expect(mockWorksheetService.getWorksheet.calls.mostRecent().args.length).toBe(2);
        var context = mockWorksheetService.getWorksheet.calls.mostRecent().args[0].sageContextProto;
        expect(sage.serialize(context.getTables()[0].getQuery()).length).toBe(3);
        expect(context.getTables()[0].getTokens().length).toBe(0);
        expect(mockWorksheetService.getWorksheet.calls.mostRecent().args[1].model).toBeFalsy();
        expect(mockLoadingIndicator.show.calls.count()).toBe(1);
        // Hide isn't called until callosum call is done (or one of the error cases).
        expect(mockLoadingIndicator.hide.calls.count()).toBe(0);
    });

    it('should get an updated model for new columns addition', function () {
        var transformedTokensResponseDeferred = _$q.defer();
        mockAutoCompleteService.transformWorksheet.and.returnValue(transformedTokensResponseDeferred.promise);
        var callosumResponseDeferred = _$q.defer();
        mockWorksheetService.getWorksheet.and.returnValue(callosumResponseDeferred.promise);
        var documentConfig = createDocumentConfig();
        _worksheetBuilder.addColumns([createLogicalColumn('color')], documentConfig);

        var query = new sage.SageProgram({
            program_type: "CHASM_TRAP"
        });
        transformedTokensResponseDeferred.resolve(new _SageResponse(getWorksheetResponse(query, sage.ErrorCode.SUCCESS)));

        _$rootScope.$apply();
        var updateModel = createWorksheetModel([]);

        expect(documentConfig.model).toBeFalsy();
        callosumResponseDeferred.resolve({data: updateModel});
        _$rootScope.$apply();

        expect(documentConfig.model).toBe(updateModel);
        expect(mockLoadingIndicator.show.calls.count()).toBe(1);
        expect(mockLoadingIndicator.hide.calls.count()).toBe(1);
    });

    it('should launch prefix dialog when a column with same name as an existing column is added', function(){
        var transformedTokensResponseDeferred = _$q.defer();
        mockAutoCompleteService.transformWorksheet.and.returnValue(transformedTokensResponseDeferred.promise);

        var callosumResponseDeferred = _$q.defer();
        mockWorksheetService.getWorksheet.and.returnValue(callosumResponseDeferred.promise);

        var firstColumn = createLogicalColumn('color', 'color-1');
        var secondColumn = createLogicalColumn('color', 'color-2');

        var documentConfig = createDocumentConfig();
        var oldModel = createWorksheetModel([firstColumn]);
        documentConfig.model = oldModel;

        _worksheetBuilder.addColumns([secondColumn], documentConfig);

        var query = new sage.SageProgram({
            program_type: "SIMPLE"
        });
        var sageResponse = new _SageResponse(getWorksheetResponse(query, sage.ErrorCode.SUCCESS));
        transformedTokensResponseDeferred.resolve(sageResponse);

        _$rootScope.$apply();
        var updatedModel = createWorksheetModel([firstColumn, secondColumn]);

        expect(documentConfig.model).toBeTruthy();
        callosumResponseDeferred.resolve({data: updatedModel});
        _$rootScope.$apply();

        expect(mockDialog.show).toHaveBeenCalled();
        expect(mockDialog.show.calls.mostRecent().args[0].customData).toEqual({
            shouldPrefixOnlyConflictColumns: true,
            diffCols: [{
                column: secondColumn,
                nameConflict: true
            }]
        });
    });

    it('should show an error and avoid callosm call for new columns addition when sage transform fails', function () {
        var transformedTokensResponseDeferred = _$q.defer();
        mockAutoCompleteService.transformWorksheet.and.returnValue(transformedTokensResponseDeferred.promise);
        var documentConfig = createDocumentConfig();
        _worksheetBuilder.addColumns([createLogicalColumn('color')], documentConfig);

        var query = new sage.SageProgram({
        });
        transformedTokensResponseDeferred.resolve(new _SageResponse(getWorksheetResponse(query, sage.ErrorCode.PERMISSION_DENIED)));

        _$rootScope.$apply();

        expect(mockWorksheetService.getWorksheet).not.toHaveBeenCalled();
        expect(mockAlertService.showAlert).toHaveBeenCalledWith(jasmine.objectContaining({
            type: _alertConstants.type.ERROR
        }));
    });

    it('should attempt a explicit join path request to sage when same column is added twice', function () {
        var transformedTokensResponseDeferred = _$q.defer();
        mockAutoCompleteService.transformWorksheet.and.returnValue(transformedTokensResponseDeferred.promise);

        var existingModel = createExistingWorksheetModel(['datekey', 'part name']);
        var documentConfig = createDocumentConfig(existingModel);
        _worksheetBuilder.addColumns([createLogicalColumn('datekey')], documentConfig);

        expect(mockAutoCompleteService.transformWorksheet.calls.count()).toBe(1);
        var context = mockAutoCompleteService.transformWorksheet.calls.mostRecent().args[0];
        var tokenArgument = context.getTables()[0].getTokens();
        expect(tokenArgument.length).toBe(3);  // 2 existing tokens + 1 additional datekey token.
        expect(tokenArgument[2].getExplicitJoinPathEditBit()).toBeTruthy();

        // Verify that the document tokens and sage context tokens are not modified yet.
        var docTokens = existingModel.getRecognizedTokens();
        var contextTokens = documentConfig.sageClient.getContext().getTable()[0].getTokens();
        expect(docTokens.length).toBe(2);
        expect(contextTokens.length).toBe(2);
        expect(docTokens.any(function (token) {
            return token.getExplicitJoinPathEditBit();
        })).toBeFalsy();
        expect(contextTokens.any(function (token) {
            return token.getExplicitJoinPathEditBit();
        })).toBeFalsy();
    });

    it('should launch join workflow ui when same column is added twice with MJP', function () {
        var transformedTokensResponseDeferred = _$q.defer();
        mockAutoCompleteService.transformWorksheet.and.returnValue(transformedTokensResponseDeferred.promise);

        var existingModel = createExistingWorksheetModel(['datekey', 'part name']);
        _worksheetBuilder.addColumns([createLogicalColumn('datekey')], createDocumentConfig(existingModel));

        var joinLauncherDeferred = _$q.defer();
        mockJoinLauncher.launch = jasmine.createSpy().and.returnValue(joinLauncherDeferred.promise);

        var getWorksheetDeferred = _$q.defer();
        mockWorksheetService.getWorksheet.and.returnValue(getWorksheetDeferred.promise);

        expect(mockJoinLauncher.launch.calls.count()).toBe(0);
        var query = new sage.SageProgram({
        });
        var joinPathAmbiguityResponse = getWorksheetResponse(query, sage.ErrorCode.JOIN_PATH_AMBIGUITY);
        joinPathAmbiguityResponse.resp.join_path_ambiguity = [
            new sage.JoinPathCollection({
                // More than 1 choice will launch the MJP ui.
                choice: [new sage.JoinPathChoice(), new sage.JoinPathChoice()]  // We don't care about actual choices here.
            })
        ];
        transformedTokensResponseDeferred.resolve(new _SageResponse(joinPathAmbiguityResponse));
        _$rootScope.$apply();

        expect(mockJoinLauncher.launch.calls.count()).toBe(1);
        expect(mockJoinLauncher.launch.calls.mostRecent().args.length).toBe(4);
        expect(mockAutoCompleteService.updateWorksheet.calls.count()).toBe(0);
        // The 3rd argument is a done callback of MJP.
        joinLauncherDeferred.resolve(['resolvedToken']);

        transformedTokensResponseDeferred = _$q.defer();
        mockAutoCompleteService.transformWorksheet.and.returnValue(transformedTokensResponseDeferred.promise);
        query = new sage.SageProgram({
            program_type: "CHASM_TRAP"
        });
        var successResponse = getWorksheetResponse(query, sage.ErrorCode.SUCCESS);
        transformedTokensResponseDeferred.resolve(new _SageResponse(successResponse));

        getWorksheetDeferred.resolve({data: existingModel});

        _$rootScope.$apply();

        expect(mockAutoCompleteService.updateWorksheet.calls.count()).toBe(1);
        expect(mockAutoCompleteService.updateWorksheet.calls.mostRecent().args[1].getInputTokens()[0]).toBe('resolvedToken');
        expect(mockLoadingIndicator.show.calls.count()).toBe(2);
        expect(mockLoadingIndicator.hide.calls.count()).toBe(2);
    });

    it('should show a dialog if new columns are added with no join path with the existing ones', function () {
        var transformedTokensResponseDeferred = _$q.defer();
        mockAutoCompleteService.transformWorksheet.and.returnValue(transformedTokensResponseDeferred.promise);
        _worksheetBuilder.addColumns([createLogicalColumn('color')], createDocumentConfig());

        expect(mockWorksheetService.getWorksheet.calls.count()).toBe(0);
        expect(mockAutoCompleteService.transformWorksheet.calls.count()).toBe(1);
        expect(mockLoadingIndicator.show.calls.count()).toBe(1);

        var query = new sage.SageProgram({
            program_type: "CHASM_TRAP"
        });
        transformedTokensResponseDeferred.resolve(new _SageResponse(getWorksheetResponse(query, sage.ErrorCode.NO_JOIN_PATH)));
        _$rootScope.$apply();

        // No query call should be made
        expect(mockWorksheetService.getWorksheet.calls.count()).toBe(0);
        expect(mockAutoCompleteService.transformWorksheet.calls.count()).toBe(1);

        // Hide should be called
        expect(mockLoadingIndicator.hide.calls.count()).toBe(1);

        // No additional request has been made.
        expect(mockWorksheetService.getWorksheet.calls.count()).toBe(0);
        expect(mockAutoCompleteService.transformWorksheet.calls.count()).toBe(1);

        //TODO(Rahul): Make alertService check here.
    });

    it('should set force save true for after fix of broken worksheet', function () {
        var existingModel = createWorksheetModel([
            createLogicalColumn('datekey', 'datekey'),
            createLogicalColumn('part name', 'part name')
        ]);

        var transformedTokensResponseDeferred = _$q.defer();

        mockAutoCompleteService.removeAllBrokenColumnsFromWorksheet
            .and.returnValue(transformedTokensResponseDeferred.promise);
        var documentConfig = createDocumentConfig(existingModel);
        _worksheetBuilder.removeAllBrokenColumns(documentConfig);

        expect(mockDialog.show).toHaveBeenCalled();
        mockDialog.show.calls.mostRecent().args[0].onConfirm();


        var query = new sage.SageProgram({
            program_type: "CHASM_TRAP"
        });
        var successResponse = getWorksheetResponse(query, sage.ErrorCode.SUCCESS);
        transformedTokensResponseDeferred.resolve(new _SageResponse(successResponse));

        var getWorksheetDeferred = _$q.defer();
        mockWorksheetService.getWorksheet.and.returnValue(getWorksheetDeferred.promise);

        getWorksheetDeferred.resolve({data: existingModel});
        _$rootScope.$apply();

        expect(existingModel.shouldForceSave()).toBe(true);
    });

    // TODO(vibhor/shikhar): Add test coverage for all of the following public methods
    // - worksheetBuilder.addColumns (above are just examples on how to do it, more are needed)
    // - worksheetBuilder.removeColumns
    // - worksheetBuilder.editJoinPathForColumn
    // - worksheetBuilder.handleBulkPrefix
    // - worksheetBuilder.updateColumnName
});
