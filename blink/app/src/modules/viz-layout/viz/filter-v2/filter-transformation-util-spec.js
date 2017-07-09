/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Unit tests for filter transformation util.
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
describe('Filter transformation util spec', function() {
    var filterTransformationUtil;

    beforeEach(module('blink.app'));

    /* eslint camelcase: 1 */
    beforeEach(inject(function (_filterTransformationUtil_) {
        /* eslint camelcase: 1 */
        filterTransformationUtil = _filterTransformationUtil_;
    }));

    it('should return empty query transformation array for empty selected items', function () {
        var queryTransformations = filterTransformationUtil.getBulkFilterTransform(null, {});
        expect(queryTransformations.length).toBe(0);
    });

    it('SCAL-18584 should not add any transformation when filter is empty', function () {
        var filterModel = {
            getSelectedFilterItems: function () {
                return {};
            }
        };
        var queryTransformations =
            filterTransformationUtil.getEffectiveAttributeFilterTransformations(filterModel);
        expect(queryTransformations.length).toBe(0);
    });
});
