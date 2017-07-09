/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Base class for all saved search pages. Eg saved answer, aggregated worksheet
 * editor and viz context answer.
 */

import {BaseAnswerComponent} from './base-answer';

export class BaseSavedAnswerComponent extends BaseAnswerComponent {
    private _savedAnswerOnServer: any;

    constructor () {
        super();
    }

    public get savedAnswerOnServer() : any {
        return this._savedAnswerOnServer;
    }

    public set savedAnswerOnServer(newAnswerModel: any) {
        this._savedAnswerOnServer = newAnswerModel.clone();
    }
}
