/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This class represents the struct to hold chart axis config validation.
 */

export class ChartAxisConfigValidationErrors {
    constructor (
        public xAxis: string,
        public yAxis: string,
        public legend: string,
        public radial: string,
        public other: string
    ) {}
}
