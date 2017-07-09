/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * Bootstrap Process:
 *
 * 1. The systemjs bundle and the angular bundle are loaded independently.
 * 2. Now either the angular could be bootstrapped before/after the systemjs bundle is loaded.
 *    2a. If Angular bootstraps first, the injector/providers are initialized in app.js
 *    2b. If systemjs loads first, the injector/providers are initialized in decorators.js
 * 3. startApp() is called after the injector is created.
 * 4. ngRequire lazily provides the angular dependencies via Proxy.
 */

import '../base/geo/countries';
import '../base/proto/callosum-types';
import {MetadataCache} from '../common/metadata-cache/metadata-cache-service';
import '../common/widgets/accordion-list-viewer/accordion-list-viewer';
import '../common/widgets/accordion/accordion-item';
import '../common/widgets/accordion/accordion-list';
import '../common/widgets/action-links-list/action-links-list-component';
import '../common/widgets/action-menu/action-menu';
import '../common/widgets/checkbox-collection/smart-checkbox-collection-controller';
import '../common/widgets/checkbox/checkbox';
import '../common/widgets/column-metrics/column-metrics';
import '../common/widgets/dialog/dialog-service';
import '../common/widgets/expiration-button/expiration-button-component';
import '../common/widgets/info-header/info-header-component';
import '../common/widgets/input/input';
import '../common/widgets/multi-sections-navigable-list/multi-section-navigable-list';
import '../common/widgets/multi-sections-navigable-list/navigable-expandable-section';
import '../common/widgets/multi-sections-navigable-list/navigable-section';
import '../common/widgets/name-value-pairs/name-value-pairs-component';
import '../common/widgets/radio-button/radio-button-component';
import '../common/widgets/select/select';
import '../common/widgets/slide-show/slide';
import '../common/widgets/slide-show/slide-show';
import '../common/widgets/slide-show/slide-show-navigator';
import '../modules/a3/a3-dashboard/a3-dashboard';
import '../modules/a3/a3-dialog';
import '../modules/a3/a3-dialog-popup';
import '../modules/a3/a3-insights-summary/a3-insights-summary';
import '../modules/a3/auto-analyzer-service';
import '../modules/a3/table/a3-table-analysis';
import '../modules/a3/test/a3-test-service';
import '../modules/add-principal/add-principal-component';
import '../modules/admin/schema-viewer/graph-model/factories/graph-factory-service';
import '../modules/admin/schema-viewer/legend/blink-graph-legend';
import '../modules/admin/schema-viewer/schema-fetcher/schema-model';
import '../modules/admin/schema-viewer/schema-fetcher/schema-service';
import '../modules/admin/schema-viewer/viewer-directive/controllers/worksheet-viewer-controller';
import '../modules/analyze/analyzer';
import '../modules/answer-panel/answer-page/answer-page';
import '../modules/answer-panel/answer-page/answer-page-actions-util';
import '../modules/answer-panel/answer-page/answer-page-filter-panel';
import '../modules/callosum/model/question-model';
import '../modules/callosum/service/session-service';
import '../modules/conditional-formatting/conditional-formatting-dialog';
import {AppLogoType} from '../modules/custom-styling/custom-style-config';
import {CustomStylingService} from '../modules/custom-styling/custom-styling-service';
import '../modules/custom-styling/style-customizer-component';
import '../modules/data-explorer/geo-config-editor/geo-config-editor';
import '../modules/document-model/answer-model/pinboard-answer-sheet-util';
import '../modules/document-model/document-util';
import '../modules/document-model/table-model/geo-config';
import '../modules/embed/full-embed/full-embed-config';
import '../modules/filters/filter-dialog';
import '../modules/home/home-page';
import '../modules/jobs-scheduling/job-status-viewer-component';
import '../modules/jobs-scheduling/schedule-job-component';
import '../modules/jobs-scheduling/timely-services';
import '../modules/leaf-level-data/add-columns-menu';
import '../modules/login/login-component';
import '../modules/metadata-item-selector/metadata-item-selector';
import '../modules/metadata-item-selector/principal-item-selector';
import '../modules/metadata-list/pinboards/pinboards-report-list-component';
import '../modules/natural-query/info-card-icon/info-card-icon';
import '../modules/pinboard/pinboard-page-config';
import '../modules/pinboard/viz-context/viz-context-answer';
import '../modules/powered-footer/powered-footer';
import '../modules/print/print-view-component';
import '../modules/related-link/editor/related-link-popup';
import '../modules/related-link/related-link';
import '../modules/replay/answer-replay/answer-replay';
import '../modules/sage-client/answer-sage-client';
import '../modules/sage/data-scope/sage-data-scope-service';
import '../modules/sage/data-source-preview/data-source-preview';
import '../modules/sage/join-disambiguation/join-disambiguation';
import '../modules/sage/sage-bar/sage-bar';
import '../modules/search-pages/aggregated-worksheet-editor/aggregated-worksheet-editor';
import '../modules/search-pages/answer/answer';
import '../modules/search-pages/saved-answer/saved-answer';
import '../modules/share/share-dialog-component';
import '../modules/share/share-permissions/permissions-list';
import '../modules/share/share-permissions/share-permission';
import '../modules/share/share-principal/principal-viewer-component';
import '../modules/slack-register/slack-register';
import '../modules/user-preference/user-preference/user-preference';
import '../modules/viz-context-menu/chart-context-menu-util';
import '../modules/viz-context-menu/controllers/related-items';
import '../modules/viz-context-menu/controllers/sage-token-options';
import '../modules/viz-context-menu/show-underlying-data-service';
import '../modules/viz-context-menu/table-context-menu-util';
import '../modules/viz-context-menu/viz-context-menu-util';
import '../modules/viz-layout/answer/json-constants';
import '../modules/viz-layout/layout/layout-migration-service';
import '../modules/viz-layout/layout/layout-service';
import '../modules/viz-layout/pinboard/pinboard-answer';
import '../modules/viz-layout/viz/chart/axis-column-validation-service';
import '../modules/viz-layout/viz/chart/chart-model';
import '../modules/viz-layout/viz/chart/chart-theme-service';
import {init as initChartSpec}
    from '../modules/viz-layout/viz/chart/chart-type-specification-service';
import '../modules/viz-layout/viz/chart/chart-ui-utils';
import '../modules/viz-layout/viz/chart/geomap/2d/blink-geo-map';
import '../modules/viz-layout/viz/chart/geomap/2d/loaders/polygon-feature-loader';
import '../modules/viz-layout/viz/chart/geomap/2d/sources/base-vector-source';
import '../modules/viz-layout/viz/chart/geomap/base/geo-country-config';
import '../modules/viz-layout/viz/chart/geomap/base/geo-country-config-data';
import '../modules/viz-layout/viz/chart/geomap/base/geo-country-default-config';
import '../modules/viz-layout/viz/chart/geomap/base/geo-utils';
import '../modules/viz-layout/viz/chart/geomap/base/metadata-services/geo-prop-field';
import '../modules/viz-layout/viz/chart/geomap/base/metadata-services/geo-topology-data-store';
// tslint:disable-next-line
import '../modules/viz-layout/viz/common/pinboard-drop-down/visualization-pinner/visualization-pinner-launcher-component';
import '../modules/viz-layout/viz/filter-v2/attribute-filter/attribute-filter-component';
import '../modules/viz-layout/viz/filter-v2/checkbox-filter-v3/checkbox-filter-controller-v3';
import '../modules/viz-layout/viz/filter/filter-model';
import '../modules/viz-layout/viz/filter/filter-model-factory';
import '../modules/viz-layout/viz/pinboard-viz-model';
import '../modules/viz-layout/viz/pivot/pivot-component';
import '../modules/viz-layout/viz/viz-cluster/viz-cluster';
import '../modules/viz-layout/viz/viz-cluster/viz-cluster-model';
import '../modules/yseop-service';
import {blinkConstants} from './blink-constants';
import {appReady, ngRequire, registerInits, runAfterInjectorCreated} from './decorators';
import './events/events';
import {getCurrentPage, init as routeServiceInit} from './route-service';
import './StringEnumBase';
import './strings';

/* tslint:disable:max-line-length */
import '../modules/admin/schema-viewer/schema-canvas-directive/schema-templates-service';
import '../modules/admin/schema-viewer/schema-navigation-list/controllers/full-schema-navigation-list-controller';
import '../modules/admin/schema-viewer/schema-navigation-list/controllers/navigation-list-controller';
import '../modules/admin/schema-viewer/schema-navigation-list/controllers/schema-navigation-list-controller';
import '../modules/admin/schema-viewer/schema-navigation-list/controllers/worksheet-navigation-list-controller';
import '../modules/admin/schema-viewer/viewer-directive/controllers/base-viewer-controller';
import '../modules/admin/schema-viewer/viewer-directive/controllers/full-schema-viewer-controller';
import {
    authenticate, getPreferredLocale, isNPSEnabled, isStyleCustomizationEnabled, onUserLoggedIn
} from '../modules/callosum/service/session-service';
import {fetchSystemConfig} from '../modules/callosum/service/system-config-service';
import {isAppEmbedded} from '../modules/client-state-service';
import {initWorkflowFlush} from '../modules/user-workflow-manager/workflow-flushing-service';
import {initWorkflowService} from '../modules/user-workflow-manager/workflow-management-service';
import {initVizRenderService} from '../services/viz-render-queuing-service';
import {changeLocale} from './strings';

let $q = ngRequire('$q');
let $route = ngRequire('$route');
let alertService = ngRequire('alertService');
let appDoctorService = ngRequire('appDoctorService');
let browserFixes = ngRequire('browserFixes');
let dateUtil = ngRequire('dateUtil');
let debugInfoCollector = ngRequire('debugInfoCollector');
let eventTracker = ngRequire('eventTracker');
let env = ngRequire('env');
let loadingIndicator = ngRequire('loadingIndicator');
let localizationService = ngRequire('localizationService');
let Logger = ngRequire('Logger');
let logReporter = ngRequire('logReporter');
let messageService = ngRequire('messageService');
let mindtouchInternetCheckService = ngRequire('mindtouchInternetCheckService');
let navAlertService = ngRequire('navAlertService');
let navService = ngRequire('navService');
let PerformanceAnalyzer = ngRequire('PerformanceAnalyzer');
let perfEvents = ngRequire('perfEvents');
let rootStrings = ngRequire('rootStrings');
let supportDebugInfoDownloadService = ngRequire('supportDebugInfoDownloadService');
let schedulerService = ngRequire('schedulerService');
let slackService = ngRequire('slackService');
let wootric = ngRequire('wootric');

declare var blink:any;
declare var System: any;
declare var Promise: any;
declare var window: any;
let logger;

export function start() {
    registerInits();
    runAfterInjectorCreated(startApp);
}

function addFavicon() {
    var link = window.document.querySelector('link[rel*="icon"]')
        || window.document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    // randomNum is used for cache busting
    var randomNum = Math.round(Math.random() * 10000);
    var iconUrl = CustomStylingService.getConfig()
            .getFaviconUrl(AppLogoType.DEFAULT) + '?r=' + randomNum;

    link.href = iconUrl;
    window.document.getElementsByTagName('head')[0].appendChild(link);
}

function addHTMLTitle() {
    window.document.title = CustomStylingService.getConfig().getPageTitle();
}

let internetConnectivityPromise = null;

function startApp() {
    appReady();
    logger = Logger.create('app-start');
    browserFixes.apply();
    initializeApp();

    navAlertService.registerWindowUnloadAndRouteChangeListeners();
    messageService.init();
    supportDebugInfoDownloadService.initialize();
    rootStrings.init();

    // We attach a performance analyzer instance to a window object,
    // so that we can easily launch it from dev tools console and from
    // scripts injected in selenium tests.
    // Sample analyzer usage:
    // performaceAnalyzer.getGroupedLog(null, null, [[perfEvents.PINBOARD_RENDERED],
    // [perfEvents.PINBOARD_VIZ_RENDERED]]); this should give you a tree-like structure
    // representing all pinboard rendering related events
    // happened in current session
    window.performanceAnalyzer = new PerformanceAnalyzer(eventTracker, debugInfoCollector);
    window.perfEvents = perfEvents;
    blink.app.logReporter = logReporter;

    if (!env.e2eTest) {
        appDoctorService.pollHeartbeat();
        appDoctorService.pollSession();
    }

    internetConnectivityPromise = mindtouchInternetCheckService.checkNetworkConnectivity()
        .then((isNetworkReachable) => {
            blink.app.connectedToInternet = !!isNetworkReachable;
        }, (error) => {
            blink.app.connectedToInternet = false;

            logger.warn('error in checking for network connectivity', error);
        });

    // user timezone preferences need to be initialized on login
    onUserLoggedIn.subscribe(() => {
        dateUtil.initialize();
        initWootric();
        initVizRenderService();
        changeLocale(getPreferredLocale());
    });

    // For measuring the current memory usage by the application, we make a
    // call window.gc method (provided by chrome) and then take a measurement
    // (using the window.performance.memory). However, it is observed that
    // the gc method is not synchronous, and the memory measurement after the
    // GC is hence not accurate. To overcome this, we have added a cycle to GC
    // and making sure memory measurement have stabilized in a certain range to
    // and then only declaring the the GC as complete so that measurements made
    // right after this are accurate.
    window.stableGC = function () {
        var queue = [];
        var QUEUE_LEN = 10;
        var STABLE_WINDOW_SIZE = 2000; // ~2kb
        // Checks if usedHeapSize of the mem-states in the queue lie within
        // the stable window size.
        function isMemStateStable(queue) {
            if (queue.length < QUEUE_LEN) {
                return false;
            }
            var minSize = Infinity;
            var maxSize = 0;
            queue.forEach(function (result) {
                minSize = Math.min(minSize, result.usedJSHeapSize);
                maxSize = Math.max(maxSize, result.usedJSHeapSize);
            });
            return ((maxSize - minSize) < STABLE_WINDOW_SIZE);
        }
        // Reads the new mem-state into the queue, deque'ing any old entries
        // if the max queue size is exceeded.
        function readNewMemState(queue) {
            queue.unshift(window.performance.memory);
            if (queue.length > QUEUE_LEN) {
                queue.pop();
            }
        }
        while (!isMemStateStable(queue)) {
            window.gc();
            readNewMemState(queue);
        }
        return queue[0];
    };
}

function initWootric() {
    internetConnectivityPromise.finally(
        () => {
            let isNpsEnabled = isNPSEnabled();
            let isPrintPage = getCurrentPage() === blink.app.pages.PRINT;
            let connectToInternet = !!blink.app.connectedToInternet;
            let isEmbedMode = isAppEmbedded();
            if (isNpsEnabled && connectToInternet && !isEmbedMode && !isPrintPage && !env.e2eTest) {
                wootric.run();
            }
        }
    );
}

function shouldEnableLocalization() {
    return getCurrentPage() === blink.app.pages.EMBED;
}

function loadResourcesAndInitializeServices() {

    var enableLocalization = shouldEnableLocalization();

    var styleCustomizationDisabled
        = !(env.customBrandingEnabled || isStyleCustomizationEnabled());

    var resourceLoaderPromises = [
        localizationService.initialize(enableLocalization),
        CustomStylingService.initialize(styleCustomizationDisabled),
        fetchSystemConfig()
    ];

    return $q.all(resourceLoaderPromises)
        .then(() => changeLocale(getPreferredLocale()))
        .then(
            function() {
                addFavicon();
                addHTMLTitle();
                dateUtil.initialize();
                initVizRenderService();
                initWootric();
                schedulerService.initialize();
                // Initialize slack service, note this is done after system config is loaded.
                slackService.initialize();
            },
            function(error){
                logger.error('Error in loading app resources', error);
                alertService.showAlert({
                    message: blinkConstants.appInitialization.APP_INITIALIZATION_FAILURE_MESSAGE,
                    type: alertService.alertConstants.type.ERROR
                });
                return $q.reject(error);
            }
        );
}

function initializeApp() {
    loadingIndicator.show({
        loadingText: 'Loading',
        anchorElementOrSelector: 'body',
        showInstantly: false
    });

    // init users and groups cache
    let cache: MetadataCache = new MetadataCache();

    routeServiceInit();
    initWorkflowService();
    initWorkflowFlush();
    initChartSpec();

    return authenticate()
        .then(
            loadResourcesAndInitializeServices,
            function() {
                let defer = $q.defer();
                loadResourcesAndInitializeServices().then(function() {
                    defer.reject();
                });
                return defer.promise;
            })
        .then(
            function () {
                // User had a valid session and is now authenticated
                if (getCurrentPage() === blink.app.pages.LOGIN) {
                    // User loaded /login with a valid session, go to /
                    navService.goToHome();
                }
            }, function() {
                // Redirection to /login currently happens in callosum-api so
                // when it comes here, $route.current.page has already been changed to
                // 'login' (unless we are explicitly bypassing redirection for that path,
                // like print and login). So currently this code is no-op.
                if ($route.current.page !== blink.app.pages.LOGIN &&
                    $route.current.page !== blink.app.pages.PRINT) {
                    navService.goToLogin();
                }
            })
        .finally(function () {
            blink.app.appInitialized = true;
            loadingIndicator.hide();
        });
}
