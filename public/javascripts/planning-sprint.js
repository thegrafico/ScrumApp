// =========== This function is fire as soon as the file is loaded after the HTML ===========
const FILTER_BY_SPRINT_INPUT = "#filterBySprint";
const FILTER_BY_TEAM_SPRINT = "#filter-by-team-sprint";

$(function () {
    $(FILTER_BY_SPRINT_INPUT).select2();
    $(FILTER_BY_TEAM_SPRINT).select2();

    // FILTER BY TEAM IN SPRINT
    $(FILTER_BY_TEAM_SPRINT).on("change", async function(){
        const projectId = $(PROJECT_ID).val();

        const teamId = $(this).val();

        const API_LINK_GET_WORK_ITEMS_BY_TEAM_AND_SPRINT = `/dashboard/api/${projectId}/getSprintWorkItems/${teamId}`;

        let response_error = null;
        let response = await make_get_request(API_LINK_GET_WORK_ITEMS_BY_TEAM_AND_SPRINT).catch(err=> {
            response_error = err;
        });

        // Success message
        cleanTable(WORK_ITEM_TABLE);
        removeAllOptionsFromSelect(FILTER_BY_SPRINT_INPUT, null);

        if (response){
            
            // Check work items
            if (response.workItems.length > 0){
                appendToWotkItemTable(response.workItems);
            }else{
                $.notify("This team does not have any work item yet.", "error");
            }

            // Check sprint
            if (response.sprints.length > 0){
                
                // clean the select option
                removeAllOptionsFromSelect(FILTER_BY_SPRINT_INPUT, null);
                
                // update the select option
                for (const sprint of response.sprints) {    
                    console.log(sprint["startDateFormated"]);
                    let isSelected = sprint["_id"].toString() == response["activeSprint"].toString();
                    let optionText = `${sprint["name"]} : ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]}`;
                    updateSelectOption(
                        FILTER_BY_SPRINT_INPUT, 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText},
                        isSelected
                    );
                }
            }else{ 
                removeAllOptionsFromSelect(
                    SPRINT_DELETE_MODAL_SELECT_SPRINT, 
                    {"text": "Not sprint found", "value": "0"}
                );
            }

        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        } 
    });
});
