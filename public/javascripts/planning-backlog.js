// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {
    
    // start dragg event
    startDraggable(WORK_ITEM_TABLE);

    $(FILTER_BY_TEAM_INPUT).select2();

    // make the request when the user changes the filter to another team
    $(FILTER_BY_TEAM_INPUT).change(async function(){

        const projectId = $(PROJECT_ID).val();

        const teamId = $(this).val();

        const API_LINK_GET_WORK_ITEMS_AND_SPRINTS_BY_TEAM = `/dashboard/api/${projectId}/getworkItemsAndSprintsByTeam/${teamId}`;

        let response_error = null;
        let response = await make_get_request(API_LINK_GET_WORK_ITEMS_AND_SPRINTS_BY_TEAM).catch(err=> {
            response_error = err;
        });

        // Success message
        cleanTable(WORK_ITEM_TABLE);

        // change the select on the work item
        updateSelectOption(
            WORK_ITEM["team"], 
            UPDATE_TYPE.CHANGE,
            teamId
        );
        
        if (response){
            
            // Check work items
            if (_.isArray(response.workItems) && response.workItems.length > 0){
                appendToWotkItemTable(response.workItems, null, false);
            }else{
                $.notify("This team does not have any work item yet.", "error");
            }

            // clean the select option
            removeAllOptionsFromSelect(WORK_ITEM["sprint"], null);

            // Check sprint
            if (response.sprints && response.sprints.length > 0){
                
                // update the select option
                for (const sprint of response.sprints) {    
                    let isSelected = sprint["_id"].toString() == response["activeSprint"].toString();
                    // let optionText = `${sprint["name"]} : ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]}`;
                    updateSelectOption(
                        WORK_ITEM["sprint"], 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":sprint["name"]},
                        isSelected
                    );
                }
            }else{ 
               removeAllOptionsFromSelect(
                    WORK_ITEM["sprint"], 
                    {"text": "Not sprint found", "value": "0"},
                    true
                );
            }

            updateWorkItemFeedback();

        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
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
        // handle: ".handle" // TODO: Add icon to sort
        dropOnEmpty: false,
        delay: 400,
        start: function (e, ui) {
            // ui.item.addClass("selected");
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