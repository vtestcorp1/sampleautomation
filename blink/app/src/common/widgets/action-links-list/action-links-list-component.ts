/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey
 * @fileoverview  A list of links
 *
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component}   from '../../../base/decorators';

export interface ActionLink {
    text: string;
    onClick: () => void;
}

@Component({
    name: 'bkActionLinksList',
    templateUrl: 'src/common/widgets/action-links-list/action-links-list.html'
})
export class ActionLinksListComponent extends BaseComponent {

    public constructor( private actionLinksList: ActionLink[]) {
        super();
    }

    public onClick(index: number) {
        this.actionLinksList[index].onClick();
    }
}

