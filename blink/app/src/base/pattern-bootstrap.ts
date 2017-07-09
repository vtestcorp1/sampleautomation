/**
 * Copyright Thoughtspot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * Root file to import all the TS files needed in pattern library page. You only need to include
 * your file here if it is not already implicitly imported through the files already listed here.
 * i.e. If it is not used in any TS file.
 */

import '../style-guide/widgets-browser/widgets-browser';
import './bootstrap';
import {appReady, ngRequire, registerInits, runAfterInjectorCreated} from './decorators';
let $rootScope = ngRequire('$rootScope');

export function startPatternLibrary() {
    registerInits();
    runAfterInjectorCreated(initAppForPatternLibrary);
}

function initAppForPatternLibrary() {
    appReady();
    $rootScope.$apply();
}
