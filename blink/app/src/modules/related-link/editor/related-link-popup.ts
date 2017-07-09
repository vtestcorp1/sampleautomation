/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {ComponentPopupService} from '../../../base/component-popup-service/component-popup-service';
import {Component} from '../../../base/decorators';
import {RelatedLinkListViewerComponent} from './related-link-list-viewer';

/**
 * A related link popup component shows the related link view modes.
 */
@Component({
    name: 'bkRelatedLinkPopup',
    templateUrl: 'src/modules/related-link/editor/related-link-popup.html'
})
export class RelatedLinkPopupComponent extends BaseComponent {

    public relatedLinkListViewerComponent : RelatedLinkListViewerComponent;
    private vizModel : any;

    public constructor(vizModel: any) {
        super();
        this.vizModel = vizModel;
        this.init();
    }

    public show(): void {
        ComponentPopupService.show('related-link-popup', this);
    }

    public hide(): void {
        ComponentPopupService.hide();
    }

    private init(): void {
        this.relatedLinkListViewerComponent = new RelatedLinkListViewerComponent(this.vizModel);
    }
}
