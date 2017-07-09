/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com
 *
 * @fileoverview Service for callosum /admin functionality
 */

'use strict';

blink.app.factory('adminService', ['$rootScope', 'Command',
    function ($rootScope, Command) {

        var me = {};

    /**
     * Issue a clear memcache call
     *
     * @return {Promise<object>} A promise
     */
        me.clearMemcache = function () {
            var command = new Command()
            .setPath('/admin/debug/clearmemcache')
            .setPostMethod();
            return command.execute();
        };

    /**
     * Search memcache
     *
     * @param params
     * @param params.objecttype metadata object type to search
     * @param params.userid user id to search for
     * @param params.id json encoded list of objects to search
     * @param params.showhidden boolean
     * @param params.useunsecured boolean
     *
     * @return {Promise<object>} A promise that resolves into memcache search results
     */
        me.searchMemcache = function (params) {
            var command = new Command()
            .setPath('/admin/debug/searchmemcache')
            .setPostMethod()
            .setPostParams(params);
            return command.execute();
        };


    /**
     * Get loggers
     *
     *
     * @return {Promise<object>} A promise that resolves into list of logger names along with loglevels
     */
        me.getLoggerNames = function () {
            return new Command().setPath('/admin/loggernames').execute();
        };

    /**
     * Set loglevel for a given logger
     *
     * @param params
     * @param params.name Logger name
     * @param params.level new loglevel
     *
     * @return {Promise<object>} A promise
     */
        me.setLogLevel = function (params) {
            var command = new Command()
            .setPath('/admin/loglevel/set')
            .setPostMethod()
            .setPostParams(params);
            return command.execute();
        };

    /**
     * Retrieves current memcache usage stats
     *
     *
     * @return {Promise<object>} A promise that resolves into object, containing various memcache stats
     */
        me.getMemcacheStats = function () {
            return new Command().setPath('/admin/debug/memcachestats').execute();
        };

    /**
     * Retrieves callosum debug info
     *
     * @return {Promise<object>} A promise that resolves into object, containing debug info
     */
        me.getDebugInfo = function () {
            return new Command().setPath('/admin/debug').execute();
        };

    /**
     * Report failure to admin by emailing the trace file.
     * @param traceId GUID of trace event.
     * @return {Promise<object>} .
     */
        me.reportTraceEvent = function (traceId) {
            return new Command()
            .setPath('/admin/debug/reporttraceevent')
            .setPostMethod()
            .setPostParams({id: traceId})
            .execute();
        };


    // We set adminService on root scope so that it is easily accessible from protractor framework.
        $rootScope.adminService = me;

        return me;

    }]);
