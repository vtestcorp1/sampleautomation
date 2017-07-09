/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Canvas component for home page.
 */
import _ from 'lodash';
import {CanvasComponent} from '../../base/app-canvas/canvas-component';
import {UIComponent} from '../../base/base-types/ui-component';
import {Component} from '../../base/decorators';
import {events} from '../../base/events/events';

@Component({
    name: 'bkHome',
    templateUrl: 'src/modules/home/home-page.html'
})
export class HomeComponent extends UIComponent implements CanvasComponent {
    private static SCROLL_DELAY: number = 250;

    constructor() {
        super();
    }

    public postLink(element: JQuery) {
        let self = this;
        element.find('.bk-home-content').scroll(_.debounce(
            function() {
                self.reflowPinboard();
            },
            HomeComponent.SCROLL_DELAY
        ));
    }

    public onCanvasStateChange() {
        return;
    }

    private reflowPinboard() {
        this.broadcast(events.REFLOW_PINBOARD);
    }
}
