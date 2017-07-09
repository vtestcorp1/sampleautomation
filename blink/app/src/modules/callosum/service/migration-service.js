/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Vishwas B Sharma (vishwas.sharma@thoughtspot.com)
 *
 * @fileoverview This service is used to make all /migration network calls.
 */

'use strict';

blink.app.factory('migrationService', ['$q',
    'Command',
    function ($q,
          Command) {
    /**
     * Export metadata objects.
     *
     * @param {string} exportUrl        Destination URL to export the objects to.
     * @param {string} type             Type of object being exported.
     * @param {array} ids               Object ids.
     * @param {array} tagNames          Tag names applied on objects.
     */
        function exportObjects (exportUrl, type, ids, tagNames) {
            var command = new Command()
            .setPath('/migration/exportobjects')
            .setPostMethod()
            .setPostParams({
                url: exportUrl,
                type: type,
                ids: JSON.stringify(ids),
                tagnames: JSON.stringify(tagNames)
            });
            return command.execute();
        }

    /**
     * Import metadata objects.
     *
     * @param {string} type             Type of object being imported.
     * @param {string} filePath         Complete path to file that we intend to import.
     */
        function importObjects (type, filePath) {
            var command = new Command()
            .setPath('/migration/importobjects')
            .setGetParams({
                type: type,
                filepath: filePath
            });
            return command.execute();
        }

        return {
            exportObjects: exportObjects,
            importObjects: importObjects
        };
    }]);
