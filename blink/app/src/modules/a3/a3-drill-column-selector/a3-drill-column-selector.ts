/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Jasmeet Singh Jaggi(jasmeet@thoughtspot.com)
 *
 * @fileoverview This component displays the sage columns for customer to select for
 * a3 analysis.
 *
 */

'use strict';

import _ from 'lodash';
import {BaseComponent} from '../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../base/decorators';
import {SmartCheckboxCollectionConfig}
from '../../../common/widgets/checkbox-collection/smart-checkbox-collection-config';
import {SmartCheckboxCollectionController}
from '../../../common/widgets/checkbox-collection/smart-checkbox-collection-controller';
import {AnswerSageClient} from '../../sage-client/answer-sage-client';
import {SageTokenOptions} from '../../viz-context-menu/controllers/sage-token-options';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {A3AnalysisCustomizerComponent} from '../a3-analysis-customizer/a3-analysis-customizer';
import {getTokenName} from '../a3-utils';
import {A3UserPreference} from '../preference/a3-user-preference';

let $q = ngRequire('$q');

/**
 * Column selection component
 */
@Component({
    name: 'bkA3DrillColumnSelector',
    templateUrl: 'src/modules/a3/a3-drill-column-selector/a3-drill-column-selector.html'
})
export class A3DrillColumnSelectorComponent extends BaseComponent {
    public smartCheckboxCollectionComponent: SmartCheckboxCollectionController;
    protected a3UserPreference : A3UserPreference = null;
    protected changedTokens : Map<string,boolean> = new Map<string, boolean>();
    private sageTokenOptions: SageTokenOptions;
    private displayStringToToken;
    private selectedTokensMap;
    private sageClient: AnswerSageClient;
    private a3AnalysisCustomizerComponent: A3AnalysisCustomizerComponent;
    private type: string;

    public constructor(
        sageClient: AnswerSageClient,
        selectedTokens,
        a3AnalysisCustomizerComponent: A3AnalysisCustomizerComponent,
        type: string
    ) {
        super();
        this.type = type;
        this.a3UserPreference = new A3UserPreference();
        this.sageClient = sageClient;
        this.a3AnalysisCustomizerComponent = a3AnalysisCustomizerComponent;
        if (!!sageClient) {
            this.initSmartCheckboxCollection(selectedTokens);
        } else {
            this.createEmptySmartCheckboxCollectionComponent();
        }
    }

    public getUnselectedColumns() : any {
        let unselectedColumns = Object.keys(this.changedTokens).filter(key => {
            return this.changedTokens[key] === false;
        });
        return unselectedColumns;
    }

    public getSelectedColumns() : Array<any> {
        return Object.values(this.selectedTokensMap);
    }

    public trigger() {
        this.a3AnalysisCustomizerComponent.trigger();
    }

    private getTokenNames(tokens) {
        return tokens.map((token) => {
            return getTokenName(token);
        });
    }

    private updateDisplayStringToToken(tokens) {
        let tokenNames = this.getTokenNames(tokens);
        tokenNames.forEach((tokenName, idx) => {
           this.displayStringToToken[tokenName] = tokens[idx];
        });
    }

    private initSmartCheckboxCollection(selectedTokens) {
        this.displayStringToToken = {};
        this.selectedTokensMap = {};
        this.updateDisplayStringToToken(selectedTokens);
        selectedTokens.forEach((selectedToken) => {
            let tokenName = getTokenName(selectedToken);
            this.selectedTokensMap[tokenName] = selectedToken;
        });
        this.sageTokenOptions = new SageTokenOptions(
            this.sageClient,
            null /* Empty transformation */,
            true /* Show measures as well */);
        let smartCheckboxCollectionConfig = new SmartCheckboxCollectionConfig();

        // Smart checkbox takes checkbox value getters. These are called with
        // the current string in the UI.
        // The function are expected to return a promise with array of objects
        // with string key and boolean isChecked reflecting current selection.
        let editableCBGetter = (text: string) => {
            return this.sageTokenOptions.getSearchedTokens(text)
                .then(
                    (tokens) => {
                        let displayTokens = this.getTokenNames(tokens);
                        this.updateDisplayStringToToken(tokens);
                        let displayTokensMap = displayTokens.reduce((map, val) => {
                            map[val] = false;
                            return map;
                        }, {});

                        // NOTE: We add the current selection in the filter as we want
                        // to provide where the selections are always displayed in the
                        // UI.
                        _.forIn(this.selectedTokensMap, (val, key) => {
                            if (key.indexOf(text) > -1 || !text) {
                                displayTokensMap[key] = true;
                            }
                        });
                        if (this.type === jsonConstants.a3.SELECTION_EXCLUDE) {
                            let globalColumns = this.a3UserPreference.getExcludeColumnsSet();
                            // NOTE: We also add the global user preference setting.
                            _.forIn(tokens, (token) => {
                                if (globalColumns.has(token.guid)) {
                                    let tokenName = getTokenName(token);
                                    displayTokensMap[tokenName] = true;
                                    this.selectedTokensMap[tokenName] = token;
                                }
                            });
                        }

                        let checkboxItems = [];
                        _.forIn(displayTokensMap, (val, key) => {
                            checkboxItems.push(
                                {
                                    title: key,
                                    isChecked: val
                                }
                            );
                        });
                        return {
                            checkboxItems: checkboxItems
                        };
                    }
                );
        };

        let readOnlyCBGetter = () => {
            return $q.when({checkboxItems: []});
        };

        let onChange = (displayText: string, isSelected: boolean) => {
            this.changedTokens[this.displayStringToToken[displayText].guid] = isSelected;
            if (isSelected) {
                this.selectedTokensMap[displayText] = this.displayStringToToken[displayText];
            } else {
                delete this.selectedTokensMap[displayText];
            }
        };

        this.smartCheckboxCollectionComponent = new SmartCheckboxCollectionController(
            editableCBGetter,
            readOnlyCBGetter,
            onChange,
            smartCheckboxCollectionConfig
        );
    }

    private createEmptySmartCheckboxCollectionComponent() {
        let readOnlyCBGetter = () => {
            return $q.when({checkboxItems: []});
        };
        let editableCBGetter = () => {
            return $q.when({checkboxItems: []});
        };
        let onChange = () => {
            return;
        };
        this.smartCheckboxCollectionComponent = new SmartCheckboxCollectionController(
            editableCBGetter,
            readOnlyCBGetter,
            onChange,
            null
        );
    }
}
