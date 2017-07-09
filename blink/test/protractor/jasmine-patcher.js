"use strict";

var BASE_SCENARIO_PATH = 'blink/test/protractor';

function findSpecFile() {
    var error = new Error(),
        stackElements = error.stack.trim().split('/'),
        specFilename = '',
        unknownName = 'unknown', found = false;
    var basePath = BASE_SCENARIO_PATH;

    var scenariosIndex = stackElements.lastIndexOf('protractor');
    if (scenariosIndex === -1) {
        return unknownName;
    }
    for (var j = scenariosIndex + 1; j < stackElements.length, (!found); j++) {
        var splitted = stackElements[j].split(':');
        if (splitted.length > 1) {
            specFilename = basePath + '/' + splitted[0];
            found = true;
        }
        basePath = basePath + '/' + stackElements[j];
    }

    return found ? specFilename : unknownName;
}

function describeFactory(describe) {
    return function jasmineTimeReporterIt(description, specDefinitions) {
        const suite = describe(description, specDefinitions);
        suite.result._filename = findSpecFile();
        return suite;
    };
}

function patchJasmine(jasmineEnv) {
    jasmineEnv.describe = describeFactory(jasmineEnv.describe);
    jasmineEnv.fdescribe = describeFactory(jasmineEnv.fdescribe);
    jasmineEnv.xdescribe = describeFactory(jasmineEnv.xdescribe);
}

module.exports = {
    patchJasmine: patchJasmine
};
