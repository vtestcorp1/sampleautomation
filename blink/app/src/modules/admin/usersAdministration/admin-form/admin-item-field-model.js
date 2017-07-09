/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Controller showing admin tabsd
 */

'use strict';


blink.app.factory("AdminItemFieldModel", function(){

    /**
     *
     * @param key
     * @param name
     * @param type
     * @param inputType
     * @param label
     * @param autoFocus
     * @param required
     * @constructor
     */
    function AdminItemFieldModel(key, name, type, inputType, label, onChange, required, autoFocus, enabled) {
        this.required = !!required;
        this.autoFocus = !!autoFocus;
        this.enabled = !!enabled;
        this.modelKey = key;
        this.name = name;
        this.label = label;
        this.onChange = onChange;
        this.type = type;
        this.inputType = inputType;
    }

    return AdminItemFieldModel;
});
