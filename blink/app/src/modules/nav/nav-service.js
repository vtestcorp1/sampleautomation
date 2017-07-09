/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Service that manages navigation throughout the app
 */

'use strict';

blink.app.factory('navService', ['$location',
    '$rootScope',
    '$window',
    'session',
    'blinkConstants',
    function ($location,
              $rootScope,
              $window,
              session,
              blinkConstants) {

        var me = {},
            ABSOLUTE_URL_PATTERN = '{protocol}//{host}/#{relativePath}',
            ON_NAV_TO_EVENT = 'nav-to-',
        // All the possible urls in the app. For each url, a page type and state is set by the router mechanism
            ROUTES = {
                Home: '/',
                Admin: '/admin',
                ClusterStatus: '/cluster-status',
                UserPreference: '/user-preference',
                Login: '/login',
                Answers: '/answers',
                Pinboards: '/pinboards',
                Answer: '/answer',
                SavedAnswer: '/saved-answer',
                ReplayAnswer: '/replay-answer',
                Pinboard: '/pinboard',
                Worksheet: '/worksheet',
                AggregatedWS: '/aggregated-worksheet',
                ImportData: '/importdata',
                ImportedData: '/data/importeddata',
                ImportDataSource: '/importdatasource',
                Insights: '/insights',
                Insight: '/insight',
                Views: '/data/views',
                DataExplorer: '/data/explore',
                DataLinking: '/data/link',
                RLS: '/data/rls',
                DataSources: '/data/impds',
                Tables: '/data/tables',
                CreateSchema: '/create-schema',
                ScheduleReport: '/schedule',
                PinboardScheduledReports: '/schedules',
                SchemaViewer: '/schema-viewer/table',
                Embed: '/embed/viz',
                RelatedLink: '/related-link',
            };

        /**
         * Returns a path to a specific route
         *
         * @param {string} routeKey    The key for the route to go to (e.g. "SavedAnswer")
         * @param {=string} id         An optional id to append to the route
         * @return {string}            Path to the route
         */
        function getPathForRoute(routeKey, id) {
            var path = ROUTES[routeKey];
            if (!path) {
                return '';
            }
            if (id !== null && id !== void 0) {
                path += '/' + id;
            }

            if (path === '/answer') {
                path = '/answer/';
            }
            return path;
        }

        /**
         * Set the location to a certain route, with an optional id
         *
         * @param {string} routeKey    The key for the route to go to (e.g. "SavedAnswer")
         * @param {=string} id          An optional id to append to the route
         */
        function goToRouteKey(routeKey, id, search) {
            var path = getPathForRoute(routeKey, id);
            search = search || '';
            $location.path(path).search(search);

            // Fire an event for the "onNavTo" methods we generate for each route
            $rootScope.$broadcast(ON_NAV_TO_EVENT + routeKey);
        }

        me.setSearch = function (params) {
            $location.search(params);
        };

        me.getSearch = function () {
            return $location.search();
        };

        /**
         * Go to a specific path
         * Avoid using this function. Instead, use the route specific functions (goToHome(), goToAnswer(), etc.).
         *
         * @param {string} path    The path to go to
         */
        me.goToPath = function (path) {
            $location.path(path);
        };

        /**
         * Get the current path
         *
         * @return {string}     The current path
         */
        me.getPath = function () {
            return $location.path();
        };

        me.getHost = function () {
            return $location.host();
        };

        me.isHttps = function () {
            return $location.protocol() === 'https';
        };

        /**
         * Check if the current app is embedded
         *
         * @return {bool} True if app is embedded.
         */
        me.isEmbedded = function () {
            return $location.path().indexOf('/embed/') > -1;
        };

        /**
         * Returns whether we are currently on a specific answer
         *
         * @param {string} id   An answer id
         * @return {boolean}    Whether the current path corresponds to the passed in answer
         */
        me.isCurrentAnswerPath = function (id) {
            if (!angular.isDefined(id)) {
                return ($location.path().indexOf(ROUTES.Answer + '/') >= 0);
            }
            return ($location.path() === ROUTES.Answer + '/' + id);
        };

        me.isCurrentHomePath = function () {
            return ($location.path() === ROUTES.Home);
        };

        me.isCurrentWorksheetPath = function () {
            return $location.path().startsWith(ROUTES.Worksheet);
        };

        me.isCurrentSavedAnswerPath = function (id) {
            return ($location.path() === ROUTES.SavedAnswer + '/' + id);
        };

        me.isCurrentPinboardPath = function () {
            return ($location.path().indexOf(ROUTES.Pinboard) > -1);
        };

        me.getPinboardPath = function (id) {
            return '/#' + ROUTES.Pinboard + '/' + id;
        };

        me.getInsightsPath = function (tabId) {
            var insightPath = '/#' + ROUTES.Insights;
            if (!!tabId && tabId !== '') {
                insightPath = insightPath + '/' + tabId;
            }
            return insightPath;
        };

        me.isCurrentReplayAnswerPath = function () {
            return ($location.path().indexOf(ROUTES.ReplayAnswer) > -1);
        };

        me.getCurrentReplayAnswerId = function () {
            if (!me.isCurrentReplayAnswerPath()) {
                return null;
            }

            var path = $location.path();
            var idStart = path.lastIndexOf('/');
            return path.slice(idStart + 1);
        };

        /**
         * Returns whether we are at home.
         *
         * @return {boolean}
         */
        me.isAtHome = function () {
            return ($location.path() === ROUTES.Home);
        };

        me.getAbsoluteUrl = function (relativePath) {
            return ABSOLUTE_URL_PATTERN.assign({
                protocol: window.location.protocol,
                host: window.location.host,
                relativePath: relativePath
            });
        };

        /**
         * Generate a "goTo" function that will go to a certain route when executed
         *
         * @param {string} routeKey     The routeKey to go to
         * @return {Object}             The routing function
         */
        function generateGoToFunction(routeKey) {
            return function (id, search) {
                goToRouteKey(routeKey, id, search);
            };
        }

        /**
         * Generate a "getPathTo" function that will return path to a certain route
         *
         * @param {string} routeKey     The routeKey to go to
         * @return {Object}             The path function
         */
        function generateGetPathToFunction(routeKey) {
            return function (id) {
                return "#" + getPathForRoute(routeKey, id);
            };
        }

        /**
         * Generate an "onNavTo" function that will listen to a certain route change
         *
         * @param {string} routeKey     The routeKey to go to
         * @return {Object}             The route listening function
         */
        function generateOnNavToFunction(routeKey) {
            return function (callback) {
                $rootScope.$on(ON_NAV_TO_EVENT + routeKey, callback);
                $rootScope.$on('$routeChangeSuccess', function ($ev, newRoute) {
                    if ($location.path() !== ROUTES[routeKey]) {
                        return;
                    }
                    callback();
                });
            };
        }

        // Pinboard Snapshot one-off
        // TODO(raj): sanitize pinboardId, snapshotId?
        me.goToPinboardSnapshot = function (pinboardId, snapshotId) {
            var path = "pinboard/" + pinboardId + "/snapshot/" + snapshotId;
            $location.path(path);
        };

        me.goToSamlLogin = function () {
            var last401Path = session.getLast401Path();
            if (last401Path) {
                $window.location.href = '/callosum/v1/saml/login?targetURLPath=' + last401Path;
            } else {
                $window.location.href = '/callosum/v1/saml/login';
            }
        };

        /**
         * Generate public functions for all the routes.
         * Two methods are generated for each route:
         *  • A "goTo" function to navigate to the route. E.g.:
         *      navService.goToHome();
         *      navService.goToSavedAnswer(savedAnswerId);
         *  • An "onNavTo" function that allows listening to a certain route change. E.g.:
         *      navService.onNavToHome(function () { // Do Something });
         *      navService.onNavToSavedAnswer(function () { // Do Something });
         */
        for (var routeKey in ROUTES) {
            if (ROUTES.hasOwnProperty(routeKey)) {
                me['goTo' + routeKey] = generateGoToFunction(routeKey);
                me['getPathTo' + routeKey] = generateGetPathToFunction(routeKey);
                me['onNavTo' + routeKey] = generateOnNavToFunction(routeKey);
            }
        }

        /**
         * Navigate to a pinboard, answer or related link page with the provided runtime filters.
         * @param type pinboard, answer or relatedLink
         * @param id destinationId
         * @param filter runtime filters
         */
        me.navigateTo = function(type, id, filter) {
            var navMethod;
            switch(type) {
                case blinkConstants.ANSWER_TYPE:
                    navMethod =  me.goToSavedAnswer;
                    break;
                case blinkConstants.PINBOARD_TYPE:
                    navMethod =  me.goToPinboard;
                    break;
                case blinkConstants.RELATED_LINK_TYPE:
                    navMethod =  me.goToRelatedLink;
                    break;
            }
            if (_.isFunction(navMethod)) {
                navMethod(id, filter);
            }
        };

        return me;

    }]);
