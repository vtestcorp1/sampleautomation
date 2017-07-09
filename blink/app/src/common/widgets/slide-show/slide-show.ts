/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview A widget to present a collection in a slide-show mode.
 *
 * Usage:
 * Let us take following example content html:
 * <div class="content-container">
 *     <div ng-repeat="item in collection" class="actual-content"></div>
 * </div>
 *
 * To show a slide-show presentation for a collection of actual-content elements,
 * following annotations are needed:
 * <div class="content-container" slide-show="slideShowConfigurationOptions">
 *     <div ng-repeat="item in collection"
 *          class="actual-content"
 *          slide="concreteImplementationOfSlide">
 *     </div>
 * </div>
 *
 * where, _slideShowConfigurationOptions_ is a dictionary of following options:
 * - presentationTitle: Title string to use as the title of presentation (can be a formatted html)
 * - isPresentable: a closure to determine if a particular collection element should be included
 *                  in the final presentation (the decision might be dynamic and at run time).
 *                  Alternatively, the caller can choose to not annotate a particular child with
 *                  the 'slide' attribute.
 * - sortPredicate: a closure passed to the Array.sort function to sort the collection.
 * (in future, this dictionary should be extended to configure animation options such as
 * delay and easing functions).
 *
 * _concreteImplementationOfSlide_ is an object per collection element that extends and implements
 * the interface of Slide class (the class defined below).
 *
 * As a result of the slideshow directive (and child annotations), the content is configured
 * such that the actual content (original DOM) is used during the presentation.
 * A shell containing the presentation navigator is created as an overlay on the entire screen
 * and the original content DOM is styled to appear on top of the presentation shell
 * one element at a time.
 *
 */

import {Component, ngRequire} from '../../../base/decorators';
import {Slide} from './slide';
import {SlideShowNavigatorComponent} from './slide-show-navigator';
import IAugmentedJQuery = angular.IAugmentedJQuery;
import IScope = angular.IScope;
import _ from 'lodash';
import {UIComponent} from '../../../base/base-types/ui-component';

let angularUtil = ngRequire('angularUtil');

@Component({
    name: 'bkSlideShowV2'
})
export class SlideShowV2Component extends UIComponent {
    private static SLIDESHOW_PADDING = 20;
    private static TRANSITION_OFFSET = 2 * SlideShowV2Component.SLIDESHOW_PADDING + 10;
    private static F5_KEYCODE = 116;

    private element: JQuery;

    private _$slides: JQuery[] = [];
    private _slideModels: Slide[] = [];
    private _slideIdToIndex: {[key:string]: number} = {};

    private _activeSlideIndex: number = -1;
    private _slideTransitionInProgress: boolean = false;
    private _slideNavigationDisabled: boolean = false;
    private _deltaWhileInTransition: number = 0;

    private _keyboardHandler: ((event: JQueryEventObject) => any) = null;
    private _configuration: any;
    private onStart: Function = _.noop;
    private onStop: Function = _.noop;
    private onGoToSlide: Function = _.noop;

    constructor(config: any) {
        super();
        this._configuration = config;
        this.onStart = config.onStart;
        this.onStop = config.onStop;
        this.onGoToSlide = config.onGoToSlide;

        $(window).on('keydown', this.f5KeydownHandler);
    }

    onDestroy() {
        $(window).off('keydown', this.f5KeydownHandler);
    }


    public postLink(element: JQuery) {
        this.element = element;
    }

    /**
     *
     * @param {String} id
     * @param {number} position
     */
    public start = (id: string, position?: number) : void => {
        let $slideContainer: JQuery = this.element;

        let self: SlideShowV2Component = this;
        let $slides: JQuery[] = $slideContainer
            .find('[slide]')
            .filter(function (i, d) {
                return self._configuration.isPresentable($(d));
            })
            .toArray()
            .sort(function (el1, el2) {
                return self._configuration.sortPredicate($(el1), $(el2));
            })
            .map($);

        if (!$slides.length) {
            return;
        }

        this._$slides = $slides;

        $slideContainer.addClass('bk-slides-container');

        if (this._configuration.showNavigator === 'auto') {
            this._configuration.showNavigator = $slides.length > 1;
        }
        $slideContainer.toggleClass('bk-with-navigator', !!this._configuration.showNavigator);

        this.init().goToSlide(id, position);
        this.onStart();
    }

    /**
     * @param {String} id
     * @param {number} position
     */
    public restart(id: string, position: number) {
        this.stop();
        this.start(id, position);
    }

    public isActive(): boolean {
        return this._activeSlideIndex > -1;
    }

    public disableNavigation() {
        this.cleanKeyboardHandler();
        this._slideNavigationDisabled = true;
    }

    public enableNavigation() {
        this.setupKeyboardHandler();
        this._slideNavigationDisabled = false;
    }

    /**
     * A closure that is bound to jQuery.each(). It is called during init phase.
     *
     * @param {number} index Iterator position from Array.each()
     * @param {HTMLElement} slide Result of jQuery.each()
     *
     * @private
     */
    private _processSlideElement(index: number, slide: HTMLElement) {
        let $slide: JQuery = $(slide);
        let slideModel: Slide = (<any> (<IAugmentedJQuery> $slide).scope()).$ctrl.getSlide();

        $slide.data('originalTop', $slide.css('top'));
        $slide.data('originalBottom', $slide.css('bottom'));
        $slide.data('originalLeft', $slide.css('left'));
        $slide.data('originalRight', $slide.css('right'));

        $slide.data('slideModel', slideModel);
        //If slides are draggable, disable dragging
        var slideDragabilly = $slide.data('draggabilly');
        if(!!slideDragabilly) {
            slideDragabilly.disable();
        }

        this._slideModels.push(slideModel);
        this._slideIdToIndex[slideModel.getId()] = index;
    }

    /**
     * Keyboard handler for navigation keys.
     *
     * @param {KeyboardEvent} event
     * @private
     */
    private _onKeydown(event: JQueryEventObject) {
        if ([
                $.ui.keyCode.RIGHT,
                $.ui.keyCode.LEFT,
                $.ui.keyCode.DOWN,
                $.ui.keyCode.UP,
                $.ui.keyCode.ESCAPE
            ].indexOf(event.which) < 0) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        if ([$.ui.keyCode.UP, $.ui.keyCode.LEFT].indexOf(event.which) !== -1) {
            this.goToPreviousSlide();
        } else if ([$.ui.keyCode.DOWN, $.ui.keyCode.RIGHT].indexOf(event.which) !== -1) {
            this.goToNextSlide();
        } else if (event.which === $.ui.keyCode.ESCAPE) {
            this.stop();
        }

        this.forceRender();
    }

    /**
     * Initializes a navigator element for slide show presentation.
     *
     * @private
     */
    private _initializeNavigator(): void {
        let self: SlideShowV2Component = this;

        var $navigator =
            $('<bk-slide-show-navigator bk-ctrl="navigatorCtrl"></bk-slide-show-navigator>');
        $navigator.toggleClass('bk-with-navigator', this._configuration.showNavigator);
        this.element.append($navigator);
        let newScope: IScope = this.element.isolateScope().$new();
        var navigator = {
            slides: this._slideModels,
            getTitle: this._configuration.getTitle,
            stopSlideShow: this.stop.bind(this),
            goToSlide: function (slide) {
                self.goToSlide(slide.getId(), void 0);
            },
            toggleSlideWithNavigator: this._toggleSlideWithNavigator.bind(this)
        };
        (<any> newScope).navigatorCtrl = new SlideShowNavigatorComponent(navigator);
        angularUtil.getCompiledElement($navigator, newScope);
    }

    /**
     * Called during cleanup phase for each slide element.
     *
     * @param {JQuery} $slide Result of jQuery.each()
     *
     * @return {boolean} False if results in a no-op.
     * @private
     */
    private _cleanupSlideElement($slide: JQuery): boolean {
        var slideTop = $slide.css('top'),
            slideBottom = $slide.css('bottom'),
            slideLeft = $slide.css('left'),
            slideRight = $slide.css('right');

        //Re-enable draggability of slides.
        var slideDragabilly = $slide.data('draggabilly');
        if(!!slideDragabilly) {
            slideDragabilly.enable();
        }

        // No-op if no cleanup is really needed. This way we avoid an unnecessary re-rendering
        // of slide content (chart for example).
        if (slideTop === $slide.data('originalTop') &&
            slideBottom === $slide.data('originalBottom') &&
            slideLeft === $slide.data('originalLeft') &&
            slideRight === $slide.data('originalRight')) {
            return false;
        }

        $slide.css({
            'top': $slide.data('originalTop'),
            'bottom': $slide.data('originalBottom'),
            'left': $slide.data('originalLeft'),
            'right': $slide.data('originalRight')
        });
        if (!!$slide.data('slideModel')) {
            $slide.data('slideModel').markDone();
        }

        return true;
    }

    /**
     *
     * @private
     */
    private cleanKeyboardHandler(): void {
        $(window).off('keydown.slideshow', this._keyboardHandler);
    }

    /**
     *
     * @private
     */
    private _cleanupNavigator(): void {
        this.element.find('.bk-presentation-mode-container').remove();
    }

    /**
     * Adds animation to transition from current to next/previous slide.
     *
     * @param {boolean=} forward If true, transitions to next slide,
     * else previous slide (if applicable).
     *
     * @private
     */
    private _transitionSlide(forward: boolean) {
        if (this._slideNavigationDisabled) {
            return;
        }

        var delta = forward ? 1 : -1;
        if (this._slideTransitionInProgress) {
            this._deltaWhileInTransition += delta;
            return;
        }

        var activeSlide = this._$slides[this._activeSlideIndex],
            $slideToTransitionIn = this._$slides[this._activeSlideIndex + delta],
            activeSlideHeight = activeSlide.height();

        $slideToTransitionIn.css({
            top: delta * (activeSlideHeight + SlideShowV2Component.TRANSITION_OFFSET),
            bottom: -1 * delta * (activeSlideHeight + SlideShowV2Component.TRANSITION_OFFSET)
        }).addClass('bk-in-transition');

        var transitionSlideModel = <Slide> $slideToTransitionIn.data('slideModel');
        transitionSlideModel.markInactive();
        transitionSlideModel.onTransition();

        var animationCount = 2;

        var self = this;
        var resetSlideAnimationState = function () {
            $slideToTransitionIn.removeClass('bk-in-transition');
            self.goToSlide(void 0, self._activeSlideIndex + delta + self._deltaWhileInTransition);
            self._slideTransitionInProgress = false;
            self._deltaWhileInTransition = 0;
            self.forceRender();
        };
        activeSlide.animate({
            top: -1 * delta * (activeSlideHeight + SlideShowV2Component.TRANSITION_OFFSET),
            bottom: delta * (activeSlideHeight + SlideShowV2Component.TRANSITION_OFFSET)
        }, {
            queue: false,
            complete: function () {
                animationCount--;
                if (!animationCount) {
                    resetSlideAnimationState();
                }
            }
        });
        $slideToTransitionIn.animate({
            top: SlideShowV2Component.SLIDESHOW_PADDING,
            bottom: SlideShowV2Component.SLIDESHOW_PADDING
        }, {
            queue: false,
            complete: function () {
                animationCount--;
                if (!animationCount) {
                    resetSlideAnimationState();
                }
            }
        });
        this._slideTransitionInProgress = true;
    }

    private _toggleSlideWithNavigator() {
        if (this._slideNavigationDisabled) {
            return;
        }
        var $slide = this._$slides[this._activeSlideIndex],
            slideModel = $slide.data('slideModel'),
            $slideContainer = this.element;
        if ($slideContainer.hasClass('bk-with-navigator')) {
            $slide.animate({
                left: SlideShowV2Component.SLIDESHOW_PADDING
            }, {
                queue: false,
                complete: function () {
                    $slideContainer.removeClass('bk-with-navigator');
                    slideModel.onReflow();
                }
            });
        } else {
            $slide.animate({
                left: 300 + SlideShowV2Component.SLIDESHOW_PADDING
            }, {
                duration: 200,
                complete: function () {
                    $slideContainer.addClass('bk-with-navigator');
                    slideModel.onReflow();
                }
            });
        }
    }

    /**
     *
     * @return {boolean}
     */
    private hasPreviousSlide(): boolean {
        return this._activeSlideIndex > 0;
    }

    private goToPreviousSlide() {
        if (!this.hasPreviousSlide()) {
            return;
        }

        this._transitionSlide(false);
    }

    /**
     *
     * @return {boolean}
     */
    private hasNextSlide(): boolean {
        return this._activeSlideIndex < this._slideModels.length - 1;
    }

    private goToNextSlide() {
        if (!this.hasNextSlide()) {
            return;
        }

        this._transitionSlide(true);
    }

    /**
     *
     * @param {string} id Go to the slide with this id.
     * @param {number} position Go to the slide at this position in the array.
     */
    private goToSlide(id: string, position: number) {
        position = (position !== void 0) ? position : 0;

        if ((id !== void 0) && (this._slideIdToIndex[id] !== void 0)) {
            position = this._slideIdToIndex[id];
        }

        this._$slides.at(this._activeSlideIndex).data('slideModel').markInactive();
        this._activeSlideIndex = Math.min(position, this._$slides.length - 1);

        this._$slides.forEach(function (slide) {
            slide.removeClass('bk-slide-active bk-slide-previous bk-slide-next');
        });
        var $activeSlide = this._$slides[this._activeSlideIndex];
        $activeSlide.addClass('bk-slide-active').css({
            top: SlideShowV2Component.SLIDESHOW_PADDING,
            bottom: SlideShowV2Component.SLIDESHOW_PADDING
        });
        $activeSlide.data('slideModel').markActive();

        this.onGoToSlide($activeSlide);

        if (this.hasPreviousSlide()) {
            this._$slides[this._activeSlideIndex - 1].addClass('bk-slide-previous');
        }
        if (this.hasNextSlide()) {
            this._$slides[this._activeSlideIndex + 1].addClass('bk-slide-next');
        }
    }

    private stop() {
        this._activeSlideIndex = -1;

        this._cleanupNavigator();
        this.cleanKeyboardHandler();
        var self = this;

        self._$slides.forEach(function(slideEl) {
            slideEl.removeClass('bk-slide-active bk-slide-previous bk-slide-next');
            self._cleanupSlideElement(slideEl);
        });
        self._$slides = [];
        self._slideModels = [];
        self._slideIdToIndex = {};
        this.onStop();
    }

    private setupKeyboardHandler() {
        if (this._keyboardHandler) {
            this.cleanKeyboardHandler();
        } else {
            this._keyboardHandler =
                (<((event: JQueryEventObject) => any)> this._onKeydown.bind(this));
        }

        $(window).on('keydown.slideshow', this._keyboardHandler);
    }

    /**
     *
     * @return {SlideShowV2Component}
     */
    private init = function (): SlideShowV2Component {
        let self: SlideShowV2Component = this;
        this._$slides.forEach(function (slideElement, index) {
            self._processSlideElement(index, slideElement);
        });

        self.setupKeyboardHandler();
        // Initialize the presentation mode shell.
        self._initializeNavigator();

        return self;
    };

    private f5KeydownHandler = (event) => {
        if (event.which !== SlideShowV2Component.F5_KEYCODE) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        this.start(void 0, void 0);
    }
}
