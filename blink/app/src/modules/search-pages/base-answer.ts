/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is the base class for all search pages.
 */

import {ScopedComponent} from '../../base/base-types/scoped-component';
import {AnswerDocumentComponent} from '../answer-panel/answer-document/answer-document';

export class BaseAnswerComponent extends ScopedComponent {
    public answerDocumentComponent: AnswerDocumentComponent;
    // NOTE: the get/set semantics for _answerModel are defined in the parent.
    // It seems like an open issue on how to handle getter/setter when sub-classing.
    // https://github.com/Microsoft/TypeScript/issues/338
    protected _answerModel: any;

    constructor () {
        super();
    }

    public getAnswerModel() {
        return this._answerModel;
    }
}
