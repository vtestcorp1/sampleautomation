/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Country Specific configurations for geo map charts.
 * There are a lot of params in our geo code which could be different for different countries,
 * i.e. name of second level subdivision is 'County' in United States and 'Department' in France.
 * Instead of adding bunch of if checks in the code here and there, we keep all the country specific
 * data in this file and provide a cleaner way to access it through GeoCountryConfig class which
 * takes care of returning the default value if no specific param is defined for that param. For
 * example:
 *   GeoCountryConfig.get(country).isZipSupported()
 *
 * You should never access this data directly in code, you should always use GeoCountryConfig
 * to get the value of a given param for the given country.
 */

import {ngRequire, Provide} from '../../../../../../base/decorators';
import {strings} from '../../../../../../base/strings';
let subDivisionNames = strings.metadataExplorer.geoConfigEditor.SUB_DIVISION_NAME;

let util = ngRequire('util');

export type GeoValueNormalizer = (value: string) => string;

// Possible subdivision types within a country
type SupportedSubdivision = {
    DIV_1?: boolean;
    DIV_2?: boolean;
    ZIP?: boolean;
};

export interface IGeoCountryConfig {
    SUPPORT: SupportedSubdivision;
    LABEL?: {
        [type in keyof SupportedSubdivision]?: string;
    };
    NORMALIZER?: {
        [type in keyof SupportedSubdivision]?: GeoValueNormalizer;
    };
    EXTRA_FIELDS?: {
        [type in keyof SupportedSubdivision]?: string[];
    };
}

export let GeoCountryConfigMap: {[isoCode: string]: IGeoCountryConfig} = {
    US: {
        SUPPORT: {
            DIV_1: true,
            DIV_2: true,
            ZIP: true
        },
        LABEL: {
            DIV_2: subDivisionNames.COUNTY
        },
        EXTRA_FIELDS: {
            DIV_1: ['FIPS'],
            DIV_2: ['FIPS']
        },
        NORMALIZER: {
            DIV_1: (state: string): string => {
                // If it is all digit, it is supposed to be a 2-digit state FIPS code.
                if (/^\d+$/.test(state)) {
                    return util.padWithLeadingZeros(state, /*desiredLength*/ 2);
                }
                return state.trim().toLowerCase();
            },
            DIV_2: (county: string): string => {
                // If it is all digit, it is supposed to be a 3-digit county FIPS code.
                if (/^\d+$/.test(county)) {
                    return util.padWithLeadingZeros(county, /*desiredLength*/ 3);
                }
                county = county.trim().toLowerCase();
                let isCityCounty = false;
                ['baltimore', 'carson', 'fairfax', 'st. louis', 'richmond', 'charles', 'james',
                    'bedford', 'roanoke', 'franklin'].forEach((cityCounty: string) => {
                    if (county.startsWith(cityCounty)) {
                        isCityCounty = true;
                    }
                });
                if (isCityCounty) {
                    return county.replace(/\s(county|parish)$/, '');
                }
                return county.replace(/\s(city|county|census\sarea|parish|borough)$/, '');
            },
            ZIP: (zip: string|number): string => {
                let ret = (zip + '') as string;
                while (ret.length < 5) {
                    ret = '0' + ret;
                }
                return ret;
            }
        }
    },
    GB: {
        SUPPORT: {
            DIV_1: true,
            DIV_2: true
        },
        LABEL: {
            DIV_1: subDivisionNames.UK_FIRST_LEVEL,
            DIV_2: subDivisionNames.UK_SECOND_LEVEL
        },
        NORMALIZER: {
            DIV_2: (districtName: string): string => {
                return districtName.toLowerCase()
                    .replace(/\b(the|county(\sof)?|city(\sof)?)\b/gi, '')
                    .replace(/(\,|\.|\-)/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            },
            DIV_1: (countyName: string): string => {
                return countyName.toLowerCase()
                    .replace(/\b(greater|the|county(\sof)?)\b/gi, '')
                    .replace(/(\,|\.|\-)/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
        }
    },
    DE: {
        SUPPORT: {
            DIV_1: true,
            DIV_2: true
        },
        NORMALIZER: {
            DIV_2: (districtName: string): string => {
                return districtName.toLowerCase()
                    .replace(/\b(landkreis|eifelkreis)/gi, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
        }
    },
    SE: {
        SUPPORT: {
            DIV_1: true,
            DIV_2: true
        },
        LABEL: {
            DIV_1: subDivisionNames.COUNTY,
            DIV_2: subDivisionNames.MUNICIPALITY
        },
        NORMALIZER: {
            DIV_2: (municipalityName: string): string => {
                return municipalityName.toLowerCase()
                    .replace(/\bmunicipality\b/gi, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            },
            DIV_1: (countyName: string): string => {
                return countyName.toLowerCase()
                    .replace(/\bcounty\b/gi, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
        },
    },
    ZA: {
        SUPPORT: {
            DIV_1: true,
            DIV_2: true
        },
        NORMALIZER: {
            DIV_2: (municipalityName: string): string => {
                return municipalityName.toLowerCase()
                    .replace(/\b(district|metropolitan)?\s*municipality\b/gi, '')
                    .replace(/(\.)/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
        }
    },
    FR: {
        SUPPORT: {
            DIV_1: true,
            DIV_2: true
        },
        LABEL: {
            DIV_1: subDivisionNames.REGION,
            DIV_2: subDivisionNames.DEPARTMENT,
        },
        EXTRA_FIELDS: {
            DIV_1: ['NAME_FR']
        }
    }
};
Provide('GeoCountryConfigMap')(GeoCountryConfigMap);
