/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is a class to contain answer title to bind to content editable.
 */

import {ngRequire} from '../../../base/decorators';
import {strings} from '../../../base/strings';

let Logger = ngRequire('Logger');

export class AnswerPageTitle {
    public placeholder:string;

    private allowEditing: boolean;
    private answerModel: any;
    private logger: any;

    constructor(answerModel) {
        this.logger = Logger.create('answer-page-title');
        if (!answerModel) {
            this.logger.error('Answer page title initialized with empty answer');
            return;
        }
        this.answerModel = answerModel;
        this.placeholder = strings.UNTITLED_OBJECT_NAME;
        let permission = answerModel.getPermission();
        this.allowEditing = !permission.isReadOnly();
    }

    public get isTitleEditingAllowed() : boolean {
        return this.allowEditing;
    }

    get name() {
        return this.answerModel.getName();
    }

    set name(n) {
        this.answerModel.setName(n);
        this.answerModel.setHasUserDefinedName(true);
    }

    get desc() {
        return this.answerModel.getDescription();
    }

    set desc(d) {
        this.answerModel.setDescription(d);
    }
}
