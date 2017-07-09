/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for attribute filter implementation.
 */

import {BaseComponent} from '../../../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../../../base/decorators';
import {CheckboxFilterController} from '../checkbox-filter-v3/checkbox-filter-controller-v3';
import IPromise = angular.IPromise;
import {AttributeFilterModel} from '../../filter/attribute-filter-model';

let $q = ngRequire('$q');
let Logger = ngRequire('Logger');
let BulkFilterController = ngRequire('BulkFilterControllerV2');
let filterTransformationUtil = ngRequire('filterTransformationUtil');

enum FilterStates {
    CHECKBOX,
    BULK
}

@Component({
    name: 'bkAttributeFilter',
    templateUrl: 'src/modules/viz-layout/viz/filter-v2/attribute-filter/attribute-filter.html'
})

export class AttributeFilterComponent extends BaseComponent {
    private logger;
    private filterModel: AttributeFilterModel;
    private isReadOnly: boolean;
    private filterState: FilterStates;
    private checkboxFilterController: CheckboxFilterController;
    private bulkFilterController: any;
    private excludeCheckboxFilterController: CheckboxFilterController;

    constructor(filterModel: AttributeFilterModel, isReadOnly: boolean) {
        super();
        this.logger = Logger.create('checkbox-filter-controller');
        this.filterModel = filterModel;
        this.isReadOnly = isReadOnly;
        this.filterState = FilterStates.CHECKBOX;
        this.checkboxFilterController = new CheckboxFilterController(
            filterModel,
            isReadOnly,
            false /*isExcludeFilter*/
        );
        this.bulkFilterController = new BulkFilterController(filterModel);
    }

    public showCheckboxFilter() : boolean {
        return this.filterState === FilterStates.CHECKBOX;
    }

    public showBulkFilter() : boolean {
        return this.filterState === FilterStates.BULK;
    }

    // public onTabActivated(activeTab: any) {
    //     if (activeTab.tabName === this.strings.filters.Exclude_Tab) {
    //         if (!this.excludeCheckboxFilterController) {
    //             this.excludeCheckboxFilterController = new CheckboxFilterController(
    //                 this.filterModel,
    //                 this.isReadOnly,
    //                 true /*isExcludeFilter*/
    //             );
    //         }
    //     }
    // }

    public getAddValuesInBulkText() : string {
        return this.strings.bulkFilters.ADD_VALUES_IN_BULK;
    }

    public getRevertBackToCheckBoxFilterText(): string {
        return '< ' + this.strings.bulkFilters.ADD_VALUES_IN_BULK;
    }

    public onAddValuesInBulkClick() : void {
        this.filterState = FilterStates.BULK;
    }

    public onRevertBackFromBulkAdd() : void {
        this.filterState = FilterStates.CHECKBOX;
    }

    public getRequiredQueryTransformations() : IPromise<any[]> {
        if (this.showCheckboxFilter()) {
            var selectedValues = this.checkboxFilterController.getSelectedItems();
            var excludedValues = !!this.excludeCheckboxFilterController
                ? this.excludeCheckboxFilterController.getSelectedItems()
                : this.filterModel.getExcludedFilterItems();
            var transforms = filterTransformationUtil.getAttributeChangeTransformations(
                this.filterModel,
                selectedValues,
                excludedValues
            );
            return $q.when(transforms);
        } else {
            return this.getBulkSelectedItems()
                .then((selectedItems) => {
                    return filterTransformationUtil.getBulkFilterTransform(
                        this.filterModel,
                        selectedItems
                    );
                });
        }
    }

    private getBulkSelectedItems() : IPromise<{[key: string]: boolean}> {
        return this.bulkFilterController.processEditorText(false)
            .then(() => {
                if (this.bulkFilterController.containsErrors()) {
                    return $q.reject();
                } else {
                    var bulkFilterSelectedItems = this.bulkFilterController.getSelectedItems();
                    return bulkFilterSelectedItems;
                }
            });
    }
}
