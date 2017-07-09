/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Exports public types from blink defined in Proto
 */

import _ from 'lodash';
import {Provide} from '../decorators';

declare const tsProto;

export let UserWorkflowActionTypes = tsProto.blink.workflow.UserWorkflowActionType.E;
export let UserWorkflowActionNames = _.invert(tsProto.blink.workflow.UserWorkflowActionType.E);

Provide('blinkTypes')(
    {
        UserWorkflowActionTypes
    }
);
