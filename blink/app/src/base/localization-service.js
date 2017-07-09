/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A service to bootstrap localization for the app
 */

'use strict';

blink.app.factory('localizationService', ['$route',
    '$q',
    'env',
    'Logger',
    'sessionService',
    function ($route,
          $q,
          env,
          Logger,
          sessionService) {

        var DEFAULT_LOCALE = 'en_US',
            DEFAULT_ACCEPT_LANGUAGE = 'en-US,en;q=0.8',
            ICU4JS_RESOURCES_PATH = 'resources/icu4js',
            ICU4JS_UNPACKED_RESOURCES_FILES_DIR_NAME = 'data';

        var logger = Logger.create('localization-service');
        var localizationEnabled = false;

        function setUpBidiHandling() {
            var isRTL = icu4js.isRightToLeft();
            if (!isRTL) {
                return;
            }
        // Hack to force the browser to handle bidi text in an acceptable way.
        // This will force the browser to render bidi text in the default direction
        // of the page (current it is always LTR). Note that since the global
        // css rule can add some performance cost we do it only if the default language
        // of the locale is RTL.
        // TODO (sunny): Figure out the best practices on handling dynamic bidi text
        // in a way that would be support by IE.
            var style = $('<style> * { unicode-bidi: bidi-override; }</style>');
            $('html > head').append(style);
        }

        function getDefaultLocale(autoDetectLocale) {
            if (!!env.defaultLocale) {
                return env.defaultLocale;
            }

            if (!autoDetectLocale) {
                return DEFAULT_LOCALE;
            }
            return void 0;
        }

        function loadICU4JSResources(autoDetectLocale) {
            var deferred = $q.defer();

            var defaultLocale = getDefaultLocale(autoDetectLocale);
            var acceptLanguage = void 0;
            if (!defaultLocale) {
            // use accept-language only if url override is not
            // set.
                acceptLanguage = sessionService.getAcceptLanguage();
            }

        // TODO(SCAL-15862): icu4js does not error when called without acceptLanguage set,
        // causes entire app to get stuck in loading state. We should ensure that accept language is
        // always present, by probably fetching acceptLanguage before fetching session.
            acceptLanguage = acceptLanguage || DEFAULT_ACCEPT_LANGUAGE;

            icu4js.load(
            function(error){
                if (!!error) {
                    logger.error('Error in loading icu4js resources', error);
                    deferred.reject(error);
                } else {
                    deferred.resolve();
                }
            }, {
                defaultLocale: defaultLocale,
                acceptLanguage: acceptLanguage,
                dataRoot: ICU4JS_RESOURCES_PATH,
                unpackedDataFilesDirName: ICU4JS_UNPACKED_RESOURCES_FILES_DIR_NAME
            }
        );

            return deferred.promise;
        }

        function isLocalizationEnabled() {
        // If url flag is provided assume we want localization
        // to be enabled. This is to help debugging and demo.
            return localizationEnabled || !!env.defaultLocale;
        }

        function initialize(enableLocalization) {
            localizationEnabled = enableLocalization;
            return loadICU4JSResources(localizationEnabled)
            .then(function(){
                setUpBidiHandling();
            });
        }

        return {
            isLocalizationEnabled: isLocalizationEnabled,
            initialize: initialize
        };
    }]);
