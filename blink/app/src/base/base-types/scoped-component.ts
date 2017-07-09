import IScope = angular.IScope;
import IAngularEvent = angular.IAngularEvent;
import {ngRequire} from '../decorators';
import {BaseComponent} from './base-component';

let safeApply = ngRequire('safeApply');

export abstract class ScopedComponent extends BaseComponent {
    private _scope: IScope;
    private _isScopeSet: boolean = false;
    private _events: Map<string, (event: IAngularEvent, ...args: any[]) => any>;

    constructor() {
        super();
        this._events = new Map<string, (event: IAngularEvent, ...args: any[]) => any>();
    }

    public setScope(value: IScope) {
        this._scope = value;
        this._isScopeSet = true;
        this._events.forEach((callback, event) => {
            this._scope.$on(event, callback);
        });
    }

    protected broadcast(event: string, ...args: any[]) {
        this._scope.$broadcast.apply(this._scope, [event, ...args]);
    }

    protected emit(event: string, ...args: any[]) {
        this._scope.$emit.apply(this._scope, [event, ...args]);
    }

    protected on(event: string, callback: (event: IAngularEvent, ...args: any[]) => any) {
        this._events.set(event, callback);
        if (this._isScopeSet) {
            this._scope.$on(event, callback);
        }
    }

    /**
     * SafeApply for components. Any change that needs
     * to be triggered as part of non-angular aware code needs to
     * trigger a $digest and $apply cycles over a scope so that
     * corresponding UI changes takes place.
     */
    protected forceRender() {
        safeApply(this._scope);
    }

    /**
     * Creates a child scope on the current scope
     *
     * @returns {IScope}
     */
    protected createChildScope(): IScope {
        return this._scope.$new();
    }
}
