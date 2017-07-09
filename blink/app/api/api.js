/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview ThoughtSpot Javascript API for use of ThoughtSpot in external webpages.
 */

'use strict';

window.thoughtspot = (function(){
    var SSO_REDIRECTION_MARKER_GUID = '5e16222e-ef02-43e9-9fbd-24226bf3ce5b';
    var Events = {
        THOUGHTSPOT_AUTH_EXPIRED: 'ThoughtspotAuthExpired'
    };

    var EndPoints = {
        AUTH_VERIFICATION: '/callosum/v1/session/info',
        SSO_LOGIN_TEMPLATE: '/callosum/v1/saml/login?targetURLPath={targetUrl}'
    };

    var autoDeterminedThoughtspotHost = '',
        authExpirationHandlers = [],
        initialized = false;

    function parseUrl(url) {
        var parser = document.createElement('a');
        parser.href = url;

        return {
            protocol: parser.protocol,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname,
            search: parser.search,
            hash: parser.hash,
            host: parser.host
        };
    }

    function getScriptHost() {
        var scripts = document.getElementsByTagName('script');
        var currentScriptNode = scripts[scripts.length - 1];

        var currentScriptSrc = currentScriptNode.src;
        if (!currentScriptSrc) {
            console.error('Could not determine Thoughtspot domain from script\'s url');
            return '';
        }

        var currentScriptSrcParts = parseUrl(currentScriptSrc);
        return currentScriptSrcParts.host;
    }

    function formatString(template, keyValueMap) {
        Object.keys(keyValueMap).forEach(function(key){
            var pattern = '\\{' + key + '\\}';
            var re = new RegExp(pattern, 'g');
            template = template.replace(re, keyValueMap[key]);
        });
        return template;
    }

    function appendToUrlHash(url, stringToAppend) {
        stringToAppend = encodeURIComponent(stringToAppend);

        if (url.indexOf('#') >= 0) {
            url += stringToAppend;
        } else {
            url += '#' + stringToAppend;
        }

        return url;
    }

    function getAbsoluteTSUrl(thoughtspotHost, relativeUrl) {
        // assume that the protocol for TS is the same as the protocol
        // of the parent page. Mixed content is getting deprecated anyway
        var protocol = document.location.protocol;
        if (relativeUrl[0] !== '/') {
            relativeUrl = '/' + relativeUrl;
        }

        return formatString(
            '{protocol}//{domain}{path}',
            {
                protocol: protocol,
                domain: thoughtspotHost,
                path: relativeUrl
            }
        );
    }

    function checkIfLoggedIn(thoughtspotHost, callback) {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.onreadystatechange = function () {
            if (xhr.readyState < 4) {
                return;
            }

            var authenticated = xhr.status === 200;
            callback(authenticated);
        };

        var authVerificationUrl = getAbsoluteTSUrl(
            thoughtspotHost,
            EndPoints.AUTH_VERIFICATION
        );
        xhr.open('GET', authVerificationUrl, true);
        xhr.send();
    }

    function doSSO(thoughtspotHost) {
        var ssoRedirectUrl = appendToUrlHash(
            window.location.href,
            SSO_REDIRECTION_MARKER_GUID
        );

        // bring back the page to the same url
        var ssoEndPoint = formatString(EndPoints.SSO_LOGIN_TEMPLATE, {
            targetUrl: encodeURIComponent(ssoRedirectUrl)
        });

        var ssoURL = getAbsoluteTSUrl(thoughtspotHost, ssoEndPoint);
        window.location.href = ssoURL;
    }

    function isAtSSORedirectUrl() {
        return window.location.href.indexOf(SSO_REDIRECTION_MARKER_GUID) >= 0;
    }

    function removeSSORedirectUrlMarker() {
        // Note (sunny): this will leave a # around even if it was not in the URL to
        // being with, trying to remove the hash by changing window.location will reload
        // the page which we don't want. We'll live with adding an unnecessary hash to the
        // parent page's URL until we find any use case where that creates an issue
        window.location.hash = window.location.hash.replace(SSO_REDIRECTION_MARKER_GUID, '');
    }

    function setUpAuthExpirationHandling(thoughtspotHost) {
        window.addEventListener('message', function(event){
            var messageOrigin = event.origin.replace(/^https?:\/\//, '');
            if (messageOrigin !== thoughtspotHost) {
                return;
            }

            if (!event.data || event.data.type !== Events.THOUGHTSPOT_AUTH_EXPIRED) {
                console.error('ThoughtSpot sent a postMessage with an unexpected event', event);
                return;
            }

            // a statically embedded TS iframe might fire this
            // on load even before initialization has happened
            // the external page could treat this as a auto log
            // out scenario and try to authenticate again, interfering
            // with any ongoing initialiation.
            // Hence we don't fire `notifyOnAuthExpiration` until the
            // system has initialized.
            if (!initialized) {
                return;
            }

            authExpirationHandlers.forEach(function(authExpirationHandler){
                authExpirationHandler();
            });
        });
    }

    function addAuthExpirationHandler(authExpirationHandler) {
        var handlerAlreadySetUp = authExpirationHandlers.indexOf(authExpirationHandler) >= 0;
        if (handlerAlreadySetUp) {
            return;
        }
        authExpirationHandlers.push(authExpirationHandler);
    }

    function initialize(onInitialized, onAuthExpiration, thoughtspotHost) {
        if (thoughtspotHost === void 0) {
            thoughtspotHost = autoDeterminedThoughtspotHost;
        }

        if (!thoughtspotHost) {
            throw new Error('Invalid configuration, parameter `thoughtspotHost` ' +
                'was not provided and could not be automatically deduced');
        }

        setUpAuthExpirationHandling(thoughtspotHost);
        addAuthExpirationHandler(onAuthExpiration);

        checkIfLoggedIn(thoughtspotHost, function(isLoggedIn){
            if (isLoggedIn) {
                if (isAtSSORedirectUrl()) {
                    removeSSORedirectUrlMarker();
                }
                initialized = true;
                onInitialized(true);
                return;
            }

            // we have already tried authentication and it did not succeed, restore
            // the current url to the original one and call the callback
            if (isAtSSORedirectUrl()) {
                removeSSORedirectUrlMarker();
                initialized = true;
                onInitialized(false);
                return;
            }

            // redirect for SSO, when SSO is done this page will be loaded
            // again and the same JS will execute again
            doSSO(thoughtspotHost);
        });
    }

    function notifyOnAuthExpiration() {
        window.parent.postMessage({
            type: Events.THOUGHTSPOT_AUTH_EXPIRED
        }, '*');
    }

    autoDeterminedThoughtspotHost = getScriptHost();

    function subscribeToAlerts(thoughtspotHost, onAlertCallback) {
        window.addEventListener('message', function (event) {
            if (event.origin !== thoughtspotHost) {
                return;
            }
            onAlertCallback(event);
        });
    }

    return {
        initialize: initialize,
        notifyOnAuthExpiration: notifyOnAuthExpiration,
        subscribeToAlerts: subscribeToAlerts
    };
})();
