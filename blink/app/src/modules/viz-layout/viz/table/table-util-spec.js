/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for table util methods
 */

'use strict';

describe('table util', function() {
    var tableUtil, dataRuleService = {}, _$templateCache,
        CurrencyTypeInfo, constants, metadataExplorerStrings, jsonConstants;

    var templates = {
        "read-only-text-cell": '<div class="bk-readonly-value">{1}</div>',
        'editable-text-cell': '<div class="edit-wrapper">' +
            '<div class="bk-value">{1}</div>' +
            '</div>',
        'text-cell-placeholder': '<span class="placeholder">{1}</span>'
    };

    _$templateCache = {
        'get': function(name) {
            return templates[name];
        },
        'put': angular.noop
    };

    beforeEach(function() {
        module('blink.app');

        module(function ($provide) {
            $provide.value('dataRuleService', dataRuleService);
            $provide.value('$templateCache', _$templateCache);
        });

        inject(function($injector) {
            tableUtil = $injector.get('tableUtil');
            CurrencyTypeInfo = $injector.get('CurrencyTypeInfo');
            constants = $injector.get('blinkConstants');
            metadataExplorerStrings = $injector.get('strings');
            jsonConstants = $injector.get('jsonConstants');
        });
    });

    it('should have correctly working getPaginationInfo() function', function() {
        var viewport = {top: 1, bottom: 10};
        // Here row count > bottom
        var pageInfoLargeRowCount = tableUtil.getPaginationInfo(viewport, 35, true);
        // Here row count < bottom
        var pageInfoLessRowCount = tableUtil.getPaginationInfo(viewport, 8, false);

        expect(pageInfoLargeRowCount.topRow).toBe(2);
        expect(pageInfoLargeRowCount.bottomRow).toBe(11);
        expect(pageInfoLargeRowCount.totalRows).toBe('35+');

        expect(pageInfoLessRowCount.topRow).toBe(2);
        // Even thought bottom of view port is 10, bottomRow should be capped to totalRows
        expect(pageInfoLessRowCount.bottomRow).toBe(8);
        expect(pageInfoLessRowCount.totalRows).toBe(8);
    });

    it('updateProperties should call setters for all the listed properties', function() {
        dataRuleService.setNewProperties = jasmine.createSpy();
        var values = {
            colName: 'colName',
            colDesc: 'colDesc',
            colType: 'colType',
            dataType: 'dataType',
            aggType: 'aggType',
            hidden: true,
            isAdditive: false,
            indexType: 'indexType',
            synonyms: 'synonyms',
            geoConfig: 'geoConfig',
            formatPattern: '',
            currencyTypeInfo: null,
            indexPriority: 1,
            attributionDimension: true
        };
        values.column = jasmine.createSpyObj('column', [
            'setName',
            'setDescription',
            'setType',
            'setDataType',
            'setAggregateType',
            'setIsHidden',
            'setIsAdditive',
            'setIndexType',
            'setSynonyms',
            'setGeoConfig',
            'setFormatPattern',
            'setIndexPriority',
            'setCurrencyTypeInfo',
            'setIsAttributionDimension'
        ]);
        var valuesToPut = {
            setName : 'colName',
            setDescription : 'colDesc',
            setType : 'colType',
            setDataType : 'dataType',
            setAggregateType : 'aggType',
            setIsHidden : 'hidden',
            setIsAdditive : 'isAdditive',
            setIndexType : 'indexType',
            setSynonyms : 'synonyms',
            setGeoConfig : 'geoConfig',
            setFormatPattern: 'formatPattern',
            setIndexPriority : 'indexPriority',
            setCurrencyTypeInfo: 'currencyTypeInfo',
            setIsAttributionDimension : 'attributionDimension'
        };
        var field = {
            id: '123'
        };
        var editCmd = {
            serializedValue:'',
            execute: jasmine.createSpy()
        };
        tableUtil.updateProperties(values, field, editCmd);
        angular.forEach(values.column, function(method, methodName) {
            expect(method).toHaveBeenCalledWith(values[valuesToPut[methodName]]);
        });
    });

    it('editableTextFormatter should return appropriately formatted Text', function () {
        var formatter = tableUtil.editableTextFormatter(true);
        var formattedValue = formatter(0,0,'test val', {});
        expect(formattedValue).toBe('<div class="bk-readonly-value">test val</div>');

        formatter = tableUtil.editableTextFormatter(false);
        formattedValue = formatter(0, 0, undefined, {});
        expect(formattedValue).toBe('<div class="edit-wrapper">' +
            '<div class="bk-value"><span class="placeholder">Click to edit</span></div>' +
            '</div>');

        formatter = tableUtil.editableTextFormatter(false);
        formattedValue = formatter(0, 0, 'test val', {});
        expect(formattedValue).toBe('<div class="edit-wrapper">' +
            '<div class="bk-value">test val</div>' +
            '</div>');

        var column = {
            isEditable: jasmine.createSpy().and.returnValue(false)
        };
        formatter = tableUtil.editableTextFormatter(false);
        formattedValue = formatter(0, 0, 'test val', column);
        expect(column.isEditable).toHaveBeenCalled();
        expect(formattedValue).toBe('<div class="bk-readonly-value">test val</div>');
    });

    it('currencyTypeInfoFormatter should be able to handle invalid currency type info', function () {
        var config = {
            tableModel: {
                getColumns: function() {
                    return [];
                }
            }
        };
        var currencyTypeInfo = new CurrencyTypeInfo({
            setting: jsonConstants.currencyTypes.FROM_COLUMN,
            columnGuid: '123'
        });
        var text = tableUtil.currencyTypeInfoFormatter(0, 0, currencyTypeInfo, config);
        expect(text).toBe(metadataExplorerStrings.metadataExplorer.currencyEditor.NONE);
    });

    it('should format hyperlinks correctly', function () {
        var normalNode = '<div>Normal Text</div>';
        var noCaptionUrl = '<div>http://google.com</div>';
        var captionedUrl = '<div>{caption}Click me{/caption}http://google.com</div>';

        var formattedNode = tableUtil.formatHyperlink(normalNode);
        expect(formattedNode.html()).toBe($(normalNode).html());

        formattedNode = tableUtil.formatHyperlink(noCaptionUrl);
        expect(formattedNode.text()).toBe('http://google.com');
        expect(formattedNode.find('a').attr('href')).toBe('http://google.com');
        expect(formattedNode.find('a').attr('target')).toBe('_blank');

        formattedNode = tableUtil.formatHyperlink(captionedUrl);
        expect(formattedNode.text()).toBe('Click me');
        expect(formattedNode.find('a').attr('href')).toBe('http://google.com');
        expect(formattedNode.find('a').attr('target')).toBe('_blank');
    });
});
