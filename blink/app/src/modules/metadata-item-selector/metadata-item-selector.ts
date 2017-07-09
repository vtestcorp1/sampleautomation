/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A set of selector components of different type of objects
 * in the system (pinboards, answers etc.). Features include:
 *
 * 1. Does not load the initial list of metadata objects until the user
 *    clicks on the UI to show the list. This allow the selector to
 *    be used a metada item (e.g. pinboard) switcher which is initialized
 *    with a known item without having to load a list of metadata items
 *    upfront.
 * 2. Supports dealing with a large number of metadata items by not loading/
 *    rendering the entire list. It only loads a small set of items at a
 *    time and allow searching for items using the backend metadata search
 *    API.
*  3. Supports multiple selection of items
 *
 */

'use strict';

import {BaseComponent} from '../../base/base-types/base-component';
import IPromise = angular.IPromise;
import ITimeoutService = angular.ITimeoutService;
import IQService = angular.IQService;
import _ from 'lodash';
import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire} from '../../base/decorators';

let $q: IQService = ngRequire('$q');
let $timeout: ITimeoutService = ngRequire('$timeout');
let jsonConstants = ngRequire('jsonConstants');
let Logger: any = ngRequire('Logger');
let metadataService = ngRequire('metadataService');
let sessionService = ngRequire('sessionService');
let CancelablePromise = ngRequire('CancelablePromise');
let util = ngRequire('util');

export enum MetadataItemType {
    PINBOARD,
    PRINCIPAL,
    ANSWER,
    USER,
    GROUP
}

export interface MetadataItem {
    id: string;
    owner: string;
    name: string;
    type: string;
}

export type SelectionHandler = (metadataItem: MetadataItem[]) => void;


//TODO(Ashish): Refactor to be variables instead of getters, after moving blinkConstants to .ts
function getDummyLoadingItem(): MetadataItem {
    return {
        id: '',
        owner: '',
        name: blinkConstants.LOADING_MSG,
        type: undefined
    };
}

function getDummyLoadFailedItem(): MetadataItem {
    return {
        id: '',
        owner: '',
        name: blinkConstants.LOADING_FAILED_MSG,
        type: undefined
    };
}

function getDummyNoMatchItem(): MetadataItem {
    return {
        id: '',
        owner: '',
        name: blinkConstants.NO_MATCH_MSG,
        type: undefined
    };
}

function copyMetadataItem(json: any): MetadataItem {
    return _.pick(json, 'id', 'name', 'owner', 'type') as MetadataItem;
}

export class MetadataItemSelector extends BaseComponent {
    private static LIST_BATCH_SIZE: number = 10;
    private static LOADING_INDICATOR_DELAY: number = 512;

    protected logger: any = Logger.create('metadata-item-selector');
    private debouncingTime: number;

    private _selectedItems: MetadataItem[] = [];
    private loadingState: any = util.LoadStates.UNINITIALIZED;
    private items: MetadataItem[] = [];
    private loadDataPromise: any;

    public constructor(protected metadataItemType: MetadataItemType,
                       private selectionHandler: SelectionHandler,
                       private _isMultiple: boolean = false) {
        super();
        let searchDebouncingInMS: number = sessionService.getListSearchDebouncingInMS();
        if (!searchDebouncingInMS || searchDebouncingInMS < 0) {
            searchDebouncingInMS = blinkConstants.DEFAULT_DEBOUNCING_TIME;
        }
        this.debouncingTime = searchDebouncingInMS;
    }

    protected getQueryString(query: string) {
        return !!query ? `%${query}%` : '';
    }

    protected extractItemsFromMetadaResponse(response: any): MetadataItem[] {
        let items: MetadataItem[]
            = response.data[jsonConstants.MULTIPLE_HEADER_KEY] || [];
        return items;
    }

    protected getBatchSize(): number {
        return MetadataItemSelector.LIST_BATCH_SIZE;
    }

    public getDebounceTime(): number {
        return this.debouncingTime;
    }

    public clearSelectedItems(): void {
        this._selectedItems = [];
        this.reload();
    }

    public isMultiple(): boolean {
        return this._isMultiple;
    }

    public allowMultiSelect(isMultiple: boolean): void {
        this._isMultiple = isMultiple;
    }

    public getSelectedItems(): MetadataItem[] | MetadataItem {
        return this._selectedItems;
    }

    public setSelectedItem(item: MetadataItem): void {
        this._selectedItems = [copyMetadataItem(item)];
        this.ensureSelectedItemFirstInList();
    }

    public reload(): void {
        this.updateMetadataItems('');
    }

    protected groupByType(item: MetadataItem): string|undefined {
        // undefined means that the item will be inserted in no group
        return void 0;
    }

    public getMatchingMetadataItem(itemToMatch: MetadataItem): MetadataItem {
        let index: number = this.getMatchingMetadataItemIndex(itemToMatch);
        if (index < 0) {
            return null;
        }
        return this.items[index];
    }

    public onDropDownToggled(isOpen: boolean): void {
        if (!isOpen) {
            return;
        }

        if (this.loadingState !== util.LoadStates.UNINITIALIZED
            && this.loadingState !== util.LoadStates.INITIALIZATION_FAILED) {
            this.ensureSelectedItemFirstInList();
            return;
        }

        this.updateMetadataItems('');
    }

    public onInputChange(query: string): void {
        this.updateMetadataItems(query);
    }

    public onItemSelected(): void {
        this.selectionHandler(this._selectedItems);
    }

    public getSelectedItemName(index: number = 0): string {
        if (index >= (<MetadataItem[]> this._selectedItems).length) {
            return '';
        }
        return this._selectedItems[index].name;
    }

    public getItemName(item: MetadataItem): string {
        return item.name;
    }

    public getItemDetails(item: MetadataItem): string {
        return null;
    }

    public isEmpty(): boolean {
        if (this.items.length === 0) {
            return true;
        }
        return this.items.none(
            (item: MetadataItem): boolean => !!item.id
        );
    }

    public getItemsList(): MetadataItem[] {
        return this.items;
    }

    public getGroupByFunction() {
        return (item: MetadataItem) => {
            return this.groupByType(item);
        };
    }

    protected getMetadataItems(query: string): IPromise<MetadataItem[]> {

        let searchQuery: string = this.getQueryString(query);
        let metadataType: string = this.getMetadataType();

        return metadataService
                .getMetadataList(
                metadataType,
                {
                    batchSize: MetadataItemSelector.LIST_BATCH_SIZE,
                    pattern: searchQuery,
                    autoCreated: false // not show auto created choices.
                }
            ).then((response: any) => {
                return this.extractItemsFromMetadaResponse(response);
            });
    }

    private get selectedItems(): MetadataItem[] | MetadataItem {
        return this._selectedItems;
    }

    private set selectedItems(item: MetadataItem[] | MetadataItem) {
        // we need this instanceof dance to ensure that we have the good
        // types
        if (item instanceof Array) {
            this._selectedItems = <MetadataItem[]> item;
        } else {
            this._selectedItems = [(<MetadataItem> item)];
        }
    }

    private updateMetadataItems(query: string = ''): IPromise<any> {

        if (!!this.loadDataPromise) {
            this.loadDataPromise.cancel();
        }

        let delay: number = !this.isEmpty()
            ? MetadataItemSelector.LOADING_INDICATOR_DELAY : 0;

        let loadingIndicatorTimer: IPromise<void> = $timeout(
            () => {
                this.setItems([getDummyLoadingItem()]);
            },
            delay
        );

        this.loadingState = util.LoadStates.INITIALIZING;
        this.loadDataPromise = new CancelablePromise(this.getMetadataItems(query));


        this.loadDataPromise.then(
            (items: MetadataItem[]) => {
                this.loadingState = util.LoadStates.INITIALIZED;
                if (items.length === 0) {
                    items = [getDummyNoMatchItem()];
                }
                this.setItems(items);
            },
            (error: any) => {
                this.loadingState = util.LoadStates.INITIALIZATION_FAILED;
                this.logger.error(
                    'Error in fetching metadata items for query',
                    query,
                    error
                );
                this.setItems([getDummyLoadFailedItem()]);
                return $q.reject(error);
            }
        ).finally(
            () => {
                $timeout.cancel(loadingIndicatorTimer);
            }
        );

        return this.loadDataPromise;
    }

    private getMetadataTypeForMetadataItemType(itemType: MetadataItemType): string {
        switch (itemType) {
            case MetadataItemType.PINBOARD:
                return jsonConstants.metadataType.PINBOARD_ANSWER_BOOK;
            case MetadataItemType.ANSWER:
                return jsonConstants.metadataType.QUESTION_ANSWER_BOOK;
            case MetadataItemType.GROUP:
                return jsonConstants.metadataType.GROUP;
            case MetadataItemType.USER:
                return jsonConstants.metadataType.USER;
            default:
                this.logger.error('unsupported metadata item type', itemType);
                return null;
        }
    }

    private getMetadataType(): string {
        return this.getMetadataTypeForMetadataItemType(
            this.metadataItemType
        );
    }

    private setItems(items: MetadataItem[]): void {
        this.items = items;
        this.ensureSelectedItemFirstInList();
    }

    private getMatchingMetadataItemIndex(itemToMatch: MetadataItem): number {
        return this.items.findIndex(
            (listItem: MetadataItem): boolean => {
                return itemToMatch.owner === listItem.owner;
            }
        );
    }

    private ensureSelectedItemFirstInList(): void {

        if (!this._selectedItems.length || this.isMultiple()) {
            return;
        }

        // ensure the selected item is the first one in the list
        var item = this._selectedItems[0];
        let existingItemIndex: number
            = this.getMatchingMetadataItemIndex(item);
        if (existingItemIndex === 0) {
            return;
        }

        if (existingItemIndex >= 0) {
            let existingItem: MetadataItem = this.items[existingItemIndex];
            this.items.splice(existingItemIndex, 1);
            this.items.unshift(existingItem);
        } else {
            this.items.unshift(item);
        }
    }
}
