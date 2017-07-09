/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Service that instantiates the data explorer directive
 */

'use strict';

blink.app.factory('dataExplorerLauncher', ['$rootScope',
    'angularUtil',
    'Logger',
    function ($rootScope,
              angularUtil,
              Logger) {

        var me = {},

            _logger = Logger.create('data-explorer-launcher'),

            _$explorer,

        // Any param listed here will be passed in to the directive through attributes
            DATA_EXPLORER_PARAMS = {
                selectableColumnPredicate: 'selectable-column-predicate',
                title: 'data-explorer-title',
                selectedTable: 'selected-table',
                mode: 'mode'
            };


    /**
     * Opens the data explorer
     * Supported params:
     *     - parentScope      Instantiates the data explorer directive as a child scope of the passed in parentScope
     *     - selectableColumnPredicate Opens the data explorer in a mode where user can pick a table column from among
     *                                 the columns that match this predicate
     *     - title            Overwrite the default title of the data explorer
     *     - selectedTable  Will select a certain table as the data explorer opens
     *     - mode   PROP_VIEW/DATA_VIEW/RELATIONSHIP_VIEW view mode
     *
     * @param  {Object} params
     */
        me.open = function (params) {
            params = params || {};
            if (_$explorer) {
                _$explorer.remove();
            }
            var parentScope = params.parentScope || $rootScope,
                scope = parentScope.$new();
            _$explorer = $('<blink-data-explorer-popup></blink-data-explorer-popup>');
        // Pass in the data explorer params to the data explorer directive through attributes
            Object.keys(params).forEach(function (key) {
                if (DATA_EXPLORER_PARAMS[key]) {
                    _$explorer.attr(DATA_EXPLORER_PARAMS[key], key);
                    scope[key] = params[key];
                }
            });
            _$explorer = angularUtil.getCompiledElement(_$explorer, scope);
            $('body').append(_$explorer);
            _$explorer.show();
        };

        return me;

    }]);
