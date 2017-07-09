/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */
import {BaseComponent} from '../../../base/base-types/base-component';
import {blinkConstants} from '../../../base/blink-constants';
import {Component} from '../../../base/decorators';
import {InfoCardComponent} from '../info-card/info-card';

@Component({
    name: 'bkInfoCardIcon',
    templateUrl: 'src/modules/natural-query/info-card-icon/info-card-icon.html'
})

export class InfoCardIconComponent extends BaseComponent {
    private static POPOVER_TEMPLATE_URL = 'info-card.html';

    public tooltipText: string;
    public popoverTemplateUrl: string;
    public infoCardComponent: InfoCardComponent;

    private answerModel: any;
    private _isInfoCardOpen: boolean;

    constructor(answerModel: any) {
        super();
        this.tooltipText = blinkConstants.infoCard.TITLE;
        this.popoverTemplateUrl = InfoCardIconComponent.POPOVER_TEMPLATE_URL;
        this._isInfoCardOpen = false;
        this.answerModel = answerModel;
        this.infoCardComponent = new InfoCardComponent(answerModel);
    }

    public toggleInfoCard() {
        this._isInfoCardOpen = !this._isInfoCardOpen;
    }

    public isInfoCardOpen() {
        return this._isInfoCardOpen;
    }

    public hideInfoCard() {
        this._isInfoCardOpen = false;
    }

    public updateAnswerModel(answerModel: any) {
        this.answerModel = answerModel;
        this.infoCardComponent.updateAnswerModel(answerModel);
    }
}
