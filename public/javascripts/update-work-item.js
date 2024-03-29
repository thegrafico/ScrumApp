/**
 * This file is to save the work item when something has changed
 * WORK_ITEM is declared in work-items.js
 * swap function is inside helpers.js
*/

// This object is to update the work item. We only send the request with the variables that are not undefined.  
let workItemValuesToUpdate = {
    title:          undefined,
    assignedUser:   undefined,
    sprint:         undefined,
    storyPoints:    undefined,
    priorityPoints: undefined,
    status:         undefined,
    teamId:         undefined,
    type:           undefined,
    description:    undefined,
    tags:           undefined,
    links:          undefined,
}

// Variables to store the entire state of the work item. 
let currentTitle          = undefined;
let currentAssignedUser   = undefined;
let currentStatus         = undefined;
let currentTags           = undefined;
let currentTeam           = undefined;
let currentType           = undefined;
let currentIteration      = undefined;
let currentDescription    = undefined;
let currentStoryPoints    = undefined;
let currentPriorityPoints = undefined;
let currentRelationship   = undefined; // links

// Save button 
const SAVE_BTN_CONTAINER = "#saveStatusBtn";
const ENABLE_SAVE_BTN_CLASS = "saveBtnContainer";
const UPDATE_TAGS_CONTAINER = ".update-tags-container";
const UPDATE_TAGS_BTN = "#udpate-add-tags-btn";

const UPDATE_WORK_ITEM_RELATIONSHIP_ID = `${UPDATE_WORK_ITEM["relationship_container"]} .relationship-workitem-id`;

const LOG_AVAILABLE = false;
$(function () {

    // ================ SELECT option =============
    $(UPDATE_WORK_ITEM["user"]).select2();
    $(UPDATE_WORK_ITEM["team"]).select2();
    $(UPDATE_WORK_ITEM["sprint"]).select2({});
    $(UPDATE_WORK_ITEM["priority"]).select2();
    // ===========================================

    checkTitleWhenOpen(UPDATE_WORK_ITEM);
    addWorkItemEvents(UPDATE_WORK_ITEM);

    // Only run this function  at the begenning when we're working inside a work item.
    if ($(WORK_ITEM_ID).val()){
        // Set all variables to the initial state when this file is loaded
        setWorkItemState();
    }

    // Work Item Title
    $(UPDATE_WORK_ITEM["title"]).keyup(function(){
        workItemValuesToUpdate["title"] = swap(currentTitle, $(this).val() || "");
        activeSaveButton();
        if (LOG_AVAILABLE){
            console.log("title changed");
        }
    });

    // assigned user
    $(UPDATE_WORK_ITEM["user"]).change(function(){
        workItemValuesToUpdate["assignedUser"] = swap(currentAssignedUser, $(this).val() || "");
        activeSaveButton();
        if (LOG_AVAILABLE){
            console.log("user changed");
        }
    });
 
    // Status - select
    $(UPDATE_WORK_ITEM["state"]).change(function(){
        workItemValuesToUpdate["status"] = swap(currentStatus, $(this).val() || "");
        activeSaveButton();
        if (LOG_AVAILABLE){
            console.log("state changed");
        }
    });

    // Team
    $(UPDATE_WORK_ITEM["team"]).change(function(){
        workItemValuesToUpdate["teamId"] = swap(currentTeam, $(this).val() || "0");
        activeSaveButton();
        if (LOG_AVAILABLE){
            console.log("team changed");
        }
    });

    // Type
    $(UPDATE_WORK_ITEM["type"]).change(function(){        
        workItemValuesToUpdate["type"] = swap(currentType, $(this).val() || "");
        activeSaveButton();
        if (LOG_AVAILABLE){
            console.log("type changed");
        }

    });

    // sprint
    $(UPDATE_WORK_ITEM["sprint"]).change(function(){        
        workItemValuesToUpdate["sprint"] = swap(currentIteration, $(this).val() || "0");
        activeSaveButton();
        if (LOG_AVAILABLE){
            console.log("sprint changed");
        }

    });

    // Description
    $(UPDATE_WORK_ITEM["description"]).keyup(function(){        
        workItemValuesToUpdate["description"] = swap(currentDescription, $(this).val() || "");
        activeSaveButton();
        if (LOG_AVAILABLE){
            console.log("description changed");
        }
    });

    // Story Points
    $(UPDATE_WORK_ITEM["points"]).keyup(function(){
        workItemValuesToUpdate["storyPoints"] = swap(currentStoryPoints, $(this).val() || "0");
        activeSaveButton();
        if (LOG_AVAILABLE){
            console.log("points changed");
        }

    });

    // Priority Points
    $(UPDATE_WORK_ITEM["priority"]).change(function(){
        workItemValuesToUpdate["priorityPoints"] = swap(currentPriorityPoints, $(this).val() || "0");
        activeSaveButton();
        if (LOG_AVAILABLE){
            console.log("priority changed");
        }
    });

    // Tags - if the div changes, then we update
    $(UPDATE_WORK_ITEM["tag_container"]).change(function(){
        
        // get all the tags available
        let tags_available = getTags(UPDATE_WORK_ITEM);
        
        // using lodash in order to know if the array has changed
        let arrayAreEqual = _.isEqual(_.sortBy(tags_available), _.sortBy(currentTags));
        if (!arrayAreEqual){
            workItemValuesToUpdate["tags"] = !arrayAreEqual ? tags_available : undefined;

            if (_.isEmpty(workItemValuesToUpdate["tags"])){
                workItemValuesToUpdate["tags"] = [null]; // since empty array is not sent, we need to send it with something
            }
        }else{
            // we need this else in case the user add something, never save it, and then delete it. 
            workItemValuesToUpdate["tags"] = undefined;
        }

        activeSaveButton();
    });

    // Adding relationship link
    $(UPDATE_WORK_ITEM["relationship_container"]).on("change", function(){
        
        // get all the tags available
        let linksAvailable = $(UPDATE_WORK_ITEM_RELATIONSHIP_ID).map((_,element) => element.value).get();

        // using lodash in order to know if the array has changed
        let arrayAreEqual = _.isEqual(_.sortBy(linksAvailable), _.sortBy(currentRelationship));
        if (!arrayAreEqual){
            workItemValuesToUpdate["links"] = linksAvailable;

            if (_.isEmpty(workItemValuesToUpdate["links"])){
                workItemValuesToUpdate["links"] = [null]; // since empty array is not sent, we need to send it with something
            }
        }else{
            // we need this else in case the user add something, never save it, and then delete it. 
            workItemValuesToUpdate["links"] = undefined;
        }

        activeSaveButton();
    });

    // Save button event
    $(SAVE_BTN_CONTAINER).on("click", async function(){
        // only do the post when something has changed
        if (activeSaveButton()){

            const workItemId = $(WORK_ITEM_ID).val();

            // Sending the request 
            let {response, response_error} = await updateWorkItem(workItemId, workItemValuesToUpdate);

            // Success message
            if (response){
                $.notify(response.msg, "success");

                makeWorkItemUpdatableIfNotCompleted(UPDATE_WORK_ITEM, response["workItem"]["status"] == WORK_ITEM_STATUS["Completed"]);

                // in case we're in the sprint board page
                if ($(CURRENT_PAGE_ID).val() === "sprintBoard"){
                    updateSprintBoardWorkItem(workItemId, response["workItem"]);
                }else{
                    updateTableElement(workItemId, [response["workItem"]], appendToWotkItemTable, [true, false]);
                }

                // updating the feedback messages
                updateWorkItemFeedback();

            }else{ // error messages
                $.notify(response_error.data.responseJSON.msg, "error");
            }

            // set all values in object to default value
            Object.keys(workItemValuesToUpdate).forEach(function(key){ workItemValuesToUpdate[key] = undefined });
            
            // since all values are now default, we can reset the save button
            activeSaveButton();

            setWorkItemState();
        }
    });

    // close select2 in case is still open
    $(UPDATE_WORK_ITEM_MODAL).on('hide.bs.modal', function (e) {
        $(UPDATE_WORK_ITEM["user"]).select2();
        $(UPDATE_WORK_ITEM["team"]).select2();
        $(UPDATE_WORK_ITEM["sprint"]).select2();
        $(UPDATE_WORK_ITEM["priority"]).select2();
    });
});

/**
 * Active the save button in order to save the current state of the work item if has changed
 */
function activeSaveButton(){

    // get the status of all possibles changes in the work item
    let somethingHasChanged = Object.keys(workItemValuesToUpdate).some(
        (key) => workItemValuesToUpdate[key] != undefined
    );

    if (somethingHasChanged){
        $(SAVE_BTN_CONTAINER).addClass(ENABLE_SAVE_BTN_CLASS);
    }else{
        $(SAVE_BTN_CONTAINER).removeClass(ENABLE_SAVE_BTN_CLASS);
    }

    return somethingHasChanged;
}

/**
 * Set all variables of work item to the current state. This way we can compare data to know
 * What actually changed.
 */
function setWorkItemState(){
    currentTitle          = $(UPDATE_WORK_ITEM["title"]).val();
    currentAssignedUser   = $(UPDATE_WORK_ITEM["user"]).val();
    currentStatus         = $(UPDATE_WORK_ITEM["state"]).val().toLowerCase();
    currentTags           = $(UPDATE_WORK_ITEM["tags"]).map((_,element) => element.value).get();
    currentTeam           = ($(UPDATE_WORK_ITEM["team"]).val() || "0").toLowerCase();
    currentType           = $(UPDATE_WORK_ITEM["type"]).val().toLowerCase();
    currentIteration      = ($(UPDATE_WORK_ITEM["sprint"]).val() || "0").toLowerCase();
    currentDescription    = $(UPDATE_WORK_ITEM["description"]).val();
    currentStoryPoints    = $(UPDATE_WORK_ITEM["points"]).val();
    currentPriorityPoints = $(UPDATE_WORK_ITEM["priority"]).val();
    currentRelationship   = $(UPDATE_WORK_ITEM_RELATIONSHIP_ID).map((_,element) => element.value).get();
}

/**
 * Reset the work item so the current value is the actual value
 */
function resetWorkItemState(){
    Object.keys(workItemValuesToUpdate).forEach(function(key){ workItemValuesToUpdate[key] = undefined });
}