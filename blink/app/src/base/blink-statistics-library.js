/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Library containing logic for commonly used data operations.
 */

'use strict';

blink.app.factory('blinkStatisticsLibrary', [function () {
    var VarianceCalculator = function () {
        this.n = 0;
        this.mean = 0;
        this.m2 = 0;
    };
    VarianceCalculator.prototype.add = function (val) {
        this.n++;
        var delta = val - this.mean;
        this.mean = this.mean + delta/this.n;
        this.m2 = this.m2 + delta * (val - this.mean);
    };
    VarianceCalculator.prototype.getVariance = function () {
        return this.n <= 1 ? 0 : this.m2/(this.n - 1);
    };
    VarianceCalculator.prototype.getMean = function () {
        return this.mean;
    };
    VarianceCalculator.prototype.getCoefficientOfVariation = function () {
        // TODO(sunny): co-efficient of variation does not make sense as a measure of spread of data
        // if the data has negative values (http:// stats.stackexchange.com/q/56399)
        var variance = this.getVariance();
        return variance === 0 ? 0 : Math.abs(this.getVariance()/this.getMean());
    };

    return {
        // Objects:
        VarianceCalculator: VarianceCalculator
    };
}]);
