/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */

import {blinkConstants} from 'src/base/blink-constants';
import IAngularEvent = angular.IAngularEvent;
import {Component, ngRequire} from '../../base/decorators';
import IRootScopeService = angular.IRootScopeService;
import IRouteService = angular.route.IRouteService;
import ICurrentRoute = angular.route.ICurrentRoute;
import {UIComponent} from '../../base/base-types/ui-component';
import {PinboardViewState} from '../pinboard/pinboard-page-config';

let $rootScope: IRootScopeService = ngRequire('$rootScope');
let $route: IRouteService = ngRequire('$route');
let env = ngRequire('env');
let Logger = ngRequire('Logger');
let PinboardPageConfig: any = ngRequire('PinboardPageConfig');
let sessionService: any = ngRequire('sessionService');
let $q = ngRequire('$q');

declare var addBooleanFlag: any;
declare var flags: any;
addBooleanFlag('screenshotMode', 'This flag enables snapshot mode', false);

@Component({
    name: 'bkPrintView',
    templateUrl: 'src/modules/print/print-view.html'
})
export class PrintViewComponent extends UIComponent {

    private logger: any = Logger.create('print-view-component');

    private routeChangeSuccessDeRegisterer: () => void;
    private routeChangeErrorDeRegisterer: () => void;

    private pinboardId: string = null;
    private pinboardPageConfig: any = null;

    private _isViewValid;
    private isScreenshotMode;


    private static doShortLivedLogin() {
        return sessionService.doShortLivedLogin(
            $route.current.params.userguid,
            $route.current.params.authtoken
        );
    }

    public postLink(element: JQuery) {
        // print view is supposed to be read only and not for end
        // user consumption
        env.enableUnsavedChangesAlert = false;

        $(document.documentElement).addClass('bk-print-document');

        // TODO(mahesh) Refactor routeChange event system to allow handlers to be registered
        // from outside of canvas component.
        this.routeChangeSuccessDeRegisterer = $rootScope.$on(
            '$routeChangeSuccess',
            ($routeEvent: IAngularEvent,
             currentRoute: ICurrentRoute,
             previousRoute: ICurrentRoute) => {
                this.handleSuccessfulRouteChange(currentRoute, previousRoute);
            }
        );

        this.routeChangeErrorDeRegisterer = $rootScope.$on(
            '$routeChangeError',
            ($routeEvent: IAngularEvent,
             currentRoute: ICurrentRoute,
             previousRoute: ICurrentRoute,
             error: any) => {
                this.handleRouteChangeError(error);
            }
        );

        this.handleSuccessfulRouteChange($route.current, $route.current);
        this.isScreenshotMode = flags.getValue('screenshotMode');
    }

    public onDestroy(): void {
        if (!!this.routeChangeSuccessDeRegisterer) {
            this.routeChangeSuccessDeRegisterer();
        }
        if (!!this.routeChangeErrorDeRegisterer) {
            this.routeChangeErrorDeRegisterer();
        }
    }

    public isViewValid() {
        return this._isViewValid;
    }

    public isPrintConfigurationValid(): boolean {
        if (!$route.current.params.documentId) {
            return false;
        }
        if (env.e2eTest) {
            return true;
        }
        return !!$route.current.params.userguid && !!$route.current.params.authtoken;
    }

    public getInvalidPrintConfigurationMessage(): string {
        return blinkConstants.INVALID_PRINT_CONFIGURATION_MESSAGE;
    }

    public getPinboardId(): string {
        return this.pinboardId;
    }

    public getPinboardPageConfig(): any {
        return this.pinboardPageConfig;
    }

    private handleSuccessfulRouteChange(
        currentRoute: ICurrentRoute,
        previousRoute: ICurrentRoute
    ): void {
        // As soon as we know that parameters has changed, first thing we should do is to
        // invalidate the view so that nothing is shown on the screen, this way we avoid leaking
        // data to a new user that may not have access to to the previous pinboard.
        this._isViewValid = false;
        if (!this.isPrintConfigurationValid()) {
            this.logger.error('userguid or authtoken or documentId is missing in url');
            return;
        }
        let promise;
        if (env.e2eTest) {
            // In print view we do token based login for the user specified in the url param,
            // that will require us to create a token and add that to postgres, which will be hard
            // to do in e2e tests. So for e2e tests We just render the print view as current
            // logged in user.
            promise = $q.when();
        } else {
            // 'finally' keyword is not supported by JS engine used by phantomjs 1.9.
            promise = sessionService.doLogout().then(
                PrintViewComponent.doShortLivedLogin,
                PrintViewComponent.doShortLivedLogin
            );
        }
        promise.then(() => {
            // only one vizId supported
            var singleVizMode = !!currentRoute.params.vizId;
            this.pinboardId = currentRoute.params.documentId;
            this.pinboardPageConfig = new PinboardPageConfig({
                vizIdsToShow: singleVizMode ? [currentRoute.params.vizId] : null,
                forceAutoMode: singleVizMode,
                disallowTileRemoval: true,
                disallowTileMaximization: true,
                disallowVizContextEdit: true,
                disallowVizEmbedding: true,
                disallowLayoutChanges: true,
                eagerLoadVizs: true,
                viewState: PinboardViewState.PRINT_STATE,
                flattenClusterVizs: true
            });
            this._isViewValid = true;
        }, () => {
            this.logger.error('Invalid token, authentication failed');
        });
    }

    private handleRouteChangeError(error: any) {
        this.logger.error('Error in route change', error);
    }
}

