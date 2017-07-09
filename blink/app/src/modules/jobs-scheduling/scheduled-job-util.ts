/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Util for scheduled timely jobs.
 */

import {ngRequire} from '../../base/decorators';
import {PrincipalType} from '../share/share-principal/share-principal';

let schedulerService = ngRequire('schedulerService');

export function updateJobSchedule(job, scheduleConfig, recipients, logger) {
    let groups: string[] = [];
    let users: string[] = [];
    let emails: string[] = [];

    let schedule = schedulerService.getJobScheduleFromConfig(scheduleConfig).cronPattern;
    job.jobSchedule.setCronSchedule(
        schedule.second,
        schedule.minute,
        schedule.hour,
        schedule.dayOfMonth,
        schedule.month,
        schedule.dayOfWeek
    );

    // Needed for OneTime scheduled jobs.
    job.setScheduledState();

    recipients.forEach(principal => {
        switch (principal.sharingType) {
            case PrincipalType.EMAIL: {
                emails.push(principal.name);
                break;
            }
            case PrincipalType.GROUP: {
                groups.push(principal.id);
                break;
            }
            case PrincipalType.USER: {
                users.push(principal.id);
                break;
            }
            default:{
                logger.error('Unknown principal type for report', principal.sharingType);
            }
        }
    });

    job.setUsers(users);
    job.setGroups(groups);
    job.setEmails(emails);
}
