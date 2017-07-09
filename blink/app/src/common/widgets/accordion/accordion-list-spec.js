/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh
 *
 * @fileoverview Unit tests for accordion list component.
 */

'use strict';

describe('Accordion List Component', function () {
    var AccordionListComponent;
    var AccordionItemComponent;
    beforeEach(function () {
        module('blink.app');
        inject(function ($injector) {
            AccordionListComponent = $injector.get('AccordionListComponent');
            AccordionItemComponent = $injector.get('AccordionItemComponent');
        });
    });

    it('only one item in the accordion must be expanded', function () {
        var accordionListViewer = new AccordionListComponent(
            false /* expand only a single item in the viewer */);
        var accordionItems = [
            new AccordionItemComponent(
                accordionListViewer,
                'mock-title1',
                'mock-desc1',
                'mock-script-id1',
                false),
            new AccordionItemComponent(
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
        var accordionListViewer = new AccordionListComponent(
            true /* expand multiple items if needed in the viewer */);
        var accordionItems = [
            new AccordionItemComponent(
                accordionListViewer,
                'mock-title1',
                'mock-desc1',
                'mock-script-id1',
                false),
            new AccordionItemComponent(
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
