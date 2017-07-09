/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileOverview Wrapper of angular's $route. This is needed because angular adds 'current'
 *               property to $route as a late binding. This causes the app to fail on browsers
 *               which do not support ES6 Proxies. Here we add a getter function to the current
 *               property.
 */
'use strict';

blink.app.factory('$routeWrapper', ['$route', function($route) {
    var routeWrapper = $route;
    routeWrapper.getCurrentRoute = function() {
        return $route.current || {};
    };

    return routeWrapper;
}]);
