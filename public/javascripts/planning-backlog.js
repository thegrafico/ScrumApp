// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // start dragg event
    startDraggable(WORK_ITEM_TABLE);

    $("#filterByTeam").select2();
    
});

/**
 * Make the work item table dragable
 * @param {String} tableId 
 */
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
 * This function is used by startDraggable to reset the order column in the table. 
 * So every time the columns chage the order, this function reset the value
 */
function resetColumnOrder(){
    let counter = 1;
    $("td.orderColumn").each(function() {
        $(this).text(counter);
        counter++;
    });
}