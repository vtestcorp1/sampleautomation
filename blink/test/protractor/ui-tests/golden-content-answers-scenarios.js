/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Pavan Piratla (pavan@thoughtspot.com)
 */

'use strict';

var base = require('../base-do-not-use.js');
var fs = require('fs-extra');
var path = require('path');
/* eslint camelcase: 1, no-undef: 0 */

var savedAnswers = require('../scenarios/saved-answers/saved-answers.js');
var dataset = require('../scenarios/saved-answers/saved-answer-testdata.js');

describe('Dogfood SavedAnswers Opening scenarios', function() {
    base.forEachWithSlice(
        dataset.savedAnswerScenarios.goldenDogfoodAnswers, function(answer) {
            if (browser.params.skipExisting &&
                fs.existsSync(path.join('./verified/', answer.owner + '.txt'))) {
                console.log('Skipping ' + answer.name + ' with ' + answer.owner);
                return;
            }
            if (answer.verifyAnswerOpenable) {
                it('Verify ' +  answer.name + 'is openable', function() {
                    if (browser.params.skipExisting &&
                        fs.existsSync(path.join('./verified/', answer.owner + '.txt'))) {
                        console.log('Skipping ' + answer.name + ' with ' + answer.owner);
                        return;
                    }
                    if (savedAnswers.verifyAnswerOpenable(answer.owner, answer.name)) {
                        base.writeText(answer.name, './verified/' + answer.owner);
                    }
                });
            }
        }, browser.params.start, browser.params.end
    );
});

describe('Dogfood SavedAnswers verify TableHeaders scenarios', function() {
    base.forEachWithSlice(
        dataset.savedAnswerScenarios.goldenDogfoodAnswers, function(answer) {
            if (browser.params.skipExisting &&
                fs.existsSync(path.join('./verified_headers/', answer.owner + '.txt'))) {
                console.log('(TableHeaders) Skipping ' + answer.name + ' with ' + answer.owner);
                return;
            }
            if (answer.tableHeaders) {
                it('Verify  table headers are as expected for: ' + answer.name, function() {
                    if (browser.params.skipExisting &&
                        fs.existsSync(path.join('./verified_headers/', answer.owner + '.txt'))) {
                        console.log('(TableHeaders) Skipping ' + answer.name + ' with ' + answer.owner);
                        return;
                    }
                    savedAnswers.verifyTableHeaders(
                        answer.owner, answer.tableHeaders, answer.tableSubHeaders).then(function (retValue) {
                            if (retValue) {
                                console.log('Got Success for :' + answer.name);
                                base.writeText(answer.name, './verified_headers/' + answer.owner);
                            }
                        });
                    return;
                });
            }
        }, browser.params.start, browser.params.end
    );

});
