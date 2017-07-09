/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh
 *
 * @fileoverview A violation instance holder as received from
 * callosum metadata/analyze get api call.
 *
 * A sample violation:
 * [ {
 * 'ruleType':'MaxLengthExceeded',
 * 'ruleId':10001,
 * 'ruleName':'Name length exceeded limit',
 * 'rationale':'Long names are hard to search',
 * 'ruleSubType':'Naming',
 * 'violationMessage':'Name:AggrWsWithWindowingFunctionsAndMonthlyBucket is
  * greater than length: 20'}]
 */
import {Provide} from '../../base/decorators';

@Provide('Violation')
export class Violation {

    public ruleType : string;
    public ruleId : string;
    public ruleName: string;
    public rationale: string;
    public ruleSubType: string;
    public violationMessage: any;

    public constructor( violationJson?: any) {
        if(!violationJson) {
            return;
        }
        this.ruleType = violationJson.ruleType;
        this.ruleId = violationJson.ruleId;
        this.ruleName = violationJson.ruleName;
        this.rationale = violationJson.rationale;
        this.ruleSubType = violationJson.ruleSubType;
        this.violationMessage = violationJson.violationMessage;
    }
}

@Provide('ViolationConstants')
export class ViolationConstants {
    public static readonly ruleTypes : any = {
        MaxLengthExceeded : 'MaxLengthExceeded',
        ContainsSearchKeywords : 'ContainsSearchKeywords',
        ContainsPrefix : 'ContainsPrefix',
        ColumnsLimitExceeded : 'ColumnsLimitExceeded',
        IndexedColumnsLimitExceeded : 'IndexedColumnsLimitExceeded',
        ChasmTrapQueryExists : 'ChasmTrapQueryExists'
    };
    public static readonly metadataTypes : any = {
        LogicalTable : 'LOGICAL_TABLE',
        LogicalColumn : 'LogicalColumn',
    };
    public static readonly status : any = {
        Pass : 'pass',
        Fail : 'fail'
    };
}
