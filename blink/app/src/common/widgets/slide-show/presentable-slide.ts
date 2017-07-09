/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Interface to be implemented by components that
 * intend to use slide directive.
 */

import {Slide} from './slide';

export interface PresentableSlide {
    getSlide() : Slide;
}
