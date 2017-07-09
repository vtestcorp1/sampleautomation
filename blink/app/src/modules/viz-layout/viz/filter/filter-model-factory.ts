/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import _ from 'lodash';
import {ngRequire, Provide} from '../../../../base/decorators';
import {jsonConstants} from '../../answer/json-constants';
import {AttributeFilterModel} from './attribute-filter-model';
import {DateFilterModel} from './date-filter-model';
import {Filter} from './filter';
import {MeasureFilterModel} from './measure-filter-model';

let filterUtil = ngRequire('filterUtil');

export function getFilterModel(params) {
    let vizJson = params[jsonConstants.visualizationModel.VIZ_JSON];
    let vizContent = vizJson[jsonConstants.VIZ_CONTENT_KEY];
    let filterJson = _.get(params, 'answerSheetJson.sheetContent.filter', null);
    let filter = new Filter(filterJson);
    let filterRowIndex = filterUtil.isCompoundFilter(vizContent)
        ? vizContent[jsonConstants.COMPOUND_INDICES_KEY][0]
        : vizContent[jsonConstants.filter.ROW_INDEX];
    let filterColumn = filter.getFilterContent().getRowAtIndex(filterRowIndex).getColumn();
    if (filterColumn.isDateColumn()) {
        return new DateFilterModel(params, filter);
    } else if (filterColumn.isAttribute()) {
        return new AttributeFilterModel(params, filter);
    } else {
        return new MeasureFilterModel(params, filter);
    }
}

Provide('FilterModelFactory')({
    getFilterModel
});
