/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com),
 *
 * @fileoverview A popup component to display sage recommended columns via auto complete request.
 * Customers will select and narrow down the choices for a3 analysis of the columns.
 */

'use strict';

import {BaseComponent} from '../../base/base-types/base-component';
import {ComponentPopupService} from '../../base/component-popup-service/component-popup-service';
import {Component} from '../../base/decorators';
import {A3DialogComponent} from './a3-dialog';

/**
 * A3 select columns popup component shows the related columns suggested by sage.
 */
@Component({
    name: 'bkA3DialogPopup',
    templateUrl: 'src/modules/a3/a3-dialog-popup.html'
})
export class A3DialogPopupComponent extends BaseComponent {

    public a3DialogComponent: A3DialogComponent;

    public constructor(a3Request, sageClient, allColumns: any[] = null) {
        super();
        this.init(a3Request, sageClient, allColumns);
    }

    public show(): void {
        ComponentPopupService.show('bk-a3-dialog-popup', this);
    }

    public hide(): void {
        ComponentPopupService.hide();
    }

    private init(a3Request, sageClient, allColumns: any[]): void {
        this.a3DialogComponent = new A3DialogComponent(
            a3Request,
            sageClient,
            this.hide,
            allColumns
        );
    }
}
