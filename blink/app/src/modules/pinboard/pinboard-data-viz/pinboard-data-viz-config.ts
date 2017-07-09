/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Config for data viz in pinboard
 */

export interface PinboardDataVizConfig {
    disallowTranformations?: boolean;
    isContextEditable?: boolean;
    snapshotId?: string;
    hideActions?: boolean;
}

let defaultConfig: PinboardDataVizConfig = {
    disallowTranformations: false,
    isContextEditable: false,
    hideActions: false
};

export class PinboardDataVizCardConfigImpl {
    constructor(config: PinboardDataVizConfig) {
        Object.assign(this, defaultConfig, config);
    }
}
