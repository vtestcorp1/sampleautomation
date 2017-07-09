/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Schema Legend Component
 *
 * This component displays a popup which contains legends for the schema-viewer
 *
 */

'use strict';

import {BaseComponent} from 'src/base/base-types/base-component';
import {Component} from 'src/base/decorators';

@Component({
    name: 'bkGraphLegend',
    templateUrl: 'src/modules/admin/schema-viewer/legend/blink-graph-legend.html'
})
export default class GraphLegendComponent extends BaseComponent {

    public title: string = this.strings.schemaViewer.LEGEND_TITLE;
    private legendActionText: string = this.strings.schemaViewer.CLOSE_LEGEND;
    private reduced: boolean;

    public constructor(protected legendColors: {[id: string]: string},
                       protected legendPictures: {[id: string]: string}) {
        super();
    }

    public reduceClicked() {
        this.reduced = !this.reduced;
        this.legendActionText = this.reduced ? this.strings.schemaViewer.SHOW_LEGEND :
            this.strings.schemaViewer.CLOSE_LEGEND;
    }
}
