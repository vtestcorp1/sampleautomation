/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview: A component wrapper over slick grid.
 */

import _ from 'lodash';
import {UIComponent} from '../../../base/base-types/ui-component';
import {Component, ngRequire} from '../../../base/decorators';
import {
    SlickCell,
    SlickColumnModel, SlickGridDataView, SlickSelectionRange,
    SlickTableModel
} from './slick-table-model';

let tableUtil = ngRequire('tableUtil');
let util = ngRequire('util');

declare let flags: any;
declare let Slick: any;
export type DataFormatter = (row: number, cell: number, value: any,
                      columnDef: SlickColumnModel, dataContext: any) => void;

@Component({
    name: 'bkSlickTable',
    templateUrl: 'src/common/widgets/slick-table/slick-table.html'
})
export class SlickTable extends UIComponent {
    private static TABLE_SELECTOR = '.bk-table';
    private static COLUMN_NAME_SELECTOR = '.slick-column-name';
    private static SELECTED_RANGE_BOX_CLASS = 'bk-grid-selected-ranges-decoration';

    private _paginationInfo;
    private _grid;
    private _dataFormatter: DataFormatter;
    private _slickTableModel: SlickTableModel;
    private _slickDataView: SlickGridDataView;

    // Plugins
    private columnMenuPlugin;
    private columnChosenPlugin;

    private _onCellRightClick;
    private _onCellLeftClick;
    private _onSortClick;
    private _onColumnReorder;
    private _onColumnResize;

    constructor(slickTableModel: SlickTableModel, dataFormatter: DataFormatter,
                onCellRightClick, onCellLeftClick, onSortClick,
                onColumnReorder, onColumnResize) {
        super();
        this._slickTableModel = slickTableModel;
        this._dataFormatter = dataFormatter;
        this._slickDataView = new SlickGridDataView([], false);

        this._onSortClick = onSortClick;
        this._onCellRightClick = onCellRightClick;
        this._onCellLeftClick = onCellLeftClick;
        this._onColumnReorder = onColumnReorder;
        this._onColumnResize = onColumnResize;
    }

    public postLink(element: JQuery) {

        this._grid = new Slick.Grid(
            element.find(SlickTable.TABLE_SELECTOR),
            this._slickDataView,
            this._slickTableModel.columns,
            this._slickTableModel.options
        );
        this.configurePlugins();
        this._render();
    }

    public reflow() {
        this.updatePaginationInfo();
    }

    public onDestroy(el) {
        super.onDestroy(el);
        this._grid.unregisterPlugin(this.columnMenuPlugin);
        this.columnMenuPlugin.destroy();
        this._grid.unregisterPlugin(this.columnChosenPlugin);
        this.columnChosenPlugin.destroy();
        this._grid.destroy();
    }

    public getTableModel(): SlickTableModel {
        return this._slickTableModel;
    }

    public updateData(dataView: SlickGridDataView) {
        this._slickDataView = dataView;
        if (this.isLinked) {
            this._render();
        }
    }

    public getPaginationInfo() {
        return this._paginationInfo;
    }

    public containsHeaderDropdown(): boolean {
        return _.some(this._slickTableModel.columns, function (column) {
            return !! column.chosenPluginParams;
        });
    }

    private updatePaginationInfo() {
        this._paginationInfo = tableUtil.getPaginationInfo(
            this._grid.getViewport(),
            this._slickDataView.getLength(),
            this._slickDataView.hasMoreData()
        );
    }

    private _render() {
        this._grid.render();
        this.updatePaginationInfo();
    }

    private onViewportChange = () => {
        this.updatePaginationInfo();
    }

    private onSelectionChange = (evt, selectedRanges: Array<SlickSelectionRange>) => {
        $(this._grid.getCanvasNode()).find('.' + SlickTable.SELECTED_RANGE_BOX_CLASS).remove();
        selectedRanges.each((range) => {
            let $box = $('<div></div>')
                .addClass(SlickTable.SELECTED_RANGE_BOX_CLASS)
                .css('position', 'absolute')
                .appendTo(this._grid.getCanvasNode());

            let from = this._grid.getCellNodeBox(range.fromRow, range.fromCell);
            let to = this._grid.getCellNodeBox(range.toRow, range.toCell);

            if (from) {
                $box.css({
                    top: from.top - 1 ,
                    left: from.left - 1,
                    height: to.bottom - from.top - 2,
                    width: to.right - from.left - 2
                });
            }
        });
    }

    private getCurrentSelection(): Array<SlickSelectionRange> {
        return this._grid.getSelectionModel().getSelectedRanges();
    }

    private configurePlugins() {
        // On viewport change.
        this._grid.onViewportChanged.subscribe(_.debounce(this.onViewportChange, 100));

        // Applies tooltip over column headers defined by @toolTip parameter in @SlickColumnModel.
        this._grid.onHeaderCellRendered.subscribe(function (e, args) {
            let $colEl: any = $(args.node);
            $colEl.find(SlickTable.COLUMN_NAME_SELECTOR).attr('title', '');
            $colEl.tooltip({
                html: true,
                placement: 'bottom',
                container: 'body'
            });
        });

        // Applies a chosen dropdown on column header defined by @chosenPluginParams
        // object in @SlickColumnModel.
        this.columnChosenPlugin = new Slick.Custom.ChosenColumnHeaderPlugin();
        this._grid.registerPlugin(this.columnChosenPlugin);

        // Applies a column menu on column header defined by @menuPluginParams
        // object in @SlickColumnModel.
        this.columnMenuPlugin = new Slick.Custom.ColumnMenuPlugin();
        this._grid.registerPlugin(this.columnMenuPlugin);

        // Enables cell selection on SlickGrid.
        let selectionModel = new Slick.CellSelectionModel();
        selectionModel.onSelectedRangesChanged.subscribe(this.onSelectionChange);
        this._grid.setSelectionModel(selectionModel);
        this._grid.onDblClick.subscribe((evt, cell: SlickCell) => {
            this._grid.setSelectedRows([cell.row]);
        });
        this.addWindowListener('click.tableSelection', (event: JQueryEventObject) => {
            if (util.isClickOutside($(this._grid.getCanvasNode()), event)) {
                this._grid.getSelectionModel().setSelectedRanges([]);
                this._grid.resetActiveCell();
            }
        });
    }
}
