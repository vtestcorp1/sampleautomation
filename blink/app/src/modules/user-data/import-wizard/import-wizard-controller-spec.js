/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for ImportWizardController
 */

'use strict';

/* eslint camelcase: 1 , no-undef: 0 */

(function() {
    var $scope, timeout, ctrl, mockService, mockDialogService, _events, wizard, cacheDataCalled, readColumnsCalled;
    var goToNextStep, $q;

    function init(updateStep) {
        $scope = null;
        timeout = null;
        ctrl = null;
        mockService = {};
        mockDialogService = {};
        _events = undefined;
        wizard = null;

        beforeEach(module('blink.app'));

        beforeEach(inject(function ($rootScope, $route, _$q_, $controller, events, $timeout, alertConstants) {
            $scope = $rootScope.$new();
            timeout = $timeout;
            $q = _$q_;
            if (updateStep) {
                $route.current = {
                    pathParams: {
                        existingDataId: '1'
                    }
                };
            }

            mockService = {
                cacheDataFile: function() {
                    cacheDataCalled = true;
                    return getSimplePromise('2');
                },
                cacheData: function() {
                    cacheDataCalled = true;
                    return getSimplePromise('2');
                },
                getMetadataObjectDetails: function() {
                    return getSimplePromise({columns:[]});
                }
            };

            mockDialogService = {};

            _events = events;

            ctrl = $controller('ImportWizardController', {
                $scope: $scope,
                dialog: mockDialogService,
                navAlertService: {
                    registerListener: angular.noop
                },
                userDataService: mockService,
                metadataService: mockService,
                worksheetUtil: mockService,
                $window: {},
                alertConstants: alertConstants
            });
            wizard = $scope.userDataWizard;

            cacheDataCalled = false;
            readColumnsCalled = false;

            goToNextStep = function () {
                wizard.goToNextStep();
                try {
                    timeout.flush();
                } catch (e) {
                    console.log(e);
                }
                $scope.$apply();
            };
        }));
    }

    function getSimplePromise(resolutionData) {
        return $q.when({data: resolutionData});
    }

    function verifyStuckOnFirstStep(headerQuesNotAns, dropAppendQuesNotAns) {
        expect(wizard.getProceedInstructions()).toMatch('upload a .csv');

        $scope.uploadStep.getUploadWidgetConfig().onFileLoad({
            target: { result: 'file content'}
        }, {
            name: 'file name'
        });

        expect(wizard.getProceedInstructions()).toMatch('contains column names');
        expect($scope.headerQuesNotAns).toBeFalsy();
        expect($scope.dropAppendQuesNotAns).toBeFalsy();
        expect($scope.errorRowMsg.length).toBe(0);

        $scope.headerQuesNotAns = !!headerQuesNotAns;
        $scope.dropAppendQuesNotAns = !!dropAppendQuesNotAns;

        goToNextStep();

        // It should not proceed to Step 2 (index 1)
        expect(wizard.isCurrentStep(0)).toBeTruthy();
        expect($scope.errorRowMsg.length).toBeGreaterThan(0);
    }

    function completeUploadStepRequirements() {
        $scope.uploadStep.getUploadWidgetConfig().onFileLoad({
            target: { result: 'file content'}
        }, {
            name: 'file name'
        });

        $scope.uploadStep.headerDefined = 'yes';
        $scope.uploadStep.dropExistingData = 'append';
    }

    function verifyApiCallsAfterUploadStep() {
        completeUploadStepRequirements();
        expect(wizard.isCurrentStep(0)).toBeTruthy();

        expect($scope.userSchema).toBeFalsy();
        expect($scope.userData).toBeFalsy();
        angular.extend(mockService, {
            readColumns: function () {
                readColumnsCalled = true;
                return getSimplePromise({});
            },
            getDataRows: function () {
                return getSimplePromise([]);
            }
        });
        goToNextStep();  // needed for $q resolve in the code to actually resolve the promise.

        expect(cacheDataCalled).toBe(true);

        // Since the data rows returned were empty, we can not really advance. So we should
        // stay on step 0 and show an error message.
        expect(wizard.isCurrentStep(0)).toBeTruthy();
        // schema was create successfully.
        expect($scope.userSchema).toBeTruthy();
        // but no data.
        expect($scope.userData).toBeFalsy();

        // This time let us return non-empty data.
        angular.extend(mockService, {
            getDataRows: function () {
                return $q.when({data: ['data']});
            }
        });
        goToNextStep();
        expect(wizard.isCurrentStep(1)).toBeTruthy();
        expect($scope.userData).toBeTruthy();
    }

    /**
     * Extends mockService to mock deferred.reject with the given error argument. It then goes to next step to
     * simulate reject()
     * @param error
     */
    function extendMockServiceForErrorAndGoToNextStep(error) {
        angular.extend(mockService, {
            readColumns: function () {
                return $q.reject(error);
            },
            getMetadataObjectDetails: function () {
                return $q.reject(error);
            }
        });

        goToNextStep();
    }

    function verifyErrorOnBadFileUpload() {
        completeUploadStepRequirements();
        expect(wizard.isCurrentStep(0)).toBeTruthy();
        expect($scope.userSchema).toBeFalsy();
        expect($scope.errorRowMsg).toBe('');

        // Check when error is undefined
        extendMockServiceForErrorAndGoToNextStep({data: {}});
        expect($scope.errorRowMsg).toMatch('Irrecoverable errors found');

        // Check for OBJECT_ALREADY_EXISTS
        extendMockServiceForErrorAndGoToNextStep({
            data: {code: 13005}
        });
        expect($scope.errorRowMsg).toMatch('same name');

        // Check for INVALID_INPUT
        extendMockServiceForErrorAndGoToNextStep({
            data: {code: 10002}
        });
        expect($scope.errorRowMsg).toMatch('empty');

        // Should still be at step 0
        expect(wizard.isCurrentStep(0)).toBeTruthy();
        expect($scope.userSchema).toBeFalsy();
    }

    function verifyBackFromSecondStepToFirst() {
        expect(wizard.isCurrentStep(1)).toBeTruthy();

        expect($scope.headerQuesNotAns).toBeFalsy();
        expect($scope.dropAppendQuesNotAns).toBeFalsy();

        // Modify the questions answered state variables
        $scope.headerQuesNotAns = true;
        $scope.dropAppendQuesNotAns = true;

        wizard.goToPreviousStep();

        expect(wizard.isCurrentStep(0)).toBeTruthy();
        // Expect that onRevisitFromNextStep was run
        expect($scope.headerQuesNotAns).toBeFalsy();
        expect($scope.dropAppendQuesNotAns).toBeFalsy();
    }

    describe('ImportWizardController', function () {
        init(false);

        it('should initialize a wizard with 3 steps', function () {
            expect(wizard).not.toBeNull();
            expect(wizard.steps.length).toBe(3);
            expect($scope.uploadStep).not.toBeNull();
            expect($scope.nameStep).not.toBeNull();
            expect($scope.typeStep).not.toBeNull();
        });

        it('should not be able to proceed after upload step', function () {
            verifyStuckOnFirstStep(true);
        });

        it('should invoke readColumns API after upload step', function () {
            verifyApiCallsAfterUploadStep();
        });

        it('should set correct error messages for invalid file upload', function () {
            verifyErrorOnBadFileUpload();
        });

        function goToNameStep() {
            completeUploadStepRequirements();
            angular.extend(mockService, {
                readColumns: function () {
                    return $q.when({data: {}});
                },
                getDataRows: function () {
                    return $q.when({data: ['data']});
                }
            });
            goToNextStep();

        }

        it('Should run onRevisitFromNextStep function when we hit Back - Step 1 -> 0', function () {
            goToNameStep();
            verifyBackFromSecondStepToFirst();
        });

        it('should not be able to proceed after name step for empty or identical column names', function () {
            goToNameStep();
            expect(wizard.isCurrentStep(1)).toBeTruthy();

            // Have 1 column with no name.
            $scope.userSchema._schema = {
                columns: [{
                    logicalName: 'col1'
                }, {
                    logicalName: ''
                }]
            };

            goToNextStep();
            // It should not proceed to Step 3 (index 2)
            expect(wizard.isCurrentStep(1)).toBeTruthy();
            expect($scope.errorRowMsg).toMatch('Column names must be non-empty and unique');

            //hack(sunny): we should not have to do this particular reset but for some reason promise.then's error
            //callback is not being called in unit test environ in user-data-wizard's goToNextStep (works fine
            //in production). we need to investigate why.
            wizard.isTransitioningToNextStep = false;

            // Reset error message
            $scope.errorRowMsg = '';
            $scope.userSchema._schema = {
                columns: [{
                    logicalName: 'col1'
                }, {
                    logicalName: 'col1'
                }]
            };

            goToNextStep();
            // It should not proceed to Step 3 (index 2)
            expect(wizard.isCurrentStep(1)).toBeTruthy();
            expect($scope.errorRowMsg).toMatch('Column names must be non-empty and unique');

            expect(wizard.getProceedInstructions()).toMatch('the column names must be unique');
        });

        function goToTypeStep() {
            goToNameStep();
            $scope.userSchema._schema = {
                columns: [{
                    logicalName: 'col1'
                }, {
                    logicalName: 'col2'
                }]
            };
            goToNextStep();
        }

        it('should proceed to type step and not proceed for unknown data type', function () {
            goToTypeStep();
            expect(wizard.isCurrentStep(2)).toBeTruthy();

            $scope.userSchema._schema = {
                columns: [{
                    logicalName: 'col1',
                    dataType: 'VARCHAR'
                }, {
                    logicalName: 'col2',
                    dataType: 'UNKNOWN'
                }]
            };

            goToNextStep();
            // It should not proceed to next step
            expect(wizard.isCurrentStep(2)).toBeTruthy();
            expect($scope.errorRowMsg).toMatch('Please specify the type for each column');
            expect(wizard.getProceedInstructions()).toMatch('interpreted');
        });

        it('should not proceed for different types of error date formats', function () {
            goToTypeStep();
            expect(wizard.isCurrentStep(2)).toBeTruthy();

            var columns = [{
                logicalName: 'col1',
                dataType: 'VARCHAR'
            }, {
                logicalName: 'col2',
                dataType: 'VARCHAR'
            }];

            $scope.userSchema._schema = {
                columns: columns,
                status: true,
                errors: [{
                    type: 'COLUMN',
                    indexOrCount: 0,
                    errorCode: 'DATE_FORMAT_INVALID'
                }, {
                    type: 'COLUMN',
                    indexOrCount: 1,
                    errorCode: 'DATE_FORMAT_AMBIGUOUS',
                    message: 'm1'
                },{
                    type: 'COLUMN',
                    indexOrCount: 1,
                    errorCode: 'DATE_FORMAT_AMBIGUOUS',
                    message: 'm2'
                }]
            };

            var ambiguousDateFormatMessage = 'Can\'t figure out which date format to use by looking at these values. More than one format could work here.';
            var invalidDateFormatMessage = 'Can\'t assign the date format for this column. Make sure it doesn\'t contain multiple date formats or only null values';

            angular.extend(mockService, {
                readKeys: function (json) {
                    return $q.when({data: json});
                }
            });

            // Testing date format invalid
            goToNextStep();
            // It should not proceed to next step
            expect(wizard.isCurrentStep(2)).toBeTruthy();
            expect($scope.errorRowMsg).toMatch('column type');
            expect($scope.isInvalidColType(0)).toBeTruthy();
            expect($scope.isInvalidColType(1)).toBeTruthy();
            expect($scope.userSchema.getColumnError(0)).toMatch(invalidDateFormatMessage);
            expect($scope.userSchema.getColumnError(1)).toMatch(ambiguousDateFormatMessage);
        });

        function completeTypeStepRequirements() {
            $scope.userSchema._schema = {
                columns: [{
                    logicalName: 'col1',
                    dataType: 'VARCHAR'
                }, {
                    logicalName: 'col2',
                    dataType: 'INT64'
                }]
            };
        }

        it('should call readKeys and createTable api after type step', function () {
            goToTypeStep();
            completeTypeStepRequirements();
            expect(wizard.isCurrentStep(2)).toBeTruthy();

            angular.extend(mockService, {
                readKeys: jasmine.createSpy().and.returnValue($q.when({
                    data: {
                        status: true,
                        schema: {
                            keys: ['key']
                        }
                    }
                })),
                createTable: jasmine.createSpy().and.returnValue($q.when({data: {}}))
            });
            goToNextStep();
            expect(mockService.createTable).toHaveBeenCalled();
            expect(mockService.readKeys).toHaveBeenCalled();
        });

        it('Should display error message on invalid type and then a dialog if the user still continues', function () {
            goToTypeStep();
            completeTypeStepRequirements();
            expect(wizard.isCurrentStep(2)).toBeTruthy();

            var readRelationshipsCalled = false;
            angular.extend(mockService, {
                readKeys: function () {
                    return $q.when({data: {
                        schema: {
                            keys: ['key']
                        }
                    }
                    });
                },
                createTable: function () {
                    return $q.when({data: {}});
                }
            });



            var dialogConfirmClicked = false;
            angular.extend(mockDialogService, {
                show: function (config) {
                    dialogConfirmClicked = config.onConfirm();
                }
            });

            goToNextStep();

            expect(wizard.isCurrentStep(2)).toBeTruthy();
            expect($scope.errorRowMsg).toMatch('Please hover over the cells marked in red to view more details');
            expect(dialogConfirmClicked).toBeFalsy();
            expect(readRelationshipsCalled).toBeFalsy();

            var dialogCancelClicked = false;
            angular.extend(mockDialogService, {
                show: function (config) {
                    dialogCancelClicked = true;
                    config.onCancel();
                }
            });

            // Initialize $scope.userSchema again because this was changed by the previous call.
            completeTypeStepRequirements();
            // Go to Next Step again - this time dialog should appear
            goToNextStep();

            expect(wizard.isCurrentStep(2)).toBeTruthy();
            expect(dialogCancelClicked).toBeTruthy();
            expect(readRelationshipsCalled).toBeFalsy();
            expect($scope.errorRowMsg).toMatch('Please hover over the cells marked in red to view more details');
            expect(wizard.isTransitioningToNextStep).toBeFalsy();

            angular.extend(mockDialogService, {
                show: function (config) {
                    dialogConfirmClicked = config.onConfirm();
                }
            });

            completeTypeStepRequirements();
            goToNextStep();

            expect(wizard.isCurrentStep(2)).toBeTruthy();
            expect(dialogConfirmClicked).toBeTruthy();
            expect($scope.errorRowMsg).toMatch('Please hover over the cells marked in red to view more details');
        });

        it('should cancel data import process', function () {
            goToNameStep();
            var abortCreateTableInvoked = false;
            angular.extend(mockService, {
                abortCreateTable: function () {
                    abortCreateTableInvoked = true;
                    return $q.when();
                }
            });

            var dialogConfirmClicked = false;
            angular.extend(mockDialogService, {
                show: function (config) {
                    dialogConfirmClicked = config.onConfirm();
                }
            });

            $scope.onCancel();
            expect(dialogConfirmClicked).toBeTruthy();
            expect(abortCreateTableInvoked).toBeTruthy();
        });

        it('edit case: should not allow proceeding without append-or-overwrite answer', function(){
            $scope.existingDataId = '1';

        });

        // TODO(vibhor): Add more tests for the import wizard. Link step is currently not covered.
    });


    describe('ImportWizardController Edit Flow', function () {
        init(true);

        it('should initialize a wizard with 2 steps', function () {
            expect(wizard).not.toBeNull();
            expect(wizard.steps.length).toBe(2);
            expect($scope.uploadStep).not.toBeFalsy();
            expect($scope.updateDataStep).not.toBeFalsy();
            expect($scope.nameStep).toBeFalsy();
            expect($scope.typeStep).toBeFalsy();
            expect($scope.linkStep).toBeFalsy();
        });

        it('should force decision on all upload questions - none answered', function () {
            verifyStuckOnFirstStep(true, true);
        });

        it('should force decision on all upload questions - only first answered', function () {
            verifyStuckOnFirstStep(false, true);
        });

        it('should force decision on all upload questions - only second answered', function () {
            verifyStuckOnFirstStep(true, false);
        });

        it('should call readColumn API on upload', function () {
            verifyApiCallsAfterUploadStep();
        });

        it('should set correct error messages for invalid file upload', function () {
            verifyErrorOnBadFileUpload();
        });

        function goToPreviewAndImportStep() {
            completeUploadStepRequirements();
            angular.extend(mockService, {
                readColumns: function () {
                    return getSimplePromise({});
                },
                getDataRows: function () {
                    return getSimplePromise(['data']);
                }
            });
            goToNextStep();
        }

        it('should run onRevisitFromNextStep function when we hit Back - Step 1 -> 0', function () {
            goToPreviewAndImportStep();
            verifyBackFromSecondStepToFirst();
        });

        function getLoadDataSuccessResponse() {
            return {
                status: true
            };
        }

        function getLoadDataError() {
            return {
                "status":false,
                "errors":[{
                    "type":"INVALID_ROWS",
                    "indexOrCount":1,
                    "errorCode":"FORMAT_INVALID",
                    "message":"m1",
                    "row":[],
                    "errorColumns":[0]
                }]
            };
        }

        it('should call loadData API on import', function () {
            var loadDataCalled = false;
            angular.extend(mockService, {
                loadData: function () {
                    loadDataCalled = true;
                    return getSimplePromise(getLoadDataError());
                }
            });

            goToPreviewAndImportStep();
            goToNextStep();

            expect(loadDataCalled).toBe(true);
        });

        it('should show success screen if there are no errors', function () {
            var dropExistingDataParam = null;
            angular.extend(mockService, {
                loadData: function (userDataObjectId, cacheGuid, forceLoad, dropExistingData) {
                    dropExistingDataParam = dropExistingData;
                    return getSimplePromise(getLoadDataSuccessResponse());
                }
            });

            goToPreviewAndImportStep();
            $scope.uploadStep.dropExistingData = 'overwrite';

            goToNextStep();

            expect(dropExistingDataParam).toBe(true);
            expect($scope.errorScreen).toBe(false);
            expect($scope.confirmationScreen).toBe(true);
        });

        it('should not proceed if loadData API returns errors', function () {
            angular.extend(mockService, {
                loadData: function () {
                    return getSimplePromise(getLoadDataError());
                }
            });

            goToPreviewAndImportStep();
            goToNextStep();
            expect(wizard.isCurrentStep(1)).toBeTruthy();
            expect($scope.errorRowMsg).toMatch('make changes to the data and restart the import');
        });

        it('should call load data with forceLoad on second attempt to import with errors', function(){
            var forceLoadParam = null;
            angular.extend(mockService, {
                loadData: function (userDataObjectId, cacheGuid, forceLoad, dropExistingData) {
                    forceLoadParam = forceLoad;
                    return getSimplePromise(getLoadDataError());
                }
            });

            var dialogConfirmClicked = false;
            angular.extend(mockDialogService, {
                show: function (config) {
                    dialogConfirmClicked = config.onConfirm();
                }
            });

            goToPreviewAndImportStep();
            goToNextStep();
            expect(dialogConfirmClicked).toBe(false);
            expect(forceLoadParam).toBe(false);

            goToNextStep();
            expect(dialogConfirmClicked).toBe(true);
            expect(forceLoadParam).toBe(true);
        });

        it('should show error screen if there are errors in forceLoad call to load data', function () {
            angular.extend(mockService, {
                loadData: function (userDataObjectId, cacheGuid, forceLoad, dropExistingData) {
                    return getSimplePromise(getLoadDataError());
                }
            });

            angular.extend(mockDialogService, {
                show: function(config) {
                    config.onConfirm();
                }
            });

            goToPreviewAndImportStep();
            goToNextStep();
            goToNextStep();

            expect($scope.errorScreen).toBe(true);
            expect($scope.confirmationScreen).toBe(false);
        });

        it('should show success screen if there are no errors in forceLoad call to load data', function () {
            angular.extend(mockService, {
                loadData: function () {
                    return getSimplePromise(getLoadDataError());
                }
            });

            angular.extend(mockDialogService, {
                show: function(config) {
                    config.onConfirm();
                }
            });

            goToPreviewAndImportStep();
            goToNextStep();

            angular.extend(mockService, {
                loadData: function () {
                    return getSimplePromise(getLoadDataSuccessResponse());
                }
            });

            goToNextStep();

            expect($scope.errorScreen).toBe(false);
            expect($scope.confirmationScreen).toBe(true);
        });

        it('should map INT32 and INT64 to proper display text to avoid confusion', function() {
            expect($scope.getLabelForColumnDataType('INT32')).toBe('INTEGER');
            expect($scope.getLabelForColumnDataType('INT64')).not.toBe($scope.getLabelForColumnDataType('INT32'));
        });
    });

})();
