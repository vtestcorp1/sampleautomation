/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview QuestionModel
 */

'use strict';

import {Provide} from 'src/base/decorators';
import {jsonConstants} from '../../viz-layout/answer/json-constants';

declare var sage: any;

@Provide('QuestionModel')
export class QuestionModel {
    constructor(questionJson) {
        if (!questionJson) {
            return this;
        }

        var serializedProto = questionJson[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
        var context = sage.deserialize(serializedProto, sage.ACContext);
        var contextIndex = questionJson[jsonConstants.SAGE_CONTEXT_INDEX_KEY] || 0;

        this[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = context;
        this[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = contextIndex;
        this[jsonConstants.TEXT_KEY] = questionJson[jsonConstants.TEXT_KEY];
        this[jsonConstants.IS_CHASM_TRAP_QUERY_KEY] =
            questionJson[jsonConstants.IS_CHASM_TRAP_QUERY_KEY];
    }

    public setContext(context) {
        this[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = context;
    }

    public getContext() {
        return this[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
    }

    public setContextIndex(contextIndex) {
        this[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = contextIndex;
    }

    public getContextIndex() {
        return this[jsonConstants.SAGE_CONTEXT_INDEX_KEY];
    }

    public getText() : string {
        return this[jsonConstants.TEXT_KEY];
    }

    public getIsChasmTrapQuery(): boolean {
       return this[jsonConstants.IS_CHASM_TRAP_QUERY_KEY];
    }

    public getQuestionJson() {
        var questionJson = Object.assign({}, this);
        questionJson[jsonConstants.SAGE_CONTEXT_PROTO_KEY] =
            sage.serialize(questionJson[jsonConstants.SAGE_CONTEXT_PROTO_KEY]);
        return questionJson;
    }
}
