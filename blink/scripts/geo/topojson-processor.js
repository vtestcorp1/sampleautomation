var unidecode = require('unidecode');
var optimist = require('optimist');
var fs = require('fs');

function normalizeAccentedNames(argv, topoJson) {
    var JSONPath = require('JSONPath');

    var objectsPath = argv.o;
    if (!objectsPath) {
        console.log('path to objects array is required for action', argv.a);
        console.log(optimist.help());
        return;
    }
    var objects = JSONPath.eval(topoJson, objectsPath)[0];
    objects.forEach(function(object){
        var properties = object.properties;
        if (!properties) {
            return;
        }

        var unaccentedProperties = properties.unaccented;
        if (!unaccentedProperties) {
            unaccentedProperties = properties.unaccented = {};
        }
        Object.keys(properties).forEach(function (key) {
            var value = properties[key];
            if (typeof value != 'string') {
                return;
            }

            var unaccentedValue = unidecode(value);
            if (unaccentedValue !== value) {
                unaccentedProperties[key] = unaccentedValue;
            }
        });
    });
}

function importCoordinateData(destJson, sourceJson, destPropField, sourcePropField) {
    var propValueToGeometryMap = {};

    for (var index in sourceJson.features) {
        var feature = sourceJson.features[index];
        propValueToGeometryMap[feature.properties[sourcePropField]] = feature.geometry;
    }

    for (var index in destJson.features) {
        var feature = destJson.features[index];
        feature.geometry = propValueToGeometryMap[feature.properties[destPropField]];
    }
}


function main() {
    var argv = optimist
        .options('f', {
            alias : 'file',
            describe : 'path to geoJSON/topoJSON file'
        })
        .options('a', {
            alias: 'action',
            describe: 'action to take on the file'
        })
        .options('o', {
            alias: 'objects-path',
            describe: 'path to the json node where the objects are, e.g. \'objects.countries.geometries\''
        })
        .options('sf', {
            alias: 'sourceFile',
            describe: 'When action type is \'IMPORT_COORDINATE_DATA\', path of the geoJSON file to pull the ' +
                    'cordinates from'
        })
        .options('spf', {
            alias: 'sourcePropField',
            describe: 'Name of the feature property in the source file that will be used to match that feature in the destination file'
        })
        .options('dpf', {
            alias: 'destPropField',
            describe: 'Name of the feature property in the destination file that will be used to match that feature in the source file'
        })
        .demand(['f', 'a'])
        .argv;

    var filePath = argv.f,
        action = argv.a;

    var json = JSON.parse(fs.readFileSync(filePath));
    switch (action) {
        case 'NORMALIZE_ACCENTED_NAMES':
            normalizeAccentedNames(argv, json);
            break;
        case 'IMPORT_COORDINATE_DATA':
            var sourceJson = JSON.parse(fs.readFileSync(argv.sourceFile));
            importCoordinateData(json, sourceJson, argv.destPropField, argv.sourcePropField);
            break;
        default:
            console.log('unsupported action', action);
            argv.help();
            return;
    }

    fs.writeFileSync(filePath, JSON.stringify(json));
}

main();