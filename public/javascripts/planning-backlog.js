// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // start dragg event
    startDraggable(WORK_ITEM_TABLE);

    $("#filterByTeam").select2();


    // make the request when the user changes the filter to another team
    $("#filterByTeam").change(async function(){

        const projectId = $(PROJECT_ID).val();

        const teamId = $(this).val();

        const API_LINK_GET_WORK_ITEMS_BY_TEAM = `/dashboard/api/${projectId}/getworkItemsByTeamId/${teamId}`;

        let response_error = null;
        let response = await make_get_request(API_LINK_GET_WORK_ITEMS_BY_TEAM).catch(err=> {
            response_error = err;
        });

        // Success message
        if (response){
            if (response.length > 0){
                appendToWotkItemTable(response);
            }else{
                $.notify("This team does not have any work item yet.", "error");
            }
        }else{ // error messages
            $.notify(response_error.data.responseText, "error");
        }
    });
    
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