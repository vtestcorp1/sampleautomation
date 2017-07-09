/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  Component for editing the definition of a given job
 *
 *
 */

import {BaseComponent} from 'src/base/base-types/base-component';
import {blinkConstants} from 'src/base/blink-constants';
import {Component} from 'src/base/decorators';
import RadioButtonComponent from '../../../common/widgets/radio-button/radio-button-component';
import {JobFormatType, ReportTimelyJob} from '../report-timely-job';

@Component({
    name: 'bkJobMetadata',
    templateUrl: 'src/modules/jobs-scheduling/job-metadata-component/job-metadata.html'
})
export class JobMetadataComponent extends BaseComponent {

    public csvRadioController: RadioButtonComponent;
    public xlsRadioController: RadioButtonComponent;
    public pdfRadioController: RadioButtonComponent;
    public reportStrings: any = this.strings.report;
    public hasNoTable = false;
    public type;

    private job: ReportTimelyJob;

    public constructor () {
        super();

        let disableChecker =  () => {
            return this.hasNoTable;
        };

        this.csvRadioController = new RadioButtonComponent(
            blinkConstants.FILE_TYPE.CSV.toUpperCase(),
            () => {
                return this.hasType(JobFormatType.CSV);
            },
            () => {
                return this.handleSelectJobType(JobFormatType.CSV);
            },
            disableChecker
        );
        this.xlsRadioController = new RadioButtonComponent(
            blinkConstants.FILE_TYPE.XLS.toUpperCase(),
            () => {
                return this.hasType(JobFormatType.XLS);
            },
            () => {
                return this.handleSelectJobType(JobFormatType.XLS);
            },
            disableChecker
        );
        this.pdfRadioController = new RadioButtonComponent(
            blinkConstants.FILE_TYPE.PDF.toUpperCase(),
            () => {
                return this.hasType(JobFormatType.PDF);
            },
            () => {
                return this.handleSelectJobType(JobFormatType.PDF);
            }
        );
    }

    public isMetadataComplete(): boolean {
        return !!this.job &&
            !!this.job.getName();
    }

    public setJob(job: ReportTimelyJob): void {
        this.job = job;
        this.type = job.getFormatType();
    }

    public isCsvJob(): boolean {
        return this.hasType(JobFormatType.CSV);
    }

    private handleSelectJobType(type: JobFormatType): void {
        this.type = type;
    }
    private hasType(type: JobFormatType): boolean {
        return this.type === type;
    }
}
