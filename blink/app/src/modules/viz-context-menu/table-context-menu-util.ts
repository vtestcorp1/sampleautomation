/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 */

import _ from 'lodash';
import {ngRequire, Provide} from '../../base/decorators';
import {strings} from '../../base/strings';
import {VisualizationColumnModel} from '../callosum/model/visualization-column';
import {
    ContextMenuInputPointBase, ContextMenuInputValue, disableMenuItemWithExplanation,
    getVizContextMenuItems, OptionTypeToOptionItem, sortContextMenuItems,
    VizContextMenuItem, VizContextMenuOptionType
} from './viz-context-menu-util';

let Logger = ngRequire('Logger');
let util = ngRequire('util');
let tableUtil = ngRequire('tableUtil');
let logger: any;


declare let flags;

class TableContextMenuInputPoint extends ContextMenuInputPointBase {
    public push(value: ContextMenuInputValue, type: 'FILTERED' | 'UNFILTERED') {
        this.allValues.push(value);
        if (type === 'FILTERED') {
            this.filteredValues.push(value);
        } else {
            this.unfilteredValues.push(value);
        }
    }
}

function getInputForTableContextMenu(
    tableModel: any,
    clickedCell: any,
    slickGrid: any,
    fidToVizColumnMap: {[fid: string]: VisualizationColumnModel},
    isChasmTrapQuery: boolean
): {
    menuItems?: OptionTypeToOptionItem[],
    clickedPoint?: TableContextMenuInputPoint
} {
    logger = logger || Logger.create('table-context-menu-util');

    if (!clickedCell) {
        logger.warn('Click on grid did not find a cell', clickedCell);
        return {};
    }

    // Get the data values from slick grid for this row.
    // Get the current slick grid column configuration.
    // Build query transformations for each column=value pair
    let tableData = slickGrid.getData().getItems(),
        gridColumns = slickGrid.getColumns();
    if (!tableData || !gridColumns || tableData.length <= clickedCell.row) {
        logger.warn(
            'The clicked cell falls outside the data range',
            clickedCell.row,
            tableData.length
        );
        return {};
    }

    let clickedRowData = tableData[clickedCell.row];

    let contextMenuInputPoint = new TableContextMenuInputPoint();

    gridColumns.forEach(function (gridColumn, idx) {
        let field = gridColumn.field;

        if (!Object.has(fidToVizColumnMap, field)) {
            return;
        }

        let vizCol = fidToVizColumnMap[field],
            vizColValue = vizCol.convertValueFromBackend(clickedRowData[field], void 0);

        if (vizCol.isAttribute()) {
            // Note (sunny): pre-formatting of nulls here is not in line with
            // passing un-formatted values in all other places. This should go
            // away one we have the refactoring like getInputForChartContextMenu
            // mentioned above
            if (vizColValue === null) {
                vizColValue = util.formatDataLabel(vizColValue);
            }

            // each selected cell becomes a filter value
            let isCellSelected = tableUtil.isCellSelected(
                slickGrid,
                clickedCell.row,
                idx
            );

            if (isCellSelected) {
                contextMenuInputPoint.push(
                    new ContextMenuInputValue(vizCol, vizColValue),
                    'FILTERED'
                );
            } else {
                contextMenuInputPoint.push(
                    new ContextMenuInputValue(vizCol, vizColValue),
                    'UNFILTERED'
                );
            }
        } else {
            contextMenuInputPoint.push(
                new ContextMenuInputValue(vizCol, vizColValue),
                'UNFILTERED'
            );
        }
    });

    let menuItems = getVizContextMenuItems(tableModel, contextMenuInputPoint, [], isChasmTrapQuery);
    // underlying data makes sense only for an entire row
    let isEntireRowSelected = tableUtil.isExactlyOneRowSelected(
        slickGrid,
        clickedCell.row
    );
    if (!isEntireRowSelected) {
        disableMenuItemWithExplanation(
            menuItems,
            VizContextMenuOptionType.DRILL,
            strings.vizContextMenu.disabledHelp.drillDownPartialRow
        );
        disableMenuItemWithExplanation(
            menuItems,
            VizContextMenuOptionType.LEAF_LEVEL,
            strings.vizContextMenu.disabledHelp.underlyingDataPartialRow
        );
    }

    if (!tableUtil.isExactlyOneCellSelected(slickGrid)) {
        disableMenuItemWithExplanation(
            menuItems,
            VizContextMenuOptionType.EXCLUDE,
            strings.vizContextMenu.disabledHelp.multiCellExclude
        );
        disableMenuItemWithExplanation(
            menuItems,
            VizContextMenuOptionType.INCLUDE,
            strings.vizContextMenu.disabledHelp.multiCellInclude
        );
    }

    if (flags.getValue('showRelatedLinks') &&
        contextMenuInputPoint.filteredValues.length > 0) {
        menuItems[VizContextMenuOptionType.APPLY_AS_RUNTIME_FILTER] =
            new VizContextMenuItem(VizContextMenuOptionType.APPLY_AS_RUNTIME_FILTER);
    }

    menuItems[VizContextMenuOptionType.COPY_TO_CLIPBOARD] =
        new VizContextMenuItem(VizContextMenuOptionType.COPY_TO_CLIPBOARD);


    return {
        menuItems: sortContextMenuItems(_.values(menuItems)),
        clickedPoint: contextMenuInputPoint
    };
}

export {
    TableContextMenuInputPoint,
    getInputForTableContextMenu
};

Provide('tableContextMenuUtil')({
    getInputForTableContextMenu
});
