/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class representing filter row with multiple operators.
 * This happens in cases like revenue 1992 1994, the row contains multiple
 * BW operators in this case.
 */

import _ from 'lodash';
import {ngRequire, Provide} from '../../../../base/decorators';
import {jsonConstants} from '../../answer/json-constants';
import {BaseFilterRow} from './filter-row';
import {FilterRowOperators, FilterValue} from './filter-types';

let Logger = ngRequire('Logger');

@Provide('MultiOperatorFilterRow')
export class MultiOperatorFilterRow extends BaseFilterRow {
    private operators: FilterRowOperators[];
    private valueSets: FilterValue[][];

    constructor(filterRowJson: any = {}) {
        super(filterRowJson[jsonConstants.filter.COLUMN], filterRowJson[jsonConstants.TYPE_KEY]);
        this.operators = [];
        this.valueSets = [];
        this.logger = Logger.create('multi-operator-filter-row');

        if (!_.isArray(filterRowJson[jsonConstants.filter.MULTIPLE_OPERATORS_KEY])) {
            this.logger.error('Multi operator missing array of rows');
        }

        filterRowJson[jsonConstants.filter.MULTIPLE_OPERATORS_KEY]
            .forEach((operatorRow, idx) => {
                let operator: string = operatorRow[jsonConstants.filter.MULTIPLE_OPERATOR.OPERATOR];
                this.operators[idx] = FilterRowOperators[operator];
                this.valueSets[idx] = operatorRow[jsonConstants.filter.MULTIPLE_OPERATOR.VALUES]
                    .map( filterValueJson => new FilterValue(filterValueJson));
            });
    }

    public isEmpty() : boolean {
        return this.valueSets.every((valueSet) => {
            return valueSet.length === 0;
        });
    }
}
