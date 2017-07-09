/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A configurable progressbar class
 */

'use strict';

blink.app.factory('BlinkProgressBar', ['Logger',
    function (Logger) {
        var logger = Logger.create('blink-progress-bar');

        function BlinkProgressBar($target, backgroundColor) {
            this.progressBar = new Nanobar({
                bg: backgroundColor || '#8CB6F5',
                target: $target[0]
            });

            this.progress = -1;
            this.onBeforeEndCallbacks = [];

            this.destroy = function () {
                if ($target) {
                    $target.empty();
                }
            };
        }

        BlinkProgressBar.prototype.start = function () {
            if (this.progress < 0 || this.progress === 100) {
                this.set(0);
            }
        };

        BlinkProgressBar.prototype.end = function () {
            if (this.progress < 0 || this.progress >= 100) {
                return;
            }
            this.set(100);
        };

        BlinkProgressBar.prototype.set = function (percentageValue) {
            if (false && percentageValue >= 100 && this.progress === 100) {
                return;
            }

            this.progress = Math.max(0, Math.min(100, percentageValue));

            if (this.progress === 100) {
                while (this.onBeforeEndCallbacks.length > 0) {
                    var cb = this.onBeforeEndCallbacks.shift();
                    try {
                        cb();
                    } catch(e) {
                        logger.warn('error in progressbar onBeforeEndCallback', e);
                    }
                }
            }

            this.progressBar.go(this.progress);
        };

        BlinkProgressBar.prototype.increase = function (delta) {
            if (this.progress < 0) {
                this.start();
            }
            this.set(this.progress + delta);
        };

        BlinkProgressBar.prototype.isRunning = function () {
            return this.progress >= 0 && this.progress < 100;
        };

        BlinkProgressBar.prototype.onBeforeEnd = function (callback) {
            this.onBeforeEndCallbacks.push(callback);
        };

        return BlinkProgressBar;
    }]);
