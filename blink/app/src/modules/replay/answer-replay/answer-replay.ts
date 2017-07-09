/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import _ from 'lodash';
import {blinkConstants} from 'src/base/blink-constants';
import {Component, ngRequire} from 'src/base/decorators';
import {getRouteParameter} from 'src/base/route-service';
import {CanvasComponent} from '../../../base/app-canvas/canvas-component';
import {BaseComponent} from '../../../base/base-types/base-component';

let answerReplayService = ngRequire('answerReplayService');
let DocumentLoader = ngRequire('DocumentLoader');
let jsonConstants = ngRequire('jsonConstants');

@Component({
    name: 'bkAnswerReplay',
    templateUrl: 'src/base/empty-template.html'
})
export class AnswerReplayComponent extends BaseComponent implements CanvasComponent {
    private static answerIdParam = 'answerId';

    constructor () {
        super();
        let documentLoader = new DocumentLoader(_.noop);
        let answerId = getRouteParameter(AnswerReplayComponent.answerIdParam);
        documentLoader.loadDocument(
            answerId,
            jsonConstants.metadataType.QUESTION_ANSWER_BOOK,
            true
        ).then((answerModel) => {
            answerReplayService.startReplay({
                model: answerModel,
                type: blinkConstants.documentType.ANSWER,
                permission: answerModel.getPermission()
            });
        });
    }

    public onCanvasStateChange = (params: {[paramName: string]: string}) => {
        return;
    }
}
