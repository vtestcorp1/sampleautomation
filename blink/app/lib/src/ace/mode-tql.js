ace.define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var DocCommentHighlightRules = function() {
        this.$rules = {
            "start" : [ {
                token : "comment.doc.tag",
                regex : "@[\\w\\d_]+" // TODO: fix email addresses
            },
                DocCommentHighlightRules.getTagRule(),
                {
                    defaultToken : "comment.doc",
                    caseInsensitive: true
                }]
        };
    };

    oop.inherits(DocCommentHighlightRules, TextHighlightRules);

    DocCommentHighlightRules.getTagRule = function(start) {
        return {
            token : "comment.doc.tag.storage.type",
            regex : "\\b(?:TODO|FIXME|XXX|HACK)\\b"
        };
    }

    DocCommentHighlightRules.getStartRule = function(start) {
        return {
            token : "comment.doc", // doc comment
            regex : "\\/\\*(?=\\*)",
            next  : start
        };
    };

    DocCommentHighlightRules.getEndRule = function (start) {
        return {
            token : "comment.doc", // closing comment
            regex : "\\*\\/",
            next  : start
        };
    };


    exports.DocCommentHighlightRules = DocCommentHighlightRules;

});

ace.define("ace/mode/tql_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"], function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var TqlHighlightRules = function() {
        var logicalOperators = "AND|ANY|BETWEEN|EXISTS|IN|LIKE|NOT|OR|SOME";
        logicalOperators += "|NULL|IS|APPLY|INNER|OUTER|LEFT|RIGHT|JOIN|CROSS"; //SSMS colors these gray too


        var builtinFunctions = (
            "SIN|COS|TAN|ACOS|ASIN|ATAN|ATAN2|SECONDINDAY|DATEADD|DATEDIFF|LESSER|IN" +
            "|ABSQUARTER|ABSHOUR|ABSMONTH|ABSDAY|ABSYEAR|ABSWEEK|DATE_SYM|DAYNAME" +
            "|DAYOFMONTH|DAYOFWEEK|DAYOFQUARTER|DAYOFYEAR|HOUR|MONTH|MONTHOFQUARTER" +
            "|MONTHNAME|QUARTER|SECONDINDAY|TIME_SYM|WEEKEND|WEEKOFMONTH|WEEKOFQUARTER" +
            "|WEEKOFYEAR|RANDOM|SYSDATE|IFNULL|STRPOS|SUBSTRING|POW|POWER|ABS|CEIL|CEILING" +
            "|CUBE|CUBEROOT|EXP|EXP2|FLOOR|LN|LOG10|LOG2|ROUND|SIGN|SQRT|SQUARE"
        );
        var dataTypes = ("INT|INTEGER|BIGINT|INT64|BOOL|BOOLEAN|VARCHAR|DOUBLE|FLOAT|DATE|DATETIME|TIME|TIMESTAMP");
        var builtInStoredProcedures = "";
        var keywords = "CREATE|DROP|ALTER|ADD|GUID|DATABASE|SCHEMA|TABLE|COLUMN|CONSTRAINT|FOREIGN|PRIMARY|KEY" +
            "|REFERENCES|PARTITION|BY|HASH|DEFAULT|NULL|TRUNCATE|FACT|DIMENSION|RELATIONSHIP|WITH|AS|TRUE|FALSE";
        keywords = keywords.split('|');
        keywords = keywords.filter(function(value, index, self) {
            return logicalOperators.split('|').indexOf(value) === -1 && builtinFunctions.split('|').indexOf(value) === -1 && dataTypes.split('|').indexOf(value) === -1;
        });
        keywords = keywords.sort().join('|');


        var keywordMapper = this.createKeywordMapper({
            "constant.language": logicalOperators,
            "storage.type": dataTypes,
            "support.function": builtinFunctions,
            "support.storedprocedure": builtInStoredProcedures,
            "keyword": keywords,
        }, "identifier", true);
        var setStatements = [];


        this.$rules = {
            start: [{
                token: "string.start",
                regex: "'",
                next: [{
                    token: "constant.language.escape",
                    regex: /''/
                }, {
                    token: "string.end",
                    next: "start",
                    regex: "'"
                }, {
                    defaultToken: "string"
                }]
            },
                DocCommentHighlightRules.getStartRule("doc-start"), {
                    token: "comment",
                    regex: "--.*$"
                }, {
                    token: "comment",
                    start: "/\\*",
                    end: "\\*/"
                }, {
                    token: "constant.numeric", // float
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                }, {
                    token: keywordMapper,
                    regex: "@{0,2}[a-zA-Z_$][a-zA-Z0-9_$]*\\b(?!])" //up to 2 @symbols for some built in functions
                }, {
                    token: "constant.class",
                    regex: "@@?[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }, {
                    token: "keyword.operator",
                    regex: "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|=|\\*"
                }, {
                    token: "paren.lparen",
                    regex: "[\\(]"
                }, {
                    token: "paren.rparen",
                    regex: "[\\)]"
                }, {
                    token: "punctuation",
                    regex: ",|;"
                }, {
                    token: "text",
                    regex: "\\s+"
                }],
            comment: [
                DocCommentHighlightRules.getTagRule(), {
                    token: "comment",
                    regex: "\\*\\/",
                    next: "no_regex"
                }, {
                    defaultToken: "comment",
                    caseInsensitive: true
                }],
        };
        for (var i = 0; i < setStatements.length; i++) {
            this.$rules.start.unshift({
                token: "set.statement",
                regex: setStatements[i]
            });
        }

        this.embedRules(DocCommentHighlightRules, "doc-", [DocCommentHighlightRules.getEndRule("start")]);
        this.normalizeRules();
        var completions = [];
        var addCompletions = function(arr, meta) {
            arr.forEach(function(v) {
                completions.push({
                    name: v,
                    value: v,
                    score: 0,
                    meta: meta,
                });
            });
        };
        addCompletions(builtInStoredProcedures.split('|'), 'procedure');
        addCompletions(logicalOperators.split('|'), 'operator');
        addCompletions(builtinFunctions.split('|'), 'function');
        addCompletions(dataTypes.split('|'), 'type');
        addCompletions(setStatements, 'statement');
        addCompletions(keywords.split('|'), 'keyword');

        this.completions = completions;
    };

    oop.inherits(TqlHighlightRules, TextHighlightRules);

    exports.TqlHighlightRules = TqlHighlightRules;
});

ace.define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"], function(require, exports, module) {
    "use strict";

    var oop = require("../../lib/oop");
    var Range = require("../../range").Range;
    var BaseFoldMode = require("./fold_mode").FoldMode;

    var FoldMode = exports.FoldMode = function(commentRegex) {
        if (commentRegex) {
            this.foldingStartMarker = new RegExp(
                this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
            );
            this.foldingStopMarker = new RegExp(
                this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
            );
        }
    };
    oop.inherits(FoldMode, BaseFoldMode);

    (function() {

        this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/;
        this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;
        this.singleLineBlockCommentRe= /^\s*(\/\*).*\*\/\s*$/;
        this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
        this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;
        this._getFoldWidgetBase = this.getFoldWidget;
        this.getFoldWidget = function(session, foldStyle, row) {
            var line = session.getLine(row);

            if (this.singleLineBlockCommentRe.test(line)) {
                if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
                    return "";
            }

            var fw = this._getFoldWidgetBase(session, foldStyle, row);

            if (!fw && this.startRegionRe.test(line))
                return "start"; // lineCommentRegionStart

            return fw;
        };

        this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) {
            var line = session.getLine(row);

            if (this.startRegionRe.test(line))
                return this.getCommentRegionBlock(session, line, row);

            var match = line.match(this.foldingStartMarker);
            if (match) {
                var i = match.index;

                if (match[1])
                    return this.openingBracketBlock(session, match[1], row, i);

                var range = session.getCommentFoldRange(row, i + match[0].length, 1);

                if (range && !range.isMultiLine()) {
                    if (forceMultiline) {
                        range = this.getSectionRange(session, row);
                    } else if (foldStyle != "all")
                        range = null;
                }

                return range;
            }

            if (foldStyle === "markbegin")
                return;

            var match = line.match(this.foldingStopMarker);
            if (match) {
                var i = match.index + match[0].length;

                if (match[1])
                    return this.closingBracketBlock(session, match[1], row, i);

                return session.getCommentFoldRange(row, i, -1);
            }
        };

        this.getSectionRange = function(session, row) {
            var line = session.getLine(row);
            var startIndent = line.search(/\S/);
            var startRow = row;
            var startColumn = line.length;
            row = row + 1;
            var endRow = row;
            var maxRow = session.getLength();
            while (++row < maxRow) {
                line = session.getLine(row);
                var indent = line.search(/\S/);
                if (indent === -1)
                    continue;
                if  (startIndent > indent)
                    break;
                var subRange = this.getFoldWidgetRange(session, "all", row);

                if (subRange) {
                    if (subRange.start.row <= startRow) {
                        break;
                    } else if (subRange.isMultiLine()) {
                        row = subRange.end.row;
                    } else if (startIndent == indent) {
                        break;
                    }
                }
                endRow = row;
            }

            return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
        };
        this.getCommentRegionBlock = function(session, line, row) {
            var startColumn = line.search(/\s*$/);
            var maxRow = session.getLength();
            var startRow = row;

            var re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
            var depth = 1;
            while (++row < maxRow) {
                line = session.getLine(row);
                var m = re.exec(line);
                if (!m) continue;
                if (m[1]) depth--;
                else depth++;

                if (!depth) break;
            }

            var endRow = row;
            if (endRow > startRow) {
                return new Range(startRow, startColumn, endRow, line.length);
            }
        };

    }).call(FoldMode.prototype);

});

ace.define("ace/mode/folding/tql",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/cstyle"], function(require, exports, module) {
    "use strict";

    var oop = require("../../lib/oop");
    var Range = require("../../range").Range;
    var BaseFoldMode = require("./cstyle").FoldMode;

    var FoldMode = exports.FoldMode = function() {};

    oop.inherits(FoldMode, BaseFoldMode);

    (function() {

        this.foldingStartMarker = /(\bCASE\b|\bBEGIN\b)|^\s*(\/\*)/i;
        this.startRegionRe = /^\s*(\/\*|--)#?region\b/;

        this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) {
            var line = session.getLine(row);

            if (this.startRegionRe.test(line)) return this.getCommentRegionBlock(session, line, row);

            var match = line.match(this.foldingStartMarker);
            if (match) {
                var i = match.index;
                if (match[1]) return this.getBeginEndBlock(session, row, i, match[1]);

                var range = session.getCommentFoldRange(row, i + match[0].length, 1);
                if (range && !range.isMultiLine()) {
                    if (forceMultiline) {
                        range = this.getSectionRange(session, row);
                    }
                    else if (foldStyle != "all") range = null;
                }

                return range;
            }

            if (foldStyle === "markbegin") return;
            return;
        };
        this.getBeginEndBlock = function(session, row, column, matchSequence) {
            var start = {
                row: row,
                column: column + matchSequence.length
            };
            var maxRow = session.getLength();
            var line;

            var depth = 1;
            var re = /(\bCASE\b|\bBEGIN\b)|(\bEND\b)/i;
            while (++row < maxRow) {
                line = session.getLine(row);
                var m = re.exec(line);
                if (!m) continue;
                if (m[1]) depth++;
                else depth--;

                if (!depth) break;
            }
            var endRow = row;
            if (endRow > start.row) {
                return new Range(start.row, start.column, endRow, line.length);
            }
        };

    }).call(FoldMode.prototype);

});

ace.define("ace/mode/tql",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/tql_highlight_rules","ace/range","ace/mode/folding/tql"], function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var TqlHighlightRules = require("./tql_highlight_rules").TqlHighlightRules;
    var Range = require("../range").Range;
    var TqlFoldMode = require("./folding/tql").FoldMode;

    var Mode = function() {
        this.HighlightRules = TqlHighlightRules;
        this.foldingRules = new TqlFoldMode();
    };
    oop.inherits(Mode, TextMode);

    (function() {
        this.lineCommentStart = "--";
        this.blockComment = {start: "/*", end: "*/"};
        this.getCompletions = function(state, session, pos, prefix) {
            return session.$mode.$highlightRules.completions;
        };

        this.$id = "ace/mode/sql";
    }).call(Mode.prototype);

    exports.Mode = Mode;

});
