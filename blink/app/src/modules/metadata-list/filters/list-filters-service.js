/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Factory to provide filter lists
 *
 *
 */

'use strict';

blink.app.factory('listFiltersService', [ '$rootScope',
    'Logger',
    'blinkConstants',
    'strings',
    'jsonConstants',
    'sessionService',
    'util',
    function ($rootScope,
              Logger,
              blinkConstants,
              strings,
              jsonConstants,
              sessionService,
              util) {
        /*
         params can contain the following keys:
         label: the label to display for the filter
         values: the list of filterValue
         selectedFilterIndex: currently selected filter
         filterOn: a function describing how to apply the filter
         */
        function Filter(params) {
            this.label = params.label;
            this.values = params.values;
            this.currentFilterIndex = params.selectedFilterIndex || 0;
            this.key = params.key;
            this.filterOn = params.filterOn;
        }

        Filter.prototype.isFiltered = function(item) {
            var source = this.values[this.currentFilterIndex].value;
            var srcValue = (_.isFunction(source)) ? source() : source;
            return !srcValue || this.filterOn(item) === srcValue;
        };

        Filter.prototype.getKey = function() {
            return this.key;
        };

        Filter.prototype.getValue = function() {
            return this.values[this.currentFilterIndex].value;
        };

        function FilterValue(label, value) {
            this.label = label;
            this.value = value;
        }

        var standardFilters = {};

        var AuthorFilter = function() {
            AuthorFilter.__super.call(this, {
                label: strings.listFilterLabels.authorFilterLabel,
                key: 'category',
                values: [
                    new FilterValue(strings.listFilterLabels.authorFilterValueAll, 'ALL'),
                    new FilterValue(strings.listFilterLabels.authorFilterValueYou, 'MY')
                ]
            });
        };


        util.inherits(AuthorFilter, Filter);

        var ClientAuthorFilter = function() {
            ClientAuthorFilter.__super.call(this, {
                label: strings.listFilterLabels.authorFilterLabel,
                filterOn: function(item) {
                    return item.author;
                },
                values: [
                    new FilterValue(strings.listFilterLabels.authorFilterValueAll),
                    new FilterValue(strings.listFilterLabels.authorFilterValueYou, sessionService.getUserGuid)
                ]
            });
        };

        util.inherits(ClientAuthorFilter, Filter);

        function getMetadataTypeForFilters(item) {
            var type = item.type;
            // Considering Imported as System Table
            if(type === jsonConstants.metadataType.subType.IMPORTED_DATA) {
                return jsonConstants.metadataType.subType.SYSTEM_TABLE;
            }
            // Considering AGGR_WORKSHEET as Worksheet
            if(type === jsonConstants.metadataType.subType.AGGR_WORKSHEET) {
                return jsonConstants.metadataType.subType.WORKSHEET;
            }
            return item.type;
        }

        var TypeFilter = function() {
            TypeFilter.__super.call(this, {
                label: strings.listFilterLabels.tableTypeFilterLabel,
                key: 'subTypes',
                filterOn: getMetadataTypeForFilters,
                values: [
                    new FilterValue(strings.listFilterLabels.tableTypeFilterValueAll),
                    new FilterValue(strings.listFilterLabels.tableTypeFilterValueWorksheets,
                        jsonConstants.metadataType.subType.WORKSHEET),
                    new FilterValue(strings.listFilterLabels.tableTypeFilterValueTables,
                        jsonConstants.metadataType.subType.SYSTEM_TABLE)
                ]
            });
        };

        util.inherits(TypeFilter, Filter);

        TypeFilter.prototype.getValue = function() {
            var selectedValue = TypeFilter.__super.prototype.getValue.call(this);

            if (selectedValue == jsonConstants.metadataType.subType.WORKSHEET) {
                return [
                    jsonConstants.metadataType.subType.WORKSHEET,
                    jsonConstants.metadataType.subType.AGGR_WORKSHEET
                ];
            } else if (selectedValue == jsonConstants.metadataType.subType.SYSTEM_TABLE) {
                return [
                    jsonConstants.metadataType.subType.SYSTEM_TABLE,
                    jsonConstants.metadataType.subType.IMPORTED_DATA
                ];
            }
        };


        standardFilters.clientAuthorFilter = new ClientAuthorFilter();
        standardFilters.authorFilter = new AuthorFilter();
        standardFilters.typeFilter = new TypeFilter();

        // Note(chab) Before we were listening to the USER_LOGGED_IN_D to update the
        // author-filter value. As we do server-side filtering, this is not needed anymore
        // Schema still needs client-filter, but we disable it for the moment.

        /**
         * Class to instantiate a new stickers instance, this is used by label control inside
         * the top filters panel
         *
         * @param params
         * @param params.selectStickerMsg the default label message when nothing selected
         * @param params.stickerLabel The label for the sticker control
         * @param params.labelOn a callback to apply label on a item.
         * @constructor
         */
        function Stickers(params) {
            this.isDefaultStickerSelected = true;
            this.defaultLabel = params.selectStickerMsg || strings.listFilterLabels.selectStickerMessage;
            this.selectedSticker = {
                name: this.defaultLabel,
                color: null
            };
            this.stickersLabel = params.stickerLabel || strings.listFilterLabels.TAG_LABEL_UI_NAME;
            this.labelOn = params.labelOn;
        }


        Stickers.prototype.isLabelledWith = function(item) {
            var self = this;
            if (self.isDefaultStickerSelected) {
                return true;
            }
            return this.labelOn(item).some(function(tag) {
                return tag.name === self.selectedSticker.name;
            });
        };

        Stickers.prototype.selectDefault = function() {
            this.selectedSticker.name = this.defaultLabel;
            this.selectedSticker.color = null;
            this.selectedSticker.id = null;
            this.isDefaultStickerSelected = true;
        };

        Stickers.prototype.select = function(label) {
            this.selectedSticker.name = label.getName();
            this.selectedSticker.color = label.color;
            this.selectedSticker.id = label.getId();
            this.isDefaultStickerSelected = false;
        };

        Stickers.prototype.getKey = function() {
            return "tagname";
        };

        Stickers.prototype.getValue = function() {
            if (this.selectedSticker.id) {
                return [
                    this.selectedSticker.name
                ];
            }
        };

        standardFilters.stickers = new Stickers({
            labelOn: function(item) {
                return item.tags;
            }
        });

        return {
            Filter: Filter,
            FilterValue: FilterValue,
            standardFilters: standardFilters,
            Stickers: Stickers
        };

    }
]);
