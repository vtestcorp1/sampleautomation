/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Service for the Create Schema component
 */

'use strict';

blink.app.factory('createSchemaService', ['$q',
    'blinkConstants',
    'strings',
    'Command',
    function($q,
         blinkConstants,
         strings,
         Command) {

        var AnnotationTypes = {
            ERROR: 'error',
            WARNING: 'warning'
        };

        var QueryStatus = {
            SUCCESS: 'success',
            FAILURE: 'failure',
            PENDING: 'pending'
        };

        function parseErrorMessage(message) {
            var ERROR_LINE_NUMBER_RX = /error at line=(.*)\n/g;
            var ERROR_MSG_RX = /(msg|message)(\s)*=(\s)*(.*)(,|\.)/g;

            var row = ERROR_LINE_NUMBER_RX.exec(message);
            var text = ERROR_MSG_RX.exec(message);

            row = row && row[1];
            text = text && text[4];

            if(row !== null) {
                return {
                    row: row - 1,
                    column: 1,
                    text: text || strings.createSchema.UNKNOWN_ERROR,
                    type: AnnotationTypes.WARNING
                };
            }

            return {
                row: 0,
                column: 1,
                text: text || strings.createSchema.UNKNOWN_ERROR,
                type: AnnotationTypes.WARNING
            };

        }

        function executeSql(queries, context) {
            var commands = queries.map(function(query) {
                return query.command;
            });
            var command = new Command()
            .setPath('/falcon/executeddl')
            .setPostParams({
                ddlstatements: JSON.stringify(commands),
                initialcontext: JSON.stringify(context) || ""
            })
            .setPostMethod();

            return command.execute();
        }

        function parseSql(queryText) {
            var queryStrings = queryText.split('\n').map(function(q) {
                return q + '\n';
            });

            var command = new Command()
            .setPath('/falcon/parsesql')
            .setPostParams({
                sqlstatements: JSON.stringify(queryStrings)
            })
            .setPostMethod();

            return command.execute().
            then(function(results) {
                return results.data.map(function(result,idx) {
                    return {
                        command: result.sql,
                        status: QueryStatus.PENDING,
                        id: idx
                    };
                });
            });
        }

        return {
            executeSql: executeSql,
            parseSql: parseSql,
            parseErrorMessage: parseErrorMessage,
            QueryStatus: QueryStatus
        };

    }]);
