'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

describe('Answer page general', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "customer region market segment revenue" query', function () {
        base.typeQueryAndWait('customer region market segment revenue').then(function () {
            base.takeScreenshot(
                "market-segment-revenue",
                "Query: customer region market segment revenue\n" +
                "Chart should load as follows:\n" +
                "    - bar graph\n" +
                "    - x-axis: market segment\n" +
                "    - y-axis: total revenue\n" +
                "    - legend: customer region"
            );
        });
    });

    it('should run "ship mode tax supplier region" query', function () {
        base.typeQueryAndWait('ship mode tax supplier region').then(function () {
            base.takeScreenshot(
                "ship-mode-supplier-region",
                "Query: ship mode tax supplier region\n" +
                "Chart should load as follows\n" +
                "    - Bar graph\n" +
                "    - X-axis: ship mode\n" +
                "    - Y-axis: total tax\n" +
                "    - Legend: supplier region"
            );
        });
    });

    it('should run "revenue discount tax customer nation" query', function () {
        base.typeQueryAndWait('revenue discount tax customer nation').then(function () {
            base.takeScreenshot(
                "revenue-discount-tax-customer-nation",
                "Query: revenue discount tax customer nation\n" +
                "Chart should load as follows\n" +
                "    - bubble chart\n" +
                "    - X-axis: customer nation\n" +
                "    - Y-axis: total discount\n" +
                "    - Size: total tax"
            );
        });
    });


    it('should run "extended price discount order total price quantity ship mode" query', function () {
        base.typeQueryAndWait('extended price discount order total price quantity ship mode').then(function () {
            base.takeScreenshot(
                "extended-price-discount",
                "Query: Extended price discount order total price quantity  ship mode\n" +
                "Chart should load as follows:\n" +
                "    - bar chart\n" +
                "    - x-axis: shipmode\n" +
                "    - y-axis: total extended price, total discount, total order price, total \n" +
                "    quantity (multiple y-axes)"
            );
        });
    });

    it('should run "quantity revenue tax commit date" query', function () {
        base.typeQueryAndWait('quantity revenue tax commit date').then(function () {
            base.takeScreenshot(
                "quantity-revenue-tax-commit-date",
                "Query: quantity revenue tax commit date\n" +
                "Chart should load as follows:\n" +
                "    - line graph\n" +
                "    - x-axis: commit date\n" +
                "    - y-axis: total quantity, total revenue, total tax (multiple y-axes)"
            );
        });
    });

    it('should run "ship mode customer nation revenue" query', function () {
        base.typeQueryAndWait('ship mode customer nation revenue').then(function () {
            base.takeScreenshot(
                "ship-mode-customer-nation-revenue",
                "Query: ship mode customer nation revenue\n" +
                "Chart should load as follows\n" +
                "    - Stacked chart\n" +
                "    - x-axis: ship mode\n" +
                "    - y-axis: total revenue\n" +
                "    - legend: customer nation"
            );
        });
    });

});

// --------------- COLUMN ------------------

describe('Answer page column charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "supplier city discount" query', function () {
        base.typeQueryAndWait('supplier city discount').then(function () {
            base.takeScreenshot(
                "supplier-city-discount",
                "Query: supplier city discount\n" +
                "x: supplier city\n" +
                "y: total discount\n"
            );
        });
    });

    it('should run "discount quantity commit date" query', function () {
        base.typeQueryAndWait('discount quantity commit date').then(function () {
            base.takeScreenshot(
                "discount-quantity-commit-date",
                "Query: discount quantity commit date\n" +
                "Defaults to line, switch to column\n" +
                "x: commit date\n" +
                "y: total discount, total quantity (unshared)\n"
            );
        });
    });

    it('should run "extended price revenue order priority" query', function () {
        base.typeQueryAndWait('extended price revenue order priority').then(function () {
            base.shareYAxis().then(function () {
                base.takeScreenshot(
                    "extended-price-revenue-order-priority-shared",
                    "Query: extended price revenue order priority\n" +
                    "x: order priority\n" +
                    "y: total extended price, total revenue (shared y-axis)\n"
                );
            });
        });
    });

    it('should run "extended price customer region market segment" query', function () {
        base.typeQueryAndWait('extended price customer region market segment').then(function () {
            base.takeScreenshot(
                "extended-price-customer-region-market-segment",
                "Query: extended price customer region market segment\n" +
                "x: market segment\n" +
                "y: total extended price\n" +
                "l: customer region\n"
            );
        });
    });

});

// -------------- STACKED COLUMN ---------------

describe('Answer page stacked column charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "order total price customer region container" query', function () {
        base.typeQueryAndWait('order total price customer region container').then(function () {
            base.takeScreenshot(
                "order-total-price-customer-region-container",
                "Query: order total price customer region container\n" +
                "Defaults to stacked chart\n" +
                "x: container\n" +
                "y: total order total price\n" +
                "l: customer region\n"
            );
        });
    });

    it('should run "extended price supplier region order date" query', function () {
        base.typeQueryAndWait('extended price supplier region order date').then(function () {
            base.selectChartType('Stacked Column').then(function () {
                base.takeScreenshot(
                    "extended-price-supplier-region-order-date-stacked",
                    "Query: extended price supplier region order date\n" +
                    "Defaults to line chart, switch to stacked\n" +
                    "x: order date\n" +
                    "y: total extended price\n" +
                    "l: supplier region\n"
                );
            });
        });
    });

});

// --------------- BAR --------------------------

describe('Answer page bar charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "discount customer nation" query', function () {
        base.typeQueryAndWait('discount customer nation').then(function () {
            base.selectChartType('Bar').then(function () {
                base.takeScreenshot(
                    "discount-customer-nation-bar",
                    "Query: discount customer nation\n" +
                    "Defaults to column, switch to bar\n" +
                    "x: customer name\n" +
                    "y: total discount\n"
                );
            });
        });
    });

    it('should run "discount customer nation revenue" query', function () {
        base.typeQueryAndWait('discount customer nation revenue').then(function () {
            base.selectChartType('Bar').then(function () {
                base.takeScreenshot(
                    "discount-customer-nation-revenue-unshared-bar",
                    "Query: discount customer nation revenue\n" +
                    "Defaults to column, switch to bar]\n" +
                    "x:  customer nation\n" +
                    "y: total discount, total revenue (unshared)\n"
                );
            });
        });
    });

    it('should run "discount customer nation revenue" query and share Y axis', function () {
        base.typeQueryAndWait('discount customer nation revenue').then(function () {
            base.selectChartType('Bar').then(function () {
                base.shareYAxis().then(function () {
                    base.takeScreenshot(
                        "discount-customer-nation-revenue-shared-bar",
                        "Query: discount customer nation revenue\n" +
                        "Defaults to column, switch to bar]\n" +
                        "x:  customer nation\n" +
                        "y: total discount, total revenue (shared)\n"
                    );
                });
            });
        });
    });

    it('should run "discount customer nation order priority" query', function () {
        base.typeQueryAndWait('discount customer nation order priority').then(function () {
            base.selectChartType('Bar').then(function () {
                base.takeScreenshot(
                    "discount-customer-nation-order-priority-bar",
                    "Query: discount customer nation order priority\n" +
                    "Defaults to stacked, switch to bar\n" +
                    "x: customer nation\n" +
                    "y: total discount\n" +
                    "l: order priority\n"
                );
            });
        });
    });

});

// ---------------------- LINE ----------------------

describe('Answer page line charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "discount customer city" query', function () {
        base.typeQueryAndWait('discount customer city').then(function () {
            base.selectChartType('Line').then(function () {
                base.takeScreenshot(
                    "discount-customer-city-line",
                    "Query: discount customer city\n" +
                    "Defaults to bar, switch to line\n" +
                    "x: customer city\n" +
                    "y: total discount\n"
                );
            });
        });
    });

    it('should run "discount customer city customer region" query', function () {
        base.typeQueryAndWait('discount customer city customer region').then(function () {
            base.selectChartType('Line').then(function () {
                base.takeScreenshot(
                    "discount-customer-city-customer-region-line",
                    "Query: discount customer city customer region\n" +
                    "Defaults to bar, switch to line\n" +
                    "x: customer city\n" +
                    "y: total discount\n" +
                    "l: customer region \n"
                );
            });
        });
    });

    it('should run "supplier city extended price order total price" query', function () {
        base.typeQueryAndWait('supplier city extended price order total price').then(function () {
            base.selectChartType('Line').then(function () {
                base.takeScreenshot(
                    "supplier-city-extended-price-order-total-price-line-unshared",
                    "Query: supplier city extended price order total price\n" +
                    "Defaults to scatter, switch to line\n" +
                    "x: supplier city\n" +
                    "y: total extended price, total order total price (unshared)\n"
                );
            });
        });
    });

    it('should run "supplier city extended price order total price" query and share Y axis', function () {
        base.typeQueryAndWait('supplier city extended price order total price').then(function () {
            base.selectChartType('Line').then(function () {
                base.shareYAxis().then(function () {
                    base.takeScreenshot(
                        "supplier-city-extended-price-order-total-price-line-shared",
                        "Query: supplier city extended price order total price\n" +
                        "Defaults to scatter, switch to line\n" +
                        "x: supplier city\n" +
                        "y: total extended price, total order total price (shared)\n"
                    );
                });
            });
        });
    });

});

// ----------------------- PIE ----------------------------

describe('Answer page pie charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "supplier nation supply cost" query', function () {
        base.typeQueryAndWait('supplier nation supply cost').then(function () {
            base.selectChartType('Pie').then(function () {
                base.takeScreenshot(
                    "supplier-nation-supply-cost-pie",
                    "supplier nation supply cost\n" +
                    "Defaults to bar, switch to pie\n"
                );
            });
        });
    });

    it('should run "supplier nation supply cost tax" query', function () {
        base.typeQueryAndWait('supplier nation supply cost tax').then(function () {
            base.selectChartType('Pie').then(function () {
                base.setYAxis(['Total Supply Cost', 'Total Tax']);
                base.takeScreenshot(
                    "supplier-nation-supply-cost-tax-pie",
                    "supplier nation supply cost\n" +
                    "Defaults to bar, switch to pie\n"
                );
            });
        });
    });

});

// ---------------------- AREA -------------------------------

describe('Answer page area charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "customer nation extended price" query', function () {
        base.typeQueryAndWait('customer nation extended price').then(function () {
            base.selectChartType('Area').then(function () {
                base.takeScreenshot(
                    "customer-nation-extended-price-area",
                    "Query: customer nation extended price\n" +
                    "Defaults to bar, switch to area\n" +
                    "x: customer nation\n" +
                    "y: extended price\n"
                );
            });
        });
    });

    it('should run "extended price commit date" query', function () {
        base.typeQueryAndWait('extended price commit date').then(function () {
            base.selectChartType('Area').then(function () {
                base.takeScreenshot(
                    "extended-price-commit-date-area",
                    "Query:extended price commit date\n" +
                    "Defaults to bar, switch to area\n" +
                    "x: commit date\n" +
                    "y: extended price\n"
                );
            });
        });
    });

});

// ---------------------- STACKED AREA ------------------------

describe('Answer page stacked area charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "extended price supplier region manufacturer" query', function () {
        base.typeQueryAndWait('extended price supplier region manufacturer').then(function () {
            base.selectChartType('Stacked Area').then(function () {
                base.takeScreenshot(
                    "extended-price-supplier-region-manufacturer-stacked-area",
                    "Query: extended price supplier region manufacturer\n" +
                    "Defaults to bar, switch to stacked area\n" +
                    "x: manufacturer\n" +
                    "y: total extended price\n" +
                    "l: supplier region\n"
                );
            });
        });
    });

    it('should run "extended price supplier region order date" query', function () {
        base.typeQueryAndWait('extended price supplier region order date').then(function () {
            base.selectChartType('Stacked Area').then(function () {
                base.takeScreenshot(
                    "extended-price-supplier-region-order-date-stacked-area",
                    "Query: extended price supplier region order date\n" +
                    "Defaults to line, switch to stacked area\n" +
                    "x: order date\n" +
                    "y: total extended price\n" +
                    "l: supplier region\n"
                );
            });
        });
    });

});

// --------------------- SCATTER ------------------------------

describe('Answer page scatter charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "order total price order date discount" query', function () {
        base.typeQueryAndWait('order total price order date discount').then(function () {
            base.selectChartType('Scatter').then(function () {
                base.setLegend([]);
                base.setXAxis(['Order Date']);
                base.setYAxis(['Total Order Total Price', 'Total Discount']);
                base.takeScreenshot(
                    "order-total-price-order-date-discount-scatter",
                    "Query: order total price order date discount\n" +
                    "Defaults to line, switch to scatter\n" +
                    "Chang config to following:\n" +
                    "x: order date\n" +
                    "y: total order total price, total discount\n"
                );
            });
        });
    });

    it('should run "order total price customer region container extended price" query', function () {
        base.typeQueryAndWait('order total price customer region container extended price').then(function () {
            base.takeScreenshot(
                "order-total-price-customer-region-container-extended-price",
                "Query: order total price customer region container extended price\n" +
                "x: total order total price\n" +
                "y: total extended price\n" +
                "l: customer region\n"
            );
        });
    });

    it('should run "order total price customer region quantity revenue" query and share Y axis', function () {
        base.typeQueryAndWait('order total price customer region quantity revenue').then(function () {
            base.selectChartType('Scatter').then(function () {
                base.setLegend([]);
                base.setXAxis(['Customer Region']);
                base.setYAxis(['Total Order Total Price', 'Total Quantity', 'Total Revenue']);
                base.takeScreenshot(
                    "order-total-price-customer-region-quantity-revenue-scatter-shared",
                    "Query: order total price customer region quantity revenue\n" +
                    "Defaults to bar, switch to scatter\n" +
                    "Change config to following:\n" +
                    "x: customer region\n" +
                    "y: total order total price, total quantity, total revenue (shared)\n"
                );
            });
        });
    });

    it('should run "order total price customer region quantity revenue" query and share Y axis', function () {
        base.typeQueryAndWait('order total price customer region quantity revenue').then(function () {
            base.selectChartType('Scatter').then(function () {
                base.setLegend([]);
                base.setXAxis(['Customer Region']);
                base.setYAxis(['Total Order Total Price', 'Total Quantity', 'Total Revenue']);
                base.shareYAxis();
                base.takeScreenshot(
                    "order-total-price-customer-region-quantity-revenue-scatter-shared",
                    "Query: order total price customer region quantity revenue\n" +
                    "Defaults to bar, switch to scatter\n" +
                    "Change config to following:\n" +
                    "x: customer region\n" +
                    "y: total order total price, total quantity, total revenue (shared)\n"
                );
            });
        });
    });

});

// ------------------------ BUBBLE -------------------------------

describe('Answer page bubble charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "quantity revenue customer city" query', function () {
        base.typeQueryAndWait('quantity revenue customer city').then(function () {
            base.selectChartType('Bubble').then(function () {
                base.takeScreenshot(
                    "quantity-revenue-customer-city-bubble",
                    "Query: quantity revenue customer city\n" +
                    "Defaults to scatter, switch to bubble\n" +
                    "x: customer city\n" +
                    "y: total revenue\n" +
                    "s: total quantity\n"
                );
            });
        });
    });

    it('should run "quantity revenue customer city market segment" query', function () {
        base.typeQueryAndWait('quantity revenue customer city market segment').then(function () {
            base.selectChartType('Bubble').then(function () {
                base.takeScreenshot(
                    "quantity-revenue-customer-city-market-segment-bubble",
                    "Query: quantity revenue customer city market segment\n" +
                    "Defaults to scatter, switch to bubble\n" +
                    "x: customer city\n" +
                    "y:total revenue\n" +
                    "l: market segment\n" +
                    "s: total quantity\n"
                );
            });
        });
    });

    it('should run "quantity revenue customer city market segment extended price" query', function () {
        base.typeQueryAndWait('quantity revenue customer city market segment extended price').then(function () {
            base.setLegend([]);
            base.setXAxis(['Customer City']);
            base.setYAxis(['Total Quantity', 'Total Revenue']);
            base.takeScreenshot(
                "quantity-revenue-customer-city-market-segment-extended-price-unshared",
                "Query: quantity revenue customer city market segment extended price\n" +
                "Change config to following:\n" +
                "x: customer city\n" +
                "y: total quantity, total revenue (unshared)\n" +
                "s: total extended price\n"
            );
        });
    });

    it('should run "quantity revenue customer city market segment extended price" query and share Y axis', function () {
        base.typeQueryAndWait('quantity revenue customer city market segment extended price').then(function () {
            base.setLegend([]);
            base.setXAxis(['Customer City']);
            base.setYAxis(['Total Quantity', 'Total Revenue']);
            base.shareYAxis();
            base.takeScreenshot(
                "quantity-revenue-customer-city-market-segment-extended-price-shared",
                "Query: quantity revenue customer city market segment extended price\n" +
                "Change config to following:\n" +
                "x: customer city\n" +
                "y: total quantity, total revenue (shared)\n" +
                "s: total extended price\n"
            );
        });
    });

});

// ---------------------- PARETO ------------------------------------

describe('Answer page paretto charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "customer city extended price" query', function () {
        base.typeQueryAndWait('customer city extended price').then(function () {
            base.selectChartType('Pareto').then(function () {
                base.takeScreenshot(
                    "customer-city-extended-price-pareto",
                    "Query: customer city extended price\n" +
                    "Defaults to bar, switch to pareto\n" +
                    "x: customer city\n" +
                    "y: total extended price\n"
                );
            });
        });
    });

    it('should run "extended price commit date" query', function () {
        base.typeQueryAndWait('extended price commit date').then(function () {
            base.selectChartType('Pareto').then(function () {
                base.takeScreenshot(
                    "extended-price-commit-date-pareto",
                    "Query: extended price commit date\n" +
                    "Defaults to line, switch to pareto\n" +
                    "x: commit date\n" +
                    "y: total extended price\n"
                );
            });
        });
    });

});

// --------------------- WATERFALL --------------------------------

describe('Answer page waterfall charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "order total price supplier region ship mode" query', function () {
        base.typeQueryAndWait('order total price supplier region ship mode').then(function () {
            base.selectChartType('Waterfall').then(function () {
                base.takeScreenshot(
                    "order-total-price-supplier-region-ship-mode-waterfall",
                    "Query: order total price supplier region ship mode\n" +
                    "Defaults to bar, switch to waterfall\n" +
                    "x: ship mode\n" +
                    "y: total order total price\n" +
                    "l: supplier region\n"
                );
            });
        });
    });

    it('should run "order total price supplier region order date" query', function () {
        base.typeQueryAndWait('order total price supplier region order date').then(function () {
            base.selectChartType('Waterfall').then(function () {
                base.takeScreenshot(
                    "order-total-price-supplier-region-order-date-waterfall",
                    "Query: order total price supplier region order date\n" +
                    "Defaults to line, switch to waterfall \n" +
                    "x: order date\n" +
                    "y: total order toal price\n" +
                    "l: supplier region\n"
                );
            });
        });
    });

    it('should run "discount quantity customer nation" query', function () {
        base.typeQueryAndWait('discount quantity customer nation').then(function () {
            base.selectChartType('Waterfall').then(function () {
                base.takeScreenshot(
                    "discount-quantity-customer-nation-waterfall-unshared",
                    "Query: discount quantity customer nation\n" +
                    "x: customer nation\n" +
                    "y: total discount, total quantity (unshared)\n"
                );
            });
        });
    });

});

// ---------------------- TREEMAP ------------------------------------

describe('Answer page treemap charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "discount quantity customer nation" query', function () {
        base.typeQueryAndWait('discount quantity customer nation').then(function () {
            base.selectChartType('Treemap').then(function () {
                base.takeScreenshot(
                    "discount-quantity-customer-nation-treemap",
                    "Query: discount quantity customer nation\n" +
                    "Defaults to bar, switch to treemap\n" +
                    "category: customer nation\n" +
                    "color: total quantity\n" +
                    "size: total discount\n"
                );
            });
        });
    });

    it('should run "commit date yearly discount quantity" query', function () {
        base.typeQueryAndWait('commit date yearly discount quantity').then(function () {
            base.selectChartType('Treemap').then(function () {
                base.takeScreenshot(
                    "commit-date-yearly-discount-quantity-treemap",
                    "Query: commit date yearly discount quantity\n" +
                    "category: commit date yearly\n" +
                    "color: total quantity\n" +
                    "size: total discount\n"
                );
            });
        });
    });

});

// -------------------- HEATMAP ------------------------------------

describe('Answer page heatmap charts', function () {

    beforeAll(function () {
        base.goHome();
        base.goToAnswer();
        base.selectAllTables();
    });

    beforeEach(function () {
        base.goHome();
        base.goToAnswer();
    });

    it('should run "container revenue market segment" query', function () {
        base.typeQueryAndWait('container revenue market segment').then(function () {
            base.selectChartType('Heatmap').then(function () {
                base.takeScreenshot(
                    "container-revenue-market-segment-heatmap",
                    "Query: container revenue market segment\n" +
                    "Defaults to stacked, switch to heatmap\n" +
                    "x: market segment\n" +
                    "y: container\n" +
                    "v: total revenue\n"
                );
            });
        });
    });

    it('should run "commit date yearly ship mode quantity" query', function () {
        base.typeQueryAndWait('commit date yearly ship mode quantity').then(function () {
            base.selectChartType('Heatmap').then(function () {
                base.takeScreenshot(
                    "commit-date-yearly-ship-mode-quantity-heatmap",
                    "Query: commit date yearly  ship mode quantity\n" +
                    "Defaults to line, switch to heatma\n" +
                    "x: commit date yearl\n" +
                    "y: ship mod\n" +
                    "v: total quantit\n"
                );
            });
        });
    });
});
