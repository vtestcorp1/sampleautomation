/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Gunjan Jha(gunjan.jha@thoughtspot.com)
 *
 * @fileoverview This component displays the sage columns for customer to exclude for
 * a3 analysis.
 *
 */

'use strict';

import {Component} from '../../../../base/decorators';
import {A3TableAnalysisCustomizerComponent} from
    '../analysis-customizer/a3-table-analysis-customizer';
import {A3TableColumnSelectorComponent} from '../column-selector/a3-table-column-selector';

/**
 * Column exclusion component
 */
@Component({
    name: 'bkA3TableColumnExcluder',
    templateUrl: 'src/modules/a3/table/column-excluder/a3-table-column-excluder.html'
})
export class A3TableColumnExcluderComponent extends A3TableColumnSelectorComponent {

    public constructor(
        tableId: string,
        allColumns: any[],
        selectedColumnIds: string[],
        a3TableAnalysisCustomizerComponent: A3TableAnalysisCustomizerComponent) {
        super(tableId, allColumns, selectedColumnIds, a3TableAnalysisCustomizerComponent);
    }
}
