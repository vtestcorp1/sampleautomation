/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import {RelatedLinkEditorComponent} from './related-link-editor';

let RelatedLinkListController = ngRequire('RelatedLinkListController');

/**
 * The viewer component will display the list of available links for a visualization.
 * It will also let customer to delete a related link.
 */
@Component({
    name: 'bkRelatedLinkListViewer',
    templateUrl: 'src/modules/related-link/editor/related-link-list-viewer.html'
})
export class RelatedLinkListViewerComponent extends BaseComponent {

    public vizModel: any;
    public relatedLinkListController: any;
    public editorComponent: RelatedLinkEditorComponent;
    public headerTitle: string;
    public isValid: boolean = false;

    public onRowClick = ((row) => {
        this.showEditorComponent(row);
    });

    private inEditorMode: boolean = false;

    public constructor(vizModel: any) {
        super();
        this.vizModel = vizModel;
        this.init();
    }

    public getOperationMode(): string {
        if (this.inEditorMode) {
            return strings.relatedLink.relatedLinkEditor;
        } else {
            return strings.relatedLink.relatedLinkViewer;
        }
    }

    public showEditorComponent(row: any) {
        // The editor component lets customer to create or update a related link.
        if (row && row.id) {
            this.editorComponent = new RelatedLinkEditorComponent(this, this.vizModel, row.id);
        } else {
            this.editorComponent = new RelatedLinkEditorComponent(this, this.vizModel);
        }
        this.inEditorMode = true;
        this.setTitle();
    }

    public setTitle(): void {
        this.headerTitle = strings.relatedLink.title.assign(
            {
                bookType: (this.vizModel.isPinboardViz()) ? strings.PINBOARD: strings.ANSWER,
                operation: this.getOperationMode(),
                vizName: this.vizModel.getTitle(),
                reportModel: this.vizModel.params.answerModel.getName(),
            }
        );
    }

    public showViewerComponent() {
        this.inEditorMode = false;
        this.setTitle();
        this.refreshRelatedLinksList();
    }

    private refreshRelatedLinksList() {
        this.relatedLinkListController.refreshList();
    }

    private init() {
        this.relatedLinkListController = new RelatedLinkListController(
            this.onRowClick, null, this.vizModel.getReferencingViz().getId());
        this.setTitle();
        this.isValid = true;
    }
}
