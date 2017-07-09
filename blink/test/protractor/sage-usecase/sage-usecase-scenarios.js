/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Marco Alban (marco.albanhidalgo@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var answer = require('../scenarios/viz-layout/answer/answer.js');
var common = require('../scenarios/common.js');
var leftPanel = require('../scenarios/sage/data-panel/data-panel.js');
var fs = require('fs');
var sage = require('../scenarios/sage/sage.js');
var util = common.util;
var navigation = common.navigation;

function MaybeSelectAllType(sources) {
    sources.forEach(function(source) {
        if (source.type == 'ALL') {
            leftPanel.selectAllSources();
        }
        if (source.type == 'ALL_TABLE') {
            leftPanel.selectAllTables();
        }
        if (source.type == 'ALL_WORKSHEET') {
            leftPanel.selectAllWorksheets();
        }
    });
}

function SetDataScope(scope) {
    navigation.goToHome();
    navigation.goToQuestionSection();
    leftPanel.deselectAllSources();
    if (scope) {
        MaybeSelectAllType(scope.source);
        var sourceNames = scope.source.filter(function(source) {
            return !!source.name;
        }).map(function(source) {
            return source.name;
        });
        leftPanel.openAndChooseSources(sourceNames);
    }
    leftPanel.clickDone();
    return util.waitForElement(sage.locators.SAGE_INPUT);
}

function ApplySageBarInput(interaction) {
    console.log(`Applying interaction ${JSON.stringify(interaction)}`);
    var newToken = interaction.sageBarInput.token;
    var fullSageInput;
    return  sage.sageInputElement.append(newToken)
            .then(function() {
                return sage.sageInputElement.getCurrentInput();
            })
            .then(function(inputText) {
                fullSageInput = inputText;
            })
            .then(function() {
                var disambiguation = interaction.sageBarInput.disambiguation;
                if(!disambiguation) {
                    return answer.waitForAnswerWithQuery(fullSageInput);
                }
                var lineage;
                if (disambiguation.typeEnum === 'VALUE') {
                    lineage = disambiguation.columnName + ' in ' + disambiguation.tableName;
                }
                else {
                    lineage = 'in ' +disambiguation.tableName;
                }
                console.log(`Applying drop-down choice: ${disambiguation.token} ${lineage}`);
                sage.selectSageDropdownItem(disambiguation.token, lineage);
                return answer.waitForAnswerWithQuery(fullSageInput);
            });
}

function OpenAndReplaySavedAnswerById(id) {
    return navigation.goToInAppPath(`#/saved-answer/${id}`)
        .then(function () {
            return answer.waitForAnswerToLoad();
        });
}

function ApplySavedAnswer(interaction) {
    var savedAnswer = interaction.savedAnswer;
    if (!!savedAnswer.type && savedAnswer.type == 'BY_ID') {
        return OpenAndReplaySavedAnswerById(savedAnswer.refKey);
    }
}

function ApplyFormulaInteraction(interaction) {
}

function ApplyInteraction(interaction) {
    if (interaction.sageBarInput) {
        return ApplySageBarInput(interaction);
    }
    else if (interaction.formulaInteraction) {
        return ApplyFormulaInteraction(interaction);
    }
    else if (interaction.savedAnswer) {
        return ApplySavedAnswer(interaction);
    }
}

describe('Sage usecase', function() {
    if (!browser.params.useCaseSpec) {
        console.log("Sage usecase requires a usecase spec.");
        return;
    }
    var useCaseSpecProto = JSON.parse(
        fs.readFileSync(browser.params.useCaseSpec, 'utf-8'));
    var sequence = util.login();
    useCaseSpecProto.usecase.forEach(function(usecase) {
        var nTimes = 1;
        if (!!usecase.times) {
            nTimes = usecase.times;
        }
        for (var i = 0; i < nTimes; i++) {
            sequence = sequence.then(function() {
                return SetDataScope(usecase.scope);
            });
            usecase.interaction.forEach(function(interaction) {
                sequence = sequence.then(function(res) {
                    return ApplyInteraction(interaction);
                });
            });
        }
    });
});
