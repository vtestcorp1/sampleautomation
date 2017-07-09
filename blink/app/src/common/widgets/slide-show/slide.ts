/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */

import _ from 'lodash';
import {Provide} from '../../../base/decorators';

@Provide('Slide')
export class Slide {
    public getTitle: (() => string);
    public onReflow: Function = _.noop;
    public onTransition: Function = _.noop;
    private _id: string;
    private _active: boolean = false;
    // Notification callbacks that can be provided in the concrete implementations
    // of the slide class.
    // The callbacks corresponds to various states that a slide can be in.
    private onActive: Function = _.noop;
    private onInActive: Function = _.noop;
    private onDone: Function = _.noop;

    constructor(id: string, getTitle: (() => string), onActive: Function, onReflow: Function,
                onDone: Function) {
        this._id = id;
        this.getTitle = getTitle;
        this.onActive = onActive;
        this.onReflow = onReflow;
        this.onDone = onDone;
    }

    /**
     * Returns a unique identifier for this slide.
     * @return {string}
     */
    public getId(): string {
        return this._id;
    }

    /**
     *
     * @return {boolean}
     */
    public isActive(): boolean {
        return this._active;
    }

    /**
     * When a slide is made the main(active),
     * slide-show controllers marks the slide model as active.
     * This triggers the notifyActive callback.
     */
    public markActive(): void {
        this._active = true;
        this.onActive();
    }

    /**
     * When a slide is made the inactive,
     * slide-show controllers marks the slide model as inactive.
     * This triggers the notifyInactive callback.
     */
    public markInactive(): void {
        this._active = false;
        this.onInActive();
    }

    // TODO(vibhor): Rationalize the start/stop of slide show in terms of mark/onDone.
    /**
     * When a slideshow ends, the controller marks each slide model as "Done".
     * This triggers the onDone callback.
     */
    public markDone(): void {
        this._active = false;
        this.onDone();
    }
}
