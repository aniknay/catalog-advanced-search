define([
    'jquery',
    'tableForm',
    'mage/url',
    'Magento_Catalog/js/price-utils',
    'jquery/ui',
    'mage/translate',
    'domReady!',
    'mage/calendar'

], function ($, tableForm, urlBuilder, priceUtils) {
    'use strict';

    const vars = {
        equalAndBInclude: ['равно', 'включает'],
        equalAndBetween: ['равно', 'между'],
    };

    const categorySet = [
        {
            field: 'Номер заказа Л`Ореаль',
            field_val: 'increment_id',
            condition_types: vars.equalAndBInclude
        },
        {
            field: 'Дата создания',
            field_val: 'created_at',
            condition_types: vars.equalAndBetween
        },
        {
            field: 'Мой номер заказа',
            field_val: 'customer_number',
            condition_types: vars.equalAndBInclude
        },
        {
            field: 'Подразделение',
            field_val: 'sales_division',
            condition_types: vars.equalAndBInclude
        },
        {
            field: 'Статус',
            field_val: 'status_label',
            field_sorting_val: 'status',
            condition_types: vars.equalAndBInclude
        },
    ];

    const subdivisionData = {'0100':'CPD', '0200':'PPD', '0300':'LLD', '0400':'DCA', '0500':'INNEOV',
        '0600':'Intragroup sales', '0700':'Intragroup sale LOKA', '0900':'DIVERS ENT. GESTION',
        '0950':'DEG INNEOV', '0960':'Divers ent. gestion', '0970': 'R&D', '1000': 'DEG Sales2Loreal',
        '1100':'SO Produits publics', '1200':'SO Coiffure', '1300':'SO Coiffure', '1400':'SO Cosmetique active',
        '1500':'SELL OUT INNEOV', 'K010':'CPD', 'K020':'PPD', 'K030':'LLD', 'K040':'DCA', 'K090':'DIVERS ENT. GESTION'};
    const statusData = {'new':'Открытый', 'picking':'На сборке', 'shipped':'Отгружен', 'cancelled':'Отменен'};
    const consignee_idData = $('#ordersSearchForm').data('consignee-options');

    if (consignee_idData) {
        for (const key in consignee_idData) {
            if (consignee_idData[key] === 'Все') {
                delete consignee_idData[key];
            }
        }

        categorySet.push({
            field: 'Грузополучатель',
            field_val: 'consignee_id',
            condition_types: ['равно']
        })
    }

    /**
     * Converting an array of objects into an array of strings
     * @param arrayOfObjects
     * @returns {Array}
     */
    function getStringArrayFromData(arrayOfObjects) {
        let result = [];
        for (let i = 0; i < arrayOfObjects.length; i++) {
            result.push(arrayOfObjects[i].field);
        }
        return result;
    }

    /**
     * Create a new row of the table
     * @param el
     */
    function addRowToTable(el) {
        let $row = $('<tr class="table-row">', {
            className: 'form-row'
        });

        tableForm.addSelect(getStringArrayFromData(categorySet), tableForm.createCell($row), 'attributeName', 'field');
        tableForm.addSelect(categorySet[0].condition_types, tableForm.createCell($row), 'condition', 'condition_type');
        tableForm.addInput(tableForm.createCell($row), 'search-value', 'increment_id');
        tableForm.addButton($(`<button class="btn btn-outline-dark btn-add" title="+" type="button">+</button>`), tableForm.createCell($row));
        tableForm.addButton($(`<button class="btn btn-outline-dark btn-del" title="-" type="button">-</button>`), tableForm.createCell($row));

        $row.appendTo(el);

        initEvents($row);
    }

    /**
     * Change select options
     * @param el
     * @param newOptions
     */
    function changeOperationBlock(el, newOptions) {
        el.empty();
        $.each(newOptions, function (i, item) {
            let value = '';
            switch (item) {
                case 'равно':
                    value = 'eq';
                    break;
                case 'между':
                    value = 'between';
                    break;
                case 'включает':
                    value = 'like';
                    break;

                default:
                    value = 'eq';
                    break;
            }
            el.append($('<option></option>')
                .attr('id', i).attr('value', value).text(item));
        });
    }

    /**
     * Change type of value-block
     * @param fieldNameSelectorId
     * @param conditionTypeId
     * @param cell
     */
    function changeDataBlock(fieldNameSelectorId, conditionTypeId, cell) {
        cell.empty();
        switch (Number(fieldNameSelectorId)) {
            case 0:
                tableForm.addInput(cell, 'search-value', 'increment_id');
                break;
            case 1:
                if (Number(conditionTypeId) === 0) {
                    tableForm.addDateBlock(cell, 'search-value');
                }
                else {
                    tableForm.addPeriodDateBlock(cell, 'search-value');
                }
                break;
            case 2:
                tableForm.addInput(cell, 'search-value', 'customer_number');
                break;
            case 3:
                tableForm.addSelect(subdivisionData, cell, 'search-value', 'sales_organization');
                break;
            case 4:
                tableForm.addSelect(statusData, cell, 'search-value', 'status');
                break;
            case 5:
                tableForm.addSelect(consignee_idData, cell, 'search-value', 'consignee_id');
                break;
            default:
                tableForm.addInput(cell, 'search-value', 'increment_id');
                break;
        }
    }

    /**
     * Get selected data from row to object
     * @param row
     * @returns {{field: *, condition_type: *, value: *}}
     */
    function getRowData(row) {
        const field = row.find('.attributeName').val();
        const condition_type = row.find('.condition').val();
        let $valueElement = row.find('.search-value');
        if (($valueElement).is('div')) {
            $valueElement = $valueElement.find('.js-calendar');
        }
        const value = $valueElement.val();
        const data = {
            field: field,
            value: value,
            condition_type: condition_type
        };
        if ($valueElement.length > 1) {
            data.value = [value, $valueElement.last().val()];
        }
        return data;
    }

    /**
     * Set data from object to row
     * @param row
     * @param currentRowData
     */
    function setRowData(row, currentRowData) {
        const $fieldEl = row.find('.attributeName');
        const $condition_typeEl = row.find('.condition');
        let $valueElement = row.find('.search-value');
        if (($valueElement).is('div')) {
            $valueElement = $valueElement.find('.js-calendar');
        }

        $fieldEl.val(currentRowData.field);
        $condition_typeEl.val(currentRowData.condition_type);
        $valueElement.val(currentRowData.value);

        if ($valueElement.length > 1) {
            $valueElement.val(currentRowData.value[0]);
            $valueElement.last().val(currentRowData.value[1]);
        }
    }

    /**
     * Event handlers initialization
     * @param row
     */
    function initEvents(row) {

        const $fieldNameSelector = row.find('.attributeName');
        const $conditionTypeSelector = row.find('.condition');
        const $valueCell = $conditionTypeSelector.parent().next();

        /**
         * Changing 1st on changing 1st
         */
        $fieldNameSelector.on('change', function (e) {
            const selectedId = $(e.target).find(':selected').attr('id');
            const condition_types = categorySet[selectedId].condition_types;

            const $condition = row.find('.condition');
            const $valueCell = $(e.target).parent().next().next();

            $condition.trigger('changed:fieldName', [selectedId, condition_types]);
            $valueCell.trigger('changed:fieldName', [selectedId, condition_types]);

        });

        /**
         * Changing 2nd on changing 1st
         */
        $conditionTypeSelector.on('changed:fieldName', function (e, selectedId, condition_types) {
            const $condition = $(e.target);
            changeOperationBlock($condition, condition_types);

            const $cell = $condition.parent().next();
            changeDataBlock(selectedId, 0, $cell);

        });

        /**
         * Changing 2nd on changing 2nd
         */
        $conditionTypeSelector.on('change', function (e) {
            const selectedId = $(e.target).find(':selected').attr('id');
            $(e.target).parent().next().trigger('changed:conditionType', [selectedId]);

        });

        /**
         * Changing 3rd on changing 1st
         */
        $valueCell.on('changed:fieldName', function (e, selectedId) {
            changeDataBlock(selectedId, 0, $(e.target));
        });

        /**
         * Changing 3rd on changing 2nd
         */
        $valueCell.on('changed:conditionType', function (e, selectedId) {
            const $cell = $(e.target);
            const $fieldName = $(e.target).parent().find('.attributeName');
            const fieldNameId = $fieldName.find(':selected').attr('id');
            changeDataBlock(fieldNameId, selectedId, $cell);
        });

        /**
         * Plus button click handler
         */
        const $btnAdd = row.find('.btn-add');
        $btnAdd.click(function (ev) {
            const $currentRow = $(ev.target).parent().parent();
            const $newRow = $currentRow.clone();
            initEvents($newRow);
            $currentRow.after($newRow);

            // Search and re-initialization of calendars in a new row
            const calendars = $newRow.find('.js-calendar');
            const calendarsCount = calendars.length;
            const cell = calendars.parent().parent();
            cell.empty();
            if (calendarsCount > 1) {
                tableForm.addPeriodDateBlock(cell, 'search-value');
            }
            else tableForm.addDateBlock(cell, 'search-value');

            // Copy data to a new row
            setRowData($newRow, getRowData($currentRow));


        });

        /**
         * Minus button click handler
         */
        const $btnDel = row.find('.btn-del');
        $btnDel.click(function (ev) {
            const $currentRow = $(ev.target).parent().parent();
            $currentRow.remove();
        });

    }

    /**
     * Create new select query
     * @param formData
     * @returns {{searchCriteria: {filter_groups: {filters: Array[]}[]}}}
     */
    function createQuery(formData) {
        let dataSet = [];

        for (let i = 0; i < formData.length; i += 3) {
            let data = {};

            data['condition_type'] = formData[i + 1].value;
            data['field'] = formData[i + 2].name;
            data['value'] = formData[i + 2].value;

            //if field is date
            if (data.field === 'created_at' && data['condition_type'] === 'eq') {
                data['value'] = formData[i + 3].value;
                i++;
            }

            if (data['condition_type'] === 'like') {
                data['value'] = '%' + data['value'] + '%';
            }

            //if field is period
            if (data['condition_type'] === 'between') {
                let dataFrom = {};

                dataFrom.field = data.field;
                dataFrom.value = formData[i + 3].value;
                dataFrom['condition_type'] = 'from';

                if (dataFrom.value) {
                    dataSet.push({'filters': [dataFrom]});
                }

                let dataTo = {};
                dataTo.field = data.field;
                dataTo.value = formData[i + 5].value;

                dataTo['condition_type'] = 'to';

                if (dataTo.value) {
                    dataSet.push({'filters': [dataTo]});
                }

                i+=3;
            } else {
                if (data.value) {
                    dataSet.push({'filters': [data]});
                }
            }
        }

        return {
            searchCriteria: {
                'filter_groups': dataSet
            }
        };
    }

    function initTable(url, el) {
        const $resetBtn = $(el).find('.search-reset');
        const $tableBody = $(el).find('.table-body');
        const $warning = $(el).find('.search-form-warning');

        addRowToTable($tableBody);

        $resetBtn.click(function () {
            $('.pager').show('slow');
            $tableBody.empty();
            $warning.addClass('hidden');

            const searchCriteria = {
                searchCriteria: {
                    'page_size': $('#limiter option:selected').text().trim(),
                    'current_page': $('.pager .item.current span:not(.label)').text().trim()
                }
            };

            sendQuery(url, searchCriteria);

            addRowToTable($tableBody);
        });

    }

    function formatPrice(price) {
        price = price || 0;
        const priceOptions = {
            requiredPrecision: 2,
            decimalSymbol: '.',
        };

        return priceUtils.formatPrice(price, priceOptions);
    }

    function formatDate(dateStr) {
        if (dateStr) {
            dateStr = dateStr.replace(' ', 'T');
            const options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            };

            return new Date(dateStr).toLocaleDateString('ru-RU', options);
        }

        return '';
    }

    function sendQuery(url, query) {
        const $tbody = $('#ordersTableContent');

        $.ajax(url, {
            data: query
        }).done(function (resp) {
            const $tempTbody = $('<tbody>');


            resp.items.forEach(function (item) {
                // Order fields with default values (may be `undefined` sometimes)
                const {
                    entity_id,
                    increment_id,
                    created_at,
                    subtotal
                } = item;

                const {
                    sales_organization: organization_name,
                    sales_division: division_name,
                    customer_number,
                    status_label,
                    shipped_total,
                    shipping_at,
                    invoice_document,
                    proforma_document,
                    delivery_document
                } = item.extension_attributes;

                const row = `
                        <tr>
                            <td><input type="checkbox" value="${entity_id}"></td>
                            <td>${organization_name}
                            <td>${division_name}
                            <td>
                                <a href="${urlBuilder.build('/sales/order/view/order_id/' + entity_id)}">
                                    ${increment_id}
                                </a>
                            </td>
                            <td>${customer_number}</td>
                            <td>${formatDate(created_at)}</td>
                            <td>${status_label}</td>
                            <td class="td-price">${formatPrice(subtotal)}</td>
                            <td class="td-price">${formatPrice(shipped_total)}</td>
                            <td>${formatDate(shipping_at)}</td>
                            <td>${proforma_document}</td>
                            <td>${delivery_document}</td>
                            <td>${invoice_document}</td>
                        </tr>`;
                $tempTbody.append(row);
            });

            $tbody.html($tempTbody.html());
        });

    }

    return function (config, el) {
        const url = config.url;
        initTable(url, el);
        const $form = $(el);

        $form.on('submit', function (ev) {
            ev.preventDefault();

            const formData = $form.serializeArray();
            const searchCriteria = createQuery(formData);

            sendQuery(url, searchCriteria);
            $('.pager').hide('slow');
        });

        // Sorting
        const $sortOrderOption = $('#sortOrderOption');
        const $sortOptionSelectForm = $('#sortOptionSelectForm');
        const options = categorySet.map(item => {
            return `<option value="${item.field_sorting_val || item.field_val}">${item.field}</option>`;
        });

        $sortOptionSelectForm
            .html(options)
            .on('change', sortOrders);

        $sortOrderOption.on('click', function() {
            $sortOrderOption.toggleClass('sort-asc').toggleClass('sort-desc');
            sortOrders();
        });
        
        function sortOrders() {
            const formData = $form.serializeArray();
            const searchCriteria = createQuery(formData);
            const sortOrder = $sortOrderOption.hasClass('sort-asc') ? 'ASC' : 'DESC';


            searchCriteria.searchCriteria.sortOrders = [{
                field:  $sortOptionSelectForm.val(),
                direction: sortOrder
            }];

            sendQuery(url, searchCriteria);
            $('.pager').hide('slow');
        }
    }
});
