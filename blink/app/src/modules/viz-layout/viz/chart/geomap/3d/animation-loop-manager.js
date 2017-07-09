/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A utility to detect whether a user is 'interacting' with a DOM element. Interaction is
 *               equated to the DOM node receiving mouse/keyboard events. Use includes slowing WebGL
 *               animation frame-rate if the user is not interacting with the corresponding canvas.
 */

'use strict';

blink.app.factory('AnimationLoopManager', ['UserActivityDetector', function(UserActivityDetector){
    var IDLE_FRAME_RATE = 0.001,
        ACTIVE_FRAME_RATE = 30;

    function AnimationLoopManager(canvasDOMNode, renderFunction) {
        this.animationFrameRequestId = null;
        this.renderFunction = renderFunction;
        this.userActivityDetector = new UserActivityDetector(canvasDOMNode);
        this.lastRenderTime = -1;

        var animationLoopManager = this;
        var onAnimationFrame = function() {
            animationLoopManager.animationFrameRequestId = window.requestAnimationFrame(onAnimationFrame);

            var isIdle = animationLoopManager.userActivityDetector.isIdle();
            var targetFrameRate = isIdle ? IDLE_FRAME_RATE : ACTIVE_FRAME_RATE;
            var minTimeSinceLastRender = 1000/targetFrameRate;

            var now = new Date().getTime();
            var timeSinceLastRender = now - animationLoopManager.lastRenderTime;

            if (timeSinceLastRender < minTimeSinceLastRender) {
                return;
            }
            animationLoopManager.lastRenderTime = now;
            animationLoopManager.renderFunction();
        };

        onAnimationFrame(this);
    }

    AnimationLoopManager.prototype.onExternalActivity = function () {
        this.userActivityDetector.reset();
    };

    AnimationLoopManager.prototype.destroy = function () {
        if (this.animationFrameRequestId) {
            window.cancelAnimationFrame(this.animationFrameRequestId);
            this.animationFrameRequestId = null;
        }
        if (this.userActivityDetector) {
            this.userActivityDetector.destroy();
        }
    };

    return AnimationLoopManager;
}]);
