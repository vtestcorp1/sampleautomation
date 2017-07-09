/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Shashank Singh (sunny@thoughtspot.com),
 *         Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview View for expression editor
 *
 * The interface of this module consists of these points:
 *
 * 1. DOM events (IN)
 * 2. scope.expressionEditor watch (IN)
 * 3. syncModelWithSage (OUT)
 */

'use strict';

blink.app.directive('expressionEditor', ['$rootScope',
    'expressionUtil',
    'ExpressionSuggestion',
    'events',
    'JoinDisambiguationHelper',
    'Logger',
    'safeApply',
    'util',
    function ($rootScope,
              expressionUtil,
              ExpressionSuggestion,
              events,
              JoinDisambiguationHelper,
              Logger,
              safeApply,
              util) {

        var logger = Logger.create('expression-editor-ui'),
            currentRunningTokenId = 0,
            sageTokenIdToToken = {},
            activeCompletionIndex = 0,
            joinDisambiguationHelper = null,
            currentSuggestions = [],
            uiVersionCounter = 0,
            contextMenuHiddenUntilNextSuggestion = true,
            CssClasses = expressionUtil.CssClasses,
            lastKnownCursorPosition = {
                currentlyEditedTokenIndex: 0,
                offsetInTokenText: 0
            },
            isInputChangeProcessingPending = false;


        var TOKEN_ID_DATA_KEY = 'token-id',
            GHOST_COMPLETION_TEXT_DATA_KEY = 'ghost-text';

    // constant
        var sageTokeNodeSelector = '.{1}:not(.{2}):not(.{3}):not(.{4})'.assign(CssClasses.TOKEN,
        CssClasses.WHITESPACE, CssClasses.GHOST, CssClasses.GHOST_SEPARATOR);

    // TODO: check behavior in FF and IE
    // based on: http:// stackoverflow.com/a/4812022
        function getCaretCharacterOffsetWithin(element) {
            var caretOffset = 0,
                doc = element.ownerDocument || element.document,
                win = doc.defaultView || doc.parentWindow,
                selection = win.getSelection();

            if (selection.rangeCount === 0) {
                logger.debug('no selection present');
                return -1;
            }

            var range = win.getSelection().getRangeAt(0),
                preCaretRange = range.cloneRange();

            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);

            caretOffset = preCaretRange.toString().length;

            logger.debug('getCaretCharacterOffsetWithin::caretOffset', caretOffset,
            preCaretRange.toString(), preCaretRange.toString().length, element.innerHTML);

            return caretOffset;
        }

        function htmlEntities(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function findCursorHostNodeAndCursorHostNodeOffset($contentEditor, cursorPosition) {
        // we have to first find the child node inside which the cursor
        // will lie and then set the cursor relative to it
            var $cursorHostNode = null,
                cursorHostNodeOffset = 0,
                $childNodes = $contentEditor.contents(),
                nCharactersScanned = 0;

            for (var i=0; i<$childNodes.length && !$cursorHostNode; i++) {
                var $childNode = $childNodes.eq(i),
                    childNodeText = $childNode.text(),
                    nCharactersScannedInThisNode = 0;

                for (var j=0; j < childNodeText.length; j++) {
                    nCharactersScannedInThisNode++;
                    nCharactersScanned++;
                    if (nCharactersScanned >= cursorPosition) {
                        $cursorHostNode = $childNode;
                        cursorHostNodeOffset = (cursorPosition === 0) ? 0 : nCharactersScannedInThisNode;
                        break;
                    }
                }
            }
        // check if cursor is after the last character of the editor
            if (!$cursorHostNode && $childNodes.length > 0) {
                if ($contentEditor.text().length == cursorPosition) {
                    cursorHostNodeOffset = $childNodes.last().text().length;
                    $cursorHostNode = $childNodes.last();
                }
            }

            return {
                hostNode: $cursorHostNode,
                hostNodeOffset: cursorHostNodeOffset
            };
        }

        function setCursorPosition($contentEditor, cursorPosition) {
            var newCursorPosition = findCursorHostNodeAndCursorHostNodeOffset($contentEditor, cursorPosition);
            var $cursorHostNode = newCursorPosition.hostNode,
                cursorHostNodeOffset = newCursorPosition.hostNodeOffset;

            if (!$cursorHostNode) {
                logger.warn('unable to find cursor host node', $contentEditor, cursorPosition);
                return;
            }

            logger.debug('$cursorHostNode', $cursorHostNode);

            if ($cursorHostNode.hasClass(CssClasses.GHOST)) {
                logger.warn('trying to set cursor on ghost');
                $cursorHostNode = $cursorHostNode.prev(':not(.{1})'.assign(CssClasses.GHOST)).last();
                if ($cursorHostNode.length === 0) {
                    return;
                }
                cursorHostNodeOffset = $cursorHostNode.text().length;
            }

            var $children = $cursorHostNode.contents();
            if ($children.length === 0) {
                logger.warn('cursorHostNode is empty');
                return;
            }
        // range.setStart is done on text nodes only
            var cursorHostTextNode = $children[0];
            if (cursorHostTextNode.nodeType != Node.TEXT_NODE) {
                logger.warn('cursorHostTextNode is not a text node');
                return;
            }
            var range = document.createRange();
            var sel = window.getSelection();
            logger.debug('setting cursor position', cursorHostTextNode.textContent, cursorPosition, cursorHostNodeOffset);
            range.setStart(cursorHostTextNode, cursorHostNodeOffset);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }

        function setCursorInNode($node, offsetInNode) {
            var range = document.createRange();
            if (offsetInNode < 0) {// set to the end
                range.selectNodeContents($node.contents()[0]);
                range.collapse(false);
            } else {// set to the given index
                range.setStart($node.contents()[0], offsetInNode);
            }

            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        function setCursorAfterNode($node) {
            setCursorInNode($node, -1);
        }

        function setCursorBeforeNode($node) {
            setCursorInNode($node, 0);
        }

    /**
     * Replaces the current selection with a text node with given text.
     * If the selection is of zero length it will simply add text after
     * the cursor.
     *
     * This will also clear the current selection (if any)
     * @param replacementText
     */
        function replaceSelection(replacementText) {
            var selection = window.getSelection();
            if (!selection.rangeCount) {
                logger.debug('no selection found, can\'t replace selection');
                return;
            }
            var range = selection.getRangeAt(0);
            range.deleteContents();

        // TODO(sunny): sanitize text to ensure there are is no
        // HTML in it. Fine for now as replacementText is currently
        // only internal data
            var textNode = document.createTextNode(replacementText);
            range.insertNode(textNode);
        }

        function getSelectionRangeInEditor() {
            var selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                return false;
            }
            var range = selection.getRangeAt(0);
            if ($(range.commonAncestorContainer).closest('.' + CssClasses.CONTENT_EDITOR).length === 0) {
                return null;
            }
            return range.cloneRange();
        }

        function isEditorTextSelected() {
            var range = getSelectionRangeInEditor();
            if (!range) {
                return false;
            }
            return !range.collapsed;
        }

        function doOperationWithCursorPreserved($contentEditor, func) {
            var cursorPosition = getCaretCharacterOffsetWithin($contentEditor[0]);
            var rv = func();
            setCursorPosition($contentEditor, cursorPosition);
            return rv;
        }

        function getContextMenu($contentEditor) {
            return $contentEditor.closest('.' + CssClasses.EXPRESSION_EDITOR).find('.' + CssClasses.CONTEXT_MENU);
        }

        function getEmptyContentEditableTextOffset($contentEditor) {
            var $anchorNode = $('<span>&nbsp;</span>');
            $contentEditor.prepend($anchorNode);
            var anchorRect = $anchorNode[0].getBoundingClientRect();
            $anchorNode.remove();
            return anchorRect;
        }

        function updateContextMenuPosition(scope, $contentEditor) {
            var $contextMenu = getContextMenu($contentEditor),
                $tokenNodes = getSageTokenNodes($contentEditor),
                completionTokenPosition = scope.expressionEditorModel.getCompletionTokenPosition();

            var $anchorNode,
                afterEnd = completionTokenPosition === $tokenNodes.length;
            if (afterEnd) {
                $anchorNode = $tokenNodes.last();
            } else {
                $anchorNode = $tokenNodes.eq(completionTokenPosition);
            }

            var anchorNodeRect;
            if ($anchorNode.length === 0) {
                if ($contentEditor.is(':empty')) {
                    $contextMenu.css({
                        top: 10000,
                        left: 10000
                    });
                    return;
                }

                logger.debug('no token node found at sageCompletionTokenPosition', completionTokenPosition);
                anchorNodeRect = getEmptyContentEditableTextOffset($contentEditor);
            } else {
                anchorNodeRect = $anchorNode[0].getBoundingClientRect();
            }

            var contentEditorRect = $contentEditor[0].getBoundingClientRect(),
                contextMenuWidth = $contextMenu.width(),
                left = anchorNodeRect.left - contentEditorRect.left,
                top = anchorNodeRect.top + anchorNodeRect.height - contentEditorRect.top;

            if (afterEnd) {
                left += anchorNodeRect.width;
            }

            if (left + contextMenuWidth >= $contentEditor.width()) {
                left =  $contentEditor.width() - contextMenuWidth;
            }

            logger.debug('setting context menu position', top, left, $anchorNode.eq(0).text(), completionTokenPosition);

        // extra check to make sure even if there is a bug causing un-necessary sage round trips
        // we don't end up re-setting the current selection in the dropdown because of the
        // position setting
            var currentPosition = $contextMenu.position();
            if (currentPosition.top != top || currentPosition.left != left) {
                $contextMenu.css({
                    top: top,
                    left: left
                });
            } else {
                logger.debug('skipping resetting context menu position as it is already at the same position');
            }
        }

        function getNormalizedTokenText(token) {
            if ((token.getTypeEnum() === sage.TokenType.CONSTANT
                && token.getDataType() === sage.DataType.CHAR) ||
                token.getTypeEnum() === sage.TokenType.UNRECOGNIZED) {
                return token.getTokenText();
            }

            return token.getTokenTextLowerCase();
        }

    /**
     * Creates a new DOM node for a new token
     * @param {sage.RecognizedToken} token
     * @param {String=} tokenText if present this parameter override the use of token text as the text of the node
     *                            this is useful if sage token text is a normalized version of editor token text
     *                            e.g. when sage merges whitespaces inside tokens
     * @returns {*}
     */
        function getNewNodeForToken(token, tokenText) {
            if (!angular.isDefined(tokenText)) {
                tokenText = getNormalizedTokenText(token);
            }

            var cssClasses = [expressionUtil.getTokenDisplayCSSClass(token)];
            if (token.isUnrecognized()) {
                cssClasses.push(CssClasses.UNRECOGNIZED_TOKEN);
            } else {
                cssClasses.push(CssClasses.RECOGNIZED_TOKEN);
            }

            var $node = _getFormattedNode(tokenText, cssClasses);

            addNewTokenForTokenNode($node, token);
            return $node;
        }

    /**
     * Creates a new unrecognized token and adds a new DOM node for a given text
     * @param nodeText
     * @param isGhost
     */
        function getNewNodeForText(nodeText) {
            var token = sage.RecognizedToken.createUnrecognizedToken(nodeText),
                $node = _getFormattedNode(nodeText, [CssClasses.UNRECOGNIZED_TOKEN]);
            addNewTokenForTokenNode($node, token);
            return $node;
        }

        function getNewGhostNode(nodeText) {
            return _getFormattedNode(nodeText, [CssClasses.GHOST]);
        }

        function _getFormattedNode(nodeText, cssClasses) {
            var isWhitespace = /^\s+$/.test(nodeText);

            cssClasses = !!cssClasses ? cssClasses.slice(0) : [];
            cssClasses.push(CssClasses.TOKEN);
            if (isWhitespace) {
                cssClasses.push(CssClasses.WHITESPACE);
                if (nodeText === '\n') {
                    cssClasses.push(CssClasses.LINE_BREAK);
                }
            } else if (nodeText.length === 0) {
                cssClasses.push(CssClasses.EMPTY);
            }

            var html = '<span class="{1}">{2}</span>'.assign(cssClasses.join(' '), htmlEntities(nodeText));
            var $node = $(html);
            if (nodeText === ' ') {
                $node.html('&nbsp;');
            }

            return $node;
        }

        function normalizeWhitespace(string) {
            return string.replace(/\s+/g, ' ').replace(/\xa0/g, ' ');
        }

        function getEditorNonGhostContent($contentEditor) {
            return $contentEditor.contents().filter(function() {
                return this.nodeType == 3 || !$(this).hasClass(CssClasses.GHOST);
            });
        }

        function removeGhost($contentEditor) {
            var $ghost = $contentEditor.find('.{1}'.assign(CssClasses.GHOST)),
                $prevEmptySpace = $ghost.prev();

            if ($prevEmptySpace.hasClass(CssClasses.EMPTY)) {
                $prevEmptySpace.remove();
            }
            $ghost.remove();
        }

        function updateGhostOnContentChange($contentEditor) {
            var $ghost = $contentEditor.find('.' + CssClasses.GHOST),
                queryCompletionText = $ghost.data(GHOST_COMPLETION_TEXT_DATA_KEY);

            if (!angular.isDefined(queryCompletionText)) {
                logger.warn('missing query completion text, unable to update ghost');
                return;
            }

            var nonGhostText = getEditorNonGhostContent($contentEditor).text();
            if (blink.app.isIE) {
                nonGhostText = getEditorNonGhostContent($contentEditor).innerText();
            }

            var normalizedNonGhostText = normalizeWhitespace(nonGhostText);
            var nonGhostTextIndex = queryCompletionText.indexOf(normalizedNonGhostText);
            if (nonGhostTextIndex < 0) {
                logger.info('non ghost text is not a prefix of last query completion text, hiding ghost', nonGhostText, queryCompletionText);
                removeGhost($contentEditor);
                return;
            }

            $ghost.text(queryCompletionText.substr(normalizedNonGhostText.length));
        }

        function normalizeEditorHTML($contentEditor) {
        // cursor position needs to be calculated before we do any dom changes
            var $contents = getEditorNonGhostContent($contentEditor);
            if ($contents.length === 0) {
                return;
            }

            for (var i=0; i<$contents.length; i++) {
                var $tokenNode = $contents.eq(i),
                    $nextTokenNode = $contents.eq(i + 1),
                    nodeText = $tokenNode.text(),
                    existingToken = getTokenForTokenNode($tokenNode);

                if (existingToken) {
                    var hasSpaceAfter = $nextTokenNode.length > 0 && /\s+/.test($nextTokenNode.text());
                    existingToken.setHasSpaceAfter(hasSpaceAfter);

                    var existingTokenText = getNormalizedTokenText(existingToken);

                // we have seen this token before and it has not changed since the last time
                // nothing to do
                    if (existingTokenText === nodeText) {
                        continue;
                    }

                // adding to whitespaces in the middle of a token does not
                // change the token (e.g. customer<space>region is the
                // same as customer<space><space>region
                    var normalizedNodeText = normalizeWhitespace(nodeText);
                    if (normalizedNodeText === existingTokenText) {
                        continue;
                    }

                // if this is an existing recognized token that has text appended
                // to it we remove the leading/trailing texts and give them their
                // own container
                    if (!existingToken.isUnrecognized()) {
                        if (nodeText.startsWith(existingTokenText)) {
                        // something has been added to the end of an existing
                        // recognized token
                            var suffixText = nodeText.slice(existingTokenText.length),
                                $suffixTokenNode = getNewNodeForText(suffixText);

                            $tokenNode.html(existingTokenText);
                            $suffixTokenNode.insertAfter($tokenNode);
                            continue;

                        } else if (nodeText.endsWith(existingTokenText)) {
                        // something has been added to the front of an existing
                        // recognized token
                            var prefixText = nodeText.slice(0, nodeText.length - existingTokenText.length),
                                $prefixTokenNode = getNewNodeForText(prefixText);

                            $tokenNode.text(existingTokenText);
                            $prefixTokenNode.insertBefore($tokenNode);
                            continue;
                        }
                    }
                }

            // this is either a known old token that has been modified or this is a completely
            // new token that we have not seen before
            // we will re-parse the contents of this token
                var words = nodeText.split(/\s/),
                    wordOffset = 0;

                for (var j=0; j<words.length; j++) {
                    var word = words[j];
                // each word (except the last) represents a whitespace that we
                // eliminated by splitting on whitespace. note that we split
                // on single whitespace so if there are multiple whitespaces
                // each extra whitespace will form a word that is an empty string
                    if (word.length > 0) {
                        var $wrappedNode = getNewNodeForText(word);
                        $wrappedNode.insertBefore($tokenNode);
                    }

                    wordOffset += word.length;
                    if (j !== words.length - 1) {
                        var spaceText = nodeText[wordOffset],
                            $wrappedWhitespace = getNewNodeForText(spaceText);
                        $wrappedWhitespace.insertBefore($tokenNode);
                        wordOffset += spaceText.length;
                    }
                }

                $tokenNode.remove();
            }

        // another pass to merge unrecognized tokens that don't have any spaces between them
            $contents = getEditorNonGhostContent($contentEditor);
            $contents = $contents.not('.' + CssClasses.EMPTY);
            var tokenNodeListsToMerge = util.splitArray($contents, function(node){
                return $(node).is('.{1}, .{2}'.assign(CssClasses.RECOGNIZED_TOKEN, CssClasses.WHITESPACE));
            });
            tokenNodeListsToMerge.each(function(tokenNodeListToMerge){
                if (tokenNodeListToMerge.length < 2) {
                    return;
                }

            // get the concatenated text for all the combined nodes
                var concatenatedText = '';
                tokenNodeListToMerge.each(function(tokenNodeToMergeNode){
                    var $tokenNodeToMerge = $(tokenNodeToMergeNode);
                    concatenatedText += $tokenNodeToMerge.text();
                });
            // add a new unrecognized token for the combined node
                var $wrappedNode = getNewNodeForText(concatenatedText);
                $wrappedNode.insertBefore($(tokenNodeListToMerge[0]));

            // remove all the existing nodes that we combined
                tokenNodeListToMerge.each(function(tokenNodeToMergeNode){
                    var $tokenNodeToMerge = $(tokenNodeToMergeNode);
                    $tokenNodeToMerge.remove();
                });
            });

            logger.debug('editor html after normalization::', $contentEditor.html());
        }

        function updateEditorTokensWithExpressionModel(scope, $contentEditor) {
            removeGhost($contentEditor);

            var removeAll$Nodes = function ($nodesToRemove) {
                $nodesToRemove.each(function($nodeToRemove){
                    $nodeToRemove.remove();
                });
            };

            var newTokens = scope.expressionEditorModel.getNewTokens();
            var sageTokenIndex = 0,
                $editorContent = getEditorNonGhostContent($contentEditor),
                editorTokenIndex = 0,
                unmatchedEditorTokenCount = 0;

            function skipWhitespaceTokens() {
                while (/^\s+$/.test($editorContent.eq(editorTokenIndex).text())) {
                    editorTokenIndex++;
                }
            }

            logger.debug('updateEditorTokensWithExpressionModel', newTokens, newTokens.length, $editorContent, $editorContent.length, $contentEditor.html());

            while (sageTokenIndex < newTokens.length) {
                var sageToken = newTokens[sageTokenIndex++],
                    sageTokenText = getNormalizedTokenText(sageToken),
                    editorTokensToMerge = [],
                    editorTokensToMergeText = '',
                    matched = false;

                skipWhitespaceTokens();

                while (editorTokenIndex < $editorContent.length) {
                    var $editorToken = $editorContent.eq(editorTokenIndex);
                    editorTokensToMerge.push($editorToken);
                // sage can merge multiple spaces into one. e.g. if the editor has customer<space><space>region
                // sage will return a recognized token with text customer<space>region
                // TODO(sunny): this can fail in cases where customer<space>region and customer<space><space>region
                // both are valid tokens
                    editorTokensToMergeText += $editorToken.text();
                // we have to do the normalization each time as multiple contiguous spaces will be encountered
                // one space at a time
                    editorTokensToMergeText = normalizeWhitespace(editorTokensToMergeText);

                    if (editorTokensToMergeText.toLowerCase() === sageTokenText.toLowerCase()) {
                    // more than one editor tokens match the current sage token
                    // we'll merge them into one token in the editor
                        if (editorTokensToMerge.length > 1) {
                        // note that we want to preserve possible multiple whitespaces here
                        // unlike while matching with sage tokens above because we don't
                        // want to alter the text in the editor
                            editorTokensToMergeText = editorTokensToMerge.map('text').join('');

                            var $mergedEditorToken = getNewNodeForToken(sageToken, editorTokensToMergeText);
                            $mergedEditorToken.insertBefore(editorTokensToMerge[0]);

                            removeAll$Nodes(editorTokensToMerge);

                        } else if (editorTokensToMerge.length === 1) {
                        // sage token matched exactly one editor token, we just update whether the token is recognized

                            var $editorTokenToMerge = editorTokensToMerge[0];
                            updateTokenForTokenNode($editorTokenToMerge, sageToken);

                        } else {
                            logger.warn('editorTokensToMerge is empty');
                        }

                        editorTokenIndex++;
                    // we ignore whitespaces after a matched token as sage tokens never start
                    // with a whitespace
                    // TODO(sunny): verify if this assumption is correct. How will it work if there
                    // are tokens in the data/metadata with a leading space
                        skipWhitespaceTokens();

                    // current sage token has been matched, go to next sage token
                        matched = true;
                        break;

                    } else if (editorTokensToMergeText.toLowerCase().indexOf(sageTokenText.toLowerCase()) === 0) {
                    // this handles the case where a single editor token was split into
                    // two by sage (e.g. "rev-" => ["rev", "-"]
                    // OR ["customer", "region,"] => ["customer region", ","]
                    // this is complementary case of the one handled above by merging tokens
                        var $prefix = getNewNodeForToken(sageToken);
                        $prefix.insertBefore($editorToken);

                    // remove all but the last of the tokens to merge, update the
                    // last token to be merged to carry the suffix that was not
                    // matched by the sage token
                        for (var index=0; index<editorTokensToMerge.length; index++) {
                            var $token = $(editorTokensToMerge[index]);
                            if (index < editorTokensToMerge.length - 1) {
                                $token.remove();
                            } else {
                                $token.text(editorTokensToMergeText.substring(sageTokenText.length));
                            }
                        }

                    // don't increment editor token index, we still have suffix of editor token
                    // to process
                        matched = true;
                        break;
                    } else {
                        editorTokenIndex++;
                        unmatchedEditorTokenCount++;
                    }
                }

                if (!matched && !/^\s+$/.test(sageTokenText)) {
                // we ran out of editor tokens before all sage tokens could be matched
                    logger.debug('ran out of editor tokens before sage tokens', newTokens, $editorContent.html(), unmatchedEditorTokenCount);

                // in case of filling up the tokens for an already existing expression
                // there will be no tokens in the editor and we'll add all the sage
                // tokens to the editor
                    if (unmatchedEditorTokenCount === 0) {
                        var $newToken = getNewNodeForToken(sageToken);
                        $newToken.appendTo($contentEditor);

                        if (sageToken.getHasSpaceAfter()) {
                            var $whitespaceToken = getNewNodeForText(' ');
                            $whitespaceToken.appendTo($contentEditor);
                        }
                    } else {
                        logger.warn('mismatch between sage tokens and editor tokens, ' +
                        'some of the editor tokens did not have corresponding sage tokens');
                    }

                }
            }

            if (editorTokenIndex < $editorContent.length - 1) {
            // even after matching all sage tokens we are still left with editor tokens
                logger.warn('unexpected mismatch between sage and editor tokens, too few sage tokens');
                return;
            }

            updateErrorsWithSageResponse(scope, $contentEditor);
            updateGhostWithSageResponse(scope, $contentEditor);

        }

        function updateErrorsWithSageResponse(scope, $contentEditor) {
        // remove classes on any existing tokens
            var currentlyHighlightedSelector = '.{1}, .{2}'.assign(CssClasses.TOKEN_ERROR, CssClasses.TOKEN_WARNING),
                $currentlyHighlighted = $contentEditor.find(currentlyHighlightedSelector);
            $currentlyHighlighted.removeClass(CssClasses.TOKEN_ERROR + ' ' + CssClasses.TOKEN_WARNING);

            var $sageTokenNodes;
        // when join path disambiguation is going on the token that is currently being disambiguated
        // will have the warning state regardless of the position set in the sage response error
        // this is because multiple tokens can be the "current working token" during a multi
        // step MJP resolution process
            if (!!joinDisambiguationHelper) {
                var currentWorkingToken = joinDisambiguationHelper.getWorkingTokenIndex();

                $sageTokenNodes = getSageTokenNodes($contentEditor);
                $sageTokenNodes.eq(currentWorkingToken).addClass(CssClasses.TOKEN_WARNING);
                return;
            }

            var errorInfo = scope.expressionEditorModel.getCompletionError();
            if (!!errorInfo) {
                var errorClass = '';
                switch (errorInfo.severity) {
                    case sage.ErrorSeverity.ERROR:
                        errorClass = CssClasses.TOKEN_ERROR;
                        break;
                    case sage.ErrorSeverity.WARNING:
                        errorClass = CssClasses.TOKEN_WARNING;
                        break;
                    default:
                        break;
                }

                if (errorClass) {
                    $sageTokenNodes = getSageTokenNodes($contentEditor);
                    for (var i=errorInfo.errorMessagePosition; i<errorInfo.errorMessagePosition + errorInfo.errorSpan; i++) {
                        $sageTokenNodes.eq(i).addClass(errorClass);
                    }
                }
            }
        }

        function updateGhostWithSageResponse(scope, $contentEditor) {
        // no ghost if the editor is empty
            var $sageTokenNodes = getSageTokenNodes($contentEditor);
            if ($sageTokenNodes.length === 0) {
                return;
            }

            var ghostTokens = scope.expressionEditorModel.getGhostTokens();

            logger.debug('ghostTokens', ghostTokens);

            var topQueryCompletionText = ghostTokens.map(function(token, index) {
                    var text = getNormalizedTokenText(token);
                    if (index < ghostTokens.length - 1 && token.getHasSpaceAfter()) {
                        text += ' ';
                    }
                    return text;
                }).join(''),
                editorTextNormalized = normalizeWhitespace($contentEditor.text().trimLeft());

            if (normalizeWhitespace(topQueryCompletionText).indexOf(editorTextNormalized) !== 0) {
                logger.warn('editor query is not a prefix of sage query, hiding ghost',
                topQueryCompletionText.replace(/\s/g, '<s>'),
                editorTextNormalized.replace(/\s/g, '<s>'));
                return;
            }

            if (!$contentEditor.contents().last().hasClass(CssClasses.GHOST_SEPARATOR)) {
            // we need to add an empty whitespace to ensure that cursor is
            // not lost due to read-only nature of ghost tokens
                var $emptyText = getNewNodeForText('');
            // add a special class to distinguish this empty space token from
            // other empty space tokens that might be in the non-ghost part
            // of the editor. this is to ease the process of excluding this
            // token from valid sage token filtering by simply looking up
            // for the class
                $emptyText.addClass(CssClasses.GHOST_SEPARATOR);
                $contentEditor.append($emptyText);
            }

            var ghostText = topQueryCompletionText.substr(editorTextNormalized.length),
                $ghost = getNewGhostNode(ghostText);

            $ghost.data(GHOST_COMPLETION_TEXT_DATA_KEY, topQueryCompletionText);
            $contentEditor.append($ghost);
        }

        function getNodeUnderCursor(onTokensOnly) {
            var selection = window.getSelection();
            if (selection.rangeCount === 0) {
                logger.warn('no selection present');
                return null;
            }

            var range = selection.getRangeAt(0),
                cursorHostNode = range.commonAncestorContainer,
                $cursorHostNode = $(cursorHostNode);

        // if the cursor is at the end of the text host node is set to be the parent
            if ($cursorHostNode.hasClass(CssClasses.CONTENT_EDITOR)) {
                return {
                    node: cursorHostNode,
                    offsetInNode: $cursorHostNode.text().length
                };
            }

        // cursor could either be on a token or a whitespace
            var $tokenNode = onTokensOnly ? $cursorHostNode.closest('.' + CssClasses.TOKEN) : $cursorHostNode;
            if ($tokenNode.length === 0) {
                logger.warn('cursor position could not be found, no valid node found');
                return null;
            }

            return {
                node: $tokenNode[0] ,
                offsetInNode: range.startOffset
            };
        }

        function getNearestSageTokenNodeForTokenNode($contentEditor, $tokenNode) {
            var $next = $tokenNode, $prev = $tokenNode;
            while (($next.length > 0 || $prev.length > 0)  && !isSageTokenNode($next) && !isSageTokenNode($prev)) {
                $next = $next.next();
                $prev = $prev.prev();
            }

            if (isSageTokenNode($next)) {
                return {
                    $nearestToken: $next,
                    isAfter: true
                };
            }
            if (isSageTokenNode($prev)) {
                return {
                    $nearestToken: $prev,
                    isAfter: false
                };
            }
            return null;
        }

        function getSageTokenNodeUnderCursor($contentEditor) {
            var cursorPosition = getNodeUnderCursor(true);
            if (!cursorPosition) {
                logger.warn('cursor is not inside content editor');
                return null;
            }

            var currentlyEditedTokenIndex = -1,
                offsetInNode = cursorPosition.offsetInNode,
                $sageTokenNodes = getSageTokenNodes($contentEditor);

        // cursor node == editor <=> cursor is at the end
            if (cursorPosition.node == $contentEditor[0]) {
                currentlyEditedTokenIndex = $sageTokenNodes.length - 1;
                offsetInNode = $sageTokenNodes.last().text().length;
            } else {

                var $node = $(cursorPosition.node),
                    validSageToken = '.{1},.{2}'.assign(CssClasses.RECOGNIZED_TOKEN, CssClasses.WHITESPACE),
                    unrecognizedTokenWithoutSpace ='.{1}:not(.{2})'
                        .assign(CssClasses.UNRECOGNIZED_TOKEN, CssClasses.WHITESPACE);

                logger.debug('$node with cursor', $node, $node.nextAll(sageTokeNodeSelector).length, offsetInNode === $node.text().length, $sageTokenNodes, $sageTokenNodes.length);

                // 1. if carets is  <tokens>| or  <tokens> <whitespaces>| and that there
                // are no unrecognized tokens before the caret, we are allowed
                // to ask sage for an new token
                // 2. Otherwise we use
                // 2a currently edited token if there is any
                // 2b nearest token, and we set the offset at the end of the token
                if ($node.is(validSageToken)
                && $node.nextAll(sageTokeNodeSelector).length === 0
                && offsetInNode === $node.text().length
                && $node.prevAll(unrecognizedTokenWithoutSpace).length == 0) {
                    currentlyEditedTokenIndex = $sageTokenNodes.length;
                    offsetInNode = 0;
                } else {
                    var nearestSageTokenInfo = getNearestSageTokenNodeForTokenNode($contentEditor, $(cursorPosition.node));
                    if (!nearestSageTokenInfo) {
                        logger.debug('no nearby sage token for the current node under cursor');
                        return null;
                    }

                    var $nearestSageToken = nearestSageTokenInfo.$nearestToken,
                        isAfter = nearestSageTokenInfo.isAfter;

                    currentlyEditedTokenIndex = $sageTokenNodes.index($nearestSageToken);
                // if the current node with cursor is not a valid sage toke node
                // we assume that the cursor in the closest valid sage token node
                // is at the end of it
                    if ($nearestSageToken[0] !== cursorPosition.node) {
                        offsetInNode = isAfter ? 0 : $nearestSageToken.text().length;
                    }
                }
            }

            return {
                currentlyEditedTokenIndex: currentlyEditedTokenIndex,
                offsetInTokenText: offsetInNode
            };
        }

        function getCurrentInputText($contentEditor) {
            return $contentEditor.text();
        }

        function addNewTokenForTokenNode($tokenNode, token) {
            var tokenId = $tokenNode.data(TOKEN_ID_DATA_KEY);
            if (tokenId && Object.has(sageTokenIdToToken, tokenId)) {
                logger.warn('error creating new unrecognized token, a token with same id already exists', tokenId);
                return null;
            }

            tokenId = ++currentRunningTokenId;
            logger.debug('adding to cache token with tokenId', tokenId);

            $tokenNode.data(TOKEN_ID_DATA_KEY, tokenId);
            sageTokenIdToToken[tokenId] = token;

            $tokenNode.on('remove', function(){
                removeTokenForTokenNode($tokenNode);
            });

            updateTokenForTokenNode($tokenNode, token);
        }

        function removeTokenForTokenNode($tokenNode) {
            var tokenId = $tokenNode.data(TOKEN_ID_DATA_KEY);
            if (!tokenId) {
                logger.warn('error in removing token for token node, node does not have token id', tokenId);
                return;
            }
            logger.debug('deleting token from cache with tokenId', tokenId);
            delete sageTokenIdToToken[tokenId];
        }

        function getTokenForTokenNode($tokenNode) {
            var tokenId = $tokenNode.data(TOKEN_ID_DATA_KEY);
            return sageTokenIdToToken[tokenId];
        }

        function updateTokenForTokenNode($tokenNode, token) {
            var tokenId = $tokenNode.data(TOKEN_ID_DATA_KEY);
            if (!Object.has(sageTokenIdToToken, tokenId)) {
                logger.warn('tokenId to update not found in cache', tokenId, token);
            }
            sageTokenIdToToken[tokenId] = token;

            var isRecognized = !token.isUnrecognized();
        // a recognized token is always followed by a whitespace to ensure that anything
        // appended after it is considered a new token
            if (isRecognized && !$tokenNode.next().has(CssClasses.EMPTY_WHITESPACE)) {
                var $emptyWhitespace = getNewNodeForText(' ');
                $emptyWhitespace.insertAfter($tokenNode);
            }

            if (isRecognized) {
                $tokenNode.removeClass(CssClasses.UNRECOGNIZED_TOKEN);
                $tokenNode.addClass(CssClasses.RECOGNIZED_TOKEN);
            } else {
                $tokenNode.addClass(CssClasses.UNRECOGNIZED_TOKEN);
                $tokenNode.removeClass(CssClasses.RECOGNIZED_TOKEN);
            }
            if (token.isAttributeToken()) {
                $tokenNode.addClass(CssClasses.ATTRIBUTE_TOKEN);
            } else if (token.isMeasureToken()) {
                $tokenNode.addClass(CssClasses.MEASURE_TOKEN);
            }

        // TODO (sunny): this will break if a token changes
        // display type (e.g. function name becomes column
        // name
            var displayCssClass = expressionUtil.getTokenDisplayCSSClass(token);
            $tokenNode.addClass(displayCssClass);

            if (token.isDataToken()) {
                $tokenNode.mouseenter(function(event) {
                    $rootScope.$broadcast(events.SHOW_EXPRESSION_EDITOR_TOOLTIP, $tokenNode,
                    new util.NameValuePairs(token.getTokenMetaInfo()).getTemplate(), event);
                });
                $tokenNode.mouseleave(function() {
                    $rootScope.$broadcast(events.HIDE_EXPRESSION_EDITOR_TOOLTIP);
                });
            }
        }

        function isSageTokenNode($node) {
            return $node.is(sageTokeNodeSelector);
        }

        function getSageTokenNodes($contentEditor) {
        // TODO(sunny): cache this result
            return $contentEditor.find(sageTokeNodeSelector);
        }

        function getSageTokens($contentEditor) {
            var $tokenNodes = getSageTokenNodes($contentEditor),
                tokens = $.map($tokenNodes, function(node, index){
                    return getTokenForTokenNode($(node));
                });
            return tokens;
        }

        function isEditorEmpty($contentEditor) {
            var sageTokens = getSageTokenNodes($contentEditor);
            return sageTokens.length === 0;
        }

        function updateJoinPathDisambiguationHelper(scope, $contentEditor) {
            var tokens = scope.expressionEditorModel.getNewTokens(),
                joinPathAmbiguities = scope.expressionEditorModel.getJoinPathAmbiguities();

            if (!joinPathAmbiguities || !joinPathAmbiguities.length) {
                logger.debug('no join path ambiguities, skipping instantiating helper');
                joinDisambiguationHelper = null;
                return;
            }

            joinDisambiguationHelper = new JoinDisambiguationHelper({
                joinPathCollections: joinPathAmbiguities,
                tokens: tokens,
                documentTokens: []
            }, JoinDisambiguationHelper.modes.EMBEDDED_IN_SAGE, function (resolvedTokens) {
                logger.debug('joinDisambiguationHelper resolvedTokens', resolvedTokens);
                scope.expressionEditorModel.setNewTokens(resolvedTokens);
                scope.expressionEditorModel.clearCompletionError();
                handleexpressionEditorModelChange(scope, $contentEditor);
                joinDisambiguationHelper = null;
            });
            joinDisambiguationHelper.init();

            scope.expressionEditorModel.setCompletionTokenPosition(joinDisambiguationHelper.getWorkingTokenIndex());
            updateErrorsWithSageResponse(scope, $contentEditor);
        }

        function updateCurrentSuggestions(scope) {
            if (joinDisambiguationHelper) {

                var currentQuestion = joinDisambiguationHelper.getCurrentQuestion();
                if (!currentQuestion) {
                    currentSuggestions = [];
                    return;
                }

                var currentTokenIndex = joinDisambiguationHelper.getWorkingTokenIndex(),
                    allCurrentTokens = scope.expressionEditorModel.getNewTokens(),
                    currentToken = allCurrentTokens[currentTokenIndex];

                currentSuggestions =
                ExpressionSuggestion.createSuggestionsFromJoinDisambiguationHelper(joinDisambiguationHelper, currentToken);

            } else {
                var tokenCompletions = scope.expressionEditorModel.getTokenCompletions();
                currentSuggestions = ExpressionSuggestion.createSuggestionsFromTokenCompletions(tokenCompletions);
            }
        }

        function incrementActiveCompletionIndex(scope) {
            activeCompletionIndex = (activeCompletionIndex + currentSuggestions.length + 1)%currentSuggestions.length;
        }

        function decrementActiveCompletionIndex(scope) {
            activeCompletionIndex = (activeCompletionIndex + currentSuggestions.length - 1)%currentSuggestions.length;
        }

        function onEditorInputChange(scope, $contentEditor) {
            logger.debug('input change', $contentEditor.html());

            logger.debug('normalizing editor html');
            doOperationWithCursorPreserved($contentEditor, function(){
                normalizeEditorHTML($contentEditor);
            });
            logger.debug('normalized editor html', $contentEditor.html());

        // while the text does not change the index of the token with
        // cursor might have changed
            updateTokenUnderCursorState(scope, $contentEditor);

            scope.syncModelWithSage(scope.getSageTokens());

        // we don't want to wait for sage response to arrive, things like
        // the position of suggestions dropdown will have to be updated
        // before sage returns
            safeApply(scope);
            isInputChangeProcessingPending = false;
        }

        function autoFillWithTokenCompletion(scope, $contentEditor, tokenCompletionIndex) {
        // this ensures that we don't add the same token twice if the user quickly
        // presses the tab twice or clicks on a suggestion twice
            if (isInputChangeProcessingPending || scope.isRemoteCallPending) {
                return;
            }

            if (!!joinDisambiguationHelper) {
                var currentQuestion = joinDisambiguationHelper.getCurrentQuestion();
                currentQuestion.selectedOption = currentQuestion.options[tokenCompletionIndex];
                var nextChoices = joinDisambiguationHelper.pruneChoicesAndUpdateQuestion(currentQuestion.selectedOption);
                if (!!nextChoices) {
                // there are more steps in disambiguation, we need to place
                // the suggestions and the token highlighting at the correct
                // place
                    updateCurrentSuggestions(scope);
                    scope.expressionEditorModel.setCompletionTokenPosition(joinDisambiguationHelper.getWorkingTokenIndex());
                    updateErrorsWithSageResponse(scope, $contentEditor);
                } else {
                // disambiguation has finished, place cursor at the end of
                // all the tokens and sync with sage and callosum
                    joinDisambiguationHelper = null;
                    scope.expressionEditorModel.setCompletionTokenPosition(-1);
                    scope.syncModelWithSage(scope.getSageTokens());
                }
                safeApply(scope);
                return;
            }

        // no sage completions, nothing to auto complete with
            var tokenCompletions = scope.expressionEditorModel.getTokenCompletions();
            if (!tokenCompletions || tokenCompletions.length === 0) {
                return;
            }

            removeGhost($contentEditor);

            var tokenCompletion = tokenCompletions[tokenCompletionIndex],
                $sageTokenNodes = getSageTokenNodes($contentEditor),
                numTokensToReplace = tokenCompletion.getNumTokensToReplace(),
                completionTokenPosition = scope.expressionEditorModel.getCompletionTokenPosition(),
                $replacementStartTokenNode = $sageTokenNodes.eq(completionTokenPosition),
                $replacementEndTokenNode = $sageTokenNodes.eq(completionTokenPosition + numTokensToReplace - 1);

            var $autoCompleteNode = getNewNodeForToken(tokenCompletion.getRecognizedToken()),
                $whitespaceNodeBefore;

        //this can happen if a token is to be added at the end of the current input
            if ($replacementStartTokenNode.length === 0) {

            //in case of suggestions for empty editor there is no need to add a whitespace
                if ($sageTokenNodes.length > 0) {
                    $whitespaceNodeBefore = getNewNodeForText(' ');
                    $whitespaceNodeBefore.insertAfter($sageTokenNodes.last());
                    $autoCompleteNode.insertAfter($whitespaceNodeBefore);
                } else {
                //there are no sage tokens, just append
                    $autoCompleteNode.prependTo($contentEditor);
                }

            } else {

                if ($replacementStartTokenNode.hasClass(CssClasses.WHITESPACE)) {
                    $whitespaceNodeBefore = getNewNodeForText(' ');
                    $whitespaceNodeBefore.insertBefore($replacementStartTokenNode);
                }

                $autoCompleteNode.insertBefore($replacementStartTokenNode);
            }

        // replace all the nodes (including whitespaces) between
        // (and including) the token nodes that need to be replaced
            if (numTokensToReplace > 0) {
                var $nodesToReplace = $replacementStartTokenNode,
                    $sageTokenNextSiblings = $replacementStartTokenNode.nextAll();
                $nodesToReplace = $nodesToReplace.add($sageTokenNextSiblings);

                for (var i= 0; i<$nodesToReplace.length; i++) {
                    var $node = $nodesToReplace.eq(i);
                    if ($node[0] === $replacementEndTokenNode[0]) {
                        $node.remove();
                        break;
                    }
                    $node.remove();
                }
            }

        //insert a whitespace after the new token iff there isn't already a whitespace
        //after it (after all tokens to remove have been removed)
            var $whitespaceNodeAfter = $autoCompleteNode.next();
            if (!$whitespaceNodeAfter.hasClass(CssClasses.WHITESPACE)) {
                $whitespaceNodeAfter = getNewNodeForText(' ');
                $whitespaceNodeAfter.insertAfter($autoCompleteNode);
            }

            setCursorAfterNode($whitespaceNodeAfter);
            onEditorInputChange(scope, $contentEditor);
        }

        function handleEnterKeyPress(scope, $contentEditor, event) {
            var cursorPosition = getNodeUnderCursor(true);
            if (!cursorPosition) {
                logger.warn('cursor not inside editor when enter key was pressed, weird!');
                return;
            }
            if (cursorPosition.node === $contentEditor[0]) {
            // not inside any token, append a new line to the end
                var $lineBreakToken = getNewNodeForText('\n');
                $contentEditor.append($lineBreakToken);
            } else {
            // inside a token (in the middle or at its extremes) add a new line character
            // and normalization will take care of splitting it up properly (just like it
            // does for whitespaces)
                replaceSelection('\n');
            }

            onEditorInputChange(scope, $contentEditor);
        }

        function handleTabKeyPress(scope, $contentEditor, event) {
            event.preventDefault();
            autoFillWithTokenCompletion(scope, $contentEditor, 0);
        }

        function handleEscapeKeyPress(scope, $contentEditor, event) {
            event.preventDefault();
            contextMenuHiddenUntilNextSuggestion = true;
        }

        function shouldDelegateEditorKeyEventToContextMenu(keyCode) {
            return [$.ui.keyCode.ENTER, $.ui.keyCode.UP, $.ui.keyCode.DOWN].some(keyCode);
        }

        function onEditorKeyDown(scope, $contentEditor, event) {
            var keyCode = event.keyCode || event.which;
            if (keyCode === $.ui.keyCode.ESCAPE) {
                handleEscapeKeyPress(scope, $contentEditor, event);
                return;
            }

            if (keyCode === $.ui.keyCode.TAB) {
                handleTabKeyPress(scope, $contentEditor, event);
                return;
            }

            var $contextMenu = getContextMenu($contentEditor);
            if ($contextMenu.is(':visible') && shouldDelegateEditorKeyEventToContextMenu(keyCode)) {
                event.preventDefault();
                $contextMenu.triggerHandler(event);
                return;
            }

            switch (keyCode) {
                case $.ui.keyCode.ENTER:
                    event.preventDefault();
            // Note(sunny): disabling multiline input for first version of expression(formula)
            // handleEnterKeyPress(scope, $contentEditor, event);
                    break;
            }
        }

        function updateTokenUnderCursorState(scope, $contentEditor) {
        // changing cursor position while disambiguation workflow is on
        // does not have any effect (e.g. the working token does not change)
            if (!!joinDisambiguationHelper) {
                return;
            }

        // we do not interfere if the user is in the process of selecting
        // a part of text (e.g. for deleting a range of tokens)
            if (isEditorTextSelected()) {
                return;
            }

            var cursorPosition = getSageTokenNodeUnderCursor($contentEditor);
            logger.debug('updateTokenUnderCursorState cursorPosition', cursorPosition);

            if (!cursorPosition) {
                logger.warn('cursor not found in editor after click in editor!');
                lastKnownCursorPosition = {
                    currentlyEditedTokenIndex: -1,
                    offsetInTokenText: 0
                };
            } else {
            // the interpretation of cursor/completion position (in terms of the index of the token with cursor) can
            // differ between sage and blink for the same text. e.g. in case of errors sage will change the
            // completion position to be the first token with error or in case of an unrecognized token with
            // a trailing space and cursor after it, blink will treat whitespace as the token that has the cursor
            // but sage will return a response with completion position to be the non-white (unrecognized token)
            // to have a blanket fix for all such cases we make sure that we define "change" in cursor position
            // as compared to our last known state and not what sage's interpretation is (SCAL-5803)
                if (lastKnownCursorPosition &&  angular.equals(lastKnownCursorPosition, cursorPosition)) {
                    logger.debug('cursor at the same place as last known cursor position ignoring cusror change alert',
                    cursorPosition, lastKnownCursorPosition);
                    return;
                }

                lastKnownCursorPosition = cursorPosition;
                onEditorInputChange(scope, $contentEditor);
            }
        }

        function handleCursorStateChange(scope, $contentEditor, event) {
            updateTokenUnderCursorState(scope, $contentEditor);
        }

        function onContextMenuKeyDown(scope, $contextMenu, $event) {
            var keyCode = $event.keyCode || $event.which;
            switch (keyCode) {
                case $.ui.keyCode.DOWN:
                    incrementActiveCompletionIndex(scope);
                    safeApply(scope);
                    break;
                case $.ui.keyCode.UP:
                    decrementActiveCompletionIndex(scope);
                    safeApply(scope);
                    break;
                case $.ui.keyCode.ENTER:
                    scope.onCompletionClick($event, activeCompletionIndex);
                    break;
            }
        }

        function onEditorInputChangeUnDebounced(scope, $contentEditor, event) {
            uiVersionCounter++;
            isInputChangeProcessingPending = true;
            updateGhostOnContentChange($contentEditor);
            safeApply(scope);
        }

        function handleexpressionEditorModelChange(scope, $contentEditor) {
            activeCompletionIndex = 0;

            var queryTokens = scope.expressionEditorModel.getNewTokens();
            queryTokens.each(function(queryToken){
                var tokenId = ++currentRunningTokenId;
                sageTokenIdToToken[tokenId] = queryToken;
            });

            doOperationWithCursorPreserved($contentEditor, function(){
                updateEditorTokensWithExpressionModel(scope, $contentEditor);
            });

        // SCAL-9822 at this point the last known cursor position could be no longer correct, e.g
        // two tokens were merged by the normalization process, so we recompute it to prevent
        // a request to sage that in turns resets the dropdown list
            var newCursorPosition = getSageTokenNodeUnderCursor($contentEditor);

            if (newCursorPosition) {
                lastKnownCursorPosition = newCursorPosition;
            } else {
                lastKnownCursorPosition = {
                    currentlyEditedTokenIndex: -1,
                    offsetInTokenText: 0
                };
            }

            updateJoinPathDisambiguationHelper(scope, $contentEditor);
            updateCurrentSuggestions(scope);

            contextMenuHiddenUntilNextSuggestion = false;
            updateContextMenuPosition(scope, $contentEditor);
        }

        function exampleTreeLevelFormatter (valueList, level) {
        // examples is level 2 in our data
            if (level != 2) {
                return null;
            }

            var data = {};
            valueList.each(function(item){
                data[item.type] = item.value;
            });

            return {
                templateUrl: 'src/modules/formula-editor/formula-examples/formula-examples-example-section.html',
                data: data
            };
        }

        function initializeScope(scope, $expressionEditor, $contentEditor) {

            scope.shouldShowContextMenu = function () {
                return !contextMenuHiddenUntilNextSuggestion
                && currentSuggestions && currentSuggestions.length > 0;
            };

            scope.getSageTokens = function () {
                return getSageTokens($contentEditor);
            };

            scope.getCurrentInputText = function () {
                return getCurrentInputText($contentEditor);
            };

            scope.getSuggestionsForCurrentCursor = function () {
                return currentSuggestions;
            };

            scope.setActiveCompletionIndex = function (index) {
                activeCompletionIndex = index;
            };

            scope.getActiveCompletionIndex = function () {
                return activeCompletionIndex;
            };

            scope.isActiveCompletionIndex = function (index) {
                return activeCompletionIndex === index;
            };

            scope.onCompletionClick = function ($event, index) {
                $event.stopImmediatePropagation();
                $event.preventDefault();
                autoFillWithTokenCompletion(scope, $contentEditor, index);
            };

            scope.onCompletionMouseDown = function ($event) {
            // this prevents the editor from losing focus because of
            // a click on a suggestion
                $event.preventDefault();
                $event.stopPropagation();
            };

            scope.onCompletionMouseOver = function ($event, index) {
                if (index != activeCompletionIndex) {
                    activeCompletionIndex = index;
                }
            };

            scope.getCurrentTokenWithSuggestions = function () {
                return scope.getSageTokens()[scope.expressionEditorModel.getCompletionTokenPosition()];
            };

            scope.getHeaderType = function () {
                var completionError = scope.expressionEditorModel.getCompletionError();
                if (!!completionError) {
                    return completionError.severity ==
                sage.ErrorSeverity.ERROR ? 'ErrorQueryCompletion' : 'WarnQueryCompletion';
                }

                var sageTokenNodeWithCompletion = scope.getCurrentTokenWithSuggestions();
                if (sageTokenNodeWithCompletion && sageTokenNodeWithCompletion.canEditJoinPath()) {
                    return 'EditJoinPath';
                }

                return '';

            };

            scope.requestJoinPathEdit = function () {
                var sageTokenWithCompletion = scope.getCurrentTokenWithSuggestions();
                if (!sageTokenWithCompletion) {
                    logger.warn('requestJoinPathEdit:: no token under cursor');
                    return;
                }
                if (!sageTokenWithCompletion.canEditJoinPath()) {
                    logger.warn('requestJoinPathEdit:: token under cursor does not allow join path edit', sageTokenWithCompletion);
                    return;
                }
                sageTokenWithCompletion.setExplicitJoinPathEdit(true);
                scope.syncModelWithSage(scope.getSageTokens(), function(){
                    sageTokenWithCompletion.setExplicitJoinPathEdit(false);
                });
            };

            scope.$watch('expressionEditorModel', function(newModel, oldModel){
            // if the new model is the same as the old model it means
            // we are being initialized with a new model, we want
            // automatically sync with sage and callosum once
            // so that we have logical column from callosum
            // and can enable the "update formula" button
            // without the user having to click inside the
            // editor
                if (!!newModel && newModel === oldModel) {
                    scope.syncModelWithSage(newModel.getNewTokens(), function() {
                        handleexpressionEditorModelChange(scope, $contentEditor);
                    });
                } else {
                    handleexpressionEditorModelChange(scope, $contentEditor);
                }
            });

            scope.getUIVersionNumber = function () {
                return uiVersionCounter;
            };

            scope.getCursorPosition = function () {
                return lastKnownCursorPosition;
            };

            scope.advancedSettingsPanelShowing = false;
            scope.examplesPanelShowing = false;
            scope.exampleTreeLevelFormatter = exampleTreeLevelFormatter;

        }

        function linker(scope, $el, attrs) {
            var $contentEditor = $el.find('.' + CssClasses.CONTENT_EDITOR),
                $contextMenu = $el.find('.' + CssClasses.CONTEXT_MENU);

            initializeScope(scope, $el, $contentEditor);
            updateContextMenuPosition(scope, $contentEditor);

            $contentEditor.on('keydown.expression-editor', angular.bind($contentEditor[0], onEditorKeyDown, scope, $contentEditor));
            $contentEditor.on('click.expression-editor, keydown.expression-editor, paste.expression-editor, focus.expression-editor',
            util.debounce(angular.bind(null, handleCursorStateChange, scope, $contentEditor), 100));
            $contextMenu.on('keydown.expression-editor', angular.bind(null, onContextMenuKeyDown, scope, $contextMenu));

            if (blink.app.isIE) {
                $contentEditor.on('DOMCharacterDataModified.expression-editor', util.debounce(angular.bind(null, onEditorInputChange, scope, $contentEditor), 100));
                $contentEditor.on('DOMCharacterDataModified.expression-editor', angular.bind(null, onEditorInputChangeUnDebounced, scope, $contentEditor));
            } else {
                $contentEditor.on('input.expression-editor', util.debounce(angular.bind(null, onEditorInputChange, scope, $contentEditor), 100));
                $contentEditor.on('input.expression-editor', angular.bind(null, onEditorInputChangeUnDebounced, scope, $contentEditor));
            }

            scope.$on('$destroy', function(){
                $contentEditor.off('keyup.expression-editor');
                $contentEditor.off('input.expression-editor');
                $contentEditor.off('DOMCharacterDataModified.expression-editor');
                $contentEditor.off('click.expression-editor');
                $contextMenu.off('keydown.expression-editor');
            });

            scope.hideContextMenu = function(){
                contextMenuHiddenUntilNextSuggestion = true;
            };
        }

        return {
            restrict: 'EA',
            replace: true,
            link: linker,
            templateUrl: 'src/modules/expression-editor/expression-editor.html',
            controller: 'ExpressionEditorController',
            scope: {
                expressionEditorModel: '=',
                onValidExpression: '&',
                onInvalidExpression: '&'
            }
        };

    }]);
