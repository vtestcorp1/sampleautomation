/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import _ from 'lodash';
import {ngRequire, Provide} from '../../../../base/decorators';
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';
import {jsonConstants} from '../../answer/json-constants';
import {GeoFilterObject} from '../chart/geomap/base/geo-filter-objects';
import {VisualizationModel} from '../visualization-model';
import {Filter} from './filter';
import {BaseFilterRow} from './filter-row';
import {FilterRowType} from './filter-types';
import {MultiOperatorFilterRow} from './multi-operator-filter-row';
import {SingleOperatorFilterRow} from './single-operator-filter-row';

let Logger = ngRequire('Logger');
let filterUtil = ngRequire('filterUtil');

@Provide('FilterModel')
export abstract class FilterModel extends VisualizationModel {
    protected logger;
    protected filterRows: BaseFilterRow[];
    protected filterColumn: VisualizationColumnModel;
    protected needsDataFromServer: boolean = true;

    private canGenerateQuery: boolean;

    constructor(params: any, filter: Filter) {
        super(params);
        this.logger = Logger.create('filter model');
        let vizContent = this.getJson();

        this.canGenerateQuery = vizContent.hasOwnProperty(jsonConstants.CAN_GENERATE_QUERY)
            ? vizContent[jsonConstants.CAN_GENERATE_QUERY]
            : true;
        if (filterUtil.isCompoundFilter(vizContent)) {
            this.filterRows = vizContent[jsonConstants.COMPOUND_INDICES_KEY]
                .map((rowIdx) => {
                    return filter.getFilterContent().getRowAtIndex(rowIdx);
                });
        } else {
            let rowIndex = vizContent[jsonConstants.filter.ROW_INDEX];
            this.filterRows = [filter.getFilterContent().getRowAtIndex(rowIndex)];
        }
        this.filterColumn = this.filterRows[0].getColumn();
    }

    public isSupportedByUI() : boolean {
        let hasMultiOperatorFilter = this.filterRows.some((filterRow) => {
            return filterRow instanceof MultiOperatorFilterRow;
        });
        if (hasMultiOperatorFilter) {
            return false;
        }
        if (this.needsDataFromServer && !this.canGenerateQuery) {
            return false;
        }
        if (!this.filterColumn.isFilteringSupportedByUI()) {
            return false;
        }
        return true;
    }

    public getColumn() : VisualizationColumnModel {
        return this.filterColumn;
    }

    /**
     * Encapsulates logic of whether or not a filter should be displayed as a
     * widget (note this is different from just disabling user actions on
     * it as in  isSupportedByUI).
     */
    public shouldDisplay() : boolean {
        return !this.isGeoFilter();
    }

    /**
     * Encapsulates logic of whether a filter model has a supported
     * visualization in a geo map.
     */
    public isSupportedByGeoMaps() : boolean {
        return this.isGeoFilter();
    }

    public getFilterRows() : BaseFilterRow[] {
        return this.filterRows;
    }

    /**
     * Returns the GeoObjects associated with this filter, these GeoObjects
     * will be drawn on a geo-object-layer.js.
     */
    public getGeoObjects (): GeoFilterObject[] {
        let id = 'FilterModel';
        let circleObjects = _.get(this.filterColumn, 'definition.geographicInformation.circle', []);
        circleObjects.forEach((circle) => {
            circle.id = id;
            circle.type = 'CIRCLE';
        });
        return circleObjects;
    }

    public isEmpty() : boolean {
        return this.filterRows.every((filterRow) => {
            return filterRow.isEmpty();
        });
    }

    public getSingleOperatorFilterRows() : SingleOperatorFilterRow[] {
        let rows: SingleOperatorFilterRow[] = [];
        this.filterRows.forEach((baseRow) => {
            if (baseRow instanceof SingleOperatorFilterRow) {
                rows.push(baseRow);
            }
        });
        return rows;
    }

    public getMultiOperatorFilterRows() : MultiOperatorFilterRow[] {
        let rows: MultiOperatorFilterRow[] = [];
        this.filterRows.forEach((baseRow) => {
            if (baseRow instanceof MultiOperatorFilterRow) {
                rows.push(baseRow);
            }
        });
        return rows;
    }

    private isGeoFilter() : boolean {
        return this.filterRows.some((filterRow) => {
            return filterRow.getType() === FilterRowType.GEO;
        });
    }
}
