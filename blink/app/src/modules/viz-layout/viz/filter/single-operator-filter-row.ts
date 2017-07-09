/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Represents the single operator filter row.
 */

import {Provide} from '../../../../base/decorators';
import {jsonConstants} from '../../answer/json-constants';
import {BaseFilterRow} from './filter-row';
import {FilterRowOperators, FilterValue} from './filter-types';

@Provide('SingleOperatorFilterRow')
export class SingleOperatorFilterRow extends BaseFilterRow {
    private operator: FilterRowOperators;
    private values: FilterValue[];
    private negation: boolean;

    constructor(filterRowJson: any) {
        super(
            filterRowJson[jsonConstants.filter.COLUMN],
            filterRowJson[jsonConstants.TYPE_KEY]
        );
        let operatorStr: string = filterRowJson[jsonConstants.filter.SINGLE_OPERATOR_KEY];
        this.operator = FilterRowOperators[operatorStr];
        this.values = filterRowJson[jsonConstants.VALUES_KEY]
            .map( filterValueJson => {
                return new FilterValue(filterValueJson);
            });

        this.negation = !!filterRowJson[jsonConstants.filter.NEGATION];
    }

    public getOperator() : FilterRowOperators {
        return this.operator;
    }

    public getValues() : FilterValue[] {
        return this.values;
    }

    public isEmpty() : boolean {
        return this.values.length === 0;
    }

    public isNegation(): boolean {
        return this.negation;
    }
}
