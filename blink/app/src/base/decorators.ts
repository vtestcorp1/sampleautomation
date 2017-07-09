/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* A library of typescript decorators used throughout the app.
*/

import {createProxy} from './Proxy';
import IInjectorService = angular.auto.IInjectorService;
import _ from 'lodash';

declare var blink:any;
declare var Proxy:any;
let AllDecoratedComponents = [];

export {
    appReady,
    Component,
    ComponentDescriptor,
    ngRequire,
    Provide,
    registerInits,
    runAfterInjectorCreated,
    runAfterAppReady,
    AllDecoratedComponents,
};

let pendingRuns = [], pendingProvides = [], pendingInits = [];

function registerInits() {
    blink.app.config(['$compileProvider',
        '$provide',
        function($compileProvider,
                 $provider) {
            blink.app.compileProvider = $compileProvider;
            blink.app.Provider = $provider;
            pendingProvides.forEach(cb => cb());
        }
    ]);

    blink.app.run(['$injector',
        '$rootScope',
        function($injector, $rootScope) {
            blink.app.injector = $injector;
            pendingRuns.forEach(cb => cb());
            pendingRuns = [];
        }
    ]);
}

function runAfterInjectorCreated(callback) {
    if(!!blink.app.injector) {
        callback();
    } else {
        pendingRuns.push(callback);
    }
}

function runAfterAppReady(callback) {
    if(!!blink.app && !!blink.app.appReady) {
        callback();
    } else {
        pendingInits.push(callback);
    }
}

function appReady() {
    blink.app.appReady = true;
    pendingInits.forEach(cb => cb());
    pendingInits = [];
}

function provide(providingFn) {
    if(!!blink.app
        && !!blink.app.provider
        && !!blink.app.compileProvider) {
        providingFn();
    } else {
        pendingProvides.push(providingFn);
    }
}

function getInjector(): IInjectorService {
    return blink.app.injector;
}

function ngRequire(dependencyName: string): any {
    return createProxy(dependencyName, getInjector);
}

function Provide(name: string) {
    return function (definition: any): any {
        provide(_.partial(makeFactory, name, definition));
    };
}

function makeFactory(name: string, definition: any) {
    blink.app.Provider.factory(name, function () {
        return definition;
    });
}

interface ComponentDescriptor {
    name: string;
    templateUrl?: string;
    require?: string;
    transclude?: boolean;
    directives?: Array<any>;
}

function decorateComponent($scope, componentInstance) {
    if (!componentInstance) {
        return;
    }

    // Set properties exposed to application.
    componentInstance.isLinked = true;
    if (_.isFunction(componentInstance.setScope)) {
        componentInstance.setScope($scope);
    }
}

function DynamicController($scope, $element) {
    let componentInstance;

    function handleComponentChange(newComponent) {
        if (!!componentInstance && componentInstance !== newComponent) {
            componentInstance.onDestroy();
        }
        componentInstance = newComponent;
        $scope.$ctrl = componentInstance;
        decorateComponent($scope, componentInstance);
    }

    this.$onChanges = function (changes) {
        if (changes.bkCtrl) {
            handleComponentChange(changes.bkCtrl.currentValue);
        }
    };

    this.$onDestroy = function () {
        if (!!componentInstance) {
            componentInstance.onDestroy($element);
        }
    };

    this.$postLink = function () {
        if (!!componentInstance) {
            if (_.isFunction(componentInstance.postLink)) {
                componentInstance.postLink($element);
            }
        }
    };

    handleComponentChange(this.bkCtrl);
}

DynamicController.$inject = ['$scope', '$element'];

function makeComponent(descriptor: ComponentDescriptor) {
    blink.app.compileProvider
        .component(descriptor.name, {
            bindings: {
                'bkCtrl': '<'
            },
            templateUrl: descriptor.templateUrl,
            transclude: descriptor.transclude,
            require: descriptor.require || void 0,
            controller: DynamicController
        });
}

function Component(descriptor: ComponentDescriptor) {

    if (!descriptor.name.match(/^bk[A-Z]/)) {
        throw new Error('components name must start with "bk" followed by an upper case ' +
            'alphabet. e.g. \'bkMyExample\'. This will create a directive with the name ' +
            '\'bk-my-example\'. Component\'s class name in this case must be MyExampleComponent.');
    }

    var componentConstructorName: string = descriptor.name.replace(/^bk/, '') + 'Component';

    return function (constructor: Function): void {
        provide(_.partial(makeFactory, componentConstructorName, constructor));
        provide(_.partial(makeComponent, descriptor, constructor));
        AllDecoratedComponents.push(constructor);
    };
}
