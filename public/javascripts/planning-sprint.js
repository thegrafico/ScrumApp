// =========== This function is fire as soon as the file is loaded after the HTML ===========

$(function () {
    $(FILTER_BY_SPRINT_INPUT).select2();
    $(FILTER_BY_TEAM_SPRINT).select2();

    // start dragg event
    startDraggable(WORK_ITEM_TABLE);

    // FILTER BY TEAM
    $(FILTER_BY_TEAM_SPRINT).on("change", async function(){
        const projectId = $(PROJECT_ID).val();

        const teamId = $(this).val();

        const API_LINK_GET_WORK_ITEMS_BY_TEAM_AND_SPRINT = `/dashboard/api/${projectId}/getAllSprintWorkItems/${teamId}`;

        let response_error = null;
        let response = await make_get_request(API_LINK_GET_WORK_ITEMS_BY_TEAM_AND_SPRINT).catch(err=> {
            response_error = err;
        });
        
        // Success message
        cleanTable(WORK_ITEM_TABLE);
        removeAllOptionsFromSelect(FILTER_BY_SPRINT_INPUT, null);
        removeAllOptionsFromSelect(WORK_ITEM["sprint"]);

        // updating modal create work item
        updateSelectOption(
            WORK_ITEM["team"], 
            UPDATE_TYPE.CHANGE,
            teamId
        );

        if (response){
            
            // Check work items
            if (_.isArray(response.workItems) && response.workItems.length > 0){
                appendToWotkItemTable(response.workItems);
            }else{
                removeAllOptionsFromSelect(
                    FILTER_BY_SPRINT_INPUT, 
                    {"text": "Not sprint found", "value": "0"},
                    true
                );
                $.notify("This team does not have any work item yet.", "error");
            }

            // Check sprint
            if (response.sprints.length > 0){
                
                // clean the select option
                removeAllOptionsFromSelect(FILTER_BY_SPRINT_INPUT, null);
                
                // update the select option
                for (const sprint of response.sprints) {

                    if (sprint["_id"] == UNASSIGNED_SPRINT["_id"]) {continue};
                    
                    let isSelected = sprint["_id"].toString() == response["activeSprint"].toString();
                    
                    let optionText = formatSprintText(sprint, isSelected);

                    // Updating Filter by sprint value
                    updateSelectOption(
                        FILTER_BY_SPRINT_INPUT, 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText},
                        isSelected
                    );

                    // Updating modal create work item
                    updateSelectOption(
                        WORK_ITEM["sprint"], 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText},
                        isSelected
                    );

                    
                    // in case the active sprint is a past or future sprint
                    if (isSelected && sprint["status"] != SPRINT_STATUS["Active"]){
                        let message = `This is a ${sprint["status"]} sprint.`;
                        showPopupMessage(FILTER_BY_SPRINT_INPUT, message);
                    }
                }
            }else{ 
               removeAllOptionsFromSelect(
                    FILTER_BY_SPRINT_INPUT, 
                    {"text": "Not sprint found", "value": "0"},
                    true
                );

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

    // FILTER BY SPRINT
    $(FILTER_BY_SPRINT_INPUT).on("change", async function(){

        const projectId = $(PROJECT_ID).val();
        const teamId = $(FILTER_BY_TEAM_SPRINT).val();
        const sprintId = $(this).val();

        // validate data
        if (!_.isString(projectId)){
            $.notify("Invalid data is selected.", 'error');
            return;
        }

        // validate team
        if (!_.isString(teamId) || teamId == "0"){
            $.notify("Invalid team is selected.", 'error');
            return;
        }

        // validate sprint
        if (!_.isString(sprintId) || sprintId == "0"){
            $.notify("Invalid sprint is selected.", 'error');
            return;
        }

        const currentPage = $(CURRENT_PAGE_ID).val(); 

        const API_LINK_GET_WORK_ITEMS_BY_TEAM_AND_SPRINT = `/dashboard/api/${projectId}/getSprintWorkItems/${teamId}/${sprintId}?location=${currentPage}`;

        let response_error = null;
        let response = await make_get_request(API_LINK_GET_WORK_ITEMS_BY_TEAM_AND_SPRINT).catch(err=> {
            response_error = err;
        });

        // Success message
        cleanTable(WORK_ITEM_TABLE);

        if (response){
            
            // Check work items
            if (!_.isUndefined(response.workItems) && !_.isEmpty(response.workItems)){

                switch(currentPage){
                    case PAGES["SPRINT"]: 
                        // sprint planning
                        appendToWotkItemTable(response.workItems);
                        break;
                    case PAGES["SPRINT_BOARD"]:
                        cleanSprintBoard();
                        addWorkItemsToBoard(response.workItems);
                        break;
                    default:
                        console.log("undefined pages");
                        break;
                }

            }else{
                $.notify("This team does not have any work item yet.", "error");
            }

        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        } 

        updateWorkItemFeedback();
    });
});

/**
 * Add work items to board
 * @param {Object} workItems 
 */
function addWorkItemsToBoard(workItems){
    
    for (let status of Object.keys(workItems)){

        // jump to other iteration
        if (_.isEmpty(workItems[status])){ continue;}

        for (let workItem of workItems[status]){
            addWorkItemToBoard(workItem, null);
        }
    }
}

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
        stop: async function (e, ui) {

            // getting the current draggable element
            const rowElement = ui.item;
            
            // the parent element have the status where the dragble element was moved
            let workItemId = $(rowElement).attr("id");
            let newIndex = $(rowElement).index();

            console.log("Moving Work item to index: ", newIndex);

            let requestData = {
                "index": newIndex,
                "location": $(CURRENT_PAGE_ID).val(),
            };

            await updateWorkItemBoard(workItemId, requestData);

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
