/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview:   Generates the string resource files for all supported
 *                  locales.
 *                  All generated modules are stored in app/resources/strings
 *
 *                  Assumes the current working directory for the program is
 *                  GIT_ROOT/blink/.
 */

var po2json = require('po2json');
var doParse = require('dataobject-parser');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var sprintf = require('sprintf-js').sprintf;
var util = require('util');
var async = require('async');
var mkdirp = require('mkdirp');

var srcTranslationFilePattern = '../common/localization/translations/strings-*.po';
var srcResourceFile = '../common/localization/strings.po';
var targetStringsResourceDir = 'app/resources/strings/';
var targetTranslationsDir = 'app/resources/strings/translations';
var targetJSModuleTemplate = `System.register([], function(_exports) {
    var translations = %s;
    return {
        setters: [],
        execute: function() {
            _exports("translations", translations);
        }
    }
});`;
var typescriptTemplate = `//Auto-generated, Tinkering is forbidden and useless

export const translations = %s;`;

var translationFiles = glob.sync(srcTranslationFilePattern);

module.exports = function (suffix, done) {

    var suffix = suffix || '';

    async.waterfall([
        parseResourceFile,
        createTSResource,
        createTranslationResources
    ], done);

    function parseResourceFile(cb) {
        po2json.parseFile(srcResourceFile, {pretty: true}, cb);
    }

    function createTSResource(referenceData, cb) {
        var nestedTargetObject = getNestedTargetPayload(referenceData);
        var resourceName = path.basename(srcResourceFile, '.po');
        var targetModuleName = path.join(targetStringsResourceDir, resourceName + '.ts');
        writeResource(targetModuleName, typescriptTemplate, nestedTargetObject, function(err) {
            cb(err, referenceData);
        });
    }

    function createTranslationResources(referenceData, callback) {
        async.each(translationFiles, function(fileName, cb) {
            po2json.parseFile(fileName, {pretty: true}, function(err, jsonData) {
                if(err) {
                    console.log('Could not parse translation file', fileName, err);
                    cb(err);
                    return;
                }
                var translations = Object.assign({}, referenceData, jsonData);
                createJSResource(fileName, translations, cb);
            });
        }, callback);
    }

    function createJSResource(fileName, jsonData, cb) {
        var nestedTargetObject = getNestedTargetPayload(jsonData);
        var resourceName = path.basename(fileName, '.po');
        var resourceTargetName = (!!suffix) ? [resourceName, suffix].join('.') : resourceName;
        var targetModuleName = path.join(targetTranslationsDir, resourceTargetName + '.js');
        writeResource(targetModuleName, targetJSModuleTemplate, nestedTargetObject, cb);
    }

    function getNestedTargetPayload(jsonData) {
        var flatTargetObject = Object.keys(jsonData).reduce(function(target, key) {
            target[key] = jsonData[key][1];
            return target;
        }, {});

        return doParse.transpose(flatTargetObject).data();
    }

    function writeResource(fileName, template, payload, cb) {
        var fileBuffer = sprintf(template, JSON.stringify(payload, null, '      '));
        mkdirp(path.dirname(fileName), (err) => {
            if(err) {
                console.log(err);
                return;
            }
            fs.writeFile(path.resolve(fileName), fileBuffer, {
                encoding: 'utf-8',
                flag: 'w'
            }, cb);
        });
    }
};