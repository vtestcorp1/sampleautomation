/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Configuration for Pinboard page.
 */

import {Provide} from '../../base/decorators';

@Provide('PinboardViewState')
export class PinboardViewState {
    public static readonly DEFAULT_STATE: string = 'DEFAULT_STATE';
    public static readonly PRINT_STATE: string = 'PRINT_STATE';
    public static readonly RELATED_LINK_STATE: string = 'RELATED_LINK_STATE';
}

export interface PinboardPageConfig {
    disallowTileRemoval?: boolean;
    disallowTileMaximization?: boolean;
    disallowVizContextEdit?: boolean;
    disallowVizEmbedding?: boolean;
    vizIdsToShow?: string[];
    disallowLayoutChanges?: boolean;
    eagerLoadVizs?: boolean;
    snapshotId?: string;
    isAutoCreated?: boolean;
    viewState?: string;
    flattenClusterVizs?: boolean;
}

let defaultConfig: PinboardPageConfig = {
    disallowTileRemoval: false,
    disallowTileMaximization: false,
    disallowVizContextEdit: false,
    disallowVizEmbedding: false,
    disallowLayoutChanges: false,
    eagerLoadVizs: false,
    isAutoCreated: false,
    viewState: PinboardViewState.DEFAULT_STATE,
    flattenClusterVizs: false
};

@Provide('PinboardPageConfig')
class PinboardPageConfigImpl {
    constructor(config: PinboardPageConfig) {
        Object.assign(this, defaultConfig, config);
    }
}
