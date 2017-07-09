/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A utility to detect whether a user is 'interacting' with a DOM element. Interaction is
 *               equated to the DOM node receiving mouse/keyboard events. Use includes slowing WebGL
 *               animation frame-rate if the user is not interacting with the corresponding canvas.
 */

'use strict';

blink.app.factory('UserActivityDetector', ['Logger', 'jsUtil', function(Logger, jsUtil){
    var INTERACTION_EVENTS = [
        'click',
        'contextmenu',
        'dblclick',
        'touchstart',
        'touchend',
        'touchmove',
        'mousemove',
        'mouseenter',
        'mouseup',
        'scroll',
        'mousewheel',
        'DOMMouseScroll',
        'keydown',
        'keyup'
    ];

    var DEFAULT_IDLE_TIME_INTERVAL = 3000;

    var logger = Logger.create('user-activity-detector');

    function UserActivityDetector(domNode) {
        this.domNode = domNode;
        this.lastActivityTime = -1;
        this.id = jsUtil.generateUUID();
        this.activityListeners = [];

        var detector = this;
        this.interactionEventHandler = function(event) {
            onInteractionEvent(detector, event);
        };

        this.reset();
        addEventListeners(this);
    }

    UserActivityDetector.prototype.isIdle = function () {
        return new Date().getTime() - this.lastActivityTime > DEFAULT_IDLE_TIME_INTERVAL;
    };

    UserActivityDetector.prototype.reset = function () {
        this.lastActivityTime = new Date().getTime();
    };

    UserActivityDetector.prototype.destroy = function () {
        this.activityListeners = [];
        removeEventListeners(this);
        this.interactionEventHandler = null;
    };

    UserActivityDetector.prototype.addActivityListener = function (onUserActivity) {
        this.activityListeners.push(onUserActivity);
    };

    function addEventListeners(detector) {
        INTERACTION_EVENTS.forEach(function(interactionEvent){
            // since we support IE>=10 we can get the events in capture phase
            // this is important to deal with camera calling stopPropagation on
            // events like scroll
            detector.domNode.addEventListener(interactionEvent, detector.interactionEventHandler, true);
        });
        window.addEventListener('resize', detector.interactionEventHandler, true);
    }

    function removeEventListeners(detector) {
        INTERACTION_EVENTS.forEach(function(interactionEvent){
            detector.domNode.removeEventListener(interactionEvent, detector.interactionEventHandler);
        });
        window.removeEventListener('resize', detector.interactionEventHandler);
    }

    function onInteractionEvent(detector, event) {
        detector.lastActivityTime = new Date().getTime();
        detector.activityListeners.forEach(function(activityListener){
            try {
                activityListener();
            } catch(e) {
                logger.error('error in user activity listener', e);
            }
        });
    }

    return UserActivityDetector;
}]);
