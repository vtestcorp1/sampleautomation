/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Controller for the Create Schema component
 *
 * We have two modes here:
 * 1. uploadSqlMode: Here an upload box is shown, where users could upload their sql
 * 2. queryEditMode: Once the sql is uploaded, users can see this editing mode.
 */

'use strict';

blink.app.controller('CreateSchemaController', ['$scope',
    '$q',
    'alertService',
    'blinkConstants',
    'strings',
    'createSchemaService',
    'Logger',
    'navService',
    'UserAction',
    'util',
    function($scope,
         $q,
         alertService,
         blinkConstants,
         strings,
         createSchemaService,
         Logger,
         navService,
         UserAction,
         util) {

    /* Globals */
        var EDITOR_FONT_SIZE = 14;

    // to hold a reference to ace editor object.
        var editor;

    // whether to show the busy status in the Execute button.
        var isExecuting = false;
    // The current sql statement being executed
        var executionIndex = 0;
    // The context for the currently being executed statement.
        var executionContext;
    // idx for the next inserted query (serial)
        var nextIdx = 0;

        var _logger = Logger.create('create-schema-controller');

    // The mode, uploadSql or editSql
        $scope.isUploadSqlMode = true;

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;

        $scope.searchText = {
            value: ''
        };

    /**
        Annotate errors in the ace editor.
     */
        function annotateErrors() {
            editor.getSession().setAnnotations([
                $scope.expandedQueryItem.error
            ]);
        }

    // -------- UI Methods ------------

    /**
     * @param _editor The supplied ace editor API object.
     */
        $scope.editorLoaded = function (_editor) {
        // Required to suppress ACE warnings.
            _editor.$blockScrolling = Infinity;

            editor = _editor;
            editor.setFontSize(EDITOR_FONT_SIZE);
            editor.focus();

            if($scope.expandedQueryItem.status === createSchemaService.QueryStatus.SUCCESS) {
                editor.setReadOnly(true);
            }

            registerKeyEvents(editor);

        /**
         * This function is called after editor UI is initialzed.
         */
            function afterLoad() {
                if(!!$scope.expandedQueryItem.error) {
                    annotateErrors();
                }

                if(!!$scope.searchText.value) {
                    editor.findAll($scope.searchText.value);
                }
            }

        // Executing the afterLoad after the UI is initialized.
            util.executeInNextEventLoop(afterLoad);
        };

        $scope.textFilter = function(queryItem) {
            if(!$scope.searchText.value || queryItem.isExpanded) {
                return true;
            }
            var targetText = queryItem.command.toLowerCase();
            return targetText.indexOf($scope.searchText.value.toLowerCase()) > -1;
        };

        $scope.didQueryFail = function(queryItem) {
            return queryItem.status === createSchemaService.QueryStatus.FAILURE;
        };

        $scope.didQuerySucceed = function (queryItem) {
            return queryItem.status === createSchemaService.QueryStatus.SUCCESS;
        };

        $scope.isExecuting = function () {
            return isExecuting;
        };

        $scope.onExecuteClick = function () {
            if($scope.isUploadSqlMode) {
                return;
            }

            isExecuting = true;
            var queriesToExecute = $scope.queries.slice(executionIndex);

            var userAction = new UserAction(UserAction.EXECUTE_SQL);
            createSchemaService.executeSql(queriesToExecute, executionContext).
            then(function(response) {
                return response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            }).
            then(processSqlExecutionResult.bind(this, queriesToExecute)).
            then(showExecutionResult.bind(this, userAction)).
            finally(function() {
                isExecuting = false;
            });
        };

        $scope.reset = function() {
            $scope.isUploadSqlMode = true;
            $scope.executeBtnConfig = ExecuteBtnConfigEnum.EXECUTE;
            executionIndex = 0;
            executionContext = undefined;
            nextIdx = 0;
        };

        $scope.write = function () {
            $scope.isUploadSqlMode = false;
            var newQueryItem = {
                command: '',
                status: createSchemaService.QueryStatus.PENDING,
                id: nextIdx
            };
            $scope.queries = [newQueryItem];
            $scope.expandQueryItem(newQueryItem, nextIdx);
            nextIdx++;
        };

        $scope.insertItem = function ($event, queryItem, idx) {
            var idxToInsert = $scope.queries.indexOf(queryItem);
            idx = idx || idxToInsert;
            var newQueryItem = {
                command: '',
                id: nextIdx,
                status: createSchemaService.QueryStatus.PENDING
            };

            nextIdx++;
            $scope.queries.insert(newQueryItem, idxToInsert + 1);
            $scope.expandQueryItem(newQueryItem, idx + 1);
            $event.stopPropagation();
        };

        $scope.deleteItem = function ($event, queryItem, idx) {
            $scope.queries.remove(queryItem);
            $event.stopPropagation();
        };

        $scope.getQuerySnippet = function (queryItem) {
            return queryItem.command.substring(0,100);
        };

        $scope.canInsertQuery = function (idx) {
        // Insertion of query allowed only in the still not successfully executed
        // segment of the job.
            return idx >= executionIndex - 1;
        };

        $scope.dumpSql = function() {
            var sqlText = $scope.queries.
            map(function(query) {
                return query.command;
            }).
            join('\n');
            var blob = new Blob([sqlText], {type: "text/plain;charset=utf-8"});
            saveAs(blob, 'TS_Schema.sql');
        };

        $scope.goToTables = navService.goToTables;

    // ---------------- UI configurations -------------

        $scope.getSqlUploadConfig = function () {
            return {
                onFileLoad: onFileUpload
            };
        };

        var ExecuteBtnConfigEnum = {
            EXECUTE: {
                label: strings.createSchema.EXECUTE,
                tip: strings.createSchema.EXECUTE_TIP
            },
            CONTINUE: {
                label: strings.createSchema.CONTINUE,
                tip: strings.createSchema.CONTINUE_TIP
            }
        };

        $scope.executeBtnConfig = ExecuteBtnConfigEnum.EXECUTE;

    // ------------ Helper methods called by UI methods. ------------

        var onFileUpload = (function() {
            function displayCommands(queries) {
                $scope.queries = queries;
                nextIdx = $scope.queries.length;
                $scope.isUploadSqlMode = false;
                alertService.showAlert({
                    message:
                    strings.alert.createSchema.LOAD_SUCCESSFULL.assign(queries.length),
                    type: alertService.alertConstants.type.SUCCESS
                });
            }
            return function (evt, file) {
                var fileReader = new FileReader();

                fileReader.onload = function() {
                    var userAction = new UserAction(UserAction.PARSE_SQL);
                    createSchemaService.parseSql(fileReader.result).
                    then(function(response) {
                        return response;
                    }, function(response) {
                        alertService.showUserActionFailureAlert(userAction, response);
                        return $q.reject(response.data);
                    }).
                    then(displayCommands, function(e) {
                        alertService.showAlert({
                            message:
                            strings.alert.FAILURE_UPLOADING_FILE,
                            type: alertService.alertConstants.type.ERROR
                        });
                        _logger.error(e);
                    });
                };
                fileReader.readAsText(file);
            };
        })();

        function processSqlExecutionResult(queriesExecuted, executionResult) {
            var idx = 0;
            var results = executionResult.statuses;
            var result = results[idx];
            var q = queriesExecuted[idx];
            while(idx < queriesExecuted.length && result.status) {
                q.status = createSchemaService.QueryStatus.SUCCESS;
                executionIndex++;
                idx++;
                q = queriesExecuted[idx];
                result = results[idx];
            }

            if(idx === queriesExecuted.length) {
                return {
                    success: true,
                    queriesExecuted: queriesExecuted.length
                };
            }

            q.status = createSchemaService.QueryStatus.FAILURE;
            q.error = createSchemaService.parseErrorMessage(result.message);
            executionContext = executionResult.context;
            $scope.executeBtnConfig = ExecuteBtnConfigEnum.CONTINUE;
            if(q === $scope.expandedQueryItem) {
                annotateErrors();
            } else {
                $scope.expandQueryItem(q);
            }
            return {
                success: false,
                queriesExecuted: queriesExecuted.length
            };
        }

        function showExecutionResult(userAction, executionResult) {
            if(!executionResult.success) {
            // TODO(Ashish): Use the userAction and code to show red error bar
                return;
            }
            $scope.showConfirmationScreen = true;
        // More to be added to this
            $scope.importSchemaStats = {
                queriesExecuted: $scope.queries.length
            };
        }

        function registerKeyEvents(editor) {
            editor.commands.on("afterExec", function(e) {
                executeHandlers(e);
            });
        }

        function executeHandlers(e) {
            handlers.map(function(handler) {
                handler(e.args, e);
            });
        }

        var detectNewCommand = util.getKeySequenceDetector([';',' *','\n'], function(e) {
            $scope.insertItem(e, $scope.expandedQueryItem);
        });

        var handlers = [detectNewCommand];
    }]);
