$(document).ready(function () {
    $('.timepicker').bootstrapMaterialDatePicker({
        date: false,
        shortTime: false,
        format: 'HH:mm'
    });

    $.material.init();
});