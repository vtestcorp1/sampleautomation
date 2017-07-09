/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Enum class for possible fields in property objects in our topo json data.
 *
 */
import {Provide} from '../../../../../../../base/decorators';
import StringEnumBase from '../../../../../../../base/StringEnumBase';

@Provide('GeoPropField')
export default class GeoPropField extends StringEnumBase {
    static GEOID = new GeoPropField('GEOID');
    static NAME = new GeoPropField('NAME');
    static ADMIN_DIV_1 = new GeoPropField('ADMIN_DIV_1');
    static LATLONG = new GeoPropField('latlng');
    static NAME_LONG = new GeoPropField('NAME_LONG');
    static NAME_SORT = new GeoPropField('NAME_SORT');
    static ADMIN = new GeoPropField('ADMIN');
    static FORMAL_EN = new GeoPropField('FORMAL_EN');
    static ISO_A3 = new GeoPropField('ISO_A3');
}
