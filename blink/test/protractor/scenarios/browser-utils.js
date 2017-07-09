/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview: Contains methods for interacting with the
 * inside of the blink app via the browser
 *
 */

'use strict';

/* eslint camelcase: 1 */

var transformer = {
    addRequestTransformer: function(transformFn){
        return browser.executeScript(function (transformFunction) {
            // Arguments passed to script function executed in browser are serialized
            // as string. We use eval to have an usable function
            var transform = eval('(' + transformFunction + ')');
            var $rootScope = $('body').scope().$root;
            $rootScope.requestInterceptorFactory.addRequestTransformer(transform);
        }, transformFn);

    },
    addSuccessResponseTransformer: function(transformFn){
        return browser.executeScript(function (transformFunction) {
            var transform = eval('(' + transformFunction + ')');
            var $rootScope = $('body').scope().$root;
            $rootScope.responseInterceptorFactory.addSuccessTransformer(transform);
        }, transformFn);
    },
    resetRequestTransformers: function(){
        return browser.executeScript(function () {
            var $rootScope = $('body').scope().$root;
            $rootScope.requestInterceptorFactory.resetTransformers();
        });
    },
    resetResponseTransformers: function() {
        return browser.executeScript(function () {
            var $rootScope = $('body').scope().$root;
            $rootScope.responseInterceptorFactory.resetTransformers();
        });
    }
};

module.exports = {
    transformer: transformer
};
