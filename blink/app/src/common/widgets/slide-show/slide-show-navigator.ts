import {UIComponent} from '../../../base/base-types/ui-component';
import {Component} from '../../../base/decorators';
import {strings} from '../../../base/strings';

@Component({
    name: 'bkSlideShowNavigator',
    templateUrl: 'src/common/widgets/slide-show/slide-show-navigator.html',
    transclude: true
})
export class SlideShowNavigatorComponent extends UIComponent {
    public strings = strings;

    private element: JQuery;

    private _inSizingTransition = false;
    private _isCollapsed = false;
    private _navigator: any;

    constructor(navigator: any) {
        super();
        this._navigator = navigator;
    }

    public postLink(element: JQuery) {
        this.element = element;
    }

    get navigator(): any {
        return this._navigator;
    }

    get isCollapsed(): boolean {
        return this._isCollapsed;
    }

    get inSizingTransition(): boolean {
        return this._inSizingTransition;
    }

    public expandPanel(): void {
        if (!this._isCollapsed) {
            return;
        }
        this.togglePanelWidth();
    }

    public collapsePanel(): void {
        if (this._isCollapsed) {
            return;
        }
        this.togglePanelWidth();
    }

    private togglePanelWidth(): void {
        var self = this;
        self._inSizingTransition = true;

        this.element.find('.bk-slide-show-navigator').animate({
            width: 'toggle'
        }, {
            queue: false,
            complete: function () {
                self._isCollapsed = !self._isCollapsed;
                self._inSizingTransition = false;
                self.forceRender();
            }
        });

        self._navigator.toggleSlideWithNavigator();
    }
}
