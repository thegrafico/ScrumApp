/**
 * Controller for all functions inside the sub menu for work item in the sprint-planning page
*/

// OPEN SUB-MENU
const WORK_ITEM_SUB_MENU =  ".workItemOpenSubMenu";

// SUB MENU BUTTONS
const ASSIGN_TO_USER_BTN = ".subMenuAssignUser";
const ASSIGN_TO_TEAM_BTN = ".subMenuAssignTeam";
const CHANGE_STATUS_BTN = ".subMenuChangeStatus";

// ASSIGN TO USER
const ASSIGN_TO_USER_SELECT = "#assign-to-user-select";
const ASSING_TO_USER_SUBMIT_BTN = "#assign_to_user_submit_btn";
const SPAN_ASSIGN_TO_USER_MSG = "#span-msg-assign-to-user"; // span msg
const ASSIGN_TO_USER_MODAL = "#assign-to-user-modal"; // modal

// ASSIGN TO TEAM
const ASSIGN_TO_TEAM_SELECT = "#assign-to-team-select";
const ASSING_TO_TEAM_SUBMIT_BTN = "#assign_to_team_submit_btn";
const SPAN_ASSIGN_TO_TEAM_MSG = "#span-msg-assign-to-team"; // span msg
const ASSIGN_TO_TEAM_MODAL = "#assign-to-team-modal"; // modal


// WHEN HTML IS LOADED
$(function() {

    $(ASSIGN_TO_USER_SELECT).select2();
    $(ASSIGN_TO_TEAM_SELECT).select2();


    // GLOABALS
    let GLOBAL_WORK_ITEM_SUBMENU_CLICKED = null;

    // when submenu is open
    $(document).on("click", WORK_ITEM_SUB_MENU, function(){

        // update just in case the user clicked in other element if there are more elements checked
        GLOBAL_WORK_ITEM_SUBMENU_CLICKED = $(this).parent().parent().attr("id");
    });

    //  ===== ASSIGN TO USER =====
    
    // when the modal is opening
    $(document).on("click", ASSIGN_TO_USER_BTN, function () {
        setUpSubMenuModal(SPAN_ASSIGN_TO_USER_MSG, ASSIGN_TO_USER_SELECT);
    });

    // submit btn when assigning user
    $(ASSING_TO_USER_SUBMIT_BTN).on("click", async function(){
        
        // get userid
        let userId = $(ASSIGN_TO_USER_SELECT).val();
        if (userId == UNNASIGNED_VALUE){
            $.notify("Invalid user", "error");
            return
        }

        let data = {"userId": userId};

        // get all checked elements if there are any
        let workItemsToUpdate = getvalueFromArraySelector(getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT) || []);

        // add those work items to the request data
        data["workItems"] = getWorkItemsForSubMenuModal(workItemsToUpdate, GLOBAL_WORK_ITEM_SUBMENU_CLICKED);
        
        // getting project id
        const projectId = $(PROJECT_ID).val();
        const API_LINK_ASSIGN_USER_TO_WORK_ITEM = `/dashboard/api/${projectId}/assignWorkItemToUser`;

        let response_error = null;
        let response = await make_post_request(API_LINK_ASSIGN_USER_TO_WORK_ITEM, data).catch(err => {
            response_error = err;
        });

        if (!response_error){
            $.notify(response["msg"], "success");

            // check response is success before updating UI
            if (response["user"]){
                // updating user name table
                for (let workItemId of data["workItems"]){
                    $(`tr#${workItemId} span.userName`).text(response["user"]["name"]);
                }
            }
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    //  ===== ASSIGN TO TEAM =====

    // when the modal is opening
    $(document).on("click", ASSIGN_TO_TEAM_BTN, function () {
        setUpSubMenuModal(SPAN_ASSIGN_TO_TEAM_MSG, ASSIGN_TO_TEAM_SELECT);
    });

    // submit btn when assigning user
    $(ASSING_TO_TEAM_SUBMIT_BTN).on("click", async function(){
    
        // get userid
        let teamId = $(ASSIGN_TO_TEAM_SELECT).val();
        if (teamId == UNNASIGNED_VALUE){
            $.notify("Invalid Team", "error");
            return
        }

        let data = {"teamId": teamId};

        // get all checked elements if there are any
        let checkedWorkItems = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT) || [];
        
        // from the checked elements, get just the value, which is the id of the work item
        let workItemsToUpdate = getvalueFromArraySelector(checkedWorkItems);
        
        // add those work items to the request data
        data["workItems"] = getWorkItemsForSubMenuModal(workItemsToUpdate, GLOBAL_WORK_ITEM_SUBMENU_CLICKED);

        // getting project id
        const projectId = $(PROJECT_ID).val();
        const API_LINK_ASSIGN_TEAM_TO_WORK_ITEM = `/dashboard/api/${projectId}/assignWorkItemToTeam`;

        let response_error = null;
        let response = await make_post_request(API_LINK_ASSIGN_TEAM_TO_WORK_ITEM, data).catch(err => {
            response_error = err;
        });

        if (!response_error){
            $.notify(response["msg"], "success");
            console.log(response);
            // check response is success before updating UI
            if (response["team"]){

                // updating user name table
                for (let workItemId of data["workItems"]){
                    $(`tr#${workItemId} td.teamColumnName`).text(response["team"]["name"]);
                }
            }
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });
});

/**
 * When the modal is open, set up the inital UI for the modal
 * @param {String} spanId 
 * @param {String} selectInputId 
 */
function setUpSubMenuModal(spanId, selectInputId){

    // get checked rows if any
    let rowChecked = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT).length || 0;

    // set the msg for the ui modal depending on number of checked rows
    let msg = (rowChecked <= 1) ? "One work item will be updated." : `${rowChecked} Work items will be updated.`;

    $(spanId).text(msg);

    // reset the select option to defualt
    $(selectInputId).val(0).change();
}


/**
 * Get an array with the work item ids of the elements that will be updated
 * @param {Array} workItemsToUpdate 
 * @param {String} currentWorkItemIdClicked 
 * @returns {Array}
 */
function getWorkItemsForSubMenuModal(workItemsToUpdate, currentWorkItemIdClicked){
    let data = [];
    // if there is any checked work item
    if (workItemsToUpdate.length > 0){

        // if the user has 3 elements checked, but clicked on other sub menu that is not checked, then we need to add tha element
        // with the other 3 checked elements
        if ( !(workItemsToUpdate.includes(currentWorkItemIdClicked))){
            workItemsToUpdate.push(currentWorkItemIdClicked);
        }

        data = workItemsToUpdate;
    }else{
        if (currentWorkItemIdClicked == null){
            $.notify("Sorry, Cannot find which work item needs to assign to the user. Please check the row first", "error");
            return;
        }

        // in case there are not elements checked, just add the clicked work item
        data = [currentWorkItemIdClicked];
    }

    return data;
}
