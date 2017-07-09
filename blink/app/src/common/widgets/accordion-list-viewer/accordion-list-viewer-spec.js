/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Rahul Balakavi
 *
 * @fileoverview Unit tests for accordion list viewer.
 */

'use strict';

describe('Accordion List Viewer', function () {
    var AccordionListViewerComponent;
    var AccordionListViewerItemComponent;
    beforeEach(function () {
        module('blink.app');
        inject(function ($injector) {
            AccordionListViewerComponent = $injector.get('AccordionListViewerComponent');
            AccordionListViewerItemComponent = $injector.get('AccordionListViewerItemComponent');
        });
    });

    it('only one item in the accordion must be expanded', function () {
        var accordionListViewer = new AccordionListViewerComponent(
            false /* expand only a single item in the viewer */);
        var accordionItems = [
            new AccordionListViewerItemComponent(
                accordionListViewer,
                'mock-title1',
                'mock-desc1',
                'mock-script-id1',
                false),
            new AccordionListViewerItemComponent(
                accordionListViewer,
                'mock-title2',
                'mock-desc2',
                'mock-script-id2',
                false)
        ];
        // Click on one item.
        accordionItems[0].click();
        expect(accordionItems[0].isExpanded()).toBe(true);
        expect(accordionItems[1].isExpanded()).toBe(false);
        // Click on 2nd item. The first item should automatically collapse
        accordionItems[1].click();
        expect(accordionItems[0].isExpanded()).toBe(false);
        expect(accordionItems[1].isExpanded()).toBe(true);
        // Click on 2nd item again. No items should be expanded now.
        accordionItems[1].click();
        expect(accordionItems[0].isExpanded()).toBe(false);
        expect(accordionItems[1].isExpanded()).toBe(false);
    });

    it('More than one item in the accordion can be expanded', function () {
        var accordionListViewer = new AccordionListViewerComponent(
            true /* expand multiple items if needed in the viewer */);
        var accordionItems = [
            new AccordionListViewerItemComponent(
                accordionListViewer,
                'mock-title1',
                'mock-desc1',
                'mock-script-id1',
                false),
            new AccordionListViewerItemComponent(
                accordionListViewer,
                'mock-title2',
                'mock-desc2',
                'mock-script-id2',
                false)
        ];
        // Click on one item.
        accordionItems[0].click();
        expect(accordionItems[0].isExpanded()).toBe(true);
        expect(accordionItems[1].isExpanded()).toBe(false);
        // Click on 2nd item. The first item should also be expanded.
        accordionItems[1].click();
        expect(accordionItems[0].isExpanded()).toBe(true);
        expect(accordionItems[1].isExpanded()).toBe(true);
        // Click on 2nd item again. 2nd item only should be collapsed.
        accordionItems[1].click();
        expect(accordionItems[0].isExpanded()).toBe(true);
        expect(accordionItems[1].isExpanded()).toBe(false);
    });
});
