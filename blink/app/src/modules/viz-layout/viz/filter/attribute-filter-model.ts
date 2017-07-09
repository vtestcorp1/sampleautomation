/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import {ngRequire} from '../../../../base/decorators';
import {strings} from '../../../../base/strings';
import {Filter} from './filter';
import {FilterModel} from './filter-model';
import {FilterRowOperators, FilterValue} from './filter-types';
import {SingleOperatorFilterRow} from './single-operator-filter-row';

let util = ngRequire('util');

export class AttributeFilterModel extends FilterModel {
    // We maintain a local cache of values that we have fetched from server.
    // We use this to avoid making network calls in certain cases.
    // Example: If we have values for contains 'r' and it has less values than batch size
    // then we can return values for any string containing 'r' like 're' using this list.
    private filterValueCache: {[subString: string] : string[]};
    private allFilterValueCache: {[subString: string] : string[]};
    private filterItems: {[key: string]: boolean};
    private allFilterItems: {[key: string]: boolean};
    private selectedItems: {[key: string]: boolean};
    private excludedItems: {[key: string]: boolean};

    constructor(params, filter: Filter) {
        super(params, filter);
        this.filterValueCache = {};
        this.allFilterValueCache = {};
        this.filterItems = {};
        this.allFilterItems = {};
    }

    public getSelectedFilterItems() : {[key: string]: boolean} {
        if (this.selectedItems !== void 0) {
            return this.selectedItems;
        }
        let selectedFilterRow = this.getAttributeFilterRows()
            .find((filterRow: SingleOperatorFilterRow) => {
                let operator = filterRow.getOperator();
                let isSelectionOperator = operator === FilterRowOperators.EQ
                    || operator === FilterRowOperators.IN;
                let isNotNegation = !filterRow.isNegation();
                return isSelectionOperator && isNotNegation;
            });
        let selectedValues = !!selectedFilterRow ? selectedFilterRow.getValues() : [];
        this.selectedItems = this.getValueMapFromFilterValues(selectedValues);
        return this.selectedItems;
    }

    public getExcludedFilterItems() : {[key: string]: boolean} {
        if (this.excludedItems !== void 0) {
            return this.excludedItems;
        }
        let excludedFilterRow = this.getAttributeFilterRows()
            .find((filterRow: SingleOperatorFilterRow) => {
                return (filterRow.getOperator() === FilterRowOperators.NE)
                    || (filterRow.getOperator() === FilterRowOperators.IN
                    && filterRow.isNegation());
            });
        let excludedValues = !!excludedFilterRow ? excludedFilterRow.getValues() : [];
        this.excludedItems = this.getValueMapFromFilterValues(excludedValues);
        return this.excludedItems;
    }

    public getFilterDataCache(showAllValues: boolean): {[subString: string] : string[]} {
        return showAllValues ? this.allFilterValueCache : this.filterValueCache;
    }

    public putFilterDataCache(subString: string, knownMatches: string[], showAllValues: boolean) {
        let cacheToUpdate = showAllValues ? this.allFilterValueCache : this.filterValueCache;
        cacheToUpdate[subString] = knownMatches;
    }

    public getFilterDataCacheValue(subString: string, showAllValues: boolean) : string[] {
        let cacheToUse = showAllValues ? this.allFilterValueCache : this.filterValueCache;
        return cacheToUse[subString];
    }

    public updateFilterValues(values: string[], showAllValues: boolean) {
        if (showAllValues) {
            this.allFilterItems = {};
        } else {
            this.filterItems = {};
        }
        let itemsToUpdate = showAllValues ? this.allFilterItems : this.filterItems;
        values.forEach((val) => {
            let key = util.isSpecialValue(val)
                ? util.getSpecialFormatData(val)
                : val;
            let value = this.getSelectedFilterItems()[val] !== void 0
                ? this.getSelectedFilterItems()[val]
                : false;
            itemsToUpdate[key] = value;
        });
    }

    public getFilterItems(showAllValues: boolean) : {[key: string]: boolean} {
        return showAllValues ? this.allFilterItems : this.filterItems;
    }

    public isSupportedByUI() : boolean {
        if (!super.isSupportedByUI()) {
            return false;
        }

        let isCompoundFilter = this.filterRows.length > 1;
        if (isCompoundFilter) {
            return false;
        }

        let filterRows = this.getAttributeFilterRows();
        let hasContainsFilter = filterRows.some((row) => {
            return row.getOperator() === FilterRowOperators.CONTAINS;
        });
        if (hasContainsFilter) {
            return false;
        }
        // TODO(Jasmeet): When we enable the exclude functionality we need to bring this code back.
        // if (this.filterRows.length > 1) {
        //     let supportedOpertors = [
        //         FilterRowOperators.EQ,
        //         FilterRowOperators.IN,
        //         FilterRowOperators.NE
        //     ];
        //     let unsupported = this.getAttributeFilterRows().some((filterRow) => {
        //         let supported = supportedOpertors.some((op) => {
        //             return op === filterRow.getOperator();
        //         });
        //         return !supported;
        //     });
        //     if (unsupported) {
        //         return false;
        //     }
        // }

        return true;
    }

    private getAttributeFilterRows() : SingleOperatorFilterRow[] {
        let rows: SingleOperatorFilterRow[] = [];
        this.filterRows.forEach((baseRow) => {
            if (baseRow instanceof SingleOperatorFilterRow) {
                rows.push(baseRow);
            } else {
                this.logger.error('Attribute filter doesnt support multiOperatorRow');
            }
        });
        return rows;
    }

    private getValueMapFromFilterValues(values: FilterValue[]) : {[key: string]: boolean} {
        let valueMap = values.reduce((accumulator, filterValue) => {
            let key = filterValue.getKey() === null
                ? strings.NULL_VALUE_PLACEHOLDER_LABEL
                : filterValue.getKey();
            accumulator[key] = filterValue.isSelected();
            return accumulator;
        }, {});

        return valueMap;
    }
}
