// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {
    
    $(FILTER_BY_TEAM_INPUT).select2();

    // make the request when the user changes the filter to another team
    $(FILTER_BY_TEAM_INPUT).change(async function(){

        const projectId = getProjectId();

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

                    let optionText = formatSprintText(sprint, isSelected);
                    
                    updateSelectOption(
                        WORK_ITEM["sprint"], 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText},
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
