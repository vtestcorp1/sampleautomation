/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

blink.app.factory('SlickColumns', ['dataRuleService',
    'tableUtil',
    'util',
    function(dataRuleService,
         tableUtil,
         util) {

        function BaseColumn(config) {
            $.extend(this, config);
            this.id = this.field;
        }

        function EditableTextColumn(config, isReadOnly) {
            this.editor = tableUtil.TextCellEditor;
            this.autoEdit = true;
            this.editable = true;
            this.cssClass = 'column-name-cell';
            this.formatter = tableUtil.editableTextFormatter(isReadOnly);
            EditableTextColumn.__super.call(this, config);
        }

        util.inherits(EditableTextColumn, BaseColumn);

        function SelectEditColumn(config, isEditingAllowed) {
            this.editor = isEditingAllowed && tableUtil.SelectCellEditor;
            this.autoEdit = true;
            this.getOptions = dataRuleService.getEnumOptions;
            this.cssClass = isEditingAllowed ? 'drop-down-cell' : 'drop-down-cell-readonly tip-container';
            this.formatter = tableUtil.plainTextFormatter;
            SelectEditColumn.__super.call(this, config);
        }
        util.inherits(SelectEditColumn, BaseColumn);

        function BooleanEditColumn(config, isEditingAllowed) {
            this.formatter = tableUtil.onOffSwitchFormatter;
            this.editor = isEditingAllowed && tableUtil.BooleanCellEditor;
            this.getOption = dataRuleService.getBoolOption;
            this.cssClass = isEditingAllowed ? '' : 'tip-container';
            BooleanEditColumn.__super.call(this, config);
        }
        util.inherits(BooleanEditColumn, BaseColumn);

        function NumberEditColumn(config, isReadOnly) {
            this.editor = Slick.Editors.Integer;
            this.formatter = tableUtil.NumberFormatter(isReadOnly);
            this.autoEdit = true;
            this.cssClass = 'column-name-cell';
            NumberEditColumn.__super.call(this, config);
        }
        util.inherits(NumberEditColumn, BaseColumn);

        return {
            BaseColumn: BaseColumn,
            EditableTextColumn: EditableTextColumn,
            SelectEditColumn: SelectEditColumn,
            BooleanEditColumn: BooleanEditColumn,
            NumberEditColumn: NumberEditColumn
        };

    }]);
