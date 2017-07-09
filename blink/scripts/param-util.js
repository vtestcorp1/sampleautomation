/**
 * This util provides ability to get params parsed as an object.
 *
 * Any thing in args starting with '--' is considered a param.
 * We supported the following cases
 * --key, value as params, case where the = is already split
 * --key=value
 * --key, case where there is no value.
 */

"use strict";

function insertKey(obj, key, val) {
    var insertObj = obj;
    key = key.replace('--', '');
    var keyMap = key.split('.');
    var value = (val && val.indexOf(',') > -1) ? val.split(',') : val;
    var depth = keyMap.length;
    keyMap.forEach(function(key, idx) {
        if (idx === depth - 1) {
            insertObj[key] = value;
        } else {
            if (!insertObj[key]) {
                insertObj[key] = {};
            }
            insertObj = insertObj[key]
        }
    });
}

function getArguments() {
    var args = {};
    var inputArgs = process.argv;

    for (var i = 0; i < inputArgs.length; ++i) {
        var arg = inputArgs[i];
        if (!arg.startsWith('--')) {
            console.log('Skipping argument, not a parameter', arg);
            continue;
        }
        var kv = arg.split('=');
        if (kv.length === 2) {
            // Case 1: param read as key=value
            var key = kv[0];
            var value = kv[1];
            insertKey(args, key, value);
        } else if (inputArgs[i+1] && !inputArgs[i+1].startsWith('--')) {
            // Case 2 key and value are already split and there is still a valid value
            var key = arg;
            var value = inputArgs[i+1];
            insertKey(args, key, value);
            ++i;
        } else {
            // Case 3 key without any passed in value
            var key = arg;
            insertKey(args, key, void 0);
        }
    }

    console.log('=======================Arguments=======================');
    console.log(args);
    return args;
}

module.exports = {
    getArguments: getArguments
};
