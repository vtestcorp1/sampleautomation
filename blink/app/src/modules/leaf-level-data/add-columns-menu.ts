/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview Component for displaying column choices to customer.
 */
import {BaseComponent} from '../../base/base-types/base-component';
import {ngRequire} from '../../base/decorators';
import {Component} from '../../base/decorators';
import CheckboxComponent from '../../common/widgets/checkbox/checkbox';
import {jsonConstants} from '../viz-layout/answer/json-constants';

declare var sage: any;
declare var angular: any;
let util = ngRequire('util');
let sageDataSourceService = ngRequire('sageDataSourceService');
let Logger = ngRequire('Logger');

@Component({
    name: 'bkAddColumnsMenu',
    templateUrl: 'src/modules/leaf-level-data/add-columns-menu.html'
})
export class AddColumnsMenuComponent extends BaseComponent {

    public colFilter: any;
    public sourceIdToSourceList: Array<any> = [];

    public disableConfirmBtn: boolean = true;
    public showColumnMenu: boolean = false;

    private confirmSelectionCallBack: Function;
    private originalTableColumns: any = {};
    private colsToAddMap: any = {};
    private colsToRemoveMap: any = {};
    private answerModel: any;

    private readonly _DUMMY_SEPARATOR_: any = '_dum_sep_';
    private _logger = Logger.create('bk-add-columns-menu');

    public constructor(answerModel: any,
                       confirmSelectionCallBack: Function) {
        super();
        this.answerModel = answerModel;
        this.confirmSelectionCallBack = confirmSelectionCallBack;
        this.colFilter = {
            value: ''
        };
        this.init();
    }

    public confirmSelection() {
        if (!!this.confirmSelectionCallBack) {
            this.confirmSelectionCallBack();
        }
    }

    public getColumnsToAddMap() {
        return this.colsToAddMap;
    }

    public getColumnsToRemoveMap() {
        return this.colsToRemoveMap;
    }

    public onFilterChange() {
        this.filterListItems(this.colFilter.value);
    }

    public onClickAddColumnsBtn() {
        this.showColumnMenu = !this.showColumnMenu;
    }

    /**
     * Toggles a particular join path within a column
     * @param columnInfo
     * @param joinPathInfo
     */
    public toggleColumnWithSpecificJoinPath(columnInfo, joinPathInfo) {
        if (!columnInfo || !joinPathInfo) {
            return;
        }

        this.updateChangesMap(columnInfo, joinPathInfo, !joinPathInfo.selected);
    }

    /**
     * Toggles the entire column - will all the join paths, except those which cannot be edited.
     * @param columnInfo
     */
    public toggleColumn(columnInfo) {
        if (!columnInfo || columnInfo.noEdit) {
            return;
        }

        columnInfo.joinPathList.each((jpInfo) => {
            this.updateChangesMap(columnInfo, jpInfo, !columnInfo.selected);
        });

        columnInfo.selected = !columnInfo.selected;
    }

    public toggleSource(srcInfo) {
        if (!srcInfo) {
            return;
        }
        srcInfo.selected = !srcInfo.selected;
        srcInfo.columnsList.each((columnInfo) => {
            columnInfo.joinPathList.each((jpInfo) => {
                this.updateChangesMap(columnInfo, jpInfo, srcInfo.selected);
            });
            columnInfo.selected = columnInfo.noEdit || srcInfo.selected;
        });
    }

    public toggleSourceExpansion(srcInfo) {
        if (!srcInfo) {
            return;
        }
        srcInfo.expanded = !srcInfo.expanded;
    }

    public toggleColumnExpansion(colInfo) {
        if (!colInfo) {
            return;
        }
        colInfo.expanded = !colInfo.expanded;
    }

    public filterListItems(filter) {
        if (!this.sourceIdToSourceList) {
            return;
        }

        filter = filter || '';
        var regex = new RegExp(filter, 'gi');
        this.sourceIdToSourceList.each((srcInfo) => {
            srcInfo.columnsList = srcInfo.columnsList || [];
            srcInfo.filteredColumns = srcInfo.columnsList.filter((col) => {
                return !!col.colName.match(regex);
            });
        });
    }

    public clearChangesMap() {
        this.colsToAddMap = {};
        this.colsToRemoveMap = {};
        this.disableConfirmBtn = true;
    }

    private init() : void {
        if (!!this.answerModel) {
            this.fetchAndBuildColumnList();
        }
    }

    private getColAndJPKey(colGuid, jpKey) {
        return colGuid + this._DUMMY_SEPARATOR_ + jpKey;
    }


    private updateChangesMap(columnInfo, joinPathInfo, shdAdd) {
        // Return if we can't edit this join path selection
        if (joinPathInfo.noEdit || columnInfo.noEdit) {
            return;
        }

        var addInMap = this.colsToAddMap,
            removeFromMap = this.colsToRemoveMap;
        if (!shdAdd) {
            addInMap = this.colsToRemoveMap;
            removeFromMap = this.colsToAddMap;
        }

        var key = this.getColAndJPKey(columnInfo.colId, joinPathInfo.joinPathKey);
        if (removeFromMap.hasOwnProperty(key)) {
            delete removeFromMap[key];
        } else {
            addInMap[key] = {
                colId: columnInfo.colId,
                joinPath: joinPathInfo.joinPath
            };
        }

        joinPathInfo.selected = shdAdd;

        if (Object.keys(addInMap).length + Object.keys(removeFromMap).length === 0) {
            this.disableConfirmBtn = true;
        } else {
            this.disableConfirmBtn = false;
        }
    }


    /**
     * Sets UI flags on column container
     *
     * Note: We do not allow removing columns that were in the original query. This is because
     * removing this can change the Join Path root of the query.
     * @param colInfo
     */
    private setUIFlagsOnColInfo(colInfo) {
        // We want to mark the column as non-editable if all its join paths are non-editable
        // Strategy: We first mark the column as non-editable. If we detect a join path not present
        // in the original answer, we mark the column as editable.
        colInfo.noEdit = true;

        colInfo.joinPathList.each((jpInfo) => {
            var key = this.getColAndJPKey(colInfo.colId, jpInfo.joinPathKey);
            if (this.originalTableColumns.hasOwnProperty(key)) {
                // mark this join path container non-editable
                jpInfo.noEdit = true;
            } else {
                // mark the column as editable
                colInfo.noEdit = false;
            }
        });
    }

    /**
     * Determines the UI flags like if an option is editable and whether to show different join
     * path options.
     *
     * @param sourceIdToSourceList
     */
    private setUIFlags(sourceIdToSourceList) {
        sourceIdToSourceList.each((srcInfo) => {
            srcInfo.columnsList.each((colInfo) => {
                this.setUIFlagsOnColInfo(colInfo);
            });
        });
    }

    private fetchAndBuildColumnList() {
        var sourceIdToJoinPaths = this.computeSourceToJoinPathMapping(),
            sourceIds = Object.keys(sourceIdToJoinPaths);
        if (!sourceIds || !sourceIds.length) {
            this._logger.error('getting sources with null or empty ids');
            return;
        }

        this.sourceIdToSourceList = [];

        sageDataSourceService.getSourcesModels(sourceIds)
            .then((sourceIdToModel) => {
                sourceIds.each((newSourceId) => {
                    if (!sourceIdToModel[newSourceId]) {
                        return;
                    }

                    var model = sourceIdToModel[newSourceId],
                        isWorkheet =
                            (model.getType() === jsonConstants.metadataType.subType.WORKSHEET),
                        columns = model.getColumns() || [],
                        sourceName = model.getName(),
                        sourceId = model.getId();

                    columns = columns.filter((column) => {
                        return !column.isHidden();
                    });

                    var columnsList = columns
                            .filter((column) => {
                                return !(isWorkheet && column.isFormula());
                            })
                            .map((col) => {
                                return {
                                    colId: col.getGuid(),
                                    colName: col.getName(),
                                    joinPathList: angular.copy(
                                        Object.values(sourceIdToJoinPaths[sourceId]))
                                };
                            }) || [];

                    // Sort the columns
                    columnsList.sort((colInfo1, colInfo2) => {
                        return util.comparator(colInfo1.colName, colInfo2.colName);
                    });

                    this.sourceIdToSourceList.push({
                        srcName: sourceName,
                        columnsList: columnsList
                    });
                });

                this.setUIFlags(this.sourceIdToSourceList);

                this.sourceIdToSourceList.forEach((srcInfo) => {
                    srcInfo.checkboxCtrl = new CheckboxComponent(srcInfo.srcName, () => {
                        return !!srcInfo.selected;
                    }).setOnClick(($event) => {
                        $event.stopPropagation();
                        this.toggleSource(srcInfo);
                    });
                    srcInfo.columnsList.forEach((colInfo) => {
                        colInfo.checkboxCtrl = new CheckboxComponent(colInfo.colName, () => {
                            return colInfo.selected || colInfo.noEdit;
                        }).setReadOnly(!!colInfo.noEdit)
                            .setOnClick(($event) => {
                                this.toggleColumn(colInfo);
                            });
                        colInfo.joinPathList.forEach((jpInfo) => {
                            jpInfo.checkboxCtrl =
                                new CheckboxComponent(jpInfo.joinPathLabel, () => {
                                    return jpInfo.selected || jpInfo.noEdit;
                                }).setReadOnly(!!jpInfo.noEdit)
                                    .setOnClick(($event) => {
                                        this.toggleColumnWithSpecificJoinPath(colInfo, jpInfo);
                                    });
                        });
                    });
                });

                // In case of only 1 source of columns, that source is shown as expanded
                if (this.sourceIdToSourceList && this.sourceIdToSourceList.length === 1) {
                    this.toggleSourceExpansion(this.sourceIdToSourceList[0]);
                }
                this.filterListItems(this.colFilter.value);
            });
    }

    /**
     * Goes through the tokens and determines all the join path options for each source table
     * @returns {{}}
     */
    private computeSourceToJoinPathMapping() {
        // We are sure to find a tableModel, else init() would have thrown.
        var tableModel = this.answerModel.getCurrentAnswerSheet().getTableVisualizations()[0],
            columns = tableModel.getVizColumns() || [],
            tokens = this.answerModel.getRecognizedTokens() || [];

        var sourceIdToJoinPaths = {};

        // Determine all the sources in the query from the columns
        columns.each((col) => {
            var source = col.getSources()[0];
            if (!source) {
                this._logger.error('found a column with invalid source');
                this._logger.debug(col);
                return;
            }
            sourceIdToJoinPaths[source] = {};
        });

        // Now determine the different join paths for the sources from the tokens
        tokens.each((token) => {
            if (!token.isDataToken()) {
                return;
            }

            var tableGuid = token.getTableGuid();
            if (!tableGuid) {
                this._logger.warn('found a token with null table guid',
                    token.getTokenTextLowerCase(),
                    token.getGuid());
                this._logger.debug(token);
                return;
            }
            if (!sourceIdToJoinPaths[tableGuid]) {
                return;
            }

            var tokenJPKey = token.getJoinPathKey();

            // Two things:
            // 1. We make a map with JPKey as key as multiple tokens can have same JP and we
            // want to avoid repeated JPs
            // 2. We store joinPathKey in the object because later on we just use
            // Object.values(sourceIdToJoinPaths[tableGuid])
            sourceIdToJoinPaths[tableGuid][tokenJPKey] = {
                joinPath: token.getJoinPaths(),
                // TODO(Shikhar) - use getJoinPathLabel after SCAL-4803
                joinPathLabel: token.getJoinPathLabelForLeafData(),
                joinPathKey: tokenJPKey
            };

            this.originalTableColumns[this.getColAndJPKey(token.getGuid(), tokenJPKey)] = true;
        });

        return sourceIdToJoinPaths;
    }
}
