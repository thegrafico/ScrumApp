
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const workItemCollection        = require("../../dbSchema/workItem");
const projectCollection         = require("../../dbSchema/projects");
const userCollection            = require("../../dbSchema/user");
const SprintCollection          = require("../../dbSchema/sprint");

const _                         = require("lodash");
let router                      = express.Router();

const {
    UNASSIGNED,
    MAX_LENGTH_TITLE,
    MAX_LENGTH_DESCRIPTION,
    MAX_PRIORITY_POINTS,
    MAX_STORY_POINTS,
    UNASSIGNED_SPRINT,
    WORK_ITEM_STATUS,
    WORK_ITEM_STATUS_COLORS,
    WORK_ITEM_ICONS,
    capitalize,
    SPRINT_STATUS,
    joinData,
    sortByDate
} = require('../../dbSchema/Constanst');


// ============= GET ======================
/**
 * METHOD: GET - fetch all work items for a team
 */
router.get("/api/:id/getWorkItem/:workItemId", middleware.isUserInProject, async function (req, res) {
    console.log("Getting request to get work item...");

    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    let response = {};

    // verify is the project exists
    let projectInfo = await projectCollection.findOne({_id: projectId}).catch(err => {
        console.log("Error is: ", err.reason);
    });

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        response["msg"] = "Sorry, There was a problem getting the project information.";
        return res.status(400).send(response);
    }

    // ============== CHECK WORK ITEM INFO ==============
    // Load work item specify data
    let workItem = await projectInfo.getWorkItem(workItemId).catch(err => {
        console.error("Error getting work items: ", err);
    }) || [];


    if (_.isUndefined(workItem) || _.isEmpty(workItem)){
        response["msg"] = "Sorry, There was a problem getting the work item information.";
        return res.status(400).send(response);
    }
    
    // ============ GETTING SPRINTS for the team of the work item =====

    // getting all sprints for team
    let sprints = await SprintCollection.getSprintsForTeam(projectId, workItem["teamId"]).catch(err => {
        console.error("Error getting sprints for team: ", err)
    }) || [];

    let activeSprintId = null;

    // if the user have a team
    if (!_.isEmpty(sprints)){

        let activeSprint = sprints.filter(each => {
           return each.tasks.includes(workItemId);
        })[0];

        if (!_.isUndefined(activeSprint) && !_.isNull(activeSprint)){
            activeSprintId = activeSprint["_id"];
        }
    }

    // sorting sprint
    sprints = sortByDate(sprints, "startDate");

    sprints.unshift(UNASSIGNED_SPRINT);

    response["workItem"] = workItem;
    response["sprints"] = sprints;
    response["activeSprint"] = activeSprintId;
    response["msg"] = "success";
    return res.status(200).send(response);
});

// ============== POST ==================

/**
 * METHOD: POST - Create new work item
 */
router.post("/api/:id/createWorkItem", middleware.isUserInProject, async function (req, res) {

    // new work item
    let {
        title,              //req
        userAssigned,
        workItemStatus,
        teamAssigned,
        workItemType,
        sprint,
        workItemDescription,
        storyPoints,
        priorityPoints,
        tags
    } = req.body;

    // Fixing variables 
    userAssigned = userAssigned                 || UNASSIGNED.id;
    teamAssigned = teamAssigned                 || UNASSIGNED.id;
    workItemStatus = capitalize(workItemStatus) || WORK_ITEM_STATUS["New"]; // default
    workItemType = capitalize(workItemType)     || Object.keys(WORK_ITEM_ICONS)[0]; // Story is the default value
    storyPoints = parseInt(storyPoints)         || 0;
    priorityPoints = parseInt(priorityPoints)   || MAX_PRIORITY_POINTS;
    tags = tags                                 || [];

    let errors = undefined;
    let addUserToTeam = false;

    // getting project info
    let projectInfo = await projectCollection.findOne({_id: req.params.id}).catch(err => {
        errors = err.reason;
        console.log("Error is: ", err.reason);
    });

    let response = {};

    if (_.isEmpty(projectInfo) || _.isNull(projectInfo) || _.isUndefined(projectInfo)){
        console.error("Error getting the project information: ", projectInfo);
        response["msg"] = "Sorry, Cannot find the project to add the work item.";
        res.status(400).send(response);
        return;
    }

    const users = projectInfo["users"];
    const teams = projectInfo["teams"].map(element => element._id);

    // to create a new work item
    let newWorkItem = {};

    // ============ Title ==============
    if (_.isEmpty(title) || title.length < 3){
        console.error("Title is to short");
        response["msg"] = "The title of the project is to short.";
        res.status(400).send(response);
        return;
    }
    
    // =========== USER ID ================
    // Verify the user is in the project 
    if (userAssigned != UNASSIGNED.id && !users.includes(userAssigned)){
        console.error("Cannot find the user for the work item: ", userAssigned);
        response["msg"] = "Cannot find the user assigned for this work item.";
        res.status(400).send(response);
        return;
    }

    if (userAssigned != UNASSIGNED.id) {
        const _user = await userCollection
            .findOne({_id: userAssigned})
            .catch(err => {
                errors = err.reason
                console.error("Cannot get the user: ", err);
            });

        // -- 
        if (_user){
            newWorkItem["assignedUser"] = {name: _user["fullName"],'id': userAssigned};
            addUserToTeam = true;
        }else{
            console.error("Cannot find the user for the work item: ", userAssigned);
            response["msg"] = "Cannot find the user assigned for this work item";
            res.status(400).send(response);
            return;
        }
    }
    // ================== STATUS ================

    // If empty, if not string, if not part of the work items
    if (_.isEmpty(workItemStatus) || !_.isString(workItemStatus) || !Object.keys(WORK_ITEM_STATUS).includes(workItemStatus)){
        console.error("unknow work item");
        response["msg"] = "Sorry, There is a problem with the status of the work item.";
        res.status(400).send(response);
        return;
    }

    // check if there is any user, if not, return error;
    if (workItemStatus === WORK_ITEM_STATUS["Completed"] && !addUserToTeam){
        console.error("unknow work item");
        response["msg"] = "Sorry, Work item must have an user assigned in order to be completed";
        res.status(400).send(response);
        return;
    }

    // =============== TEAMS =============
    if (teamAssigned != UNASSIGNED.id && !teams.includes(teamAssigned)){
        console.error("Error getting the team assigned for the work item");
        response["msg"] = "Sorry, We Cannot find the team assigned for this work item.";
        res.status(400).send(response);
        return;
    }

    // add the user if not default
    // TODO: if a user was assigned to this work item, then we should add that user to the team if the user is not in the team already. 
    if (teamAssigned != UNASSIGNED.id) 
        newWorkItem["teamId"] = teamAssigned;

    //  ================= TYPE ================
    if(Object.keys(WORK_ITEM_ICONS).includes(workItemType)){
        newWorkItem["type"] = workItemType;
    }

    // ================ POINTS ===============
    if ( _.isNumber(storyPoints) && !isNaN(storyPoints) && (storyPoints >= 0  && storyPoints <= MAX_STORY_POINTS)){
        newWorkItem["storyPoints"] = storyPoints;
    }

    // ================== priority ===============
    if ( _.isNumber(priorityPoints) && !isNaN(priorityPoints) && (priorityPoints >= 0  && priorityPoints <= MAX_PRIORITY_POINTS)){
        newWorkItem["priorityPoints"] = priorityPoints;
    }

    // ============== TAGS =================
    // if not empty and every value is a string
    if (!(_.isEmpty(tags)) && tags.every(val => _.isString(val))){
        newWorkItem["tags"] = tags;
    }

    newWorkItem["title"] = title;
    newWorkItem["status"] = workItemStatus;
    newWorkItem["description"] = workItemDescription;
    newWorkItem["projectId"] = req.params.id;
    
    // TODO: Create new schema for comments
    // newWorkItem["comments"]

    // add user to the team assigned if the user is not already in there. 
    if (newWorkItem["teamId"] || addUserToTeam){
        let teamId = newWorkItem["teamId"];
        let user = addUserToTeam ? newWorkItem["assignedUser"]: null;
        
        if (user && user.id && teamId){
            await projectInfo.addUserToTeam(user.id.toString(), teamId.toString() ).catch(err => {
                console.error(err);   
            });
        }
    }

    newWorkItem = await workItemCollection.create(newWorkItem).catch(err =>{
        errors = err.reason;
        console.error("Error creating the work item: ", err)
    });

    // console.log("New work item: ", newWorkItem);

    // verify work item was created
    if (_.isEmpty(newWorkItem) || _.isNull(newWorkItem)){
        response["msg"] = `There was an error creating the work item: ${errors}`;
        res.status(400).send(response);
        return;
    }

    // Add the work item to the sprint if was selected by the user
    if (!_.isUndefined(sprint) && !_.isEmpty(sprint) && sprint != UNASSIGNED_SPRINT._id){
        let sprint_error_msg = null;

        let currentSprint = await SprintCollection.findById(sprint).catch(err => {
            console.error("There was an error getting the sprint: ", err);
        });

        if (!_.isUndefined(currentSprint) && !_.isNull(currentSprint)){
            currentSprint["tasks"].push(newWorkItem._id);

            await currentSprint.save().catch(err => {
                sprint_error_msg = err;
                console.error("Error saving the work item to the sprint: ", err);
            });

            if (sprint_error_msg){
                console.log("Error adding work item to sprint");
            }else{
                console.log("sprint was added to work item");
            }
        }
    }

    // get all the teams for this project
    let projectTeams = [...projectInfo.teams];

    // get all sprints for project
    let projectSprints = await SprintCollection.find({projectId: req.params.id}).catch(err => console.error(err)) || [];

    newWorkItem = newWorkItem.toObject();
    // Create new key (team/sprint) to store the work item team
    joinData([newWorkItem], projectTeams, "teamId", "equal", "_id", "team", UNASSIGNED);
    joinData([newWorkItem], projectSprints, "_id", "is in", "tasks", "sprint", UNASSIGNED_SPRINT);

    response["msg"] = "Success";
    response["workItem"] = newWorkItem;

    res.status(200).send(response);
});


/**
 * METHOD: POST - Add a comment to the work item
 */
router.post("/api/:id/addCommentToWorkItem/:workItemId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to add a comment to a work item...");
    
    // TODO: Verify if project exist and work item
    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    
    let  { comment } = req.body;

    // string and not empty
    if (_.isString(comment) && !_.isEmpty(comment.trim())){
        
        // clean the comment in case
        comment = comment.trim();

        // Add the comment to the DB
        const result = await workItemCollection.updateOne({_id: workItemId}, 
            { 
                $push: { "comments": comment }
            }
        ).catch(err => console.error("Error updating comments: ", err));

        if (!result){
            res.status(400).send("Error adding the comment to the work item, Please try later.");
            return;
        }
    }else{
        res.status(400).send("Comment is either empty or does not exist.");
        return;
    }

    res.status(200).send("Comment was added successfully!");
});


/**
 * METHOD: POST - Update work item
 */
router.post("/api/:id/updateWorkItem/:workItemId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to update work item...");
    
    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    let response = {};

    // =========== Validate project exist =================
    
    const project = await projectCollection.findById(projectId).catch(err => {
        console.error("Error getting the project info: ", err);
    });

    // verify project is good.
    if (_.isUndefined(project) || _.isEmpty(project)){
        response["msg"] = "Error getting the project information. Try later";
        res.status(400).send(response);
        return;
    }
    
    // =========== Validate Work Item exist =================
    
    const workItem = await workItemCollection.findById(workItemId).catch ( err =>{
        console.error("Error getting work item: ", err);
    });

     // verify project is good.
     if (_.isUndefined(workItem) || _.isEmpty(workItem)){
        response["msg"] = "Error getting the work Item information. Try later";
        res.status(400).send(response);
        return;
    }
    // Validate work item belong to this project id
    if (workItem.projectId != projectId){
        response["msg"] = "This work item does not belong to the project.";
        res.status(400).send(response);
        return;
    }


    // ======================================================

    // waiting for this params. Anything that cames undefined was not sent
    let  { 
        title,
        assignedUser,
        sprint,
        storyPoints,
        priorityPoints,
        status,
        teamId,
        type,
        description,
        tags,
    } = req.body;

    // in case only updating the status
    let UPDATING_ONLY_STATUS = (Object.keys(req.body).length == 1 && req.body["status"] != undefined);

    // validate work item is not completed yet
    if (workItem["status"] === WORK_ITEM_STATUS["Completed"] && !UPDATING_ONLY_STATUS){
        response["msg"] = "Sorry, Completed work items cannot be edited. Still you can add comments to it.";
        res.status(400).send(response);
        return;
    }

    let addUserToTeam = false;
    let updateValues = {};

    // verify title
    if (_.isString(title) && title.length < MAX_LENGTH_TITLE){
        updateValues["title"] = title;
    }

    // verify assigned user
    if (_.isString(assignedUser)){
        
        // verify if the user was selected to unnasigned
        if (assignedUser == UNASSIGNED.id){

            // check if there is any user, if not, return error;
            if (workItem["status"] === WORK_ITEM_STATUS["Completed"]){
                response["msg"] = "Sorry, Work Item cannot be completed without an user assigned.";
                res.status(400).send(response);
                return;
            }

            updateValues["assignedUser"] = {name: UNASSIGNED.name};

        }else if(project.isUserInProject(assignedUser)){

            const user = await project.getUserName(assignedUser).catch(err => 
                console.error("Error getting the user: ", err)
            );

            if (user){
                addUserToTeam = true;
                updateValues["assignedUser"] = {name: user["fullName"], id: assignedUser}
            }
        }
    }

    // sprint was received
    if (!_.isUndefined(sprint)){

        // is unselected? 
        if (sprint == UNASSIGNED.id){
            await SprintCollection.removeWorkItemFromSprints(projectId, workItemId).catch(err =>{});
        }else{
            // remove work item in case it belongs to other sprint
            await SprintCollection.removeWorkItemFromSprints(projectId, workItemId).catch(err =>{});;
            
            // add the work item to the sprint selected by the user
            await SprintCollection.addWorkItemToSprint(projectId, workItemId, sprint).catch(err =>{});;
        }
    }

    // verify story points
    if (!_.isEmpty(storyPoints)){

        if (!isNaN(storyPoints)){
            storyPoints = parseInt(storyPoints);
            if (storyPoints <= MAX_STORY_POINTS){
                updateValues["storyPoints"] = storyPoints;
            }
        }else{
            response["msg"] = "Story points is either empty or out of range.";
            res.status(400).send(response);
            return;
        }
    }

    // verify Priority points
    if (!_.isEmpty(priorityPoints)){

        if (!isNaN(priorityPoints)){
            priorityPoints = parseInt(priorityPoints);
            if (priorityPoints <= MAX_PRIORITY_POINTS){
                updateValues["priorityPoints"] = priorityPoints;
            }
        }else{
            response["msg"] = "Priority points is either empty or out of range.";
            res.status(400).send(response);
            return;
        } 
    }

    // verify Status
    if (_.isString(status)){
        const STATUS = Object.keys(WORK_ITEM_STATUS);
        status = capitalize(status);

        if (STATUS.includes(status)){

            // check if there is any user, if not, return error;
            if (status === WORK_ITEM_STATUS["Completed"] && (!addUserToTeam && workItem["assignedUser"].id == null)){
                response["msg"] = "Sorry, Work Item cannot be completed without an user assigned.";
                res.status(400).send(response);
                return;
            }

            updateValues["status"] = status;
        }else{
            response["msg"] = "The status for the work item did not match any of the status available";
            res.status(400).send(response);
            return;
        }
    }

    // verify team
    if (_.isString(teamId)){
    
        // verify if the user was selected to unnasigned
        if (teamId == UNASSIGNED.id){
            updateValues["teamId"] = null;
        }else if(project.isTeamInProject(teamId)){
            // verify is the user is in the project
            updateValues["teamId"] = teamId;
        }else{
            response["msg"] = "Sorry, We cannot find the team.";
            res.status(400).send(response);
            return;
        }
    }

    // verify Type
    if (_.isString(type)){
        const TYPES = Object.keys(WORK_ITEM_ICONS);
        type = capitalize(type);

        if (TYPES.includes(type)){
            updateValues["type"] = type;
        }else{
            response["msg"] = "The type for the work item does not match any of the types available";
            res.status(400).send(response);
            return;
        }
    }

    // verify description
    if (_.isString(description)){
        
        if (description.length <= MAX_LENGTH_DESCRIPTION){
            updateValues["description"] = description;
        }else{
            response["msg"] = `Descrition is bigger than expected. Limit is: ${MAX_LENGTH_DESCRIPTION} chars`;
            res.status(400).send(response);
            return;
        }
    }

    // array. Tags can be empty. when empty just remove the tags from work item
    if (_.isArray(tags)){
        if (_.isEmpty(tags) || tags.every(val => _.isEmpty(val))){
            updateValues["tags"] = [];
        }else{

            // all value tags are string and not empty
            all_are_string = tags.every(val => _.isString(val) && !_.isEmpty(val));

            if (all_are_string){
                updateValues["tags"] = tags;
            }else{
                response["msg"] = "Sorry, there was an error adding the tags.";
                res.status(400).send(response);
                return;
            }
        }
    }

    // add user to the team assigned if the user is not already in there. 
    if (updateValues["teamId"] || addUserToTeam){
        let teamId = updateValues["teamId"] || workItem["teamId"];
        let user = addUserToTeam ? updateValues["assignedUser"]: workItem["assignedUser"];
        
        if (user.id && teamId){
            await project.addUserToTeam(user.id.toString(), teamId.toString() ).catch(err => {
               console.error(err);   
            });
        }
    }
    
    // iter all over the update values
    for( key in updateValues){
        workItem[key] = updateValues[key];
    }

    workItem["updatedAt"] = Date.now();

    
    let updatedWorkItem = await workItem.save().catch(err => {
        console.error("Error saving the work item: ", err);
    });

    if (_.isUndefined(updatedWorkItem) || _.isNull(updatedWorkItem)){
        response["msg"] = "Sorry, there was an error saving the changes to the work item.";
        res.status(400).send(response);
        return;
    }


    // ======== TO JOIN THE WORK ITEM WITH THE TEAMS =============
    updatedWorkItem = updatedWorkItem.toObject();
    
    // get all the teams for this project
    let teams = [...project.teams];

    // get all sprints for project
    let sprints = await SprintCollection.find({projectId}).catch(err => console.error(err)) || [];
    
    // Create new key (team/sprint) to store the work item team
    joinData([updatedWorkItem], teams, "teamId", "equal", "_id", "team", UNASSIGNED);
    joinData([updatedWorkItem], sprints, "_id", "is in", "tasks", "sprint", UNASSIGNED_SPRINT);
    // ============================================================ 
    
    response["msg"] = "Work Item was updated successfully!";
    response["workItem"] = updatedWorkItem;
    res.status(200).send(response);
});

/**
 * METHOD: POST - Update work item order & status
 */
router.post("/api/:id/updateWorkItemOrder/:workItemId/:sprintId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to update work item status...");
    
    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    const sprintId = req.params.sprintId;
    
    let response = {};

    // =========== Validate project exist =================
    
    const project = await projectCollection.findById(projectId).catch(err => {
        console.error("Error getting the project info: ", err);
    });

    // verify project is good.
    if (_.isUndefined(project) || _.isEmpty(project)){
        response["msg"] = "Error getting the project information. Try later";
        res.status(400).send(response);
        return;
    }
    
    // =========== Validate Work Item exist =================
    
    const workItem = await workItemCollection.findById(workItemId).catch ( err =>{
        console.error("Error getting work item: ", err);
    });

    // verify project is good.
    if (_.isUndefined(workItem) || _.isEmpty(workItem)){
        response["msg"] = "Error getting the work Item information. Try later";
        res.status(400).send(response);
        return;
    }

    // Validate work item belong to this project id
    if (workItem.projectId != projectId){
        response["msg"] = "This work item does not belong to the project.";
        res.status(400).send(response);
        return;
    }

    let sprintOrderError = undefined;
    const sprintOrder = await SprintCollection.getSprintOrder(sprintId, projectId).catch ( err =>{
        console.error("Error getting work item: ", err);
        sprintOrderError = err;
    });

    // if there is an error getting the sprint order
    if (!_.isUndefined(sprintOrderError) ){
        response["msg"] = "Sorry, there was an internal error getting the information of the sprint.";
        res.status(400).send(response);
        return;
    }

    // ======================================================

    // waiting for this params. Anything that cames undefined was not sent
    let  { 
        status,
        location,
        index,
    } = req.body;

    if (_.isString(location) && !_.isUndefined(index) && !isNaN(index)){
        console.log("\nAdding work item to an order...\n");
        
        if ( !(location in  sprintOrder["order"]) ){
            response["msg"] = "Oops, it seems there was a problem moving the work item to a different status. Please try later.";
            res.status(400).send(response);
            return;
        }

        let isWorkItemFound = false;

        if ( _.isArray( sprintOrder["order"][location])){

            // try to find the previus location of the work item and remove it
            for (let sprintWorkItemPage of sprintOrder["order"][location]){
                
                // getting all ids of the work items 
                let workItemsIds = sprintWorkItemPage["index"];

                // check if the work items is in this location
                isWorkItemFound = workItemsIds.some(each => {return each == workItemId});

                if (isWorkItemFound){

                    // get the index of the work item - index is the order
                    let indexOfWorkItemFound = workItemsIds.indexOf(workItemId);
                    
                    // remove that element from the order
                    workItemsIds.splice(indexOfWorkItemFound, 1);
                    
                    break;
                }

            }

                // find new location for the work item and add it. 
                let newStatusLocation = sprintOrder["order"][location].filter(each => {
                    return each["status"] == status;
                })[0];

                // add workItemId to index and remove 0 elements.
                newStatusLocation["index"].splice(index, 0, workItemId);
        }else{
            let workItemsIds = sprintOrder["order"][location]["index"];
            
            // check if the work items is in this location
            isWorkItemFound = workItemsIds.some(each => {return each == workItemId});

            if (isWorkItemFound){

                // get the index of the work item - index is the order
                let indexOfWorkItemFound = workItemsIds.indexOf(workItemId);
                
                // remove that element from the order
                workItemsIds.splice(indexOfWorkItemFound, 1);
                
            }

            // add element to the order
            workItemsIds.splice(index, 0, workItemId);

        }

        // update the order of the work item
        await sprintOrder.save().catch( err => {
            console.error("Error updating the order of the work item: ", err);
        });

    }   

    // verify Status
    if (_.isString(status)){
        const STATUS = Object.keys(WORK_ITEM_STATUS);
        status = capitalize(status);

        if (STATUS.includes(status)){

            // check if there is any user, if not, return error;
            if (status === WORK_ITEM_STATUS["Completed"] && workItem["assignedUser"].id == null){
                response["msg"] = "Sorry, Work Item cannot be completed without an user assigned.";
                res.status(400).send(response);
                return;
            }

            workItem["status"] = status;
        }else{
            response["msg"] = "The status for the work item did not match any of the status available";
            res.status(400).send(response);
            return;
        }
    }

    await workItem.save().catch(err => {
        console.error("Error saving the status of the work item: ", err);
    });

    res.status(200).send(response);
});


/**
 * METHOD: POST - Move work item to a sprint
 */
router.post("/api/:id/moveWorkItemsToSprint/:teamId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to move work item to iteration...");
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;
    let response = {projectId, teamId};

    const {sprintId, workItemIds} = req.body;

    if (_.isUndefined(sprintId) || _.isNull(sprintId)){
        response["msg"] = "Invalid sprint was received.";
        res.status(400).send(response);
        return;
    }

    if (!_.isArray(workItemIds) || _.isEmpty(workItemIds)){
        response["msg"] = "Invalid work items were received.";
        res.status(400).send(response);
        return;
    }

    // =========== Validate project exist =================
    
    const project = await projectCollection.findById(projectId).catch(err => {
        console.error("Error getting the project info: ", err);
    });

    // verify project is good.
    if (_.isUndefined(project) || _.isEmpty(project)){
        response["msg"] = "Error getting the project information. Try later"
        res.status(400).send(response);
        return;
    }

    // check team
    if (!project.isTeamInProject(teamId)){
        response["msg"] = "Sorry, The team received does not belong to the current project.";
        res.status(400).send(response);
        return;
    }

    // check work item
    for (const workItem of workItemIds){

        if (!project.isWorkItemInProject(workItem)){
            response["msg"] = "Sorry, A work item received does not belong to the current project.";
            res.status(400).send(response);
            return;
        }
    }
    
    // =========== UPDATE SPRINT =================

    if (sprintId == UNASSIGNED_SPRINT["_id"]){
        let backlog_error = null;
        await SprintCollection.updateMany(
            {projectId, teamId},
            {$pull: {tasks: {$in: workItemIds }}}
        ).catch(err => {
            backlog_error = err;
            console.error(err);
        });

        if (backlog_error){
            response["msg"] = "Sorry, There was a problem moving the work item/s to the backlog";
            res.status(400).send(response);
            return;
        }

        response["msg"] = "Work items were moved to the backlog.";
        res.status(200).send(response);
        return;
    } // if the 'if' above is true, the program ends there. 

    let sprint = await SprintCollection.updateOne(
        {"_id": sprintId, "projectId": projectId},
        {$push: {"tasks": {$each: workItemIds}}}
    ).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(sprint) || _.isNull(sprint)){
        response["msg"] = "Sorry, There was a problem moving Work item/s to the sprint. Try later.";
        res.status(400).send(response);
        return;
    }
    
    response["msg"] = (workItemIds.length > 0) ? "Work Items were moved to the sprint.": "Work Item was moved to the sprint.";
    res.status(200).send(response);
});

module.exports = router;