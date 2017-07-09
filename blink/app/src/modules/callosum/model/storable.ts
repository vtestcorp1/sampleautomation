/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview Stroable class similar to callosum storable.
 */
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {MetadataHeader} from './metadata-header';

export class Storable {
    public header: MetadataHeader;

    constructor(jsonStorable?: any) {
        if (jsonStorable) {
            let headerJson: any = jsonStorable[jsonConstants.HEADER_KEY];
            this.header = new MetadataHeader(headerJson);
        }
    }

    public getId(): string {
        return this.header.id;
    }

    public getName(): string {
        return this.header.name;
    }

    public getDescription(): string {
        return this.header.description;
    }

    public getOwner(): string {
        return this.header.owner;
    }

    public getAuthor(): string {
        return this.header.author;
    }
}
