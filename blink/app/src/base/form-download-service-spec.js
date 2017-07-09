/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

describe('Form Download Service', function () {
    var FormDownloader, util, navAlertService;
    var jqSubmit, jqRemove;
    beforeEach(function() {
        module('blink.app');

        inject(function($injector) {
            FormDownloader = $injector.get('FormDownloader');
            util = $injector.get('util');
            navAlertService = $injector.get('navAlertService');
        });

        $('body').empty();

        jqSubmit = $.fn.submit;
        jqRemove = $.fn.remove;

        $.fn.submit = _.noop;
        $.fn.remove = _.noop;
    });

    afterEach(function () {
        $.fn.submit = jqSubmit;
        $.fn.remove = jqRemove;
    });

    it('should generate the correct form definition for names with spaces', function () {
        var formDownloader = new FormDownloader();
        util.executeInNextEventLoop = _.noop;
        navAlertService.deRegisterWindowUnloadAndRouteChangeListeners = _.noop;

        formDownloader.downloadForm('callosum/path', {
            id:'id',
            name: 'name with space'
        }, undefined, false);

        var $form = $('body').find('#downloader');
        var formDefn = $form.clone().wrap('<div/>').parent().html();
        expect(formDefn).toBe('<form action="callosum/path" method="POST" id="downloader">' +
            '<input name="id" value="id">' +
            '<input name="name" value="name with space">' +
        '</form>');
    });

    it('should generate the correct form definition for names with quotes', function () {
        var formDownloader = new FormDownloader();
        util.executeInNextEventLoop = _.noop;
        navAlertService.deRegisterWindowUnloadAndRouteChangeListeners = _.noop;

        formDownloader.downloadForm('callosum/path', {
            id:'id',
            name: '["abc"]'
        }, undefined, false, true);

        var $form = $('body').find('#downloader');
        var formDefn = $form.clone().wrap('<div/>').parent().html();
        expect(formDefn).toBe('<form action="callosum/path" method="POST" id="downloader">' +
        '<input name="id" value="id">' +
        '<input name="name" value="[&quot;abc&quot;]">' +
        '</form>');
    });

    it('should generate the method type to be POST for form by default', function () {
        var formDownloader = new FormDownloader();
        util.executeInNextEventLoop = _.noop;
        navAlertService.deRegisterWindowUnloadAndRouteChangeListeners = _.noop;

        formDownloader.downloadForm('callosum/path', {
            id:'id',
            name: 'name'
        }, undefined, false, true);

        var $form = $('body').find('#downloader');
        var formDefn = $form.clone().wrap('<div/>').parent().html();
        expect(formDefn).toBe('<form action="callosum/path" method="POST" id="downloader">' +
            '<input name="id" value="id">' +
            '<input name="name" value="name">' +
            '</form>');
    });
});
