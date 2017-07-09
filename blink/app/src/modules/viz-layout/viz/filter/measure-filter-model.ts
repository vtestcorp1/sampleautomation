/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import {Filter} from './filter';
import {FilterModel} from './filter-model';
import {FilterRowOperators} from './filter-types';

export class MeasureFilterModel extends FilterModel {
    constructor(params, filter: Filter) {
        super(params, filter);
        this.needsDataFromServer = false;
    }

    public isSupportedByUI() : boolean {
        if (!super.isSupportedByUI()) {
            return false;
        }

        let isCompoundFilter = this.filterRows.length > 1;
        if (isCompoundFilter) {
            return false;
        }

        let singleOperatorFilterRows = this.getSingleOperatorFilterRows();
        let hasInFilter = singleOperatorFilterRows.some((row) => {
            return row.getOperator() === FilterRowOperators.IN;
        });

        if (hasInFilter) {
            return false;
        }

        return true;
    }
}
