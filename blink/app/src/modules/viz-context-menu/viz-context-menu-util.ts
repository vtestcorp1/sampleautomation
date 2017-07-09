/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Utility for handling viz context menu operations.
 */


import _ from 'lodash';
import {ngRequire, Provide} from 'src/base/decorators';
import {strings} from '../../base/strings';
import {strEnum} from '../../base/utils/ts-utils';
import {VisualizationColumnModel} from '../callosum/model/visualization-column';
import {FilterRowOperators} from '../viz-layout/viz/filter/filter-types';
import {MultiOperatorFilterRow} from '../viz-layout/viz/filter/multi-operator-filter-row';
import {VisualizationModel} from '../viz-layout/viz/visualization-model';
import {ChartContextMenuInput, ChartContextMenuInputPoint} from './chart-context-menu-util';

declare let sage;
declare let tsProto;

let util = ngRequire('util');
let Logger = ngRequire('Logger');
let sageCallosumTranslator = ngRequire('sageCallosumTranslator');
let sessionService = ngRequire('sessionService');
let logger;

export const VizContextMenuOptionType = strEnum([
    'LEAF_LEVEL',
    'EXCLUDE',
    'INCLUDE',
    'DRILL',
    'COPY_TO_CLIPBOARD',
    'A3_ANALYSIS',
    'APPLY_AS_RUNTIME_FILTER',
    'CUSTOM_A3_ANALYSIS'
]);

export type VizContextMenuOptionType = keyof typeof VizContextMenuOptionType;

/**
 * These options will alaways be visible, if they are not supported in a particular context,
 * we will disable them with a tooltip.
 * @type {any[]}
 */
let DefaultVizContextMenuOptionTypes: VizContextMenuOptionType[] = [
    VizContextMenuOptionType.DRILL,
    VizContextMenuOptionType.LEAF_LEVEL,
    VizContextMenuOptionType.EXCLUDE,
    VizContextMenuOptionType.INCLUDE
];

let VizContextMenuOptionsRequiringUnderlyingDataAccess: VizContextMenuOptionType[] = [
    VizContextMenuOptionType.DRILL,
    VizContextMenuOptionType.LEAF_LEVEL,
    VizContextMenuOptionType.EXCLUDE,
    VizContextMenuOptionType.INCLUDE
];

/**
 * The order in which these items should appear in the context menu.
 * Note that enabled items will appear first before disabled items. Within disabled and enabled
 * subset this order will be respected.
 * @type {any[]}
 */
let VizContextMenuItemsOrder: VizContextMenuOptionType[] = [
    VizContextMenuOptionType.COPY_TO_CLIPBOARD,
    VizContextMenuOptionType.EXCLUDE,
    VizContextMenuOptionType.INCLUDE,
    VizContextMenuOptionType.DRILL,
    VizContextMenuOptionType.LEAF_LEVEL,
    VizContextMenuOptionType.APPLY_AS_RUNTIME_FILTER,
    VizContextMenuOptionType.A3_ANALYSIS,
    VizContextMenuOptionType.CUSTOM_A3_ANALYSIS
];

function sortContextMenuItems(menuItems: VizContextMenuItem[]): VizContextMenuItem[] {
    // Reorder the items defined by VizContextMenuItemsOrder.
    let orderObj = {};
    VizContextMenuItemsOrder.forEach((itemId, index) => {
        orderObj[itemId] = index;
    });
    return menuItems.sort(function (item1, item2) {
        if (item1.enabled && !item2.enabled) {
            return -1;
        }
        if (!item1.enabled && item2.enabled) {
            return 1;
        }
        return orderObj[item1.id] - orderObj[item2.id];
    });
}

export type OptionTypeToOptionItem = {[optionID in VizContextMenuOptionType]?: VizContextMenuItem};

let VizContextMenuUrls: {[key in VizContextMenuOptionType]: string} = {
    'LEAF_LEVEL': 'src/modules/viz-context-menu/templates/menu-item-leaf-level-data.html',
    'DRILL': 'src/modules/viz-context-menu/templates/menu-item-drill.html',
    'EXCLUDE': 'src/modules/viz-context-menu/templates/menu-item-exclude.html',
    'INCLUDE': 'src/modules/viz-context-menu/templates/menu-item-include.html',
    'A3_ANALYSIS': 'src/modules/viz-context-menu/templates/menu-item-a3-analysis.html',
    'COPY_TO_CLIPBOARD': 'src/common/widgets/slickgrid/context-menu-item-copy-data.html',
    'APPLY_AS_RUNTIME_FILTER':
        'src/modules/viz-context-menu/templates/menu-item-apply-as-runtime-filter.html',
    'CUSTOM_A3_ANALYSIS': 'src/modules/viz-context-menu/templates/menu-item-custom-a3-analysis.html'
};

class ContextMenuInputValue {
    public column: VisualizationColumnModel;
    public value: any;

    constructor(column: VisualizationColumnModel, value: any) {
        this.column = column;
        this.value = value === null ? util.formatDataLabel(value) : value;
    }
}

abstract class ContextMenuInputPointBase {
    public allValues: Array<ContextMenuInputValue> = [];
    public filteredValues: Array<ContextMenuInputValue> = [];
    public unfilteredValues: Array<ContextMenuInputValue> = [];
}

@Provide('VizContextMenuItem')
class VizContextMenuItem {
    public readonly url: string;
    public enabled = true;
    public disabledHelp?: string;

    constructor(public id: VizContextMenuOptionType) {
        this.url = VizContextMenuUrls[id];
    }

    public disable(disabledHelp: string): this {
        this.enabled = false;
        this.disabledHelp = disabledHelp;
        return this;
    }
}

function createQueryTransformations(columnValuePairs, unfilteredColumns, config) {
    config = config || {};
    // Let us say the original query is "revenue by region by category for 2013 for california,
    // nevada" and the user drilled on "nevada, Electronics" data point.
    let queryTransformations = [
        // Remove non filter phrases.
        // In the example: "for 2013 for california, nevada"
        sage.QueryTransform.createRemoveNonFilterPhrasesTransformation(),
        sage.QueryTransform.createRemoveAllHavingFiltersTransformation()
    ];

    // Prepend the unfiltered columns that should be kept.
    // Example: "revenue for 2013 for california, nevada"
    unfilteredColumns.each(function (colInfo) {

        let unfilteredCol = colInfo.column;
        let addColumnTransformation = sage.QueryTransform.createAddColumnTransformation({
            tokenOutputGuid: unfilteredCol.getSageOutputColumnId(),
            prepend: true
        });
        if (config.includeColumnAggregations && unfilteredCol.hasAggregateOverride()) {
            let effectiveAggregateType = (unfilteredCol.getEffectiveAggregateType() || 'NONE')
                .toUpperCase();
            let sageAggrType = sageCallosumTranslator.getSageAggrTypeForCallosumAggrType(
                effectiveAggregateType
            );
            addColumnTransformation.aggregation = sage.AggregationType[sageAggrType];
        }
        queryTransformations.push(addColumnTransformation);
    });

    queryTransformations = queryTransformations.concat(
        createIncludeQueryTransformations(
            columnValuePairs,
            config.answerModel,
            config.includeFilteredColumns
        )
    );

    return queryTransformations;
}


function createExcludeQueryTransformations(columnValuePairs) {
    let queryTransformations = [];

    logger = logger || Logger.create('viz-context-menu-util');
    columnValuePairs.each(function (cvPair) {
        if (cvPair.value === null) {
            // Warn but continue. See the note about null handling above.
            logger.warn('An exclude drill filter column has null value', cvPair, columnValuePairs);
        }

        // Now append one filter for each of the columns in the column value pair.
        // Example: "revenue for 2013 for region = nevada for category = Electronics"
        //
        // Depending on the type of filter, we may have to use a "between" filter transform or a in
        // filter.
        if (Array.isArray(cvPair.value)) {
            logger.warn('Exclusion drill called for bucketed column, skipping!', cvPair.column);
        } else {
            queryTransformations.push(sage.QueryTransform.createAddPredicateFilterTransformation({
                tokenOutputGuid: cvPair.column.getSageOutputColumnId(),
                op: sage.CompareType.NE,
                value1: cvPair.column.convertValueToSageValue(cvPair.value)
            }));
        }
    });

    return queryTransformations;
}

function createIncludeQueryTransformations(
    columnValuePairs,
    answerModel,
    includeFilteredColumns
) {
    includeFilteredColumns = includeFilteredColumns || false;
    let queryTransformations = [];

    logger = logger || Logger.create('viz-context-menu-util');
    columnValuePairs.each(function (cvPair) {
        if (cvPair.value === null) {
            // Warn but continue. See the note about null handling above.
            logger.warn('An include drill filter column has null value', cvPair, columnValuePairs);
        }
        let columnValuePair = getBucketedColumnValuePair(cvPair, answerModel);
        // Remove existing filters in the query that apply to columns in the column value pair. Note
        // that any existing filter that is not in the output should be left alone.
        // Example: "revenue for 2013".
        if (cvPair.column.isDateColumn()) {
            queryTransformations.push(
                sage.QueryTransform.createRemoveAllDateRangeFilterTransformation({
                    tokenOutputGuid: columnValuePair.column.getSageOutputColumnId()
                })
            );
        } else {
            queryTransformations.push(
                sage.QueryTransform.createRemoveAllFilterTransformation({
                    tokenOutputGuid: columnValuePair.column.getSageOutputColumnId()
                })
            );
        }

        // Now append one filter for each of the columns in the column value pair.
        // Example: "revenue for 2013 for region = nevada for category = Electronics"
        //
        // Depending on the type of filter, we may have to use a "between" filter transform or a in
        // filter.
        if (Array.isArray(columnValuePair.value)) {
            queryTransformations.push(sage.QueryTransform.createAddPredicateFilterTransformation({
                tokenOutputGuid: columnValuePair.column.getSageOutputColumnId(),
                op: sage.CompareType.BW_INC,
                value1: columnValuePair.column.convertValueToSageValue(columnValuePair.value[0]),
                value2: columnValuePair.column.convertValueToSageValue(columnValuePair.value[1])
            }));
        } else {
            queryTransformations.push(sage.QueryTransform.createAddInFilterTransformation({
                tokenOutputGuid: columnValuePair.column.getSageOutputColumnId(),
                value: columnValuePair.column.convertValueToSageValue(columnValuePair.value)
            }));
        }

        if (includeFilteredColumns) {
            queryTransformations.push(sage.QueryTransform.createAddColumnTransformation({
                tokenOutputGuid: columnValuePair.column.getSageOutputColumnId(),
                prepend: true
            }));
        }
    });

    return queryTransformations;
}


function isVizContextMenuAllowedOnData(unfilteredColumns) {
    logger = logger || Logger.create('viz-context-menu-util');
    if (!unfilteredColumns || !unfilteredColumns.length) {
        logger.info('Context menu can not be shown if no output column is present');
        return false;
    }

    return unfilteredColumns.none(function (column) {
        return column.isGrowth();
    });
}

function getVizContextMenuItems(
    vizModel: VisualizationModel,
    clickedPoint: ContextMenuInputPointBase,
    selectedPoints: Array<ContextMenuInputPointBase>,
    isChasmTrapQuery: boolean,
) {
    let menuItems: OptionTypeToOptionItem = _.reduce(
        DefaultVizContextMenuOptionTypes,
        (menuItems, optionID) => {
            menuItems[optionID] = new VizContextMenuItem(optionID);
            return menuItems;
        },
        {}
    );

    _.forEach(menuItems, (item: VizContextMenuItem, optionID: VizContextMenuOptionType) => {
        let enabilityAndExplanation = getContextMenuItemEnablity(
            vizModel,
            optionID,
            clickedPoint,
            selectedPoints,
            isChasmTrapQuery
        );
        if (!enabilityAndExplanation.enabled) {
            item.disable(enabilityAndExplanation.explanation);
        }
    });

    if (sessionService.isA3Enabled()) {
        menuItems[VizContextMenuOptionType.A3_ANALYSIS] =
            new VizContextMenuItem(VizContextMenuOptionType.A3_ANALYSIS);
        menuItems[VizContextMenuOptionType.CUSTOM_A3_ANALYSIS] =
            new VizContextMenuItem(VizContextMenuOptionType.CUSTOM_A3_ANALYSIS);
    }

    return menuItems;
}

function getContextMenuItemEnablity(
    vizModel: VisualizationModel,
    optionID: VizContextMenuOptionType,
    clickedPoint: ContextMenuInputPointBase,
    selectedPoints: ContextMenuInputPointBase[],
    isChasmTrap: boolean
): {enabled: boolean, explanation?: string} {

    if (vizModel.isMissingUnderlyingDataAccess() &&
        VizContextMenuOptionsRequiringUnderlyingDataAccess.indexOf(optionID) !== -1) {
        return {
            enabled: false,
            explanation: strings.vizContextMenu.disabledHelp.requiresUnderlyingAccess
        };
    }


    if (optionID === VizContextMenuOptionType.DRILL ||
        optionID === VizContextMenuOptionType.LEAF_LEVEL) {
        let allPoints = [clickedPoint, ...selectedPoints];
        let isDrillAndUnderlyingDataNotAllowed =
            allPoints.some((drillPoint: ChartContextMenuInputPoint) => {
                let valueColumns = drillPoint.unfilteredValues
                    .map((vDV) => vDV.column);
                return !isVizContextMenuAllowedOnData(valueColumns);
            });

        if (isDrillAndUnderlyingDataNotAllowed) {
            return {
                enabled: false,
                explanation: strings.vizContextMenu.disabledHelp.growthColumn
            };
        }
    }

    if (optionID === VizContextMenuOptionType.EXCLUDE ||
        optionID === VizContextMenuOptionType.INCLUDE) {
        // Note that because we don't support expressing OR filter in sage (or transform), it is not
        // possible to support exclude quick filter for a query involving multiple grouping columns
        // or grouping column involving bucketed date.
        // ''
        if (clickedPoint.filteredValues.length !== 1) {
            return {
                enabled: false,
                explanation: strings.vizContextMenu.disabledHelp.multipleFilters
            };
        }
        if (clickedPoint.filteredValues[0].column.isDateColumn()) {
            return {
                enabled: false,
                explanation: strings.vizContextMenu.disabledHelp.dateColumn
            };
        }
    }

    if (optionID === VizContextMenuOptionType.LEAF_LEVEL) {
        if (isChasmTrap) {
            return {
                enabled: false,
                explanation: strings.vizContextMenu.disabledHelp.underlyingDataNotAvailable
            };
        }
        // currently we don't show formula columns in the leaf level data
        // (i.e. all the formula columns are excluded). if there series
        // has only formula columns this would result in an empty view
        // hence we disable "show underlying data" option for such cases
        let filteredColumns = clickedPoint.filteredValues.map('column');
        let allColumns = clickedPoint.unfilteredValues.map('column').concat(filteredColumns);
        let allColumnsAreFormulae = allColumns.every(function (col) {
            return col.isFormula();
        });
        if (allColumnsAreFormulae) {
            return {
                enabled: false,
                explanation: strings.vizContextMenu.disabledHelp.allFormula
            };
        }
    }

    return {
        enabled: true
    };
}

function disableMenuItemWithExplanation(
    items: OptionTypeToOptionItem,
    optionID: VizContextMenuOptionType,
    explanation: string
) {
    let item: VizContextMenuItem = items[optionID];
    if (!item) {
        return;
    }
    item.disable(explanation);
}

/**
 * Parses the visualization data and populates the vizColumns and selectedData for A3
 * analysis
 * @param data contextMenu data passed in to be parsed.
 * @param vizColumns the function populates this array
 * @param selectedData the function populates this array
 */
function parseVizDataForA3(
    data,
    vizColumns: VisualizationColumnModel[],
    selectedData
) {
    logger = logger || Logger.create('viz-context-menu-util');
    // Input validation.
    if (!vizColumns || !selectedData) {
        logger.error('Parsing of context menu data called with undefined out params');
        return;
    }

    let vizModel = data.vizModel;
    let vizType = vizModel.getVizType();
    let row;
    switch (vizType) {
        case 'CHART':
            let drillInput: ChartContextMenuInput = data.drillInput;
            let drillInputRows = drillInput.selectedPoints.length
                ? drillInput.selectedPoints
                : [drillInput.clickedPoint];

            let firstInputRow = drillInputRows[0];
            if (!firstInputRow
                || !firstInputRow.filteredValues
                || !firstInputRow.filteredValues.length) {
                logger.error('No data row passed for analysis');
                return;
            }
            firstInputRow.filteredValues.forEach(function (attrDrillValue) {
                vizColumns.push(attrDrillValue.column);
            });

            drillInputRows.forEach(function (drillInputRow) {
                row = new tsProto.callosum.DataRow();
                drillInputRow.filteredValues.forEach(function (drillInputValue, colIdx) {
                    if (drillInputValue.column.getId() !== vizColumns[colIdx].getId()) {
                        logger.error('Mismatch in attribute columns');
                    }
                    let type = drillInputValue.column.getEffectiveDataType();
                    let value = util.getConstantValue(drillInputValue.value, type);
                    row.getDataValue().push(value);
                });
                selectedData.push(row);
            });
            break;
        case 'TABLE':
            let grid = data.grid;
            let selectionModel = grid.getSelectionModel();
            let selectedRanges = selectionModel.getSelectedRanges();
            if (selectedRanges.length === 1) {
                let selectedRange = selectedRanges[0];
                let fromRow = selectedRange.fromRow;
                let toRow = selectedRange.toRow;
                let allGridColumns = grid.getColumns();

                allGridColumns.forEach(function (gridColumn) {
                    vizColumns.push(gridColumn.columnModel);
                });
                for (let i = fromRow; i <= toRow; ++i) {
                    row = new tsProto.callosum.DataRow();
                    let rowData = grid.getDataItem(i);
                    for (let j = 0; j < allGridColumns.length; ++j) {
                        let column = allGridColumns[j];
                        let rawCellValue = rowData[column.field];
                        let type = column.columnModel.getEffectiveDataType();
                        let value = util.getConstantValue(rawCellValue, type);
                        row.getDataValue().push(value);
                    }
                    selectedData.push(row);
                }
            }
            break;
    }
}

function getClampedBoundaries(inputBoundaries, column, answerModel) {
    // If the input is not an interval or any information to clamp is unavailable, bail out.
    if (!answerModel || !column || inputBoundaries.length !== 2) {
        return inputBoundaries;
    }

    let filterModel = answerModel.getCurrentAnswerSheet().getFilterModelByColumn(column);
    if (!filterModel) {
        return inputBoundaries;
    }

    let filterColumn = filterModel.getColumn();
    if (!filterColumn.isDateColumn()) {
        return inputBoundaries;
    }

    // We use the sugarjs Date.range utility to clamp the provided date range to align with the date
    // filter range in the answer.
    // To use the utility, we have to prep the data appropriately.
    // 1. Convert all epoch values to milliseconds.
    // 2. Depending on the operator, change the interval so that the resulting range is inclusive.
    // (sugarjs range intersection expects ranges to be inclusive).
    //
    // For the unbounded comparison operators (GT, GE, LT, LE), we use the max javascript date
    // boundaries as per the ECMAScript 5 convention (100 million days on either side of epoch):
    // http://www.tutorialspoint.com/javascript/javascript_date_object.htm

    let filterRows = filterModel.getFilterRows();
    if (filterRows.length !== 1) {
        return inputBoundaries;
    }

    let filterRow = filterRows[0];
    if (filterRow instanceof MultiOperatorFilterRow) {
        return inputBoundaries;
    }

    let filterOperator = filterRow.getOperator();
    let filterValues = filterRow.getValues().map(function (filterValue) {
        return filterColumn.convertValueFromBackend(filterValue.getKey());
    });

    let MAX_DATE_EPOCH = 8640000000000000,
        MIN_DATE_EPOCH = -8640000000000000;

    switch (filterOperator) {
        case FilterRowOperators.EQ:
            filterValues.push(filterValues[0]);
            break;
        case FilterRowOperators.GT:
            // For Greater Than, advance the value by 1 millisecond and treat this as Greater Than
            // Equal.
            filterValues[0]++;
            filterValues.push(MAX_DATE_EPOCH);
            break;
        case FilterRowOperators.GE:
            filterValues.push(MAX_DATE_EPOCH);
            break;
        case FilterRowOperators.LT:
            // For Lesser Than, reduce the value by 1 millisecond and treat this as Lesser Than
            // Equal.
            filterValues[0]--;
            filterValues.push(filterValues[0]);
            filterValues[0] = MIN_DATE_EPOCH;
            break;
        case FilterRowOperators.LE:
            filterValues.push(filterValues[0]);
            filterValues[0] = MIN_DATE_EPOCH;
            break;
        case FilterRowOperators.BW:
            filterValues[0]++;
            filterValues[1]--;
            break;
        case FilterRowOperators.BW_INC_MAX:
            filterValues[0]++;
            break;
        case FilterRowOperators.BW_INC_MIN:
            filterValues[1]--;
            break;
        case FilterRowOperators.BW_INC:
            // noop
            break;
        default:
            return inputBoundaries;
    }

    let intersectionRange = Date.range(inputBoundaries[0], inputBoundaries[1]).intersect(
        Date.range(filterValues[0], filterValues[1]));

    if (!intersectionRange.isValid()) {
        return inputBoundaries;
    }
    return [intersectionRange.start, intersectionRange.end];
}

function getBucketedColumnValuePair(columnValuePair, answerModel) {
    let column = columnValuePair.column;
    if (!column.isDateColumn()) {
        return {
            column: column,
            value: columnValuePair.value
        };
    }

    let timeBucketBoundaries = column.getDateBucketBoundaries(
        columnValuePair.value);
    if (!timeBucketBoundaries || timeBucketBoundaries.length <= 1) {
        return {
            column: column,
            value: columnValuePair.value
        };
    }

    timeBucketBoundaries = getClampedBoundaries(timeBucketBoundaries, column, answerModel);
    return {
        column: column,
        value: [timeBucketBoundaries[0], timeBucketBoundaries[1]]
    };
}

export {
    DefaultVizContextMenuOptionTypes,
    VizContextMenuOptionsRequiringUnderlyingDataAccess,
    VizContextMenuUrls,
    ContextMenuInputValue,
    ContextMenuInputPointBase,
    VizContextMenuItem,
    createQueryTransformations,
    createExcludeQueryTransformations,
    createIncludeQueryTransformations,
    isVizContextMenuAllowedOnData,
    getVizContextMenuItems,
    getContextMenuItemEnablity,
    disableMenuItemWithExplanation,
    parseVizDataForA3,
    sortContextMenuItems
};

Provide('vizContextMenuUtil')({
    VizContextMenuOptionType,
    createQueryTransformations,
    createExcludeQueryTransformations,
    createIncludeQueryTransformations,
    isVizContextMenuAllowedOnData,
    getContextMenuItemEnablity,
    parseVizDataForA3,
    ChartContextMenuInputPoint,
    VizContextMenuItemsOrder
});
