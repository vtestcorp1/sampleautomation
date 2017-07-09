/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Exports a config class for column panel component.
 */

import {Provide} from '../../../../base/decorators';

@Provide('ColumnPanelComponentConfig')
export class ColumnPanelComponentConfig {
    private _displayAnswerFormula: boolean = false;
    private _showCheckMarks: boolean = true;
    private _disallowColumnAddition: boolean = false;
    private _disallowColumnSelection: boolean = false;
    private _noSourcesPlaceholderString: string;
    private _openFilterHandler: Function;
    private _onColumnDblClick: Function;
    private _formulaHandler: Function;

    constructor(displayAnswerFormula: boolean,
                showCheckMarks: boolean,
                disallowColumnAddition: boolean,
                disallowColumnSelection: boolean,
                noSourcesPlaceholderString: string,
                openFilterHandler: Function,
                onColumnDblClick: Function,
                formulaHandler: Function) {
        this._displayAnswerFormula = displayAnswerFormula;
        this._showCheckMarks = showCheckMarks;
        this._disallowColumnAddition = disallowColumnAddition;
        this._disallowColumnSelection = disallowColumnSelection;
        this._noSourcesPlaceholderString = noSourcesPlaceholderString;
        this._openFilterHandler = openFilterHandler;
        this._onColumnDblClick = onColumnDblClick;
        this._formulaHandler = formulaHandler;
    }

    get displayAnswerFormula() {
        return this._displayAnswerFormula;
    }
    get showCheckMarks() {
        return this._showCheckMarks;
    }
    get disallowColumnAddition() {
        return this._disallowColumnAddition;
    }
    get disallowColumnSelection() {
        return this._disallowColumnSelection;
    }
    get noSourcesPlaceholderString() {
        return this._noSourcesPlaceholderString;
    }
    get openFilterHandler() {
        return this._openFilterHandler;
    }
    get onColumnDblClick() {
        return this._onColumnDblClick;
    }
    get formulaHandler() {
        return this._formulaHandler;
    }
}
