/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Model for representing geographic role defined for a column's data.
 * Example:
 * new GeoConfig({
 *     type: 'ZIP_CODE',
 *     parent: {
 *         type: ADMIN_DIV_0,
 *         fixedValue: 'US'
 *     }
 * })
 * See the detailed explanation of the structure in the corresponding Java class, i.e. GeoConfig.
 */

import {Provide} from 'src/base/decorators';

interface GeoConfigJson {
    type: string;
    fixedValue?: string;
    columnGuid?: string;
    customFileGuid?: string;
    parent?: GeoConfigJson;
}

@Provide('GeoConfig')
export default class GeoConfig {

    private type: string;
    private fixedValue: string|undefined;
    private columnGuid: string|undefined;
    private customFileGuid: string|undefined;
    private parent: GeoConfig|undefined;

    private static getJsonInner(geoConfig: GeoConfig): GeoConfigJson {
        let json: any = {
            type: geoConfig.type
        };
        if (!!geoConfig.fixedValue) {
            json.fixedValue = geoConfig.fixedValue;
        }
        if (!!geoConfig.columnGuid) {
            json.columnGuid = geoConfig.columnGuid;
        }
        if (!!geoConfig.customFileGuid) {
            json.customFileGuid = geoConfig.customFileGuid;
        }
        if (!!geoConfig.parent) {
            json.parent = GeoConfig.getJsonInner(geoConfig.parent);
        }
        return json;
    }

    constructor(geoConfigJson: GeoConfigJson) {
        this.type = geoConfigJson.type;
        this.fixedValue = geoConfigJson.fixedValue;
        this.columnGuid = geoConfigJson.columnGuid;
        this.customFileGuid = geoConfigJson.customFileGuid;
        if (!!geoConfigJson.parent) {
            this.parent = new GeoConfig(geoConfigJson.parent);
        }
    }

    public getType() {
        return this.type;
    }

    public setType(type) {
        this.type = type;
    }

    public getFixedValue() {
        return this.fixedValue;
    }

    public setFixedValue(fixedValue: string) {
        return this.fixedValue = fixedValue;
    }

    public getColumnGuid() {
        return this.columnGuid;
    }

    public setColumnGuid(columnGuid: string) {
        return this.columnGuid = columnGuid;
    }

    public getCustomFileGuid() {
        return this.customFileGuid;
    }

    public setCustomFileGuid(customFileGuid: string) {
        return this.customFileGuid = customFileGuid;
    }

    public getParent() {
        return this.parent;
    }

    public setParent(parent: GeoConfig) {
        this.parent = parent;
    }

    public getJson() {
        return GeoConfig.getJsonInner(this);
    }

    public getCacheKey() {
        return JSON.stringify(this.getJson());
    }
}
