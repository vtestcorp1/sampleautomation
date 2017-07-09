/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview UI component for editing geo config of a column.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {BlobService} from '../../../base/blob-service';
import {Component, ngRequire} from '../../../base/decorators';
import {Countries, Country} from '../../../base/geo/countries';
import RadioButtonComponent from '../../../common/widgets/radio-button/radio-button-component';
import SelectComponent, {SelectOption} from '../../../common/widgets/select/select';
import GeoConfig from '../../document-model/table-model/geo-config';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import GeoCountryConfig from '../../viz-layout/viz/chart/geomap/base/geo-country-config';
import CustomRegionUploaderComponent from '../custom-region-uploader/custom-region-uploader';

let geoTypes = jsonConstants.geoConfigType;
let Logger = ngRequire('Logger');

declare let addBooleanFlag: any;
declare let flags: any;

addBooleanFlag(
    'enableCustomRegion',
    'Enables ability to select custom region in geo config setting',
    false
);

@Component({
    name: 'bkGeoConfigEditor',
    templateUrl: 'src/modules/data-explorer/geo-config-editor/geo-config-editor.html'
})

export default class GeoConfigEditorComponent extends BaseComponent {

    private static readonly SUB_NATION_TYPE = 'SUB_NATION';
    private static readonly rootLevelConfigTypes: string[] = [
        geoTypes.LATITUDE,
        geoTypes.LONGITUDE,
        geoTypes.ADMIN_DIV_0,
        geoTypes.CUSTOM_REGION
    ];

    public readonly customRegionEnabled: boolean = flags.getValue('enableCustomRegion');
    public readonly geoStrings: any;
    public readonly rootLevelOptionsControllers: RadioButtonComponent[] = [];
    public subNationRadioController: RadioButtonComponent;
    public customRegionRadioController: RadioButtonComponent;
    public countrySelectorCtrl: SelectComponent;
    public subNationOptionsControllers: RadioButtonComponent[] = [];
    public customRegion: {id: string, name?: string};
    public customRegionLoading = false;

    private readonly logger: any = Logger.create('geo-config-editor');
    private type: string|undefined;
    private subNationType: string|undefined;
    private customRegionUploader: CustomRegionUploaderComponent;


    constructor(geoConfig: GeoConfig) {
        super();
        this.geoStrings = this.strings.metadataExplorer.geoConfigEditor;
        let selectedCountryCode = Countries.US.getIsoCode();

        if (!!geoConfig) {
            if (GeoConfigEditorComponent.rootLevelConfigTypes.indexOf(geoConfig.getType()) !== -1) {
                this.type = geoConfig.getType();
                if (geoConfig.getType() === jsonConstants.geoConfigType.CUSTOM_REGION) {
                    this.customRegion = {id: geoConfig.getCustomFileGuid()};
                    this.fetchCustomRegionFileName();
                }
            } else {
                if (!geoConfig.getParent()) {
                    this.logger.error('Invalid geo config passed', geoConfig);
                    return;
                }
                this.type = GeoConfigEditorComponent.SUB_NATION_TYPE;
                selectedCountryCode = geoConfig.getParent().getFixedValue();
                this.subNationType = geoConfig.getType();
            }
        }

        this.countrySelectorCtrl = new SelectComponent({
            placeholder: this.strings.SELECT_A_COUNTRY,
            options: GeoCountryConfig.supportedCountries.map((country: Country) => {
                return {
                    id: country.getIsoCode(),
                    caption: country.getName()
                };
            }),
            selectedID: selectedCountryCode,
            onSelectionChanged: (newOption: SelectOption) => {
                this.onCountryChange(Countries[newOption.id]);
            },
            customCssClass: 'bk-select-geo-country',
            onDropdownToggled: function(isOpen) {
                if (isOpen) {
                    // This is to prevent the click action to reach the slick grid table, as it will
                    // prematurely commit the edit thinking that editor has blurred.
                    $('body .bk-select-geo-country').on('mousedown.selectGeoCountry', ($evt) => {
                        $evt.stopPropagation();
                    });
                } else {
                    $('body .bk-select-geo-country').off('mousedown.selectGeoCountry');
                }
            }
        });

        this.rootLevelOptionsControllers = [
            this.getRadioControllerForType(
                this.geoStrings.NONE,
                void 0,
            ),
            this.getRadioControllerForType(
                this.geoStrings.LATITUDE,
                jsonConstants.geoConfigType.LATITUDE
            ),
            this.getRadioControllerForType(
                this.geoStrings.LONGITUDE,
                jsonConstants.geoConfigType.LONGITUDE
            ),
            this.getRadioControllerForType(
                this.geoStrings.COUNTRY,
                jsonConstants.geoConfigType.ADMIN_DIV_0
            )
        ];
        this.subNationRadioController = this.getRadioControllerForType(
            this.geoStrings.SUB_NATION,
            GeoConfigEditorComponent.SUB_NATION_TYPE
        );

        this.customRegionRadioController = this.getRadioControllerForType(
            this.geoStrings.CUSTOM_REGION,
            jsonConstants.geoConfigType.CUSTOM_REGION
        );
        this.customRegionUploader = new CustomRegionUploaderComponent(
            !!this.customRegion ? this.strings.CHANGE_DEFINITION : this.strings.ADD_DEFINITION,
            (file) => { // Pre upload callback
                this.customRegionLoading = true;
                // Validate file here.
            },
            (guid, name) => { // upload success callback
                this.customRegion = {id: guid, name: name};
                this.customRegionLoading = false;
                this.customRegionUploader.setLabel(this.strings.CHANGE_DEFINITION);
            }
        );
        this.createControllersForSubNationOptions();
    }

    public getGeoConfig(): GeoConfig {
        if (!this.type) {
            return null;
        }
        let type = this.type, parent;
        if (type === GeoConfigEditorComponent.SUB_NATION_TYPE) {
            type = this.subNationType;
            parent = {
                type: geoTypes.ADMIN_DIV_0,
                fixedValue: this.countrySelectorCtrl.getSelectedID()
            };
        }
        let geoConfigJson: any = {
            type: type
        };
        if (!!parent) {
            geoConfigJson.parent = parent;
        }
        if (type === geoTypes.CUSTOM_REGION) {
            geoConfigJson.customFileGuid = this.customRegion.id;
        }
        return new GeoConfig(geoConfigJson);
    }

    public isCurrentSelectionValid() {
        if (!this.type) {
            return true;
        }
        if (this.type === geoTypes.CUSTOM_REGION) {
            return !!this.customRegion;
        }
        if (this.type === GeoConfigEditorComponent.SUB_NATION_TYPE) {
            return !!this.subNationType;
        }
        return true;
    }

    public showSubNationConfig() {
        return this.subNationRadioController.isSelected();
    }

    public onCountryChange(country: Country) {
        this.createControllersForSubNationOptions();
    }

    public getCustomRegionName() {
        return this.customRegion && this.customRegion.name || this.geoStrings.NO_DEF_UPLOADED;
    }

    private getRadioControllerForType(label: string, geoConfigType: string): RadioButtonComponent {
        return new RadioButtonComponent(
            label,
            () => {
                return this.type === geoConfigType;
            }, () => {
                if (geoConfigType !== this.type) {
                    this.type = geoConfigType;
                    this.onUpdateRootLevelType(geoConfigType);
                }
            }
        );
    }

    private getRadioControllerForSubNationType(label: string,
                                               geoConfigType: string): RadioButtonComponent {
        return new RadioButtonComponent(
            label,
            () => {
                return this.subNationType === geoConfigType;
            }, () => {
                this.subNationType = geoConfigType;
            }
        );
    }

    private createControllersForSubNationOptions() {
        let countryConfig = GeoCountryConfig.get(
            this.countrySelectorCtrl.getSelectedID()
        );
        this.subNationOptionsControllers = [];
        if (countryConfig.isDiv1Supported()) {
            this.subNationOptionsControllers.push(
                this.getRadioControllerForSubNationType(
                    countryConfig.getDiv1Label(),
                    geoTypes.ADMIN_DIV_1
                )
            );
        }
        if (countryConfig.isDiv2Supported()) {
            this.subNationOptionsControllers.push(
                this.getRadioControllerForSubNationType(
                    countryConfig.getDiv2Label(),
                    geoTypes.ADMIN_DIV_2
                )
            );
        }

        if (countryConfig.isZipSupported()) {
            this.subNationOptionsControllers.push(
                this.getRadioControllerForSubNationType(
                    countryConfig.getZipLabel(),
                    geoTypes.ZIP_CODE
                )
            );
        }
    }

    private fetchCustomRegionFileName() {
        this.customRegionLoading = true;
        BlobService.getFileHeadersForCategory('GEO_CUSTOM_REGION').then((response) => {
            this.customRegion = response.data.find((region) => {
                return region.id === (this.customRegion && this.customRegion.id);
            });
            this.customRegionLoading = false;
        });
    }

    private onUpdateRootLevelType(geoConfigType: string) {
        if (geoConfigType === jsonConstants.geoConfigType.CUSTOM_REGION &&
            !!this.customRegion &&
            !this.customRegion.name) {
            this.fetchCustomRegionFileName();
        }
    }
}
