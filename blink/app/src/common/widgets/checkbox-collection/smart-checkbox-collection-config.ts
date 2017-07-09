/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
*
* @fileoverview Exports a config class for SmartCheckboxCollection.
*/
import {Provide} from '../../../base/decorators';


@Provide('SmartCheckboxCollectionConfig')
export class SmartCheckboxCollectionConfig {
    constructor(public selectedValuesToDisplay: number = 15,
                public readOnlyValuesToDisplay: number = 15,
                public unselectedValuesToDisplay: number = 100,
                public searchValuesToDisplay: number = 100,
                public disallowSelectAll: boolean = false,
                public disallowSelectAllMsg: string = '',
                public hideBulkActions: boolean = false) {
    }
}
