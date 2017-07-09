/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Naresh Kumar (naresh.kumar@thoughtspot.com)
 *
 * @fileoverview Spec for sage namespace translator.
 */

'use strict';

/* jshint camelcase: false, undef: false */
/* global addCustomMatchers */

describe('Sage ACContext compression/decompression', function() {
    var guid1 = "00000000-0000-0000-0000-000000000001";
    var name1 = "test_name1";
    var guid2 = "00000000-0000-0000-0000-000000000002";
    var name2 = "test_name2";

    function createHeader(guid, name) {
        var header = new sage.EntityHeader();
        header.setGuid(guid);
        header.setName(name);
        return header;
    }

    it('should compress sage context basic', function() {
        var context = new sage.ACContext();
        var table = new sage.ACTable();
        table.setHeader(createHeader(guid1, name1));
        context.setTable([table]);

        context = sage.compressACContext(context);
        expect(context.getTables()[0].getHeader().getGuid()).toBe("0");
        expect(context.getTables()[0].getHeader().getName()).toBe(null);
        expect(context.getHeaderDef()[0].getGuid()).toBe(guid1);
        expect(context.getHeaderDef()[0].getName()).toBe(name1);
        expect(context.getVersion()).toBe(sage.ACContext.Version.V2);
    });

    it('should not compress headers outside of context', function() {
        var request = new sage.SaveFormulaRequest();
        var table = new sage.ACTable();
        // should be compressed.
        table.setHeader(createHeader(guid1, name1));
        var context = new sage.ACContext();
        context.setTable([table]);
        request.setContext(context);

        var formula = new sage.ACFormula();
        // should not be compressed.
        formula.setHeader(createHeader(guid1, name1));
        request.setFormula(formula);

        request = sage.compressACContext(request);
        var context = request.getContext();
        expect(context.getTables()[0].getHeader().getGuid()).toBe("0");
        expect(context.getTables()[0].getHeader().getName()).toBe(null);
        expect(context.getHeaderDef()[0].getGuid()).toBe(guid1);
        expect(context.getHeaderDef()[0].getName()).toBe(name1);
        // Header inside formula should not be modified.
        var formula = request.getFormula();
        expect(formula.getHeader().getGuid()).toBe(guid1);
        expect(formula.getHeader().getName()).toBe(name1);
        expect(context.getVersion()).toBe(sage.ACContext.Version.V2);
    });

    it('should not compress shared headers outside of context', function() {
        var header = createHeader(guid1, name1);
        var metadata = new sage.TokenMetadata();
        metadata.setTable(header);
        var rt = new sage.RecognizedToken();
        rt.setTokenMetadata(metadata);

        var request = new sage.SaveFormulaRequest();
        var table = new sage.ACTable();
        // should be compressed.
        table.setHeader(header);
        var formatted = new sage.FormattedTokens();
        formatted.setToken([rt]);
        table.setFormatted(formatted);
        var context = new sage.ACContext();
        context.setTable([table]);
        request.setContext(context);

        var formula = new sage.ACFormula();
        // should not be compressed.
        formula.setHeader(header);
        formula.setToken([rt]);
        request.setFormula(formula);

        request = sage.compressACContext(request);
        var context = request.getContext();
        expect(context.getTables()[0].getHeader().getGuid()).toBe("0");
        expect(context.getTables()[0].getHeader().getName()).toBe(null);
        expect(context.getHeaderDef()[0].getGuid()).toBe(guid1);
        expect(context.getHeaderDef()[0].getName()).toBe(name1);
        // Header inside formula should not be modified.
        var formula = request.getFormula();
        expect(formula.getHeader().getGuid()).toBe(guid1);
        expect(formula.getHeader().getName()).toBe(name1);
        expect(context.getVersion()).toBe(sage.ACContext.Version.V2);
        // Header inside RecognizedToken of formula should not be modified.
        metadata = formula.getToken()[0].getTokenMetadata();
        expect(metadata.getTable().getGuid()).toBe(guid1);
        expect(metadata.getTable().getName()).toBe(name1);
    });

    it('should compress array of headers in sage context', function() {
        var header1 = createHeader(guid1, name1);
        var header2 = createHeader(guid2, name2);
        var table = new sage.ACTable();
        table.setHeader(header1);
        table.setColumn([header1, header2, header1, header2]);

        var context = new sage.ACContext();
        context.setTable([table]);

        context = sage.compressACContext(context);
        expect(context.getTables()[0].getHeader().getGuid()).toBe("0");
        var columns = context.getTables()[0].getColumn();
        expect(columns[0].getGuid()).toBe("0");
        expect(columns[1].getGuid()).toBe("1");
        expect(columns[2].getGuid()).toBe("0");
        expect(columns[3].getGuid()).toBe("1");
        // Verify collected header definitions.
        expect(context.getHeaderDef()[0].getGuid()).toBe(guid1);
        expect(context.getHeaderDef()[0].getName()).toBe(name1);
        expect(context.getHeaderDef()[1].getGuid()).toBe(guid2);
        expect(context.getHeaderDef()[1].getName()).toBe(name2);
        expect(context.getVersion()).toBe(sage.ACContext.Version.V2);
    });

    it('should not compress if version is V2', function() {
        var table = new sage.ACTable();
        table.setHeader(createHeader(guid1, name1));
        var context = new sage.ACContext();
        context.setTable([table]);
        context.setVersion(sage.ACContext.Version.V2);

        context = sage.compressACContext(context);
        expect(context.getTables()[0].getHeader().getGuid()).toBe(guid1);
        expect(context.getTables()[0].getHeader().getName()).toBe(name1);
        expect(context.getHeaderDef().length).toBe(0);
        expect(context.getVersion()).toBe(sage.ACContext.Version.V2);
    });

    it('should ignore empty and shorter guids during compression', function() {
        var table = new sage.ACTable();
        table.setHeader(createHeader("guid1", name1));
        table.setColumn([createHeader("", name2), createHeader(guid1, name1)]);
        var context = new sage.ACContext();
        context.setTable([table]);

        context = sage.compressACContext(context);
        expect(context.getTables()[0].getHeader().getGuid()).toBe("guid1");
        expect(context.getTables()[0].getHeader().getName()).toBe(name1);
        var columns = context.getTables()[0].getColumn();
        expect(columns[0].getGuid()).toBe("");
        expect(columns[0].getName()).toBe(name2);
        expect(columns[1].getGuid()).toBe("0");
        expect(columns[1].getName()).toBe(null);
        expect(context.getHeaderDef().length).toBe(1);
        expect(context.getVersion()).toBe(sage.ACContext.Version.V2);
    });

    it('should ignore non interger guids during decompression', function() {
        var table = new sage.ACTable();
        table.setHeader(createHeader("0", null));
        table.setColumn([createHeader("invalid_guid", "invalid_name"),
            createHeader("2", "name2")]);
        var context = new sage.ACContext();
        context.setTable([table]);
        context.setHeaderDef([createHeader(guid1, name1)]);
        context.setVersion(sage.ACContext.Version.V2);

        context = sage.decompressACContext(context);
        expect(context.getTables()[0].getHeader().getGuid()).toBe(guid1);
        expect(context.getTables()[0].getHeader().getName()).toBe(name1);
        var columns = context.getTables()[0].getColumn();
        expect(columns[0].getGuid()).toBe("invalid_guid");
        expect(columns[0].getName()).toBe("invalid_name");
        expect(columns[1].getGuid()).toBe("2");
        expect(columns[1].getName()).toBe("name2");
        expect(context.getHeaderDef()).toBe(null);
        expect(context.getVersion()).toBe(sage.ACContext.Version.V1);
    });

    it('should not decompress if version is null', function(){
        var table = new sage.ACTable();
        table.setHeader(createHeader("0", null));
        var context = new sage.ACContext();
        context.setTable(table);
        context.setHeaderDef([createHeader(guid1, name1)]);

        context = sage.decompressACContext(context);
        expect(context.getTables()[0].getHeader().getGuid()).toBe("0");
        expect(context.getTables()[0].getHeader().getName()).toBe(null);
        expect(context.getHeaderDef().length).toBe(1);
    });

    it('should not decompress if version is V1', function(){
        var table = new sage.ACTable();
        table.setHeader(createHeader("0", null));
        var context = new sage.ACContext();
        context.setTable(table);
        context.setHeaderDef([createHeader(guid1, name1)]);
        context.setVersion(sage.ACContext.Version.V1);

        context = sage.decompressACContext(context);
        expect(context.getTables()[0].getHeader().getGuid()).toBe("0");
        expect(context.getTables()[0].getHeader().getName()).toBe(null);
        expect(context.getHeaderDef().length).toBe(1);
    });

    it('should decompress sage context basic', function() {
        var header1 = createHeader("0", null);
        var header2 = createHeader("1", null);
        var table = new sage.ACTable();
        table.setHeader(header1);
        table.setColumn([header1, header2, header1, header2]);

        var context = new sage.ACContext();
        context.setTable([table]);
        context.setHeaderDef([createHeader(guid1,name1),
            createHeader(guid2, name2)]);
        context.setVersion(sage.ACContext.Version.V2);

        context = sage.decompressACContext(context);
        expect(context.getTables()[0].getHeader().getGuid()).toBe(guid1);
        expect(context.getTables()[0].getHeader().getName()).toBe(name1);
        var columns = context.getTables()[0].getColumn();
        expect(columns[0].getGuid()).toBe(guid1);
        expect(columns[0].getName()).toBe(name1);
        expect(columns[1].getGuid()).toBe(guid2);
        expect(columns[1].getName()).toBe(name2);
        expect(columns[2].getGuid()).toBe(guid1);
        expect(columns[2].getName()).toBe(name1);
        expect(columns[3].getGuid()).toBe(guid2);
        expect(columns[3].getName()).toBe(name2);
        expect(context.getHeaderDef()).toBe(null);
        expect(context.getVersion()).toBe(sage.ACContext.Version.V1);
    });
});
