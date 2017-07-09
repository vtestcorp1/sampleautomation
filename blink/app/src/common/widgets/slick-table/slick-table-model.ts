/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview: Defines various interfaces needed to interact with
 * the slick-table component.
 */

export interface SlickGridOptions {
    enableCellNavigation: boolean;
    enableColumnReorder: boolean;
    enableTextSelectionOnCells: boolean;
    multiColumnSort: boolean;
    syncColumnCellResize: boolean;
    fullWidthRows: boolean;
    forceFitColumns: boolean;
    rowHeight: number;
    enableAsyncPostRender: boolean;
    autoHeight: boolean;
}

export interface ColumnMenuPluginParams {
    getMenuBtnDom: Function;
    getMenuDom: Function;
}

export interface ColumnChosenPluginParams {
    optionsMap : any;
    selectedValue : string;
    width : string;
    onSelectionChange: (selection: any) => void;
}

export class SlickCell {
    row: number;
    cell: number;
}

export class SlickSelectionRange {
    fromCell: number;
    toCell: number;
    fromRow: number;
    toRow: number;
}

export class SlickColumnModel {
    id: string;
    field: string;
    name: string;
    headerCssClass: string;
    cssClass: string;
    defaultSortAsc: boolean;
    formatter: Function;
    asyncPostRender: Function;
    minWidth: number;
    sortable: boolean;
    width: number;
    editor: any;
    toolTip: string;
    chosenPluginParams: ColumnChosenPluginParams;
    menuPluginParams: ColumnMenuPluginParams;
}

export class SlickTableModel {
    public columns: Array<SlickColumnModel>;
    public options: SlickGridOptions;

    constructor(slickColumns: Array<SlickColumnModel>, slickGridOptions: SlickGridOptions) {
        this.columns = slickColumns;
        this.options = slickGridOptions;
    }
}

export class SlickGridDataView {
    private _dataRows: Array<any>;
    private _hasMoreData: boolean;

    constructor(dataRows, hasMoreData: boolean) {
        this._dataRows = dataRows;
        this._hasMoreData = hasMoreData;
    }

    public getItems(): Array<any> {
        return this._dataRows;
    }

    public setItems(items: Array<any>) {
        this._dataRows = items;
    }

    public getLength(): number {
        return this._dataRows.length;
    }

    public getItem(index): any {
        return this._dataRows[index];
    }

    public hasMoreData(): boolean {
        return this._hasMoreData;
    }
}
