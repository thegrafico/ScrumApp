// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // start dragg event
    startDraggable(WORK_ITEM_TABLE);

    
});


function startDraggable(tableId){

    $(tableId).sortable({
        items: 'tr.rowValues',
        cursor: 'row-resize',
        axis: 'y',
        dropOnEmpty: false,
        start: function (e, ui) {
            ui.item.addClass("selected");
        },
        stop: function (e, ui) {
            resetColumnOrder();
        }
    });
}

/**
 * This functions reset the counter column everytime a value is dragged to another possition
 */
function resetColumnOrder(){
    let counter = 1;
    $("td.orderColumn").each(function() {
        $(this).text(counter);
        counter++;
    });
}