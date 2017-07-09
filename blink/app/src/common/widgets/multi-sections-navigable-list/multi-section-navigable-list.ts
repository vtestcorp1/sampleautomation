/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey
 * @fileoverview  Multi-section-navigable section
 *
 */

import {ScopedComponent} from '../../../base/base-types/scoped-component';
import {Component, ngRequire}   from '../../../base/decorators';
import {NavigableSectionComponent} from './navigable-section';

let Logger = ngRequire('Logger');

@Component({
    name: 'bkMultiSectionNavList',
    templateUrl:
        'src/common/widgets/multi-sections-navigable-list/multi-section-navigable-list.html'
})

export class MultiSectionNavListComponent extends ScopedComponent {

    private highlightedSection: NavigableSectionComponent;
    private domElement: JQuery;
    private isMouseInDropdown: boolean = false;
    private logger = Logger.create('multi-section-dropdown');

    public constructor(
        private _sections: NavigableSectionComponent[],
        private doNotTakeFocus: boolean = false
    ) {
        super();
        this.resetState();
    }

    set sections(sections) {
        this._sections = sections;
        this.resetState();
    }

    public selectionChangesSection = (offset: number) => {
        let listIndex = this.getHighlightedSectionIndex();
        listIndex+= offset;
        let itemIndex = 0;
        if (listIndex < 0) {
            // this means we get pas the top of the list, we need to go at the bottom
            this.highlightLastItemOfLastList();
        } else if (listIndex === this._sections.length) {
            // we went past the bottom, we need to go at the top
           this.highlightFirstItemOfFirsList();
        } else {
            if (offset === 1) {
                // if we go forward, we start at the top of the new section
                itemIndex = 0;
            } else {
                // if we go backward, we start at the end of the new section
                itemIndex = this._sections[listIndex].getNumberOfVisibleItems() - 1;
            }
            this.highlightItem(listIndex, itemIndex);
        }

    }

    public onMouseEnter(): void {
        this.isMouseInDropdown = true;
    }
    public onMouseLeave(): void {
        this.isMouseInDropdown = false;
    }

    public keyPressed($event): void {
        let keyCode = $event.keyCode;
        switch (keyCode) {
            case 38:
                this.moveSelectedItemUp();
                break;
            case 40:
                this.moveSelectedItemDown();
                break;
            case 13:
                if (this.hasAnyItemSelected()) {
                    this.highlightedSection.onItemClicked(
                        this.highlightedSection.highlightedItemIndex
                    );
                } else {
                    // if nothing is selected, selected first item
                    this._sections[0].onItemClicked(0);
                }
                break;
            default:
                this.logger.warn('Unhandled key in dropdown');
        }
    }

    // this will prevent sage-bar from loosing focus when clicking on a suggestion
    public onMouseDown(evt): void {
        if (!this.doNotTakeFocus) {
            evt.stopPropagation();
            evt.preventDefault();
        }
    }

    public closeDropdown(): void {
        this.resetState();
    }

    public onDestroy(): void {
        // remove listener and other stuff
    }
    public hasAnyItemSelected(): boolean {
        return !!this.highlightedSection &&
            this.highlightedSection.highlightedItemIndex !== -1;
    }

    public postLink(element: JQuery) {
        this.domElement = element;
    }

    // this method is there for testing purpose
    public getHighlightedItemIndex() {
        if (this.highlightedSection) {
            return this.highlightedSection.highlightedItemIndex;
        }
        return -1;
    }

    private getHighlightedSectionIndex() {
        return this.getSectionIndex(this.highlightedSection);
    }

    private getSectionIndex(section: NavigableSectionComponent) {
        return this._sections.indexOf(section);
    }

    private hasContent(): boolean {
        return (this._sections && this._sections.length > 0);
    }

    private resetState(): void {
        if (this.hasContent()) {
            this.highlightedSection = this._sections[0];
            this.highlightedSection.highlightedItemIndex = -1;
        } else {
            this.highlightedSection = void 0;
        }
    }
    private highlightLastItemOfLastList() {
        let listIndex = this._sections.length - 1;
        let itemIndex = this._sections[listIndex].getNumberOfVisibleItems() - 1;
        this.highlightItem(listIndex, itemIndex);
    }

    private highlightFirstItemOfFirsList() {
        this.highlightItem(0, 0);
    }

    private highlightItem(listIndex: number, itemIndex: number) {

        let newSection = this._sections[listIndex];
        if (newSection !== this.highlightedSection) {
            this.highlightedSection.highlightedItemIndex = -1;
        }
        this.highlightedSection = this._sections[listIndex];
        this.highlightedSection.highlightedItemIndex = itemIndex;
    }

    private moveSelectedItemUp(): void {
        this.highlightedSection.highlightedItemIndex--;
        if (this.highlightedSection.highlightedItemIndex < 0) {
            this.selectionChangesSection(-1);
        }
    }

    private moveSelectedItemDown(): void {
        this.highlightedSection.highlightedItemIndex++;
        if (this.highlightedSection.highlightedItemIndex
            >= this.highlightedSection.getNumberOfVisibleItems()) {
            this.selectionChangesSection(1);
        }
    }
}
