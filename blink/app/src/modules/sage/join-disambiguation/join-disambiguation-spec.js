/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Spec of <join-disambiguation> component
 */

'use strict';
/* eslint camelcase: 1 */

describe('JoinDisambiguationController', function () {
    function getLTRLinkComponents(link) {
        var linkAndName = link.split(':'),
            parentAndChild = linkAndName[0].split('->');

        return {
            parent: parentAndChild[0].trim(),
            child: parentAndChild[1].trim(),
            linkName: linkAndName[1]
        };
    }

    function getRTLLinkComponents(link) {
        var linkAndName = link.split(':'),
            parentAndChild = linkAndName[1].split('<-');

        return {
            parent: parentAndChild[1].trim(),
            child: parentAndChild[0].trim(),
            linkName: linkAndName[0]
        };
    }

    function parseAndCreateJoinPath(pathString, getLinkComponents, reverse) {
        reverse = reverse || false;

        var links = reverse ? pathString.split(',').reverse() : pathString.split(','),
            root = getLinkComponents(links[0]).parent,
            leaf = getLinkComponents(links[links.length - 1]).child,
            joins = links.map(function (link) {
                var comp = getLinkComponents(link);
                return new sage.Join.create(comp.linkName, comp.parent, comp.child);
            });

        return sage.JoinPath.create(root, leaf, joins);
    }

    function createJoinPathCollection(choices, tokens, rootIndex, affectedTokenList) {
        if (rootIndex === void 0) {
            rootIndex = 0;
        }

        choices = choices.map(function (choice) {
            var candidate = new sage.JoinPathChoice();

            var choiceParts = choice.split('|'),
                leftPart = choiceParts[0].trim(),
                rightPart = choiceParts[1].trim();

            if (leftPart && leftPart.length) {
                candidate.setPrependPath(parseAndCreateJoinPath(leftPart, getRTLLinkComponents, true));
                var newTokenPath = sage.JoinPath.create(
                    candidate.getAppendPathForExistingTokens().getRootTableGuid(),
                    candidate.getAppendPathForExistingTokens().getRootTableGuid());
                candidate.setNewTokenPath(newTokenPath);
            }

            if (rightPart && rightPart.length) {
                candidate.setNewTokenPath(parseAndCreateJoinPath(rightPart, getLTRLinkComponents));
                if (!candidate.getAppendPathForExistingTokens()) {
                    var prependPath = sage.JoinPath.create(
                        candidate.getPathForNewToken().getRootTableGuid(),
                        candidate.getPathForNewToken().getRootTableGuid());
                    candidate.setPrependPath(prependPath);
                }
            }

            if (affectedTokenList && affectedTokenList.length) {
                candidate.setAffectedToken(affectedTokenList);
            } else if (candidate.getAppendPathForExistingTokens() && !candidate.getAppendPathForExistingTokens().isEmpty()) {
                var affectedIndices = tokens.filter(function (t, idx) {
                    return idx < tokens.length - 1;
                }).map(function (t, idx) {
                    return idx;
                });
                candidate.setAffectedToken(affectedIndices);
            }

            return candidate;
        });

        return new sage.JoinPathCollection({
            new_token_index: tokens.length - 1,
            choice: choices,
            root_index: rootIndex
        });
    }

    function createJoinChoices(tokens, choices, affectedTokenList) {
        // tokens: ['name', 'industry']
        // choices: ['|employer->company:curr employer id', '|employer->company:prev employer id']

        tokens = tokens.map(function (token) {
            if (typeof token !== 'string') {
                token.guid = token.token;
                return token;
            }
            var rt = sage.RecognizedToken.createAttributeToken(token);
            rt.guid = token;
            rt.token_metadata = {
                table: {
                    name: token + ' table'
                }
            };
            return rt;
        });

        var joinPathCollection = createJoinPathCollection(choices, tokens, void 0, affectedTokenList);

        return {
            tokens: tokens,
            joinPathCollections: [
                joinPathCollection
            ]
        };
    }

    var tokensAfterDisambiguation, JoinDisambiguation;
    var basePath = getBasePath(document.currentScript.src);
    var completionCallback = function (resolvedTokens) {
        tokensAfterDisambiguation = resolvedTokens;
    };
    beforeEach(function(done) {
        module('blink.app');
        freshImport(basePath, './join-disambiguation').then((m) => {
            inject();
            JoinDisambiguation = m.JoinDisambiguationComponent;
            done();
        });
    });

    function existingTokenResolved() {
        return tokensAfterDisambiguation[0];
    }

    function doesTokenHaveJoinPathMatching(token, choice, joinPathIndex) {
        joinPathIndex = joinPathIndex || 0;
        var path = parseAndCreateJoinPath(choice, getLTRLinkComponents);
        if (!token.getJoinPaths() || !token.getJoinPaths().length ) {
            return false;
        }

        if (!token.getJoinPaths()[joinPathIndex] && !path) {
            return true;
        }

        if (!token.getJoinPaths()[joinPathIndex] || !path ||
            token.getJoinPaths()[joinPathIndex].join.length !== path.join.length) {
            return false;
        }

        return token.getJoinPaths()[joinPathIndex].join.every(function (join, i) {
            return join.getName() === path.join[i].getName();
        });
    }

    function doesNewTokenHaveJoinPathMatching(choice, newTokenIndex) {
        var newToken = tokensAfterDisambiguation[newTokenIndex];

        return doesTokenHaveJoinPathMatching(newToken, choice);
    }

    function initializeController(tokens, choices, newTokenIndex, affectedTokenList) {
        var input = createJoinChoices(tokens, choices, affectedTokenList);
        if (angular.isDefined(newTokenIndex)) {
            input.joinPathCollections[0].new_token_index = newTokenIndex;
        }
        return input;
    }

    it('should offer single question (direct) choice for employer->company join', function () {
        var input = initializeController(
            ['name', 'industry'],
            [
                '|employer->company:curr employer id',
                '|employer->company:prev employer id'
            ]
        );
        input.tokens[0].addJoinPath(sage.JoinPath.create('employer', 'employer', []));
        let joinDisambiguation= new JoinDisambiguation(input, completionCallback);

        expect(joinDisambiguation.question).not.toBeNull();
        expect(joinDisambiguation.question.terminalToken).toBe('industry');
        expect(joinDisambiguation.question.options.length).toBe(2);
        expect(joinDisambiguation.question.options[0].text).toBe('Industry of Curr employer id');
        expect(joinDisambiguation.question.options[1].text).toBe('Industry of Prev employer id');
        expect(joinDisambiguation.previousSelections.length).toBe(0);

        joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);
        joinDisambiguation.onDone();
        expect(doesNewTokenHaveJoinPathMatching('employer->company:curr employer id',
            input.joinPathCollections[0].new_token_index)).toBeTruthy();
    });

    it('should offer single question (indirect) choice for ref->employer->company join', function () {
        var input = initializeController(
            ['bonus', 'industry'],
            [
                '|ref->employer:referer id,employer->company:curr employer id',
                '|ref->employer:referee id,employer->company:curr employer id'
            ]
        );
        input.tokens[0].addJoinPath(sage.JoinPath.create('ref', 'ref', []));
        let joinDisambiguation = new JoinDisambiguation(input, completionCallback);

        expect(joinDisambiguation.question.terminalToken).toBe('industry');
        expect(joinDisambiguation.question.options.length).toBe(2);
        expect(joinDisambiguation.question.options[0].text).toBe('Industry of Referer id');
        expect(joinDisambiguation.question.options[1].text).toBe('Industry of Referee id');
        expect(joinDisambiguation.previousSelections.length).toBe(0);

        joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);
        joinDisambiguation.onDone();
        expect(doesNewTokenHaveJoinPathMatching('ref->employer:referer id,employer->company:curr employer id',
            input.joinPathCollections[0].new_token_index)).toBeTruthy();
    });

    it('should offer multiple questions for ref->employer->company join', function () {
        var input = initializeController(
            ['bonus', 'industry'],
            [
                '|ref->employer:referer id,employer->company:curr employer id',
                '|ref->employer:referee id,employer->company:curr employer id',
                '|ref->employer:referer id,employer->company:prev employer id',
                '|ref->employer:referee id,employer->company:prev employer id'
            ]
        );
        input.tokens[0].addJoinPath(sage.JoinPath.create('ref', 'ref', []));
        let joinDisambiguation = new JoinDisambiguation(input, completionCallback);

        joinDisambiguation.selectOption(joinDisambiguation.question.options[1]);
        expect(joinDisambiguation.previousSelections.length).toBe(1);
        expect(joinDisambiguation.previousSelections[0].text).toBe('Industry of Prev employer id');

        expect(joinDisambiguation.question.terminalToken).toBe('prev employer id');
        expect(joinDisambiguation.question.options[0].text).toBe('Prev employer id of Referer id');
        expect(joinDisambiguation.question.options[1].text).toBe('Prev employer id of Referee id');

        joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);

        joinDisambiguation.onDone();
        expect(doesNewTokenHaveJoinPathMatching('ref->employer:referer id,employer->company:prev employer id',
            input.joinPathCollections[0].new_token_index)).toBeTruthy();
    });

    it('should allow navigating to previous choices and change join choices', function () {
        var input = initializeController(
            ['year', 'industry'],
            [
                'init date:date<-ref|ref->employer:referer id,employer->company:curr employer id',
                'close date:date<-ref|ref->employer:referer id,employer->company:curr employer id',
                'init date:date<-ref|ref->employer:referee id,employer->company:curr employer id',
                'close date:date<-ref|ref->employer:referee id,employer->company:curr employer id',
                'init date:date<-ref|ref->employer:referer id,employer->company:prev employer id',
                'close date:date<-ref|ref->employer:referer id,employer->company:prev employer id',
                'init date:date<-ref|ref->employer:referee id,employer->company:prev employer id',
                'close date:date<-ref|ref->employer:referee id,employer->company:prev employer id'
            ],
            1,
            [0]
        );
        input.tokens[0].addJoinPath(sage.JoinPath.create('date', 'date', []));
        let joinDisambiguation = new JoinDisambiguation(input, completionCallback);

        // Build some history.
        joinDisambiguation.selectOption(joinDisambiguation.question.options[1]);
        joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);
        expect(joinDisambiguation.previousSelections.length).toBe(2);
        expect(joinDisambiguation.previousSelections.first().text).toBe('Industry of Prev employer id');
        expect(joinDisambiguation.previousSelections.last().text).toBe('Prev employer id of Referer id');

        // Go back to first item in history
        joinDisambiguation.selectItemFromHistory(joinDisambiguation.previousSelections.first());
        // Verify that its selection is still shown.
        expect(joinDisambiguation.question.selectedOption.text).toBe('Industry of Prev employer id');
        // Change the selection.
        joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);
        // Verify that the future history is purged.
        expect(joinDisambiguation.previousSelections.length).toBe(1);
        expect(joinDisambiguation.previousSelections.last().text).toBe('Industry of Curr employer id');
        // Verify that the next question is not pre-selected and a new question is asked.
        expect(joinDisambiguation.question.selectedOption).toBeFalsy();
        expect(joinDisambiguation.question.options[0].text).toBe('Curr employer id of Referer id');

        joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);
        expect(joinDisambiguation.previousSelections.length).toBe(2);

        // Go back again to first item in the history
        joinDisambiguation.selectItemFromHistory(joinDisambiguation.previousSelections.first());
        // This time select the already selected option.
        joinDisambiguation.selectOption(joinDisambiguation.question.selectedOption);
        // Verify the future history is preserved.
        expect(joinDisambiguation.previousSelections.length).toBe(2);
        expect(joinDisambiguation.previousSelections.last().text).toBe('Curr employer id of Referer id');
        // Verify that the next question is also pre-selected.
        expect(joinDisambiguation.question.selectedOption.text).toBe('Curr employer id of Referer id');
    });

    it('should work with choices from different roots', function () {
        var input = initializeController(
            ['color', 'category'],
            [
                'product type id:type<-product|',
                'trans product type id:type<-trans|trans->product:trans product id'
            ],
            1,
            [0]
        );
        input.tokens[0].addJoinPath(sage.JoinPath.create('type', 'type', []));
        let joinDisambiguation = new JoinDisambiguation(input, completionCallback);

        expect(joinDisambiguation.question.options[0].text).toBe('All types of Category');
        expect(joinDisambiguation.question.options[1].text).toBe('Category of Trans product id');

        joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);
        joinDisambiguation.onDone();

        var categoryToken = tokensAfterDisambiguation[input.joinPathCollections[0].new_token_index];
        expect(categoryToken.getJoinPaths().length).toBe(1);
        expect(categoryToken.getJoinPaths()[0].isEmpty()).toBeTruthy();
        expect(categoryToken.getJoinPaths()[0].getRootTableGuid()).toBe('product');
        expect(doesTokenHaveJoinPathMatching(tokensAfterDisambiguation[0],
            'product->type:product type id')).toBeTruthy();

        // Redo the workflow to test other choice
        input = initializeController(
            ['color', 'category'],
            [
                'product type id:type<-product|',
                'trans product type id:type<-trans|trans->product:trans product id'
            ],
            1,
            [0]
        );
        input.tokens[0].addJoinPath(sage.JoinPath.create('type', 'type', []));
        joinDisambiguation.init(input, completionCallback);

        joinDisambiguation.selectOption(joinDisambiguation.question.options[1]);

        joinDisambiguation.onDone();
        expect(doesNewTokenHaveJoinPathMatching('trans->product:trans product id',
            input.joinPathCollections[0].new_token_index)).toBeTruthy();
        expect(doesTokenHaveJoinPathMatching(tokensAfterDisambiguation[0],
            'trans->type:trans product type id')).toBeTruthy();

    });

    it('should work with choices on the same tokens but multiple roots', function () {
        var input = initializeController(
            ['companyname', 'companyname'],
            [
                '|',
                'prior id:company<-people|people->company:curr id',
                'curr id:company<-people|people->company:prior id',
                'prior id:company<-people,referer:people<-trans|trans->people:referee,people->company:curr id',
                'curr id:company<-people,referer:people<-trans|trans->people:referee,people->company:prior id',
                'prior id:company<-people,referee:people<-trans|trans->people:referer,people->company:curr id',
                'curr id:company<-people,referee:people<-trans|trans->people:referer,people->company:prior id',
                'prior id:company<-people,referer:people<-trans|trans->people:referee,people->company:prior id',
                'prior id:company<-people,referee:people<-trans|trans->people:referer,people->company:prior id',
                'curr id:company<-people,referee:people<-trans|trans->people:referer,people->company:curr id',
                'curr id:company<-people,referer:people<-trans|trans->people:referee,people->company:curr id'
            ],
            1,
            [0]
        );
        input.tokens[0].addJoinPath(sage.JoinPath.create('company', 'company', []));
        let joinDisambiguation = new JoinDisambiguation(input, completionCallback);

        expect(joinDisambiguation.question.options.length).toBe(3);
        expect(joinDisambiguation.question.options[0].text).toBe('All types of Companyname');
        expect(joinDisambiguation.question.options[1].text).toBe('Companyname of Curr id');
        expect(joinDisambiguation.question.options[2].text).toBe('Companyname of Prior id');

        joinDisambiguation.selectOption(joinDisambiguation.question.options[2]);

        expect(joinDisambiguation.question.options.length).toBe(3);
        expect(joinDisambiguation.question.options[0].text).toBe('All types of Prior id');
        expect(joinDisambiguation.question.options[1].text).toBe('Prior id of Referee');
        expect(joinDisambiguation.question.options[2].text).toBe('Prior id of Referer');

        joinDisambiguation.selectOption(joinDisambiguation.question.options[2]);

        expect(joinDisambiguation.question.options.length).toBe(2);
        expect(joinDisambiguation.question.options[0].text).toBe('Companyname table of Curr id');
        expect(joinDisambiguation.question.options[1].text).toBe('Companyname table of Prior id');

        joinDisambiguation.selectOption(joinDisambiguation.question.options[1]);

        joinDisambiguation.onDone();
        expect(doesNewTokenHaveJoinPathMatching('trans->people:referer,people->company:prior id',
            input.joinPathCollections[0].new_token_index)).toBeTruthy();
        expect(doesTokenHaveJoinPathMatching(tokensAfterDisambiguation[0],
            'trans->people:referee,people->company:prior id')).toBeTruthy();
    });

    it('should work with multiple join path collections', function() {
        var tokens = ['sales quantity', 'purchase quantity', 'person name'];
        var salesToPersonChoices = [
            '|sales->person:sales to person by buyer',
            '|sales->person:sales to person by seller'
        ];
        var purchasesToPersonChoices = [
            '|purchases->person:purchases to person by buyer',
            '|purchases->person:purchases to person by seller'
        ];
        var input = initializeController(tokens, salesToPersonChoices);
        input.tokens[0].addJoinPath(sage.JoinPath.create('sales', 'sales', []));
        input.tokens[1].addJoinPath(sage.JoinPath.create('purchase', 'purchase', []));

        input.joinPathCollections.add(createJoinPathCollection(purchasesToPersonChoices, tokens, 1));
        let joinDisambiguation = new JoinDisambiguation(input, completionCallback);

        expect(joinDisambiguation.question.options.length).toBe(2);
        expect(joinDisambiguation.question.options[0].text).toBe('Person name of Sales to person by buyer');
        expect(joinDisambiguation.question.options[1].text).toBe('Person name of Sales to person by seller');

        joinDisambiguation.selectOption(joinDisambiguation.question.options[1]);

        expect(joinDisambiguation.question.options.length).toBe(2);
        expect(joinDisambiguation.question.options[0].text).toBe('Sales to person by seller of Purchases to person by buyer');
        expect(joinDisambiguation.question.options[1].text).toBe('Sales to person by seller of Purchases to person by seller');

        joinDisambiguation.selectOption(joinDisambiguation.question.options[1]);

        joinDisambiguation.onDone();

        expect(doesTokenHaveJoinPathMatching(tokensAfterDisambiguation[2],
            '|sales->person:sales to person by seller')).toBeTruthy();

        expect(doesTokenHaveJoinPathMatching(tokensAfterDisambiguation[2],
            '|purchases->person:purchases to person by seller', 1)).toBeTruthy();
    });

    describe('Closest existing token', function () {
        var NEW_TOKEN_INDEX,
            BY_TOKEN = sage.RecognizedToken.createKeywordToken('by'),
            CHOICES = [
                'direct:vendor<-employer|employer->company:curr employer id',
                'direct:vendor<-employer|employer->company:prev employer id',
                'indirect:vendor<-employer|employer->company:curr employer id',
                'indirect:vendor<-employer|employer->company:prev employer id'
            ];

        var vendorValToken = sage.RecognizedToken.createColumnValueToken('vendor name', 'vendor_example');
        vendorValToken.token_metadata = {
            column_name: 'vendor name',
            table: {
                name: 'vendor name table'
            }
        };

        it('should be "vendor name" with a keyword in middle and new token at end', function () {
            var input  = initializeController(['vendor name', BY_TOKEN, 'industry'], CHOICES, 2, [0]);
            let joinDisambiguation = new JoinDisambiguation(input, completionCallback);

            joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);
            expect(joinDisambiguation.question.terminalToken).toBe('vendor name table');
        });

        it('should be "vendor name" when its column value is before new token', function () {
            var input  = initializeController([ vendorValToken, 'industry'], CHOICES, 1, [0]);
            let joinDisambiguation = new JoinDisambiguation(input, completionCallback);

            joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);
            expect(joinDisambiguation.question.terminalToken).toBe('vendor name table');
        });

        it('should be "vendor name" when it appears after new token', function () {
            var input = initializeController(['industry', 'vendor name'], CHOICES, 0, [1]);
            let joinDisambiguation = new JoinDisambiguation(input, completionCallback);

            joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);
            expect(joinDisambiguation.question.terminalToken).toBe('vendor name table');
        });

        it('should be "vendor name" when it appears after new token but only keywords before new token', function () {
            var input = initializeController([BY_TOKEN, 'industry', vendorValToken], CHOICES, 1, [2]);
            let joinDisambiguation = new JoinDisambiguation(input, completionCallback);

            joinDisambiguation.selectOption(joinDisambiguation.question.options[0]);
            expect(joinDisambiguation.question.terminalToken).toBe('vendor name table');
        });
    });
});
