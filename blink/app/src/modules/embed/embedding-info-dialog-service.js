/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Service to show UI with embed info for a given document model
 */

'use strict';

blink.app.factory('embeddingInfoDialogService', ['dialog',
    'blinkConstants',
    'strings',
    'navService',
    function (dialog,
          blinkConstants,
          strings,
          navService) {

        var EMBED_URL_PATTERN = '/embed/viz/{documentId}/{vizId}';

        function getEmbedUrl(documentId, vizId) {
            var relativePath = EMBED_URL_PATTERN.assign({
                documentId: documentId,
                vizId: !!vizId ? vizId : ''
            });
            return navService.getAbsoluteUrl(relativePath);
        }

        function getEmbedSnippet(vizModel, vizId) {
            return getEmbedUrl(vizModel, vizId);
        }

    /**
     *
     * @param {string} documentId
     * @param {string=} vizId If vizId is not provided the UI shows info
     *                        for embedding the entire document.
     */
        function showEmbeddingInfoPopup(documentId, vizId) {
            var embeddedObjectType = strings.embed.embeddedObjectType.VISUALIZATION;
            if (!vizId) {
                embeddedObjectType = strings.embed.embeddedObjectType.PINBOARD;
            }

            var actionMessage = strings.embed.EMBED_CONTROL_ACTION_MESSAGE.assign({
                embeddedObjectType: embeddedObjectType
            });

            dialog.show({
                title: strings.embed.control.TITLE,
                confirmBtnLabel: strings.basicActionMessages.OK,
                skipCancelBtn: true,
                customBodyUrl: 'src/modules/embed/embedding-control/embedding-control-dialog.html',
                customData: {
                    actionMessage: actionMessage,
                    embedSnippet: getEmbedSnippet(documentId, vizId)
                }
            });
        }

        return {
            showEmbeddingInfoPopup: showEmbeddingInfoPopup
        };

    }]);
