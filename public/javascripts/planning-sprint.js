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
        if (response){
            if (response.length > 0){
                appendToWotkItemTable(response);
            }else{
                $.notify("This team does not have any work item yet.", "error");
                cleanTable(WORK_ITEM_TABLE);
            }
        }else{ // error messages
            $.notify(response_error.data.responseText, "error");
        } 
    });
});
