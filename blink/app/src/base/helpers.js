/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Misc common directives.
 */

'use strict';

/*global printStackTrace:false */

/**
 * A central http request/response interceptor that provides hook in the app for
 * transforming incoming responses before the corresponding response handler
 * is invoked.
 */
blink.app.factory('responseInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
    var successTransformers = [];
    var errorTransformers = [];
    $rootScope.responseInterceptorFactory = {
        addSuccessTransformer: function (transformerFn) {
            successTransformers.push(transformerFn);
        },
        addErrorTransformer: function (transformerFn) {
            errorTransformers.push(transformerFn);
        },
        resetTransformers: function () {
            successTransformers = [];
            errorTransformers = [];
        }
    };

    return {
        response : function (successResponse) {
            for (var i = 0; i < successTransformers.length; ++i) {
                successTransformers[i](successResponse);
            }
            return successResponse;
        },
        responseError : function (errorResponse) {
            for (var i = 0; i < errorTransformers.length; ++i) {
                errorTransformers[i](errorResponse);
            }
            return $q.reject(errorResponse);
        }

    };
}]);

blink.app.factory('requestInterceptor', ['$rootScope', function ($rootScope) {
    var requestTransformers = [];
    $rootScope.requestInterceptorFactory = {
        addRequestTransformer: function (transformerFn) {
            requestTransformers.push(transformerFn);
        },
        resetTransformers: function () {
            requestTransformers = [];
        }
    };
    return {
        request: function (config) {
            for (var i = 0; i < requestTransformers.length; ++i) {
                requestTransformers[i](config);
            }
            return config;
        }
    };
}]);

/**
 * A central place to catch all errors in the app
 */
blink.app.factory('$exceptionHandler', ['$injector', 'Logger', 'stackTraceService',
    function ($injector, Logger, stackTraceService) {
        var _logger = Logger.create('blink-error');

        return function (exception, cause) {
            var message = exception.message,
                stack = stackTraceService.print({e: exception});

            _logger.logException(exception);
            if(_.isFunction(Zone.current.onError)) {
                Zone.current.onError(exception, cause);
            }

        // Broadcast events to show user facing alerts and to hide any loading indicators
            var $rootScope = $injector.get('$rootScope'),
                loadingIndicator = $injector.get('loadingIndicator');
            if ($rootScope) {
            // NOTE(vibohr): Disable the Oops message from blink exception as per request from Shashank.
            //$rootScope.$broadcast(events.SHOW_ALERT_D, { message: 'Oops! Something went wrong!', details: { data: message + ' ' + stack }, type: 'error' });
                loadingIndicator.hide();
            }
        };
    }]);

/**
 * An apply that first checks whether another apply or digest is already in progress
 */
blink.app.factory('safeApply', function () {
    return function ($scope, fn) {
        if (!$scope) {
            return;
        }

        var phase = $scope.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn) {
                $scope.$eval(fn);
            }
        } else {
            if (fn) {
                $scope.$apply(fn);
            } else {
                $scope.$apply();
            }
        }
    };
});

/**
 * A digest that first checks whether another apply or digest is already in progress
 */
blink.app.factory('safeDigest', function () {
    return function ($scope) {
        var phase = $scope.$root.$$phase;
        if (phase != '$apply' && phase != '$digest') {
            $scope.$digest();
        }
    };
});

/**
 * A service to get the stack trace of the point where this is called. Uses stacktrace.js
 */
blink.app.factory('stackTraceService', function () {
    var me = {};

    me.print = printStackTrace;

    return me;
});

/**
 * Puts the strings on the scope prototype so that each controller does not
 * have to do scope.strings = strings.
 */
blink.app.factory('rootStrings', [
    'strings',
    '$rootScope',
    function(strings, $rootScope) {

        function init() {
            var scopeProto = Object.getPrototypeOf($rootScope);
            scopeProto.strings = strings;
        }

        return {
            init: init
        };
    }
]);
