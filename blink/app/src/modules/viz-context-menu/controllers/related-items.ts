/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview Component for showing the related items in the context
 *               menu along with showUnderlying etc.
 */
import {BaseComponent} from '../../../base/base-types/base-component';
import {blinkConstants} from '../../../base/blink-constants';
import {Component, ngRequire} from '../../../base/decorators';
import {RuntimeFilterUtil} from '../../related-link/filter/runtime-filter-util';
import {getRelatedItems, getRelatedLinks} from '../../related-link/related-items-service';
import {RelatedLinkCache, RelatedLinkCacheItem} from '../../related-link/related-link-cache';

declare var flags: any;
let navService = ngRequire('navService');

@Component({
    name: 'bkRelatedItems',
    templateUrl: 'src/modules/viz-context-menu/templates/related-items.html'
})
export class RelatedItemsComponent extends BaseComponent {

    private static cache: RelatedLinkCache = new RelatedLinkCache();

    public relatedItems: Array<any> = [];
    public onItemsFetched: Function;
    public close: any;
    public RELATED_ITEMS_TITLE: string;

    private contextMenuData: any;
    private showRelatedLinks: boolean = false;
    private showRelatedItems: boolean = false;

    constructor(contextMenuData: any,
                onItemsFetched: Function,
                close: Function) {
        super();
        this.RELATED_ITEMS_TITLE = this.strings.contextMenu.RELATED_ITEMS;
        this.contextMenuData = contextMenuData;
        this.onItemsFetched = onItemsFetched;
        this.close = close;


        this.showRelatedLinks = flags.getValue('showRelatedLinks');
        this.showRelatedItems = flags.getValue('showRelatedItems');
    }

    public fetchRelatedItems() {

        let relatedLinks = [];
        // if related links is enabled get related links.
        if (this.showRelatedLinks) {
            relatedLinks = getRelatedLinks(this.contextMenuData.vizModel);
        }

        // if related items is enabled, process it.
        if (!this.showRelatedItems) {
            this.relatedItems = relatedLinks;
            this.onItemsFetched(true);
            return;
        }
        if (!this.contextMenuData
            || !this.contextMenuData.columnValuePairs
            || !this.contextMenuData.documentModel) {
            return;
        }

        let filteredPair = this.contextMenuData.columnValuePairs[0];
        if (!filteredPair) {
            return;
        }
        let column = filteredPair.column;
        let columnGuid = column.getOriginLogicalColumnGuid();
        if (!columnGuid) {
            return;
        }
        let answerId = this.contextMenuData.documentModel.getId();

        getRelatedItems(columnGuid, answerId)
            .then((relatedItems) => {
                if (relatedItems && relatedItems.length > 0) {
                    this.relatedItems = relatedLinks.concat(relatedItems);
                    this.onItemsFetched(true);
                }
            });
    }

    public onRelatedItemClicked(item: any) {
        let filter : any = {};
        let id;
        let type;
        if (!!item.content) {
            // we have content so this is from related link
            id = item.id;
            type = blinkConstants.RELATED_LINK_TYPE;

            // get the runtime filter
            let filters = item.getFilters(
                this.contextMenuData,
                true /* filterOnlyRelatedColumns */
            );

            // store the filters in cache service, so that we can retrieve
            // them in related link page.
            let cacheItem = new RelatedLinkCacheItem(item, filters);
            if (filters.length > 0) {
                filter = filters[0].filter;
            }
            RelatedItemsComponent.cache.putObject(id, cacheItem);
        } else {
            // This related item was discovered from lineage.
            id = item.id;
            type = item.type;

            // get the runtime filter
            filter = RuntimeFilterUtil.getApplyAsFilters(this.contextMenuData);
        }

        // navigate to destination with runtime filter applied.
        navService.navigateTo(type, id, filter);
        this.close();
    }
}
