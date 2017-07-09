/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview Metadata header class
 */
import {jsonConstants} from '../../viz-layout/answer/json-constants';

export class MetadataHeader {
    public id;
    public name: string;
    public description: string;
    public owner: string;
    public author: string;
    public isHidden: boolean;
    public isDeleted: boolean;

    public constructor (jsonHeader?: any) {
        if(jsonHeader) {
            this.id = jsonHeader[jsonConstants.header.ID];
            this.name = jsonHeader[jsonConstants.header.NAME];
            this.description = jsonHeader[jsonConstants.header.DESCRIPTION];
            this.owner = jsonHeader[jsonConstants.header.OWNER];
            this.author = jsonHeader[jsonConstants.header.AUTHOR];
            this.isHidden = jsonHeader[jsonConstants.header.IS_HIDDEN];
            this.isDeleted = jsonHeader[jsonConstants.header.IS_DELETED];
        }
    }
}
