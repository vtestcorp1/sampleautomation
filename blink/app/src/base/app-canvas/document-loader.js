/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A utility for loading document models (ad-hoc answer, saved answer, pinboard, worksheet).
 */

'use strict';

blink.app.factory('DocumentLoader', ['$q',
    '$rootScope',
    '$route',
    'alertService',
    'answerMetadataUtil',
    'answerSanitizationService',
    'blinkConstants',
    'DocumentPermissionFactory',
    'events',
    'jsonConstants',
    'loadingIndicator',
    'Logger',
    'messageService',
    'metadataUtil',
    'navService',
    'pinboardMetadataUtil',
    'worksheetUtil',
    'UserAction',
    function($q,
         $rootScope,
         $route,
         alertService,
         answerMetadataUtil,
         answerSanitizationService,
         blinkConstants,
         DocumentPermissionFactory,
         events,
         jsonConstants,
         loadingIndicator,
         Logger,
         messageService,
         metadataUtil,
         navService,
         pinboardMetadataUtil,
         worksheetUtil,
         UserAction) {

        var _logger = Logger.create('base-document-page-controller');
        function onDocumentModelUpdateBegan(ctrlr) {
            if (!ctrlr.disableLoadingIndicatorHandling) {
                loadingIndicator.show({
                    loadingText: 'Loading',
                    anchorElementOrSelector: 'body',
                    showInstantly: true
                });
            }
        }

        function onDocumentModelUpdateSuccess(loader, userAction, response) {
            if (!loader.disableLoadingIndicatorHandling) {
                loadingIndicator.hide();
            }

            var answerModel = response.data;

            if (answerModel.isCorrupted()) {
                _logger.warn('Missing Base Objects on document model update finish');
                var customData = {
                    incompleteDetails: answerModel.getCorruptionDetails(),
                    getDisplayNameForMetadataTypeName: metadataUtil.getDisplayNameForMetadataTypeName
                };
                var customUrl = 'src/common/alert/templates/missing-document-alert-template.html';
                alertService.showUserActionFailureAlert(userAction, response, {
                    substitutions: [answerModel.getName()],
                    customData: customData,
                    customUrl: customUrl,
                    code: messageService.blinkGeneratedErrors.INCOMPLETE_DOCUMENT
                });
            }
            loader.onModelUpdate(answerModel);
        }

        function onDocumentModelUpdateFailure(loader, userAction, response) {
            if (!loader.disableLoadingIndicatorHandling) {
                loadingIndicator.hide();
            }
            loader.onModelUpdate(null);
            _logger.warn('Document model not found');
            if (navService.isAtHome()) {
                // NOTE: This is a valid case, as users home page pinboard might get deleted or user
                // might not have a permission to view it. We shouldn't show any error alert in
                // this case.
                return;
            }
            alertService.showUserActionFailureAlert(userAction, response);
        }

        function DocumentLoader(onModelUpdate, disableLoadingIndicatorHandling) {
            this.onModelUpdate = onModelUpdate || angular.noop;
            this.disableLoadingIndicatorHandling = disableLoadingIndicatorHandling;
        }

        DocumentLoader.prototype.loadDocument = function (documentId, metadataType, ignorable) {
            if (!documentId) {
                var pathParams = $route.current.pathParams;
                documentId = pathParams.documentId;
            }

            if (!documentId) {
                return;
            }

            var documentLoader = this,
                documentPromise,
                isWorksheet = metadataType === jsonConstants.metadataType.LOGICAL_TABLE;

            onDocumentModelUpdateBegan(documentLoader);

            var userAction;
            if (isWorksheet) {
                userAction = new UserAction(UserAction.FETCH_WORKSHEET_DETAILS);
                var worksheetParams = {
                    asWorksheetModel: true,
                    showHidden: true,
                    ignorable: !!ignorable
                };
                documentPromise = worksheetUtil.getLogicalTableModel(documentId, worksheetParams);
            } else {
                var isPinboard = (metadataType === jsonConstants.metadataType.PINBOARD_ANSWER_BOOK);
                var userActionType =  isPinboard ?
                UserAction.FETCH_PINBOARD_DETAILS : UserAction.FETCH_ANSWER_DETAILS;
                userAction = new UserAction(userActionType);
                documentPromise = isPinboard ?
                pinboardMetadataUtil.getModelMetadata(documentId, !!ignorable) :
                answerMetadataUtil.getModelMetadata(documentId, !!ignorable, metadataType);
            }

            return documentPromise.then(
            function (response) {
                var documentModel = response.data;

                var isPinboard = (metadataType === jsonConstants.metadataType.PINBOARD_ANSWER_BOOK);
                var isAnswer = (metadataType === jsonConstants.metadataType.QUESTION_ANSWER_BOOK);
                var authorId = documentModel.getAuthorId();

                var documentPermissionPromise = isPinboard ?
                    DocumentPermissionFactory.createAsyncPinboardPermission(
                        documentId,
                        documentModel.getContextAnswerIds(),
                        authorId
                    ) :
                    DocumentPermissionFactory.createAsyncDocumentPermission(
                        documentId,
                        authorId,
                        metadataType
                    );
                return documentPermissionPromise
                    .then(function (docPermission) {
                        documentModel.setPermission(docPermission);
                        if (isAnswer) {
                            return answerSanitizationService.sanitizeSavedAnswerModel(documentModel)
                                .then(function(answerModel) {
                                    onDocumentModelUpdateSuccess(documentLoader, userAction, response);
                                    return answerModel;
                                });
                        } else {
                            onDocumentModelUpdateSuccess(documentLoader, userAction, response);
                            return documentModel;
                        }
                    });
            },
            function (response) {
                // In case of cancelled responses we can perhaps handle better.
                // NOTE: In case of pinboards it is possible for the pinboard set in session
                // info for homepage to have been deleted so that should not be an error.
                var isPinboard = metadataType === jsonConstants.metadataType.PINBOARD_ANSWER_BOOK;
                var loggerFunction = isPinboard ? 'warn' : 'error';
                _logger[loggerFunction]("Document id: ", documentId);
                _logger[loggerFunction]("Document type: ", metadataType);
                onDocumentModelUpdateFailure(documentLoader, userAction, response);
                return $q.reject(response);
            });
        };

        return DocumentLoader;
    }]);
