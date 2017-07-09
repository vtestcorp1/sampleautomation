/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Common utility methods called by various jasmine specs.
 */

'use strict';

/**
 * Called from within a beforeEach or it block in a jasmine spec.
 * It is important to note the scope where this is called from.
 */
function addCustomMatchers() {
    return function () {

        function isArraySorted(arrayToCheck, comparator, ascendingOrder) {
            var isNotSorted = arrayToCheck.some(function(element, index, array) {
                if (index === 0)  {
                    return false;
                }

                var firstElement = array[index - 1], secondElement = element;
                var comparison = comparator(firstElement, secondElement);
                if ((ascendingOrder && comparison > 0) || (!ascendingOrder && comparison < 0)) {
                    return true;
                }

                return false;
            });

            return !isNotSorted;
        }

        function listToString(fromRecognizedTokenList) {
            var list = '[';
            fromRecognizedTokenList.map(function (t) {
                list = list + ' ' + t + ',';
            });

            list = list + ']';
            return list;
        }
        jasmine.addMatchers({
            toBeListOf: function(util, customEqualityTesters) {
                return {
                    compare: function (actualList, expectedList, areEqual) {
                        areEqual = areEqual || function (a, b) {
                            return a === b;
                        };
                        var toTextList = listToString;

                        var result = {};

                        result.message =  "Expected " +
                            toTextList(actualList) +
                            " to be same set as " + toTextList(expectedList);


                        if (actualList.length != expectedList.length) {
                            result.pass = false;
                            return result;
                        }

                        for (var i = 0; i < actualList.length; ++i) {
                            if (!areEqual(actualList[i], expectedList[i])) {
                                result.pass = false;
                                return result;
                            }
                        }
                        result.pass = true;
                        return result;
                    }
                };
            },
            toBeSetOf: function() {
                return {
                    compare: function (actualList, expectedList) {
                        var result = {};
                        result.message = "Expected " +
                            listToString(actualList) +
                            " to be set of " +
                            listToString(expectedList);


                        expectedList = expectedList.unique();
                        actualList = actualList.unique();
                        result.pass = expectedList.length === actualList.length && expectedList.intersect(actualList).length === expectedList.length;
                        return result;
                    }
                };
            },

            // jasmin matcher for testing if a set is sorted using a custom comparator
            toBeSortedUsingComparator: function() {
                return {
                    compare: function (actualArray, comparator, ascendingOrder) {
                        var orderingString, result = {};
                        if (ascendingOrder) {
                            orderingString = ' in ascending order';
                        } else {
                            orderingString = ' in descending order';
                        }

                        result.message = "Expected '" +
                            actualArray +
                            "' to be sorted" + orderingString;
                        result.pass = isArraySorted(actualArray, comparator, ascendingOrder);
                        return result;
                    }
                };
            },

            // jasmine matcher for expecting an element to have a css class
            toHaveClass: function () {
                return {
                    compare: function(actual, cls) {
                        var result = {};
                        result.message = "Expected '" +
                            angular.mock.dump(actual) +
                            "' to have class '" +
                            cls +
                            "'.";

                        result.pass = actual.hasClass(cls);
                        return result;
                    }
                };
            }
        });
    };
}

function mockLoadingIndicator() {
    return {
        show: angular.noop,
        reAnchorAndShow: angular.noop,
        hide: angular.noop
    };
}

function mockSessionTimezone() {
    var mockSession = jasmine.createSpyObj('session', ['getInfo']);
    mockSession.getInfo.and.returnValue({
        timezone: 'America/Los_Angeles'
    });
    module(function ($provide) {
        $provide.value('session', mockSession);
    });
    return mockSession;
}

function mockLoggerInstance() {
    var logger = {
        error: jasmine.createSpy(),
        warn: jasmine.createSpy(),
        info: jasmine.createSpy(),
        logException: jasmine.createSpy()
    };
    var Logger = jasmine.createSpyObj('logger', ['create']);
    Logger.create.and.returnValue(logger);
    module(function ($provide) {
        $provide.value('Logger', Logger);
    });

    return logger;
}

function spyOnSessionTimezone(session) {
    spyOn(session, 'getInfo').and.returnValue({
        timezone: 'America/Los_Angeles'
    });
    return session;
}

function mockSessionQuarterStartMonth() {
    var mockSessionService = jasmine.createSpyObj('sessionService', ['getDefaultCalendar']);
    mockSessionService.getDefaultCalendar.and.returnValue({
        quarterStartMonth: 1
    });
    module(function ($provide) {
        $provide.value('sessionService', mockSessionService);
    });
    return mockSessionService;
}

function loadICU4JS(callback) {
    icu4js.load(
        callback,
        {
            defaultLocale: 'en_US',
            dataRoot: '/resources/icu4js',
            unpackedDataFilesDirName: 'data'
        }
    );
}

function loadAsyncResources(callback) {
    loadICU4JS(function(error){
        if (!!error) {
            console.error('Failed to load icu4js', error && error.message);
        } else {
            console.log('Successfully loaded icu4js');
        }
        callback();
    });
}

function spyOnSessionQuarterStartMonth(sessionService) {
    spyOn(sessionService, 'getDefaultCalendar').and.returnValue({
        quarterStartMonth: 1 // Jan
    });
    return sessionService;
}

/**
 * Triggers a keydown event on given element
 *
 * @param $element
 * @param {number} code - key code
 */
function triggerKeydown($element, code) {
    var e = jQuery.Event("keydown");
    e.which = code; // # Some key code value
    e.keyCode = code;
    $element.trigger(e);
}

var asyncResourceLoadDone = false;
beforeAll(function(done){
    if (asyncResourceLoadDone) {
        done();
        return;
    }

    System.import('src/base/bootstrap')
        .then(function(bootstrap) {
            bootstrap.start();
            loadAsyncResources(function(){
                asyncResourceLoadDone = true;
                // Hack (sunny): this is a workaround for
                // bootstrap.start not supporting a callback
                // TODO (ashish): Take a callback in bootstrap.start
                setTimeout(function () {
                    blink.app.run(['CustomStylingService', function(CustomStylingService) {
                        CustomStylingService.initialize(true);
                    }]);
                    done();
                }, 0);
            });

        }, function(error){
            console.error(
                'System.import failed',
                error,
                error.originalErr.message,
                error.originalErr.stack
            );
        });
});

beforeEach(function () {
    angular.module('blink.accessories');
    angular.module('blink.accessories').factory('logReporter', function () {
        return {
            reportLog: angular.noop
        };
    });

    angular.module('blink.app');
    angular.module('blink.app').factory('messageService', function () {
        return {
            init: angular.noop,
            getSuccessMessage: angular.noop,
            getFailureMessage: angular.noop,
            blinkGeneratedErrors: {}
        };
    });
    angular.module('blink.app').factory('alertService', function () {
        return {
            showAlert: angular.noop,
            hideAlert: angular.noop,
            showFailureAlert: angular.noop,
            showUserActionSuccessAlert: angular.noop,
            showUserActionFailureAlert: angular.noop
        };
    });
    angular.module('blink.app').factory('localizationService', function () {
        return {
            initialize: function() {
                return {
                    then: function(cb) {
                        cb();
                    }
                };
            },
            isLocalizationEnabled: function () {
                return true;
            }
        };
    });
});

// make the default timeout longer to avoid failures
// due to delays in loading localization resources
// and System.import
jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000;
var mockedModules = new Map();
/**
 * To mock a systemJS dependency module.
 *
 * @param basePath
 * @param moduleName
 * @param mockedModule
 */
function mock(basePath, moduleName, mockedModule) {
    moduleName = path.join(basePath, moduleName);
    var normalizedName = System.resolveSync(moduleName);
    let module = System.registry.get(normalizedName);
    let newModule = System.newModule(Object.assign({}, module, mockedModule));
    System.registry.set(normalizedName, newModule);
    mockedModules.set(normalizedName, module);
}

afterEach(function() {
    mockedModules.forEach((module, name) => {
        System.registry.set(name, module);
    });
    mockedModules = new Map();
});

/**
 * Get the absolute url for the script, relative to which
 * dependent modules could be resolved.
 * @param scriptUrl
 * @returns {string}
 */
function getBasePath(scriptUrl) {
    var url = new URL(scriptUrl);
    var path = url.pathname;
    // Replacing karma specific additions to path.
    path = path.replace('/karma/base/app/','');
    return path.substring(0, path.lastIndexOf('/')) + '/';
}

function freshImport(basePath, moduleName) {
    moduleName = path.join(basePath, moduleName);
    var normalizedName = System.normalizeSync(moduleName);
    var deleted = System.delete(normalizedName);
    return System.import(normalizedName);
}

/**
 * Mocks angular modules that are imported through ngRequire in TS files.
 * @param modulesToMock
 * @returns {*}
 */
function ngRequireMock(modulesToMock) {
    var normalizedName = System.normalizeSync('src/base/decorators');
    return System.import(normalizedName).then(function(decorators) {
        var ngRequire = decorators.ngRequire;
        System.delete(normalizedName);
        System.set(normalizedName, System.newModule(Object.assign({}, decorators, {
            ngRequire: function(name) {
                if (name in modulesToMock) {
                    return modulesToMock[name];
                }
                return ngRequire(name);
            }
        })));
    });
}

System.config({
    baseURL: '../../node_modules',
    packages: {
        '../.tmp/ts-out': {
            format: 'system',
            defaultExtension: 'js'
        }
    },
    packageConfigPaths: ['../../node_modules/*/package.json'],
    map: {
        'src' : '../.tmp/ts-out/src',
        'app' : '../.tmp/ts-out',
        'translations': '../.tmp/ts-out/resources/strings/strings'
    }
});
