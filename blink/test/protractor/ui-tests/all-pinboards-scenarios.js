
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');
var pinboards = require('../scenarios/pinboards/pinboards.js');
var common = require('../scenarios/common.js');
var pinboards = require('../scenarios/pinboards/pinboards.js');
var slideshow = require('../scenarios/slide-show/slide-show.js');
var nav = common.navigation;
var util = common.util;


describe('Pinboards', function () {

    beforeEach(function () {
        //slideshow.closeSlideShow();
        return $('.bk-close-btn').isPresent().then(function (present) {
            if (present) {
                return $('.bk-close-btn').isDisplayed();
            }
        }).then(function (displayed) {
            if (displayed) {
                return base.closeSlideShow();
            }
        })
        return nav.goToPinboardsSection();
    });

    function goThroughSlideShow(pinboard) {
        return pinboards.startSlideShow().then(function () {
            var chain = base.readNumberOfSlides().then(function (length) {
                console.log("length = " + length);
                // Make sure we always start from the first slide
                if (length > 1) {
                    chain = chain.then(function () {
                        base.clickFirstSlide();
                    });
                }
                var vizNumber = 0;

                var shotASlide = function () {
                    vizNumber++;
                    return base.takeScreenshot(
                        'pinboard-' + pinboard.name + '[' + pinboard.owner + '][' + vizNumber + ']',
                        'Screenshot for pinboard "' + pinboard.name + '" (' + pinboard.owner + ')\n' +
                        'Viz #' + vizNumber,
                        // Being here means there was no error on pinboard page
                        false,
                        // Longer sleep time to allow animations to finish
                        1500
                    ).then(function () {
                        return browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
                    });
                };

                for (var i = 0; i < length; i++) {
                    chain = chain.then(shotASlide);
                }
            });
            return chain;
        }).then(function () {
            return base.closeSlideShow();
        });
    };

    function processPinboard(pinboard, screenShotName, error) {
        return base.hasErrorAlert().then(function (hasAlert) {
            if (hasAlert) {
                base.expandError();
            }
            base.takeFullPageScreenshot(
                'bk-answer-canvas',
                screenShotName,
                'Full page screenshot for pinboard "' + pinboard.name + '" (' + pinboard.owner + ')\n',
                 error || hasAlert
            );
            if (!error && !hasAlert) {
                return goThroughSlideShow(pinboard);
            }
        });
    };

    // safeguard for case where skip is specified in params instead of start/end
    var start = -1;
    var end = -1;
    if (!!browser.params.skip) {
        console.log("skip is specified in params");
        start = browser.params.skip;
        end = browser.params.answers.length;
    } else {
        start = browser.params.start;
        end = browser.params.end;
    }
    console.log("start = " + start + ", end = " + end);
    var length =  end - start + 1;
    console.log("length = " + length);
    // browser.params.pinboards is populated in onPrepare method of
    // pinboards_config.js
    // this is a bit hacky way to get list of all pinboards before describing tests
    base.forEachWithSlice(browser.params.pinboards, function (pinboard) {
        var name = 'pinboard-' + pinboard.name + '[' + pinboard.owner + '][FULL_PAGE]';
        if (base.shouldSkipTest(name)) {
            return;
        }
        it('should open pinboard ' + pinboard.name, function () {
            if (base.shouldSkipTest(name)) {
                return;
            }
            base.openPinboardById(pinboard.owner).then(function () {
                //return $(pinboards.PINBOARD_LOADED).isPresent().then(function (success) {
                //    console.log("pinboard loaded okay");
                //    return processPinboard(pinboard, name, !success);
                return pinboards.waitForLoaded().then(function (success) {
                    return processPinboard(pinboard, name, !success);
                });
            });
        });
    }, start, length);
});
