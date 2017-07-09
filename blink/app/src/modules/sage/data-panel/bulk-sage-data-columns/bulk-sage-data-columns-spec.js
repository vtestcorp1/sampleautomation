/**
 * Created by shikhar on 5/1/14.
 */

'use strict';

/* eslint camelcase: 1 */

describe('bulk sage data columns', function () {

    var compile, scope, constants, factory, defSourceIds, defConfig, $columnsPanel, $httpBackend,
        columnsScope, timeout, parse;

    var lineorder = 'LINEORDER',
        customer = 'CUSTOMER',
        lineorderId = '2445fe81-30d6-46fa-9f42-f6b1b4e01623',
        customerId = '5de19354-710f-448e-8ed2-4315d926a264';

    var logicalTableJson = {};
    logicalTableJson[lineorderId] = angular.copy(blink.app.fakeData['/callosum/v1/sage-data-columns-lineorder']);
    logicalTableJson[customerId] = angular.copy(blink.app.fakeData['/callosum/v1/sage-data-columns-customer']);

    beforeEach(function () {
        module('blink.app');
    });

    beforeEach(inject(function (
        $compile, $rootScope, $q, $timeout, $parse, blinkConstants, strings, jsonConstants, panelFactory, _$httpBackend_) {

        compile = $compile;
        scope = $rootScope.$new();
        timeout = $timeout;
        parse = $parse;
        constants = blinkConstants;
        factory = panelFactory;
        $httpBackend = _$httpBackend_;
    }));

    beforeEach(function () {
        defSourceIds = [lineorderId, customerId];
        defConfig = {
            type: constants.WORKSHEET
        };
    });

    function initPanelWithSources(sourceIds, config, isReadOnly) {
        sourceIds = sourceIds || defSourceIds;
        config = config || defConfig;

        var panel = new factory.Panel([factory.PanelComponent.types.BULK_COLUMNS], sourceIds, config, isReadOnly);
        expect(panel).not.toBeNull();
        expect(panel.getDocumentConfig()).toBe(config);
        expect(panel.getComponents().count()).toBe(1);

        var colComponent = panel.getComponents()[0];
        scope.component = colComponent;
        scope.component.getDataSources = function () {
            return sourceIds;
        };
        if (sourceIds.length) {
            $httpBackend.expectPOST('/callosum/v1/metadata/details', function () {
                return {
                    id: JSON.stringify(sourceIds),
                    type: 'LOGICAL_TABLE'
                };
            }).respond(200, {
                storables: sourceIds.map(function (id) {
                    return logicalTableJson[id].tableMetadata;
                })
            });
        }
        $columnsPanel = $('<bulk-sage-data-columns component="component"></bulk-sage-data-columns>');
        compile($columnsPanel)(scope);
        scope.$apply();
        if (sourceIds.length) {
            $httpBackend.flush();
        }
        // Getting the column scope from html within GroupedColumnsController
        columnsScope = $columnsPanel.find('.bk-columns-body-section').scope();
    }

    function sourceElem(name) {
        var selector = 'li.bk-source-item';
        if (name) {
            selector += ':contains({1})'.assign(name);
        }
        return $columnsPanel.find(selector);
    }

    function columnElem(tableName, colName) {
        var selector = 'li.bk-list-item';
        if (colName) {
            selector += ':contains({1})'.assign(colName);
        }
        return sourceElem(tableName).find(selector);
    }

    function selectedColumnElem(colName) {
        var selector = 'li.bk-list-item.ui-selected';
        if (colName) {
            selector += ':contains({1})'.assign(colName);
        }
        return $columnsPanel.find(selector);
    }

    function expandBtn(tableName) {
        return sourceElem(tableName).find('.bk-expand-btn-light-bg');
    }

    function enterSearchInput(str) {
        var $inp = $columnsPanel.find('.bk-search-input'),
            inpScope = $inp.scope();

        inpScope.colItemFilter = str;
        columnsScope.$apply();
        timeout.flush();
    }

    it('should show no columns and table when there are no sources', function () {
        initPanelWithSources([]);

        expect(sourceElem().length).toBe(0);
        expect(columnElem().length).toBe(0);
    });

    it('should show 2 sources in collapsed mode', function () {
        initPanelWithSources();

        expect(sourceElem().length).toBe(2);
        expect(sourceElem(lineorder).length).toBe(1);
        expect(sourceElem(customer).length).toBe(1);

        // Columns should be collapsed
        expect(columnElem().length).toBe(0);
    });

    it('should expand/collapse table when clicked on expland/collpase button', function () {
        initPanelWithSources();

        expect(sourceElem(customer).length).toBe(1);
        // Columns should be collapsed
        expect(columnElem().length).toBe(0);
        // expand the source
        expandBtn(customer).click();
        expect(columnElem(customer).length).toBe(8);
        expect(columnElem(lineorder).length).toBe(0);

        // collapse the table
        expandBtn(customer).click();
        expect(columnElem(customer).length).toBe(0);
    });

    it('clicking on table name should expand and select all', function () {
        initPanelWithSources();

        // click on customer name
        sourceElem(customer).click();
        timeout.flush();
        expect(columnElem(customer).length).toBe(8);
        // expect all to be selected
        expect(selectedColumnElem().length).toBe(8);

        // click on table name again
        sourceElem(customer).click();
        expect(columnElem(customer).length).toBe(8);
        // expect none to be selected
        expect(selectedColumnElem().length).toBe(0);
    });

    it('clicking on columns of 2nd table should deselect columns of 1st table', function () {
        initPanelWithSources();

        var colCustomer = 'Customer City';

        // click on customer name
        sourceElem(customer).click();
        timeout.flush();
        expect(columnElem(customer).length).toBe(8);
        // expect all to be selected
        expect(selectedColumnElem().length).toBe(8);
        expect(columnsScope.getSelectedColumns().length).toBe(8);

        expect(columnElem(customer, colCustomer).length).toBe(1);

        // click on a single column of same table.
        var colElemScopeCol = columnElem(customer, colCustomer).scope().col;
        // Due to jquery ui plugin, click on columnElem does not work. So using scope properties here.
        columnsScope.onSelectionChange([colElemScopeCol], customer);
        expect(columnsScope.getSelectedColumns().length).toBe(1);
        expect(columnsScope.getSelectedColumns()[0].getName()).toMatch(colCustomer);

        // click on lineorder table
        sourceElem(lineorder).click();
        timeout.flush();
        // both tables should be expanded
        expect(columnElem().length).toBe(25);
        // only columns of lineorder should be selected
        expect(selectedColumnElem().length).toBe(17);
        expect(columnsScope.getSelectedColumns().length).toBe(17);

        // click on a column of customer table again
        columnsScope.onSelectionChange([colElemScopeCol], customer);
        expect(columnsScope.getSelectedColumns().length).toBe(1);
        expect(columnsScope.getSelectedColumns()[0].getName()).toMatch(colCustomer);
    });

    it('collapsing a table whose columns were selected should clear the selected columns - scope (not UI) test', function () {
        initPanelWithSources();

        // click on customer name
        sourceElem(customer).click();
        timeout.flush();
        expect(columnsScope.getSelectedColumns().length).toBe(8);

        // collapse the table
        expandBtn(customer).click();
        expect(columnElem(customer).length).toBe(0);
        expect(columnsScope.getSelectedColumns().length).toBe(0);

        // expand the table
        expandBtn(customer).click();
        expect(columnElem(customer).length).toBe(8);
        expect(columnsScope.getSelectedColumns().length).toBe(0);
    });

    it('should not show table name if there is column that matches the search term', function () {
        initPanelWithSources();

        enterSearchInput('custkey');

        // Both should be here
        expect(sourceElem().length).toBe(2);
        expect(columnElem().length).toBe(0);
        expect(sourceElem(customer).hasClass('ng-hide')).toBeFalsy();
        expect(sourceElem(lineorder).hasClass('ng-hide')).toBeFalsy();
        // expand both
        expandBtn().click();
        expect(columnElem().length).toBe(2);

        enterSearchInput('city');

        // Only customer should be there
        expect(sourceElem(customer).hasClass('ng-hide')).toBeFalsy();
        expect(sourceElem(lineorder).hasClass('ng-hide')).toBeTruthy();
        // Its already expanded
        expect(columnElem().length).toBe(1);
        expect(columnElem(customer, 'Customer City').length).toBe(1);
    });
});
