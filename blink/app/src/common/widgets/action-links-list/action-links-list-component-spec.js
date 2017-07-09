/**
 * Copyright: ThoughtSpot Inc. 2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for Action-Links list
 */
'use strict';



describe('Action links component spec', function () {
    var $rootScope,
        $compile,
        actionLinks,
        ctrl,
        scope,
        directiveElement,
        ActionLinksList;

    var basePathAction = getBasePath(document.currentScript.src) + 'action-links-list-component';

    beforeEach(function (done) {

        module('blink.app');

        System.import(basePathAction).then(function (module) {
            inject(function ($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
            });

            actionLinks = [
                {
                    text: 'actionText',
                    onClick: jasmine.createSpy('actionSpyOne')
                },
                {
                    text: 'actionText2',
                    onClick: jasmine.createSpy('actionSpyTwo')
                }
            ];

            ActionLinksList = module.ActionLinksListComponent;
            ctrl = new ActionLinksList(actionLinks);
            directiveElement = getCompiledElement();
            done();
        }).catch(function (error) {
            done.fail(error);
        });
    });

    function getCompiledElement() {
        scope = $rootScope.$new();
        scope.ctrl = ctrl;
        var element = angular.element('<bk-action-links-list bk-ctrl="ctrl">' +
            '</bk-action-links-list>');
        var compiledElement = $compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }

    it('should render action item', function () {
        expect(directiveElement.find('.bk-action').length).toBe(2);
        actionLinks.forEach(function(link, idx)
        {
            expect(directiveElement.find('.bk-action:eq(' + idx + ')').text().trim()).toBe(link.text);
        });
    });

    it('should call action item callback', function () {
        actionLinks.forEach(function(link, idx)
        {
            directiveElement.find('.bk-action:eq(' + idx + ') a').click();
            scope.$digest();
            expect(link.onClick).toHaveBeenCalled();
        });
    });
});
