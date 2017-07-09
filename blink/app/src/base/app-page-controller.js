/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Top level controller for the app
 */

'use strict';

blink.app.controller('AppPageController', ['$injector',
    '$rootScope',
    '$scope',
    'clientState',
    'env',
    'events',
    'FullEmbedConfig',
    'Logger',
    'LoginComponent',
    'PoweredFooterComponent',
    'PrintViewComponent',
    'routeService',
    'sessionService',
    function ($injector,
              $rootScope,
              $scope,
              clientState,
              env,
              events,
              FullEmbedConfig,
              Logger,
              LoginComponent,
              PoweredFooterComponent,
              PrintViewComponent,
              routeService,
              sessionService) {

        var logger = Logger.create('app-page-controller');

        $scope.poweredFooterComponent = new PoweredFooterComponent();
        $scope.printViewComponent = new PrintViewComponent();
        // Note we only init this when needed to avoid navigation.
        $scope.loginComponent = null;

        function configureScopeHandlers() {

            routeService.setupRouteParameterChangeWatch('state', function () {
                $scope.$broadcast(events.HIDE_ALERT_D);
            });

            // Set up various event mirrors. catch _U event bubbles and shoot them back down as broadcast _D events.
            // Note(joy): this mechanism is likely to be useful when the mirroring happens a few scopes down from root scope,
            // otherwise rootScope.$broadcast should be fine.
            $scope.$on(events.HIDE_SAGE_BUBBLE_U, function (event, force) {
                $scope.$broadcast(events.HIDE_SAGE_BUBBLE_D, force);
            });
        }

        /**
         * Determines what page to display based on logged in status. We currently have only 2 pages -
         * 'login' and 'app-canvas'.
         */
        $scope.getEffectivePage = function () {
            if (!blink.app.appInitialized) {
                return blink.app.pages.APP_INITIALIZATION_INTERSTITIAL;
            }
            if (routeService.getCurrentPage() === blink.app.pages.PRINT) {
                return blink.app.pages.PRINT;
            }
            if (!sessionService.isLoggedIn()) {
                $scope.loginComponent = $scope.loginComponent || new LoginComponent();
                return blink.app.pages.LOGIN;
            }
            return routeService.getCurrentPage();
        };

        /**
         * @return {boolean} true if App tour should be shown on startup after user's first login
         */
        $scope.shouldShowAppTourOnStartup = function () {
            return sessionService.shouldShowAppTourOnStartup();
        };

        /**
         * @return {boolean} true if App tour is enabled
         */
        $scope.isAppTourEnabled = function () {
            return (!env.e2eTest && env.isAppTourEnabled());
        };

        // Application boot-up logic:
        // First make callosum call /session/info. If user is logged in, some session info will be available including user data.
        // In that case, save the info go to the route requested.
        // Otherwise any callosum call will return 401 unauthorized status.
        // In that case, go to the login page, and after successful login, go to requested page.
        configureScopeHandlers();

        $scope.canShowNavBar = function () {
            var primaryNavHidden = FullEmbedConfig.isPrimaryNavHidden();
            var embedAppEnabled = clientState.isAppEmbedded();
            if (primaryNavHidden && embedAppEnabled) {
                return false;
            } else {
                return true;
            }
        };

        $scope.showPoweredByRibbon = function () {
            var embedAppInIframe = clientState.isAppInIFrame();
            var isFooterHidden = FullEmbedConfig.isPoweredFooterHidden();
            var customizationEnabled = sessionService.isStyleCustomizationEnabled()
                || env.customBrandingEnabled;
            return (!isFooterHidden && embedAppInIframe) || customizationEnabled;
        };

        $scope.isLoginPage = function () {
            return routeService.getCurrentPage() === 'login';
        };

        $scope.isEmbedPage = function () {
            return routeService.getCurrentPage() === 'embed';
        };
    }]);

blink.app.component('blinkAppPage', {
    controller: 'AppPageController',
    templateUrl: 'src/base/app-page.html'
});

// NOTE: Since callosum clientState only applies to saved metadata object and does not carry over when metadata
// changes with query, we have to device a way to store the client state.
// This however only works as long as the state is used within a session (not across reloads).
// See SCAL-4918.
blink.app.factory('appClientStateService', ['$rootScope', 'Logger', function ($rootScope, Logger) {
    var _logger = Logger.create('app-client-state-service');

    var me = {};

    me.getClientState = function (key) {
        if (!$rootScope.clientState) {
            $rootScope.clientState = {};
        }

        if (!$rootScope.clientState.hasOwnProperty(key)) {
            $rootScope.clientState[key] = {};
        }

        return $rootScope.clientState[key];
    };

    me.cleanClientState = function () {
        if (!$rootScope.clientState) {
            return;
        }

        delete $rootScope.clientState;
    };

    return me;
}]);
