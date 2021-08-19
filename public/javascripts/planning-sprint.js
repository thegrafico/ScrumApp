// =========== This function is fire as soon as the file is loaded after the HTML ===========

$(function () {
    $(FILTER_BY_SPRINT_INPUT).select2();
    $(FILTER_BY_TEAM_SPRINT).select2();

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
                    let isSelected = sprint["_id"].toString() == response["activeSprint"].toString();
                    let optionText = `${sprint["name"]} : ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]}`;
                    updateSelectOption(
                        FILTER_BY_SPRINT_INPUT, 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText},
                        isSelected
                    );
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
            }

            updateWorkItemFeedback();

        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        } 
    });

    // FILTER BY SPRINT
    $(FILTER_BY_SPRINT_INPUT).on("change", async function(updateAll){

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

        const API_LINK_GET_WORK_ITEMS_BY_TEAM_AND_SPRINT = `/dashboard/api/${projectId}/getSprintWorkItems/${teamId}/${sprintId}`;

        let response_error = null;
        let response = await make_get_request(API_LINK_GET_WORK_ITEMS_BY_TEAM_AND_SPRINT).catch(err=> {
            response_error = err;
        });

        // Success message
        cleanTable(WORK_ITEM_TABLE);

        if (response){
            
            // Check work items
            if (_.isArray(response.workItems) && response.workItems.length > 0){
                appendToWotkItemTable(response.workItems);
            }else{
                $.notify("This team does not have any work item yet.", "error");
            }

        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        } 

        updateWorkItemFeedback();
    });
});
