/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview A factory exporting various classes for data panel models.
 */

'use strict';

blink.app.factory('panelFactory', ['Logger', 'blinkConstants', 'strings', 'formulaEditorPopupService',
    function (Logger, blinkConstants, strings, formulaEditorPopupService) {
        var _logger = Logger.create('panel-factory');

        var me = {};

    /**
     *
     * @param {string} templateUrl The url of the template for this panel component's content.
     * @param {Panel} panel The container panel for this component
     * @constructor
     */
        function PanelComponent(templateUrl, panel, startExpanded) {
            this._panel = panel;
            this._templateUrl = templateUrl;
            this._expanded = startExpanded || false;
        }

    //--- INTERACE METHODS ---
        angular.extend(PanelComponent.prototype, {
        /**
         *
         * @return {boolean}
         */
            isOutOfFlow: function () {
                return false;
            },

        /**
         *
         * Returns true if this component is expandable (defaults to false).
         * @return {boolean}
         */
            isExpandable: function () {
                return false;
            },

        /**
         * A subclass should implement this method if it needs to react when the panel component expands/collapses.
         * Use isExpanded() to know the expansion state.
         *
         * @type {Function}
         */
            onExpansionStateChanged: angular.noop,

        /**
         * Returns the css class name to be applied to the panel when this component is expanded.
         * Used by the Panel.getExpansionClass() method.
         *
         * @return {string}
         */
            getExpansionClass: function () {
                return '';
            },

        /**
         * Returns the css class name to be applied to the panel component root html element.
         * @return {string}
         */
            getComponentClass: function () {
                return '';
            },

        /**
         * Returns a string to be used in panel component root html element.
         * @return {string}
         */
            getString: function () {
                return '';
            }
        });

    //--- COMMON METHODS ---
    /**
     *
     * @return {string}
     */
        PanelComponent.prototype.getTemplateUrl = function () {
            return this._templateUrl;
        };

    /**
     * Toggle Expansion state of the component
     */
        PanelComponent.prototype.toggleExpansion = function () {
            if (!this.isExpandable()) {
                return;
            }

        // Toggle the state.
            if (this._expanded) {
                this.collapse();
            } else {
                this.expand();
            }
        };

    /**
     * Sets the component to collapsed state (if expandable).
     */
        PanelComponent.prototype.collapse = function () {
            if (this.isExpandable()) {
                if (this._expanded) {
                    this.onExpansionStateChanged();
                }
                this._expanded = false;
            }
        };

    /**
     * Sets the component to expanded state (if expandable).
     */
        PanelComponent.prototype.expand = function () {
            if (this.isExpandable()) {
                if (!this._expanded) {
                    this.onExpansionStateChanged();
                }
                this._expanded = true;
            }

            this._panel.onComponentExpanded(this);
        };

    /**
     * Returns true if the component is expanded. The boolean is only applicable to components that are expandable.
     * @return {boolean}
     */
        PanelComponent.prototype.isExpanded = function () {
            return this._expanded;
        };

    /**
     * Returns true if the underlying panel is in read-only mode
     * @return {boolean}
     */
        PanelComponent.prototype.isReadOnly = function () {
            return this._panel.isReadOnly();
        };

        PanelComponent.prototype.documentHasUnderlyingDataAccess = function () {
            return this._panel.documentHasUnderlyingDataAccess();
        };

    /**
     * Returns the data sources in the panel.
     * @return {Array}
     */
        PanelComponent.prototype.getDataSources = function () {
            return this._panel.getDataSources();
        };

    /**
     *
     * @return {Object}
     */
        PanelComponent.prototype.getDocumentConfig = function () {
            return this._panel && this._panel.getDocumentConfig();
        };

    /**
     *
     * @return {boolean}
     */
        PanelComponent.prototype.hasAnyDataSources = function () {
            return this._panel.hasAnyDataSources();
        };

    //--- Static members ---
    /**
     *
     * @enum {string}
     * @static
     */
        PanelComponent.templates = {
            SOURCES_WITH_LABELS: 'src/modules/sage/data-panel/sources-panel-component/sources-v2-panel-component.html',
            COLUMNS: 'src/modules/sage/data-panel/columns-panel-component/columns-panel-component.html',
            BULK_COLUMNS: 'src/modules/sage/data-panel/columns-panel-component/bulk-columns-panel-component.html',
            FILTERS: 'src/modules/sage/data-panel/filter-panel-component/filters-panel-component.html',
            FORMULAE: 'src/modules/sage/data-panel/formula-panel-component/formulae-panel-component.html'
        };

        PanelComponent.types = {
            SOURCES_WITH_LABELS: 'sources_with_labels',
            COLUMNS: 'columns',
            BULK_COLUMNS: 'bulk_columns',
            FILTERS: 'filters',
            FORMULAE: 'formulae'
        };

    /**
     *
     * @param {string} componentType
     * @param {Panel} panel
     * @return {Object=}
     *
     * @static
     */
        PanelComponent.create = function (componentType, panel) {
            switch (componentType) {
                case PanelComponent.types.SOURCES_WITH_LABELS:
                    return new SourcesV2PanelComponent(panel);
                case PanelComponent.types.COLUMNS:
                case PanelComponent.types.BULK_COLUMNS:
                    return new ColumnsPanelComponent(panel, componentType);
                case PanelComponent.types.FILTERS:
                    return new FiltersPanelComponent(panel);
                case PanelComponent.types.FORMULAE:
                    return new FormulaePanelComponent(panel);
            }

            _logger.warn('Unsupported panel component', componentType);
            return null;
        };

    //--- Child classes ---
        function SourcesV2PanelComponent(panel) {
            angular.extend(this, new PanelComponent(PanelComponent.templates.SOURCES_WITH_LABELS, panel));
        }
        angular.extend(SourcesV2PanelComponent.prototype, PanelComponent.prototype);

        angular.extend(SourcesV2PanelComponent.prototype, {
        /**
         *
         * @return {boolean}
         * @override
         */
            isOutOfFlow: function () {
                return true;
            },

        /**
         *
         * Returns true if this component is expandable (defaults to false).
         * @return {boolean}
         */
            isExpandable: function () {
                return true;
            },

        /**
         *
         * @return {Array.<string>} sources
         */
            getInitDataSources: function () {
                return this._panel._initDataSources;
            },

        /**
         *
         * @param {Array.<string>} sources
         */
            setDataSources: function (sources) {
                this._panel.setDataSources(sources);
            },

        /**
         *
         * @return {string}
         */
            getComponentClass: function () {
                return 'bk-sources-container';
            },

        /**
         *
         * @return {string}
         * @override
         */
            getExpansionClass: function () {
                return '';
            },

        /**
         * @return {AnswerSageClient}
         */
            getSageClient: function() {
                return this._panel.getSageClient();
            },

        /**
         * @return {string}
         */
            getString: function() {
                return strings.chooseSources;
            }
        });

        function ColumnsPanelComponent(panel, type) {
            var template = PanelComponent.templates.COLUMNS;
            if (type === PanelComponent.types.BULK_COLUMNS) {
                template = PanelComponent.templates.BULK_COLUMNS;
            }
        // Columns panel is not expandable/collapsible, so it should remain expanded.
            angular.extend(this, new PanelComponent(template, panel, true));
        }
        angular.extend(ColumnsPanelComponent.prototype, PanelComponent.prototype);

        angular.extend(ColumnsPanelComponent.prototype, {
        /**
         *
         * @return {string}
         */
            getComponentClass: function () {
                return 'bk-columns-container';
            },

        /**
         * @return {AnswerSageClient}
         */
            getSageClient: function() {
                return this._panel.getSageClient();
            }
        });

        function FiltersPanelComponent(panel) {
            angular.extend(this, new PanelComponent(PanelComponent.templates.FILTERS, panel));
        }
        angular.extend(FiltersPanelComponent.prototype, PanelComponent.prototype);

        angular.extend(FiltersPanelComponent.prototype, {
        /**
         *
         * Returns true if this component is expandable (defaults to false).
         * @return {boolean}
         */
            isExpandable: function () {
                return true;
            },

        /**
         *
         * @return {string}
         * @override
         */
            getExpansionClass: function () {
                return 'bk-sage-data-filters-open';
            },

        /**
         *
         * @return {string}
         */
            getComponentClass: function () {
                return 'bk-filters-container';
            },

        /**
         * @return {AnswerSageClient}
         */
            getSageClient: function() {
                return this._panel.getSageClient();
            }
        });

        function FormulaePanelComponent(panel) {
            angular.extend(this, new PanelComponent(PanelComponent.templates.FORMULAE, panel, true));
        }
        angular.extend(FormulaePanelComponent.prototype, PanelComponent.prototype);

        angular.extend(FormulaePanelComponent.prototype, {
            _isAnyDataSourceSelected: function () {
                var dataSources = this.getDataSources();
                return dataSources && dataSources.length > 0;
            },

            isEditingAllowed: function () {
                return !this.isReadOnly() && this._isAnyDataSourceSelected();
            },

        /**
         *
         * @return {string}
         */
            getComponentClass: function () {
                return 'bk-formulae-container';
            }
        });


    /**
     *
     * @param {Array.<string>} componentsList List of component types
     * @param {Array.<string>} initSources List of guids of source tables/worksheets that should be shown selected.
     * @param {Object} documentConfig The document config
     * @param {boolean} isReadOnly If the panel is in read-only mode
     * @constructor
     */
        function Panel(
        componentsList,
        initSources,
        documentConfig,
        isReadOnly,
        documentHasUnderlyingDataAccess,
        columnPanelComponentConfig
    ) {
            var self = this;
            this._componentTypeToComponentMap = {};
            this._components = [];
            if (documentHasUnderlyingDataAccess === undefined) {
                documentHasUnderlyingDataAccess = true;
            }

            componentsList.each(function (componentType) {
                var component = PanelComponent.create(componentType, self);
                if (!!component) {
                    self._componentTypeToComponentMap[componentType] = component;
                    self._components.push(component);
                }
            });

            this._documentConfig = documentConfig;
            this._initDataSources = initSources;
            this._isReadOnly = !!isReadOnly;
            this._sageClient = documentConfig.sageClient;
            this._documentHasUnderlyingDataAccess = documentHasUnderlyingDataAccess;
            this.columnPanelComponentConfig = columnPanelComponentConfig;
        }

    /**
     * NOT USED.
     * @param {string} componentType
     */
        Panel.prototype.addComponent = function (componentType) {
            var newComponent = PanelComponent.create(componentType, this);
            if (!newComponent) {
                return;
            }

            this._components.push(newComponent);
        };

    /**
     *
     * @return {Array.<PanelComponent>}
     */
        Panel.prototype.getComponents = function () {
            return this._components;
        };

        Panel.prototype.onComponentExpanded = function (componentClicked) {
            this._components.filter(function (component) {
                return component != componentClicked;
            }).each(function (filteredComponent) {
                filteredComponent.collapse();
            });
        };

        Panel.prototype.documentHasUnderlyingDataAccess = function(){
            return this._documentHasUnderlyingDataAccess;
        };

    /**
     *
     * @return {string}
     */
        Panel.prototype.getExpansionClass = function () {
            var expansionClass = '';
            this._components.each(function (component) {
                if (component.isExpanded()) {
                    expansionClass += (expansionClass ? ' ' : '') + component.getExpansionClass();
                }
            });

            return expansionClass;
        };

        Panel.prototype.getTopLevelCssClass = function () {
            var expansionClass = '';
            if (!!this._documentConfig && this._documentConfig.type.toLowerCase() === blinkConstants.WORKSHEET_TYPE) {
                expansionClass = 'bk-type-worksheet';
            }

            if (this.isReadOnly()) {
                expansionClass += (expansionClass ? ' ' : '') + 'bk-read-only';
            }

            return expansionClass;
        };

    /**
     *
     * @return {Array}
     */
        Panel.prototype.getDataSources = function () {
            return this._dataSources;
        };

    /**
     *
     * @return {Object}
     */
        Panel.prototype.getDocumentConfig = function () {
            return this._documentConfig;
        };

    /**
     *
     * @param {Array.<string>} sources
     */
        Panel.prototype.setDataSources = function (sources) {
            this._dataSources = sources || [];
        };

    /**
     *
     * @return {boolean}
     */
        Panel.prototype.hasAnyDataSources = function () {
            return !!(this._dataSources && this._dataSources.length);
        };

    /**
     * Returns true if the panel is in read-only mode
     * @return {boolean}
     */
        Panel.prototype.isReadOnly = function () {
            return this._isReadOnly;
        };

    /**
     *
     * @param {PanelComponent.types} componentType
     * @return {PanelComponent}
     */
        Panel.prototype.getComponentOfType = function (componentType) {
            return this._componentTypeToComponentMap[componentType];
        };

    /**
     * @returns {AnswerSageClient}
     */
        Panel.prototype.getSageClient = function() {
            return this._sageClient;
        };

        me.Panel = Panel;
        me.PanelComponent = PanelComponent;

        return me;
    }]);
