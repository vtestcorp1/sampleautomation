/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Spec for Worksheet Model
 */

'use strict';

/* eslint camelcase: 1 */

describe('worksheet model', function () {
    var jsonConstants,
        WorksheetModel,
        json,
        model;

    beforeEach(function() {
        module('blink.app');

        inject(function ($injector) {
            jsonConstants = $injector.get('jsonConstants');
            WorksheetModel = $injector.get('WorksheetModel');

            json = angular.copy(blink.app.fakeData['/callosum/v1/logical-table-model']);
            model = new WorksheetModel(json);
            model.setPermission($injector.get('DocumentPermissionFactory').createPermissiveInstance('LOGICAL_TABLE'));
        });
    });

    it('init test - should be a valid json constants object', function () {
        expect(jsonConstants).toEqual(jasmine.any(Object));
        expect(jsonConstants.LOGICAL_TABLE_CONTENT_KEY).toBe('logicalTableContent');
        expect(jsonConstants.QUESTION_KEY).toBe('question');
    });

    it('should return a constructor for worksheet model', function() {
        expect(WorksheetModel).toEqual(jasmine.any(Function));
    });

    it('should return a worksheet model', function() {
        expect(model.getId()).toBe("2445fe81-30d6-46fa-9f42-f6b1b4e01623");
        expect(model.getAuthorId()).toBe("0f0dd0f7-7411-4195-a4aa-0dc6b58413c9");
        expect(model.getName()).toBe("LINEORDER");
        expect(model.hasNoData()).toBeFalsy();
        expect(model.getColumns().length).toBe(18);
        expect(model.getData().length).toBe(2);
    });

    it('should set and update name', function () {
        var newName = 'TEST';

        expect(model.getName()).toBe("LINEORDER");
        // Set it to empty  name - should be a noop
        model.setName('');
        expect(model.getName()).toBe("LINEORDER");

        // Set it to valid name
        model.setName(newName);
        expect(model.getName()).toBe(newName);
    });

    it('should give invalid column name for columns with same name', function () {
        var columns = model.getColumns();

        expect(columns.length).toBe(18);
        // 2nd and 3rd column have the same name
        expect(columns[1].getName()).toBe('Same');
        expect(columns[2].getName()).toBe('Same');
        expect(model.isInvalidColumnName(0)).toBeFalsy();
        expect(model.isInvalidColumnName(1)).toBeTruthy();
        expect(model.isInvalidColumnName(2)).toBeTruthy();
    });

    it('should return the correct sage question information', function () {
        var quesInfo = model.getQuestionInfo(),
            context = model.getSageContext(),
            tokens = model.getRecognizedTokens();

        // Testing question json
        expect(quesInfo).toBeDefined();
        expect(quesInfo.text).toBe('saudi ara8');

        // Testing the getter for resolved token
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getTokenText()).toBe('saudi ara8');
        expect(tokens[0].getTypeEnum()).toBe(sage.TokenType.VALUE);
    });

    it('should set the recognized token in the correct JSON form', function () {
        var tokens = model.getRecognizedTokens(),
            context = model.getSageContext();

        expect(tokens[0].getTokenText()).toBe('saudi ara8');
        expect(tokens[0].getTypeEnum()).toBe(sage.TokenType.VALUE);

        var newTokens = [sage.RecognizedToken.createAttributeToken('test') ];
        // Set new token
        context.getTables()[0].setTokens(newTokens);
        model.setSageContext(context);

        // Verify that the tokens has been set
        tokens = model.getRecognizedTokens();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getTokenText()).toBe('test');
        expect(tokens[0].getTypeEnum()).toBe(sage.TokenType.ATTRIBUTE);
    });

    it('should update column name if it is valid', function () {
        var validName = 'validName',
            columns = model.getColumns();

        // Update the name of the first column
        expect(columns[0].getName()).toBe('Test Measure LogicalColumn 0');
        model.setColumnName(validName, 0);
        expect(columns[0].getName()).toBe(validName);

        // Update the name to an invalid name - case 1: empty name
        model.setColumnName('', 0);
        // Should not have been updated
        expect(columns[0].getName()).toBe(validName);

        // Update the name to an invalid name - case 1: same name as column 2
        model.setColumnName(columns[1].getName(), 0);
        // Should not have been updated
        expect(columns[0].getName()).toBe(validName);
    });

    it('should retain permissions detail', function(){
        var mockPermission = {
            mockProperty: true
        };

        model.setPermission(mockPermission);

        var json = angular.copy(blink.app.fakeData['/callosum/v1/logical-table-model']);

        var metadataJson = json[jsonConstants.LOGICAL_TABLE_METADATA_KEY];
        var newModel = model.fromMetadataJson(metadataJson);

        expect(newModel.getPermission()).toEqual(mockPermission);
    });
});
