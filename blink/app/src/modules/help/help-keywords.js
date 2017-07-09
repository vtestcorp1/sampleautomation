/**
 * Copyright: ThoughtSpot Inc. 2102-2014
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview  Json for help keywords with respective examples
 *
 * This file specifies the groups of different types of keywords which are divided further
 * into different sets based on how the content producer wants to display the content.
 *
 * The content producer of this file will have to following template to add any new entry.
 *
 * @param {string} groupName - Title used for each category
 * @param {string} keywordSetName - For keywords grouped together with a sub category title. Visually keywords
 *                 listed under this sub category will be appear with 20px indentation. Example: keywordSetName: 'last'.
 *                 This is set of related keywords like last day, week, month and so on.
 * @param {array} keywords - Keywords groups. Keywords which are grouped under this will visually appear grouped together
 *                with a break and a horizontal line separator.
 * @param {string} keyword - Keyword text
 * @param {array} example - Consist of 'text' and 'highlightedWords'.
 * @param {string} text - Example text for a keyword
 * @param {array} highlightedWords: Array with index for each highlighted word on the example text. Counter starting from 0.
 *
 */

'use strict';

blink.app.factory('helpKeywords', function () {
    return {
        helpKeywordsJson: {
            basic: {
                groupName: 'Basic keywords',
                sets: [
                    /*                  {
                     keywords: [
                     {
                     keyword: 'by',
                     examples: [
                     {
                     text: 'revenue by state',
                     highlightedWords: [1]
                     }
                     ]
                     }
                     ]
                     },
                     {
                     keywords: [{
                     keyword: 'for',
                     examples: [
                     {
                     text: 'revenue for california',
                     highlightedWords: [1]
                     },
                     {
                     text: 'revenue for state california',
                     highlightedWords: [1]
                     },
                     {
                     text: 'revenue for revenue > 10000',
                     highlightedWords: [1]
                     },
                     {
                     text: 'revenue for average revenue > 10000 by region',
                     highlightedWords: [1]
                     }
                     ]
                     }]
                     },
                     */

                    {
                        keywords: [{
                            keyword: 'top',
                            examples: [
                                {
                                    text: 'top sales rep by count sales for average revenue > 1000',
                                    highlightedWords: [0]
                                },
                                {
                                    text: 'sales rep average revenue for each region top',
                                    highlightedWords: [7]
                                }
                            ]
                        }]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'bottom',
                                examples: [
                                    {
                                        text: 'bottom revenue average revenue by state',
                                        highlightedWords: [0]
                                    },
                                    {
                                        text: 'customer by revenue for each sales rep bottom',
                                        highlightedWords: [7]
                                    }

                                ]
                            }
                        ]
                    },
                    {
                        keywords: [{
                            keyword: 'top n',
                            examples: [
                                {
                                    text: 'top 10 sales rep revenue',
                                    highlightedWords: [0, 1]
                                }
                            ]
                        }]
                    },
                    {
                        keywords: [{
                            keyword: 'bottom n',
                            examples: [
                                {
                                    text: 'bottom 25 customers by revenue for each sales rep',
                                    highlightedWords: [0, 1]
                                }
                            ]
                        }]
                    },
                    {
                        keywords: [{
                            keyword: 'sort by',
                            examples: [
                                {
                                    text: 'revenue by state sort by average revenue',
                                    highlightedWords: [3, 4]
                                },
                                {
                                    text: 'revenue by customer sort by region',
                                    highlightedWords: [3, 4]
                                }
                            ]
                        }]
                    }
                ]
            },
            date: {
                groupName: 'Date keywords',
                sets: [
                    {
                        keywords: [
                            {
                                keyword: 'after',
                                examples: [
                                    {
                                        text: 'order date after 10/31/2014',
                                        highlightedWords: [2]
                                    }
                                ]
                            },
                            {
                                keyword: 'before',
                                examples: [
                                    {
                                        text: 'order date before 03/01/2014',
                                        highlightedWords: [2]
                                    }
                                ]
                            },
                            {
                                keyword: 'between ... and ...',
                                examples: [
                                    {
                                        text: 'order date between 01/01/2012 and 01/01/2013',
                                        highlightedWords: [2, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'day of week',
                                examples: [
                                    {
                                        text: 'revenue by day of week last 6 months',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'week',
                                examples: [
                                    {
                                        text: 'revenue by week last quarter',
                                        highlightedWords: [2]
                                    }
                                ]
                            },
                            {
                                keyword: 'month',
                                examples: [
                                    {
                                        text: 'revenue by month last year',
                                        highlightedWords: [2]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'daily',
                                examples: [
                                    {
                                        text: 'shipments by region daily',
                                        highlightedWords: [3]
                                    }
                                ]
                            },
                            {
                                keyword: 'weekly',
                                examples: [
                                    {
                                        text: 'revenue weekly',
                                        highlightedWords: [1]
                                    }
                                ]
                            },
                            {
                                keyword: 'monthly',
                                examples: [
                                    {
                                        text: 'commission > 10000 monthly',
                                        highlightedWords: [3]
                                    }
                                ]
                            },
                            {
                                keyword: 'quarterly',
                                examples: [
                                    {
                                        text: 'sales quarterly for each product',
                                        highlightedWords: [1]
                                    }
                                ]
                            },
                            {
                                keyword: 'yearly',
                                examples: [
                                    {
                                        text: 'shipments by product yearly',
                                        highlightedWords: [3]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'day of week',
                                examples: [
                                    {
                                        text: 'count shipments Monday',
                                        highlightedWords: [2]
                                    }
                                ]
                            },
                            {
                                keyword: 'month',
                                examples: [
                                    {
                                        text: 'commission January',
                                        highlightedWords: [1]
                                    }
                                ]
                            },
                            {
                                keyword: 'month year',
                                examples: [
                                    {
                                        text: 'commission by sales rep February 2014',
                                        highlightedWords: [4, 5]
                                    }
                                ]
                            },
                            {
                                keyword: 'year',
                                examples: [
                                    {
                                        text: 'revenue by product 2013 product name contains snowboard',
                                        highlightedWords: [3]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'yesterday',
                                examples: [
                                    {
                                        text: 'sales yesterday for pro-ski200 by store',
                                        highlightedWords: [1]
                                    }
                                ]
                            },
                            {
                                keyword: 'week to date',
                                examples: [
                                    {
                                        text: 'sales by order date week to date for pro-ski200',
                                        highlightedWords: [4, 5, 6]
                                    }
                                ]
                            },
                            {
                                keyword: 'month to date',
                                examples: [
                                    {
                                        text: 'sales by product month to date sales > 2400',
                                        highlightedWords: [3, 4, 5]
                                    }
                                ]
                            },
                            {
                                keyword: 'quarter to date',
                                examples: [
                                    {
                                        text: 'sales by product quarter to date for products by sales',
                                        highlightedWords: [3, 4, 5]
                                    }
                                ]
                            },
                            {
                                keyword: 'year to date',
                                examples: [
                                    {
                                        text: 'sales by product year to date',
                                        highlightedWords: [3, 4, 5]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywordSetName: 'last',
                        keywords: [
                            {
                                keyword: 'day',
                                examples: [
                                    {
                                        text: 'count customers last day by referrer',
                                        highlightedWords: [2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'week',
                                examples: [
                                    {
                                        text: 'count customers last week by store',
                                        highlightedWords: [2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'month',
                                examples: [
                                    {
                                        text: 'count customers last month by day',
                                        highlightedWords: [2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'quarter',
                                examples: [
                                    {
                                        text: 'count customers last quarter sale > 300',
                                        highlightedWords: [2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'year',
                                examples: [
                                    {
                                        text: 'top 10 customers last year by sale by store for region west',
                                        highlightedWords: [3, 4]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywordSetName: 'last',
                        keywords: [
                            {
                                keyword: 'n days',
                                examples: [
                                    {
                                        text: 'count visitors last 7 days',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'n weeks',
                                examples: [
                                    {
                                        text: 'count visitor last 10 weeks by day',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'n months',
                                examples: [
                                    {
                                        text: 'count visitors last 6 months for homepage visits > 30 by month',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'n quarters',
                                examples: [
                                    {
                                        text: 'count visitors last 2 quarters by month by campaign',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'n years',
                                examples: [
                                    {
                                        text: 'count visitors last 5 years by revenue for sum revenue > 5000',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywordSetName: 'growth of ... by ...',
                        keywords: [
                            {
                                keyword: '',
                                examples: [
                                    {
                                        text: 'growth of sales by order date',
                                        highlightedWords: [0, 1, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'daily',
                                examples: [
                                    {
                                        text: 'growth of sales by order date daily date between 01/01/2005 and 04/30/2005',
                                        highlightedWords: [0, 1, 3, 6]
                                    }
                                ]
                            },
                            {
                                keyword: 'monthly',
                                examples: [
                                    {
                                        text: 'growth of sales by date shipped monthly sales > 24000',
                                        highlightedWords: [0, 1, 3, 6]
                                    }
                                ]
                            },
                            {
                                keyword: 'weekly',
                                examples: [
                                    {
                                        text: 'growth of sales by receipt date weekly for pro-ski2000',
                                        highlightedWords: [0, 1, 3, 6]
                                    }
                                ]
                            },
                            {
                                keyword: 'quarterly',
                                examples: [
                                    {
                                        text: 'growth of sales by date shipped quarterly for products by sales',
                                        highlightedWords: [0, 1, 3, 6]
                                    }
                                ]
                            },
                            {
                                keyword: 'yearly',
                                examples: [
                                    {
                                        text: 'growth of sales by date closed yearly',
                                        highlightedWords: [0, 1, 3, 6]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywordSetName: 'growth of ... by ... year-over-year',
                        keywords: [
                            {
                                keyword: 'daily',
                                examples: [
                                    {
                                        text: 'growth of revenue by order date daily year-over-year',
                                        highlightedWords: [0, 1, 3, 6, 7]
                                    }
                                ]
                            },
                            {
                                keyword: 'weekly',
                                examples: [
                                    {
                                        text: 'growth of revenue by date shipped weekly year-over-year',
                                        highlightedWords: [0, 1, 3, 6, 7]
                                    }
                                ]
                            },
                            {
                                keyword: 'monthly',
                                examples: [
                                    {
                                        text: 'growth of revenue by receipt date monthly year-over-year',
                                        highlightedWords: [0, 1, 3, 6, 7]
                                    }
                                ]
                            },
                            {
                                keyword: 'quarterly',
                                examples: [
                                    {
                                        text: 'growth of revenue by date shipped quarterly year-over-year',
                                        highlightedWords: [0, 1, 3, 6, 7]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'n days ago',
                                examples: [
                                    {
                                        text: 'sales 2 days ago',
                                        highlightedWords: [1, 2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'n weeks ago',
                                examples: [
                                    {
                                        text: 'sales 4 weeks ago by store',
                                        highlightedWords: [1, 2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'n months ago',
                                examples: [
                                    {
                                        text: 'sales 2 months ago by region',
                                        highlightedWords: [1, 2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'n quarters ago',
                                examples: [
                                    {
                                        text: 'sales 4 quarters ago by product name contains deluxe',
                                        highlightedWords: [1, 2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'n years ago',
                                examples: [
                                    {
                                        text: 'sales 5 years ago by store for region west',
                                        highlightedWords: [1, 2, 3]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'today',
                                examples: [
                                    {
                                        text: 'sales today by store',
                                        highlightedWords: [1]
                                    }
                                ]
                            },
                            {
                                keyword: 'next day',
                                examples: [
                                    {
                                        text: 'shipments next day by order',
                                        highlightedWords: [1, 2]
                                    }
                                ]
                            },
                            {
                                keyword: 'next week',
                                examples: [
                                    {
                                        text: 'shipments next week by store',
                                        highlightedWords: [1, 2]
                                    }
                                ]
                            },
                            {
                                keyword: 'next month',
                                examples: [
                                    {
                                        text: 'appointments next month by day',
                                        highlightedWords: [1, 2]
                                    }
                                ]
                            },
                            {
                                keyword: 'next quarter',
                                examples: [
                                    {
                                        text: 'opportunities next quarter amount > 3000',
                                        highlightedWords: [1, 2]
                                    }
                                ]
                            },
                            {
                                keyword: 'next year',
                                examples: [
                                    {
                                        text: 'opportunities next year by sales rep',
                                        highlightedWords: [1, 2]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'next n days',
                                examples: [
                                    {
                                        text: 'shipments next 7 days',
                                        highlightedWords: [1, 2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'next n weeks',
                                examples: [
                                    {
                                        text: 'shipments next 10 weeks by day',
                                        highlightedWords: [1, 2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'next n months',
                                examples: [
                                    {
                                        text: 'openings next 6 months location',
                                        highlightedWords: [1, 2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'next n quarters',
                                examples: [
                                    {
                                        text: 'opportunities next 2 quarters by campaign',
                                        highlightedWords: [1, 2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'next n years',
                                examples: [
                                    {
                                        text: 'opportunities next 5 years by revenue',
                                        highlightedWords: [1, 2, 3]
                                    }
                                ]

                            }
                        ]
                    }
                ]
            },
            time: {
                groupName: 'Time keywords',
                sets: [
                    {
                        keywords: [
                            {
                                keyword: 'detailed',
                                examples: [
                                    {
                                        text: 'ship time detailed',
                                        highlightedWords: [2]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywordSetName: 'last',
                        keywords: [
                            {
                                keyword: 'minute',
                                examples: [
                                    {
                                        text: 'count homepage views last minute',
                                        highlightedWords: [3, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'hour',
                                examples: [
                                    {
                                        text: 'count unique visits last hour',
                                        highlightedWords: [3, 4]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywordSetName: 'last',
                        keywords: [
                            {
                                keyword: 'n minutes',
                                examples: [
                                    {
                                        text: 'count visitors last 30 minutes',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'n hours',
                                examples: [
                                    {
                                        text: 'count visitors last 12 hours',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'hourly',
                                examples: [
                                    {
                                        text: 'visitors by page name hourly',
                                        highlightedWords: [4]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'n minutes ago',
                                examples: [
                                    {
                                        text: 'sum inventory by product 10 minutes ago',
                                        highlightedWords: [4, 5, 6]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'n hours ago',
                                examples: [
                                    {
                                        text: 'sum inventory by product by store 2 hours ago',
                                        highlightedWords: [6, 7, 8]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            text: {
                groupName: 'Text keywords',
                sets: [
                    {
                        keywords: [
                            {
                                keyword: 'begins with',
                                examples: [
                                    {
                                        text: 'product name begins with \'pro\'',
                                        highlightedWords: [2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'not begins with',
                                examples: [
                                    {
                                        text: 'product name not begins with "tom\'s"',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'contains',
                                examples: [
                                    {
                                        text: 'product name contains "alpine" description contains "snow shoe"',
                                        highlightedWords: [2, 5]
                                    }
                                ]
                            },
                            {
                                keyword: 'ends with',
                                examples: [
                                    {
                                        text: 'product name ends with \'deluxe\'',
                                        highlightedWords: [2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'not ends with',
                                examples: [
                                    {
                                        text: 'product name not ends with "trial"',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'similar to',
                                examples: [
                                    {
                                        text: 'product name similar to \'snow\'',
                                        highlightedWords: [2, 3]
                                    }
                                ]
                            },
                            {
                                keyword: 'not similar to',
                                examples: [
                                    {
                                        text: 'product name not similar to "basic"',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        keywords: [
                            {
                                keyword: 'not begins with',
                                examples: [
                                    {
                                        text: 'product name not begins with "tom\'s"',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            },
                            {
                                keyword: 'not contains',
                                examples: [
                                    {
                                        text: 'product color not contains \'tan\' product color not contains \'red\'',
                                        highlightedWords: [2, 3, 7, 8]
                                    }
                                ]
                            },
                            {
                                keyword: 'not ends with',
                                examples: [
                                    {
                                        text: 'product name not ends with "trial"',
                                        highlightedWords: [2, 3, 4]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            number: {
                groupName: 'Number keywords',
                sets: [
                    {
                        keywords: [
                            {
                                keyword: 'sum',
                                examples: [
                                    {
                                        text: 'sum revenue',
                                        highlightedWords: [0]
                                    }
                                ]
                            },
                            {
                                keyword: 'average',
                                examples: [
                                    {
                                        text: 'average revenue by store',
                                        highlightedWords: [0]
                                    }
                                ]
                            },
                            {
                                keyword: 'count',
                                examples: [
                                    {
                                        text: 'count visitors by site',
                                        highlightedWords: [0]
                                    }
                                ]
                            },
                            {
                                keyword: 'max',
                                examples: [
                                    {
                                        text: 'max sales by visitors by site',
                                        highlightedWords: [0]
                                    }
                                ]
                            },
                            {
                                keyword: 'min',
                                examples: [
                                    {
                                        text: 'min revenue by store by campaign for cost > 5000',
                                        highlightedWords: [0]
                                    }
                                ]
                            },
                            {
                                keyword: 'standard deviation',
                                examples: [
                                    {
                                        text: 'standard deviation revenue by product by month for date after 10/31/2010',
                                        highlightedWords: [0, 1]
                                    }
                                ]
                            },
                            {
                                keyword: 'unique count',
                                examples: [
                                    {
                                        text: 'unique count visitor by product page last week',
                                        highlightedWords: [0, 1]
                                    }
                                ]
                            },
                            {
                                keyword: 'variance',
                                examples: [
                                    {
                                        text: 'variance sale amount by visitor by product for last year',
                                        highlightedWords: [0]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            filter: {
                groupName: 'Filter keywords',
                sets: [
                    {
                        keywords: [
                            {
                                keyword: 'between...and',
                                examples: [
                                    {
                                        text: 'revenue between 0 and 1000',
                                        highlightedWords: [1, 3]
                                    }
                                ]
                            },
                            {
                                keyword: '>',
                                examples: [
                                    {
                                        text: 'sum sale amount by visitor by product for last year sale amount > 2000',
                                        highlightedWords: [12]
                                    }
                                ]
                            },
                            {
                                keyword: '<',
                                examples: [
                                    {
                                        text: 'unique count visitor by product by store for sale amount < 20',
                                        highlightedWords: [10]
                                    }
                                ]
                            },
                            {
                                keyword: '>=',
                                examples: [
                                    {
                                        text: 'count calls by employee lastname >= m',
                                        highlightedWords: [5]
                                    }
                                ]
                            },
                            {
                                keyword: '<=',
                                examples: [
                                    {
                                        text: 'count shipments by city latitude <= 0',
                                        highlightedWords: [5]
                                    }
                                ]
                            },
                            {
                                keyword: '=',
                                examples: [
                                    {
                                        text: 'unique count visitor by store purchased products = 3 for last 5 days',
                                        highlightedWords: [7]
                                    }
                                ]
                            },
                            {
                                keyword: '!=',
                                examples: [
                                    {
                                        text: 'sum sale amount region != canada region != mexico',
                                        highlightedWords: [4, 7]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            location: {
                groupName: 'Location keywords',
                sets: [
                    {
                        keywords: [
                            {
                                keyword: 'near…within n miles|km|meters (Note: The `near` keyword requires latitude and ' +
                                      'longitude columns to exist and be marked as such from the Data tab in ' +
                                      'the same table as the column being filtered)',
                                examples: [
                                    {
                                        text: 'store_id near StoreId0 within 50 miles',
                                        highlightedWords: [1, 3, 4, 5]
                                    }
                                ]
                            },
                            {
                                keyword: 'farther than n miles|km|meters from (Note: The `farther than` keyword requires ' +
                                      'latitude and longitude columns to exist and be marked as such from the Data tab in ' +
                                      'the same table as the column being filtered)',
                                examples: [
                                    {
                                        text: 'supplier farther than 80 km from supplier_05',
                                        highlightedWords: [1, 2, 4, 4, 5]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    };
});
