/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Exports public types from callosum defined in Proto
 */

import {Provide} from '../decorators';

declare const tsProto;

export let RequestTypes = tsProto.callosum.RequestType.E;
export let ClientTypes = tsProto.callosum.ClientType.E;

Provide('callosumTypes')(
    {
        RequestTypes,
        ClientTypes
    }
);
