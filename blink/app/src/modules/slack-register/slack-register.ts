/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: ashish shubham (ashish@thoughtpsot.com)
 *
 */

import {getRouteParameter} from 'src/base/route-service';
import {CanvasComponent} from '../../base/app-canvas/canvas-component';
import {BaseComponent} from '../../base/base-types/base-component';
import {Component, ngRequire} from '../../base/decorators';
import * as dialog from '../../common/widgets/dialog/dialog-service';
import {getUserSlackId} from '../callosum/service/session-service';

let userAdminService = ngRequire('userAdminService');
let loadingIndicator = ngRequire('loadingIndicator');
let navService = ngRequire('navService');

@Component({
    name: 'bkSlackRegister',
    templateUrl: 'src/modules/slack-register/slack-register.html'
})
export class SlackRegisterComponent extends BaseComponent implements CanvasComponent {
    private static routeParameter = 'slackId';
    private isRegistered = false;

    constructor() {
        super();
        var slackId = getRouteParameter(SlackRegisterComponent.routeParameter);
        this.registerSlackUser(slackId);
    }

    public onCanvasStateChange(params) {
        var slackId = params[SlackRegisterComponent.routeParameter];
        this.registerSlackUser(slackId);
    }

    private registerSlackUser(slackId) {
        let existingSlackId = getUserSlackId();
        if(!!existingSlackId) {
            dialog.show({
                title: this.strings.slack.user_exists,
                message: this.strings.slack.confirm_override_user,
                onConfirm: () => {
                    this.updateSlackIdForUser(slackId);
                    return true;
                },
                onCancel: () => {
                    navService.goToHome();
                    return true;
                },
                onDismiss: () => {
                    navService.goToHome();
                    return true;
                }
            });
        } else {
            this.updateSlackIdForUser(slackId);
        }
    }

    private updateSlackIdForUser(slackId) {
        this.isRegistered = false;
        loadingIndicator.show();
        userAdminService.updateCurrentUserSlackId(slackId).
            then(() => {
                this.isRegistered = true;
            }).
            then(loadingIndicator.hide, loadingIndicator.hide);
    }
}
