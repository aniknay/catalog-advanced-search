define([
    'jquery',
    'calendarOptions',
    'jquery/ui',
    'domReady!',
    'mage/calendar'
], function($, calendarOpt){
    'use strict';

    function addNewHiddenInput($input) {
        const min = 1000;
        const max = 0;
        let rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        const newHiddenInputId = 'dateServer' + String(rand);
        const $inputDateServer = $('<input id="'+newHiddenInputId+'" name="DATE_FROM" type="hidden">');
         $input.calendar($.extend(calendarOpt, {altField: `#`+newHiddenInputId}));
        return $inputDateServer;
    }

    return {

        addToRow: function (obj, cell) {
            obj.appendTo(cell);
        },

        addSelect: function (data, cell, className, name) {
            className = className || '';
            name = name || '';
            function renderSelect(target, data) {

                function createOptionText(text, i) {
                    let value='';
                    switch (text) {
                        case 'равно':
                            value = 'eq';
                            i = value;
                            break;
                        case 'между':
                            value = 'between';
                            i = value;
                            break;
                        case 'включает':
                            value = 'like';
                            i = value;
                            break;

                        default:
                            value = text;
                            break;
                    }
                    return '<option id="' + i + '"  value="' + i + '">' + text + '</option>';
                }

                function appendElToTarget(target, el, i) {
                    $(createOptionText(el, i)).appendTo(target);
                }


                $.each(data, function (i, item) {
                    appendElToTarget(target, item, i);  //i при создании может быть не нужен
                });
            }

            const $select = $('<select name="'+ name + '" class="form-select form-control '+ className +' ">');
            renderSelect($select, data);
            this.addToRow($select, cell);
        },

        addButton: function (btn, cell){
            this.addToRow(btn,cell);
        },

        addDateBlock: function (cell, className){
            className = className || '';
            const $wrapper =  $('<div class="options-data  '+ className +' "/>');

            const $input = $('<input type="text" class="js-calendar required-entry form-control" name="created_at"  autocomplete="off" aria-required="true">');

            const $calendarImg = $('<div class="calendar-img"/>');
            $calendarImg.on('click', function () {
                $(this).prev('input').focus();
            });

            const $inputDateServer = addNewHiddenInput($input);

            $input.appendTo($wrapper);
            $calendarImg.appendTo($wrapper);
            $inputDateServer.appendTo($wrapper);
            this.addToRow($wrapper, cell);
        },

        addPeriodDateBlock: function (cell, className){
            className = className || '';
            const $wrapper = $('<div class="options-data  '+ className +' "/>');

            const $inputFrom = $('<input type="text" class="js-calendar options__input required-entry form-control" name="created_at"  autocomplete="off" aria-required="true" >');
            $inputFrom.appendTo($wrapper);

            const $calendarImgFrom = $('<div class="calendar-img">');
            $calendarImgFrom.on('click', function () {
                $(this).prev('input').focus();
            });
            $calendarImgFrom.appendTo($wrapper);

            const $inputDateFromServer = addNewHiddenInput($inputFrom);
            $inputDateFromServer.appendTo($wrapper);

            const $between = $('<span class="options__dash">и</span>');
            $between.appendTo($wrapper);


            const $inputTo = $('<input type="text" class="js-calendar options__input required-entry form-control" name="created_at"  autocomplete="off" aria-required="true" >');
            $inputTo.appendTo($wrapper);
            const $calendarImgTo = $('<div class="calendar-img">');
            $calendarImgTo.on('click', function () {
                $(this).prev('input').focus();
            });
            $calendarImgTo.appendTo($wrapper);

            const $inputDateToServer = addNewHiddenInput($inputTo);
            $inputDateToServer.appendTo($wrapper);

            this.addToRow($wrapper, cell);
        },

        addInput: function (cell, className, name) {
            className = className || '';
            name = name || '';
            const $input = $('<input type="text" name="'+ name + '" class="form-input form-control '+ className +' ">');
            this.addToRow($input, cell);
        },

        createCell: function (row){
            return $('<td class="table-cell"></td>').appendTo(row);
        }
    }
});
