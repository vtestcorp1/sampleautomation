/**
 * Copyright: ThoughtSpot Inc. 2102-2015
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview  Json for carousel content and functions
 *
 */

'use strict';

blink.app.factory('carouselContent', function () {
    var CarouselContent =  function(id, slides, cssClass) {
        this.carouselId = id;
        this.slides = slides;
        this.carouselClass = cssClass;

        this.indicators = true;
        this.prevBtn = true;
        this.prevBtnClass = 'arrowLeft';
        this.prevIcon = 'bk-style-icon-arrow-left';
        this.nextBtn = true;
        this.nextBtnClass = 'arrowRight';
        this.nextIcon = 'bk-style-icon-arrow-right';

        this.markActive = function(index) {
            this.slides[index].active = true;
        };
    };

    return CarouselContent;
});
