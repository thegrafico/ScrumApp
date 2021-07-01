/**
 * This file is to save the work item when something has changed
*/
// All this variables are declared in the planning-work-item.js - public
// Title
let newWorkItemTitle = undefined;

// Assigned User
let newAssignedUser = undefined;

// Status
let newWorkItemStatus = undefined;

// Team
let newTeam = undefined;

// Type
let newType = undefined;

// Iteration
let newIteration = undefined;

// Description
let newDescription = undefined;

// Story Points
let newStoryPoints = undefined;

// Priority Points
let newPriorityPoints = undefined;

const SAVE_BTN_CONTAINER = "#saveStatusBtn";
const ENABLE_SAVE_BTN_CLASS = "saveBtnContainer";
$(function () {

    const currentTitle          = $(WORK_ITEM["title"]).val();
    const currentAssignedUser   = $(WORK_ITEM["user"]).val();
    const currentStatus         = $(WORK_ITEM["state"]).val().toLowerCase();
    const currentTeam           = $(WORK_ITEM["team"]).val().toLowerCase();
    const currentType           = $(WORK_ITEM["type"]).val().toLowerCase();
    const currentIteration      = $(WORK_ITEM["sprint"]).val().toLowerCase();
    const currentDescription    = $(WORK_ITEM["description"]).val();
    const currentStoryPoints    = $(WORK_ITEM["points"]).val();
    const currentPriorityPoints = $(WORK_ITEM["priority"]).val();

    // Work Item Title
    $(WORK_ITEM["title"]).keyup(function(){
        newWorkItemTitle = swap(currentTitle, $(this).val() || "");
        activeSaveButton();

    });

    // assigned user
    $(WORK_ITEM["user"]).change(function(){
        newAssignedUser = swap(currentAssignedUser, $(this).val() || "");
        activeSaveButton();

    });

    // TODO: Add on changes tags

    // Status - select
    $(WORK_ITEM["state"]).change(function(){
        newWorkItemStatus = swap(currentStatus, $(this).val() || "");
        activeSaveButton();

    });

    // Team
    $(WORK_ITEM["team"]).change(function(){
        newTeam = swap(currentTeam, $(this).val() || "");
        activeSaveButton();

    });

    // Type
    $(WORK_ITEM["type"]).change(function(){        
        newType = swap(currentType, $(this).val() || "");
        activeSaveButton();

    });

    // Iteration
    $(WORK_ITEM["sprint"]).change(function(){        
        newIteration = swap(currentIteration, $(this).val() || "");
        activeSaveButton();
    });

    // Description
    $(WORK_ITEM["description"]).keyup(function(){        
        newDescription = swap(currentDescription, $(this).val() || "");
        activeSaveButton();
    });

    // Story Points
    $(WORK_ITEM["points"]).keyup(function(){
        newStoryPoints = swap(currentStoryPoints, $(this).val() || "0");
        activeSaveButton();
    });

    // Priority Points
    $(WORK_ITEM["priority"]).keyup(function(){
        newPriorityPoints = swap(currentPriorityPoints, $(this).val() || "0");
        activeSaveButton();
    });
});

/**
 * Active the sabe button in order to save the current state of the work item if has changed
 */
function activeSaveButton(){

    // get the status of all possibles changes in the work item
    let somethingHasChanged = (newWorkItemTitle || newAssignedUser || newWorkItemStatus || newTeam
        || newType || newIteration || newDescription || newStoryPoints || newPriorityPoints);
    // -- 

    if (somethingHasChanged){
        $(SAVE_BTN_CONTAINER).addClass(ENABLE_SAVE_BTN_CLASS);
    }else{
        $(SAVE_BTN_CONTAINER).removeClass(ENABLE_SAVE_BTN_CLASS);
    }
}