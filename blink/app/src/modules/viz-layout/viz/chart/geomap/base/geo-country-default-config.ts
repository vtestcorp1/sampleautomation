import {strings} from '../../../../../../base/strings';
import {DEFAULT_GEO_DATA_NORMALIZER} from './geo-constants';

let subDivisionNames = strings.metadataExplorer.geoConfigEditor.SUB_DIVISION_NAME;

export let GeoDefaultCountryConfig = {
    SUPPORT: {
        DIV_2: false,
        DIV_1: false,
        ZIP: false,
    },
    LABEL: {
        DIV_1: subDivisionNames.STATE,
        DIV_2: subDivisionNames.DISTRICT,
        ZIP: subDivisionNames.ZIP_CODE
    },
    NORMALIZER: {
        DIV_1: DEFAULT_GEO_DATA_NORMALIZER,
        DIV_2: DEFAULT_GEO_DATA_NORMALIZER,
        ZIP: DEFAULT_GEO_DATA_NORMALIZER,
    },
    EXTRA_FIELDS: {
        DIV_1: [],
        DIV_2: []
    }
};
