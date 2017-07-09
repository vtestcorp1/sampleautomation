/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Utility to control pinboard viz card actions.
 */

import _ from 'lodash';
import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import {isAppEmbedded} from '../../client-state-service';
import {PbCardComponent} from './pb-card';

let dialog = ngRequire('dialog');
let embeddingInfoDialogService = ngRequire('embeddingInfoDialogService');
let env = ngRequire('env');
let util = ngRequire('util');

declare let flags: any;

let sizeSelectorTemplate = `<div class="size-selector">
        <div class="size border-right-grey5"
             ng-class="{selected: action.state === '{1}'}"
             ng-click="action.onClick('{1}')">
            <div class="small"></div>
        </div>
        <div class="size border-right-grey5"
             ng-class="{selected: action.state === '{2}'}"
             ng-click="action.onClick('{2}')">
            <div class="medium"></div>
        </div>
        <div class="size border-right-grey5"
             ng-class="{selected: action.state === '{3}'}"
             ng-click="action.onClick('{3}')">
            <div class="large"></div>
        </div>
        <div class="size border-right-grey5"
             ng-class="{selected: action.state === '{5}'}"
             ng-click="action.onClick('{5}')">
            <div class="large-small"></div>
        </div>
        <div class="size"
             ng-class="{selected: action.state === '{4}'}"
             ng-click="action.onClick('{4}')">
            <div class="medium-small"></div>
        </div>
    </div>`;

export function getPbCardActions(pinboardCardComponent: PbCardComponent) {
    let menu = blinkConstants.metadataObjectMenuItems;
    let presentation = _.assign({}, menu.presentation, {
        onClick: function() {
            pinboardCardComponent.startSlideShow(pinboardCardComponent.vizModel.getId());
            pinboardCardComponent.reflow();
        },
        showWhen: () => {
            return !pinboardCardComponent.cardConfig.disallowTileMaximization
                && !pinboardCardComponent.isPresented;
        }
    });

    let toggleSize = _.assign({}, menu.toggleSize, {
        isCustomContent: true,
        customContent:  String.prototype.assign.apply(
            sizeSelectorTemplate,
            [
                blinkConstants.tileSizes.SMALL,
                blinkConstants.tileSizes.MEDIUM,
                blinkConstants.tileSizes.LARGE,
                blinkConstants.tileSizes.MEDIUM_SMALL,
                blinkConstants.tileSizes.LARGE_SMALL
            ]
        ),
        state : pinboardCardComponent.size,
        onClick: function(size) {
            this.state = size;
            pinboardCardComponent.size = size;
            pinboardCardComponent.onSizeChange(pinboardCardComponent.vizModel.getId(), size);
            util.executeInNextEventLoop(() => {
                pinboardCardComponent.reflow();
            });
        },
        showWhen: function() {
            // TODO(Jasmeet): on init we should respect the viz model allow resizing
            return !pinboardCardComponent.cardConfig.disallowLayoutChanges
                && !pinboardCardComponent.isPresented;
        }
    });

    let copyLink = _.assign({}, menu.copyLink, {
        showWhen: function () {
            return !pinboardCardComponent.disallowCopyLink()
                && !isAppEmbedded();
        },
        onClick: function() {
            var documentModel = pinboardCardComponent.vizModel.getContainingAnswerModel();
            var documentId = documentModel.getId();
            var vizId = pinboardCardComponent.vizModel.getId();

            embeddingInfoDialogService.showEmbeddingInfoPopup(documentId, vizId);
        }
    });

    let remove = _.assign({}, menu.remove, {
        onClick: function($event) {
            $event.stopPropagation();
            var vizTitle = pinboardCardComponent.vizModel.getTitle();
            var removalMessage = (!!vizTitle)
                ? strings.Are_you_sure2
                : strings.Are_you_sure;

            removalMessage = _.template(removalMessage)({
                vizTitle: vizTitle
            });
            if (env.confirmPinboardVizRemoval) {
                dialog.show({
                    title: strings.Confirm_removal,
                    message: removalMessage,
                    vizTitle: vizTitle,
                    onConfirm: function () {
                        pinboardCardComponent.remove();
                        return true;
                    }
                });
            } else {
                pinboardCardComponent.remove();
            }
        },
        showWhen: () => {
            return !pinboardCardComponent.cardConfig.disallowTileRemoval;
        }
    });

    var actions = [
        presentation,
        copyLink,
        remove,
        toggleSize
    ];

    return {
        placement: 'auto bottom-left',
        actions: actions
    };
}
