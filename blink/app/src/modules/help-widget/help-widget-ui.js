/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview View for help widget
 */

'use strict';

blink.app.directive('helpWidget', ['safeApply',
    '$q',
    'alertService',
    'Logger',
    'supportService',
    '$sce',
    'blinkConstants',
    'strings',
    'UserAction',
    '$rootScope',
    'util',
    function (safeApply,
          $q,
          alertService,
          Logger,
          supportService,
          $sce,
          blinkConstants,
          strings,
          UserAction,
          $rootScope,
          util) {
        var _logger = Logger.create('help-widget');

        function linker (scope, $el, attrs) {
            scope.closeHelp = function () {
                if (scope.onCloseCallback) {
                    scope.onCloseCallback();
                }
            };

            scope.minMaxHelp = function () {
                scope.isMinimized = !scope.isMinimized;
                if (!!scope.isMinimized) {
                    $el.draggable( "disable" );
                }
                else {
                    $el.draggable( "enable" );
                }
            };

            $el.draggable({
                stop: function (event, ui) {
                    if (ui.position.top < 0) {
                        $el.css({top: "0px"});
                    }
                }
            });

            $el.resizable({
                handles: "n, s, e, w, se",
                minHeight: 400,
                maxHeight: 700,
                minWidth: 400,
                maxWidth: 600
            });

            var NetworkStatus = {
                LOADING: 'loading',
                NOT_FOUND: 'not-found',
                MINDTOUCH_LINKS_READY: 'mindtouch-links-ready'
            };

            scope.helpWidgetStatus = NetworkStatus.LOADING;

            var StatusTypes = {
                FETCHING: 'fetching',
                COMPLETE: 'complete',
                NOT_FOUND: 'not-found',
                ERROR: 'error'
            };

            scope.getReleaseNameDisplayString = function () {
                switch (scope.releaseNameComputationStatus) {
                    case StatusTypes.FETCHING:
                        return strings.help.releaseNameComputationStatus.DETERMINING_VERSION;
                    case StatusTypes.COMPLETE:
                        return scope.releaseVersionName;
                    case StatusTypes.NOT_FOUND:
                        return strings.help.releaseNameComputationStatus.NOT_RELEASE_CLUSTER;
                    case StatusTypes.ERROR:
                        return strings.help.releaseNameComputationStatus.ERROR;
                }
            };

            scope.releaseVersionName = '';
            scope.releaseNameComputationStatus = StatusTypes.FETCHING;
            scope.mindTouchLinks = blinkConstants.help.mindTouchUrl;
            scope.mindTouchLinksStrings = strings.help.mindTouchUrl;

            function setMindTouchUrls(token) {
                scope.mindTouchUrlHome = $sce.trustAsResourceUrl(
                scope.mindTouchLinks.home.URL.assign({
                    authToken: token,
                    versionNameForLink: scope.versionNameForLink
                }));
                scope.mindTouchUrlKeywords = $sce.trustAsResourceUrl(
                scope.mindTouchLinks.keywords.URL.assign({
                    authToken: token,
                    versionNameForLink: scope.versionNameForLink
                }));
                scope.mindTouchUrlReleaseNotes = $sce.trustAsResourceUrl(
                scope.mindTouchLinks.releaseNotes.URL.assign({
                    authToken: token,
                    versionNameForLink: scope.versionNameForLink
                }));
                scope.mindTouchUrlAdminGuide = $sce.trustAsResourceUrl(
                scope.mindTouchLinks.adminGuide.URL.assign({
                    authToken: token,
                    versionNameForLink: scope.versionNameForLink
                }));
                scope.mindTouchUrlDownloads = $sce.trustAsResourceUrl(
                scope.mindTouchLinks.downloads.URL.assign({
                    authToken: token,
                    versionNameForLink: scope.versionNameForLink
                }));
            }

            function showHelpWidgetContent () {
                if (blink.app.connectedToInternet) {
                    scope.helpWidgetStatus = NetworkStatus.MINDTOUCH_LINKS_READY;
                }
                else {
                    scope.helpWidgetStatus = NetworkStatus.NOT_FOUND;
                }
            }

            var userAction1 = new UserAction(UserAction.HELP_PORTAL_TOKEN);

            var authTokenPromise = supportService.getHelpPortalAuthToken()
            .then(function (response) {
                return response.data;
            }, function (response) {
                // TODO (Priyanshi) - Fallback for when error getting authentication token
                alertService.showUserActionFailureAlert(userAction1, response);
                return $q.reject(response.data);
            });

            var userAction2 = new UserAction(UserAction.HELP_PORTAL_RELEASE_NAME);

            var releaseNamePromise = supportService.getReleaseVersion()
            .then(function (versionName) {
                scope.releaseNameComputationStatus = StatusTypes.COMPLETE;
                return versionName;
            }, function (status) {
                if (status === 404) {
                    scope.releaseNameComputationStatus = StatusTypes.NOT_FOUND;
                    scope.helpWidgetStatus = NetworkStatus.NOT_FOUND;
                } else {
                    scope.releaseNameComputationStatus = StatusTypes.ERROR;
                }
                alertService.showUserActionFailureAlert(userAction2, status);
                return $q.reject(status);
            });

            util.getAggregatedPromise([authTokenPromise, releaseNamePromise])
            .then(function (data) {
                var authToken = data[0],
                    versionName = data[1];
                if (!!versionName) {
                    scope.versionNameForLink = versionName.slice(0, 3);
                    setMindTouchUrls(authToken);
                    showHelpWidgetContent();
                } else {
                    scope.releaseNameComputationStatus = StatusTypes.NOT_FOUND;
                    scope.helpWidgetStatus = NetworkStatus.NOT_FOUND;
                }
                scope.releaseVersionName = versionName;
            });

            scope.isMindtouchReady = function() {
                return scope.helpWidgetStatus === NetworkStatus.MINDTOUCH_LINKS_READY;
            };

            scope.showLoadingIndicator = function() {
                return scope.helpWidgetStatus === NetworkStatus.LOADING;
            };

            scope.showKeywordsFallback = function() {
                return scope.helpWidgetStatus === NetworkStatus.NOT_FOUND;
            };
        }

        return {
            restrict: 'E',
            scope: {
                pagePath: '=',
                onCloseCallback: '&onClose'
            },
            link: linker,
            replace: true,
            templateUrl: 'src/modules/help-widget/help-widget.html'
        };
    }]);
