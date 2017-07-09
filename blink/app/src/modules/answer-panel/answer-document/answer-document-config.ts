/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Exports a config class for Answer Document.
 */
import {Provide} from '../../../base/decorators';
import {AnswerPageActionsConfig} from '../answer-page/answer-page-actions-util';

@Provide('AnswerDocumentConfig')
export class AnswerDocumentConfig {
    constructor(public sageSearchOnInit: boolean = true,
                public disableAutoTitle: boolean = false,
                public actionsConfig: AnswerPageActionsConfig) {
    }
}
