/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Component that allows us to search for available UI components to use.
 */

import _ from 'lodash';
import {UIComponent} from '../../base/base-types/ui-component';
import {AllDecoratedComponents, Component, ngRequire} from '../../base/decorators';

let $templateCache = ngRequire('$templateCache');

declare let angular: any;

@Component({
    name: 'bkWidgetsBrowser',
    templateUrl: 'src/style-guide/widgets-browser/widgets-browser.html'
})
export default class WidgetsBrowserComponent extends UIComponent {
    public query: string = '';
    private compDetails: Array<any>;

    public getCompDetails() {
        let index = 0;
        if (!!this.compDetails) {
            return this.compDetails;
        }
        let compDetails = [];
        AllDecoratedComponents.forEach((component) =>  {
            if (!component.__getExamples) {
                return;
            }
            let compName = component.name.replace(/Component$/, '');
            let directiveName = 'bk-' + compName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            let displayName = `<${directiveName}>`;
            let compDetail: any = {
                displayName: displayName,
                directiveName: directiveName
            };
            let compExamples = [];
            component.__getExamples().forEach((example) => {
                let template = `<${directiveName} bk-ctrl="${'$ctrl.compCtrl' + index}">`;
                let templateKey = `${'widget-browser-comp-' + index}`;
                $templateCache.put(templateKey, template);
                compExamples.push({
                    templateKey: templateKey
                });
                this[`${'compCtrl' + index}`] = example.ctrl;
                index++;
            });
            compDetail.examples = compExamples;
            compDetails.push(compDetail);
        });
        return this.compDetails = compDetails;
    }

    public filter(searchText: string): any {
        return (compDetail) => {
            if (!searchText || searchText.length === 0) {
                return true;
            }
            if (compDetail.directiveName.toLowerCase()
                    .replace(/\-/g, '')
                    .indexOf(searchText.replace(/\s/g, '').toLowerCase()) === -1) {
                return false;
            }
            return true;
        };
    }
}
