/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Base class to represent Filter row.
 */

import {ngRequire} from '../../../../base/decorators';
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';
import {FilterRowType} from './filter-types';

let Logger = ngRequire('Logger');

export abstract class BaseFilterRow {
    protected logger;
    private visualizationColumnModel: VisualizationColumnModel;
    private filterRowType: FilterRowType;

    constructor(
        columnJson: any,
        filterRowType: string
    ) {
        this.logger = Logger.create('filter-row');
        this.visualizationColumnModel = new VisualizationColumnModel(columnJson);
        this.filterRowType = FilterRowType[filterRowType];
    }

    public getColumn() : VisualizationColumnModel {
        return this.visualizationColumnModel;
    }

    public getType() : FilterRowType {
        return this.filterRowType;
    }

    public isEmpty() : boolean {
        this.logger.error('concrete types should implement this');
        return false;
    }
}
