/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Transformation Editor controller', function() {
    var scope, dataManagementService, $q;

    beforeEach(function() {
        module('blink.app');

        inject(function(_$q_, $rootScope, $controller, _dataManagementService_) {
            $q = _$q_;
            scope = $rootScope.$new();
            scope.transformation = {
                isExisting: false
            };
            scope.dsMetadata = {};
            scope.getTableColumns = $q.when([]);
            dataManagementService = _dataManagementService_;

            $controller('TransformationEditorController', {
                $scope: scope,
                dataManagementService: dataManagementService
            });
        });
    });

    function verifyEditorCompletionsToContain(editor, columns) {
        var currentCompletions;
        var callback = function(err, completions) {
            currentCompletions = completions;
        };
        editor.completers.forEach(function(completer) {
            completer.getCompletions(editor, null, 0, '', callback);
        });
        columns.forEach(function (col) {
            var completion = currentCompletions.find(function (item) {
                return item.name === col.name;
            });
            expect(completion).toBeTruthy();
            expect(completion.meta).toBe('column');
        });
    }

    it('should update column completions on init/table selection', function () {
        scope.transformation.table = {
            name: 'table1'
        };
        scope.tables = [{name:'table1', subItems: []}];
        var columns = [{name: 'col1'}];
        var editor = {
            completers: []
        };
        scope.getTableColumns = function () {
            return $q.when(columns.slice());
        };
        scope.init();
        scope.onEditorLoaded(editor);
        scope.$apply();

        expect(scope.columns.length).toBe(2);
        verifyEditorCompletionsToContain(editor, columns);

        columns = [{name: 'col2'}, {name: 'col3'}];
        scope.updateColumnNames();
        scope.$apply();

        expect(scope.columns.length).toBe(3);
        verifyEditorCompletionsToContain(editor, columns);
    });

    it('should only show columns that are selected during table selection', function () {
        scope.transformation.table = {
            name: 'table1',
            subItems: [{name: 'col2', isChecked: true}, {name: 'col3', isChecked: false}]
        };
        scope.tables = [{name:'table1', subItems: [
            {name: 'col2', isChecked: true}, {name: 'col3', isChecked: false}]}];
        var columns = [{name: 'col2'}, {name: 'col3'}];
        var editor = {
            completers: []
        };
        scope.getTableColumns = function () {
            return $q.when(columns.slice());
        };
        scope.init();
        scope.onEditorLoaded(editor);
        scope.$apply();
        // Including "Add new column" and the one selected column, we have 2 columns to show.
        expect(scope.columns.length).toBe(2);
    });

    it('Do not allow adding new columns for already loaded tables', function () {
        scope.transformation.table = {
            name: 'table1'
        };
        scope.tables = [{name:'table1', subItems: []}];

        var columns = [{name: 'col1'}];
        scope.getTableColumns = function () {
            return $q.when(columns);
        };
        scope.init();
        scope.$apply();

        expect(scope.columns).toBe(columns);
    });

    it('correctly validate the transformation', function () {
        scope.transformationModel = {
            name: 't1'
        };
        var isValid = scope.canAddTransformationToDocument();
        expect(isValid).toBe(false);

        scope.transformationModel = {
            expression: 'exp1'
        };
        isValid = scope.canAddTransformationToDocument();
        expect(isValid).toBe(false);

        scope.transformationModel = {
            name: 't1',
            expression: 'exp1',
            table: {name:'t1'}
        };
        isValid = scope.canAddTransformationToDocument();
        expect(isValid).toBe(true);
    });

    it('correctly validate the transformation using informatica', function () {
        scope.dsMetadata = {
            connectionType : 'mock-conn-type',
            selectedConnection : 'mock-conn'
        };
        scope.transformationModel = {
            name: 't1',
            expression: 'exp1',
            table: {name:'t1'}
        };
        var isValid = scope.canAddTransformationToDocument();
        expect(isValid).toBe(true);

        spyOn(dataManagementService, 'validateTransformationExpression').and.returnValue(
            $q.when('expression is valid')
        );

        scope.onValidateTransformation();
        scope.$apply();
        expect(dataManagementService.validateTransformationExpression).toHaveBeenCalledWith(
            'mock-conn-type',
            'mock-conn',
            't1',
            'exp1'
        );
        expect(scope.footerMessage).not.toBe(undefined);
        expect(scope.error).toBe(undefined);
    });

    it('Do not add transformation to doc if invalid', function () {
        scope.transformationModel = {
            expression: 'exp1',
            table: {name:'t1'}
        };
        dataManagementService.getFormattedExpression = jasmine.createSpy();
        scope.onTransformationAdded();
        expect(dataManagementService.getFormattedExpression).not.toHaveBeenCalled();
    });

    it('Do not add transformation if for an existing transform, the types mismatch', function () {
        scope.transformation = {
            name: 't1',
            expression: 'exp1',
            table: {name:'t1'},
            isExisting: true
        };
        scope.getTableColumns = function () {
            return $q.when([{name: 'col1'}]);
        };
        dataManagementService.getFormattedExpression = function(type, connId, tName, exp) {
            if(exp === 'exp1') {
                return $q.when({data: {expressionDataType: 'INT'}});
            } else if (exp === 'exp2') {
                return $q.when({data: {expressionDataType: 'STRING'}});
            }
        };
        scope.onUpsertTransform = jasmine.createSpy();
        scope.onDone = jasmine.createSpy();

        scope.init();
        scope.$apply();

        scope.transformationModel.expression = 'exp2';
        scope.onTransformationAdded();
        scope.$apply();

        expect(scope.error.message).toBeTruthy();
        expect(scope.onUpsertTransform).not.toHaveBeenCalled();

        scope.transformationModel.expression = 'exp1';
        scope.onTransformationAdded();
        scope.$apply();

        expect(scope.onUpsertTransform).toHaveBeenCalledWith({
            name: 't1',
            expression: 'exp1',
            table: {name:'t1'},
            isExisting: true
        });
    });

    it('should not alter transformation on cancel', function () {
        scope.transformation = {
            name: 't2',
            exp: 'exp'
        };
        scope.init();
        scope.onDone = jasmine.createSpy();
        scope.onUpsertTransform = jasmine.createSpy();

        scope.cancelTransformationEditing();
        expect(scope.transformation).toBe(scope.transformation);
        expect(scope.onUpsertTransform).not.toHaveBeenCalled();
    });

    it('Should only accept valid names for new column addition', function () {
        scope.dsMetadata = {
            connectionType : 'mock-conn-type',
            selectedConnection : 'mock-conn'
        };
        // Length > 65
        scope.transformationModel = {
            name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            expression: 'exp1',
            table: {name:'t1'}
        };
        var isValid = scope.canAddTransformationToDocument();
        expect(isValid).toBe(false);

        // Spaces
        scope.transformationModel = {
            name: 'Gotta have some space',
            expression: 'exp1',
            table: {name:'t1'}
        };
        isValid = scope.canAddTransformationToDocument();
        expect(isValid).toBe(false);

        // Starting with numbers.
        scope.transformationModel = {
            name: '1234_I_like_numbers',
            expression: 'exp1',
            table: {name:'t1'}
        };
        isValid = scope.canAddTransformationToDocument();
        expect(isValid).toBe(false);

        // Good alphanumeric name
        scope.transformationModel = {
            name: 'This_should_be_1_good_name',
            expression: 'exp1',
            table: {name:'t1'}
        };
        isValid = scope.canAddTransformationToDocument();
        expect(isValid).toBe(true);
    });
});
