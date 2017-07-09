/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Gunjan Jha(gunjan.jha@thoughtspot.com)
 *
 * @fileoverview This component displays the table columns for customer to select for
 * a3 analysis.
 *
 */

'use strict';

import _ from 'lodash';
import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../../base/decorators';
import {SmartCheckboxCollectionConfig} from
    '../../../../common/widgets/checkbox-collection/smart-checkbox-collection-config';
import {SmartCheckboxCollectionController} from
    '../../../../common/widgets/checkbox-collection/smart-checkbox-collection-controller';
import {jsonConstants} from '../../../viz-layout/answer/json-constants';
import {A3TableAnalysisCustomizerComponent} from
    '../analysis-customizer/a3-table-analysis-customizer';
import IPromise = angular.IPromise;
import {blinkConstants} from '../../../../base/blink-constants';

let CancelablePromise = ngRequire('CancelablePromise');
let $q = ngRequire('$q');
let metadataPermissionService = ngRequire('metadataPermissionService');
let UserAction = ngRequire('UserAction');
let util = ngRequire('util');
let worksheetUtil = ngRequire('worksheetUtil');
let alertService = ngRequire('alertService');
let metadataUtil = ngRequire('metadataUtil');
let messageService = ngRequire('messageService');
let Logger = ngRequire('Logger');

/**
 * Table Column selection component
 */
@Component({
    name: 'bkA3TableColumnSelector',
    templateUrl: 'src/modules/a3/table/column-selector/a3-table-column-selector.html'
})
export class A3TableColumnSelectorComponent extends BaseComponent {
    public smartCheckboxCollectionComponent2: SmartCheckboxCollectionController;
    private displayStringToColumn;
    private selectedColumnsMap;
    private a3TableAnalysisCustomizerComponent: A3TableAnalysisCustomizerComponent;
    private pendingPromise: any;
    private tableId: string;
    private allColumns: any[];

    public constructor(tableId: string,
                       allColumns: any[],
                       selectedColumnIds: string[],
                       a3TableAnalysisCustomizerComponent: A3TableAnalysisCustomizerComponent) {
        super();
        this.tableId = tableId;
        this.allColumns = allColumns;
        this.a3TableAnalysisCustomizerComponent = a3TableAnalysisCustomizerComponent;

        if (!!tableId) {
            this.initSmartCheckboxCollection(selectedColumnIds);
        } else {
            this.createEmptySmartCheckboxCollectionComponent();
        }
    }

    public getSelectedColumns() : string[] {
        return Object.values(this.selectedColumnsMap)
            .map((selectedColumn) => selectedColumn.getGuid());
    }

    public trigger() {
        this.a3TableAnalysisCustomizerComponent.trigger();
    }

    private updateDisplayStringToColumn(columns: any[]) {
        let columnNames = this.getColumnNames(columns);
        columnNames.forEach((columnName, idx) => {
           this.displayStringToColumn[columnName] = columns[idx];
        });
    }

    private getColumnNames(columns: any[]) {
        return columns.map((column) => {
            return column.getName();
        });
    }

    private initSmartCheckboxCollection(selectedColumnIds: string[]) {
        this.displayStringToColumn = {};
        this.selectedColumnsMap = {};

        let smartCheckboxCollectionConfig = new SmartCheckboxCollectionConfig();

        // Smart checkbox takes checkbox value getters. These are called with
        // the current string in the UI.
        // The function are expected to return a promise with array of objects
        // with string key and boolean isChecked reflecting current selection.
        let editableCBGetter = (text: string) => {
            return this.fetchLogicalTable(this.tableId)
                .then(
                    (data) => {
                        if (!data || data.length < 1) {
                            return { checkboxItems: [] };
                        }
                        let allColumns = data[data.length - 1];
                        if (!allColumns) {
                            return {
                                checkboxItems: []
                            };
                        }

                        let columnsMap = {};
                        allColumns.forEach((column) => {
                            columnsMap[column.getGuid()] = column;
                        });
                        let selectedColumns = [];
                        selectedColumnIds.forEach((selectedColumnId) => {
                            let selectedColumn = columnsMap[selectedColumnId];
                            if (!!selectedColumn) {
                                this.selectedColumnsMap[selectedColumn.getName()] = selectedColumn;
                                selectedColumns.push(selectedColumn);
                            }
                        });
                        this.updateDisplayStringToColumn(allColumns);

                        let columnNames = this.getColumnNames(allColumns);
                        let displayColumnsMap = columnNames.reduce((map, val) => {
                            map[val] = false;
                            return map;
                        }, {});

                        // NOTE: We add the current selection in the filter as we want
                        // to provide where the selections are always displayed in the
                        // UI.
                        _.forIn(this.selectedColumnsMap, (val, key) => {
                            if (key.indexOf(text) > -1 || !text) {
                                displayColumnsMap[key] = true;
                            }
                        });

                        let checkboxItems = [];
                        _.forIn(displayColumnsMap, (val, key) => {
                            checkboxItems.push(
                                {
                                    title: key,
                                    isChecked: val
                                }
                            );
                        });

                        return {
                            checkboxItems: checkboxItems
                        };
                    }
                );
        };

        let readOnlyCBGetter = () => {
            return $q.when({checkboxItems: []});
        };

        let onChange = (displayText: string, isSelected: boolean) => {
            if (isSelected) {
                this.selectedColumnsMap[displayText] = this.displayStringToColumn[displayText];
            } else {
                delete this.selectedColumnsMap[displayText];
            }
        };

        this.smartCheckboxCollectionComponent2 = new SmartCheckboxCollectionController(
            editableCBGetter,
            readOnlyCBGetter,
            onChange,
            smartCheckboxCollectionConfig
        );
    }


    /**
     * Fetches the table details for the selected table, according to viewMode
     * @private
     */
    private fetchLogicalTable(tableId: string): IPromise<any> {
        let logger = Logger.create('a3-table-column-selector');
        if (this.allColumns !== null) {
            let ret = new Array(1);
            ret[0] = this.allColumns;
            return $q.when( ret );
        }
        if (!!this.pendingPromise) {
            logger.info('pending promise is active');
            this.pendingPromise.cancel();
        }

        let userAction = new UserAction(UserAction.FETCH_TABLE_PERMISSIONS);
        let permissionsPromise = metadataPermissionService.getEffectivePermissions(
            [{id: tableId}],
            jsonConstants.metadataType.LOGICAL_TABLE,
            true
        ).then(function(response) {
            return response.data;
        }, function(response) {
            logger.error('Error in getting effective permissions for table');
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });

        let detailsPromise = this.fetchMetadata(tableId).
        then(function(model) {
            return model.getColumns();
        }, function (error) {
            logger.error('Error in getting logical model details');
            if (error !== blinkConstants.IGNORED_API_CALL_ERROR) {
                return null;
            }
        });
        this.pendingPromise = new CancelablePromise(
            util.getAggregatedPromise([
                permissionsPromise,
                detailsPromise
            ])
        );

        return this.pendingPromise;
    }

    private fetchMetadata(tableId: string) : any {
        let userAction = new UserAction(UserAction.FETCH_TABLE_DETAILS);
        return worksheetUtil.getLogicalTableModel(
            tableId,
            {
                showHidden:true
            }).
        then(function(response) {
            let model = response.data;
            if(model.isCorrupted()) {
                let customData = {
                    incompleteDetails: model.getCorruptionDetails(),
                    getDisplayNameForMetadataTypeName:
                    metadataUtil.getDisplayNameForMetadataTypeName
                };
                let customUrl = 'src/common/alert/templates/missing-document-alert-template.html';
                alertService.showUserActionFailureAlert(userAction, response, {
                    substitutions: [model.getName()],
                    customData: customData,
                    customUrl: customUrl,
                    code: messageService.blinkGeneratedErrors.INCOMPLETE_DOCUMENT
                });
            }
            return model;
        });
    }

    private createEmptySmartCheckboxCollectionComponent() {
        let readOnlyCBGetter = () => {
            return $q.when({checkboxItems: []});
        };
        let editableCBGetter = () => {
            return $q.when({checkboxItems: []});
        };
        let onChange = () => {
            return;
        };
        this.smartCheckboxCollectionComponent2 = new SmartCheckboxCollectionController(
            editableCBGetter,
            readOnlyCBGetter,
            onChange,
            null
        );
    }
}
