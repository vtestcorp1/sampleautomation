import _ from 'lodash';

/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh
 *
 * @fileoverview A wrapper for violations.
 *
 * A sample violation:
     [
         {
           'ruleType': 'MaxLengthExceeded',
           'ruleId': 10001,
           'ruleName': 'Name length exceeded limit',
           'rationale': 'Long names are hard to search',
           'ruleSubType': 'Naming',
           'violationMessage': {
             'type': 'LogicalColumn',
             'id': '191111f7-2922-4393-8402-12684cce4f61',
             'recommendedValue': '30',
             'actualValue': ""
           }
         }
     ]
 */
import {Violation} from './violation';
import Dictionary = _.Dictionary;

export class Violations {

    public violationsByType : Dictionary<Violation[]>;

    private ruleType : string = 'ruleType';
    private violations: Array<Violation>;

    constructor (violations) {
        this.violations = violations;
        this.init();
    }

    public getViolations() : Array<Violation> {
        return this.violations;
    }

    public totalCount() : number {
        return this.violations.length;
    }

    private init() : void {
        this.violationsByType = _.groupBy(this.violations, this.ruleType);
    }
}
