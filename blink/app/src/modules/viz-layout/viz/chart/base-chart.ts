/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

import {ngRequire, Provide} from 'src/base/decorators';
import {UIComponent} from '../../../../base/base-types/ui-component';

let Logger = ngRequire('Logger');

declare var saveAs: any;

@Provide('BaseChart')
export abstract class BaseChart extends UIComponent {
    protected logger = Logger.create('base-chart');

    public isDataLabelsEnabled() {
        return false;
    }

    public supportsFullScreenMode() : boolean {
        return true;
    }

    public getPlotSizeX() : number {
        return 0;
    }

    public getPlotSizeY() : number {
        return 0;
    }

    public toBlob(options: any, callback: Function) {
        this.logger.warn('Not Implemented');
    }

    public downloadChart(options: any, filename: string) {
        //default image download implementation
        filename = filename + '.png';
        this.toBlob(options, function(blob) {
            saveAs(blob, filename);
        });
    }

    public supportsDownload() : boolean {
        return false;
    }

    public canOverlayHeatmap() : boolean {
        return false;
    }

    public setIsHeatmapOverlayed(isEnabled: boolean) : void {
        this.logger.warn('Not Implemented');
    }

    public setDataLabelVisibility(visible: boolean) {
        this.logger.warn('Not Implemented');
    }

    public secondaryRender(): void {
        // Render is broken between primary render and secondary render.
    }
}
