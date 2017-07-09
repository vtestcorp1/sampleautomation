/**
 * Created by Xuan Zhang (shawn@thoughtspot.com), Shitong Shou
 * Created @ Jul 17, 2015
 *
 * this file contains test cases for keywords
 * each test case has the following structure
 * {
 *   count
 *   query
 *   [optional]
 *   results: {
 *     headline,
 *     table
 *   }
 * }
 * the count indicates the index of test case being run and is also used to determine which set the test falls in
 * the query is run for each test and we compare the the result to the expected headline and table values
 * optionally, set disableWs to true will run the query only for table based queries
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var DATASET_1969_2040 = {
    sticker: '1969_2040',
    tests: [{
        count: 1,
        query: 'date after 03/03/1969',
        results: {
            headline: {
                val: ['03/12/1969-08/22/2040'],
                col: ['Date'],
                sel: ['']
            },
            table: {
                col: ['Date'],
                sel: ['NO_BUCKET'],
                val: ['03/12/1969']
            }
        }
    }, {
        count: 2,
        query: 'date after 01/31/2040 by color date daily',
        results: {
            headline: {
                val: ['8', '08/01/2040-08/22/2040'],
                col: ['Color', 'Daily (Date)'],
                sel: ['UNIQUE COUNT', '']
            },
            table: {
                col: ['Color', 'Date'],
                sel: ['', 'DAILY'],
                val: ['blue', '08/03/2040']
            }
        }
    }, {
        count: 3,
        query: 'date before 11/04/1969 volume date daily',
        results: {
            headline: {
                val: ['03/12/1969-04/10/1969', '9.66K'],
                col: ['Daily (Date)', 'Volume'],
                sel: ['', 'Total']
            },
            table: {
                col: ['Date', 'Volume'],
                sel: ['DAILY', 'TOTAL'],
                val: ['03/12/1969', '386']
            }
        }
    }, {
        count: 4,
        query: 'date before 01/31/2040 by color date daily',
        results: {
            headline: {
                val: ['8', '03/12/1969-04/10/1969'],
                col: ['Color', 'Daily (Date)'],
                sel: ['UNIQUE COUNT', '']
            },
            table: {
                col: ['Color', 'Date'],
                sel: ['', 'DAILY'],
                val: ['blue', '03/16/1969']
            }
        }
    }]
};

var DATASET_TPCH = {
    sticker: 'TPCH',
    tests: [{
        count: 1,
        query: 'revenue by customer nation',
        results: {
            headline: {
                val: ['25', '18.1B'],
                col: ['Customer Nation', 'Revenue'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Customer Nation', 'Revenue'],
                sel: ['', 'TOTAL'],
                val: ['algeria', '749,361,081']
            }
        }
    }, {
        count: 2,
        query: 'revenue by order date monthly',
        results: {
            headline: {
                val: ['Jan1992-Aug1998', '18.1B'],
                col: ['Monthly (Order Date)', 'Revenue'],
                sel: ['', 'Total']
            },
            table: {
                col: ['Order Date', 'Revenue'],
                sel: ['MONTHLY', 'TOTAL'],
                val: ['Jan 1992', '130,135,283']
            }
        }
    }, {
        count: 3,
        query: 'revenue by tax',
        results: {
            headline: {
                val: ['9', '18.1B'],
                col: ['Tax', 'Revenue'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Tax', 'Revenue'],
                sel: ['', 'TOTAL'],
                val: ['0', '1,845,797,505']
            }
        }
    }, {
        count: 4,
        query: 'color by part name',
        results: {
            headline: {
                val: ['92', '3.68K'],
                col: ['Color', 'Part Name'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT']
            },
            table: {
                col: ['Color', 'Part Name'],
                sel: ['', ''],
                val: ['almond', 'antique light']
            }
        }
    }, {
        count: 5,
        query: 'color by commit date monthly',
        results: {headline: {
            val: ['92', 'Feb1992-Oct1998'],
            col: ['Color', 'Monthly (Commit Date)'],
            sel: ['UNIQUE COUNT', '']
        },
            table: {
                col: ['Color', 'Commit Date'],
                sel: ['', 'MONTHLY'],
                val: ['almond', 'May 1992']
            }}
    }, {
        count: 6,
        query: 'color by discount',
        results: {
            headline: {
                val: ['92', '11'],
                col: ['Color', 'Discount'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT']
            },
            table: {
                col: ['Color', 'Discount'],
                sel: ['', ''],
                val: ['almond', '0']
            }
        }
    }, {
        count: 7,
        query: 'commit date monthly by order date quarterly',
        results: {
            headline: {
                val: ['Feb1992-Oct1998', 'Q11992-Q41998'],
                col: ['Monthly (Commit Date)', 'Quarterly (Order Date)'],
                sel: ['', '']
            },
            table: {
                col: ['Commit Date', 'Order Date'],
                sel: ['MONTHLY', 'QUARTERLY'],
                val: ['Feb 1992', 'Q1 1992']
            }
        }
    }, {
        count: 8,
        query: 'commit date monthly by quantity',
        disableWs: true,
        results: {
            headline: {
                val: ['Feb1992-Oct1998', '51'],
                col: ['Monthly (Commit Date)', 'Quantity'],
                sel: ['', 'UNIQUE COUNT']
            },
            table: {
                col: ['Commit Date', 'Quantity'],
                sel: ['MONTHLY', ''],
                val: ['Feb 1992', '1']
            }
        }
    }, {
        count: 9,
        query: 'commit date monthly by customer city',
        results: {
            headline: {
                val: ['Feb1992-Oct1998', '248'],
                col: ['Monthly (Commit Date)', 'Customer City'],
                sel: ['', 'UNIQUE COUNT']
            },
            table: {
                col: ['Commit Date', 'Customer City'],
                sel: ['MONTHLY', ''],
                val: ['Feb 1992', 'algeria 1']
            }
        }
    }, {
        count: 10,
        query: 'revenue for supplier region europe',
        results: {
            headline: {
                val: ['3.42B'],
                col: ['Revenue'],
                sel: ['Total']
            },
            table: {
                col: ['Revenue'],
                sel: ['TOTAL'],
                val: ['3,416,045,501']
            }
        }
    }, {
        count: 11,
        query: 'revenue for average revenue <= 30000000 by supplier region',
        results: {
            headline: {
                val: ['5', '18.1B', '3.54M'],
                col: ['Supplier Region', 'Revenue', 'Revenue'],
                sel: ['UNIQUE COUNT', 'Total', 'MIN']
            },
            table: {
                col: ['Supplier Region', 'Revenue', 'Revenue'],
                sel: ['', 'TOTAL', 'AVG'],
                val: ['africa', '3,392,770,934', '3,586,438.62']
            }
        }
    }, {
        count: 12,
        query: 'revenue for order date 04/11/1994',
        results: {
            headline: {
                val: ['16.8M'],
                col: ['Revenue'],
                sel: ['Total']
            },
            table: {
                col: ['Revenue'],
                sel: ['TOTAL'],
                val: ['16,842,947']
            }
        }
    }, {
        count: 13,
        query: 'top supplier nation ranked by revenue',
        results: {
            headline: {
                val: ['10', '8.26B'],
                col: ['Supplier Nation', 'Revenue'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Supplier Nation', 'Revenue'],
                sel: ['', 'TOTAL'],
                val: ['china', '918,573,003']
            }
        }
    }, {
        count: 14,
        query: 'top customer city ranked by average tax for each customer nation',
        results: {
            headline: {
                val: ['248', '25', '1.5'],
                col: ['Customer City', 'Customer Nation', 'Tax'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'MIN']
            },
            table: {
                col: ['Customer Nation', 'Customer City', 'Tax'],
                sel: ['', '', 'AVG'],
                val: ['algeria', 'algeria 4', '4.86']
            }
        }
    }, {
        count: 15,
        query: 'top commit date daily ranked by discount',
        results: {
            headline: {
                val: ['01/16/1994-12/05/1997', '484'],
                col: ['Daily (Commit Date)', 'Discount'],
                sel: ['', 'Total']
            },
            table: {
                col: ['Commit Date', 'Discount'],
                sel: ['DAILY', 'TOTAL'],
                val: ['04/12/1994', '58']
            }
        }
    }, {
        count: 16,
        query: 'top commit date monthly ranked by discount',
        results: {
            headline: {
                val: ['Dec1993-Mar1998', '4.42K'],
                col: ['Monthly (Commit Date)', 'Discount'],
                sel: ['', 'Total']
            },
            table: {
                col: ['Commit Date', 'Discount'],
                sel: ['MONTHLY', 'TOTAL'],
                val: ['Apr 1994', '528']
            }
        }
    }, {
        count: 17,
        query: 'bottom supplier name ranked by order total price',
        results: {
            headline: {
                val: ['10', '13M'],
                col: ['Supplier Name', 'Order Total Price'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Supplier Name', 'Order Total Price'],
                sel: ['', 'TOTAL'],
                val: ['supplier#000000203', '163,514']
            }
        }
    }, {
        count: 18,
        query: 'bottom manufacturer ranked by order total price',
        results: {
            headline: {
                val: ['5', '95.6B'],
                col: ['Manufacturer', 'Order Total Price'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Manufacturer', 'Order Total Price'],
                sel: ['', 'TOTAL'],
                val: ['mfgr#2', '17,914,408,982']
            }
        }
    }, {
        count: 19,
        query: 'bottom commit date monthly ranked by customer custkey',
        results: {
            headline: {
                val: ['Jun1992-Feb1998', '6'],
                col: ['Monthly (Commit Date)', 'Customer CustKey'],
                sel: ['', 'UNIQUE COUNT']
            },
            table: {
                col: ['Commit Date', 'Customer CustKey'],
                sel: ['MONTHLY', ''],
                val: ['Feb 1998', '16']
            }
        }
    }, {
        count: 20,
        query: 'bottom commit date monthly ranked by supply cost',
        results: {
            headline: {
                val: ['Feb1992-Oct1998', '32.5M'],
                col: ['Monthly (Commit Date)', 'Supply Cost'],
                sel: ['', 'Total']
            },
            table: {
                col: ['Commit Date', 'Supply Cost'],
                sel: ['MONTHLY', 'TOTAL'],
                val: ['Feb 1992', '1,079,098']
            }
        }
    }, {
        count: 21,
        query: 'revenue by supplier city sort by average revenue descending',
        results: {
            headline: {
                val: ['250', '18.1B', '410K'],
                col: ['Supplier City', 'Revenue', 'Revenue'],
                sel: ['UNIQUE COUNT', 'Total', 'MIN']
            },
            table: {
                col: ['Supplier City', 'Revenue', 'Revenue'],
                sel: ['', 'TOTAL', 'AVG'],
                val: ['russia 8', '11,047,978', '5,523,989.00']
            }
        }
    }, {
        count: 22,
        query: 'tax by part name sort by color',
        results: {
            headline: {
                val: ['3.65K', '92', '20.2K'],
                col: ['Part Name', 'Color', 'Tax'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Part Name', 'Color', 'Tax'],
                sel: ['', '', 'TOTAL'],
                val: ['antique light', 'almond', '1']
            }
        }
    }, {
        count: 23,
        query: 'quantity by customer region sort by order date monthly',
        results: {
            headline: {
                val: ['5', 'Jan1992-Aug1998', '127K'],
                col: ['Customer Region', 'Monthly (Order Date)', 'Quantity'],
                sel: ['UNIQUE COUNT', '', 'Total']
            },
            table: {
                col: ['Customer Region', 'Order Date', 'Quantity'],
                sel: ['', 'MONTHLY', 'TOTAL'],
                val: ['africa', 'Jan 1992', '188']
            }
        }
    }, {
        count: 24,
        query: 'quantity by customer region sort by order date quarterly',
        results: {
            headline: {
                val: ['5', 'Q11992-Q31998', '127K'],
                col: ['Customer Region', 'Quarterly (Order Date)', 'Quantity'],
                sel: ['UNIQUE COUNT', '', 'Total']
            },
            table: {
                col: ['Customer Region', 'Order Date', 'Quantity'],
                sel: ['', 'QUARTERLY', 'TOTAL'],
                val: ['africa', 'Q1 1992', '526']
            }
        }
    }, {
        count: 25,
        query: 'quantity by customer region sort by order date weekly',
        results: {
            headline: {
                val: ['5', '12/30/1991-07/27/1998', '127K'],
                col: ['Customer Region', 'Weekly (Order Date)', 'Quantity'],
                sel: ['UNIQUE COUNT', '', 'Total']
            },
            table: {
                col: ['Customer Region', 'Order Date', 'Quantity'],
                sel: ['', 'WEEKLY', 'TOTAL'],
                val: ['asia', '12/30/1991', '74']
            }
        }
    }, {
        count: 26,
        query: 'order date after 04/02/1994 order date discount sort by order date daily',
        results: {
            headline: {
                val: ['04/04/1994-08/02/1998', '16.6K'],
                col: ['Daily (Order Date)', 'Discount'],
                sel: ['', 'Total']
            },
            table: {
                col: ['Order Date', 'Discount'],
                sel: ['DAILY', 'TOTAL'],
                val: ['04/04/1994', '0']
            }
        }
    }, {
        count: 27,
        query: 'order date after 12/01/1994 by container order date weekly',
        results: {
            headline: {
                val: ['40', '11/28/1994-07/27/1998'],
                col: ['Container', 'Weekly (Order Date)'],
                sel: ['UNIQUE COUNT', '']
            },
            table: {
                col: ['Container', 'Order Date'],
                sel: ['', 'WEEKLY'],
                val: ['jumbo bag', '12/05/1994']
            }
        }
    }, {
        count: 28,
        query: 'commit date before 12/31/1997 daily',
        results: {
            headline: {
                val: ['02/10/1992-12/28/1997'],
                col: ['Daily (Commit Date)'],
                sel: ['']
            },
            table: {
                col: ['Commit Date'],
                sel: ['DAILY'],
                val: ['02/10/1992']
            }
        }
    }, {
        count: 29,
        query: 'commit date before 02/10/1995 monthly quantity sort by commit date',
        disableWs: true,
        results: {
            headline: {
                val: ['Feb1992-Feb1995', '56K'],
                col: ['Monthly (Commit Date)', 'Quantity'],
                sel: ['', 'Total']
            },
            table: {
                col: ['Commit Date', 'Quantity'],
                sel: ['MONTHLY', 'TOTAL'],
                val: ['Feb 1992', '294']
            }
        }
    }, {
        count: 30,
        query: 'commit date between 07/13/1994 and 11/30/1996 by quantity commit date',
        results: {
            headline: {
                val: ['51', 'Jul1994-Nov1996'],
                col: ['Quantity', 'Monthly (Commit Date)'],
                sel: ['UNIQUE COUNT', '']
            },
            table: {
                col: ['Quantity', 'Commit Date'],
                sel: ['', 'MONTHLY'],
                val: ['0', 'Aug 1996']
            }
        }
    }, {
        count: 31,
        query: 'discount by commit date monthly by supplier region',
        results: {
            headline: {
                val: ['Feb1992-Oct1998', '5'],
                col: ['Monthly (Commit Date)', 'Supplier Region', 'Discount'],
                sel: ['', 'UNIQUE COUNT']
            },
            table: {
                col: ['Commit Date', 'Supplier Region', 'Discount'],
                sel: ['MONTHLY', '', 'TOTAL'],
                val: ['Feb 1992', 'africa', '12']
            }
        }
    }, {
        count: 32,
        query: 'tax commit date by week december 1994',
        disableWs: true,
        results: {
            headline: {
                val: ['11/28/1994-12/26/1994', '227'],
                col: ['Weekly (Commit Date)', 'Tax'],
                sel: ['', 'Total']
            },
            table: {
                col: ['Commit Date', 'Tax'],
                sel: ['WEEKLY', 'TOTAL'],
                val: ['11/28/1994', '44']
            }
        }
    }, {
        count: 33,
        query: 'discount commit date  by week order date != 1995 order date != 1998 sort by order date',
        results: {
            headline: {
                val: ['02/10/1992-03/23/1998', 'Jan1992-Dec1997', '19.1K'],
                col: ['Weekly (Commit Date)', 'Monthly (Order Date)', 'Discount'],
                sel: ['', '', 'Total']
            },
            table: {
                col: ['Commit Date', 'Order Date', 'Discount'],
                sel: ['WEEKLY', 'MONTHLY', 'TOTAL'],
                val: ['02/10/1992', 'Jan 1992', '36']
            }
        }
    }, {
        count: 34,
        query: 'datekey month for year 1994',
        disableWs: true,
        results: {
            headline: {
                val: ['12/27/1993-12/26/1994', '12'],
                col: ['Weekly (Datekey)', 'Month'],
                sel: ['', 'UNIQUE COUNT']
            },
            table: {
                col: ['Datekey', 'Month'],
                sel: ['WEEKLY', ''],
                val: ['12/27/1993', 'january']
            }
        }
    }, {
        count: 35,
        query: 'ship mode by customer city commit date daily',
        results: {
            headline: {
                val: ['8', '248', '02/10/1992-10/24/1998'],
                col: ['Ship Mode', 'Customer City', 'Daily (Commit Date)'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', '']
            },
            table: {
                col: ['Ship Mode', 'Customer City', 'Commit Date'],
                sel: ['', '', 'DAILY'],
                val: ['air', 'algeria 0', '05/04/1993']
            }
        }
    }, {
        count: 36,
        query: 'quantity >= 13 commit date weekly',
        results: {
            headline: {
                val: ['02/10/1992-10/19/1998', '119K'],
                col: ['Weekly (Commit Date)', 'Quantity'],
                sel: ['', 'Total']
            },
            table: {
                col: ['Commit Date', 'Quantity'],
                sel: ['WEEKLY', 'TOTAL'],
                val: ['02/10/1992', '149']
            }
        }
    }, {
        count: 37,
        query: 'type contains "nickel" order date monthly type',
        results: {
            headline: {
                val: ['Jan1992-Aug1998', '30'],
                col: ['Monthly (Order Date)', 'Type'],
                sel: ['', 'UNIQUE COUNT']
            },
            table: {
                col: ['Order Date', 'Type'],
                sel: ['MONTHLY', ''],
                val: ['Jan 1992', 'large brushed nickel']
            }
        }
    }, {
        count: 38,
        query: 'order total price commit date quarterly for each customer region',
        results: {
            headline: {
                val: ['Q11992-Q41998', '5', '95.6B'],
                col: ['Quarterly (Commit Date)', 'Customer Region', 'Order Total Price'],
                sel: ['', 'UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Commit Date', 'Customer Region', 'Order Total Price'],
                sel: ['QUARTERLY', '', 'TOTAL'],
                val: ['Q1 1992', 'africa', '110,941,332']
            }
        }
    }, {
        count: 39,
        query: 'almond order date quarterly for each customer region revenue',
        results: {
            headline: {
                val: ['Q11992-Q21998', '5', '168M'],
                col: ['Quarterly (Order Date)', 'Customer Region', 'Revenue'],
                sel: ['', 'UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Order Date', 'Customer Region', 'Revenue'],
                sel: ['QUARTERLY', '', 'TOTAL'],
                val: ['Q1 1992', 'america', '3,333,008']
            }
        }
    }, {
        count: 40,
        query: 'lineorder custkey by market segment order date yearly',
        results: {
            headline: {
                val: ['1.18K', '5', '1992-1998'],
                col: ['Lineorder CustKey', 'Market Segment', 'Yearly (Order Date)'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', '']
            },
            table: {
                col: ['Lineorder CustKey', 'Market Segment', 'Order Date'],
                sel: ['', '', 'YEARLY'],
                val: ['16', 'furniture', '1997']
            }
        }
    }, {
        count: 41,
        query: 'customer region != asia by tax order date yearly customer region',
        results: {
            headline: {
                val: ['9', '1992-1998', '4'],
                col: ['Tax', 'Yearly (Order Date)', 'Customer Region'],
                sel: ['UNIQUE COUNT', '', 'UNIQUE COUNT']
            },
            table: {
                col: ['Tax', 'Order Date', 'Customer Region'],
                sel: ['', 'YEARLY', ''],
                val: ['0', '1992', 'africa']
            }
        }
    }, {
        count: 42,
        query: 'count quantity > 25 commit date = wednesday by supplier nation',
        results: {
            headline: {
                val: ['13', '32.8'],
                col: ['Supplier Nation', 'Quantity'],
                sel: ['UNIQUE COUNT', 'AVG']
            },
            table: {
                col: ['Supplier Nation', 'Quantity'],
                sel: ['', 'TOTAL COUNT'],
                val: ['algeria', '28']
            }
        }
    }, {
        count: 43,
        query: 'count part name order date = sunday by customer custkey',
        results: {
            headline: {
                val: ['159', '4.24'],
                col: ['Customer CustKey', 'Part Name'],
                sel: ['UNIQUE COUNT', 'AVG']
            },
            table: {
                col: ['Customer CustKey', 'Total count Part Name'],
                sel: ['', ''],
                val: ['46', '4']
            }
        }
    }, {
        count: 44,
        query: 'count commit date by supplier suppkey commit date = sunday',
        results: {
            headline: {
                val: ['574', '1.2'],
                col: ['Supplier SuppKey', 'Commit Date'],
                sel: ['UNIQUE COUNT', 'AVG']
            },
            table: {
                col: ['Supplier SuppKey', 'Total count Commit Date'],
                sel: ['', ''],
                val: ['4', '2']
            }
        }
    }, {
        count: 45,
        query: 'supply cost commit date = april orderkey daily',
        results: {
            headline: {
                val: ['229', '04/01/1992-04/29/1998', '41.1M'],
                col: ['OrderKey', 'Daily (Commit Date)', 'Supply Cost'],
                sel: ['UNIQUE COUNT', '', 'Total']
            },
            table: {
                col: ['OrderKey', 'Commit Date', 'Supply Cost'],
                sel: ['', 'DAILY', 'TOTAL'],
                val: ['1', '04/16/1995', '76,638']
            }
        }
    }, {
        count: 46,
        query: 'lineorder partkey commit date = april quantity commit date',
        results: {
            headline: {
                val: ['453', 'Apr1992-Apr1998', '11.7K'],
                col: ['Lineorder PartKey', 'Monthly (Commit Date)', 'Quantity'],
                sel: ['UNIQUE COUNT', '', 'Total']
            },
            table: {
                col: ['Lineorder PartKey', 'Commit Date', 'Quantity'],
                sel: ['', 'MONTHLY', 'TOTAL'],
                val: ['149', 'Apr 1997', '47']
            }
        }
    }, {
        count: 47,
        query: 'order total price > 12000000 by customer custkey commit date = february',
        results: {
            headline: {
                val: ['122', '5.43B'],
                col: ['Customer CustKey', 'Order Total Price'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Customer CustKey', 'Order Total Price'],
                sel: ['', 'TOTAL'],
                val: ['113', '47,712,396']
            }
        }
    }, {
        count: 48,
        query: 'quantity by customer region color color != purple commit date >= 05/01/1993 commit date < 06/01/1993',
        disableWs: true,
        results: {
            headline: {
                val: ['5', '33', '1.14K'],
                col: ['Customer Region', 'Color', 'Quantity'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Customer Region', 'Color', 'Quantity'],
                sel: ['', '', 'TOTAL'],
                val: ['africa', 'antique', '17']
            }
        }
    }, {
        count: 49,
        query: 'manufacturer ends with "5" order total price order date =  1996 manufacturer',
        results: {
            headline: {
                val: ['1', '2.95B'],
                col: ['Manufacturer', 'Order Total Price'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Manufacturer', 'Order Total Price'],
                sel: ['', 'TOTAL'],
                val: ['mfgr#5', '2,949,073,101']
            }
        }
    }, {
        count: 50,
        query: 'growth of revenue by commit date commit date != june',
        results: {
            headline: {
                val: ['Feb1992-Oct1998', '-69.35%'],
                col: ['Monthly (Commit Date)', 'Growth of Total Revenue'],
                sel: ['', 'MIN']
            },
            table: {
                col: ['Commit Date', 'Growth of Total Revenue'],
                sel: ['MONTHLY', 'TOTAL'],
                val: ['Feb 1992', '{Blank}']
            }
        }
    }, {
        count: 51,
        query: 'growth of order total price by commit date daily commit date between 02/03/1995 and 05/01/1995',
        results: {
            headline: {
                val: ['02/03/1995-05/01/1995', '-92.38%'],
                col: ['Daily (Commit Date)', 'Growth of Total Order Total Price'],
                sel: ['', 'MIN']
            },
            table: {
                col: ['Commit Date', 'Growth of Total Order Total Price'],
                sel: ['DAILY', 'TOTAL'],
                val: ['02/03/1995', '{Blank}']
            }
        }
    }, {
        count: 52,
        query: 'growth of tax by order date monthly for type standard brushed tin promo polished nickel type',
        results: {
            headline: {
                val: ['2', 'Jan1992-Jul1998', '-100.00%'],
                col: ['Type', 'Monthly (Order Date)', 'Growth of Total Tax'],
                sel: ['UNIQUE COUNT', '', 'MIN']
            },
            table: {
                col: ['Type', 'Order Date', 'Growth of Total Tax'],
                sel: ['', 'MONTHLY', 'TOTAL'],
                val: ['promo polished nickel', 'Jan 1992', '{Blank}']
            }
        }
    }, {
        count: 53,
        query: 'growth of quantity by commit date weekly customer region',
        results: {
            headline: {
                val: ['5', '02/10/1992-10/19/1998', '-99.51%'],
                col: ['Customer Region', 'Weekly (Commit Date)', 'Growth of Total Quantity'],
                sel: ['UNIQUE COUNT', '', 'MIN']
            },
            table: {
                col: ['Customer Region', 'Commit Date', 'Growth of Total Quantity'],
                sel: ['', 'WEEKLY', 'TOTAL'],
                val: ['africa', '02/10/1992', '{Blank}']
            }
        }
    }, {
        count: 54,
        query: 'growth of supply cost by order date yearly color = antique',
        results: {
            headline: {
                val: ['1992-1998', '-49.57%'],
                col: ['Yearly (Order Date)', 'Growth of Total Supply Cost'],
                sel: ['', 'MIN']
            },
            table: {
                col: ['Order Date', 'Growth of Total Supply Cost'],
                sel: ['YEARLY', 'TOTAL'],
                val: ['1992', '{Blank}']
            }
        }
    }, {
        count: 55,
        query: 'growth of extended price by order date daily year-over-year order date > 01/01/1996',
        results: {
            headline: {
                val: ['01/03/1996-08/02/1998', '-97.96%'],
                col: ['Daily (Order Date)', 'Growth of Total Extended Price'],
                sel: ['', 'MIN']
            },
            table: {
                col: ['Order Date', 'Growth of Total Extended Price'],
                sel: ['DAILY', 'TOTAL'],
                val: ['01/03/1996', '{Blank}']
            }
        }
    }, {
        count: 56,
        query: 'growth of tax by order date weekly year-over-year revenue ship mode = reg air',
        results: {
            headline: {
                val: ['12/30/1991-07/27/1998', '-100.00%', '2.57B'],
                col: ['Weekly (Order Date)', 'Growth of Total Tax', 'Revenue'],
                sel: ['', 'MIN', 'Total']
            },
            table: {
                col: ['Order Date', 'Growth of Total Tax', 'Revenue'],
                sel: ['WEEKLY', 'TOTAL', 'TOTAL'],
                val: ['12/30/1991', '{Blank}', '1,548,845']
            }
        }
    }, {
        count: 57,
        query: 'growth of discount by commit date monthly year-over-year commit date between 01/01/1992 and 01/01/1994',
        results: {
            headline: {
                val: ['Feb1992-Jan1994', '-98.89%'],
                col: ['Monthly (Commit Date)', 'Growth of Total Discount'],
                sel: ['', 'MIN']
            },
            table: {
                col: ['Commit Date', 'Growth of Total Discount'],
                sel: ['MONTHLY', 'TOTAL'],
                val: ['Feb 1992', '{Blank}']
            }
        }
    }, {
        count: 58,
        query: 'growth of revenue by commit date quarterly year-over-year discount',
        results: {
            headline: {
                val: ['Q11992-Q41998', '-88.86%', '25.3K'],
                col: ['Quarterly (Commit Date)', 'Growth of Total Revenue', 'Discount'],
                sel: ['', 'MIN', 'Total']
            },
            table: {
                col: ['Commit Date', 'Growth of Total Revenue', 'Discount'],
                sel: ['QUARTERLY', 'TOTAL', 'TOTAL'],
                val: ['Q1 1992', '{Blank}', '281']
            }
        }
    }, {
        count: 59,
        query: 'color begins with "w" revenue color quantity tax',
        results: {
            headline: {
                val: ['2', '302M', '2.06K', '297'],
                col: ['Color', 'Revenue', 'Quantity', 'Tax'],
                sel: ['UNIQUE COUNT', 'Total', 'Total', 'Total']
            },
            table: {
                col: ['Color', 'Revenue', 'Quantity', 'Tax'],
                sel: ['', 'TOTAL', 'TOTAL', 'TOTAL'],
                val: ['wheat', '156,458,174', '1,103', '159']
            }
        }
    }, {
        count: 60,
        query: 'ship mode begins with "ai" order total price ship mode',
        results: {
            headline: {
                val: ['1', '13.1B'],
                col: ['Ship Mode', 'Order Total Price'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Ship Mode', 'Order Total Price'],
                sel: ['', 'TOTAL'],
                val: ['air', '13,130,288,975']
            }
        }
    }, {
        count: 61,
        query: 'customer city contains "er" quantity customer city color contains "y"',
        results: {
            headline: {
                val: ['27', '1.71K'],
                col: ['Customer City', 'Quantity'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Customer City', 'Quantity'],
                sel: ['', 'TOTAL'],
                val: ['algeria 0', '30']
            }
        }
    }, {
        count: 62,
        query: 'supplier region contains "ri" discount quantity part name order date monthly sort by part name descending',
        results: {
            headline: {
                val: ['1.72K', 'Jan1992-Aug1998', '9.71K', '48.6K'],
                col: ['Part Name', 'Monthly (Order Date)', 'Discount', 'Quantity'],
                sel: ['UNIQUE COUNT', '', 'Total', 'Total']
            },
            table: {
                col: ['Part Name', 'Order Date', 'Discount', 'Quantity'],
                sel: ['', 'MONTHLY', 'TOTAL', 'TOTAL'],
                val: ['yellow turquoise', 'Jan 1998', '4', '34']
            }
        }
    }, {
        count: 63,
        query: 'commit date > 03/18/1996 supplier nation ends with "a" supplier nation sort by supplier nation commit date sort by commit date',
        results: {
            headline: {
                val: ['11', 'Mar1996-Oct1998'],
                col: ['Supplier Nation', 'Monthly (Commit Date)'],
                sel: ['UNIQUE COUNT', '']
            },
            table: {
                col: ['Supplier Nation', 'Commit Date'],
                sel: ['', 'MONTHLY'],
                val: ['algeria', 'Apr 1996']
            }
        }
    }, {
        count: 64,
        query: 'supplier nation ends with "na" color contains "iv" revenue supplier nation color sort by revenue descending',
        results: {
            headline: {
                val: ['2', '2', '14.8M'],
                col: ['Supplier Nation', 'Color', 'Revenue'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Supplier Nation', 'Color', 'Revenue'],
                sel: ['', '', 'TOTAL'],
                val: ['argentina', 'olive', '12,526,933']
            }
        }
    }, {
        count: 65,
        query: 'ship mode not begins with "tru" order total price ship mode sort by ship mode',
        results: {
            headline: {
                val: ['6', '81.1B'],
                col: ['Ship Mode', 'Order Total Price'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Ship Mode', 'Order Total Price'],
                sel: ['', 'TOTAL'],
                val: ['air', '13,130,288,975']
            }
        }
    }, {
        count: 66,
        query: 'supplier address not begins with "r" supplier city ends with "3"',
        results: {
            headline: {
                val: ['190', '25'],
                col: ['Supplier Address', 'Supplier City'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT']
            },
            table: {
                col: ['Supplier Address', 'Supplier City'],
                sel: ['', ''],
                val: [',2vfvnkbmxiywp6q2hx8', 'russia 3']
            }
        }
    }, {
        count: 67,
        query: 'supplier phone not contains "750" supplier name ends with "9" supplier phone supplier name',
        results: {
            headline: {
                val: ['199', '199'],
                col: ['Supplier Phone', 'Supplier Name'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT']
            },
            table: {
                col: ['Supplier Phone', 'Supplier Name'],
                sel: ['', ''],
                val: ['10-132-906-1117', 'supplier#000001009']
            }
        }
    }, {
        count: 68,
        query: 'customer phone not contains "456" customer city not contains "bi" quantity customer phone customer city sort by customer city descending sort by customer phone',
        results: {
            headline: {
                val: ['1.13K', '238', '122K'],
                col: ['Customer Phone', 'Customer City', 'Quantity'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Customer Phone', 'Customer City', 'Quantity'],
                sel: ['', '', 'TOTAL'],
                val: ['31-204-148-5805', 'vietnam 9', '28']
            }
        }
    }, {
        count: 69,
        query: 'customer nation not ends with "co" order date between 05/03/1995 and 12/31/1995 quantity customer nation order date weekly sort by quantity descending',
        results: {
            headline: {
                val: ['24', '05/01/1995-12/25/1995', '13.4K'],
                col: ['Customer Nation', 'Weekly (Order Date)', 'Quantity'],
                sel: ['UNIQUE COUNT', '', 'Total']
            },
            table: {
                col: ['Customer Nation', 'Order Date', 'Quantity'],
                sel: ['', 'WEEKLY', 'TOTAL'],
                val: ['russia', '05/29/1995', '298']
            }
        }
    }, {
        count: 70,
        query: 'discount customer phone not ends with "11" customer phone customer region',
        results: {
            headline: {
                val: ['1.17K', '5', '24.9K'],
                col: ['Customer Phone', 'Customer Region', 'Discount'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Customer Phone', 'Customer Region', 'Discount'],
                sel: ['', '', 'TOTAL'],
                val: ['10-103-996-8780', 'africa', '7']
            }
        }
    }, {
        count: 71,
        query: 'tax sum revenue by supplier region order date october order date sort by order date',
        results: {
            headline: {
                val: ['5', 'Oct1992-Oct1997', '1.66K', '1.37B'],
                col: ['Supplier Region', 'Monthly (Order Date)', 'Tax', 'Revenue'],
                sel: ['UNIQUE COUNT', '', 'Total', 'Total']
            },
            table: {
                col: ['Supplier Region', 'Order Date', 'Tax', 'Revenue'],
                sel: ['', 'MONTHLY', 'TOTAL', 'TOTAL'],
                val: ['africa', 'Oct 1992', '54', '47,151,342']
            }
        }
    }, {
        count: 72,
        query: 'sum discount by supplier name sort by sum discount descending',
        results: {
            headline: {
                val: ['1.86K', '25.3K'],
                col: ['Supplier Name', 'Discount'],
                sel: ['UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Supplier Name', 'Discount'],
                sel: ['', 'TOTAL'],
                val: ['supplier#000000126', '48']
            }
        }
    }, {
        count: 73,
        query: 'part name color average quantity by customer region',
        results: {
            headline: {
                val: ['3.65K', '92', '5', '1'],
                col: ['Part Name', 'Color', 'Customer Region', 'Quantity'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'UNIQUE COUNT', 'MIN']
            },
            table: {
                col: ['Part Name', 'Color', 'Customer Region', 'Quantity'],
                sel: ['', '', '', 'AVG'],
                val: ['almond aquamarine', 'dark', 'america', '28.00']
            }
        }
    }, {
        count: 74,
        query: 'average order total price by market segment by customer nation sort by customer nation',
        results: {
            headline: {
                val: ['5', '25', '7.25M'],
                col: ['Market Segment', 'Customer Nation', 'Order Total Price'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'MIN']
            },
            table: {
                col: ['Market Segment', 'Customer Nation', 'Order Total Price'],
                sel: ['', '', 'AVG'],
                val: ['automobile', 'algeria', '15,785,924.60']
            }
        }
    }, {
        count: 75,
        query: 'count ship mode by part name part name > maroon grey sort by part name',
        results: {
            headline: {
                val: ['1.49K', '1.3'],
                col: ['Part Name', 'Ship Mode'],
                sel: ['UNIQUE COUNT', 'AVG']
            },
            table: {
                col: ['Part Name', 'Total count Ship Mode'],
                sel: ['', ''],
                val: ['maroon honeydew', '2']
            }
        }
    }, {
        count: 76,
        query: 'count order date by customer region order date monthly sort by customer region',
        results: {
            headline: {
                val: ['5', 'Jan1992-Aug1998', '13.3'],
                col: ['Customer Region', 'Monthly (Order Date)', 'Order Date'],
                sel: ['UNIQUE COUNT', '', 'AVG']
            },
            table: {
                col: ['Customer Region', 'Order Date', 'Total count Order Date'],
                sel: ['', 'MONTHLY', ''],
                val: ['africa', 'Jan 1992', '12']
            }
        }
    }, {
        count: 77,
        query: 'max quantity by customer city by customer region',
        results: {
            headline: {
                val: ['248', '5', '50'],
                col: ['Customer City', 'Customer Region', 'Quantity'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'MAX']
            },
            table: {
                col: ['Customer City', 'Customer Region', 'Quantity'],
                sel: ['', '', 'MAX'],
                val: ['algeria 0', 'africa', '46']
            }
        }
    }, {
        count: 78,
        query: 'max order date by customer city',
        results: {
            headline: {
                val: ['08/02/1998', '248'],
                col: ['Max Order Date', 'Customer City'],
                sel: ['', 'UNIQUE COUNT']
            },
            table: {
                col: ['Order Date', 'Customer City'],
                sel: ['NO_BUCKET', ''],
                val: ['07/20/1992', 'vietnam 1']
            }
        }
    }, {
        count: 79,
        query: 'min quantity by customer region by customer city customer region != asia',
        results: {
            headline: {
                val: ['4', '198', '1'],
                col: ['Customer Region', 'Customer City', 'Quantity'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'MIN']
            },
            table: {
                col: ['Customer Region', 'Customer City', 'Quantity'],
                sel: ['', '', 'MIN'],
                val: ['africa', 'algeria 0', '1']
            }
        }
    }, {
        count: 80,
        query: 'min commit date by supplier nation revenue < 100000',
        results: {
            headline: {
                val: ['04/10/1993', '6', '577K'],
                col: ['Min Commit Date', 'Supplier Nation', 'Revenue'],
                sel: ['', 'UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Commit Date', 'Supplier Nation', 'Revenue'],
                sel: ['NO_BUCKET', '', 'TOTAL'],
                val: ['04/10/1993', 'algeria', '92,453']
            }
        }
    }, {
        count: 81,
        query: 'standard deviation revenue by customer nation by order date yearly',
        results: {
            headline: {
                val: ['25', '1992-1998', '1.15M'],
                col: ['Customer Nation', 'Yearly (Order Date)', 'Revenue'],
                sel: ['UNIQUE COUNT', '', 'MIN']
            },
            table: {
                col: ['Customer Nation', 'Order Date', 'Revenue'],
                sel: ['', 'YEARLY', 'STD DEVIATION'],
                val: ['algeria', '1992', '2,094,383.61']
            }
        }
    }, {
        count: 82,
        query: 'standard deviation order total price by customer city customer city not contains "united" sort by standard deviation order total price descending',
        results: {
            headline: {
                val: ['228', '0'],
                col: ['Customer City', 'Order Total Price'],
                sel: ['UNIQUE COUNT', 'MIN']
            },
            table: {
                col: ['Customer City', 'Order Total Price'],
                sel: ['', 'STD DEVIATION'],
                val: ['russia 3', '13,462,422.57']
            }
        }
    }, {
        count: 83,
        query: 'unique count supplier suppkey by part name order date = march order date = 1993',
        disableWs: true,
        results: {
            headline: {
                val: ['48', '1'],
                col: ['Part Name', 'Supplier SuppKey'],
                sel: ['UNIQUE COUNT', 'AVG']
            },
            table: {
                col: ['Part Name', 'Unique count Supplier SuppKey'],
                sel: ['', ''],
                val: ['almond green', '1']
            }
        }
    }, {
        count: 84,
        query: 'unique count commit date by supplier suppkey by customer nation',
        results: {
            headline: {
                val: ['1.86K', '25', '1.05'],
                col: ['Supplier SuppKey', 'Customer Nation', 'Commit Date'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'AVG']
            },
            table: {
                col: ['Supplier SuppKey', 'Customer Nation', 'Unique count Commit Date'],
                sel: ['', '', ''],
                val: ['1', 'ethiopia', '1']
            }
        }
    }, {
        count: 85,
        query: 'variance discount by customer region for order date july sort by variance discount descending',
        results: {
            headline: {
                val: ['5', '8.55'],
                col: ['Customer Region', 'Discount'],
                sel: ['UNIQUE COUNT', 'MIN']
            },
            table: {
                col: ['Customer Region', 'Discount'],
                sel: ['', 'VARIANCE'],
                val: ['europe', '11.00']
            }
        }
    }, {
        count: 86,
        query: 'variance tax by customer custkey sort by variance tax descending',
        results: {
            headline: {
                val: ['1.18K', '0'],
                col: ['Customer CustKey', 'Tax'],
                sel: ['UNIQUE COUNT', 'MIN']
            },
            table: {
                col: ['Customer CustKey', 'Tax'],
                sel: ['', 'VARIANCE'],
                val: ['2408', '16.00']
            }
        }
    }, {
        count: 87,
        query: 'revenue between 35000 and 100000 by customer nation commit date between 03/01/1993 and 09/22/1995 commit date',
        results: {
            headline: {
                val: ['2', 'Apr1993-Nov1994', '189K'],
                col: ['Customer Nation', 'Monthly (Commit Date)', 'Revenue'],
                sel: ['UNIQUE COUNT', '', 'Total']
            },
            table: {
                col: ['Customer Nation', 'Commit Date', 'Revenue'],
                sel: ['', 'MONTHLY', 'TOTAL'],
                val: ['canada', 'Apr 1993', '92,453']
            }
        }
    }, {
        count: 88,
        query: 'color < orange part name color order total price > 7000000',
        results: {
            headline: {
                val: ['2.6K', '58', '65.1B'],
                col: ['Part Name', 'Color', 'Order Total Price'],
                sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'Total']
            },
            table: {
                col: ['Part Name', 'Color', 'Order Total Price'],
                sel: ['', '', 'TOTAL'],
                val: ['almond aquamarine', 'dark', '15,973,291']
            }
        }
    }, {
        count: 89,
        query: 'order date >08/22/1996 quantity part name order date weekly sort by quantity descending',
        results: {
            headline: {
                val: ['1.38K', '08/19/1996-07/27/1998', '39.4K'],
                col: ['Part Name', 'Weekly (Order Date)', 'Quantity'],
                sel: ['UNIQUE COUNT', '', 'Total']
            },
            table: {
                col: ['Part Name', 'Order Date', 'Quantity'],
                sel: ['', 'WEEKLY', 'TOTAL'],
                val: ['seashell white', '09/16/1996', '88']
            }
        }
    },
        {
            count: 89,
            query: 'order date >  08/22/1996 quantity part name order date weekly sort by quantity descending',
            results: {
                headline: {
                    val: ['1.38K', '08/19/1996-07/27/1998', '39.4K'],
                    col: ['Part Name', 'Weekly (Order Date)', 'Quantity'],
                    sel: ['UNIQUE COUNT', '', 'Total']
                },
                table: {
                    col: ['Part Name', 'Order Date', 'Quantity'],
                    sel: ['', 'WEEKLY', 'TOTAL'],
                    val: ['seashell white', '09/16/1996', '88']
                }
            }
        }, {
            count: 90,
            query: 'average quantity > 27 order total price customer name',
            results: {
                headline: {
                    val: ['492', '47.8B', '27.1'],
                    col: ['Customer Name', 'Order Total Price', 'Quantity'],
                    sel: ['UNIQUE COUNT', 'Total', 'MIN']
                },
                table: {
                    col: ['Customer Name', 'Order Total Price', 'Quantity'],
                    sel: ['', 'TOTAL', 'AVG'],
                    val: ['customer#000000092', '48,950,940', '37.33']
                }
            }
        }, {
            count: 91,
            query: 'color part name color order total price > 7000000',
            results: {
                headline: {
                    val: ['92', '3.45K', '93.8B'],
                    col: ['Color', 'Part Name', 'Order Total Price'],
                    sel: ['UNIQUE COUNT', 'UNIQUE COUNT', 'Total']
                },
                table: {
                    col: ['Color', 'Part Name', 'Order Total Price'],
                    sel: ['', '', 'TOTAL'],
                    val: ['almond', 'antique light', '8,197,416']
                }
            }
        }, {
            count: 92,
            query: 'color < orange part name color order total price > 7000000 order date > 05/12/1994 order date',
            results: {
                headline: {
                    val: ['1.75K', '58', 'May1994-Aug1998', '40.6B'],
                    col: ['Part Name', 'Color', 'Monthly (Order Date)', 'Order Total Price'],
                    sel: ['UNIQUE COUNT', 'UNIQUE COUNT', '', 'Total']
                },
                table: {
                    col: ['Part Name', 'Color', 'Order Date', 'Order Total Price'],
                    sel: ['', '', 'MONTHLY', 'TOTAL'],
                    val: ['almond aquamarine', 'dark', 'Sep 1995', '15,973,291']
                }
            }
        }, {
            count: 93,
            query: 'supplier city >= russia 3 commit date >= 07/13/1996 sort by commit date quarterly supplier city',
            results: {
                headline: {
                    val: ['Q31996-Q41998', '47'],
                    col: ['Quarterly (Commit Date)', 'Supplier City'],
                    sel: ['', 'UNIQUE COUNT']
                },
                table: {
                    col: ['Commit Date', 'Supplier City'],
                    sel: ['QUARTERLY', ''],
                    val: ['Q3 1996', 'russia 3']
                }
            }
        }, {
            count: 94,
            query: 'size >= 33 manufacturer size',
            results: {
                headline: {
                    val: ['5', '18'],
                    col: ['Manufacturer', 'Size'],
                    sel: ['UNIQUE COUNT', 'UNIQUE COUNT']
                },
                table: {
                    col: ['Manufacturer', 'Size'],
                    sel: ['', ''],
                    val: ['mfgr#1', '33']
                }
            }
        }, {
            count: 95,
            query: 'order date <=12/31/1995 revenue order date weekly sort by order date descending',
            results: {
                headline: {
                    val: ['12/30/1991-12/25/1995', '10.8B'],
                    col: ['Weekly (Order Date)', 'Revenue'],
                    sel: ['', 'Total']
                },
                table: {
                    col: ['Order Date', 'Revenue'],
                    sel: ['WEEKLY', 'TOTAL'],
                    val: ['12/25/1995', '83,960,915']
                }
            }
        }, {
            count: 96,
            query: 'discount supplier city <= france 0 supplier city tax sort by tax descending',
            results: {
                headline: {
                    val: ['71', '7.05K', '5.77K'],
                    col: ['Supplier City', 'Discount', 'Tax'],
                    sel: ['UNIQUE COUNT', 'Total', 'Total']
                },
                table: {
                    col: ['Supplier City', 'Discount', 'Tax'],
                    sel: ['', 'TOTAL', 'TOTAL'],
                    val: ['brazil 5', '227', '203']
                }
            }
        }, {
            count: 97,
            query: 'commit date !=april commit date !=1993 sort by commit date monthly extended price quantity',
            results: {
                headline: {
                    val: ['Feb1992-Oct1998', '14.6B', '98K'],
                    col: ['Monthly (Commit Date)', 'Extended Price', 'Quantity'],
                    sel: ['', 'Total', 'Total']
                },
                table: {
                    col: ['Commit Date', 'Extended Price', 'Quantity'],
                    sel: ['MONTHLY', 'TOTAL', 'TOTAL'],
                    val: ['Feb 1992', '44,203,520', '294']
                }
            }
        }, {
            count: 98,
            query: 'customer region !=america commit date monthly order total price sort by commit date descending',
            results: {
                headline: {
                    val: ['Feb1992-Oct1998', '76.3B'],
                    col: ['Monthly (Commit Date)', 'Order Total Price'],
                    sel: ['', 'Total']
                },
                table: {
                    col: ['Commit Date', 'Order Total Price'],
                    sel: ['MONTHLY', 'TOTAL'],
                    val: ['Oct 1998', '386,474,814']
                }
            }
        }]
};

module.exports = {
    DATASET_TPCH: DATASET_TPCH,
};
