/**
 * Created by Xuan Zhang (shawn@thoughtspot.com), Shitong Shou
 * Created @ Aug 10, 2015
 * @fileoverview e2e scenarios around metaphone (in sage autocompletion)
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Metaphone test: existing code', function() {
    var start = 0,
        end = METAPHONE_TEST.length;

    function testMetaphone(index) {
        describe('should show correct list of suggestions based on metaphone rule', function() {
            var test = METAPHONE_TEST[index],
                count = test.count,
                mpCode = test.mpCode,
                queries = test.queries,
                results = test.results;

            beforeEach(function() {
                deselectAllTableSources();
                goToAnswer();
                selectSageSources([METAPHONE_TEST_DATA]);
            });

            it(count + '. should test code -- ' + mpCode, function() {
                for (var i = 0; i < queries.length; i++) {
                    sageInputElement().enter(queries[i]);
                    waitForElement(SAGE_DROPDOWN);

                    for (var j = 0; j < results.length; j++) {
                        expect(element('.item-text:eq(' + j + ') .ng-binding').text()).toBe(results[j]);
                    }
                }
            });
        });
    }

    for (var i = start; i < end; i++) {
        testMetaphone(i);
    }
});


describe('Metaphone test: non-existing code', function() {
    beforeEach(function() {
        deselectAllTableSources();
        goToAnswer();
        selectSageSources([METAPHONE_TEST_DATA]);
    });

    it('1. should test code -- 0prxs', function() {
        sageInputElement().enter('3thbirooshs');
        sleep(2);
        waitForNotContain(SAGE_DROPDOWN);
    });

    it('2. should test code -- 0tsptkm', function() {
        sageInputElement().enter('thoughtspot.com');
        sleep(2);
        waitForNotContain(SAGE_DROPDOWN);
    });

    it('3. should test code -- amkxrs', function() {
        sageInputElement().enter('omgcheers');
        sleep(2);
        waitForNotContain(SAGE_DROPDOWN);
    });
});


describe('Metaphone test: substring match', function() {
    beforeEach(function() {
        answerTab().click();
        selectSageSources([METAPHONE_TEST_DATA]);
    });

    it('1. should test code -- kln: (fail: SCAL-8028)', function() {
        var query = 'kln',
            results = ['kln- Last Code in Metaphone', 'klnn- Last Name in Metaphone'];

        sageInputElement().enter(query);
        waitForElement(SAGE_DROPDOWN);

        for (var j = 0; j < results.length; j++) {
            expect(element('.item-text:eq(' + j + ') .ng-binding').text()).toBe(results[j]);
        }
    });

    it('2. should test code -- 0', function() {
        var query = 'the',
            results = ['thththe- in Metaphone'];

        sageInputElement().enter(query);
        waitForElement(SAGE_DROPDOWN);

        for (var j = 0; j < results.length; j++) {
            expect(element('.item-text:eq(' + j + ') .ng-binding').text()).toBe(results[j]);
        }
    });

    // disabled due to SCAL-13417
    xit('3. should test code -- NONE', function() {
        var query = '124',
            results = ['a12498qcjau89ppgc986- Last Name in Metaphone', 'p124321org34loynn- First Name in Metaphone'];

        sageInputElement().enter(query);
        waitForElement(SAGE_DROPDOWN);

        for (var j = 0; j < results.length; j++) {
            expect(element('.item-text:eq(' + j + ') .ng-binding').text()).toBe(results[j]);
        }
    });
});
