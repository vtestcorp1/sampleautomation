/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Translates sage API into local namespaces.
 */

/* eslint camelcase: 1, no-undef: 0 */
/* globals _root: false */

'use strict';

window.sage = {};
window.tsProto = _root;
tsProto.sage.autoComplete = tsProto.sage.auto_complete.v2;
tsProto.sage.objectSearch = tsProto.sage.object_search;

(function(sage) {

    sage.EntityHeader = tsProto.sage.EntityHeader;
    sage.AuthToken = tsProto.sage.autoComplete.AuthToken;
    sage.RecognizedToken = tsProto.sage.autoComplete.RecognizedToken;
    sage.Completion = tsProto.sage.autoComplete.Completion;
    sage.QueryCompletion = tsProto.sage.autoComplete.QueryCompletion;
    sage.CompletionScope = tsProto.sage.autoComplete.CompletionScope.E;
    sage.MatchType = tsProto.sage.MatchType.E;
    sage.QueryCompletionType = tsProto.sage.autoComplete.QueryCompletionType.E;
    sage.ClientState = tsProto.sage.autoComplete.ClientState;
    sage.TokenMetadata = tsProto.sage.autoComplete.TokenMetadata;
    sage.TokenType = tsProto.sage.TokenType.E;
    sage.Join = tsProto.sage.JoinProto;
    sage.JoinPath = tsProto.sage.JoinPathProto;
    sage.JoinPathChoice = tsProto.sage.autoComplete.JoinPathChoice;
    sage.JoinPathCollection = tsProto.sage.autoComplete.JoinPathCollection;
    sage.QueryTransform = tsProto.sage.autoComplete.QueryTransform;
    sage.QueryTransformType = tsProto.sage.autoComplete.QueryTransformType.E;
    sage.CompareType = tsProto.sage.CompareTypeProto.E;
    sage.ChangeAggregationParam = tsProto.sage.autoComplete.ChangeAggregationParam;
    sage.AggregationType = tsProto.sage.AggregationType.E;
    sage.PhraseDefinition = tsProto.sage.autoComplete.PhraseDefinition;
    sage.PhraseType = tsProto.sage.PhraseType.E;
    sage.ColumnMetadata = tsProto.sage.autoComplete.ColumnMetadata;
    sage.ColumnType = tsProto.sage.ColumnType.E;
    sage.DataType = tsProto.falcon.DataType.E;
    sage.AggregationType = tsProto.sage.AggregationType.E;
    sage.DataScope = tsProto.sage.autoComplete.DataScope;
    sage.ErrorCode = tsProto.sage.autoComplete.ErrorCode.E;
    sage.ErrorSeverity = tsProto.sage.autoComplete.ErrorSeverity.E;
    sage.FormattedTokens = tsProto.sage.autoComplete.FormattedTokens;
    sage.TimeBucket = tsProto.sage.TimeBucket.E;

    sage.Object = tsProto.sage.autoComplete.Object;
    sage.HighlightedString = tsProto.sage.autoComplete.Object.HighlightedString;
    sage.Question = tsProto.sage.autoComplete.Object.Question;
    sage.Viz = tsProto.sage.autoComplete.Object.Viz;

    sage.ACTable = tsProto.sage.autoComplete.ACTable;
    sage.ErrorCollection = tsProto.sage.autoComplete.ErrorCollection;
    sage.Error = tsProto.sage.autoComplete.Error;
    sage.ACJoin = tsProto.sage.autoComplete.ACJoin;
    sage.ACFormula = tsProto.sage.autoComplete.ACFormula;
    sage.ACContext = tsProto.sage.autoComplete.ACContext;
    sage.FeatureFlag = tsProto.sage.autoComplete.FeatureFlag.E;
    sage.ACRequestInfo = tsProto.sage.autoComplete.ACRequestInfo;
    sage.ACResponseInfo = tsProto.sage.autoComplete.ACRequestInfo;
    sage.UserFeedback = tsProto.sage.autoComplete.UserFeedback;
    sage.UserRating = tsProto.sage.autoComplete.UserRating.E;
    sage.SageProgram = tsProto.sage.autoComplete.SageProgram;

    sage.PingRequest = tsProto.sage.autoComplete.PingRequest;
    sage.ACTableRequest = tsProto.sage.autoComplete.ACTableRequest;
    sage.ValidateContextRequest = tsProto.sage.autoComplete.ValidateContextRequest;
    sage.CleanupContextRequest = tsProto.sage.autoComplete.CleanupContextRequest;
    sage.AddTableRequest = tsProto.sage.autoComplete.AddTableRequest;
    sage.DeleteTableRequest = tsProto.sage.autoComplete.DeleteTableRequest;
    sage.EditTableRequest = tsProto.sage.autoComplete.EditTableRequest;
    sage.TransformTableRequest = tsProto.sage.autoComplete.TransformTableRequest;
    sage.SaveFormulaRequest = tsProto.sage.autoComplete.SaveFormulaRequest;
    sage.RemoveFormulaRequest = tsProto.sage.autoComplete.RemoveFormulaRequest;
    sage.UpdateFormulaRequest = tsProto.sage.autoComplete.UpdateFormulaRequest;
    sage.AddTableFilterRequest = tsProto.sage.autoComplete.AddTableFilterRequest;
    sage.UpdateTableFilterRequest = tsProto.sage.autoComplete.UpdateTableFilterRequest;
    sage.AddJoinRequest = tsProto.sage.autoComplete.AddJoinRequest;
    sage.EditJoinRequest = tsProto.sage.autoComplete.EditJoinRequest;
    sage.DeleteJoinRequest = tsProto.sage.autoComplete.DeleteJoinRequest;
    sage.UpdateWorksheetRequest = tsProto.sage.autoComplete.UpdateWorksheetRequest;
    sage.TransformWorksheetRequest = tsProto.sage.autoComplete.TransformWorksheetRequest;
    sage.Request = tsProto.sage.autoComplete.Request;
    sage.BatchRequest = tsProto.sage.autoComplete.BatchRequest;

    sage.PingResponse = tsProto.sage.autoComplete.PingResponse;
    sage.ACTableResponse = tsProto.sage.autoComplete.ACTableResponse;
    sage.ACJoinRequest = tsProto.sage.autoComplete.ACTableResponse;
    sage.ValidateContextResponse = tsProto.sage.autoComplete.ValidateContextResponse;
    sage.JoinResponse = tsProto.sage.autoComplete.JoinResponse;
    sage.RefreshGuidsRequest = tsProto.sage.autoComplete.RefreshGuidsRequest;
    sage.RefreshGuidsResponse = tsProto.sage.autoComplete.RefreshGuidsResponse;
    sage.AnswerResponse = tsProto.sage.autoComplete.AnswerResponse;
    sage.WorksheetResponse = tsProto.sage.autoComplete.WorksheetResponse;
    sage.FormulaResponse = tsProto.sage.autoComplete.FormulaResponse;
    sage.TableFilterResponse = tsProto.sage.autoComplete.TableFilterResponse;
    sage.BatchResponse = tsProto.sage.autoComplete.BatchResponse;
    sage.GetAccessibleTablesRequest = tsProto.sage.autoComplete.GetAccessibleTablesRequest;
    sage.GetAccessibleTablesResponse = tsProto.sage.autoComplete.GetAccessibleTablesResponse;

    sage.common = {};
    sage.common.StatusProto = tsProto.common.StatusProto;
    sage.common.ErrorCode = tsProto.common.StatusProto;

    function normalizeBase64String(string) {
        if (!string) {
            return string;
        }

        var mismatchIndex = string.length % 4;
        if (mismatchIndex !== 0) {
            var stringToAppend = '';
            var numCharactersNeeded = 4 - mismatchIndex;
            for (var i = 0; i < numCharactersNeeded; i++) {
                stringToAppend += '=';
            }
            string += stringToAppend;
        }

        return string;
    }

    sage.printPretty = function(object) {
        JSON.stringify(object, null, 4);
    };

    sage.serialize = function(protoObject) {
        protoObject = sage.compressACContext(protoObject);
        return protoObject.encode64().split('=')[0];
    };

    sage.deserialize = function(serialized, deserializationClass) {
        var normalized = normalizeBase64String(serialized);
        var proto = deserializationClass.decode64(normalized);
        return sage.decompressACContext(proto);
    };

    sage.deserializePretty = function(serialized, deserializationClass) {
        sage.printPretty(sage.deserialize(serialized, deserializationClass));
    };

    sage.iterateProto = function(msg, visitor) {
        var ret = visitor.visit(msg);
        msg = ret.msg;
        if (ret.done) {
            return msg;
        }
        var fields = msg.$type._fields;
        // Iterate over all fields of @msg.
        for (var k = 0; k < fields.length; ++k) {
            var field = fields[k];
            if (field.type.name != "message") {
                continue;
            }
            if (field.repeated) {
                var values = msg.get(field.name);
                if (values) {
                    for (var j = 0; j < values.length; ++j) {
                        values[j] = sage.iterateProto(values[j], visitor);
                    }
                    msg.set(field.name, values);
                }
            } else {
                var value = msg.get(field.name);
                if (value) {
                    value = sage.iterateProto(value, visitor);
                    msg.set(field.name, value);
                }
            }
        }
        return msg;
    };

    sage.collectHeaders = function(msg, headers, header_dict) {
        var visitor = {};
        visitor.visit = function(m) {
            if (m.$type.fqn() == '.sage.EntityHeader') {
                if (!m.getGuid() || m.getGuid().length != 36) {
                    return {
                        done: true,
                        msg: m
                    };
                }
                var index = header_dict[m.getGuid()];
                if (index === undefined) {
                    index = Object.keys(header_dict).length;
                    headers.push(_.cloneDeep(m));
                    header_dict[m.getGuid()] = index;
                }
                return {
                    done: true,
                    msg: new sage.EntityHeader({guid: index.toString()})
                };
            }
            return {
                done: false,
                msg: m
            };
        };
        sage.iterateProto(msg, visitor);
    };

    sage.populateHeaders = function(msg, headers) {
        var visitor = {};
        visitor.visit = function(m) {
            if (m.$type.fqn() == '.sage.EntityHeader') {
                if (!m.getGuid() || m.getGuid().length == 36 || isNaN(m.getGuid())) {
                    return {
                        done: true,
                        msg: m
                    };
                }
                var index = Number(m.getGuid());
                if (index < 0 || index >= headers.length) {
                    // Index out of range, log error.
                    return {
                        done: true,
                        msg: m
                    };
                }
                return {
                    done: true,
                    msg: _.cloneDeep(headers[index])
                };
            }
            return {
                done: false,
                msg: m
            };
        };
        sage.iterateProto(msg, visitor);
    };

    sage.decompressACContext = function(msg) {
        var visitor = {};
        visitor.visit = function(m) {
            if (m.$type.fqn() == '.sage.auto_complete.v2.ACContext') {
                // Nothing to decompress.
                if (!m.getHeaderDef() ||
                    m.getVersion() === null ||
                    m.getVersion() == sage.ACContext.Version.V1) {
                    return {
                        done: true,
                        msg: m
                    };
                }
                // Read header definitions and clear them from original proto.
                var headers = m.getHeaderDef();
                m.setHeaderDef(null);
                sage.populateHeaders(m, headers);
                m.setVersion(sage.ACContext.Version.V1);
                return {
                    done: true,
                    msg: m
                };
            }
            return {
                done: false,
                msg: m
            };
        };
        return sage.iterateProto(msg, visitor);
    };

    sage.compressACContext = function(msg) {
        var visitor = {};
        visitor.visit = function(m) {
            if (m.$type.fqn() == '.sage.auto_complete.v2.ACContext') {
                // Nothing to compress.
                if (m.getVersion() == sage.ACContext.Version.V2) {
                    return {
                        done: true,
                        msg: m
                    };
                }
                m = _.cloneDeep(m);
                // Clear header definitions from original proto.
                m.setHeaderDef(null);
                var headers = [];
                var header_dict = {};
                sage.collectHeaders(m, headers, header_dict);
                m.setHeaderDef(headers);
                m.setVersion(sage.ACContext.Version.V2);
                return {
                    done: true,
                    msg: m
                };
            }
            return {
                done: false,
                msg: m
            };
        };
        return sage.iterateProto(msg, visitor);
    };
})(window.sage);
