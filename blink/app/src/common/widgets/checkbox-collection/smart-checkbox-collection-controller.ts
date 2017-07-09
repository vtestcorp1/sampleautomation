/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
*
* @fileoverview Exports a class for SmartCheckboxCollectionController.
*/

import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire, Provide} from '../../../base/decorators';
import {SmartCheckboxCollectionConfig} from './smart-checkbox-collection-config';
import IPromise = angular.IPromise;
import _ from 'lodash';

let CancelablePromise: any = ngRequire('CancelablePromise');
let CheckboxCollectionController: any = ngRequire('CheckboxCollectionController');
let Logger: any = ngRequire('Logger');
let util: any = ngRequire('util');

@Provide('SmartCheckboxCollectionController')
/**
 *
 * @param {function} checkboxCollection
 * @param {function} readOnlyCheckboxCollection
 * @param {function} onChange
 * @param {SmartCheckboxCollectionConfig}  smartCheckboxCollectionConfig
 * @constructor
 */
export class SmartCheckboxCollectionController {
    private static searchBarDebounceThreshold = 100;

    public isLoading:boolean;

    public showClearSelectedItems:boolean;
    public showSelectAllItems:boolean;

    public selectedCheckboxCollectionCtrl:any;
    public unselectedCheckboxCollectionCtrl:any;
    public readOnlyCheckboxCollectionCtrl:any;
    public searchedCheckboxCollectionCtrl:any;
    public searchReadOnlyCheckboxCollectionCtrl:any;

    public showSearchToFindMoreReadOnlyItems:boolean;
    public showSearchToFindMoreSelectedItems:boolean;
    public showSearchToFindMoreItems:boolean;
    public showRefineFurtherMessage:boolean;
    public showReadOnlyRefineFurtherMessage:boolean;

    public strings:any;
    public checkboxFilterSearchText:string;

    private logger:any = Logger.create('blob-uploader-component');

    private debouncedHandleSearchText:Function;

    // NOTE: This variable is used to store a cancelable promise. Every time there is
    // a request made to fetch values. The promise is wrapped as cancelable. If there
    // are changes in the UI made before this request is completed the response would
    // be ignored. This is done to avoid out order completions.
    private pendingRequest:any;

    // This function provides a utility to ensure
    // 1. the data is sorted.
    // 2. Exact matches are displayed on top.
    // 3. Matching text is bold.
    private static getSearchDisplayCollection (checkboxCollection:any,
                                               count:number,
                                               checkboxFilterSearchText:string) {
        var exactMatchIndex = _.findIndex(checkboxCollection, function (checkboxItem:any) {
            return checkboxItem.title === checkboxFilterSearchText;
        });

        var exactMatch;

        if (exactMatchIndex > -1) {
            exactMatch = checkboxCollection[exactMatchIndex];
            checkboxCollection.splice(exactMatchIndex, 1);
        }

        var displayCheckboxCollection = checkboxCollection
            .slice(0, count)
            .sort(function (cbItem1, cbItem2) {
                if (cbItem1.title < cbItem2.title) {
                    return -1;
                }
                if (cbItem1.title > cbItem2.title) {
                    return 1;
                }
                // names must be equal
                return 0;
            })
            .map(function (checkboxItem) {
                checkboxItem.title = SmartCheckboxCollectionController.getRowLabel(
                    checkboxItem.title,
                    checkboxFilterSearchText
                );
                return checkboxItem;
            });

        if (exactMatchIndex > -1) {
            exactMatch.title = SmartCheckboxCollectionController.getRowLabel(
                exactMatch.title,
                checkboxFilterSearchText
            );
            displayCheckboxCollection.unshift(exactMatch);
        }

        return displayCheckboxCollection;
    }

    private static normalizeDisplayTitle (title:string):string {
        return title.unescapeHTML().stripTags('b');
    }

    private static getRowLabel (title:string, checkboxFilterSearchText:string):string {
        if (!title) {
            return '';
        }

        var value = util.formatDataLabel(title, {
            checkOnlySpecialFormat: true
        });

        return util.boldMatchingText(
            value,
            checkboxFilterSearchText
        );
    }

    constructor (private checkboxCollectionGetter:(text: string)=>IPromise<any>,
                 private readOnlyCheckboxCollectionGetter:(text: string)=>IPromise<any>,
                 private onChange:Function,
                 private smartCheckboxCollectionConfig:SmartCheckboxCollectionConfig) {
        this.checkboxCollectionGetter = checkboxCollectionGetter;
        this.readOnlyCheckboxCollectionGetter = readOnlyCheckboxCollectionGetter;
        this.onChange = function (title, isChecked, id) {
            var normalizedTitle = SmartCheckboxCollectionController.normalizeDisplayTitle(
                title
            );
            if (isChecked) {
                this.showClearSelectedItems = true;
            } else {
                this.showSelectAllItems = true;
            }
            onChange(normalizedTitle, isChecked, id);
        }.bind(this);

        this.smartCheckboxCollectionConfig = smartCheckboxCollectionConfig
            || new SmartCheckboxCollectionConfig();

        this.isLoading = false;
        this.showClearSelectedItems = false;
        this.showSelectAllItems = false;

        this.strings = blinkConstants.smartCheckboxCollection;
        this.checkboxFilterSearchText = '';

        this.initDefaultState();
    }

    public initDefaultState () {
        this.selectedCheckboxCollectionCtrl = null;
        this.unselectedCheckboxCollectionCtrl = null;
        this.readOnlyCheckboxCollectionCtrl = null;
        this.searchedCheckboxCollectionCtrl = null;
        this.searchReadOnlyCheckboxCollectionCtrl = null;

        this.showClearSelectedItems = false;

        this.showSearchToFindMoreReadOnlyItems = false;
        this.showSearchToFindMoreSelectedItems = false;
        this.showSearchToFindMoreItems = false;
        this.showRefineFurtherMessage = false;
        this.showReadOnlyRefineFurtherMessage = false;

        // The goal here is to create 2 separate sections for selected and unselected
        // checkbox collections. So users can easily get a preview of what is selected
        // on the top and can unselect easily. To select a value user can scroll to find
        // unselected options but if not found in the list user can search.
        this.checkboxFilterSearchText = '';
        var checkboxCollectionPromise = this.checkboxCollectionGetter('');
        var readOnlyCheckboxCollectionPromise = this.readOnlyCheckboxCollectionGetter('');
        this.isLoading = true;
        var self = this;

        var pendingPromise = util.getAggregatedPromise(
            [checkboxCollectionPromise, readOnlyCheckboxCollectionPromise]
        );

        this.updatePendingRequest(pendingPromise);

        this.pendingRequest
            .then(function (data) {
                var checkboxCollection = data[0].checkboxItems;
                var readOnlyCheckboxCollection = data[1].checkboxItems;

                if (!!data[0].overrideConfig) {
                    _.assign(self.smartCheckboxCollectionConfig, data[0].overrideConfig);
                }
                var result = util.splitMatchingObjectsOfArray(
                    checkboxCollection,
                    function (checkbox) {
                        return checkbox.isChecked;
                    }
                );

                self.showSearchToFindMoreReadOnlyItems = readOnlyCheckboxCollection.length
                    > self.smartCheckboxCollectionConfig.readOnlyValuesToDisplay;

                if (readOnlyCheckboxCollection.length > 0) {
                    self.readOnlyCheckboxCollectionCtrl =
                        new CheckboxCollectionController(
                            SmartCheckboxCollectionController.getSearchDisplayCollection(
                                readOnlyCheckboxCollection,
                                self.smartCheckboxCollectionConfig.readOnlyValuesToDisplay,
                                ''
                            ), // Checkbox collection
                            _.noop, // onChange
                            true // isReadOnly
                        );
                }

                self.showSearchToFindMoreSelectedItems = result.matching.length
                    > self.smartCheckboxCollectionConfig.selectedValuesToDisplay;

                self.selectedCheckboxCollectionCtrl = result.matching.length > 0
                    ? new CheckboxCollectionController(
                    SmartCheckboxCollectionController.getSearchDisplayCollection(
                        result.matching,
                        self.smartCheckboxCollectionConfig.selectedValuesToDisplay,
                        ''
                    ),
                    self.onChange,
                    false
                )
                    : null;

                self.showClearSelectedItems = result.matching.length >= 1;
                self.showSelectAllItems = result.nonMatching.length >= 1;

                self.showSearchToFindMoreItems = result.nonMatching.length
                    > self.smartCheckboxCollectionConfig.unselectedValuesToDisplay;

                self.unselectedCheckboxCollectionCtrl = result.nonMatching.length > 0
                    ? new CheckboxCollectionController(
                    SmartCheckboxCollectionController.getSearchDisplayCollection(
                        result.nonMatching,
                        self.smartCheckboxCollectionConfig.unselectedValuesToDisplay,
                        ''
                    ),
                    self.onChange,
                    false
                )
                    : null;
            }, function (error) {
                self.logger.error('get checked values call failed', error);
            })
            .finally(function () {
                self.isLoading = false;
            });
    }

    public initSearchState () {
        // The goal here is to help user reach the searched entity ASAP. So we try to
        // display a sorted list of all options as the is cognitively easy to view a
        // sorted list when looking for options.
        this.selectedCheckboxCollectionCtrl = null;
        this.unselectedCheckboxCollectionCtrl = null;
        this.readOnlyCheckboxCollectionCtrl = null;
        this.searchedCheckboxCollectionCtrl = null;
        this.searchReadOnlyCheckboxCollectionCtrl = null;

        this.showSearchToFindMoreReadOnlyItems = false;
        this.showSearchToFindMoreSelectedItems = false;
        this.showSearchToFindMoreItems = false;
        this.showRefineFurtherMessage = false;
        this.showReadOnlyRefineFurtherMessage = false;

        var checkboxCollectionPromise =
            this.checkboxCollectionGetter(this.checkboxFilterSearchText);
        var readOnlyCheckboxCollectionPromise =
            this.readOnlyCheckboxCollectionGetter(this.checkboxFilterSearchText);

        this.isLoading = true;
        var self = this;

        var pendingPromise = util.getAggregatedPromise(
            [checkboxCollectionPromise, readOnlyCheckboxCollectionPromise]
        );

        this.updatePendingRequest(pendingPromise);

        this.pendingRequest
            .then(function (data) {
                var checkboxCollection = data[0].checkboxItems;
                var readOnlyCheckboxCollection = data[1].checkboxItems;
                if (!!data[0].overrideConfig) {
                    _.assign(self.smartCheckboxCollectionConfig, data[0].overrideConfig);
                }

                self.showRefineFurtherMessage = checkboxCollection.length
                    > self.smartCheckboxCollectionConfig.searchValuesToDisplay;

                checkboxCollection =
                    SmartCheckboxCollectionController.getSearchDisplayCollection(
                        checkboxCollection,
                        self.smartCheckboxCollectionConfig.searchValuesToDisplay,
                        self.checkboxFilterSearchText
                    );

                self.showReadOnlyRefineFurtherMessage = readOnlyCheckboxCollection.length
                    > self.smartCheckboxCollectionConfig.searchValuesToDisplay;

                readOnlyCheckboxCollection =
                    SmartCheckboxCollectionController.getSearchDisplayCollection(
                        readOnlyCheckboxCollection,
                        self.smartCheckboxCollectionConfig.searchValuesToDisplay,
                        self.checkboxFilterSearchText
                    );

                self.searchedCheckboxCollectionCtrl =
                    new CheckboxCollectionController(
                        checkboxCollection,
                        self.onChange,
                        false // isReadOnly
                    );

                self.searchReadOnlyCheckboxCollectionCtrl =
                    new CheckboxCollectionController(
                        readOnlyCheckboxCollection, // Checkbox collection
                        _.noop, // onChange
                        true // isReadOnly
                    );
            }, function (error) {
                self.logger.error('get checked values call failed', error);
            })
            .finally(function () {
                self.isLoading = false;
            });
    }

    public doFilter () {
        if (!this.debouncedHandleSearchText) {
            this.debouncedHandleSearchText = util.debounce(
                this.handleSearchTextChange,
                SmartCheckboxCollectionController.searchBarDebounceThreshold
            );
        }

        this.debouncedHandleSearchText();
    }

    // NOTE(Jasmeet): Current implementation assumes clients would prefer to receive callback
    // for all checked items vs to implement a special clear all items callback.
    // Based on consumers we can look at making this a more configurable option.
    public clearSelectedItems () {
        this.isLoading = true;
        var self = this;

        var pendingPromise = this.checkboxCollectionGetter(this.checkboxFilterSearchText);

        this.updatePendingRequest(pendingPromise);

        this.pendingRequest
            .then(function (data) {
                var checkboxItems = data.checkboxItems;
                if (!!data.overrideConfig) {
                    _.assign(self.smartCheckboxCollectionConfig, data.overrideConfig);
                }
                var selectedItemsMap = {};
                if (!!self.selectedCheckboxCollectionCtrl
                    && self.selectedCheckboxCollectionCtrl.checkboxItemCtrls) {
                    self.selectedCheckboxCollectionCtrl.checkboxItemCtrls
                        .forEach(function (checkboxItemCtrl) {
                            selectedItemsMap[checkboxItemCtrl.getLabel()] = true;
                        });
                }

                var selectedCheckboxItems = [];
                var unselectedCheckboxItems = [];
                checkboxItems.forEach(function (checkboxItem) {
                    if (checkboxItem.isChecked) {
                        self.onChange(checkboxItem.title, false, checkboxItem.id);
                        checkboxItem.isChecked = false;
                    }

                    if (selectedItemsMap[checkboxItem.title]) {
                        selectedCheckboxItems.push(checkboxItem);
                    } else {
                        unselectedCheckboxItems.push(checkboxItem);
                    }
                });

                // Note: To avoid re ordering we retain the separation on click action.
                // Once user searches something and comes back, the latest selection
                // state should be used.
                self.selectedCheckboxCollectionCtrl =
                    new CheckboxCollectionController(
                        selectedCheckboxItems
                            .slice(0, self.smartCheckboxCollectionConfig.selectedValuesToDisplay),
                        self.onChange,
                        false
                    );

                self.unselectedCheckboxCollectionCtrl =
                    new CheckboxCollectionController(
                        unselectedCheckboxItems
                            .slice(0, self.smartCheckboxCollectionConfig.unselectedValuesToDisplay),
                        self.onChange,
                        false
                    );

                self.showRefineFurtherMessage = unselectedCheckboxItems.length
                    > self.smartCheckboxCollectionConfig.unselectedValuesToDisplay;

                self.showClearSelectedItems = false;
                self.showSelectAllItems = true;
            }, function (error) {
                this.logger.error('get checked values call failed', error);
            })
            .finally(function () {
                self.isLoading = false;
            });
    }

    public selectAllItems () {
        this.isLoading = true;
        var self = this;

        var pendingPromise = this.checkboxCollectionGetter(this.checkboxFilterSearchText);

        this.updatePendingRequest(pendingPromise);

        this.pendingRequest
            .then(function (data) {
                var checkboxItems = data.checkboxItems;
                if (!!data.overrideConfig) {
                    _.assign(self.smartCheckboxCollectionConfig, data.overrideConfig);
                }
                var selectedItemsMap = {};
                if (!!self.selectedCheckboxCollectionCtrl
                    && self.selectedCheckboxCollectionCtrl.checkboxItemCtrls) {
                    self.selectedCheckboxCollectionCtrl.checkboxItemCtrls
                        .forEach(function (checkboxItemCtrl) {
                            selectedItemsMap[checkboxItemCtrl.getLabel()] = true;
                        });
                }

                var selectedCheckboxItems = [];
                var unselectedCheckboxItems = [];
                checkboxItems.forEach(function (checkboxItem) {
                    if (!checkboxItem.isChecked) {
                        self.onChange(checkboxItem.title, true, checkboxItem.id);
                        checkboxItem.isChecked = true;
                    }

                    if (selectedItemsMap[checkboxItem.title]) {
                        selectedCheckboxItems.push(checkboxItem);
                    } else {
                        unselectedCheckboxItems.push(checkboxItem);
                    }
                });

                // Note: To avoid re ordering we retain the separation on click action.
                // Once user searches something and comes back, the latest selection
                // state should be used.
                self.selectedCheckboxCollectionCtrl =
                    new CheckboxCollectionController(
                        selectedCheckboxItems
                            .slice(0, self.smartCheckboxCollectionConfig.selectedValuesToDisplay),
                        self.onChange,
                        false
                    );

                self.unselectedCheckboxCollectionCtrl =
                    new CheckboxCollectionController(
                        unselectedCheckboxItems
                            .slice(0, self.smartCheckboxCollectionConfig.unselectedValuesToDisplay),
                        self.onChange,
                        false
                    );

                self.showRefineFurtherMessage = unselectedCheckboxItems.length
                    > self.smartCheckboxCollectionConfig.unselectedValuesToDisplay;

                self.showClearSelectedItems = true;
                self.showSelectAllItems = false;
            }, function (error) {
                this.logger.error('get checked values call failed', error);
            })
            .finally(function () {
                self.isLoading = false;
            });
    }

    private updatePendingRequest (pendingPromise:IPromise<any>) {
        if (!!this.pendingRequest) {
            this.pendingRequest.cancel();
        }

        this.pendingRequest = new CancelablePromise(
            pendingPromise
        );
    }

    private handleSearchTextChange () {
        if (this.checkboxFilterSearchText === '') {
            this.initDefaultState();
        } else {
            this.initSearchState();
        }
    }
}
