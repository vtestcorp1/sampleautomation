/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Utilities for the list directive and its usages.
 */

'use strict';

blink.app.factory('listUtils', ['$templateCache',
    'blinkConstants',
    'strings',
    'dateUtil',
    'jsonConstants',
    'util',
    function ($templateCache,
          blinkConstants,
          strings,
          dateUtil,
          jsonConstants,
          util) {

        var blinkStrings = strings.metadataListPage;
        var constants = blinkConstants.metadataListPage;

        var StatusEnum = {
            FAILED: 'failed',
            SUCCESS: 'success',
            INPROGRESS: 'inprogress',
            SCHEDULED: 'scheduled',
            UNKNOWN: 'unknown'
        };

        var worksheetTypes = [
            jsonConstants.metadataType.subType.WORKSHEET,
            jsonConstants.metadataType.subType.AGGR_WORKSHEET,
            jsonConstants.metadataType.subType.PRIVATE_WORKSHEET
        ];

        var statusTextToEnum = util.invertObject(StatusEnum);

        var adminColumns = {
            userNameCol: {
                label: blinkStrings.captions.NAME.toUpperCase(),
                colId: constants.listColId.NAME,
                class: constants.listColClass.NAME,
                format: function (row) {
                    return row.getName();
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.getName();
                },
                sortKey: jsonConstants.metadataTypeSort.NAME
            },
            userDisplayNameCol: {
                label: blinkStrings.captions.DISPLAYED_NAME.toUpperCase(),
                colId: constants.listColId.DISPLAYED_NAME,
                class: constants.listColClass.DISPLAYED_NAME,
                format: function (row) {
                    return row.getDisplayName();
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.getDisplayName();
                },
                sortKey: jsonConstants.metadataTypeSort.DISPLAY_NAME
            },
            userAvatarCol: {
                colId: blinkConstants.adminUI.listColId.AUTHOR,
                class: blinkConstants.adminUI.listColClass.AUTHOR,
                templateUrl: 'admin-author-column.html',
                format: function (row) {
                    return [row.getId(), row.getDisplayName()];
                },
                sortKey: null
            },
            userDateModifiedCol: {
                label: blinkStrings.captions.CREATED_AT.toUpperCase(),
                colId: constants.listColId.CREATED_AT,
                class: constants.listColClass.CREATED_AT,
                format: function (row) {
                    return row.getCreatedTimeAgo();
                },
                templateUrl: 'metadata-list-date-format.html',
                sortBy: function(row) {
                    return row.getCreatedTimestamp();
                },
                sortKey: jsonConstants.metadataTypeSort.CREATED
            }
        };

        var columns = {
            nameCol: {
                label: blinkStrings.captions.NAME.toUpperCase(),
                colId: constants.listColId.NAME,
                class: constants.listColClass.NAME,
                format: function (row) {
                    return row.name;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.name;
                },
                sortKey: jsonConstants.metadataTypeSort.NAME
            },
            displayNameCol: {
                label: blinkStrings.captions.DISPLAYED_NAME.toUpperCase(),
                colId: constants.listColId.DISPLAYED_NAME,
                class: constants.listColClass.DISPLAYED_NAME,
                format: function (row) {
                    return row.displayName;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.displayName;
                },
                sortKey: jsonConstants.metadataTypeSort.DISPLAY_NAME
            },
            descriptionCol: {
                label: blinkStrings.captions.DESCRIPTION.toUpperCase(),
                colId: constants.listColId.DESCRIPTION,
                class: constants.listColClass.DESCRIPTION,
                format: function (row) {
                    return row.description;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.description;
                },
                sortKey: null
            },
            dateModifiedCol: {
                label: blinkStrings.captions.MODIFIED.toUpperCase(),
                colId: constants.listColId.MODIFIED,
                class: constants.listColClass.MODIFIED,
                format: function (row) {
                    return dateUtil.epochToTimeAgoString(row.modified);
                },
                templateUrl: 'metadata-list-date-format.html',
                sortBy: function(row) {
                    return row.modified;
                },
                sortKey: jsonConstants.metadataTypeSort.MODIFIED
            },
            authorCol: {
                colId: constants.listColId.AUTHOR,
                class: constants.listColClass.AUTHOR,
                format: function (row) {
                    return [row.author, row.authorDisplayName];
                },
                templateUrl: 'metadata-list-author-format.html',
                sortKey: null
            },
            stickersCol: function(canDeleteStickers, removeLabel) {
                return {
                    label: blinkStrings.captions.STICKERS.toUpperCase(),
                    colId: constants.listColId.STICKERS,
                    class: constants.listColClass.STICKERS,
                    format: function (row) {
                        return [
                            row.tags,
                            canDeleteStickers(row),
                            removeLabel
                        ];
                    },
                    templateUrl: 'metadata-list-stickers-format.html',
                    sortBy: function (row) {
                        return row.tags.length;
                    }
                };
            },

        // TABLE
            sourceCol: {
                label: blinkStrings.captions.SOURCE.toUpperCase(),
                colId: constants.listColId.SOURCE,
                class: constants.listColClass.SOURCE,
                format: function(row) {
                // Should not send any source name for worksheet types.
                    if(worksheetTypes.indexOf(row.type) != -1) {
                        return '';
                    }
                    var isDefaultDataSource = row.dataSourceName === jsonConstants.DEFAULT_DATA_SOURCE;
                    var showAsImported = isDefaultDataSource && strings.dataSources[row.type] ===
                    strings.dataSources.USER_DEFINED;
                    return showAsImported?
                    strings.dataSources.USER_DEFINED :
                    row.dataSourceName;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return strings.dataSources[row.type];
                }
            },

        // DATA SOURCE
            dataSourceTypeCol: {
                label: blinkStrings.captions.DATA_SOURCE_TYPE.toUpperCase(),
                colId: constants.listColId.DATA_SOURCE_TYPE,
                class: constants.listColClass.DATA_SOURCE_TYPE,
                format: function(row) {
                    return row.statistics ? row.statistics.dataLoadStatistics.connectionDisplayName : '';
                },
                templateUrl: 'data-source-list-format.html',
                sortBy: function(row) {
                    return row.statistics ? row.statistics.dataLoadStatistics.connectionDisplayName : '';
                }
            },
            dataSourceScheduledCol: {
                label: blinkStrings.captions.DATA_SOURCE_SCHEDULED.toUpperCase(),
                colId: constants.listColId.DATA_SOURCE_SCHEDULED,
                class: constants.listColClass.DATA_SOURCE_SCHEDULED,
                format: function(row) {
                    return !!(row.statistics && row.statistics.dataLoadStatistics.scheduled)
                    ? strings.YES : strings.NO;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function (row) {
                    return !!(row.statistics && row.statistics.dataLoadStatistics.scheduled);
                }
            },
            dataSourceLoadStatusCol: {
                label: blinkStrings.captions.DATA_SOURCE_LOAD_STATUS.toUpperCase(),
                colId: constants.listColId.DATA_SOURCE_LOAD_STATUS,
                class: constants.listColClass.DATA_SOURCE_LOAD_STATUS,
                format: function(row) {
                    var ls = row.statistics && row.statistics.dataLoadStatistics;
                    var failed = 0;
                    var successful = 0;
                    var inProgress = 0;

                    if(!!ls) {
                        var statusObjList = ls.dataLoadStatusList || [];

                        angular.forEach(statusObjList, function (statusObj) {
                            if (statusObj.status == jsonConstants.lightWeightDataCache.LOAD_STATUS_SUCCESS) {
                                successful++;
                            } else if (statusObj.status == jsonConstants.lightWeightDataCache.LOAD_STATUS_FAILED) {
                                failed++;
                            } else {
                                inProgress++;
                            }
                        });
                    }

                    return [
                        successful,
                        inProgress,
                        failed
                    ];
                },
                templateUrl: 'data-source-load-status-format.html'
            },

        // STATUS VIEVER
            statusViewerStatusCol: {
                label: blinkStrings.captions.STATUS_VIEWER_LOAD_STATUS.toUpperCase(),
                colId: constants.listColId.STATUS_VIEWER_LOAD_STATUS,
                class: constants.listColClass.STATUS_VIEWER_LOAD_STATUS,
                templateUrl: 'status-format.html',
                format: function (row) {
                    var status = row.status.toLowerCase();
                    var statusText = strings.importData[statusTextToEnum[status]];
                    return [
                        status,
                        statusText
                    ];
                },
                sortBy: function(row) {
                    return row.status;
                }
            },
        //DATA FILTER
            dataFilterTableCol: {
                label: blinkStrings.captions.DATA_FILTER_TABLE.toUpperCase(),
                colId: constants.listColId.DATA_FILTER_TABLE,
                class: constants.listColClass.DATA_FILTER_TABLE,
                format: function(row) {
                    return row.values.name;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.values.name;
                }
            },
            dataFilterFieldCol: {
                label: blinkStrings.captions.DATA_FILTER_COLUMN.toUpperCase(),
                colId: constants.listColId.DATA_FILTER_COLUMN,
                class: constants.listColClass.DATA_FILTER_COLUMN,
                format: function(row) {
                    return row.values.column.name;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.values.column.name;
                }
            },
            dataFilterOptionCol: {
                label: blinkStrings.captions.DATA_FILTER_CONDITION.toUpperCase(),
                colId: constants.listColId.DATA_FILTER_CONDITION,
                class: constants.listColClass.DATA_FILTER_CONDITION,
                format: function(row) {
                    return row.values.option;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.values.option;
                }
            },
            dataFilterTextCol: {
                label: blinkStrings.captions.DATA_FILTER_TEXT.toUpperCase(),
                colId: constants.listColId.DATA_FILTER_TEXT,
                class: constants.listColClass.DATA_FILTER_TEXT,
                format: function(row) {
                    return row.values.text;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.values.text;
                }
            },
        // TRANSFORMATION EDITOR
            transformationEditorColumnCol: {
                label: blinkStrings.captions.TRANSFORMATION_EDITOR_COLUMN.toUpperCase(),
                colId: constants.listColId.TRANSFORMATION_EDITOR_COLUMN,
                class: constants.listColClass.TRANSFORMATION_EDITOR_COLUMN,
                format: function(row) {
                    return row.name;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.name;
                }
            },
            transformationEditorTableCol: {
                label: blinkStrings.captions.TRANSFORMATION_EDITOR_TABLE.toUpperCase(),
                colId: constants.listColId.TRANSFORMATION_EDITOR_TABLE,
                class: constants.listColClass.TRANSFORMATION_EDITOR_TABLE,
                format: function(row) {
                    return row.table.name;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.table.name;
                }
            },
            transformationEditorExpressionCol: {
                label: blinkStrings.captions.TRANSFORMATION_EDITOR_EXPRESSION.toUpperCase(),
                colId: constants.listColId.TRANSFORMATION_EDITOR_EXPRESSION,
                class: constants.listColClass.TRANSFORMATION_EDITOR_EXPRESSION,
                format: function(row) {
                    return row.expression;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.expression;
                }
            }
        };

        var rlsColumns = {
            nameCol: {
                label: blinkStrings.captions.NAME.toUpperCase(),
                colId: constants.listColId.NAME,
                class: constants.listColClass.NAME,
                format: function (row) {
                    return row.values.name;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.values.name;
                }
            },
            descriptionCol: {
                label: blinkStrings.captions.DESCRIPTION.toUpperCase(),
                colId: constants.listColId.DESCRIPTION,
                class: constants.listColClass.DESCRIPTION,
                format: function (row) {
                    return row.values.description;
                },
                templateUrl: 'metadata-list-content-format.html',
                sortBy: function(row) {
                    return row.values.description;
                }
            },
            dateModifiedCol: {
                label: blinkStrings.captions.MODIFIED.toUpperCase(),
                colId: constants.listColId.MODIFIED,
                class: constants.listColClass.MODIFIED,
                format: function (row) {
                    return dateUtil.epochToTimeAgoString(row.values.modified);
                },
                templateUrl: 'metadata-list-date-format.html',
                sortBy: function(row) {
                    return row.values.modified;
                }
            },
            authorCol: {
                colId: constants.listColId.AUTHOR,
                class: constants.listColClass.AUTHOR,
                format: function (row) {
                    return [row.values.author, row.values.authorName];
                },
                templateUrl: 'metadata-list-author-format.html'
            }
        };

        var jobColumns = {
            runHistory: {
                label: '',
                colId: constants.listColId.JOB_OPERATION,
                class: constants.listColClass.JOB_OPERATION,
                format: function (row) {
                    return blinkStrings.captions.JOB_OPERATION
                },
                templateUrl: 'job-list-view-status.html',
                sortBy: function(row) {
                    return row.name;
                },
                sortKey: jsonConstants.metadataTypeSort.NAME
            },
            nameWithLinkCol: {
                label: blinkStrings.captions.NAME.toUpperCase(),
                colId: constants.listColId.NAME,
                class: constants.listColClass.NAME,
                format: function (row) {
                    return row.name;
                },
                templateUrl: 'job-name-with-link.html',
                sortBy: function(row) {
                    return row.name;
                },
                sortKey: jsonConstants.metadataTypeSort.NAME

            },
            statusCol: {
                label: blinkStrings.captions.STATE.toUpperCase(),
                colId: constants.jobColId.STATE,
                class: constants.jobColClass.STATE,
                format: function(row) {
                    return row.getStateString();
                },
                templateUrl: 'job-list-status-format.html'
            },
            cronSchedule: {
                label: blinkStrings.captions.CRON_SCHEDULE.toUpperCase(),
                colId: constants.jobColId.CRON_SCHEDULE,
                class: constants.jobColClass.CRON_SCHEDULE,
                format: function(row) {
                    return row.getScheduleString();
                },
                templateUrl: 'job-list-schedule-format.html'
            },
            dateCreatedCol: {
                label: blinkStrings.captions.CREATED.toUpperCase(),
                colId: constants.listColId.CREATED_AT,
                class: constants.listColClass.CREATED_AT,
                format: function (row) {
                    return dateUtil.epochToTimeAgoString(row.getCreationTime().toInt() * 1000);
                },
                templateUrl: 'metadata-list-date-format.html',
                sortBy: function(row) {
                    return row.getCreationTime();
                },
                sortKey: jsonConstants.metadataTypeSort.CREATED
            },
            dateModifiedCol: {
                label: blinkStrings.captions.MODIFIED.toUpperCase(),
                colId: constants.listColId.MODIFIED,
                class: constants.listColClass.MODIFIED,
                format: function (row) {
                    return dateUtil.epochToTimeAgoString(row.getLastModificationTime().toInt() * 1000);
                },
                templateUrl: 'metadata-list-date-format.html',
                sortBy: function(row) {
                    return row.getLastModificationTime();
                },
                sortKey: jsonConstants.metadataTypeSort.MODIFIED
            },
            recipientsCol: {
                label: blinkStrings.captions.RECIPIENT.toUpperCase(),
                colId: constants.jobColId.RECIPIENT,
                class: constants.jobColClass.RECIPIENT,
                format: function (row) {
                    var numberOfRecipient = row.getNumberOfRecipients();
                    if (numberOfRecipient === 1) {
                        return blinkStrings.jobs.recipients.one;
                    } else {
                        return blinkStrings.jobs.recipients.more.assign(numberOfRecipient);
                    }
                },
                templateUrl: 'job-list-recipient-format.html',
                sortBy: function(row) {
                    return row.getNumberOfRecipients();
                }
            },
            nextCol: {

            }
        };

        var jobRunCols = {
            startTimeCol: {
                label: blinkStrings.captions.START_TIME.toUpperCase(),
                colId: constants.jobRunColId.START_TIME,
                class: constants.jobRunColClass.START_TIME,
                format: function (row) {
                    return dateUtil.epochToTimeAgoString(row.getStartTime().toInt() * 1000);
                },
                templateUrl: 'job-run-start-date.html'

            },
            endTimeCol: {
                label: blinkStrings.captions.END_TIME.toUpperCase(),
                colId: constants.jobRunColId.END_TIME,
                class: constants.jobRunColClass.END_TIME,
                format: function (row) {
                    if (!row.getEndTime()) {
                        return strings.dataProfile.NOT_AVAILABLE;
                    }
                    return dateUtil.epochToTimeAgoString(row.getEndTime().toInt() * 1000);
                },
                templateUrl: 'job-run-end-date.html'
            },
            stateCol: {
                label: blinkStrings.captions.STATE.toUpperCase(),
                colId: constants.jobRunColId.STATE,
                class: constants.jobRunColClass.STATE,
                format: function (row) {
                    if (!row.getRunStateString()) {
                        return ['unknown',
                            strings.dataProfile.NOT_AVAILABLE];
                    }
                    return [row.getRunStateString().toLowerCase(),
                        row.getRunStateString()];
                },
                templateUrl: 'job-run-state.html'
            }
        };

        var a3JobCols = {
            resultCol: {
                label: blinkStrings.captions.A3_JOB_RESULT_SUMMARY.toUpperCase(),
                colId: constants.listColId.A3_JOB_RESULT,
                class: constants.listColClass.A3_JOB_RESULT,
                format: function (row) {
                    return row.resultSummary;
                },
                templateUrl: 'a3-job-result.html'
            }
        };

        var a3JobRunCols = {
            resultCol: {
                label: blinkStrings.captions.A3_JOB_RUN_RESULT_SUMMARY.toUpperCase(),
                colId: constants.listColId.A3_JOB_RUN_RESULT,
                class: constants.listColClass.A3_JOB_RUN_RESULT,
                format: function (row) {
                    return row.getResultSummary();
                },
                templateUrl: 'a3-job-run-result.html'
            }
        };

        return {
            columns: columns,
            rlsColumns: rlsColumns,
            adminColumns: adminColumns,
            StatusEnum: StatusEnum,
            jobRunCols: jobRunCols,
            jobColumns: jobColumns,
            a3JobCols: a3JobCols,
            a3JobRunCols: a3JobRunCols
        };
    }]);

