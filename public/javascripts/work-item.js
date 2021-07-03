/**
 * This file is to save the work item when something has changed
 * WORK_ITEM is declared in planning-work-item.js
 * swap function is inside helpers.js
*/

let updateWorkItem = {
    title: undefined,
    assignedUser: undefined,
    sprint: undefined,
    storyPoints: undefined,
    priorityPoints: undefined,
    status: undefined,
    teamId: undefined,
    type: undefined,
    description: undefined,
    tags: undefined,
}

// Save button 
const SAVE_BTN_CONTAINER = "#saveStatusBtn";
const ENABLE_SAVE_BTN_CLASS = "saveBtnContainer";
$(function () {

    const currentTitle          = $(WORK_ITEM["title"]).val();
    const currentAssignedUser   = $(WORK_ITEM["user"]).val();
    const currentStatus         = $(WORK_ITEM["state"]).val().toLowerCase();
    const currentTags           = $(WORK_ITEM["tags"]).map((_,element) => element.value).get();
    const currentTeam           = $(WORK_ITEM["team"]).val().toLowerCase();
    const currentType           = $(WORK_ITEM["type"]).val().toLowerCase();
    const currentIteration      = $(WORK_ITEM["sprint"]).val().toLowerCase();
    const currentDescription    = $(WORK_ITEM["description"]).val();
    const currentStoryPoints    = $(WORK_ITEM["points"]).val();
    const currentPriorityPoints = $(WORK_ITEM["priority"]).val();

    // Work Item Title
    $(WORK_ITEM["title"]).keyup(function(){
        updateWorkItem["title"] = swap(currentTitle, $(this).val() || "");
        activeSaveButton();
    });

    // assigned user
    $(WORK_ITEM["user"]).change(function(){
        updateWorkItem["assignedUser"] = swap(currentAssignedUser, $(this).val() || "");
        activeSaveButton();
    });

    // Tags - if the div changes, then we update
    $(TAG_CONTAINER).change(function(){
        
        // get all the tags available
        let tags_available = $(WORK_ITEM["tags"]).map((_,element) => element.value).get();

        // using lodash in order to know if the array has changed
        let arrayAreEqual = _.isEqual(_.sortBy(tags_available), _.sortBy(currentTags));

        updateWorkItem["tags"] = !arrayAreEqual ? tags_available : undefined;
        
        if (_.isEmpty(updateWorkItem["tags"])){
            updateWorkItem["tags"] = [null]; // since empty array is not sent, we need to send it with something
        }

        activeSaveButton();
    });
    
    // Status - select
    $(WORK_ITEM["state"]).change(function(){
        updateWorkItem["status"] = swap(currentStatus, $(this).val() || "");
        activeSaveButton();
    });

    // Team
    $(WORK_ITEM["team"]).change(function(){
        updateWorkItem["teamId"] = swap(currentTeam, $(this).val() || "");
        activeSaveButton();
    });

    // Type
    $(WORK_ITEM["type"]).change(function(){        
        updateWorkItem["type"] = swap(currentType, $(this).val() || "");
        activeSaveButton();
    });

    // sprint
    $(WORK_ITEM["sprint"]).change(function(){        
        updateWorkItem["sprint"] = swap(currentIteration, $(this).val() || "");
        activeSaveButton();
    });

    // Description
    $(WORK_ITEM["description"]).keyup(function(){        
        updateWorkItem["description"] = swap(currentDescription, $(this).val() || "");
        activeSaveButton();
    });

    // Story Points
    $(WORK_ITEM["points"]).keyup(function(){
        updateWorkItem["storyPoints"] = swap(currentStoryPoints, $(this).val() || "0");
        activeSaveButton();
    });

    // Priority Points
    $(WORK_ITEM["priority"]).keyup(function(){
        updateWorkItem["priorityPoints"] = swap(currentPriorityPoints, $(this).val() || "0");
        activeSaveButton();
    });

    // Save button event
    $(SAVE_BTN_CONTAINER).on("click", async function(){
        // only do the post when something has changed
        if (activeSaveButton()){
            const projectId = $(PROJECT_ID).val();
            const workItemId = $(WORK_ITEM_ID).val();

            const api_link_update_work_item = `/dashboard/api/${projectId}/update_work_item/${workItemId}`;

            const response = await make_post_request(api_link_update_work_item, updateWorkItem).catch(err=> {
                // TODO: change this to another a message to the user
                console.error("Error updating the work item: ", err);
            });

            console.log(response);
            // set all values in object to default value
            Object.keys(updateWorkItem).forEach(function(key){ updateWorkItem[key] = undefined });
            
            // since all values are now default, we can reset the save button
            activeSaveButton();
        }
    });
});

/**
 * Active the save button in order to save the current state of the work item if has changed
 */
function activeSaveButton(){

    // get the status of all possibles changes in the work item
    let somethingHasChanged = Object.keys(updateWorkItem).some(
        (key) => updateWorkItem[key] != undefined
    );

    if (somethingHasChanged){
        $(SAVE_BTN_CONTAINER).addClass(ENABLE_SAVE_BTN_CLASS);
    }else{
        $(SAVE_BTN_CONTAINER).removeClass(ENABLE_SAVE_BTN_CLASS);
    }

    return somethingHasChanged;
}