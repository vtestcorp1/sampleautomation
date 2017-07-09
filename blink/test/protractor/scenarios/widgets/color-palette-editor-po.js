/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var colorConfigurator = require('./color-configurator-po.js');

var locators = {
    COLOR_CONFIGURATOR: by.css('.bk-color-palette-editor-color-configurator')
};

function setFirstNColors(rootElement, colorsArray) {
    var colorConfigurators = rootElement.all(locators.COLOR_CONFIGURATOR);

    for (var i = 0; i < colorsArray.length; ++i) {
        colorConfigurator.setColor(
            colorConfigurators.get(i),
            colorsArray[i]
        );
    }
}

module.exports = {
    locators: locators,
    setFirstNColors: setFirstNColors
};
