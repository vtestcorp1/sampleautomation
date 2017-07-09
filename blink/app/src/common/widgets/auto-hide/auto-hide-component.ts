import _ from 'lodash';
import {BaseComponent} from 'src/base/base-types/base-component';
import {Component, ngRequire} from 'src/base/decorators';

let $timeout: angular.ITimeoutService = ngRequire('$timeout');

@Component({
    name: 'bkAutoHide',
    templateUrl: 'src/common/widgets/auto-hide/auto-hide.html',
    transclude: true
})
export class AutoHideComponent extends BaseComponent {

    private showing: boolean = false;
    private timer: angular.IPromise<void> = null;

    constructor(private autoHideInterval: number,
                private hidingHandler: (wasAutoHidden: boolean) => void = null) {

        super();

        if (!this.hidingHandler) {
            this.hidingHandler = _.noop;
        }
    }

    public isShowing(): boolean {
        return this.showing;
    }

    public show(): void {
        this.setUpTimer();
        this.showing = true;
    }

    public hide(): void {
        this.clearTimer();
        this.showing = false;
        this.hidingHandler(false);
    }

    private clearTimer(): void {
        if (this.timer) {
            $timeout.cancel(this.timer);
        }
        this.timer = null;
    }

    private setUpTimer(): void {
        this.clearTimer();

        var autoHide: AutoHideComponent = this;
        this.timer = $timeout(function(){
            autoHide.autoHide();
        }, this.autoHideInterval);
    }

    private autoHide(): void {
        this.clearTimer();
        this.showing = false;
        this.hidingHandler(true);
    }
}
