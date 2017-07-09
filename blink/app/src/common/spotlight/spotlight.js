/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Spotlight service to highlight dom elements be selector
 */

'use strict';

blink.app.factory('Spotlight', [ function () {

    var currentSelector;
    var $arrow = $('<div class="spotlight"><div class="arrow-box"></div></div>');

    var focus = function (config) {
        var cssSelector = config.selector;

        if (currentSelector == cssSelector) {
            return;
        }

        if (!!currentSelector) {
            removeFocus(currentSelector);
        }

        currentSelector = cssSelector;
        var $element = $(cssSelector);

        $element.css('box-shadow', '0 0 10px #5c9df5');
        var left = $element.offset().left + $element.width() + config.rightMargin;
        var top = $element.offset().top + config.top;
        $arrow.css('left', left);
        $arrow.css('top', top);
        $('body').append($arrow);

        $(window).on('click.spotlight', function () {
            removeFocus(currentSelector);
            currentSelector = null;
        });
    };

    var removeFocus = function (cssSelector) {
        var selector = cssSelector || currentSelector;
        if (!!selector) {
            $(window).off('click.spotlight');
            $arrow.remove();
            $(cssSelector).css('box-shadow', 'none');
        }
    };

    return {
        focus: focus,
        removeFocus: removeFocus
    };
}
]);
