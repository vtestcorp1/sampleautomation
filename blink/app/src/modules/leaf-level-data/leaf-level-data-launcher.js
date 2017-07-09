/**
 * Copyright: ThoughtSpot Inc. 2014-2015
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview
 * A utility service to launch leaf level data view
 */

'use strict';

blink.app.factory('leafLevelDataLauncher', ['dialog', 'Logger',
    function (dialog, Logger) {
        var _logger = Logger.create('leaf-level-data-launcher');

        var me = {};

    /**
     * Launches the dialog
     * @param documentModel
     * @param summaryInfo
     */
        function showDetailView(documentModel, summaryInfo) {
            dialog.show({
                title: 'Showing underlying data',
                customCssClass: 'bk-leaf-level-data-dialog',
                customData: {
                    documentModel: documentModel,
                    summaryInfo: summaryInfo
                },
                customBodyUrl: 'src/common/widgets/dialogs/templates/row-detail-dialog.html'
            });
        }

    /**
     * Public method for launching the row-detail-view dialog.
     * @param documentModel
     * @param summaryInfo
     */
        me.launch = function (documentModel, summaryInfo) {
            if (!documentModel) {
                _logger.error('Invalid parameters while launching row detail view');
                _logger.debug(arguments);
                return;
            }

            showDetailView(documentModel, summaryInfo);
        };

        return me;
    }]);
