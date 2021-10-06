/**
 * Controller for all functions inside the sub menu for work item in the sprint-planning page
*/

// OPEN SUB-MENU
const WORK_ITEM_SUB_MENU =  ".workItemOpenSubMenu";

// SUB MENU BUTTONS
const ASSIGN_TO_USER_BTN = ".subMenuAssignUser";
const ASSIGN_TO_TEAM_BTN = ".subMenuAssignTeam";
const CHANGE_STATUS_BTN = ".subMenuChangeStatus";

// SELECT USER INPUT
const ASSIGN_TO_USER_SELECT = "#assign-to-user-select";
const ASSING_TO_USER_SUBMIT_BTN = "#assign_to_user_submit_btn";

// SPAN INFO MESSAGE
const SPAN_ASSIGN_TO_USER_MSG = "#span-msg-assign-to-user";

// MODAL
const ASSIGN_TO_USER_MODAL = "#assign-to-user-modal";




// WHEN HTML IS LOADED
$(function() {

    $(ASSIGN_TO_USER_SELECT).select2();

    // GLOABALS
    let GLOBAL_WORK_ITEM_SUBMENU_CLICKED = null;

    //  ===== ASSIGN TO USER =====
    
    // when submenu is open
    $(document).on("click", WORK_ITEM_SUB_MENU, function(){

        // update just in case the user clicked in other element if there are more elements checked
        GLOBAL_WORK_ITEM_SUBMENU_CLICKED = $(this).parent().parent().attr("id");
    });

    // when the modal is opening
    $(document).on("click", ASSIGN_TO_USER_BTN, function () {
        let rowChecked = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT).length || 0;
    
        // set the msg for the ui modal
        let msg = (rowChecked <= 1) ? "One work item will be updated." : `${rowChecked} Work items will be updated.`;

        // Add msg to ui modal
        $(SPAN_ASSIGN_TO_USER_MSG).text(msg);

        // reset the select option to defualt
        $(ASSIGN_TO_USER_SELECT).val(0).change();
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
        
        // if there is any checked work item
        if (workItemsToUpdate.length > 0){

            // if the user has 3 elements checked, but clicked on other sub menu that is not checked, then we need to add tha element
            // with the other 3 checked elements
            if ( !(workItemsToUpdate.includes(GLOBAL_WORK_ITEM_SUBMENU_CLICKED))){
                workItemsToUpdate.push(GLOBAL_WORK_ITEM_SUBMENU_CLICKED);
            }

            data["workItems"] = workItemsToUpdate;
        }else{
            if (GLOBAL_WORK_ITEM_SUBMENU_CLICKED == null){
                $.notify("Sorry, Cannot find which work item needs to assign to the user. Please check the row first", "error");
                return;
            }

            // in case there are not elements checked, just add the clicked work item
            data["workItems"] = [GLOBAL_WORK_ITEM_SUBMENU_CLICKED];
        }

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
    //  ==============
});
