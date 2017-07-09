/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview A service to manage showing/hiding relationship editor popup
 */

'use strict';

blink.app.factory('relationshipPopupService', ['popupService',
    function (popupService) {
        var popup = null;

        function hide() {
            popup.hide();
        }

        var template = '<relationship-popup></relationship-popup>';
        var show = function (tableId, params) {
            popup = popupService.show(template, {
                tableId: tableId,
                sourceIds: params.sourceIds,
                isAdHocRelationshipBuilder: params.isAdHocRelationshipBuilder,
                sageContext: params.sageContext,
                hide: hide
            });
        };

        return {
            show: show
        };
    }]);
