/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Viz render in an expensive operation on the primary thread taking from
 * 100ms few seconds in some cases.
 * There are 2 goals in the application.
 * - Do not render multiple visualization in the same event loop.
 *   The idea here is let browser have free CPU cycles during rendering.
 *   Eg. In case of pinboard where we are trying to render 10s of vizs
 *   the app can be perceived to be stuck.
 * - Render visualizations in 2 phases.
 *   We want to provide ability to different vizs to stage rendering into
 *   2 parts. The decision on what to render in each phase is left for the
 *   viz to decide. The guiding principle is
 *   Primary render should be fast and contain enough detail to make out
 *   a high level idea.
 *   Eg Loading the chart bars, pie etc
 *   Secondary render should render the all the details.
 *   Eg In charts we load data labels in this phase as that is supplementary
 *   information and it takes a long time to compute.
 *
 *   This service is a singleton for the app and all viz rendering primary or
 *   secondary should be queued here and this service will ensure notifying
 *   the caller on when to render.
 *   The logic of deciding relative priority of render requests and the delay
 *   between subsequent renders is done here.
 *
 *   NOTE: This service doesn't have the knowledge of app lifecycle so the
 *   clean up of pending tasks should be requested by the application code.
 *   This service will allow cancelling the render requests.
 */

import {ngRequire, Provide} from '../base/decorators';

let $q = ngRequire('$q');
let $timeout = ngRequire('$timeout');
let Logger = ngRequire('Logger');

let SUBSEQUENT_RENDER_DELAY = 50;

enum RenderType {
    Primary,
    Secondary
}

class ActiveRenderTask {
    private _vizId: string;
    private startTime: number;
    private _type: RenderType;

    constructor(vizId: string, type: RenderType) {
        this._vizId = vizId;
        this._type = type;
        this.startTime = Date.now();
    }

    get vizId(): string {
        return this._vizId;
    }

    get renderType(): RenderType {
        return this._type;
    }

    public finish(vizId: string): number {
        if (vizId === this._vizId) {
            return Date.now() - this.startTime;
        }
        return -1;
    }
}

interface RenderQueueEntry {
    id: string;
    promiseResolver: Function;
}

let logger;
let ignoreRenderDelay = false;

/**
 * Rendering has been divided into a 2 step process for visualizations. For example,
 * for charts, usual rendering is done in the first step, data labels are rendered in the
 * second phase.
 * These 2 lists are used to achieve that, all visualizations in the primary rendering queue are
 * prioritized over secondary queue rendering. Once a rendering is triggered, the item is
 * cleared from queue.
 */
let primaryRenderQueue: RenderQueueEntry[] = [];
let secondaryRenderQueue: RenderQueueEntry[] = [];

/**
 * Keeps track of the render request which is currently active.
 */
let activeRenderTask: ActiveRenderTask = null;

function tryRender() {
    if (!!activeRenderTask) {
        logger.info('Render attempted when active render in progress');
        return;
    }
    if (primaryRenderQueue.length > 0) {
        let renderQueueEntry: RenderQueueEntry = primaryRenderQueue.shift();
        activeRenderTask = new ActiveRenderTask(renderQueueEntry.id, RenderType.Primary);
        renderQueueEntry.promiseResolver();
    } else if (secondaryRenderQueue.length > 0) {
        let renderQueueEntry: RenderQueueEntry = secondaryRenderQueue.shift();
        activeRenderTask = new ActiveRenderTask(renderQueueEntry.id, RenderType.Secondary);
        renderQueueEntry.promiseResolver();
    } else {
        logger.info('No pending vizs to render');
    }

    if (!!activeRenderTask) {
        logger.debug('$$RQ. Render Viz started.',
            'vizId: ' + activeRenderTask.vizId,
            'renderType: ' + activeRenderTask.renderType,
            'PrimaryRenderQLen: ' + primaryRenderQueue.length,
            'SecondaryRenderQLen: ' + secondaryRenderQueue.length
        );
    }
}

function initVizRenderService() {
    logger = Logger.create('viz-render-queuing-service');
}

function enqueueRenderRequest(vizId: string, queue) : Promise<any> {
    let defer = $q.defer();
    let queueEntry: RenderQueueEntry = {
        id: vizId,
        promiseResolver: defer.resolve
    };
    queue.push(queueEntry);
    tryRender();
    return defer.promise;
}

function enqueuePrimaryRenderRequest(vizId: string) : Promise<any> {
    return enqueueRenderRequest(vizId, primaryRenderQueue);
}

function enqueueSecondaryRenderRequest(vizId: string) : Promise<any> {
    return enqueueRenderRequest(vizId, secondaryRenderQueue);
}

function renderComplete(vizId) {
    if (!activeRenderTask) {
        logger.warn('Viz rendering done without queueing');
        return;
    }
    let renderTime = activeRenderTask.finish(vizId);
    logger.debug('$$RQ. OnRenderComplete.',
        'vizId: ' + vizId,
        'renderType: ' + !!activeRenderTask.renderType,
        'PrimaryRenderQLen: ' + primaryRenderQueue.length,
        'SecondaryRenderQLen: ' + secondaryRenderQueue.length,
        'LOAD_TIME: ' + renderTime
    );
    // If the render actually finished for the correct vizId
    if (renderTime !== -1) {
        activeRenderTask = null;
        if (ignoreRenderDelay) {
            tryRender();
        } else {
            $timeout(tryRender, SUBSEQUENT_RENDER_DELAY, true);
        }
    }
}

function clearQueue() {
    primaryRenderQueue = [];
    secondaryRenderQueue = [];
    activeRenderTask = null;
}

function setIgnoreRenderDelay(ignore) {
    ignoreRenderDelay = ignore;
}

export {
    initVizRenderService,
    enqueuePrimaryRenderRequest,
    enqueueSecondaryRenderRequest,
    renderComplete,
    clearQueue
};

Provide('vizRenderQueueService')(
    {
        initVizRenderService,
        enqueuePrimaryRenderRequest,
        enqueueSecondaryRenderRequest,
        renderComplete,
        clearQueue,
        setIgnoreRenderDelay
    }
);
