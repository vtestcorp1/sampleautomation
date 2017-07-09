/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview Runtime Filter Builder Utility. This utility helps in building the query
 * parameters. This can get confusing in future to newbies and hence the extended documentation
 * here.
 *
 * Runtime filters allow you to apply filters to the data returned by the APIs or the visualization
 * or pinboard you're embedding. The filters are specified in the called URL as parameters.
 *
 * Example of a pinboard filter url with query parameters:
 *  http://10.77.144.40:8088/?col1=Color&op1=EQ&val1=red#/
 *  pinboard/e36ee65e-64be-436b-a29a-22d8998c4fae
 *
 * How it works:
 * Callosum will try to find a matching column from the pinboard or visualization being accessed,
 * using the col field as name. You can add any number of filter sets by incrementing the
 * parameters (e.g. col2, op2, and val2, etc.) For operators that support more than one value you
 * can pass val1=foo&val1=bar, etc.
 *
 * LIMITATIONS:
 * 1) Runtime Filters do not work directly on top of tables. You need to create a worksheet if you
 * want to use Runtime Filters. This means that the pinboard or visualization on which you apply
 * a runtime filter must be created on top of a worksheet.
 *
 * 2) If the worksheet was created from an answer (i.e. it is an aggregated worksheet), Runtime
 * Filters will only work if the answer was formed using a single worksheet. If the answer from
 * which the worksheet was created includes raw tables or joins multiple worksheets, you won't be
 * able to use Runtime Filters on it. This is because of the join path ambiguity that could result.
 *
 * 3) Runtime Filters do not allow you to apply “having" filters using a URL.
 *
 * 4) You cannot apply a Runtime Filter on a pinboard or visualization built on tables whose schema
 * includes a chasm trap.
 * More info in https://docs.google.com/spreadsheets/d/1BCp3lcrmGJFEifSKb_qv5pivSkKI3gtWTMfnyTyHP1U
 *
 * Supported Data Types:
 * You can use runtime filters on these data types: VARCHAR, INT64, INT32,
 * FLOAT, DOUBLE, BOOLEAN, DATE, DATE_TIME, TIME.
 * Please Note that for DATE and DATE_TIME values, you must specify the date in epoch time (also
 * known as POSIX or Unix time).
 *
 * Supported Runtime Filter Operators:
 * This list contains all the filter operators you can use with Runtime Filters:
 * Operator      Description                       Number of Values.
 * EQ             equals                                     1
 * NE             does not equal                             1
 * LT             less than                                  1
 * LE             less than or equal to                      1
 * GT             greater than                               1
 * GE             greater than or equal to                   1
 * CONTAINS       contains                                   1
 * BEGINS_WITH    begins with                                1
 * ENDS_WITH      ends with                                  1
 * BW_INC_MAX     between inclusive of the higher value      2
 * BW_INC_MIN     between inclusive of the lower value       2
 * BW_INC         between inclusive                          2
 * BW             between non-inclusive                      2
 * IN             is included in this list of values         multiple
 *
 */
import _ from 'lodash';
import {ngRequire, Provide} from '../../../base/decorators';
import {FilterRowOperators} from '../../viz-layout/viz/filter/filter-types';
import {RelatedLinkContent} from '../related-link-model';

let rangeOperatorUtil = ngRequire('rangeOperatorUtil');

@Provide('RuntimeFilterUtil')
export class RuntimeFilterUtil {
    private static readonly COLUMN_FILTER_NAME = 'col';
    private static readonly VALUE_FILTER_NAME = 'val';
    private static readonly OPERATOR_FILTER_NAME = 'op';

    /**
     * Create a runtime filter based on the related link configuration.
     *
     * @param contextMenuData contains the context of row selected by the customer.
     * @param filterOnlyRelatedColumns if true then only relatedLink specified source column names
     * are used from the selected set of columns in contextMenuData.
     *
     * @returns runtimeFilter.
     */
    public static getRelatedLinkFilters(
        contextMenuData: any,
        filterOnlyRelatedColumns: boolean,
        relatedLinkContent: RelatedLinkContent) {

        if (!contextMenuData && !contextMenuData.columnValuePairs) {
            return;
        }

        let relationships = relatedLinkContent.relationships;
        let relatedBySourceNames = _.keyBy(relationships, function (relation) {
            return relation.sourceColumnName;
        });

        let grid = contextMenuData.grid;
        let selectedIndexes = grid.getSelectedRows(10);
        let gridColumns = grid.getColumns();

        let selectedData = [];

        selectedIndexes.forEach(value => {
            selectedData.push(contextMenuData.grid.getDataItem(value));
        });

        let runtimeFilters = [];

        selectedData.forEach(row => {
            let runtimeDisplay = {};
            let runtimeFilter = {};
            let runtimeFilterPanel = [];
            let runtimePosition = 1;
            gridColumns.forEach(column => {
                let colName = column.name;
                if (filterOnlyRelatedColumns && !relatedBySourceNames[colName]) {
                    return;
                }

                let field = column.field;
                let colValue = row[field];
                let operator = FilterRowOperators[FilterRowOperators.EQ];

                // Swap the sourceColumnName with destinationColumnName with the operator.
                if (relatedBySourceNames[colName]) {
                    // replace the column name with destinationColumnName
                    let relation = relatedBySourceNames[colName];
                    colName = relation.destinationColumnName;
                    operator = relation.operator;
                }
                runtimeDisplay[colName] = colValue;
                RuntimeFilterUtil.addFilterItem (
                    runtimeFilter,
                    runtimePosition,
                    colName,
                    operator,
                    String(colValue)
                );

                let filterPanelItem = {
                    'name': colName,
                    'value': RuntimeFilterUtil.getFilterLabel(operator, colValue)
                };
                runtimeFilterPanel.push(filterPanelItem);

                runtimePosition++;
            });
            runtimeFilters.push({
                'name': runtimeDisplay, 'filter': runtimeFilter,
                'panel': runtimeFilterPanel
            });
        });
        return _.uniqWith(runtimeFilters, _.isEqual);
    }

    public static getFilterLabel(operator: string, value : string | Array<String>) {
        var label;
        var operatorEnum = FilterRowOperators[operator.toUpperCase()];
        if (!!operatorEnum) {
            label = rangeOperatorUtil.getOperatorLabel(operatorEnum);
        }
        if (!label || label.length === 0) {
            label = operator;
        }
        return label + ' ' + value;
    }

    /**
     * Generate a dictionary of runtime filters.
     * @param contextMenuData
     * @returns {}
     */
    public static getApplyAsFilters(contextMenuData) {
        if (!contextMenuData && !contextMenuData.columnValuePairs) {
            return;
        }
        let columnValuePairs = contextMenuData.columnValuePairs;
        let position = 0;
        return columnValuePairs.reduce(function (runtimeParams, columnValuePair ) {

            let column = columnValuePair.column;
            let columnName = column.getName();
            let clickedValue = column.getDataFormatter()(columnValuePair.value);

            if (column.getEffectiveDataType() === 'DATE' ) {
                // col2=date&op2=BW&val2=<epoch_start>&val2=<epoch_end>
                let timeBoundaries = column.getDateBucketBoundaries(columnValuePair.value);
                if (!!timeBoundaries && timeBoundaries.length === 2) {
                    position++;
                    RuntimeFilterUtil.addFilterItem (
                        runtimeParams,
                        position,
                        columnName,
                        FilterRowOperators[FilterRowOperators.BW],
                        timeBoundaries
                    );
                } else {
                    position++;
                    RuntimeFilterUtil.addFilterItem (
                        runtimeParams,
                        position,
                        columnName,
                        FilterRowOperators[FilterRowOperators.EQ],
                        String(columnValuePair.value)
                    );
                }
            } else {
                position++;
                RuntimeFilterUtil.addFilterItem (
                    runtimeParams,
                    position,
                    columnName,
                    FilterRowOperators[FilterRowOperators.EQ],
                    String(clickedValue)
                );
            }
            return runtimeParams;
        }, {});
    }

    public static areRuntimeParamsEqual(lhs, rhs) {
        return JSON.stringify(lhs) === JSON.stringify(rhs);
    }

    private static addFilterItem(
        runtimeFilter,
        position,
        key,
        op,
        value) {
        runtimeFilter[RuntimeFilterUtil.COLUMN_FILTER_NAME + position] = key;
        runtimeFilter[RuntimeFilterUtil.OPERATOR_FILTER_NAME + position] = op;
        runtimeFilter[RuntimeFilterUtil.VALUE_FILTER_NAME + position] = value;
    }
}

