/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview A service to manage showing/hiding transformation editor popup
 */

'use strict';

blink.app.factory('transformationEditorPopupService', ['$templateCache',
    'Logger',
    'popupService',
    function ($templateCache,
          Logger,
          popupService) {
        var popup = null,
            currentTransformationId = null;

        var show = function (transformationModel, dsMetadata, onUpsertTransform, tables, getTableColumns) {
            if (!!popup) {
                return;
            }
            popup = popupService.show($templateCache.get('transformation-editor-popup.html'), {
                transformation: transformationModel,
                dsMetadata: dsMetadata,
                onUpsertTransform: onUpsertTransform,
                tables: tables,
                getTableColumns: getTableColumns,
                onDone: hide
            });
        };

        var hide = function () {
            popup.hide();
            popup = null;
            currentTransformationId = null;
        };

        return {
            show: show,
            hide: hide
        };
    }]);
