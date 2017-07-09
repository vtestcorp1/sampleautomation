ace.define("ace/mode/sql_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var InfaHighlightRules = function() {

        var builtinFunctions = (
            "Ascii|Choose|Chr|ChrCode|Concat|IndexOf|InitCap|Instr|Length|Lower|Lpad|LTrim|ReplaceChr|" +
            "ReplaceStr|Reverse|RPad|RTrim|Substr|Upper|To_Bigint|To_Char|To_Date|To_Decimal|To_Float|" +
            "To_Integer|Greatest|In|Is_Date|Is_Number|Is_Spaces|IsNull|Least|Metaphone|Reg_Extract|Reg_Match|" +
            "Reg_Replace|Soundex|Add_To_Date|Date_Compare|Date_Diff|Get_Date_Part|Last_Day|Make_Date_Time|" +
            "Set_Date_Part|Systimestamp|AES_Decrypt|AES_Encrypt|Compress|CRC32|Dec_Base64|Decompress|Enc_Base64|MD5|FV|" +
            "NPer|Pmt|PV|Rate|Round|Abs|Ceil|Convert_Base|Cume|Exp|Floor|LN|Log|Mod|MovingAvg|MovingSum|Power|Rand|Sign|" +
            "Sqrt|Cos|Cosh|Sin|Sinh|Tan|Trunc|Tanh|Abort|Decode|Error|IIF"
        );

        var keywordMapper = this.createKeywordMapper({
            "support.function": builtinFunctions
        }, "identifier", true);

        this.$rules = {
            "start" : [ {
                token : "comment",
                regex : "--.*$"
            },  {
                token : "comment",
                start : "/\\*",
                end : "\\*/"
            }, {
                token : "string",           // " string
                regex : '".*?"'
            }, {
                token : "string",           // ' string
                regex : "'.*?'"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "keyword.operator",
                regex : "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="
            }, {
                token : "paren.lparen",
                regex : "[\\(]"
            }, {
                token : "paren.rparen",
                regex : "[\\)]"
            }, {
                token : "text",
                regex : "\\s+"
            } ]
        };
        this.normalizeRules();
        var completions = [];
        var addCompletions = function(arr, meta) {
            arr.forEach(function(v) {
                completions.push({
                    name: v + '(',
                    value: v,
                    score: 0,
                    meta: meta
                });
            });
        };
        addCompletions(builtinFunctions.split('|'), 'function');
        this.completions = completions;
    };

    oop.inherits(InfaHighlightRules, TextHighlightRules);

    exports.InfaHighlightRules = InfaHighlightRules;
});

ace.define("ace/mode/transformations",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/sql_highlight_rules","ace/range"], function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var InfaHighlightRules = require("./sql_highlight_rules").InfaHighlightRules;
    var Range = require("../range").Range;

    var Mode = function() {
        this.HighlightRules = InfaHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function() {

        this.lineCommentStart = "--";
        this.getCompletions = function(state, session, pos, prefix) {
            return session.$mode.$highlightRules.completions;
        };
        this.$id = "ace/mode/sql";
    }).call(Mode.prototype);

    exports.Mode = Mode;

});
