// Copyright: ThoughtSpot Inc. 2013
// Author: Satyam Shekhar (satyam@thoughtspot.com)
//
// Compiles all the needed proto and thrift files for Blink using
// our scons build system.  All generated files are stored in
// outDir (passed as an argument).
//
// This library assumes that the current working directory for the program is
// GIT_ROOT/blink/.

var fs = require('fs');
var os = require('os');
var child_process = require('child_process');

// List of proto files to be compiled.
var PROTO_FILES = [ '../net/rpc/info.proto',
                    '../net/trace/trace.proto',
                    '../net/trace/trace_vault.proto',
                    '../sage/public/auto_complete.proto',
                    '../sage/a3/public/sage_a3_interface.proto',
                    '../orion/timely/job.proto',
                    '../orion/timely/job_manager_interface.proto',
                    '../callosum/public/public_enums.proto',
                    '../blink/app/src/modules/user-workflow-manager/workflow-trace-info.proto',
                    '../callosum/client/preference.proto'];

// List of thrift files to be compiled.
var THRIFT_FILES = [ '../thrift/AutoCompleteV2.thrift',
                     '../net/rpc/thrift_common.thrift' ];
// Thrift compiler to use.
var THRIFT_BIN = {
    linux: '/usr/local/scaligent/toolchain/local/bin/thrift',
    darwin: {
        11: './scripts/thrift_osx_11',
        12: './scripts/thrift_osx_12'
    }
};
// Proto compiler to use.
var PROTO_BIN = 'node ./node_modules/protobufjs/bin/pbjs';

// Returns the path to Thrift compiler based on the machine specification this
// script is run on.
function getThriftBinPath() {
    var osPlatform = os.platform(),
        osRelease = parseInt(os.release()),
        thriftPath;
    // Use the darwin 12 version for all upcoming versions
    if (osRelease > 12) {
        osRelease = 12;
    }
    if (osPlatform == 'darwin') {
        thriftPath = THRIFT_BIN.darwin[osRelease];
    } else if (osPlatform == 'linux') {
        thriftPath = THRIFT_BIN.linux;
    }

    return thriftPath;
}

// Compiles are thrift files in @THRIFT_FILES and stores the generated files in
// outDir
var compileThrift = function (outDir) {
    var bin = getThriftBinPath();
    var cmd = bin + " -I ../" + " -out " + outDir + " -gen js:jquery ";
    THRIFT_FILES.forEach(function (file) {
        console.log("Running " + cmd + file);
        child_process.execSync(cmd + file);
    });
};

// Compiles are proto files in @PROTO_FILES and stores the generated files in
// outDir
var compileProto = function(outDir) {
    var cmd = PROTO_BIN + ' -p ../ ' + PROTO_FILES.join(' ') +
            ' -t js ' + ' > ' + outDir + 'ts-proto.js';
    console.log("Running " + cmd);
    child_process.execSync(cmd);
    cmd = PROTO_BIN + ' -p ../ ' + PROTO_FILES.join(' ') +
        ' -t commonjs ' + ' > ' + outDir + 'ts-proto-node.js';
    console.log("Running " + cmd);
    child_process.execSync(cmd);

};

// Method exported by this module to generates all proto and thrift
// dependencies.
var generateSources = function(outDir) {
    // If output directory does not exist, create it.
    try {
        fs.accessSync(outDir, fs.F_OK);
    } catch(e) {
        fs.mkdirSync(outDir);
    }
    compileThrift(outDir);
    compileProto(outDir);
};

module.exports = {
    generateSources: generateSources
};
