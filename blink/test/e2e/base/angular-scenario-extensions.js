/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Extensions to Angular scenario runner
 */

'use strict';

// Save the original 'it' definition since we are going to override that and reference the original implementations.
angular.scenario.Describe.prototype._it = angular.scenario.Describe.prototype.it;

angular.scenario.Describe.prototype.iit = function(name, body) {
    this._it.apply(this, arguments);
    this.its[this.its.length-1].only = true;
};


var TestTypes = {
    SMOKE: 'SMOKE',
    FULL: 'FULL',
    RELEASE: 'RELEASE',
    WORKFLOW: 'WORKFLOW'
};

/* global testEnv */
var mode = testEnv && testEnv.mode || TestTypes.SMOKE;
var testCaseFilter = testEnv && testEnv.testCaseFilter || '';
var regex = testCaseFilter && new RegExp(testCaseFilter, 'g') || null;

function getTestName() {
    var error = new Error(),
        source,
        lastStackFrameRegex = new RegExp(/test\/([^?]+).*:\d+(:\d+)*$/),
        currentStackFrameRegex = new RegExp(/getTestName \(test\/([^?]+).*:\d+:\d+\)/);

    var stack = error.stack.trim();
    if ((source = lastStackFrameRegex.exec(stack))) {
        return source[1];
    } else if ((source = currentStackFrameRegex.exec(stack))) {
        return source[1];
    } else if(error.fileName !== undefined) {
        return error.fileName;
    }
    return "unknown";
}

// Override the default angular scenario 'it' so that if any test name is annotated with [SMOKE] string as prefix to
// the name, we can limit the test run to only those tests.
//
// User can specify --test-mode=SMOKE|FULL|RELEASE on grunt commandline to control the set of tests to run.
angular.scenario.Describe.prototype.it = function (name, body) {
    name = name + ' [' + getTestName() + ']';
    var isSmokeTest = false,
        inFullMode = false,
        inReleaseMode = false,
        isReleaseTest = false,
        inWorkflowMode = false;

    if (!!regex) {
        if (regex.test(name)) {
            // Add to the queue.
            this._it(name, body);
        }
        return;
    }

    if (mode == TestTypes.FULL) {
        inFullMode = true;
    }
    if (mode == TestTypes.WORKFLOW) {
        inWorkflowMode = true;
    }
    if (mode == TestTypes.RELEASE) {
        inReleaseMode = true;
    }

    name = name.trimLeft();

    if (name.startsWith('[SMOKE]')) {
        isSmokeTest = true;
    }

    if (name.startsWith('[RELEASE]')) {
        isReleaseTest = true;
    }

    if (inReleaseMode && !isReleaseTest) {
        // If we are in release mode and this is not a release test, ignore it and don't add to the queue.
        return;
    }

    if (!inReleaseMode && !inFullMode && !inWorkflowMode && !isSmokeTest) {
        // If we are not running tests in FULL mode and this is not a smoke test, ignore it and don't add to the queue.
        return;
    }

    if (isSmokeTest) {
        name = name.remove('[SMOKE]');  // note not removing with /g.
    }

    if (isReleaseTest) {
        name = name.remove('[RELEASE]');
    }
    // Add to the queue.
    this._it(name, body);
};

// Override default xit(), let it increase specId counter,
// so we have a way to account for disabled (skipped) tests
//
// Override is done directly on window object because we don't
// have any entry point for overrides between
// angular.scenario.Runner definition and invocation (it's hidden
// inside anonymous function scope in angular-scenario.js
window.xit = function () {
    angular.scenario.Describe.specId++;
};

// Override default xdescribe(), let it increase specId counter.
// This is not a 100% correct way to account for disabled tests inside xdescribe,
// as there's no way to determine how many it/xit calls inside a block,
// but at least we can count 1 for one xdescribe.
window.xdescribe = function () {
    angular.scenario.Describe.specId++;
};

// Following disabled suite describes the usage.
/* global xdescribe */
xdescribe('Not a test suite', function () {
    it('[SMOKE] should always run', function () {
    });
    it('should only run in FULL mode', function () {
    });
});
// Decrease the counter, so we do not account for
// this test call as for a real test being skipped
angular.scenario.Describe.specId--;
