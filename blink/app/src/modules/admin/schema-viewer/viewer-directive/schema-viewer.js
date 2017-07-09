/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Schema Directive
 */

'use strict';

blink.app.component('schemaViewer', {
    bindings: {
        bkCtrl: '<'
    },
    controller: blink.app.DynamicController,
    templateUrl: 'src/modules/admin/schema-viewer/viewer-directive/schema-viewer.html'
}
);
