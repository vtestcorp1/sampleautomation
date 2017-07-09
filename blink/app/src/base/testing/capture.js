/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Priyendra Deshwal (deshwal@thoughtspot.com)
 *
 * @fileoverview functions used for capturing testcases.
 */

'use strict';

// TODO(deshwal): Ideally, this factory should be in a separate module and not
// in blink.app. However, it was not clear how to get that module separation
// working. Need to look into that some more.
blink.app.factory('testCapture', ['$http', '$rootScope', 'perfMeter', function ($http, $rootScope, perfMeter) {
    /**
     * Converts the TableModel into a form that is suitable for test case
     * capture. Essentially, this method should only retain fields from
     * TableModel which have long-term semantic value. For now, we have decided
     * to keep the table values and column headings.
     */
    function getTableTestCaseView(t) {
        var data = t.getData();
        var vizContent = t.getJson();
        var answer = {};
        answer.columnNames = [];
        for (var i = 0; i < vizContent.columns.length; ++i) {
            var referenceColumnHeader = vizContent.columns[i].referencedColumnHeaders[0];
            answer.columnNames.push(referenceColumnHeader.name);
        }
        // Basically data is unformatted in nature, so to ensure the completeness aspect
        // where backend is not sending right data, we capture both data as it comes to
        // blink and capture the displayed content as well to ensure blink formatting
        // works as intended.
        answer.numRows = data.length;
        answer.rows = data;

        // TODO (Pavan): We need to move away from relying on blink internals to get
        // /extract test content in the displayed view. Since number of rows displayed
        // is dependent on screen resolution etc, we will ONLY capture data for the first
        // minimum(10, numRows) rows, where numRows is coming from raw data.
        var slickRows = $('.slick-row');
        var displayedData = [];
        var numRowsToCapture = 10;
        if (data.length < 10) {
            numRowsToCapture = data.length
        } else if (slickRows.length < 10) {
            numRowsToCapture = slickRows.length
        }

        for (var i = 0; i < numRowsToCapture; ++i) {
            var curRow = slickRows[i];
            var rowValues = [];
            var childNodes = curRow.childNodes;
            for (var child = 0; child < curRow.childElementCount; ++child) {
                rowValues.push(childNodes[child].textContent);
            }
            displayedData.push(rowValues);
        }
        answer.displayedData = displayedData;
        return answer;
    }
    /**
     * Converts the HeadlineModel into a form that is suitable for test case
     * capture. Essentially, this method should only retain fields from
     * HeadlineModel which have long-term semantic value. For now, we have decided
     * to keep the headline name, aggregate type and the headline value.
     */
    function getHeadlineTestCaseView(h) {
        var answer = {};
        // A headline should have just one column.
        // TODO(deshwal): Is that an accurate assumption? How should we assert
        // for that here?
        answer.name = h.getHeadlineTeslaTitle();
        // Loop over the rows - one row per aggregate.
        answer.values = [];
        for (var i = 0; i < h.getAggregateSize(); ++i) {
            var aggr = {};
            aggr.value = h.getDataValueUnformatted(i, 0);  // one column assumption
            aggr.type = h.getAggregateType(i);
            answer.values.push(aggr);
        }
        return answer;
    }
    function captureInfo() {
        var testcase = {};

        // TODO(pavan) : We need to get away from hardcoding stuff and move
        // to using selectors defined in the app.
        testcase.answerTitle = $('.bk-answer-title .bk-editable-input').val();
        testcase.answerDesc = $('.bk-answer-title .bk-description-editarea').val();
        // Save the query from the sage bar.
        var sage = $('.bk-sage');
        testcase.sageQuery = sage.isolateScope().sageInput;
        // Walk the sage tokens to extract the text fields.
        var sageModel = sage.isolateScope().sageClient.sageModel;
        if (sageModel !== null && typeof sageModel !== 'undefined') {
            testcase.dataAutoCompletions = [];
            for (var i1 = 0; i1 < sageModel.dataCompletions.length; ++i1) {
                testcase.dataAutoCompletions.push(
                    sageModel.dataCompletions[i1].getRecognizedToken().token);
            }
            testcase.languageAutoCompletions = [];
            for (var i2 = 0; i2 < sageModel.languageCompletions.length; ++i2) {
                testcase.languageAutoCompletions.push(
                    sageModel.languageCompletions[i2].getRecognizedToken().token);
            }
        }

        // Get the contents of all the headline visualizations on the page
        testcase.headlines = [];
        $.each($('.bk-viz-headline'), function(i) {
            testcase.headlines.push(getHeadlineTestCaseView(
                  $(this).scope().$ctrl.headlineViz.getModel()));
        });

        // Get the contents of all table visualizations on the page
        // NOTE(deshwal): We actually expect only one table visualization
        // to be present. The loop over tables is just present for the sake
        // of generality.
        testcase.tables = [];
        $.each($('.bk-viz-table'), function(i) {
            testcase.tables.push(getTableTestCaseView($(this).scope().$ctrl.tableViz.getModel()));
        });
        return testcase;
    }
    var me = {};

    // Test only event and event handlers.
    $rootScope.$on('captureState', function() {
        $http({
            method: 'POST',
            url: '/capture',
            data: {
                state: JSON.stringify(captureInfo())
            }
        });
    });

    function collectPerfMetrics(testName) {
        var perfData = {
            e2e: {
                testName: testName,
                sageRpc: {
                    sage: perfMeter.getSageServerLatency(),
                    duration: perfMeter.getSageRequestDuration()
                },
                answerMetadataRpc: {
                    callosum: perfMeter.getCallosumServerMetadataLatencyInfo(),
                    duration: perfMeter.getAnswerMetadataRequestDuration()
                },
                answerDataRpc: perfMeter.getReportbookDataDuration(),
                answerRendering: perfMeter.getAnswerRenderDuration(),
                pinboardRendering: perfMeter.getPinboardRenderDuration(),
                genericMetrics: perfMeter.getGenericRenderDuration()
            }
        };

        return perfData
    };

    $rootScope.$on('collectPerfMetrics', function() {
        var perfData = {
            e2e: {
                testName: arguments[1] || "",
                sageRpc: {
                    sage: perfMeter.getSageServerLatency(),
                    duration: perfMeter.getSageRequestDuration()
                },
                answerMetadataRpc: {
                    callosum: perfMeter.getCallosumServerMetadataLatencyInfo(),
                    duration: perfMeter.getAnswerMetadataRequestDuration()
                },
                answerDataRpc: perfMeter.getReportbookDataDuration(),
                answerRendering: perfMeter.getAnswerRenderDuration(),
                pinboardRendering: perfMeter.getPinboardRenderDuration(),
                genericMetrics: perfMeter.getGenericRenderDuration()
            }
        };

        $http({
            method: 'POST',
            url: '/perf',
            data: {
                perf: JSON.stringify(perfData)
            }
        });
    });

    me.captureAndDownload = function(filename, perf) {
        if (!perf) {
            var testcase = captureInfo();
        } else {
            var testcase = collectPerfMetrics(perf);
        }
        var downloadedFileName;
        if (filename === undefined) {
            // Offer the test case as a downloadable json file.
            downloadedFileName = window.prompt('Enter name of testcase', 'testcase.json');
            if (downloadedFileName === null || downloadedFileName === '') {
                return;
            }
        } else {
            downloadedFileName = filename;
        }
        var vlink = document.createElement('a');
        vlink.download = downloadedFileName;
        vlink.href = 'data:application/octet-stream;charset=utf-8;base64,' +
            window.btoa(JSON.stringify(testcase, null, 4));
        vlink.click();
        // TODO(deshwal): Do we need to clean up @vlink?
    };
    window.testCapture = me;
    return me;
}]);
