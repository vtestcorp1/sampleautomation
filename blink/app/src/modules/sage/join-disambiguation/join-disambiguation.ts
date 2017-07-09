/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview A component that implements the UI workflow for disambiguating
 * the join path conflicts in sage bar.
 *
 * To understand the problem, let us work with following example:
 * 1. System has a Fact Table with each row containing
 *    "Revenue, State, Commit Date Id, Order Date Id and Supply Date Id"
 * 2. System has a Dimension Table with each row containing "Date Id, Date Epoch
 *     and Day of the week (weekday)"
 *
 * The use case is as follows:
 * 1. User has already arrived at an existing sage query such as "revenue state".
 * 2. User types in a new token like "weekday".
 * 3. System needs user to choose which relationship to show from following choices:
 *    - Weekday of "Commit Date"
 *    - Weekday of "Order Date"
 *    - Weekday of "Supply Date".
 *
 * The proposal is documented in http://s.thoughtspot.com/mjp2
 * The protocol for representing a join path choice is available on http://mothership:8080/#/c/5977/
 */

'use strict';

/**
 * Join path disambiguation is a workflow based UI that can be broken down into following parts:
 *
 * - A question based disambiguation workflow. A user is presented
 *   with (potentially) series of questions to be
 *   answered to determine the join tree that is to be used for executing the query.
 *   This is implemented in DisambiguationWorkflow class below.
 *
 * - A list of already answered questions. User can go back to any
 *   previously asked questions and start over the
 *   workflow from that point on.
 *   This is implemented in SelectionHistory class below.
 *
 * - A diagramatic view of how the join tree is being built. (This is yet to be implemented).
 *
 * Each choice coming from the system is of form
 * "path-from-new-root-to-existing-root | new-root | path-from-new-root-to-new-token".
 * In the classic binary tree representation, the new query root is the root of
 * the tree, the new token is the right leaf,
 * while the old root (represetating existing tokens) is the left leaf.
 * path-from-new-root-to-new-token is called LTR fragment. Other one is called the RTL fragment.

 * The component tries to build the workflow questions from the various path choices of above form.
 * We use the following algo to solve the problem:
 * 1 Starting from new token as a leaf, ask questions to
 *   determine a root and a path to that root (LTR fragment).
 *   1.1 Find distinct incoming links to leaf (direct or indirect), and ask the question:
 *    'Which {terminal node} did you mean?' where {terminal node} can be either
 *    the node where all choices merge or the
 *    leaf node (depends on if the leaf node question has been asked or not).
 *
 *   1.2 Offer each distinct link to leaf as a choice of following form:
 *     '{terminal node} of {link name}' where {link name} is the name of the join
 *     link (or foreign key)
 *
 *   1.3 Repeat 1.1 & 1.2 until all LTRs are same i.e. same root and same join
 *     links between root and leaf.
 *
 * 2 Select from existing leaves the closest token to the new token and ask
 *   questions to determine the path
 *   from the root selected in 1. (RTL fragment)
 *
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component, ngRequire, Provide} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import * as dialog from '../../../common/widgets/dialog/dialog-service';
import RadioButtonComponent from '../../../common/widgets/radio-button/radio-button-component';

let $q = ngRequire('$q');
let Logger = ngRequire('Logger');
let JoinDisambiguationHelper = ngRequire('JoinDisambiguationHelper');

@Component({
    name: 'bkJoinDisambiguation',
    templateUrl: 'src/modules/sage/join-disambiguation/join-disambiguation.html'
})
export class JoinDisambiguationComponent extends BaseComponent {
    public previousSelections;
    public question;
    isOnLastStep: boolean;
    private joinDisambiguationHelper;
    private selectionHistory;
    private logger;

    constructor(private ambiguityInput: AmbiguityInput,
                private onComplete: (Array) => void,
                private onCancel: () => void) {
        super();
        this.logger = Logger.create('join-disambiguation');
        this.init(ambiguityInput, onComplete);
    }

    fadeOutQuestion(cb: () => any): void {
        cb();
    }

    fadeInQuestion(): void {
        // Fade in
    }

    init(ambiguityInput: AmbiguityInput, onCompleteFn: (Array) => void): void {
        this.joinDisambiguationHelper = new JoinDisambiguationHelper(
            ambiguityInput, JoinDisambiguationHelper.modes.EXPLICIT_MODE, (resolvedTokens) => {
                if (onCompleteFn) {
                    onCompleteFn(resolvedTokens);
                }
            });
        this.selectionHistory = this.joinDisambiguationHelper.getSelectionHistory();
        this.previousSelections = this.selectionHistory.getHistoryList();

        this.question = this.joinDisambiguationHelper.init();

        // If no question created even at this point, something is really wrong!!
        if (!this.question) {
            this.logger.error('Could not create join path disambiguation questions!!');
        }

        if (Array.isArray(this.question.options)) {
            this.question.optionCtrls = this.question.options.map((option) => {
                return new RadioButtonComponent(
                    option.text,
                    () => option === this.question.selectedOption,
                    () => this.selectOption(option)
                );
            });
        }

        this.isOnLastStep = false;
    }

    canShowHistory() : boolean {
        // If there is no history, can't show history.
        if (!this.previousSelections.length) {
            return false;
        }

        // If history is pre-populated or user is on last step, then we only show history
        // if the history is multiple steps.
        if (this.joinDisambiguationHelper.isHistoryPrePopulated() || this.isOnLastStep) {
            return this.previousSelections.length > 1;
        }

        // If we reach here, then there is a history and user is on last step,
        // which implies that this is a multiple step workflow.
        return true;
    }

    onDone() : void {
        if (!this.isOnLastStep) {
            return;
        }

        this.joinDisambiguationHelper.finish();
    }

    selectOption(selectedOption): void {
        // We can arrive here in 2 ways:
        // - User selected the option for the first time. In that case,
        //   we have not really determined the future choices,
        //   so skip the history and proceed to pruneAndUpateQuestion phase.
        // - User selects an already selected option. This can happen,
        //   when user goes back to an existing item in
        //   history. In that case, the future choices may already have been computed
        //   and present in the history.
        if (selectedOption === this.question.selectedOption) {
            var nextItem = this.selectionHistory.getNextItem(this.question);
            if (nextItem) {
                this.selectItemFromHistory(nextItem);
                return;
            }
        }
        this.question.selectedOption = selectedOption;
        var question = this.joinDisambiguationHelper.pruneChoicesAndUpdateQuestion(selectedOption);
        this.isOnLastStep = !question;
        if (this.isOnLastStep) {
            return;
        }
        // Start fade out animation for the current question and
        // then update the next question after animation is done.
        this.fadeOutQuestion(() => {
            this.question = question;
            this.fadeInQuestion();
        });
    }

    selectItemFromHistory(item): void {
        this.question = this.joinDisambiguationHelper.selectItemFromHistory(item);
    }
}

export function launch(joinPathAmbiguities: any[],
                       newTokens: any[],
                       existingTokens: any[],
                       workflowType?: number): PromiseLike<any[]> {
    var defer = $q.defer();
    let joinDisambiguation = new JoinDisambiguationComponent({
            joinPathCollections: joinPathAmbiguities,
            workflowType: workflowType,
            tokens: newTokens,
            documentTokens: existingTokens || []
        },
        (resolvedTokens) => {
            defer.resolve(resolvedTokens);
        },
        () => {
            defer.reject();
        }
    );
    dialog.show({
        title: !!workflowType && strings.joinWorkflow.titles[workflowType] ||
        strings.joinWorkflow.titles.DEFINE_MAPPING,
        confirmBtnLabel: 'Save',
        customCssClass: 'bk-join-path-dialog',
        isConfirmBtnDisabled: function () {
           return !joinDisambiguation.isOnLastStep;
        },
        onConfirm: function () {
            if (this.isConfirmBtnDisabled()) {
                return false;
            }

            joinDisambiguation.onDone();
            return true;
        },
        customData: {
            joinDisambiguation: joinDisambiguation
        },
        customBodyUrl: 'src/common/widgets/dialogs/templates/join-workflow-dialog.html'
    });
    return defer.promise;
}

interface AmbiguityInput {
    joinPathCollections: Array<any>;
    workflowType: number;
    tokens: Array<any>;
    documentTokens: any[];
}

Provide('joinWorkflowLauncher')({
    launch
});
