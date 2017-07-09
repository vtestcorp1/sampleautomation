/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for chart type specification
 */

'use strict';

describe('Chart type specification spec', function () {
    var dataDisabledChartMsg, chartTypeSpecificationService, chartUtilService = {},
        dateUtil, GeoConfig, jsonConstants;

    var basePath = getBasePath(document.currentScript.src);

    function initSuite() {
        beforeEach(function (done) {
            module('blink.app');
            ngRequireMock({
                'chartUtilService': chartUtilService
            }).then(
                freshImport(basePath, './chart-type-specification-service')
                    .then(function(module) {
                        inject(function ($injector) {
                            dataDisabledChartMsg = $injector.get('strings');
                            dateUtil = $injector.get('dateUtil');
                            GeoConfig = $injector.get('GeoConfig');
                            jsonConstants = $injector.get('jsonConstants');
                        });
                        chartTypeSpecificationService = module;
                        chartTypeSpecificationService.init();
                        done();
                    })
            )
        });
    }

    describe('Compute Best Axis config', function () {
        function verifyConfig (config, xAxisColumnIds, yAxisColumnIds, legendColumnIds, radialColumnId) {
            expect(config.xAxisColumns.length).toBe(xAxisColumnIds.length);
            angular.forEach(xAxisColumnIds, function (id, index) {
                expect(id).toBe(config.xAxisColumns[index].getSageOutputColumnId());
            });
            angular.forEach(yAxisColumnIds, function (id, index) {
                expect(id).toBe(config.yAxisColumns[index].getSageOutputColumnId());
            });
            angular.forEach(legendColumnIds, function (id, index) {
                expect(id).toBe(config.legendColumns[index].getSageOutputColumnId());
            });
            if (radialColumnId) {
                expect(radialColumnId).toBe(config.radialColumn.getSageOutputColumnId());
            }
        }

        var BaseChartModel = {
            getSortedAttributeColumns: function () {
                return this.getAttributeColumns();
            },
            getAdditiveNumericAttributeColumns: function () {
                return [];
            }
        };

        // TODO(Jasmeet): abstract out common code in all these chart models
        function TC1ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column1];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [column2];
                },
                getCardinalityData: function () {
                    return {};
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC2ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column1];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [column2, column3];
                },
                getCardinalityData: function () {
                    return {
                        id2: 10,
                        id3: 15
                    };
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC3ChartModel () {
            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [];
                },
                getCardinalityData: function () {
                    return {};
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC4ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column1];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [column2, column3];
                },
                getCardinalityData: function () {
                    return {
                        id2: 15,
                        id3: -1
                    };
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC5ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column1];
                },
                getTimeSeriesColumns: function () {
                    return [column2];
                },
                getAttributeColumns: function () {
                    return [];
                },
                getCardinalityData: function () {
                    return {};
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC6ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column1];
                },
                getTimeSeriesColumns: function () {
                    return [column2];
                },
                getAttributeColumns: function () {
                    return [column3];
                },
                getCardinalityData: function () {
                    return {
                        id3: 10
                    };
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC7ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column1];
                },
                getTimeSeriesColumns: function () {
                    return [column2, column3];
                },
                getAttributeColumns: function () {
                    return [];
                },
                getCardinalityData: function () {
                    return {
                    };
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC8ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column1, column2];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [column3];
                },
                getCardinalityData: function () {
                    return {
                        id3: 10
                    };
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC9ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    }
                },
                column4 = {
                    getSageOutputColumnId: function () {
                        return 'id4';
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column1, column2];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [column3, column4];
                },
                getCardinalityData: function () {
                    return {
                        id3: 15,
                        id4: 10
                    };
                },
                getMinYValue: function () {
                    return 0;
                },
                getSortedAttributeColumns: function () {
                    return [column4, column3];
                }
            });

            return chartModel;
        }

        function TC10ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [column1, column2];
                },
                getCardinalityData: function () {
                    return {
                        id1: 5,
                        id2: 10
                    };
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC11ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LONGITUDE});
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    },
                    getGeoConfig: function () {
                        return void 0;
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column1, column2];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [column3];
                },
                getCardinalityData: function () {
                    return {
                        id3: 10
                    };
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC12ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LONGITUDE});
                    },
                    isAttribute: function () {
                        return true;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column1, column2];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [];
                },
                getCardinalityData: function () {
                    return {};
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC13ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LONGITUDE});
                    },
                    isAttribute: function () {
                        return true;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    },
                    isAttribute: function () {
                        return true;
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column3];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [column1, column2];
                },
                getCardinalityData: function () {
                    return {
                        id1: 150,
                        id2: 300
                    };
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC14ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowthBy: function () {
                        return true;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LONGITUDE});
                    },
                    isAttribute: function () {
                        return true;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isGrowth: function () {
                        return true;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    },
                    isAttribute: function () {
                        return false;
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    }
                },
                column4 = {
                    getSageOutputColumnId: function () {
                        return 'id4';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column2, column3];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [column1];
                },
                getCardinalityData: function () {
                    return {
                        id1: 150,
                        id2: 300
                    };
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        function TC15ChartModel () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isGrowthBy: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LONGITUDE});
                    },
                    isAttribute: function () {
                        return true;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    },
                    isAttribute: function () {
                        return false;
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    }
                },
                column4 = {
                    getSageOutputColumnId: function () {
                        return 'id4';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    }
                },
                column5 = {
                    getSageOutputColumnId: function () {
                        return 'id5';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    }
                },
                column6 = {
                    getSageOutputColumnId: function () {
                        return 'id6';
                    },
                    isGrowth: function () {
                        return false;
                    },
                    getGeoConfig: function () {
                        return new GeoConfig({type: jsonConstants.geoConfigType.LATITUDE});
                    }
                };

            var chartModel = angular.extend(angular.copy(BaseChartModel), {
                getMeasureColumns: function () {
                    return [column2, column3, column4, column5, column6];
                },
                getTimeSeriesColumns: function () {
                    return [];
                },
                getAttributeColumns: function () {
                    return [column1];
                },
                getCardinalityData: function () {
                    return {
                        id1: 150,
                        id2: 300
                    };
                },
                getMinYValue: function () {
                    return 0;
                }
            });

            return chartModel;
        }

        initSuite();

        it('Verify unimplemented definitions', function () {
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                'Gibberish',
                {}
            );
            expect(config).toBeUndefined();
        });

        it('Negative case with no column', function () {
            var chartModel = TC3ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);


            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);
        });

        it('Chart model with one attribute and one measure', function () {
            var chartModel = TC1ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);
        });

        it('Chart model with one timeseries and one measure', function () {
            var chartModel = TC5ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.SANKEY_CHART;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);
        });

        it('Chart model with one timeseries and one measure and one attribute', function () {
            var chartModel = TC6ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], ['id3'], null);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], ['id3'], null);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], ['id3'], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], ['id3'], null);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], ['id3'], null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], ['id3'], null);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], ['id3'], null);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id3'], [], 'id1');

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], ['id3'], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.SANKEY_CHART;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);
        });

        it('Chart model with 2 attributes and one measure', function () {
            var chartModel = TC2ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id3'], [], 'id1');

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.SANKEY_CHART;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2', 'id3'], ['id1'], [], null);
        });

        it('Chart model with 2 attributes with one with -ve cardinality and one measure', function () {
            var chartModel = TC4ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id3'], [], 'id1');

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id2'], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);
        });

        it('Chart model with 2 timeseries and one measure', function () {
            var chartModel = TC7ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], ['id3'], null);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id3'], [], 'id1');

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id1'], ['id3'], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);
        });

        it('Chart model with 1 attribute and 2 measure', function () {
            var chartModel = TC8ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], 'id2');

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id1'], ['id2'], ['id3'], null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);


            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id2'], [], 'id1');

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);
        });

        it('Chart model with 2 attributes and 2 measures', function () {
            var chartModel = TC9ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], 'id2');

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id4'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id4'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id4'], ['id1'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id1'], ['id2'], ['id4'], null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id4'], null);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id4'], ['id3'], [], 'id1');


            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id2'], [], 'id1');

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1'], ['id4'], null);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id3'], ['id1', 'id2'], [], null);
        });

        it('No chart for chart model with 2 non additive measures', function () {
            var chartModel = TC10ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id1'], ['id2'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);
        });

        it('for SANKEY CHART, no chart when no measure columns and less than 2 attributes', function() {
            // one attribute, one measure
            var chartModel = TC1ChartModel();
            var chartType = chartTypeSpecificationService.chartTypes.SANKEY_CHART;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);

            // no attribute, no measure
            chartModel = TC3ChartModel();
            chartType = chartTypeSpecificationService.chartTypes.SANKEY_CHART;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                    chartType,
                    chartModel
                );
            expect(config).toBe(null);
        });

        it('SCAL-11183: Geo Bubble should not return config with undefined columns', function () {
            var chartModel = TC11ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.GEO_BUBBLE;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            expect(config).toBe(null);
        });

        it('SCAL-11757: should allow pie chart in measure by measure scenario', function () {
            var chartModel = TC12ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.PIE;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id1'], ['id2'], [], null);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id1'], ['id2'], [], null);
        });

        it('SCAL-13425: should allow stacked column even with high cardinality', function () {
            var chartModel = TC13ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id2'], ['id3'], ['id1'], null);
        });

        it('should show growth column on line in line column', function () {
            var chartModel = TC14ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id1'], ['id3', 'id2'], [], null);
        });

        it('should show one 4 measure on y for line column chart', function () {
            var chartModel = TC15ChartModel();

            var chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            var config = chartTypeSpecificationService.computeBestChartAxisConfig(
                chartType,
                chartModel
            );
            verifyConfig(config, ['id1'], ['id2', 'id3', 'id4', 'id5'], [], null);
        });
    });

    describe('Validate Axis config', function () {
        function TC1AxisConfig () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isEffectivelyNumeric: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isEffectivelyNumeric: function () {
                        return true;
                    },
                    isGrowth: function () {
                        return false;
                    }
                };

            var axisConfig = {
                xAxisColumns: [column1],
                yAxisColumns: [column2],
                legendColumns: [],
                redialColumn: null
            };

            return axisConfig;
        }

        function TC2AxisConfig () {
            return {};
        }

        function TC3AxisConfig () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isEffectivelyNumeric: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isEffectivelyNumeric: function () {
                        return true;
                    },
                    isGrowth: function () {
                        return false;
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    },
                    isEffectivelyNonNumeric: function () {
                        return false;
                    }
                };

            var axisConfig = {
                xAxisColumns: [column1],
                yAxisColumns: [column2],
                legendColumns: [],
                radialColumn: column3
            };

            return axisConfig;
        }

        function TC4AxisConfig () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isEffectivelyNumeric: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isEffectivelyNumeric: function () {
                        return false;
                    },
                    isGrowth: function () {
                        return true;
                    }
                };

            var axisConfig = {
                xAxisColumns: [column1],
                yAxisColumns: [column2],
                legendColumns: [],
                redialColumn: null
            };

            return axisConfig;
        }

        function TC5AxisConfig () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isEffectivelyNumeric: function () {
                        return false;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isEffectivelyNumeric: function () {
                        return true;
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    },
                    isEffectivelyNumeric: function () {
                        return true;
                    }
                },
                column4 = {
                    getSageOutputColumnId: function () {
                        return 'id4';
                    },
                    isEffectivelyNumeric: function () {
                        return true;
                    }
                };

            var axisConfig = {
                xAxisColumns: [column1],
                yAxisColumns: [column2, column3, column4],
                legendColumns: [],
                redialColumn: null
            };

            return axisConfig;
        }

        function TC6AxisConfig () {
            var column1 = {
                    getSageOutputColumnId: function () {
                        return 'id1';
                    },
                    isEffectivelyNumeric: function () {
                        return true;
                    }
                },
                column2 = {
                    getSageOutputColumnId: function () {
                        return 'id2';
                    },
                    isEffectivelyNumeric: function () {
                        return true;
                    }
                },
                column3 = {
                    getSageOutputColumnId: function () {
                        return 'id3';
                    },
                    isEffectivelyNumeric: function () {
                        return true;
                    }
                },
                column4 = {
                    getSageOutputColumnId: function () {
                        return 'id4';
                    },
                    isEffectivelyNumeric: function () {
                        return true;
                    }
                };

            var axisConfig = {
                xAxisColumns: [column1],
                yAxisColumns: [column2, column3, column4],
                legendColumns: [],
                redialColumn: null
            };

            return axisConfig;
        }

        initSuite();

        it('Verify unimplemented definitions', function () {
            var validation = chartTypeSpecificationService.validateAxisConfig(
                'Gibberish',
                {}
            );
            expect(validation).toBeUndefined();
        });

        it('Chart with attribute on x and measure on y', function () {
            var axisConfig = TC1AxisConfig();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);
        });

        it('Chart with attribute on x and measure on y and radial column', function () {
            var axisConfig = TC3AxisConfig();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);


            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);
        });

        it('Chart with undefined axis columns', function () {
            var axisConfig = TC2AxisConfig();

            var chartType = chartTypeSpecificationService.chartTypes.AREA;
            var validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.BAR;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.BUBBLE;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.LINE;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);


            chartType = chartTypeSpecificationService.chartTypes.PARETO;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.PIE;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.SPIDER_WEB;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_COLUMN;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.TREEMAP;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.HEATMAP;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.WATERFALL;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.STACKED_AREA;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);
        });

        it('SCAL-12320 Chart with attribute on x and growth measure on y', function () {
            var axisConfig = TC4AxisConfig();

            var chartType = chartTypeSpecificationService.chartTypes.PIE;
            var validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);

            chartType = chartTypeSpecificationService.chartTypes.FUNNEL;
            validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);
        });

        it('SCAL-12259 Error when charting numeric attribute', function () {
            var axisConfig = TC4AxisConfig();

            var chartType = chartTypeSpecificationService.chartTypes.SCATTER;
            var validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);
        });

        it('line column chart should allow multiple y axis columns', function () {
            var axisConfig = TC5AxisConfig();

            var chartType = chartTypeSpecificationService.chartTypes.LINE_COLUMN;
            var validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(true);
        });

        it('SCAL-16694 should disallow selecting numeric columns on xAxis for Pivot', function () {
            var axisConfig = TC6AxisConfig();

            var chartType = chartTypeSpecificationService.chartTypes.PIVOT_TABLE;
            var validation = chartTypeSpecificationService.validateAxisConfig(
                chartType,
                axisConfig
            );
            expect(validation).toBe(false);
        });
    });

    describe('configOptions', function() {

        initSuite();

        it('Always Returns an Object', function () {
            var opts = chartTypeSpecificationService.configOptions();
            expect(opts instanceof Object).toBeTruthy();

            opts = chartTypeSpecificationService.configOptions('FOO', {});
            expect(opts instanceof Object).toBeTruthy();

            opts = chartTypeSpecificationService.configOptions('BAR', {});
            expect(opts instanceof Object).toBeTruthy();

            var column = {
                getName: function() {
                    return 'foo';
                }
            };

            var chartModel = {
                getYAxisColumns: function () {
                    return [column];
                }
            };

            opts = chartTypeSpecificationService.configOptions('TREEMAP', chartModel);
            expect(opts instanceof Object).toBeTruthy();
        });

        it('for native legend charts sets legend.enabled according to the size of container', function() {
            var column = {
                getName: function() {
                    return 'foo';
                },
                isEffectivelyPercent: jasmine.createSpy().and.returnValue(false)
            };

            var chartModel = {
                getYAxisColumns: function () {
                    return [column];
                },
                isPinboardViz: jasmine.createSpy().and.returnValue(true),
                getRadialColumn: jasmine.createSpy().and.returnValue(column),
                getLabelForNumericColumn: jasmine.createSpy().and.returnValue('')
            };
            ['TREEMAP', 'HEATMAP'].forEach(function(chartType) {
                chartUtilService.isChartBigEnoughToShowLegend = jasmine.createSpy().and.returnValue(true);
                var opts = chartTypeSpecificationService.configOptions(chartType, chartModel, {});
                expect(opts.highcharts.legend.enabled).toEqual(true);

                chartUtilService.isChartBigEnoughToShowLegend = jasmine.createSpy().and.returnValue(false);
                opts = chartTypeSpecificationService.configOptions(chartType, chartModel, {});
                expect(opts.highcharts.legend.enabled).toEqual(false);

                opts = chartTypeSpecificationService.configOptions(chartType, chartModel);
                expect(opts.highcharts.legend.enabled).toEqual(false);
            });

        });

        it('For LINE type charts sets the custom incompleteColor and Thresholds', function () {
            dateUtil.getTimeBucketStart = jasmine.createSpy().and.returnValue(new Date('11/01/2015').getTime());
            var chartTypes = ['LINE', 'AREA'];
            chartTypes.forEach(function(chartType) {
                var opts =  chartTypeSpecificationService.configOptions(chartType, {}, {});
                expect(typeof opts.incompleteZone.getIncompleteColor === 'function').toBeTruthy();
                var previousMonth = moment(dateUtil.getTimeBucketStart()).subtract(1, 'M').valueOf();
                expect(opts.incompleteZone.getIncompleteThreshold('M')).toEqual(previousMonth);
            });

        });

        it('should return false for incompatible providers', function(){
            expect(chartTypeSpecificationService
                .areProvidersEqual('LINE', 'AREA')).toBe(true);
            expect(chartTypeSpecificationService
                .areProvidersEqual('LINE', 'SANKEY_CHART')).toBe(false);
        })
    });

    describe('verify data', function(){
        initSuite();

        function getMockChartModel(chartType, series, data, yAxisColumns) {
            return {
                hasNoData: function() { return false; },
                getChartType: function () {
                    return chartType;
                },
                getSeries: function () {
                    return series;
                },
                getYAxisColumns: function (){
                    return yAxisColumns;
                },
                getData: function() {
                    return data;
                },
                getDefaultQueryData: function() {
                    return (data && data[0] && data[0].data) || [];
                }
            };
        }

        it('sankey chart should return validation error if one serie has more > 100 values', function(){

            var mockChartModel = getMockChartModel(chartTypeSpecificationService.chartTypes.LINE, [{
                data: [{x: 0, y: 1}, {x: 1, y: 1}]
            }]);
            mockChartModel.getDataArray = function() {
                return [
                    {
                        info: {
                            totalRowCount: 0
                        }
                    }, {
                        info: {
                            totlaRowCount: 235
                        }
                    }
                ]
            };

            expect(chartTypeSpecificationService.getChartDataValidationError(mockChartModel)).toBe(null);
        });

        it('should return validation error for types that don\'t support duplicate x values in one series', function(){
            var mockChartModel;

            mockChartModel = getMockChartModel(chartTypeSpecificationService.chartTypes.LINE, [{
                data: [{x: 0, y: 1}, {x: 1, y: 1}]
            }]);
            expect(chartTypeSpecificationService.getChartDataValidationError(mockChartModel)).toBe(null);

            mockChartModel = getMockChartModel(chartTypeSpecificationService.chartTypes.LINE, [{
                data: [{x: 1, y: 1}, {x: 1, y: 1}]
            }]);
            expect(chartTypeSpecificationService.getChartDataValidationError(mockChartModel)).toBeTruthy();
        });

        it('should return validation error for types that don\'t support duplicate x values across all data',
            function(){
                var mockChartModel;
                var hasXDuplicate = true;

                chartUtilService.checkForXDuplicateAcrossAllSeries = function() {
                    return hasXDuplicate;
                };

                mockChartModel = getMockChartModel(chartTypeSpecificationService.chartTypes.LINE, [{
                    data: [{x: 1, y: 1}]
                }, {
                    data: [{x: 1, y: 1}]
                }]);
                expect(chartTypeSpecificationService.getChartDataValidationError(mockChartModel)).toBe(null);

                mockChartModel = getMockChartModel(chartTypeSpecificationService.chartTypes.GEO_AREA, [{
                    data: [{x: 1, y: 1}]
                }, {
                    data: [{x: 1, y: 1}]
                }]);
                expect(chartTypeSpecificationService.getChartDataValidationError(mockChartModel)).toBeTruthy();

                hasXDuplicate = false;
                mockChartModel = getMockChartModel(chartTypeSpecificationService.chartTypes.GEO_AREA, [{
                    data: [{x: 1, y: 1}]
                }, {
                    data: [{x: 12, y: 1}]
                }]);
                expect(chartTypeSpecificationService.getChartDataValidationError(mockChartModel)).toBe(null);
            }
        );

        it('should return chart not supported for negative values for pie chart SCAL-10524', function(){
            var mockChartModel = getMockChartModel(
                chartTypeSpecificationService.chartTypes.PIE,
                [{data: [{x: 0, y: 1}, {x: 1, y: 10}]}],
                [{data: [[0, 1], [1, 10]]}],
                [{
                    getDataRowIndex: function () {
                        return 1;
                    }
                }]
            );

            expect(chartTypeSpecificationService.getChartDataValidationError(mockChartModel)).toBe(null);

            mockChartModel = getMockChartModel(
                chartTypeSpecificationService.chartTypes.PIE,
                [{data: [{x: 0, y: 1}, {x: 1, y: -10}]}],
                [{data: [[0, 1], [1, -10]]}],
                [{
                    getDataRowIndex: function () {
                        return 1;
                    }
                }]
            );

            expect(chartTypeSpecificationService.getChartDataValidationError(mockChartModel))
                .toBe(dataDisabledChartMsg.dataDisabledChartExplanation.NON_NEGATIVE_VALUES_NEEDED);

            mockChartModel = getMockChartModel(
                chartTypeSpecificationService.chartTypes.FUNNEL,
                [{data: [{x: 0, y: 1}, {x: 1, y: 10}]}],
                [{data: [[0, 1], [1, 10]]}],
                [{
                    getDataRowIndex: function () {
                        return 1;
                    }
                }]
            );

            expect(chartTypeSpecificationService.getChartDataValidationError(mockChartModel)).toBe(null);

            mockChartModel = getMockChartModel(
                chartTypeSpecificationService.chartTypes.FUNNEL,
                [{data: [{x: 0, y: 1}, {x: 1, y: -10}]}],
                [{data: [[0, 1], [1, -10]]}],
                [{
                    getDataRowIndex: function () {
                        return 1;
                    }
                }]
            );

            expect(chartTypeSpecificationService.getChartDataValidationError(mockChartModel))
                .toBe(dataDisabledChartMsg.dataDisabledChartExplanation.NON_NEGATIVE_VALUES_NEEDED);
        });
    });
});
