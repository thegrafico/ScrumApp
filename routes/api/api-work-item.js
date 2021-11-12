
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const WorkItemCollection        = require("../../dbSchema/workItem");
const ProjectCollection         = require("../../dbSchema/projects");
const UserCollection            = require("../../dbSchema/user");
const SprintCollection          = require("../../dbSchema/sprint");

const _                         = require("lodash");
let router                      = express.Router();

const {
    UNASSIGNED_USER,
    UNASSIGNED,
    MAX_LENGTH_TITLE,
    MAX_LENGTH_DESCRIPTION,
    MAX_PRIORITY_POINTS,
    MAX_STORY_POINTS,
    UNASSIGNED_SPRINT,
    WORK_ITEM_STATUS,
    WORK_ITEM_ICONS,
    capitalize,
    joinData,
    sortByDate,
    addUserNameToComment,
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
    let projectInfo = await ProjectCollection.findOne({_id: projectId}).catch(err => {
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
    }) || {};

    // get all users for this project -> expected an array
    let users = await projectInfo.getUsers().catch(err => console.error("Error getting the users: ", err)) || [];
    

    if (_.isUndefined(workItem) || _.isEmpty(workItem)){
        response["msg"] = "Sorry, There was a problem getting the work item information.";
        return res.status(400).send(response);
    }
    
    workItem = workItem.toObject();

    
    // update the comments
    workItem["comments"] = addUserNameToComment(workItem["comments"], users, req.user["_id"]);

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

    // add the relationship to the current work item
    await WorkItemCollection.setRelationship(workItem).catch(err => {
        console.error("Error setting the relationship for the work item: ", err);
    });

    // sorting sprint
    sprints = sortByDate(sprints, "startDate");

    sprints.unshift(UNASSIGNED_SPRINT);

    response["workItem"] = workItem;
    response["sprints"] = sprints;
    response["activeSprint"] = activeSprintId;
    response["msg"] = "success";
    return res.status(200).send(response);
});

/**
 * METHOD: GET - Get work item by itemId
 */
router.get("/api/:id/getWorkItemByItemId/:workItemId", middleware.isUserInProject, async function (req, res) {
    console.log("Getting request to get work item by item id...");

    const projectId = req.params.id;
    const workItemItemId = req.params.workItemId;
    let response = {};

    // verify is the project exists
    let projectInfo = await ProjectCollection.findOne({_id: projectId}).catch(err => {
        console.log("Error is: ", err.reason);
    });

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        response["msg"] = "Sorry, There was a problem getting the project information.";
        return res.status(400).send(response);
    }

    // check workItemItemId
    if (_.isEmpty(workItemItemId) || isNaN(workItemItemId)){
        response["msg"] = "Sorry, Invalid Id for the work item was received.";
        return res.status(400).send(response);
    }

    // ============== CHECK WORK ITEM INFO ==============
    let errorGettingWorkItem = null;
    let workItem = await projectInfo.getWorkItemByItemId(workItemItemId).catch(err => {
        console.error("Error getting work items: ", err);
        errorGettingWorkItem = err;
    }) || [];


    // check if there was error getting work item
    if (errorGettingWorkItem){
        response["msg"] = "Sorry, There was a problem getting the work item information.";
        return res.status(400).send(response);
    }
    
    response["workItem"] = workItem;
    response["msg"] = "success";
    return res.status(200).send(response);
});


/**
 * METHOD: GET - get similar work items by id: 
 * E.X: id of the work item is: 20, it will get work items that id start with 20, 21, 22;
 */
router.get("/api/:id/getSimilarWorkItems", middleware.isUserInProject, async function (req, res) {
    console.log("Getting request to get work item by similar id...");

    const projectId = req.params.id;
    let response = {};
    let { id, limit} = req.query;

    if (_.isUndefined(id) || _.isEmpty(id) || isNaN(id)){
        response["msg"] = "Sorry, Invalid data was received.";
        return res.status(400).send(response);
    }
    // verify is the project exists
    let projectInfo = await ProjectCollection.findOne({_id: projectId}).catch(err => {
        console.log("Error is: ", err.reason);
    });

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)) {
        response["msg"] = "Sorry, There was a problem getting the project information.";
        return res.status(400).send(response);
    }
    // == end 

    // get all work items for the project
    let projectWorkItems = await projectInfo.getWorkItems().catch(err => {
        console.error("Error getting work items: ", err);
    }) || [];

    // filter work items by the id of the user
    let similarWorkItems = projectWorkItems.filter( workItem => {
        return workItem["itemId"].toString().startsWith(id);
    });

    // if not empty and is a number
    if (limit && !_.isEmpty(limit) && !isNaN(limit)){
        similarWorkItems = similarWorkItems.slice(0, limit);
    }

    response["msg"] = "success";
    response["workItems"] = similarWorkItems;

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
        tags,
        links
    } = req.body;

    // Fixing variables 
    userAssigned = userAssigned                 || UNASSIGNED._id;
    teamAssigned = teamAssigned                 || UNASSIGNED._id;
    workItemStatus = capitalize(workItemStatus) || WORK_ITEM_STATUS["New"]; // default
    workItemType = capitalize(workItemType)     || Object.keys(WORK_ITEM_ICONS)[0]; // Story is the default value
    storyPoints = parseInt(storyPoints)         || 0;
    priorityPoints = parseInt(priorityPoints)   || MAX_PRIORITY_POINTS;
    tags = tags                                 || [];

    let errors = undefined;
    let addUserToTeam = false;

    const projectId = req.params.id;

    // getting project info
    let projectInfo = await ProjectCollection.findOne({_id: projectId}).catch(err => {
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
    if (userAssigned != UNASSIGNED._id && !users.includes(userAssigned)){
        console.error("Cannot find the user for the work item: ", userAssigned);
        response["msg"] = "Cannot find the user assigned for this work item.";
        res.status(400).send(response);
        return;
    }

    if (userAssigned != UNASSIGNED._id) {
        const _user = await UserCollection
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
    if (teamAssigned != UNASSIGNED._id && !teams.includes(teamAssigned)){
        console.error("Error getting the team assigned for the work item");
        response["msg"] = "Sorry, We Cannot find the team assigned for this work item.";
        res.status(400).send(response);
        return;
    }

    // add the user if not default
    // TODO: if a user was assigned to this work item, then we should add that user to the team if the user is not in the team already. 
    if (teamAssigned != UNASSIGNED._id) 
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

    // ============ LINKS ==============
    // to add the relationship to other work item since relationship is two ways. 
    let addRelationshipToOtherWorkItems = [];

    // LINKS - for relationship of the work item
    console.log("LINKS: ", links);
    if (_.isArray(links)){

        // Check if empty
        if (_.isEmpty(links) || links.every(val => _.isEmpty(val))){
            newWorkItem["links"] = [];
        }else{

            let invalidWorkItemFound = false;
            let workItemRelationships = [];
            let workItemsAlreadyAdded = [];

            // check all links are in project
            for (let workItemRelationId of links){

                let workItemRelationship = workItemRelationId.split("-");

                // assuming there is not more -
                let relationship = workItemRelationship[0].trim();
                let wId = workItemRelationship[1].trim();

                // if the work item already has a relationship, jump to next iteration
                if (workItemsAlreadyAdded.includes(wId)){
                    continue;
                }

                // add work item to the record so we dont add duplicate work items
                workItemsAlreadyAdded.push(wId);

                // check if the work item is not in the project
                if (!projectInfo.isWorkItemInProject(wId)){
                    invalidWorkItemFound = true;
                    break;
                }

                workItemRelationships.push({relationship: relationship, workItemId: wId});

                // add the relation to the other work item now
                addRelationshipToOtherWorkItems.push({addTo: wId, from: null, "relationship": relationship});
            }

            if (invalidWorkItemFound){
                response["msg"] = "Sorry, Invalid work item received for the relationship of the current work item.";
                res.status(400).send(response);
                return;
            }else{
                newWorkItem["links"] = workItemRelationships;
            }
        }
    }
    // ============== END

    newWorkItem["title"] = title;
    newWorkItem["status"] = workItemStatus;
    newWorkItem["description"] = workItemDescription;
    newWorkItem["projectId"] = projectId;
    
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

    newWorkItem = await WorkItemCollection.create(newWorkItem).catch(err =>{
        errors = err.reason;
        console.error("Error creating the work item: ", err)
    });

    // verify work item was created
    if (_.isEmpty(newWorkItem) || _.isNull(newWorkItem)){
        response["msg"] = `There was an error creating the work item: ${errors}`;
        res.status(400).send(response);
        return;
    }

    //  at this point we know the work item was created, so now we can add the relationship for the other work items
    // Add the relationship to the other work items since relationship is two ways
    await WorkItemCollection.addRelationToWorkItem(projectId, addRelationshipToOtherWorkItems, newWorkItem["_id"]).catch(err => {
        console.error("Error adding relationship to other work items: ", err);
    });

    // Add the work item to the sprint if was selected by the user
    if (!_.isUndefined(sprint) && !_.isEmpty(sprint) && sprint != UNASSIGNED_SPRINT._id){
        await SprintCollection.addWorkItemToSprint(projectId, newWorkItem["_id"], sprint).catch(err => {
            console.error("Error adding work item to sprint: ", err);
        });
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
router.post("/api/:id/workItem/:workItemId/addComment", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to add a comment to a work item...");
    
    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    const userId = req.user["_id"];
    
    let  { comment } = req.body;
    let response = {};

    // string and not empty
    if (_.isString(comment) && !_.isEmpty(comment.trim())){
        
        // clean the comment in case
        comment = comment.trim();

        // look for work item
        let workItem = await WorkItemCollection.findOne({projectId: projectId, _id: workItemId}).catch(err=>{
            console.error("Error getting the work item");
        });
        console.log("WorkItem: ", workItem);
        
        // check if work item was found
        if (!workItem){
            console.error("Cannot find the work item");
            response["msg"] = "Error adding the comment to the work item, Please try later.";
            res.status(400).send(response);
            return;
        }  

        // add the comment to the work item
        workItem["comments"].push({author: userId, comment});

        workItem.save().then( (doc) => {

            console.log("Comment was added to work item: ", doc);

            let commentAdded = doc["comments"].filter(each => {
                return (each["author"].toString() === userId.toString() && each["comment"] == comment)
            })

            response["comment"] = commentAdded[0];
            response["msg"] = "Comment was added successfully!";
            res.status(200).send(response);

        }).catch(err => {
            console.error("Error adding the comment:", err);
            response["msg"] = "Oops, it seems there was a problem adding the comment to the work item.";
            res.status(400).send(response);
        });

    }else{
        console.error("Invalid comment for work item");
        response["msg"] = "Comment is either empty or does not exist.";
        res.status(400).send(response);
        return;
    }
});

/**
 * METHOD: POST - Update comment for the work item
 */
router.post("/api/:id/workItem/:workItemId/updateComment", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to update a comment to a work item...");
    
    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    const userId = req.user["_id"];
    
    let  { comment, commentId} = req.body;
    let response = {};

    comment = (comment || "").trim();

    if (!_.isString(commentId) || _.isEmpty(commentId)){
        console.log("Invalid comment received");
        response["msg"] = "Invalid comment received";
        return res.status(400).send(response);
    }

    // Getting work item
    let workItem = await WorkItemCollection.findOne({projectId, _id: workItemId}).catch(err => {
        console.error("Error getting work item: ", err);
    });

    if (!workItem) {
        console.log("Cannot find the work item");
        response["msg"] = "Sorry, Cannot find the work item to update the comment";
        return res.status(400).send(response);
    }
    let commentWasUpdated = false;
    for (let userComment of workItem["comments"]){
        if (userComment["author"].toString() === userId.toString() &&
            userComment["_id"].toString() === commentId.toString() &&
            userComment["comment"] != comment){
                userComment["comment"] = comment;
                commentWasUpdated = true;
                break;
        }

        // console.log("===============");
        // console.log(userComment["author"].toString() === userId.toString());
        // console.log(userComment["_id"].toString() === commentId.toString());
        // console.log(userComment["comment"] != comment);
        // console.log(userComment["comment"], comment);
        // console.log("===============")

    }



    
    console.log("commentWasUpdated", commentWasUpdated);

    // update work item only if there was an update
    if (commentWasUpdated){
        
        workItem.save().then((doc) => {
            console.log("Comment was saved");
            response["msg"] = "Comment updated.";
            res.status(200).send(response);
        }).catch(err => {
            console.error("Error updating the comment: ", err);
            response["msg"] = "Sorry, there was a problem updating the comment for the program.";
            res.status(400).send(response);
        });

        return;
    }

    console.log("Comment was not updated");
    response["msg"] = "Comment not updated";
    res.status(200).send(response);
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
    
    const project = await ProjectCollection.findById(projectId).catch(err => {
        console.error("Error getting the project info: ", err);
    });

    // verify project is good.
    if (_.isUndefined(project) || _.isEmpty(project)){
        response["msg"] = "Error getting the project information. Try later";
        res.status(400).send(response);
        return;
    }
    
    // =========== Validate Work Item exist =================
    
    const workItem = await WorkItemCollection.findById(workItemId).catch ( err =>{
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
        links
    } = req.body;

    const currentLinks = workItem["links"];

    // in case only updating the status
    const UPDATING_ONLY_STATUS = (Object.keys(req.body).length == 1 && status != undefined);
    const UPDATING_ONLY_LINKS =  (Object.keys(req.body).length == 1 && links != undefined && _.isArray(links));

    // validate work item is not completed yet
    if (!status){
        if (workItem["status"] === WORK_ITEM_STATUS["Completed"] && !UPDATING_ONLY_STATUS && !UPDATING_ONLY_LINKS){
            response["msg"] = "Sorry, Completed work items cannot be edit unless status is changed";
            res.status(400).send(response);
            return;
        }
    }else{
        if (workItem["status"] === WORK_ITEM_STATUS["Completed"] && !UPDATING_ONLY_STATUS && status != WORK_ITEM_STATUS["Completed"] && !UPDATING_ONLY_LINKS){
            response["msg"] = "Sorry, Completed work items cannot be edit unless status is changed";
            res.status(400).send(response);
            return;
        }
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
        if (assignedUser == UNASSIGNED._id){
            
            if (!status){
                // check if there is any user, if not, return error;
                if (workItem["status"] === WORK_ITEM_STATUS["Completed"]){
                    response["msg"] = "Sorry, Work Item cannot be completed without an user assigned.";
                    res.status(400).send(response);
                    return;
                }
            }else{
                // check if there is any user, if not, return error;
                if (workItem["status"] === WORK_ITEM_STATUS["Completed"] && status != WORK_ITEM_STATUS["Completed"]){
                    response["msg"] = "Sorry, Work Item cannot be completed without an user assigned.";
                    res.status(400).send(response);
                    return;
                }
            }
            

            updateValues["assignedUser"] = {name: UNASSIGNED.name};

        }else if(project.isUserInProject(assignedUser)){

            const user = await project.getUser(assignedUser).catch(err => 
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

        // remove work item in case it belongs to other sprint
        await SprintCollection.removeWorkItemFromSprints(projectId, workItemId).catch(err =>{});

        // is unselected? 
        if (sprint != UNASSIGNED._id){
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
        if (teamId == UNASSIGNED._id){
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

    // to add the relationship to other work item
    // since relationship is two ways. 
    let addRelationshipToOtherWorkItems = [];

    // LINKS - for relationship of the work item
    if (_.isArray(links)){
        if (_.isEmpty(links) || links.every(val => _.isEmpty(val))){
            updateValues["links"] = [];
        }else{
            let invalidWorkItemFound = false;
            let workItemRelationships = [];
            let workItemsAlreadyAdded = [];

            // check all links are in project
            for (let workItemRelationId of links){

                let workItemRelationship = workItemRelationId.split("-");

                // assuming there is not more -
                let relationship = workItemRelationship[0].trim();
                let wId = workItemRelationship[1].trim();

                // if the work item already has a relationship, jump to next iteration
                if (workItemsAlreadyAdded.includes(wId)){
                    response["msg"] = "Sorry, Related work items cannot be duplicates.";
                    res.status(400).send(response);
                    return;
                }

                // add work item to the record so we dont add duplicate work items
                workItemsAlreadyAdded.push(wId);

                // check if the user is trying to add a related work item with the same id of the
                // current id
                if (wId === workItem["_id"].toString()){
                    response["msg"] = "Sorry, Related work item cannot be the same as the current work item.";
                    res.status(400).send(response);
                    return;
                }

                // check if the work item is not in the project
                if (!project.isWorkItemInProject(wId)){
                    invalidWorkItemFound = true;
                    break;
                }

                workItemRelationships.push({relationship: relationship, workItemId: wId});

                // add the relation to the other work item now
                addRelationshipToOtherWorkItems.push({addTo: wId, "relationship": relationship});
            }

            if (invalidWorkItemFound){
                response["msg"] = "Sorry, Invalid work item received for the relationship of the current work item.";
                res.status(400).send(response);
                return;
            }else{
                updateValues["links"] = workItemRelationships;
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

    // update the Update field
    workItem["updatedAt"] = Date.now();

    let updatedWorkItem = await workItem.save().catch(err => {
        console.error("Error saving the work item: ", err);
    });

    if (_.isUndefined(updatedWorkItem) || _.isNull(updatedWorkItem)){
        response["msg"] = "Sorry, there was an error saving the changes to the work item.";
        res.status(400).send(response);
        return;
    }

    // In case the user updates the relationship and removed some relationships
    await WorkItemCollection.removeRelationFromWorkItem(projectId, workItem["_id"], currentLinks, updateValues["links"]).catch(err => {
        console.error("Error removing relationship form other work items: ", err);
    });

    // Add the relationship to the other work items since relationship is two ways
    await WorkItemCollection.addRelationToWorkItem(projectId, addRelationshipToOtherWorkItems, workItem["_id"]).catch(err => {
        console.error("Error adding relationship to other work items: ", err);
    });

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
    
    console.log("Getting request to update work item order and status...");
    
    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    const sprintId = req.params.sprintId;
    
    let response = {};
    let workItemUserWasUpdated = false;

    // =========== Validate project exist =================
    
    const project = await ProjectCollection.findById(projectId).catch(err => {
        console.error("Error getting the project info: ", err);
    });

    // verify project is good.
    if (_.isUndefined(project) || _.isEmpty(project)){
        response["msg"] = "Error getting the project information. Try later";
        res.status(400).send(response);
        return;
    }
    
    // =========== Validate Work Item exist =================
    
    let workItem = await WorkItemCollection.findById(workItemId).catch ( err =>{
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
    let sprintOrder = await SprintCollection.getSprintOrder(sprintId, projectId).catch ( err =>{
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

    // updating order for the work item
    if (_.isString(location) && !_.isUndefined(index) && !isNaN(index)){
        console.log("\nAdding work item to an order...\n");

        index = parseInt(index);
        
        // check if the location exists in the db
        if ( !(location in sprintOrder["order"]) ){
            response["msg"] = "Oops, it seems there was a problem moving the work item to a different status. Please try later.";
            res.status(400).send(response);
            return;
        }

        let isWorkItemFound = false;
        
        if ( _.isArray( sprintOrder["order"][location])){
            console.log("Array order for: ", location);

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
            console.log("Order for: ", location);

            let workItemsIds = sprintOrder["order"][location]["index"];
            
            // check if the work items is in this location
            isWorkItemFound = workItemsIds.some(each => {return each == workItemId});

            if (isWorkItemFound){
                // get the index of the work item - index is the order
                let indexOfWorkItemFound = workItemsIds.indexOf(workItemId);
                
                // remove that element from the order
                workItemsIds.splice(indexOfWorkItemFound, 1);
            }
            console.log("adding on index: ", index);
            // add element to the order
            workItemsIds.splice(index, 0, workItemId);
        }

        // update the order of the work item
        await sprintOrder.save().catch( err => {
            console.error("Error updating the order of the work item: ", err);
        });

    }   

    // Updating status
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
            
            // if the work item does not have any assigned user
            if (!workItem.hasUserAssigned()){
                let statusSelection = [WORK_ITEM_STATUS["Active"], WORK_ITEM_STATUS["Review"], WORK_ITEM_STATUS["Block"]];

                // if the status is inside the status selection, and the user has not been assigned
                // then we assign this work item to the current user making the changes
                if (statusSelection.includes(status)){

                    // user information
                    const assignedUser = {name: req.user["fullName"], id: req.user["_id"]};

                    // assign user information into work item
                    workItem["assignedUser"] = assignedUser
                    
                    // update to record
                    workItemUserWasUpdated = true;

                    // add to send it to user
                    response["assignedUser"] = assignedUser;
                }
            }

        }else{
            response["msg"] = "The status for the work item did not match any of the status available";
            res.status(400).send(response);
            return;
        }
    }

    response["userWasUpdated"] = workItemUserWasUpdated;

    workItem.save().then( (update) => {
        return res.status(200).send(response);
    }).catch(err => {
        console.error("Error saving the status of the work item: ", err);
        response["msg"] = "Sorry, There was a problem saving the changes to the work item";
        return res.status(400).send(response);
    });
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
    console.log("SPRINT ID:", sprintId);
    console.log("WORK ITEMS: ", workItemIds);

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
    
    const project = await ProjectCollection.findById(projectId).catch(err => {
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

        let isWorkItemInProject = await project.isWorkItemInProject(workItem);

        if (!isWorkItemInProject){
            response["msg"] = "Sorry, A work item received does not belong to the current project.";
            res.status(400).send(response);
            return;
        }

        // remove work items from all sprints
        await SprintCollection.removeWorkItemFromSprints(projectId, workItem).catch(err => {
            console.error("\nError removing work item from sprints: ", err);
        });
    }
    
    // =========== UPDATE SPRINT =================

    // if there is not id for the sprint, we end here
    if (sprintId == UNASSIGNED_SPRINT["_id"]){
        response["msg"] = (workItemIds.length > 1) ? "Work Items were moved to the sprint.": "Work Item was moved to the sprint.";
        res.status(200).send(response);
        return;
    }

    // remove work items from all sprints
    let wasAdded = await SprintCollection.addWorkItemToSprint(projectId, workItemIds, sprintId).catch(err => {
        console.error("Error removing work item from sprints: ", err);
    });

    if (!wasAdded){
        response["msg"] = "Sorry, There was a problem moving Work item/s to the sprint. Try later.";
        res.status(400).send(response);
        return;
    }

    response["msg"] = (workItemIds.length > 1) ? "Work Items were moved to the sprint.": "Work Item was moved to the sprint.";
    res.status(200).send(response);
});

/**
 * METHOD: POST - REMOVE WORK ITEMS FROM PROJECT
 */
router.post("/api/:id/removeWorkItems", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to remove work items...");
    
    const projectId = req.params.id;
    
    let  { workItemsId } = req.body; // expected array

    // is array and not empty
    if (_.isArray(workItemsId) && !_.isEmpty(workItemsId)){
        
        // remove the work item from the proyect
        let error_removing = false;
        for (let workItemId of workItemsId){
            
            // remove from db
            const result = await WorkItemCollection.findOneAndDelete({projectId: projectId, _id: workItemId}).catch(
                err => console.error("Error removing work item: ", err)
            );
            
            if (_.isNull(result) || _.isUndefined(result)){
                error_removing = true;
            }
        }

        if (error_removing){
            res.status(400).send("Sorry, There was a problem removing work items. Please try later.");
            return;
        }
        console.log("Work items removed...");
    }else{
        res.status(400).send("Sorry, We cannot find any work item to remove. Please try later.");
        return;
    }
    let item_str = workItemsId.length === 1 ? "item" : "items";
    res.status(200).send(`Successfully removed work ${item_str}`);
});

/**
 * METHOD: POST - ASSIGN WORK ITEMS TO AN USER
 */
router.post("/api/:id/assignWorkItemToUser", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to assign work items to user...");
    
    const projectId = req.params.id;
    
    let  { workItems,  userId} = req.body;
    let response = {};

    // getting project information
    let project = await ProjectCollection.findById(projectId).catch(err => {
        console.error("Error getting project: ", err);
    });

    if (!project){
        response["msg"] = "Sorry, There was a problem getting the project information";
        return res.status(400).send(response);
    }
    
    // check work items
    if (!_.isArray(workItems) || _.isEmpty(workItems)){
        response["msg"] = "Invalid work items were received.";
        return res.status(400).send(response);
    }

    // check userId
    if (_.isUndefined(userId) || _.isNull(userId)){
        response["msg"] = "Invalid User was received";
        return res.status(400).send(response);
    }

    let newUserForWorkItem = {};

    // check if unnasigned user
    if (userId == UNASSIGNED["_id"]){
        newUserForWorkItem["name"] = UNASSIGNED["name"];
        newUserForWorkItem["id"] = null;
    }else{
        // check the user is in project
        if (!project.isUserInProject(userId)){
            response["msg"] = "Sorry, User received does not belong to the project";
            return res.status(400).send(response);
        }

        // getting user name
        let userInfo = await project.getUser(userId).catch(err => {
            console.error(err);
        });

        if (!userInfo){
            response["msg"] = "Sorry, We couldn't find the information of the user received";
            return res.status(400).send(response);
        }

        newUserForWorkItem["name"] = userInfo["fullName"];
        newUserForWorkItem["id"] = userId;
    }

    // updating work item
    WorkItemCollection.updateMany(
        {projectId, _id: {$in: workItems}},
        {assignedUser: newUserForWorkItem}
    ).then( (update) => {
        console.log("Work Items were Updated");
        response["msg"] = (workItems.length > 1) ? "Work items were updated successfully.": "Work item was updated.";
        response["user"] = {name: newUserForWorkItem["name"], id: newUserForWorkItem["id"]}
        return res.status(200).send(response);
    }).catch(err => {
        console.error("Error updating work items users: ", err);
        response["msg"] = "Sorry, it seems there was an error updating the work items. Please try later or refresh the page.";
        return res.status(200).send(response);
    });
});

/**
 * METHOD: POST - ASSIGN WORK ITEMS TO TEAM
 */
router.post("/api/:id/assignWorkItemToTeam/:teamId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to assign work items to a team...");
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;
    
    let  { workItems, sprintId} = req.body;
    let response = {};

    // getting project information
    let project = await ProjectCollection.findById(projectId).catch(err => {
        console.error("Error getting project: ", err);
    });

    if (!project){
        response["msg"] = "Sorry, There was a problem getting the project information";
        return res.status(400).send(response);
    }
    
    // check work items
    if (!_.isArray(workItems) || _.isEmpty(workItems)){
        response["msg"] = "Invalid work items were received.";
        return res.status(400).send(response);
    }

    // check teamid
    if (_.isUndefined(teamId) || _.isNull(teamId)){
        response["msg"] = "Invalid Team was received";
        return res.status(400).send(response);
    }

    // check team is in project
    if (!project.isTeamInProject(teamId)){
        response["msg"] = "This team does not belong to the project.";
        return res.status(400).send(response);
    }

    // store the name of the team to send it with the response
    const teamName = project.getTeam(teamId); 

    // remove work item from previus sprint if any
    let error_removing_sprints_from_work_items = null;
    await SprintCollection.updateMany(
        {projectId, tasks: {$in: workItems}},
        {$pull: {tasks: {$in: workItems}}}
    ).catch(err => {
        error_removing_sprints_from_work_items = err;
        console.error("Error removing work items from previus sprints: ", err);
    });

    // check if there was any error removing sprints from work items
    if (error_removing_sprints_from_work_items){
        response["msg"] = "Sorry, There was a problem removing the work items from previus sprints";
        return res.status(400).send(response);
    }
    
    // updating work item
    WorkItemCollection.updateMany(
        {projectId, _id: {$in: workItems}},
        {teamId: teamId}
    ).then( async (update) => {
        console.log("Work Items were Updated");

        let udpatedSprint = UNASSIGNED;
        if (sprintId != UNASSIGNED["_id"]){

            // add work item to sprint if was selected
            let error_adding_work_item_to_sprint = null;
            udpatedSprint = await SprintCollection.findOneAndUpdate(
                {projectId, teamId, _id: sprintId},
                {$push: {tasks: {$each: workItems}}}
            ).catch(err =>{
                error_adding_work_item_to_sprint = err;
                console.error("Error adding work items to new sprint: ", err);
            });

            if (error_adding_work_item_to_sprint){
                response["msg"] = "Sorry, team was updated, but there was a problem assigning the sprint.";
                response["team"] = {name: teamName["name"], id: teamId}
                return res.status(400).send(response);
            }
        }
       
        response["msg"] = (workItems.length > 1) ? "Work items were updated successfully.": "Work item was updated.";
        response["team"] = {name: teamName["name"], id: teamId}
        response["sprint"] = {name: udpatedSprint["name"], id: sprintId};
        return res.status(200).send(response);
    }).catch(err => {
        console.error("Error updating work items users: ", err);
        response["msg"] = "Sorry, it seems there was an error updating the work items. Please try later or refresh the page.";
        return res.status(400).send(response);
    });
});


/**
 * METHOD: POST - REMOVE COMMENT FROM WORK ITEM
 */
router.post("/api/:id/workItem/:workItemId/removeComment", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to remove comment from work item...");
    
    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    const userId = req.user["_id"];
    
    let  { commentId } = req.body;

    let response = {workItemId, commentId};

    // remove the comment
    let workItem = await WorkItemCollection.findOne(
        {projectId, _id: workItemId}
    ).catch(err => {
        console.error(err);
    });

    if (!workItem){
        response['msg'] = "Sorry, Cannot find the work item to remove the comment.";
        res.status(400).send(response);
        return;
    }

    let comments = workItem["comments"];
    let commentFound = false;
    for (let comment of comments){
        if (comment["author"].toString() === userId.toString() && comment["_id"].toString() === commentId){
            commentFound = true;
            break;
        }
    }

    if (commentFound){
        workItem["comments"].pull({_id: commentId});
    }

    workItem.save().then( () => {
        response["msg"] = "Sucess";
        res.status(200).send(response);
    }).catch(err => {
        console.log("Error saving changes in work item: ", err);
        response["msg"] = "Sorry, it seems there was a problem removing the comment from the work item. Please try later.";
        res.status(400).send(response);
    });
});

module.exports = router;