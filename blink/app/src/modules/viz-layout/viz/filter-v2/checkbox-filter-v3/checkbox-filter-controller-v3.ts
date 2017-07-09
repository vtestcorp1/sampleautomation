/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
*
* @fileoverview Exports a class for CheckboxFilterController.
*/
import _ from 'lodash';
import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire, Provide} from '../../../../../base/decorators';
import {SmartCheckboxCollectionConfig}
    from '../../../../../common/widgets/checkbox-collection/smart-checkbox-collection-config';
import {SmartCheckboxCollectionController}
    from '../../../../../common/widgets/checkbox-collection/smart-checkbox-collection-controller';
import IPromise = angular.IPromise;
import {strings} from '../../../../../base/strings';
import CheckboxComponent from '../../../../../common/widgets/checkbox/checkbox';
import {AttributeFilterModel} from '../../filter/attribute-filter-model';

let $q:any = ngRequire('$q');
let filterUtil: any = ngRequire('filterUtil');
let util:any = ngRequire('util');

@Provide('CheckboxFilterControllerV3')
export class CheckboxFilterController {

    public relevantSmartCheckboxCollectionCtrl: SmartCheckboxCollectionController;
    public allSmartCheckboxCollectionCtrl: SmartCheckboxCollectionController;
    public showRelevantValues: boolean;
    public showAll = false;
    public showAllTogglerCBCtrl: CheckboxComponent;

    // This variable will be used to maintain the overall state of selected items.
    // Any time a selection change is made this will be updated.
    private selectedItems: any;

    private smartCheckboxCollectionConfig: SmartCheckboxCollectionConfig;

    constructor(
        private filterModel: AttributeFilterModel,
        private isReadOnly:boolean,
        private isExclude: boolean
    ) {
        this.selectedItems = {};
        let selectedItemsToUse = isExclude
            ? filterModel.getExcludedFilterItems()
            : filterModel.getSelectedFilterItems();
        $.extend(this.selectedItems, selectedItemsToUse);

        this.showRelevantValues = true;
        let editableCBGetter = (searchText: string) => {
            return this.checkboxCollectionGetter(
                false, /*readOnlyItems*/
                true, /*showRelevantValues*/
                searchText
            );
        };
        let readOnlyCBGetter = (searchText: string) => {
            return this.checkboxCollectionGetter(
                true, /*readOnlyItems*/
                true, /*showRelevantValues*/
                searchText
            );
        };

        this.smartCheckboxCollectionConfig = new SmartCheckboxCollectionConfig();

        this.relevantSmartCheckboxCollectionCtrl = new SmartCheckboxCollectionController(
            editableCBGetter,
            readOnlyCBGetter,
            this.onChange.bind(this),
            null
        );

        this.showAllTogglerCBCtrl = new CheckboxComponent(
            strings.filters.Show_All_Possible_Values,
            () => this.showAll,
        ).setOnClick(($event) => {
            this.showAll = !this.showAll;
            this.onShowAllToggleCallback(this.showAll);
        });
    }

    public getSelectedItems(): any {
        return this.selectedItems;
    }

    private onShowAllToggleCallback = (selected: boolean) => {
        if (selected) {
            this.showAllOptions();
        } else {
            this.showRelevantOptions();
        }
    }

    private showRelevantOptions() {
        this.showRelevantValues = true;
    }

    private showAllOptions() {
        if (!this.allSmartCheckboxCollectionCtrl) {
            let editableCBGetter = (searchText: string) => {
                return this.checkboxCollectionGetter(
                    false, /*readOnlyItems*/
                    false, /*showRelevantValues*/
                    searchText
                );
            };
            let readOnlyCBGetter = (searchText: string) => {
                return this.checkboxCollectionGetter(
                    true, /*readOnlyItems*/
                    false, /*showRelevantValues*/
                    searchText
                );
            };

            this.allSmartCheckboxCollectionCtrl = new SmartCheckboxCollectionController(
                editableCBGetter,
                readOnlyCBGetter,
                this.onChange.bind(this),
                null
            );
        }
        this.showRelevantValues = false;
    }

    private checkboxCollectionGetter(
        readOnlyItems: boolean,
        showRelevantValues: boolean,
        searchText: string
    ): IPromise<Array<any>> {
        // We only support lower case values in filters.
        searchText = searchText.toLocaleLowerCase();
        if (readOnlyItems !== this.isReadOnly) {
            return $q.when({checkboxItems: []});
        }

        let updateValuesPromise = filterUtil.updateFilterModelWithValues(
            this.filterModel,
            searchText,
            showRelevantValues
        );

        let containsValuePromise = filterUtil.filterColumnContainsValue(
            this.filterModel,
            searchText,
            showRelevantValues
        );

        return util.getAggregatedPromise(
            [updateValuesPromise, containsValuePromise]
        )
            .then((data) => {
                var selectedItems = this.selectedItems;
                var exactMatchItem = {};
                if (data[1]) {
                    exactMatchItem[searchText] = !!selectedItems[searchText];
                }
                var allItems = this.filterModel.getFilterItems(!showRelevantValues);

                var items = {};
                _.extend(items, allItems, exactMatchItem, selectedItems);

                var searchTextLowerCase = searchText.toLowerCase();

                var matchingValues = Object.keys(items).filter(function(value: any){
                    return value.toLowerCase().indexOf(searchTextLowerCase) > -1;
                });

                var checkboxItems = matchingValues.map(function (value) {
                    return {
                        title: value,
                        isChecked: selectedItems[value]
                    };
                });

                // TODO(jasmeet): Add test for disallowing selecting all values.
                this.smartCheckboxCollectionConfig.disallowSelectAll =
                    checkboxItems.length === this.filterModel.getBatchSize();

                this.smartCheckboxCollectionConfig.disallowSelectAllMsg =
                    this.smartCheckboxCollectionConfig.disallowSelectAll
                            ? blinkConstants.filtersMessages.checkboxFilter.DISALLOW_SELECT_ALL
                        : '';

                return {
                    checkboxItems: checkboxItems,
                    overrideConfig: this.smartCheckboxCollectionConfig
                };
            });
    }

    private onChange(title: string, isChecked: boolean): void {
        if (isChecked) {
            this.selectedItems[title] = true;
        } else {
            delete this.selectedItems[title];
        }
    }
}
