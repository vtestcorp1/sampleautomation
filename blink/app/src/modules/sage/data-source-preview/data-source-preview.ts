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
    name: 'bkDataSourcePreview',
    templateUrl: 'src/modules/sage/data-source-preview/data-source-preview.html'
})
export class DataSourcePreviewComponent extends BaseComponent {
    private static SOURCES_COUNT_IN_TOOLTIP: number = 10;

    public hide: boolean;
    public tooltipText: String;
    public onPreviewClickCallback: Function;

    private sources: Array<any>;

    constructor(sources: Array<any>, onPreviewClickCallback: Function) {
        super();
        this.sources = sources;
        this.tooltipText = this.generateTooltipText();
        this.onPreviewClickCallback = onPreviewClickCallback;
        this.hide = false;
    }

    public getSourcesCount() : number {
        return this.sources.length;
    }

    public updateSources(sources: Array<any>) {
        this.sources = sources;
        this.tooltipText = this.generateTooltipText();
    }

    public setHide(state: boolean) {
        this.hide = state;
    }

    private generateTooltipText() {
        let sourcesToUse = this.sources.slice(
            0,
            DataSourcePreviewComponent.SOURCES_COUNT_IN_TOOLTIP
        );
        let previewString = sourcesToUse.map((source) => {
            return source.capitalize();
        }).join(', ');
        let showFooterString =
            this.sources.length > DataSourcePreviewComponent.SOURCES_COUNT_IN_TOOLTIP;
        let footerString = blinkConstants.dataSourcePreview.FOOTER_TEXT.assign(
            this.sources.length - DataSourcePreviewComponent.SOURCES_COUNT_IN_TOOLTIP
        );
        return showFooterString ? previewString + footerString : previewString;
    }
}
