/**
 * This file is to save the work item when something has changed
*/

// Title
const WORK_ITEM_TITLE = "#new-item-title";
let newWorkItemTitle = undefined;

// Assigned User
const WORK_ITEM_ASSIGNED_USER = "#assignedUser";
let newAssignedUser = undefined;

// Status
const WORK_ITEM_STATUS = "#workItemStatus";
let newWorkItemStatus = undefined;

// Team
const WORK_ITEM_TEAM = "#teamAssigned";
let newTeam = undefined;

// Type
const WORK_ITEM_TYPE = "#workItemType";
let newType = undefined;

// Iteration
const WORK_ITEM_ITERATION = "#sprints";
let newIteration = undefined;

// Description
const WORK_ITEM_DESCRIPTION = "#description-textarea";
let newDescription = undefined;

// Story Points
const WORK_ITEM_STORY_POINTS = "#workItemPoints";
let newStoryPoints = undefined;

// Priority Points
const WORK_ITEM_PRIORITY_POINTS = "#workItemPriority";
let newPriorityPoints = undefined;

$(function () {
    const currentTitle          = $(WORK_ITEM_TITLE).val();
    const currentAssignedUser   = $(WORK_ITEM_ASSIGNED_USER).val();
    const currentStatus         = $(WORK_ITEM_STATUS).val();
    const currentTeam           = $(WORK_ITEM_TEAM).val();
    const currentType           = $(WORK_ITEM_TYPE).val();
    const currentIteration      = $(WORK_ITEM_ITERATION).val();
    const currentDescription    = $(WORK_ITEM_DESCRIPTION).val();
    const currentStoryPoints    = $(WORK_ITEM_STORY_POINTS).val();
    const currentPriorityPoints = $(WORK_ITEM_PRIORITY_POINTS).val();




    // Work Item Title
    $(WORK_ITEM_TITLE).keyup(function(){
        newWorkItemTitle = swap(currentTitle, $(this).val() || "");
    });

    // assigned user
    $(WORK_ITEM_ASSIGNED_USER).change(function(){
        newAssignedUser = swap(currentAssignedUser, $(this).val() || "");
    });

    // TODO: Add on changes tags

    // Status - select
    $(WORK_ITEM_STATUS).change(function(){
        newAssignedUser = swap(currentStatus, $(this).val() || "");
    });

    // Team
    $(WORK_ITEM_TEAM).change(function(){
        newTeam = swap(currentTeam, $(this).val() || "");
    });

    // Type
    $(WORK_ITEM_TYPE).change(function(){        
        newType = swap(currentType, $(this).val() || "");
    });

    // Iteration
    $(WORK_ITEM_ITERATION).change(function(){        
        newIteration = swap(currentIteration, $(this).val() || "");
    });

    // Description
    $(WORK_ITEM_DESCRIPTION).keyup(function(){        
        newDescription = swap(currentDescription, $(this).val() || "");
    });

    // Story Points
    $(WORK_ITEM_STORY_POINTS).keyup(function(){
        newStoryPoints = swap(currentStoryPoints, $(this).val() || 0);
    });

    // Priority Points
    $(WORK_ITEM_STORY_POINTS).keyup(function(){
        newPriorityPoints = swap(currentPriorityPoints, $(this).val() || 0);
    });
});
