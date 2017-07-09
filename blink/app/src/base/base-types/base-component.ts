import IController = angular.IController;

/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A collection of fundamental types used across the application.
 */
import _ from 'lodash';
import {strings} from 'src/base/strings';

export abstract class BaseComponent implements IController {
    public strings = strings;

    public $onDestroy = _.noop;

    /**
     * el will be passed only for the components that extend UIComponent.
     * @param el
     */
    public onDestroy(el?: JQuery) {
        //
    }
}
