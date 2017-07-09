/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  Component for viewing a principal
 */

import {BaseComponent} from 'src/base/base-types/base-component';
import {Component} from 'src/base/decorators';
import {PrincipalType} from './share-principal';

@Component({
    name: 'bkPrincipalViewer',
    templateUrl: 'src/modules/share/share-principal/principal-viewer.html'
})
export class PrincipalViewerComponent extends BaseComponent {

    public constructor(
        public id:string,
        public name:string,
        public displayName:string,
        public principalType:PrincipalType = PrincipalType.USER) {
        super();
    }
}
