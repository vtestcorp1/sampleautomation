/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview The goal of this service is to provide route replated APIs to the app.
 */

import {ngRequire, Provide} from 'src/base/decorators';
import IRootScopeService = angular.IRootScopeService;
import _ from 'lodash';
import Subject from 'rxjs/Subject';
import ICurrentRoute = angular.route.ICurrentRoute;
import IRoute = angular.route.IRoute;

let $rootScope: IRootScopeService = ngRequire('$rootScope');
let $route: any = ngRequire('$routeWrapper');
let jsUtil: any = ngRequire('jsUtil');
let Logger: any = ngRequire('Logger');

let currentWatches: {[propertyName:string] : {[deRegisterId:string]: Function}};
let globalWatch: Function;
let logger;

interface RouteChangeEvent {
    current: ICurrentRoute;
    previous?: IRoute;
    next?: IRoute;
}

export let onRouteChange = new Subject.Subject<RouteChangeEvent>();
export let onBeforeRouteChange = new Subject.Subject<RouteChangeEvent>();

Provide('routeService')({
    onRouteChange,
    onBeforeRouteChange,
    getRouteParameters: getRouteParameters,
    getRouteParameter: getRouteParameter,
    getCurrentPage: getCurrentPage,
    setupRouteParameterChangeWatch: setupRouteParameterChangeWatch
});

export function getRouteParameters() {
    return $route.getCurrentRoute();
}

export function getRouteParameter(
    propertyName: string
) : string {
    let params = _.get($route.getCurrentRoute(), 'params', {});
    return params[propertyName];
}

export function getCurrentPage() {
    var route = $route.getCurrentRoute();
    return route.page;
}

export function setupRouteParameterChangeWatch(
    propertyName: string,
    onRouteChange: Function,
    canvasState?: string
) : Function {
    if (!currentWatches) {
        logger = Logger.create('route-service');
        logger.error('Route watch requested before initialization.');
        return;
    }
    let id = jsUtil.generateUUID();
    currentWatches[propertyName] = currentWatches[propertyName] || {};
    let watchesOnProperty = currentWatches[propertyName];
    watchesOnProperty[id] = function(currentCanvasState, value) {
        let triggerRouteChangeCallback = !!canvasState ? currentCanvasState === canvasState : true;
        if (triggerRouteChangeCallback) {
            onRouteChange(value);
        }
    };
    let deregisterer = function() {
        delete watchesOnProperty[id];
    };
    return deregisterer;
}

export function init() {
    currentWatches = {};
    globalWatch = _.noop;
    // NOTE:
    // In the route service to synchronize across multiple watches the chosen
    // behavior is
    // 1. Call on the global watches on route in the app first. We would want to
    // limit this only to app canvas.
    // 2. Call route watches specific to params.
    $rootScope.$on('$routeChangeSuccess', function($evt, current, previous) {
        onRouteChange.next({
            current,
            previous
        });
        let watchedParameters = Object.keys(currentWatches);
        watchedParameters.forEach((parameter) => {
            let parameterValue = getRouteParameter(parameter);
            let callbacks = _.values(currentWatches[parameter]);
            callbacks.forEach((callback:Function) => {
                callback(current.canvasState, parameterValue);
            });
        });
    });

    $rootScope.$on('$routeChangeStart', function($evt, next, current) {
        onBeforeRouteChange.next({
            next,
            current
        });
    });
}
