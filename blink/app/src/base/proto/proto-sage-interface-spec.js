/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for thrift sage interface methods
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
/* global addCustomMatchers */

describe('Normalized string', function(){
    it('should remove quotes from columnValue token', function() {
        var queryCompletion = new sage.QueryCompletion(
            { query : [sage.RecognizedToken.createColumnValueToken('', "'Color'"),
                sage.RecognizedToken.createAttributeToken('Datekey')]});

        expect(queryCompletion.getNewTokensNormalizedQueryString()).toBe('color datekey');

        queryCompletion = new sage.QueryCompletion(
            { query : [sage.RecognizedToken.createColumnValueToken('', "Co'lo'r"),
                sage.RecognizedToken.createAttributeToken('Datekey')]});

        expect(queryCompletion.getNewTokensNormalizedQueryString()).toBe("co'lo'r datekey");

        queryCompletion = new sage.QueryCompletion(
            { query : [sage.RecognizedToken.createColumnValueToken('', "Color'"),
                sage.RecognizedToken.createAttributeToken('Datekey')]});

        expect(queryCompletion.getNewTokensNormalizedQueryString()).toBe("color' datekey");
    });
});

describe('Extension to RecognizedToken', function() {
    var serializedToken, token;

    beforeEach(function() {
        module('blink.app');
        // TOKEN JSON = {"token":"Color","type_enum":3,"type_name":"attribute","guid":"498c6665-c50b-4df7-9308-ea63f298df58","value_match":false,"ranking_score":1000,"token_metadata":{"table_name":"PART","name":"Color"}}
        serializedToken = "CgVDb2xvchADKiQ0OThjNjY2NS1jNTBiLTRkZjctOTMwOC1lYTYzZjI5OGRmNThSDQoEUEFSVBIFQ29sb3JYAGEAAAAAAECPQA";
        token = sage.deserialize(serializedToken, sage.RecognizedToken);
    });

    it('should be able to deserialize Base64', function() {
        expect(token.getToken()).toBe("Color");
    });

    it('should have correctly working getTokenMetaInfo() function', function() {
        expect(token.getTokenMetaInfo()[0].name).toBe('SOURCE');
        expect(token.getTokenMetaInfo()[0].value).toBe('PART');
    });

    it('should be able to fetch correct metadata info from token', function() {
        // verify new format.
        var token = new sage.RecognizedToken({
            type_enum: sage.TokenType.VALUE,
            token_metadata: {
                table: {
                    guid : 'new_guid',
                    name : 'new_name'
                }
            }
        });
        expect(token.getTokenMetaInfo()[0].name).toBe('SOURCE');
        expect(token.getTokenMetaInfo()[0].value).toBe('new_name');
        // verify old format.
        token = new sage.RecognizedToken({
            type_enum: sage.TokenType.VALUE,
            token_metadata: {
                deprecated_table_guid: 'old_guid',
                deprecated_table_name: 'old_name'
            }
        });
        expect(token.getTokenMetaInfo()[0].name).toBe('SOURCE');
        expect(token.getTokenMetaInfo()[0].value).toBe('old_name');
    });

    it('should be able to fetch correct table name and guid from token', function() {
        // verify new format.
        var token = new sage.RecognizedToken({
            token_metadata: {
                table: {
                    guid : 'new_guid',
                    name : 'new_name'
                }
            }
        });
        expect(token.getTableName()).toBe('new_name');
        expect(token.getTableGuid()).toBe('new_guid');
        // verify old format.
        token = new sage.RecognizedToken({
            token_metadata: {
                deprecated_table_guid: 'old_guid',
                deprecated_table_name: 'old_name'
            }
        });
        expect(token.getTableName()).toBe('old_name');
        expect(token.getTableGuid()).toBe('old_guid');
    });

    it('should not expand to "Color" when user type substring is "cu"', function () {
        expect(token.isExpansionCandidateOf('cu')).toBeFalsy();
    });

    it('should expand to "Color" when user type substring is "co"', function () {
        expect(token.isExpansionCandidateOf('co')).toBeTruthy();
    });

    it('should truncate a long token and restore', function () {
        var longTextPrefix = 'I am a very',
            longTextSuffix = 'long text';
        for (var i = 0; i < 20; ++i) {
            longTextPrefix += ' very';
        }
        longTextPrefix += longTextSuffix;
        token.token = longTextPrefix;

        expect(token.getTokenText()).toBe(longTextPrefix);
        token.cleanupAndTruncateToken();
        expect(token.getTokenText()).toBe('I am a very very very very very very very very very very very very very very...');

        token.restoreOriginalToken();
        expect(token.getTokenText()).toBe(longTextPrefix);

        // Case 2: we have a very long single word.
        token.token = 'http://192.168.2.239/#/answer/revenue+color+bugs+assigned+starred+p0+stabucks+cricket';
        token.cleanupAndTruncateToken();
        expect(token.getTokenText()).toBe('http://192.168.2.239/#/answer/revenue+color+bugs+assigned+starred+p0+stabucks+cr...');
    });

    it('should generate logical key', function () {
        expect(sage.RecognizedToken.createUnrecognizedToken('foo').getLogicalKey()).toBeNull();
        expect(sage.RecognizedToken.createKeywordToken('by').getLogicalKey()).toBeNull();

        var joinLessToken = sage.RecognizedToken.createAttributeToken('color');
        joinLessToken.guid = 'colorGuid';
        expect(joinLessToken.getLogicalKey()).toBe(joinLessToken.guid);

        var emptyJoinToken = sage.RecognizedToken.createCopy(joinLessToken);
        emptyJoinToken.addJoinPath(sage.JoinPath.create('root', 'root', []));
        expect(emptyJoinToken.getLogicalKey()).toBe(emptyJoinToken.guid);

        var joinFullToken = sage.RecognizedToken.createCopy(joinLessToken);
        joinFullToken.addJoinPath(sage.JoinPath.create('root', 'leaf', [
            sage.Join.create('joinName', 'root', 'leaf')
        ]));
        expect(joinFullToken.getLogicalKey()).toBe('colorGuid.joinName');

        var joinFullToken2 = sage.RecognizedToken.createCopy(joinLessToken);
        joinFullToken2.addJoinPath(sage.JoinPath.create('root', 'leaf', [
            sage.Join.create('joinName1', 'root', 'inner'),
            sage.Join.create('joinName2', 'inner', 'leaf')
        ]));
        expect(joinFullToken2.getLogicalKey()).toBe('colorGuid.joinName1,joinName2');
    });

    it('should get join path label', function () {
        var uneditableToken = sage.RecognizedToken.createAttributeToken('color');
        uneditableToken.setCanEditJoinPath(false);
        expect(uneditableToken.getJoinPathLabel()).toBe('');

        var editableJoinLessToken = sage.RecognizedToken.createCopy(uneditableToken);
        editableJoinLessToken.setCanEditJoinPath(true);
        expect(editableJoinLessToken.getJoinPathLabel()).toBe('');

        var emptyJoinToken = sage.RecognizedToken.createCopy(editableJoinLessToken);
        emptyJoinToken.addJoinPath(sage.JoinPath.create('root', 'root', []));
        expect(emptyJoinToken.getJoinPathLabel()).toBe('All types of root');

        var joinFullToken = sage.RecognizedToken.createCopy(editableJoinLessToken);
        joinFullToken.addJoinPath(sage.JoinPath.create('root', 'leaf', [
            sage.Join.create('joinName', 'root', 'leaf')
        ]));
        expect(joinFullToken.getJoinPathLabel()).toBe('joinName');

        var joinFullToken2 = sage.RecognizedToken.createCopy(editableJoinLessToken);
        joinFullToken2.addJoinPath(sage.JoinPath.create('root', 'leaf', [
            sage.Join.create('joinName1', 'root', 'inner'),
            sage.Join.create('joinName2', 'inner', 'leaf')
        ]));

        expect(joinFullToken2.getJoinPathLabel()).toBe('joinName2, joinName1');
    });

    it('should get correct column name in fake column', function() {
        var testToken = {
            getGuid : function () {
                return 'id';
            },
            getColumnName: function () {
                return 'name';
            }
        };

        var fakeColumn = sage.RecognizedToken.createFakeLogicalColumn(testToken);

        expect(fakeColumn.getGuid()).toBe('id');
        expect(fakeColumn.getName()).toBe('name');
        expect(fakeColumn.isFormula()).toBe(false);
        expect(fakeColumn.getSourceName()).toBe('');
        expect(fakeColumn.isHidden()).toBe(false);
    });
});

describe('QueryTransforms', function () {
    var oldQueryTransform = sage.QueryTransform;

    it('create Add Having Filter Transformation should resolve on value = 0', function () {
        var addHavingFilterTransformation = sage.QueryTransform.createAddHavingFilterTransformation;
        sage.QueryTransform = jasmine.createSpy();
        addHavingFilterTransformation({
            value1: 0
        });
        expect(sage.QueryTransform).toHaveBeenCalledWith({
            type: sage.QueryTransformType.ADD_HAVING_FILTER,
            token_output_guid: undefined,
            column_guid: undefined,
            aggregation: undefined,
            op: undefined,
            value: '0',
            resolve_value_token: true
        });
    });

    afterEach(function() {
        sage.QueryTransform = oldQueryTransform;
    });
});

describe('Extension to JoinPath classes', function() {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());

    it('should test attachToNewRoot', function () {
        var path1 = new sage.JoinPath({
                root_table: {
                    guid: 'root1'
                },
                leaf_table: {
                    guid: 'leaf1'
                },
                join: [
                    sage.Join.create('joinName1', 'root1', 'leaf1')
                ]
            }),
            path2 = new sage.JoinPath({
                root_table: {
                    guid: 'root2'
                },
                leaf_table: {
                    guid: 'root1'
                },
                join: [
                    sage.Join.create('joinName2', 'root2', 'root1')
                ]
            });

        expect(path1.isAncestorOf(path2)).toBeFalsy();
        expect(path2.root_table.guid).toBe('root2');
        expect(path2.join.length).toBe(1);
        // Should be noop
        path2.attachToNewRoot(path1);
        expect(path2.root_table.guid).toBe('root2');
        expect(path2.join.length).toBe(1);

        expect(path2.isAncestorOf(path1)).toBeTruthy();
        expect(path1.root_table.guid).toBe('root1');
        expect(path1.join.length).toBe(1);
        path1.attachToNewRoot(path2);
        expect(path1.root_table.guid).toBe('root2');
        expect(path1.join.length).toBe(2);
    });

    it('should test Join EqualTo', function () {
        var baseJoin =  sage.Join.create('baseJoin', 'baseJoinSource','baseJoinDestination');

        var testJoin = new sage.Join({});
        expect(testJoin.isEqualTo(baseJoin)).toBeFalsy();

        testJoin = new sage.Join({
            id: baseJoin.id
        });
        expect(testJoin.isEqualTo(baseJoin)).toBeFalsy();

        testJoin = new sage.Join({
            id: baseJoin.id,
            source: baseJoin.source
        });
        expect(testJoin.isEqualTo(baseJoin)).toBeFalsy();

        testJoin = new sage.Join({
            id: baseJoin.id,
            source: baseJoin.source,
            destination: baseJoin.destination
        });
        expect(testJoin.isEqualTo(baseJoin)).toBeTruthy();

        testJoin = sage.Join.create('testJoin', 'testJoinSource', 'testJoinDestination');
        expect(testJoin.isEqualTo(baseJoin)).toBeFalsy();
    });

    it('should test isPrefixOf', function () {
        var bigPath = sage.JoinPath.create('root', 'leaf', [
            sage.Join.create('root', 'p1', 'l1'),
            sage.Join.create('p1', 'p2', 'l2'),
            sage.Join.create('p2', 'p3', 'l3'),
            sage.Join.create('p3', 'leaf', 'l4')
        ]);

        var prefixPath = sage.JoinPath.create('root', 'p2', [
            sage.Join.create('root', 'p1', 'l1'),
            sage.Join.create('p1', 'p2', 'l2')
        ]);

        var notPrefixPath = sage.JoinPath.create('root', 'p4', [
            sage.Join.create('root', 'p1', 'l1'),
            sage.Join.create('p4', 'p22', 'l22')
        ]);

        expect(prefixPath.isPrefixOf(null)).toBeFalsy();
        expect(prefixPath.isPrefixOf(new sage.JoinPath())).toBeFalsy();
        expect(prefixPath.isPrefixOf(sage.JoinPath.create('otherRoot', 'leaf', []))).toBeFalsy();
        expect(prefixPath.isPrefixOf(sage.JoinPath.create('root', 'leaf'))).toBeFalsy();
        expect(prefixPath.isPrefixOf(sage.JoinPath.create('root', 'leaf', []))).toBeFalsy();
        expect(notPrefixPath.isPrefixOf(bigPath)).toBeFalsy();
        expect(prefixPath.isPrefixOf(bigPath)).toBeTruthy();
    });
});

describe('JoinAmbiguityQueryCompletion', function () {
    function getJoinCompletionParam() {
        return {
            workingTokenIndex: 0,
            allTokens: [
                sage.RecognizedToken.createAttributeToken('Color'),
                sage.RecognizedToken.createAttributeToken('Datekey')
            ],
            joinChoice: {},
            numPrefixTokens: 0,
            numSuffixTokens: 1,
            history: []
        };
    }

    it('should get suggestion string without context', function () {
        var completion = new sage.JoinAmbiguityQueryCompletion(getJoinCompletionParam());
        expect(completion.getNewTokensQueryString()).toBe('color');
    });

    it('should get suggestion string with context', function () {
        var param = getJoinCompletionParam();
        param.history = [{
            tokenIndex: 0,
            question: {
                selectedOption: {
                    link: {
                        getDisplayName: function () {
                            return 'Order date';
                        }
                    }
                }
            }
        }, {
            tokenIndex: 0,
            question: {
                selectedOption: {
                    link: {
                        getDisplayName: function () {
                            return 'Previous Company';
                        }
                    }
                }
            }
        }];
        var completion = new sage.JoinAmbiguityQueryCompletion(param);
        expect(completion.getNewTokensQueryString()).toBe('color - Order date, Previous Company');
    });


    it('should get suggestion string with relevant context', function () {
        var param = getJoinCompletionParam();
        param.workingTokenIndex = 1;
        param.numPrefixTokens = 1;
        param.numSuffixTokens = 0;
        param.history = [{
            tokenIndex: 1,
            question: {
                selectedOption: {
                    link: {
                        getDisplayName: function () {
                            return 'Order date';
                        }
                    }
                }
            }
        }, {
            tokenIndex: 0,
            question: {
                selectedOption: {
                    link: {
                        getDisplayName: function () {
                            return 'Previous Company';
                        }
                    }
                }
            }
        }];
        var completion = new sage.JoinAmbiguityQueryCompletion(param);
        expect(completion.getNewTokensQueryString()).toBe('datekey - Order date');
    });
});
