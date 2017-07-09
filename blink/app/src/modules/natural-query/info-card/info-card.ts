/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */
import {BaseComponent} from '../../../base/base-types/base-component';
import {blinkConstants} from '../../../base/blink-constants';
import {Component} from '../../../base/decorators';

@Component({
    name: 'bkInfoCard',
    templateUrl: 'src/modules/natural-query/info-card/info-card.html'
})
export class InfoCardComponent extends BaseComponent {
    public answerModel: any;
    public titleText: string;

    constructor(answerModel: any) {
        super();
        this.answerModel = answerModel;
        this.titleText = blinkConstants.infoCard.TITLE;
    }

    public shouldShowTitle() : boolean {
        return !!this.answerModel;
    }

    public updateAnswerModel(answerModel: any) {
        this.answerModel = answerModel;
    }
}
