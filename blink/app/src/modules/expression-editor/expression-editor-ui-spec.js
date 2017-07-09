/**
 * Copyright: ThoughtSpot Inc. 2012-2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Unit test for expression-editor-ui
 */

'use strict';

/* eslint camelcase: 1 */
describe('Expression editor UI', function() {
    var $scope, _$route, _$timeout, _$q, _ExpressionEditorModel, _autoCompleteService, _SageResponse, elem, editor, contextMenu;

    //if (abs(profit) > 10 and customer region = asia) then ramesh else category
    var QUERY = [
        ['if', 'KEYWORD'], ['(', 'DELIMITER'], ['abs', 'FUNCTION_NAME'], ['(', 'DELIMITER'], ['profit', 'MEASURE'],
        [')', 'DELIMITER'], ['>', 'OPERATOR'], ['10', 'POSITIVE_INT'], ['and', 'KEYWORD'],
        ['customer region', 'ATTRIBUTE'], ['=', 'OPERATOR'], ['asia', 'VALUE'],
        [')', 'DELIMITER'], ['then', 'KEYWORD'], ['ramesh', 'VALUE'],
        ['else', 'KEYWORD'], ['category', 'VALUE']
    ];

    var EDITOR_CONTENT_WITH_WHITESPACES = '.token:not(.ghost):not(.ghost-separator):not(.empty)';
    var EDITOR_CONTENT_WITHOUT_WHITESPACES = '.token:not(.ghost):not(.ghost-separator):not(.empty):not(.whitespace)';

    var validTokenTextSet = {},
        validTokens = QUERY.map(function(tokenInfo){
            validTokenTextSet[tokenInfo[0]] = true;

            var token = new sage.RecognizedToken({
                token: tokenInfo[0],
                type_enum: sage.TokenType[tokenInfo[1]]
            });
            token.setHasSpaceAfter(true);
            return token;
        });

    validTokenTextSet['abs-0'] = true;

    function findCurrentCursorOffset() {
        var sel = window.getSelection();
        var trueContent = editor.contents(EDITOR_CONTENT_WITH_WHITESPACES),
            currentNode = sel.anchorNode,
            examinedNode = trueContent[0].childNodes[0];
        var index = 0, offset = 0;

        while (examinedNode && examinedNode != currentNode) {
            index++;
            offset = offset + examinedNode.length;
            examinedNode = trueContent[index].childNodes[0];
        }

        return offset + sel.anchorOffset;
    }

    function setCursorInNode($node, offsetInNode) {
        var range = document.createRange(),
            selection = window.getSelection();
        if (offsetInNode < 0) {// set to the end
            range.selectNode($node[0]);
            range.collapse(false);
        } else {// set to the given index
            range.setStart($node[0].childNodes[0], offsetInNode);
            range.collapse(true);
        }

        selection.removeAllRanges();
        selection.addRange(range);
    }

    function checkIfCursorMovedCorrectly() {
        var nodes = editor.contents(EDITOR_CONTENT_WITH_WHITESPACES);
        var currentOffset = 0;
        setCursorInNode(nodes.eq(0), 0);

        for (var i = 0; i < nodes.length; i++) {
            var currentNode = nodes.eq(i);
            var lengthOfContent = currentNode.text().length;
            for (var j = 0; j < lengthOfContent; j++) {
                setCursorInNode(currentNode, j);
                expect(currentOffset).toEqual(findCurrentCursorOffset());
                currentOffset++;
            }
        }
    }

    function typeText(text, replace) {
        editor.focus();

        if (!!replace) {
            //inner text ignores whitespaces at the end
            editor.html(text.replace(/\s/g, '&nbsp;'));
            setCursorInNode(editor.contents().last(), -1);
        } else {
            var $lastNode = editor.contents(EDITOR_CONTENT_WITH_WHITESPACES).last();

            $lastNode.text($lastNode.text() + text);
            setCursorInNode($lastNode, -1);
        }

        editor.trigger('input');
        _$timeout.flush();
        $scope.$apply();
    }

    function deleteLastChar() {
        var $lastNode = editor.contents(EDITOR_CONTENT_WITH_WHITESPACES).last();
        var text = $lastNode.text();
        if (text.length === 1) {
            var $cursorHost = $lastNode.prev();
            $lastNode.remove();
            setCursorInNode($cursorHost, -1);
        } else {
            $lastNode.html(text.slice(0, -1).replace(/\s/g, '&nbsp;'));
            setCursorInNode($lastNode, -1);
        }

        editor.trigger('input');
        _$timeout.flush();
        $scope.$apply();
    }

    function insertTextAtIndex(index, insertion) {
        var charsLeft = index,
            $contents = editor.contents();
        for (var i=0; i<$contents.length; i++) {
            var $node = $contents.eq(i),
                text = $node.text();
            if (charsLeft < text.length) {
                text = text.insert(insertion, charsLeft);
                $node.text(text);
                break;
            }
            charsLeft -= text.length;
        }

        editor.trigger('input');
        _$timeout.flush();
        $scope.$apply();
    }

    function normalizeWhitespace(string) {
        return string.replace(/\xa0/g, ' ');
    }

    function getGhostText() {
        return normalizeWhitespace(editor.find('.token.ghost').text());
    }

    function getNonGhostText() {
        return normalizeWhitespace(editor.find('.token:not(.ghost)').text());
    }

    function getSuggestions() {
        return contextMenu.find('.suggestion-name');
    }

    function verifyVisibleText(nonGhostText, ghostText) {
        expect(getNonGhostText()).toBe(nonGhostText);
        expect(getGhostText()).toBe(ghostText);
    }

    function verifySuggestions(firstSuggestionText, numSuggestions) {
        expect(getSuggestions().length).toBe(numSuggestions);
        expect(getSuggestions().eq(0).text()).toBe(firstSuggestionText);
    }

    function selectSuggestion(n) {
        $scope.onCompletionClick($.Event( "click"), n);
        $scope.$apply();
    }

    function _updateExpression(tableRequest) {
        var deferred = _$q.defer();
        var tokens = angular.copy(tableRequest.getInputTokens());
        var currentlyEditedTokenIndex = tableRequest.getCurrentlyEditedTokenIndex();

        var formulaGhostTokens = [];
        for (var i=0; i<tokens.length; i++) {
            var token = tokens[i];
            if (token.getTokenTextLowerCase() === 'customer' && i < tokens.length - 1 && tokens[i + 1].getTokenTextLowerCase() === 'region') {
                token = tokens[i] = sage.RecognizedToken.createUnrecognizedToken('customer region');
                tokens.splice(i + 1, 1);
            }

            var tokenText = token.getTokenTextLowerCase();
            if (token.isUnrecognized() && Object.has(validTokenTextSet, tokenText.replace(/\s+/g, ' '))) {
                token.type_enum = sage.TokenType.RECOGNIZED_TOKEN;
                formulaGhostTokens.push(token);
            }

            if (!token.isUnrecognized()) {
                formulaGhostTokens.push(token);
            }
        }

        for (var j=formulaGhostTokens.length; j < validTokens.length; j++) {
            formulaGhostTokens.push(validTokens[j]);
        }

        var completionPosition = currentlyEditedTokenIndex;
        if (completionPosition < 0) {
            if (tokens.length > 0 && tokens.last().isUnrecognized()) {
                completionPosition = tokens.length - 1;
            } else {
                completionPosition = tokens.length;
            }
        } else if (completionPosition == tokens.length && tokens.last().isUnrecognized()) {
            completionPosition--;
        }

        //TODO (Rahul): Use keyless contructors here.
        var tokenUnderCaret = formulaGhostTokens[completionPosition],
            formulaCompletions = [new sage.Completion({
                num_tokens_to_replace: 1,
                recognized_token: tokenUnderCaret
            })];

        for (var k=0; k<5; k++) {
            var dummyToken = new sage.RecognizedToken({
                token: tokenUnderCaret.token + '-' + k,
                type_enum: tokenUnderCaret.type_enum
            });
            dummyToken.setHasSpaceAfter(true);

            formulaCompletions.push(new sage.Completion({
                num_tokens_to_replace: 1,
                recognized_token: dummyToken
            }));
        }

        var tableResponse = new sage.ACTableResponse({
            new_token: tokens,
            formula_ghost: formulaGhostTokens,
            formula_completion: formulaCompletions,
            completion_position: completionPosition,
            join_path_ambiguity: []
        });

        var formulaResponse = new sage.FormulaResponse();
        formulaResponse.resp = tableResponse;
        formulaResponse.info = new sage.ACResponseInfo();
        formulaResponse.table = new sage.ACTable();
        formulaResponse.table.error = new sage.ErrorCollection();
        formulaResponse.table.error.error = new sage.Error();
        formulaResponse.table.error.error.error_code = sage.ErrorCode.SUCCESS;
        formulaResponse.table.error.error.error_message = '';
        deferred.resolve(new _SageResponse(formulaResponse));
        return deferred.promise;
    }

    function setUpEditInTheMiddle() {
        typeText('if ( abs ( profi', true);
        setCursorInNode(editor.contents('.token.recognized-token').eq(2), 2);
        editor.trigger('click');
        _$timeout.flush();
        $scope.$apply();
    }

    beforeEach(function() {
        module('blink.app', function($provide) {
            var mockAutoCompleteService = jasmine.createSpyObj('autoCompleteService', [
                'updateExpression'
            ]);
            $provide.value('autoCompleteService', mockAutoCompleteService);
        });

        inject(function($rootScope, $compile, $route, $q, $timeout, ExpressionEditorModel, autoCompleteService, SageResponse) {
            $scope = $rootScope.$new();
            _$route = $route;
            _$q = $q;
            _$timeout = $timeout;
            _ExpressionEditorModel = ExpressionEditorModel;
            _autoCompleteService = autoCompleteService;
            _SageResponse = SageResponse;

            $rootScope.sageDataSources = [];
            $scope.expressionEditorModel = new _ExpressionEditorModel();
            $scope.onValidExpression = angular.noop;
            elem = $compile(angular.element('<expression-editor expression-editor-model="expressionEditorModel">' +
                '</expression-editor>'))($scope);
            $('body').append(elem);

            $rootScope.$digest();

            editor = elem.find('.content-editor');
            contextMenu = elem.find('.expression-editor-context-menu');

            //directive's scope is the child of _$scope
            $scope = editor.scope();
            _autoCompleteService.updateExpression = _updateExpression;
        });
    });

    afterEach(function () {
        elem.remove();
    });

    it('should show ghost', function(){
        typeText('i', true);
        expect(editor.children().eq(0).attr('class')).toMatch('unrecognized-token');
        verifyVisibleText('i', 'f ( abs ( profit ) > 10 and customer region = asia ) then ramesh else category');
    });

    it('should show suggestion as the user types', function(){
        typeText('i', true);
        verifySuggestions('if', 6);
    });

    it('should parse multiple tokens simultaneously', function(){
        typeText('if ( ', true);
        verifyVisibleText('if ( ', 'abs ( profit ) > 10 and customer region = asia ) then ramesh else category');
        verifySuggestions('abs', 6);
    });

    it('should update suggestions when the query changes - adding non-whitespace after whitespace', function(){
        typeText('if ( ', true);
        typeText('a', false);
        verifyVisibleText('if ( a', 'bs ( profit ) > 10 and customer region = asia ) then ramesh else category');
        verifySuggestions('abs', 6);
    });

    it('should update suggestions when the query changes - adding non-whitespace after non-whitespace', function(){
        typeText('if ( a', true);
        typeText('b', false);
        verifyVisibleText('if ( ab', 's ( profit ) > 10 and customer region = asia ) then ramesh else category');
        verifySuggestions('abs', 6);
    });

    it('should update suggestions when the query changes - adding whitespace after non-whitespace', function(){
        typeText('if ( abs', true);
        typeText(' ', false);
        verifyVisibleText('if ( abs ', '( profit ) > 10 and customer region = asia ) then ramesh else category');
        verifySuggestions('(', 6);
    });

    it('should update suggestions when the query changes - adding whitespace after whitespace', function(){
        typeText('if ( abs ', true);
        typeText(' ', false);
        verifyVisibleText('if ( abs  ', '( profit ) > 10 and customer region = asia ) then ramesh else category');
        verifySuggestions('(', 6);
    });

    it('should update suggestions when the query changes - removing a character', function(){
        typeText('if ( abs ', true);
        verifySuggestions('(', 6);
        deleteLastChar();
        verifySuggestions('(', 6);
        deleteLastChar();
        verifySuggestions('abs', 6);
    });

    it('should allow any number of contiguous whitespaces inside a multi-word recognized token', function(){
        typeText('if ( abs ( profit ) > 10 and customer region = asi', true);
        insertTextAtIndex(37, '   ');
        verifyVisibleText('if ( abs ( profit ) > 10 and customer    region = asi', 'a ) then ramesh else category');
    });

    it('should insert selected suggestion', function(){
        typeText('if ( abs ( profi', true);
        selectSuggestion(0);
        verifyVisibleText('if ( abs ( profit ', ') > 10 and customer region = asia ) then ramesh else category');
    });

    it('should show suggestion for the token with the cursor', function(){
        setUpEditInTheMiddle();
        verifySuggestions('abs', 6);
    });

    it('should replace token with suggestion - edit in the middle', function(){
        setUpEditInTheMiddle();
        selectSuggestion(1);
        verifyVisibleText('if ( abs-0 ( profi', 't ) > 10 and customer region = asia ) then ramesh else category');
    });

    it('down arrow should move the highlighted suggestion', function(){
        typeText('if ( abs ', true);
        verifySuggestions('(', 6);

        for (var i = 0; i < 6; i++) {
            var suggestions = $('.bk-expression-suggestions-menu li');
            expect(suggestions.eq(i).hasClass('active')).toBe(true);
            /* global triggerKeydown */
            triggerKeydown($('.content-editor'), 40);
            $scope.$apply();
        }
    });

    // SCAL-9546
    // Expression editor moves the cursor to the end of nodes, that means that if you
    // set the position to the start of a node, it will move the cursor to
    // to the end of the preceding node

    it('should not move the cursor in unexpected place, incomplete query', function(){
        var text = 'console.log(';
        typeText(text, true);
        editor.focus();
        var $lastNode = editor.contents(EDITOR_CONTENT_WITH_WHITESPACES).last();
        for (var i = 0; i < text.length; i++) {
            setCursorInNode($lastNode, i);
            expect(window.getSelection().anchorOffset).toBe(i);
        }
    });

    it('should not move the cursor in unexpected place, complete query', function(){
        var text = 'if(abs(profit)>10';
        typeText(text, true);
        editor.focus();
        var nodes = editor.contents(EDITOR_CONTENT_WITHOUT_WHITESPACES);
        for (var i = 0; i < nodes.length; i++) {
            var currentNode = nodes.eq(i);
            var lengthOfContent = currentNode.text().length;
            for (var j = 0; j < lengthOfContent; j++){
                setCursorInNode(currentNode, j);
                expect(window.getSelection().anchorNode).toBe(currentNode[0].childNodes[0]);
                expect(window.getSelection().anchorOffset).toBe(j);
            }
        }
    });

    it('cursor offset from the start of the query should be correct when moving the cursor', function() {
        // nice query
        var text = 'if ( abs ( profit ) > 10 and customer region = asia ) then ramesh else category';
        typeText(text, true);
        editor.focus();
        checkIfCursorMovedCorrectly();

        // incomplete query
        text = 'if ((abs (profit) > 13441 and cus';
        typeText(text, true);
        editor.focus();
        checkIfCursorMovedCorrectly();

        text = 'console.log(';
        typeText(text, true);
        editor.focus();
        checkIfCursorMovedCorrectly();
    });

    it('should handle simultaneous splitting and merging of tokens - SCAL-5791', function(){
        var text = 'customer region,';
        typeText(text, true);
        editor.focus();
        expect(editor.contents.length).toBe(2);
    });

    /*
    xit('should handle adding spaces at the front of a query - SCAL-5803, SCAL-5787', function(){

    });*/

});

