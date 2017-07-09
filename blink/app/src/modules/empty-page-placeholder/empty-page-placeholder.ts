/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is component to put a empty page placeholder
 */

import {BaseComponent} from '../../base/base-types/base-component';
import {Component, ngRequire} from '../../base/decorators';
import {isAppEmbedded} from '../client-state-service';

let sessionService = ngRequire('sessionService');
let env = ngRequire('env');

@Component({
    name: 'bkEmptyPagePlaceholder',
    templateUrl: 'src/modules/empty-page-placeholder/empty-page-placeholder.html'
})

export class EmptyPagePlaceholderComponent extends BaseComponent {
    constructor (public placeholderText: string) {
        super();
    }

    public isCustomizationEnabled(): boolean {
        return sessionService.isStyleCustomizationEnabled()
            || env.customBrandingEnabled
            || isAppEmbedded();
    }
}
