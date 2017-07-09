/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview This subcomponent fetches manages a select list
 * that allows the user to search for user and group
 */

'use strict';

import {MetadataItem, MetadataItemSelector, MetadataItemType, SelectionHandler}
    from './metadata-item-selector';
import IPromise = angular.IPromise;
import IQService = angular.IQService;
import _ from 'lodash';
import {blinkConstants} from 'src/base/blink-constants';
import {Component, ngRequire} from '../../base/decorators';

let $q: IQService = ngRequire('$q');
let jsonConstants = ngRequire('jsonConstants');
let sessionService = ngRequire('sessionService');
let metadataService = ngRequire('metadataService');

let GROUP = 'GROUP';
let USER = 'USER';

//TODO(Ashish): Refactor to be variables instead of getters, after moving blinkConstants to .ts
function getDummyMoreGroupItem(): MetadataItem {
    return {
        id: '',
        owner: GROUP,
        name: blinkConstants.MORE_ITEMS_MSG,
        type: jsonConstants.principalSubType.GROUP
    };
}

function getDummyMoreUserItem() : MetadataItem {
    return {
        id: '',
        owner: USER,
        name: blinkConstants.MORE_ITEMS_MSG,
        type: jsonConstants.principalSubType.USER
    };
}

interface PrincipalItem extends MetadataItem {
    displayName: string;
}

@Component({
    name: 'bkPrincipalSelector',
    templateUrl: 'src/modules/metadata-item-selector/metadata-item-selector.html'
})
export class PrincipalSelectorComponent extends MetadataItemSelector {

    private selectedGuids: Set<string> = new Set<string>([]);
    private hasData: boolean;


    public constructor(
        private filterCurrentUser: boolean = true,
        selectionHandler: SelectionHandler = _.noop) {

        super(
            MetadataItemType.PRINCIPAL,
            selectionHandler
        );
        this.hasData = true;
    }

    public addIdsToSkip(idsToSkip: string[]): void {
        idsToSkip.forEach((id) => {
            this.selectedGuids.add(id);
        });
    }

    public removeIdsToSkip(idsToSkip: string[]): void {
        idsToSkip.forEach((id) => {
            this.selectedGuids.delete(id);
        });
    }

    public setSelectedGuids(selectedGuids: string[]):void {
        this.selectedGuids = new Set(selectedGuids);
    }

    public hasNoPrincipals() {
        return !this.hasData;
    }

    public skipIdHandler(): string[] {
        let guidToSkips = blinkConstants.GUIDS_TO_SKIP.slice();

        if (sessionService.hasAdminPrivileges() || sessionService.canShareWithAll()) {
            guidToSkips.remove(blinkConstants.ALL_GROUP_GUID);
        }

        let selectedItems: MetadataItem[] = <MetadataItem[]> this.getSelectedItems();
        let selectedGuids: string[] = selectedItems.map(function(item){
            return item.id;
        });
        guidToSkips = guidToSkips.concat(selectedGuids).concat(Array.from(this.selectedGuids));
        return guidToSkips;
    }

    protected groupByType(item: PrincipalItem): string {
        switch (item.type) {
            case jsonConstants.principalSubType.USER:
            {
                return USER;
            }
            case jsonConstants.principalSubType.GROUP:
            {
                return GROUP;
            }
            default: {
                this.logger.warn('Item has no recognized type: ', item);
            }
        }
    }

    protected getMetadataItems(query: string): IPromise<PrincipalItem[]> {
        let searchQuery: string = this.getQueryString(query);
        let promises: IPromise<any>[] = [
            this.getPromise(searchQuery, jsonConstants.metadataType.USER),
            this.getPromise(searchQuery, jsonConstants.metadataType.GROUP),
        ];
        return $q.all(promises).then((responses: any[]) => {
            if (!query || !query.length) {
                if(responses[0].data.headers.length === 0
                    && responses[1].data.headers.length === 0 ) {
                    this.hasData = false;
                } else {
                    this.hasData = true;
                }
            }

            let resp =
                responses.reduce((reducedObject: any[], response: any, currentIndex: number) => {
                    let items: PrincipalItem[]
                        = this.extractItemsFromMetadaResponse(response);

                    items.forEach((item: PrincipalItem) => {
                        reducedObject.push(item);
                    });

                    if (!response.data.isLastBatch) {
                        if (currentIndex === 1) {
                            reducedObject.push(getDummyMoreGroupItem());
                        } else {
                            reducedObject.push(getDummyMoreUserItem());
                        }
                    }
                    return reducedObject;
                }, []);
            return resp;
        });
    }

    public getItemDetails(item: PrincipalItem): string {
        return item.displayName;
    }

    protected extractItemsFromMetadaResponse(response: any): PrincipalItem[] {
        let items: PrincipalItem[]
            = response.data[jsonConstants.MULTIPLE_HEADER_KEY] || [];
        return items;
    }

    private getPromise(query:string, type:string):IPromise<any> {

        let skipIds: string[] = this.skipIdHandler();

        var options = {
            batchSize: this.getBatchSize(),
            pattern: query,
            skipIds : skipIds
        };

        if (this.filterCurrentUser && type === jsonConstants.metadataType.USER) {
            skipIds.push(sessionService.getUserGuid());
        }

        return metadataService.getMetadataList(type, options);
    }
}
