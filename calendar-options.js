define([], function () {
    return {
        storeLocale: 'ru_RU',
        dateFormat: 'dd.mm.yy', // For the user (russian format).
        altFormat: "yy-mm-dd",  // For the server (to save in DB).
        // altField: '#myHiddenInput', // The hidden input for server-side date. Setup in initialization.
        firstDay: 1,
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь','Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        monthNamesShort: ['Янв', 'Фев', 'Мрт', 'Апр', 'Май', 'Июн','Июл', 'Авг', 'Сен', 'Окт', 'Нбр', 'Дек'],
        dayNames: ['Воскресение', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    }
});
