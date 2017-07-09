/**
 * Copyright: ThoughtSpot Inc. 2017
 * Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview This is a test service that is used to scale test a3 pipeline.
 * It iterates through all pinboard and answer visualization and performs
 * visualization analysis on them.
 *
 * To Run this in dev console enter these commands:
 * angular.element(document.body).injector().get('a3TestService').testPinboards()
 * angular.element(document.body).injector().get('a3TestService').testAnswers()
 * angular.element(document.body).injector().get('a3TestService').testAll()
 */

'use strict';
import {IPromise} from 'angular';
import {ngRequire, Provide} from 'src/base/decorators';
import {blinkConstants} from '../../../base/blink-constants';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {fetchData} from '../../viz-layout/pinboard/pinboard-data-fetch-util';
import {triggerDataAnalysis, triggerVisualizationAnalysis} from '../auto-analyzer-service';

let util = ngRequire('util');
let Logger = ngRequire('Logger');
let DocumentLoader = ngRequire('DocumentLoader');
let PinboardListController = ngRequire('PinboardListController');
let AnswerListController = ngRequire('AnswerListController');
let logger;
let noop = () => {/* do nothing */};
let $q = ngRequire('$q');
let sleepMilliSeconds = 500; // 500 ms default
let startIndex = 0; // count of visualization from where to restart test from.
let currentIndex = -1;
let analysisType = 'viz'; // viz || data
/**
 * A3 Test Service that analyses all pinboards/answers
 */
Provide('a3TestService')({
    testPinboards,
    testAnswers,
    testAll
});

function init(sleepInSeconds, index, type) {
    startIndex = 0;
    currentIndex = -1;
    if (!logger) {
        logger = Logger.create('a3-test-service');
    }
    if (!!sleepInSeconds) {
        sleepMilliSeconds = sleepInSeconds * 1000;
    }
    if (!!index) {
        startIndex = index;
    }
    if (!!type) {
        analysisType = type;
    }
}

export function testPinboards(sleepInSeconds, index, type) {
    init(sleepInSeconds, index, type);
    logger.warn('Performing A3 Analysis on Pinboards');
    getPinboards();
}

export function testAnswers(sleepInSeconds, index, type) {
    init(sleepInSeconds, index, type);
    logger.warn('Performing A3 Analysis on Answers');
    getAnswers();
}

export function testAll(sleepInSeconds, index, type) {
    init(sleepInSeconds, index, type);
    logger.warn('Performing A3 Analysis on both Pinboards and Answers');
    getPinboards();
    getAnswers();
}

function getPinboards() {
    return new PinboardListController(noop, processMetadataList);
}

function getAnswers() {
    return new AnswerListController(noop, processMetadataList);
}

function processMetadataList() {
    let metadataList = this.getData();
    let self = this;

    let lastPromise = $q.when();
    metadataList.forEach((metadata) => {
        lastPromise = lastPromise.then(() => {
            return processMetadata(self.metadataType, metadata.id);
        });
    });

    lastPromise.then(() => {
        if (!!this.listModel.hasNextPage()) {
            this.listModel.onNextClick();
        }
    }, () => {
        logger.warn('Failed to process the last visualization analysis of type: ' +  analysisType);
    });
}

function processMetadata(type, id) : IPromise<any> {
    logger.warn('Fetching ' + type + ':' + id);
    let documentLoader = new DocumentLoader(noop, true);
    return documentLoader.loadDocument(
        id,
        type,
        false
    ).then(function (metadataModel) {
        logger.warn('Fetched ' + type + ':' + metadataModel.getId());
        let vizMap = metadataModel.getCurrentAnswerSheet().getVisualizations();
        let lastPromise: IPromise<any> = $q.when();
        if (!!vizMap) {
            let visualizations = Object.values(vizMap);
            visualizations.forEach(viz => {

                // Increase the current index of viz processing
                currentIndex++;

                // If current index is less than specified start index, skip.
                if (startIndex >= 0 && currentIndex < startIndex) {
                    logger.warn('Processing Index: ' + currentIndex
                        + ' < startIndex: ' + startIndex);
                    return lastPromise;
                }
                logger.warn('Processing Index: ' + currentIndex);
                lastPromise = lastPromise.then(() => {
                    return sleep(sleepMilliSeconds).then(() => {
                        logger.warn('done sleeping. moving on to next index: ' + currentIndex);
                        return triggerAnanlysis(
                            type,
                            metadataModel.getId(),
                            viz);
                    });
                });
            });
        }
        return lastPromise;

    }, () => {
        logger.error('Fetched pinboard failed.');
        return $q.reject();
    });
}

function fetchDataAndTriggerAnalysis(type, id, viz) : IPromise<any> {
    logger.warn('processing  data analysis');
    return fetchData(viz.getId(),
        viz.getReferencedVisualization(),
        viz.getContainingAnswerModel(),
        null,
        false)
        .then(() => {
                let selectedData = [];
                let columns = viz.getReferencedVisualization().getVizColumns();

                if (columns.length < 2) {
                    return;
                }

                let twoData = viz.getReferencedVisualization().getVizData().data.slice(0, 2);

                if (twoData.length < 2) {
                    return;
                }

                let row1 = new tsProto.callosum.DataRow();
                let row2 = new tsProto.callosum.DataRow();

                columns.forEach((column, index) => {
                    let type = column.getEffectiveDataType();
                    let value1 = util.getConstantValue(twoData[0][index], type);
                    let value2 = util.getConstantValue(twoData[1][index], type);

                    row1.getDataValue().push(value1);
                    row2.getDataValue().push(value2);
                });

                selectedData.push(row1);
                selectedData.push(row2);

                return triggerDataAnalysis(
                    viz,
                    viz.getReferencedVisualization().getVizColumns(),
                    selectedData,
                    []
                );
            },
            (error) => {
                logger.warn('failed to fetch data' + error);
            });
}

function triggerAnanlysis(type, id, viz) : IPromise<any> {
    let vizModel = viz;
    if (type === jsonConstants.metadataType.PINBOARD_ANSWER_BOOK) {
        vizModel = viz.getReferencedVisualization();
    }

    if (!vizModel || vizModel.getVizType() === ''
        || vizModel.getVizType() === blinkConstants.vizTypes.FILTER) {
        logger.warn('Processing skipped ' + type + ':' + id
            + ' vizId:' + vizModel.getId() + ' name: ' + vizModel.getName()
            + ' vizType:' + vizModel.getVizType());
        return;
    }
    logger.warn('Processing ' + type + ':' + id
        + ' vizId:' + vizModel.getId() + ' name: ' + vizModel.getName()
        + ' vizType:' + vizModel.getVizType());

    if (analysisType === 'data') {
        return fetchDataAndTriggerAnalysis(type, id, viz);
    }

    return triggerVisualizationAnalysis(vizModel);
}

function sleep (time) {
    logger.warn('sleeping for ms ' + time);
    return new Promise((resolve) => setTimeout(resolve, time));
}



