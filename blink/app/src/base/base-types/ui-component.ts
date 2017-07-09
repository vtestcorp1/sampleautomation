import _ from 'lodash';
import {ScopedComponent} from './scoped-component';

export abstract class UIComponent extends ScopedComponent {
    public $postLink = _.noop;
    /**
     * @type {boolean} If the component is already linked or not.
     */
    private _isLinked: boolean = false;
    private _windowListeners: Array<string> = [];

    set isLinked(linked: boolean) {
        this._isLinked = linked;
    }

    get isLinked(): boolean {
        return this._isLinked;
    }

    /**
     * Since dom manipulations are not allowed before linking in
     * complete. This lifecycle method servers as the point when dom
     * manipulations can start taking place.
     * @param element: JQuery
     */
    public postLink(element: JQuery) {
        //
    }

    public addWindowListener(eventName: string, callback: (event: JQueryEventObject) => void) {
        if (this._windowListeners.indexOf(eventName) >= 0) {
            throw Error('Only one window event listener can be added for a given event name.');
        }
        this._windowListeners.add(eventName);
        $(window).on(eventName, callback);
    }

    public onDestroy(el) {
        this._windowListeners.forEach((eventName: string) => {
            $(window).off(eventName);
        });
    }
}
