/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Alert messages and enums
 */

'use strict';

blink.app.factory('alertConstants', function () {
    var alertConstants = {
        alert: {
            API_ERROR: 'Error getting data from server!',

            INVALID_DATA_IN_WORKSHEET: 'This worksheet is not accessible because the underlying data has been deleted.',

            SUCCESS_UPDATING_EXPOSED_PREFERENCES: 'Preferences have been updated.',
            FAILURE_UPDATING_EXPOSED_PREFERENCES: 'Preferences could not be updated.',

            SERVER_UNREACHABLE_COUNTDOWN: 'Thoughtspot unreachable. Retrying in {0} seconds.',
            SERVER_UNREACHABLE_CONNECTING: 'Thoughtspot unreachable. Connecting...',
            SERVER_UNREACHABLE_RETRY_TIMEOUT: 'Thoughtspot unreachable. Try connecting later or',

            TRY_NOW: 'Try now',
            UNDO: 'Undo',
            WE_ARE_BACK: 'We\'re back!',
            FAILURE: 'Error occured.',

            // Admin Related - User and Group - TODO(Vijay) templatize repeated message patterns

            PICTURE_FILE_TOO_BIG: 'File too large',

            GROUP_DELETE_DIALOG_TITLE: 'Confirm delete',
            GROUP_DELETE_DIALOG_MESSAGE_SINGULAR: 'Are you sure you want to delete group {1}?',
            GROUP_DELETE_DIALOG_MESSAGE_PLURAL: 'Are you sure you want to delete groups?',
            USER_DELETE_DIALOG_TITLE: 'Confirm delete',
            USER_DELETE_DIALOG_MESSAGE_SINGULAR: 'Are you sure you want to delete user {1}?',
            USER_DELETE_DIALOG_MESSAGE_PLURAL: 'Are you sure you want to delete users?',
            ROLE_DELETE_DIALOG_TITLE: 'Confirm delete',
            ROLE_DELETE_DIALOG_MESSAGE_SINGULAR: 'Are you sure you want to delete role {1}?',
            ROLE_DELETE_DIALOG_MESSAGE_PLURAL: 'Are you sure you want to delete roles?',

            PARTIAL_TABLE_DOWNLOAD_COMPLETE: 'Too many rows. A sample of about 50,000 rows provided.',
            TABLE_DOWNLOAD_COMPLETE: 'Table downloaded.',

            FAILED_TO_BUILD_SEARCH_RESULT: 'Failed to build search result.',
            AD_HOC_TRANSFORMATION_FAILED: 'Ad Hoc Transformation Failed.',
            dataDeletionAlertMessages: {
                cannotDelete: 'Deletion not allowed',
                confirmDelete: 'Confirm Delete',
                confirmBtnLabel: 'Delete',
                withoutContent: {
                    singular: 'Really delete "{itemName}" ?',
                    plural: 'Really delete these selected {itemType}s ?'
                },
                withoutDependents: {
                    singular: 'Really delete "{itemName}" and all of its contents?',
                    plural: 'Really delete these {itemType}s and all of their contents?'
                },
                withDependents: {
                    singular: 'The following object(s) depend on "{itemName}". You must delete them to delete "{itemName}".',
                    plural: 'The following object(s) depend on these {itemType}s. You must delete them to delete these {itemType}s.'
                }
            },

            dataLoadMessages: {
                SUCCESS_CREATE_CONN: 'Connection created successfully',
                SUCCESS_CREATE_SCHEMA: "Schema creation successful",
                SUCCESS_LOAD_DATA: "Selected tables were queued for loading",
                SUCCESS_UPDATE_SCHEDULER: "Schedule updated successfully"
            },

            recoveryMessages: {
                RECOVER_OBJECT: 'Recover {1}'
            },

            dataSourceAlertMessages: {
                alertText: 'Removing {sourceText} will clear your {clearedEntityName}.',
                actionButtonText: 'OK',
                cancelButtonText: {
                    singular: 'Keep it',
                    plural: 'Keep them'
                }

            },

            statusViewer: {
                SUCCESS_RESTART: 'Selected tasks queued for restart.',
                SUCCESS_ABORT: 'Selected tasks queued to abort.'
            },

            worksheetBuilderFailedUserActions: {
                transformationFailed: '{userAction} failed due to server error.',
                userActions: {
                    addColumn: 'Column addition',
                    editJoinPath: 'Change in column mapping',
                    deleteColumn: 'Column deletion',
                    addPrefix: 'Prefixing name'
                }
            },

            sage: {
                thriftConnectionErrors: {
                    // These are lowercased because they map to the jquery.ajax() error callback parameter textStatus.
                    // http://api.jquery.com/jQuery.ajax/
                    timeout: 'Server connection timed out.',
                    error: 'Unknown connection error with server.',
                    abort: 'Server connection aborted.',
                    parsererror: 'Protocol error occurred when parsing server response.'
                },
                queryUpdates: {
                    tenSecondsMessage: 'Still working...',
                    fortySecondsMessage: 'Gosh, this is taking a long time. Will give it another 20 seconds...',
                    sixtySecondsMessage: 'Sigh. Looks like I\'ve become the bottleneck. Abandoning the search.'
                }
            },

            httpStatus: {
                NOT_AUTHORIZED: 'You are not authorized to perform this action.',
                TIMED_OUT: 'Server timed out.'
            },

            labelAlertMessages: {
                labelNameEmpty: "Empty name not allowed.",
                duplicateLabelName: "Label name already exists."
            },

            importWizardAlertMessages:  {
                //TODO(Rahul): Move these to message_codes proto
                serverErrorCodeToMessage: {
                    13005  : 'A file with the same name already exists. Please rename the file or upload a different file.',/*OBJECT_ALREADY_EXISTS*/
                    10002  : 'This file seems to be invalid. It may be empty or in an unacceptable format.',/*INVALID_INPUT*/
                    12503  : 'The data type cannot be identified from the values in this column.',/*DATA_TYPE_UNSUPPORTED*/
                    'DATE_FORMAT_INVALID'  /*12504*/: 'Can\'t assign the date format for this column. Make sure it doesn\'t contain multiple date formats or only null values',
                    'DATE_FORMAT_AMBIGUOUS'/*12505*/: 'Can\'t figure out which date format to use by looking at these values. More than one format could work here.',
                    12512  : 'This file has fewer columns than the data being updated. Please add the missing column(s) and restart the import.',/*FILE_TOO_FEW_COLUMNS */
                    12513  : 'This file has more columns than the data being updated. Please remove the extra column(s) and restart the import.'/*FILE_TOO_MANY_COLUMNS*/
                },
                NO_FILE_UPLOAD_ERROR : 'No file found! Please upload a file before proceeding.',
                NO_HEADER_QUES_ANSWERED_ERROR : 'Please complete the option highlighted in red before continuing.',
                INVALID_COL_NAMES_ERROR : 'Please update the invalid columns highlighted in red before continuing. ' +
                'Column names must be non-empty and unique.',
                EMPTY_COL_TYPES_ERROR : 'Please specify the type for each column highlighted in red before continuing.',
                INVALID_COL_TYPES_ERROR : 'Inconsistencies between the column data and its type have been detected. ' +
                'Change the column type or modify the data to be uploaded before continuing.',
                INVALID_COL_DATA_ERROR : 'Please hover over the cells marked in red to view more details. You may make changes to ' +
                'the data and restart the import. If you choose to continue the erroneous rows will be excluded.',
                IRRECOVERABLE_ERROR : 'Irrecoverable errors found. Please start again.',
                MISSING_COLUMN_IN_ROW : 'This row does not have any values for this column.'
            },

            // This mapping is used in api.js to show specific error notifications for certain callosum error codes
            callosumErrorMessages: {
                NO_JOIN_PATH: 'Unable to join tables.',
                OBJECT_NOT_FOUND: 'Object not found.',
                NO_DATA: 'No data found.',
                SAGE_INVALID_QUESTION: 'Question has inconsistencies.',
                RESOURCE_EXCEEDED: 'Woah, there! This search is too big for me. Try adding a filter.',
                CYCLIC_RELATIONSHIP: 'Cannot create this link because it conflicts with an existing link.'
            },

            leftPanel: {
                COLUMN_ADDITION_NOT_ALLOWED: 'We are sorry. Column addition is not allowed',
                TOO_MANY_COLUMNS: 'You\'ve hit the limit for maximum number of columns.',
                COMPLEX_QUERY: 'You are using a complex query that can only be edited in search bar.'
            },

            createSchema: {
                FAILED_TO_EXECUTE: 'Some commands failed to execute, please check them and continue.',
                LOAD_SUCCESSFULL: '{1} commands loaded successfully.',
                EXECUTION_SUCCESSFUL: 'All commands executed successfully.'
            },

            alertMessageDownloadTrace: '<u><b>First the bad news:</b></u><br> There was a problem somewhere. <br>'
            + '<u><b>Now the good news:</b></u><br> If you download the trace file and email it to <b>{email}</b>. They may be able to help out.'
        },

        messageType: {
            COUNTDOWN: 'countdown'
        },

        type: {
            PROBLEM: 'problem',
            ERROR: 'error',
            SUCCESS: 'success'
        },

        documentType: {
            ANSWER: 'answer',
            WORKSHEET: 'worksheet',
            PINBOARD: 'pinboard'
        }
    };

    alertConstants.messageCodeToType = {
        0: alertConstants.type.SUCCESS,
        1: alertConstants.type.PROBLEM,
        2: alertConstants.type.ERROR
    };

    return alertConstants;
});
