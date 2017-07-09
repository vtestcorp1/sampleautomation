/**
 * Created by Xuan Zhang (shawn@thoughtspot.com)
 * Created @ Aug 10, 2015
 * Last Modified @ Aug 10, 2015
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var METAPHONE_TEST = [
    {
        count: 1,
        mpCode: '000',
        queries: ['9thawyth9th', '@th47thiouthaw'],
        results: ['thththe- in Metaphone']
    },
    {
        count: 2,
        mpCode: 't',
        queries: ['00aut891', 't!ooia9'],
        results: ['dtai9o0ta88dt- in Metaphone']
    },
    {
        count: 3,
        mpCode: 'tt',
        queries: ['8td8ad', 'td99dt'],
        results: ['taid457a- in Metaphone']
    },
    {
        count: 4,
        mpCode: 'ttt',
        queries: ['tatata', '9wd8tt0dt'],
        results: ['dtai9o0ta88dt- in Metaphone']
    },
    {
        count: 5,
        mpCode: 'prkln',
        queries: ['bbarc96lonn', 'pbwa!raggalyn'],
        results: ['prkln- First Code in Metaphone', 'poorckywloon- First Name in Metaphone', 'p124321org34loynn- First Name in Metaphone', 'brccln- First Name in Metaphone', 'brooklyn- First Name in Metaphone']
    },
    {
        count: 6,
        mpCode: 'akj',
        queries: ['waaeggzh', 'yeq0j3'],
        results: ['akj- First Code in Metaphone', 'yequ123j- First Name in Metaphone', 'ya3kqjj- First Name in Metaphone', 'ahck032yhjj- First Name in Metaphone', 'yaiu132agkja- First Name in Metaphone', 'way~!@#$%^uiack&*()_+-=ayjj- First Name in Metaphone']
    },
    {
        count: 7,
        mpCode: 'sjp',
        queries: ['9s$%^zh2bb', '00aso0jj456pa'],
        results: ['sao821yjjbb- First Name in Metaphone', 'xauzho8iay7b- First Name in Metaphone', 'zoozho987aup- First Name in Metaphone']
    },
    {
        count: 8,
        mpCode: 'fktr',
        queries: ['ffagkuiyddwrea', '90vvackidrew'],
        results: ['fktr- First Code in Metaphone', '!9v9aqdd0ra- First Name in Metaphone', '*yffooqq88td123r^- First Name in Metaphone', '4590vv!$#cguywddr0- First Name in Metaphone', 'victory- First Name in Metaphone']
    },
    {
        count: 9,
        mpCode: 'xlp',
        queries: ['sja69l42bb', '9shiailua3p'],
        results: ['shallop- First Name in Metaphone', '9aiochull9uppy- First Name in Metaphone', 'choolyb89- First Name in Metaphone']
    },
    {
        count: 10,
        mpCode: 'asjpk',
        queries: ['wa9zzuizh9p4ck', 'asjpcc'],
        results: ['asjpk- Last Code in Metaphone', 'a=ss^9jjobq123oy- Last Name in Metaphone', 'yiuazzzhabbgg- Last Name in Metaphone', 'yzz90zhaobbyyako- Last Name in Metaphone']
    },
    {
        count: 11,
        mpCode: 'kln',
        queries: ['cc150all2no!', '~awgg~$!la94new'],
        results: ['kln- Last Code in Metaphone', 'klnn- Last Name in Metaphone', 'c0a0ll*n- Last Name in Metaphone', 'gg90123llaayn6- Last Name in Metaphone']
    },
    {
        count: 12,
        mpCode: 'rkl',
        queries: ['3r3qlow', 'rocku!lao3'],
        results: ['rkl- Last Code in Metaphone', '$%^ar6ccly- Last Name in Metaphone', '9raaqol- Last Name in Metaphone', '&yrrgol- Last Name in Metaphone']
    },
    {
        count: 13,
        mpCode: 'kt',
        queries: ['!youkutdou~', '-^~^-ccdd==!!!'],
        results: ['kt- Last Code in Metaphone', 'qq89audi- Last Name in Metaphone', 'ck09td- Last Name in Metaphone', 'gg9!97t7- Last Name in Metaphone']
    },
    {
        count: 14,
        mpCode: 'akjpk',
        queries: ['yagezhiboku', 'wawa!qq!@_@!j9bc#'],
        results: ['akjpk- Last Code in Metaphone', 'a12498qcjau89ppgc986- Last Name in Metaphone', 'yeckzhbbck- Last Name in Metaphone', 'yauoiawy$%^qw^&*zhaip$&uagg- Last Name in Metaphone']
    },
    {
        count: 15,
        mpCode: 'a0r',
        queries: ['uiathrr2333', 'youthrao'],
        results: ['ythuro- in Metaphone', 'ye09thaore- Last Name in Metaphone', 'whether- Last Name in Metaphone', 'weather- Last Name in Metaphone']
    }
];