import {PinboardDataVizConfig} from '../pinboard-data-viz/pinboard-data-viz-config';
/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

export interface PbCardConfig extends PinboardDataVizConfig {
    disallowTileMaximization: boolean;
    disallowTileRemoval: boolean;
    disallowLayoutChanges: boolean;
}

let defaultConfig: PbCardConfig = {
    disallowTileMaximization: false,
    disallowTileRemoval: false,
    disallowLayoutChanges: false,
    disallowTranformations: false,
    isContextEditable: false,
    hideActions: false
};

export class PbCardConfigImpl {
    constructor(config: PbCardConfig) {
        Object.assign(this, defaultConfig, config);
    }
}
