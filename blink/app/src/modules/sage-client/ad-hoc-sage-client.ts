import _ from 'lodash';
import {blinkConstants} from '../../base/blink-constants';
import {ngRequire} from '../../base/decorators';
import {AnswerSageClient} from './answer-sage-client';

let joinWorkflowLauncher = ngRequire('joinWorkflowLauncher');
let autoCompleteObjectUtil = ngRequire('autoCompleteObjectUtil');

declare var sage: any;

let AnswerDocumentModel = ngRequire('AnswerDocumentModel');

export class AdHocSageClient extends AnswerSageClient {
    private onQueryFailure: Function;

    constructor(sageContext: any,
                onQueryUpdate: Function,
                onQueryFailure: Function,
                onClientUse?: Function
    ) {
        super(
            new AnswerDocumentModel(sageContext),
            sageContext.getTables()[0].getFormattedTokens(),
            onQueryUpdate,
            onClientUse || _.noop
        );
        this.onQueryFailure = onQueryFailure;
        this.addSageModelUpdateCallback(this.sageModelUpdateCallback);
    }

    private sageModelUpdateCallback = () => {
        var sageModel = this.getSageModel();
        var errorCode = sageModel.sageResponseErrorInfo.errorCode;

        if (!!errorCode || errorCode !== sage.ErrorCode.SUCCESS) {
            if (errorCode === sage.ErrorCode.JOIN_PATH_AMBIGUITY) {
                joinWorkflowLauncher.launch(
                    sageModel.joinDisambiguationHelper.getJoinPathCollections(),
                    sageModel.tokens,
                    [],
                    blinkConstants.joinWorkflow.types.DEFINE_MAPPING
                ).then((resolvedTokens) => {
                    var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                    tableRequest.setInputTokens(resolvedTokens);

                    this.editTable(tableRequest, false, false);
                });
            } else {
                this.onQueryFailure();
            }
        }
    }
}
