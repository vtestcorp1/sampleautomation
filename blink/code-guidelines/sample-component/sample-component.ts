/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is a sample component which illustrates the latest
 * guidelines on how to write a component.
 *
 * NOTE: Each component should have 4 files.
 * 1. template.html
 * 2. .ts file for creating the component.
 * 3. .less file for style for that component.
 * 4. spec.js file unit tests for the component.
 */

import {Component} from '../../app/src/base/decorators';
import {BaseComponent} from '../../app/src/base/base-types/base-component';

// This registers a component with Angular to allow use in the app.
@Component({
    name: 'bkSample',
    templateUrl: 'sample.html' // eg. src/modules/charts/chart-editor/chart-editor.html
})
// Provide this class to be imported as angular dependency.
// Note: 
export class SampleComponent extends BaseComponent {
    constructor() {
        super();
    }
}
