/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh(manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview A3 user preferences.
 */

import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';
import {strings} from '../../../../base/strings';
import CheckboxComponent from '../../../../common/widgets/checkbox/checkbox';
import {A3UserPreference} from '../../../a3/preference/a3-user-preference';
import {isA3Enabled} from '../../../callosum/service/session-service';

@Component({
    name: 'bkUserA3Preference',
    templateUrl: 'src/modules/user-preference/user-preference/a3/user-a3-preference.html'
})
export class UserA3PreferenceComponent extends BaseComponent {

    public emailA3OnSuccessCheckbox: CheckboxComponent = null;
    public emailA3OnFailureCheckbox: CheckboxComponent = null;
    public emailAttachmentPdfCheckbox: CheckboxComponent = null;

    private emailA3OnSuccess: boolean = true;
    private emailA3OnFailure: boolean = true;
    private emailAttachmentPdf: boolean = true;

    private a3Preference: A3UserPreference = null;

    constructor() {
        super();
        this.init();
    }

    public update(): void {
        if (!!this.a3Preference) {
            this.a3Preference.updateEmailNotification(
                this.emailA3OnSuccess,
                this.emailA3OnFailure,
                this.emailAttachmentPdf
            );
            this.a3Preference.saveUserPreferenceProto();
        }
    }

    private init() {
        if (isA3Enabled()) {

            this.a3Preference = new A3UserPreference();
            let notification = this.a3Preference.getNotification();
            this.emailA3OnSuccess = notification.getOnSuccess();
            this.emailA3OnFailure = notification.getOnFailure();
            this.emailAttachmentPdf = notification.getAttachContent();

            this.emailA3OnSuccessCheckbox = new CheckboxComponent(
                strings.preferences.a3.emailOnSuccess,
                () => this.emailA3OnSuccess)
                .setOnClick((title, id) => {
                    this.emailA3OnSuccess = !this.emailA3OnSuccess;
                    this.update();
                });


            this.emailA3OnFailureCheckbox = new CheckboxComponent(
                strings.preferences.a3.emailOnFailure,
                () => this.emailA3OnFailure)
                .setOnClick((title, id) => {
                    this.emailA3OnFailure = !this.emailA3OnFailure;
                    this.update();
                });
            this.emailAttachmentPdfCheckbox = new CheckboxComponent(
                strings.preferences.a3.emailAddAttachment,
                () => this.emailAttachmentPdf)
                .setOnClick((title, id) => {
                    this.emailAttachmentPdf = !this.emailAttachmentPdf;
                    this.update();
                });
        }
    }
}
