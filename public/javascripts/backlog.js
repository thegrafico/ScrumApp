// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {
    
    $(FILTER_BY_TEAM_INPUT).select2();

    // make the request when the user changes the filter to another team
    $(FILTER_BY_TEAM_INPUT).change(async function(){
        
        const teamId = $(this).val();

        // clean the table
        cleanTable(WORK_ITEM_TABLE);

        const {response, response_error} = await getWorkItemsAndSprintsByTeamId(teamId);

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
