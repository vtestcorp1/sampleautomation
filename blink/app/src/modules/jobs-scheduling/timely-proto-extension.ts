/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Client extensions added on top of timely proto objects.
 */

declare let tsProto;

module Proto2TypeScript.scheduler {
    interface CronSchedule {
        isEmpty: () => boolean;
    }
}
