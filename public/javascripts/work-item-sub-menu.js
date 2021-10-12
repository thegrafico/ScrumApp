/**
 * Controller for all functions inside the sub menu for work item in the sprint-planning page
*/

// OPEN SUB-MENU
const WORK_ITEM_SUB_MENU =  ".workItemOpenSubMenu";

// SUB MENU BUTTONS
const ASSIGN_TO_USER_BTN = ".subMenuAssignUser";
const ASSIGN_TO_TEAM_BTN = ".subMenuAssignTeam";
const MOVE_TO_SPRINT_BTN = ".subMenuMoveToSprint";

// ASSIGN TO USER
const ASSIGN_TO_USER_MODAL = "#assign-to-user-modal"; // modal
const SPAN_ASSIGN_TO_USER_MSG = "#span-msg-assign-to-user"; // span msg
const ASSIGN_TO_USER_SELECT = "#assign-to-user-select";
const ASSING_TO_USER_SUBMIT_BTN = "#assign_to_user_submit_btn";

// ASSIGN TO TEAM
const ASSIGN_TO_TEAM_MODAL = "#assign-to-team-modal"; // modal
const SPAN_ASSIGN_TO_TEAM_MSG = "#span-msg-assign-to-team"; // span msg
const ASSIGN_TO_TEAM_SELECT = "#assign-to-team-select";
const ASSING_TO_TEAM_SUBMIT_BTN = "#assign_to_team_submit_btn";
const ASSIGN_TO_TEAM_SPRINT_SELECT = "#assign-to-team-sprint-select";

// MOVE TO SPRINT
const MOVE_TO_SPRINT_MODAL = "#move-to-sprint-modal"; // modal
const SPAN_MOVE_TO_SPRINT = "#span-msg-move-to-sprint"; // span msg
const MOVE_TO_SPRINT_SELECT = "#move-to-sprint-select";
const MOVE_TO_SPRINT_SUBMIT_BTN = "#move-to-sprint-submit-btn";


// WHEN HTML IS LOADED
$(function() {

    $(ASSIGN_TO_USER_SELECT).select2();
    $(ASSIGN_TO_TEAM_SELECT).select2();
    $(MOVE_TO_SPRINT_SELECT).select2();
    $(ASSIGN_TO_TEAM_SPRINT_SELECT).select2();

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

        // add those work items to the request data
        data["workItems"] = getCheckedWorkItemsId(GLOBAL_WORK_ITEM_SUBMENU_CLICKED);
        
        // getting project id
        const projectId = getProjectId();
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
        setUpSubMenuModal(SPAN_ASSIGN_TO_TEAM_MSG, ASSIGN_TO_TEAM_SELECT, INVALID_OPTION_VALUE);
    });

    // submit btn when assigning team
    $(ASSING_TO_TEAM_SUBMIT_BTN).on("click", async function(){
    
        // get userid
        let teamId = $(ASSIGN_TO_TEAM_SELECT).val();
        if (teamId == UNNASIGNED_VALUE){
            $.notify("Invalid Team", "error");
            return
        }

        // getting new sprint for work item since team is changing. 
        let sprintId = $(ASSIGN_TO_TEAM_SPRINT_SELECT).val();

        // check is valid
        if (sprintId == INVALID_OPTION_VALUE || !_.isString(sprintId) || _.isEmpty(sprintId)){
            $.notify("Invalid sprint selected", "error");
            return;
        }

        let data = {"sprintId": sprintId};

        // add those work items to the request data
        data["workItems"] = getCheckedWorkItemsId(GLOBAL_WORK_ITEM_SUBMENU_CLICKED);

        let {response, response_error} = await assignWorkItemToTeam(teamId, data);

        if (!response_error){
            $.notify(response["msg"], "success");

            // updating user name table
            for (let workItemId of data["workItems"]){
                
                if (response["team"]){
                    $(`tr#${workItemId} td.teamColumnName`).text(response["team"]["name"]);
                }

                if (response["sprint"]){
                    $(`tr#${workItemId} td.sprintColumnName`).text(response["sprint"]["name"]);
                }
            }
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // update sprint when user changes the team
    $(document).on("change", ASSIGN_TO_TEAM_SELECT, async function(){
        let teamId = $(this).val();

        if (teamId == INVALID_OPTION_VALUE){

            // disabled sprint select so user cannot changed
            setDisabledAttr(ASSIGN_TO_TEAM_SPRINT_SELECT, true);

            // reset select sprint to inital value
            $(ASSIGN_TO_TEAM_SPRINT_SELECT).val(INVALID_OPTION_VALUE).change();
            return;
        }


        // remove disable from sprints
        setDisabledAttr(ASSIGN_TO_TEAM_SPRINT_SELECT, false);

        let {response, response_error} = await getSprintsForTeam(teamId);

        // Success message
        if (!response_error){

            // clean select opction
            removeAllOptionsFromSelect(
                ASSIGN_TO_TEAM_SPRINT_SELECT, 
                {"text": "Select new sprint.", "value": INVALID_OPTION_VALUE}
            );

            if (response.sprints && response.sprints.length > 0){
                for (const sprint of response.sprints) {
                    
                    let optionText = '';

                    // jump on unnasigned sprint
                    if (sprint["_id"] == "0"){
                        optionText = `${sprint["name"]}`;
                    }else{
                        optionText = `${sprint["name"]} : ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]}`;
                    }


                    updateSelectOption(
                        ASSIGN_TO_TEAM_SPRINT_SELECT, 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText}
                    );
                }
            }else{
                $.notify("Sorry, it seems this team does not have sprints yet.", "error");
            }
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    
    });

    //  ===== MOVE TO SPRINT =====

    // when the modal is opening
    $(document).on("click", MOVE_TO_SPRINT_BTN, function () {
        setUpSubMenuModal(SPAN_MOVE_TO_SPRINT, MOVE_TO_SPRINT_SELECT);
    });

    // submit btn when assigning user
    $(MOVE_TO_SPRINT_SUBMIT_BTN).on("click", async function(){

        // get sprint
        const sprintId = $(MOVE_TO_SPRINT_SELECT).val();
        if (sprintId == UNNASIGNED_VALUE){
            $.notify("Invalid sprint", "error");
            return
        }

        // add those work items to the request data
        let workItems = getCheckedWorkItemsId(GLOBAL_WORK_ITEM_SUBMENU_CLICKED);

        let workItemsWereMoved = moveWorkItemToSprint(workItems, sprintId);

        // close modal if success
        if (workItemsWereMoved){
            $(`${MOVE_TO_SPRINT_MODAL} .close`).click();
        }

    });

    // ===== MOVE TO BACKLOG =====

    // Move to backlog
    $(document).on("click", MOVE_TO_BACKLOG_BTN, function(){
        let workItemId = $(this).attr("id");

        // get checked elements in table
        const workItems = getCheckedElementIds(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        if (_.isArray(workItems) && !_.isEmpty(workItems)){   
            moveWorkItemToSprint(workItems, UNNASIGNED_VALUE);
        }else{
            moveWorkItemToSprint([workItemId], UNNASIGNED_VALUE);
        }
    }); 
    
});

/**
 * When the modal is open, set up the inital UI for the modal
 * @param {String} spanId 
 * @param {String} selectInputId 
 * @param {String} resetValueForSelect
 */
function setUpSubMenuModal(spanId, selectInputId, resetValueForSelect = UNNASIGNED_VALUE){

    // get checked rows if any
    let rowChecked = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT).length || 0;

    // set the msg for the ui modal depending on number of checked rows
    let msg = (rowChecked <= 1) ? "One work item will be updated." : `${rowChecked} Work items will be updated.`;

    $(spanId).text(msg);

    // reset the select option to defualt
    $(selectInputId).val(resetValueForSelect).change();
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

/**
 * Get the id of the work items checked
 * @param {String} clickedWorkItemId - id of the work item when clicked submenu
 * @returns {Array}
 */
function getCheckedWorkItemsId(clickedWorkItemId){
    // get all checked elements if there are any
    let checkedWorkItems = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT) || [];

    // from the checked elements, get just the value, which is the id of the work item
    let workItemsToUpdate = getvalueFromArraySelector(checkedWorkItems);

    // add those work items to the request data
    let workItems = getWorkItemsForSubMenuModal(workItemsToUpdate, clickedWorkItemId);

    return workItems;
}
