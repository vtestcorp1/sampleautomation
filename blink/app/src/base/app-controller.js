/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: francois chabbey (francois.chabbey@thoughtspot.com)
 *
 */

'use strict';

// we need to have this service initialized or callosum-api.js will raise an error
function AppController($route) {}


AppController.prototype.isAppInitialised = function() {
    return blink.app.appInitialized;
};

blink.app.component('appController', {
    controller: AppController,
    templateUrl: 'src/base/app.html'
});

AppController.$inject = ['$route'];
