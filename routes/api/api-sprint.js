
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const WorkItemCollection        = require("../../dbSchema/workItem");
const ProjectCollection         = require("../../dbSchema/projects");
const SprintCollection          = require("../../dbSchema/sprint");
const OrderSprintCollection     = require("../../dbSchema/sprint-order");
const moment                    = require("moment");
const _                         = require("lodash");
let router                      = express.Router();

const {
    SPRINT_FORMAT_DATE,
    ADD_SPRINT_TO_ALL_TEAM_ID,
    UNASSIGNED_SPRINT,
    WORK_ITEM_STATUS,
    SPRINT_STATUS,
    PAGES,
    getSprintDateStatus,
    sortByDate,
    getNumberOfElements,
    getNumberOfDays,
    setSprintOrder,
    sortByOrder,
    updateSprintOrderIndex,
    filteByStatus,
    getPointsForStatus,
} = require('../../dbSchema/Constanst');



/**
 * METHOD: GET - fetch all work items for a team with sprint
 */
router.get("/api/:id/getAllSprintWorkItems/:teamId", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;

    let response = {};

    // if null, not order is apply
    const { location } = req.query;

    // ========= GETTING PROJECT INFO ==========
    let project = await ProjectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(project)){
        response["msg"] = "Sorry, there was a problem getting the project information";
        res.status(400).send(response);
        return;
    }

    if (!project.isTeamInProject(teamId)){
        response["msg"] = "Sorry, it seams the team received does not belong to the project.";
        res.status(400).send(response);
        return;    
    }

    // ======== GETTING SPRINTS ============
    const getJsObject = true; // false is default
    let teamSprints = await SprintCollection.getSprintsForTeam(projectId, teamId, getJsObject).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(teamSprints)){
        response["msg"] = "Sorry, There was a problem getting the sprints for the team selected.";
        res.status(400).send(response);
        return; 
    }

    if (_.isEmpty(teamSprints)){
        response["msg"] = "There is not sprint for the team selected.";
        response["sprints"] = [];
        res.status(200).send(response);
        return;
    }

    // ============== GETTING ACTIVE SPRINT ==============

    let activeSprint = SprintCollection.getActiveSprint(teamSprints);

    // get sprint work items
    let workItems = await WorkItemCollection.find({projectId, _id: {$in: activeSprint["tasks"]}}).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(workItems) || _.isNull(workItems)){
        response["msg"] = "Sorry, There was a problem getting the work items for the team.";
        response["sprints"] = [];
        res.status(200).send(response);
        return;
    }

    const workItemsFound = !_.isEmpty(workItems);

    // in case request was from sprint board
    if (location == PAGES["SPRINT_BOARD"]){
        workItems = {
            New:  filteByStatus(workItems, WORK_ITEM_STATUS["New"]),
            Active: filteByStatus(workItems, WORK_ITEM_STATUS["Active"]),
            Review: filteByStatus(workItems, WORK_ITEM_STATUS["Review"]),
            Completed: filteByStatus(workItems, WORK_ITEM_STATUS["Completed"]),
            Block: filteByStatus(workItems, WORK_ITEM_STATUS["Block"]),
            Abandoned: filteByStatus(workItems, WORK_ITEM_STATUS["Abandoned"]),
        }
    }

    // ====== getting order for sprint ======
    if (_.isString(location) && Object.values(PAGES).includes(location) ){
        
        // Order of the sprint
        let sprintOrder = await SprintCollection.getSprintOrder(activeSprint["_id"], projectId);
        
        // if the sprint planning have never been set
        // TODO: set a default order for sprint board
        if (_.isEmpty(sprintOrder["order"]["sprintPlaning"]["index"])){
            sprintOrder = await setSprintOrder(sprintOrder, workItems, location, true);
        }else{

            switch(location){
                case PAGES["SPRINT"]:               
                    
                    // TODO: add check for sprint id instead of just length
                    if (sprintOrder["order"][location]["index"].length != sprint["tasks"].length){
                        console.log("Order from sprint does not match current order. Updating...");

                        if (getJsObject){

                            let sprint = await SprintCollection.findById(activeSprint["_id"]).catch (err => {
                                console.error("Error getting sprint: ", err);
                            });

                            // check sprint information
                            if (_.isUndefined(sprint) || _.isNull(sprint)){ 
                                console.error("Cannot find the sprint information to add it to the order.");
                                break;
                            }

                            // update the sprint order
                            await updateSprintOrderIndex(sprint, sprintOrder);

                        }else{
                            await updateSprintOrderIndex(activeSprint, sprintOrder);
                        }
                    }
                    
                    // sort by the order
                    workItems = sortByOrder(workItems, sprintOrder["order"][location]["index"], location);
                    break;
                case PAGES["SPRINT_BOARD"]:
                    workItems = sortByOrder(workItems, sprintOrder["order"][location], location);
                    break;
                default:
                    console.log("Location not found");
                break;
            }
            
        }
    }
    // ================================================

    teamSprints = teamSprints.sort((a,b) => new moment(b["startDate"], SPRINT_FORMAT_DATE) - new moment(a["endDate"], SPRINT_FORMAT_DATE));
    teamSprints.unshift(UNASSIGNED_SPRINT);

    response["msg"] = "success";
    response["activeSprint"] = activeSprint._id;
    response["sprints"] = teamSprints;
    response["workItems"] = workItems;
    response["workItemsFound"] = workItemsFound;

    res.status(200).send(response);
    return;

});


/**
 * METHOD: GET - fetch all work items for a team with sprint
 */
router.get("/api/:id/getSprintWorkItems/:teamId/:sprintId", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;
    const sprintId = req.params.sprintId;

    let response = {};
    
    // if null, not order is apply
    const { location } = req.query;

    // ========= GETTING PROJECT INFO ==========
    let project = await ProjectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(project)){
        response["msg"] = "Sorry, there was a problem getting the project information";
        res.status(400).send(response);
        return;
    }

    if (!project.isTeamInProject(teamId)){
        response["msg"] = "Sorry, it seams the team received does not belong to the project.";
        res.status(400).send(response);
        return;    
    }

    // ======== GETTING SPRINTS ============
    let sprint = await SprintCollection.findOne({projectId, _id: sprintId}).catch(err => {
        console.error(err);
    });

    // TODO: add null check on all find queries
    if (_.isUndefined(sprint) || _.isNull(sprint)){
        response["msg"] = "Sorry, There was a problem getting the sprints for the team selected.";
        res.status(400).send(response);
        return; 
    }

    // ======== GETTING WORK ITEMS FOR SPRINT ============

    // get sprint work items
    let workItems = await WorkItemCollection.find({projectId, _id: {$in: sprint["tasks"]}}).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(workItems)){
        response["msg"] = "Sorry, There was a problem getting the work items for the sprint.";
        response["sprints"] = [];
        res.status(200).send(response);
        return;
    }

    const workItemsFound = !_.isEmpty(workItems);

    if (location == PAGES["SPRINT_BOARD"]){
        workItems = {
            New:  filteByStatus(workItems, WORK_ITEM_STATUS["New"]),
            Active: filteByStatus(workItems, WORK_ITEM_STATUS["Active"]),
            Review: filteByStatus(workItems, WORK_ITEM_STATUS["Review"]),
            Completed: filteByStatus(workItems, WORK_ITEM_STATUS["Completed"]),
            Block: filteByStatus(workItems, WORK_ITEM_STATUS["Block"]),
            Abandoned: filteByStatus(workItems, WORK_ITEM_STATUS["Abandoned"]),
        }
    }

    if (_.isString(location) && Object.values(PAGES).includes(location) ){
        
        // Order of the sprint
        let sprintOrder = await SprintCollection.getSprintOrder(sprintId, projectId);
        
        // if the sprint board have never been set
        if (_.isEmpty(sprintOrder["order"][location]["index"])){
            sprintOrder = await setSprintOrder(sprintOrder, workItems, location, true);
        }else{

            switch(location){
                case PAGES["SPRINT"]:               
                    
                    if (sprintOrder["order"][location]["index"].length != sprint["tasks"].length){
                        console.log("Order from sprint does not match current order. Updating...");
                        await updateSprintOrderIndex(sprint, sprintOrder);
                    }
                    
                    // sort by the order
                    workItems = sortByOrder(workItems, sprintOrder["order"][location]["index"], location);
                    break;
                case PAGES["SPRINT_BOARD"]:
                    workItems = sortByOrder(workItems, sprintOrder["order"][location], location);
                    break;
                default:
                    console.log("Location not found");
                break;
            }
            
        }
    }

  
    response["msg"] = "success";
    response["workItems"] = workItems;
    response["workItemsFound"] = workItemsFound;

    res.status(200).send(response);
    return;

});


/**
 * METHOD: GET - Get sprint review data by team
 */
router.get("/api/:id/getSprintReview/:teamId", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;

    let response = {};

    // ========= GETTING PROJECT INFO ==========
    let project = await ProjectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(project) || _.isNull(project)){
        response["msg"] = "Sorry, there was a problem getting the project information";
        res.status(400).send(response);
        return;
    }

    if (!project.isTeamInProject(teamId)){
        response["msg"] = "Sorry, it seams the team received does not belong to the project.";
        res.status(400).send(response);
        return;    
    }

    let workItems = [];
    let activeSprint = undefined;
    let activeSprintId = undefined;
    let numberOfDays = 0;
    let startDate = '', endDate = '';
    let pointsHistory = [];
    let initalSprintPoints = 0;
    let sprintStatus = undefined;

    // getting sprints for team
    let sprints = await SprintCollection.getSprintsForTeam(projectId, teamId).catch(err => {
        console.log(err);
    }) || [];

    // in case this team does not have any team
    if (!_.isEmpty(sprints)){

        activeSprint = SprintCollection.getActiveSprint(sprints);

        // check we have an active sprint
        if (!_.isNull(activeSprint) || !_.isUndefined(activeSprint)){

            activeSprintId = activeSprint["_id"];

            startDate = activeSprint["startDate"];
            endDate = activeSprint["endDate"];
            numberOfDays = getNumberOfDays(startDate, endDate);
            pointsHistory = activeSprint["pointsHistory"];
            initalSprintPoints = activeSprint["initialPoints"];
            sprintStatus = getSprintDateStatus(activeSprint["startDate"], activeSprint["endDate"]);

            // get the work items by the sprint
            workItems = await WorkItemCollection.find({projectId: projectId, _id: {$in: activeSprint.tasks}}).catch(err => {
                console.error("Error getting work items: ", err)
            }) || [];
        }
    }

    let statusReport = {
        totalPoints: getPointsForStatus(workItems, null),
        completedPoints: getPointsForStatus(workItems, WORK_ITEM_STATUS["Completed"]),
        incompletedPoints: getPointsForStatus(workItems, WORK_ITEM_STATUS["Completed"], true),
        numberOfWorkItems: workItems.length, 
        numberOfWorkItemsCompleted: getNumberOfElements(workItems, WORK_ITEM_STATUS["Completed"]),
        numberOfWorkItemsIncompleted: getNumberOfElements(workItems, WORK_ITEM_STATUS["Completed"], true),
        capacity: activeSprint["capacity"],
        numberOfDays: numberOfDays,
        startDate: startDate,
        endDate: endDate,
        initalSprintPoints: initalSprintPoints,
        pointsHistory: pointsHistory,
        isActiveSprint: (activeSprintId != undefined),
        isFutureSprint: (sprintStatus === SPRINT_STATUS["Coming"])
    }

    // sorting data
    sprints = sortByDate(sprints, "startDate");
    workItems = sortByDate(workItems, "updatedAt", null, "desc");

    response["msg"] = "success";
    response["sprints"] = sprints;
    response["workItems"] = workItems;
    response["statusReport"] = statusReport;
    response["activeSprint"] = activeSprintId;

    res.status(200).send(response);
    return;

});


/**
 * METHOD: GET - Get sprint review data by sprint
 */
router.get("/api/:id/getSprintReview/:teamId/:sprintId", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;
    const sprintId = req.params.sprintId;

    let response = {};

    // ========= GETTING PROJECT INFO ==========
    let project = await ProjectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(project)){
        response["msg"] = "Sorry, there was a problem getting the project information";
        res.status(400).send(response);
        return;
    }

    if (!project.isTeamInProject(teamId)){
        response["msg"] = "Sorry, it seams the team received does not belong to the project.";
        res.status(400).send(response);
        return;    
    }

    // ======== GETTING SPRINTS ============
    let sprint = await SprintCollection.findOne({projectId, _id: sprintId}).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(sprint) || _.isNull(sprint)){
        response["msg"] = "Sorry, There was a problem getting the sprints for the team selected.";
        res.status(400).send(response);
        return; 
    }

    // ======== GETTING WORK ITEMS FOR SPRINT ============

    // get sprint work items
    let workItems = await WorkItemCollection.find({projectId, _id: {$in: sprint["tasks"]}}).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(workItems)){
        response["msg"] = "Sorry, There was a problem getting the work items for the sprint.";
        response["sprints"] = [];
        res.status(200).send(response);
        return;
    }

    let startDate = sprint["startDate"];
    let endDate = sprint["endDate"];
    let numberOfDays  = getNumberOfDays(startDate, endDate);
    let sprintStatus = getSprintDateStatus(startDate, endDate);
    let isActiveSprint = (sprint["status"] === SPRINT_STATUS["Active"]);


    let statusReport = {
        totalPoints: getPointsForStatus(workItems, null),
        completedPoints: getPointsForStatus(workItems, WORK_ITEM_STATUS["Completed"]),
        incompletedPoints: getPointsForStatus(workItems, WORK_ITEM_STATUS["Completed"], true),

        numberOfWorkItems: workItems.length, 
        numberOfWorkItemsCompleted: getNumberOfElements(workItems, WORK_ITEM_STATUS["Completed"]),
        numberOfWorkItemsIncompleted: getNumberOfElements(workItems, WORK_ITEM_STATUS["Completed"], true),
        
        capacity: sprint["capacity"],
        numberOfDays: numberOfDays,
        startDate: startDate,
        endDate: endDate,
        initalSprintPoints: sprint["initialPoints"],
        pointsHistory: sprint["pointsHistory"],

        isActiveSprint: isActiveSprint,
        isFutureSprint: (sprintStatus === SPRINT_STATUS["Coming"] || (sprintStatus === SPRINT_STATUS["Active"] && !isActiveSprint))
    }

    // response for user
    response["msg"] = "success";
    response["workItems"] = workItems;
    response["statusReport"] = statusReport;

    res.status(200).send(response);
    return;

});


/**
 * METHOD: GET - fetch all sprints for a team
 */
router.get("/api/:id/getTeamSprints/:teamId", middleware.isUserInProject, async function (req, res) {
    console.log("Getting request to get sprints for a team...");

    const projectId = req.params.id;
    const teamId = req.params.teamId;

    let response = {projectId, teamId};
    // is a string
    if (_.isString(projectId) && _.isString(teamId)){

        let project = await ProjectCollection.findById(projectId).catch(err => {
            console.error(err);
        });

        if (_.isUndefined(project)){
            response["msg"] = "Oops, There was a problem getting the project information.";
            res.status(400).send(response);
            return;
        }

        // check if the team is part of the project
        if (!project.isTeamInProject(teamId)){
            response["msg"] = "Sorry, It looks like this team does not belong to the project.";
            res.status(400).send(response);
            return;
        }

        let sprints = await SprintCollection.getSprintsForTeam(projectId, teamId, true).catch(err => {
            console.error(err);
        });

        // check sprint
        if (_.isUndefined(sprints)){
            response["msg"] = "Sorry, There was a problem getting the sprints";
            res.status(400).send(response);
            return;
        }

        let activeSprint = SprintCollection.getActiveSprint(sprints);
        let activeSprintId = undefined;
        if (!_.isNull(activeSprint) || !_.isUndefined(activeSprint)){
            activeSprintId = activeSprint["_id"];
        }

        sprints = sortByDate(sprints, "startDate");
        sprints.unshift(UNASSIGNED_SPRINT);

        // send response to user
        response["msg"] = "Success";
        response["sprints"] = sprints;
        response["activeSprintId"] = activeSprintId;
        res.status(200).send(response);
        return;
    }else{
        response["msg"] = "Oops, it looks like this is an invalid team.";
        res.status(400).send(response);
        return;
    }
});


/**
 * METHOD: POST - create sprint
 */
router.post("/api/:id/createSprint", middleware.isUserInProject, async function (req, res) {

    let projectId = req.params.id;

    // validate project
    let project = await ProjectCollection.findById(projectId).catch(err => {
        console.error("Error getting the project: ", err);
    });

    if (_.isUndefined(project) || _.isEmpty(project)){
        res.status(500).send("Error getting the project information. Please refresh the page and try again.");
        return;
    }

    // Getting data from user
    let {
        name,
        startDate,
        endDate,
        teamId,
    } = req.body;

    // premade response for user
    let response = {"teamId": teamId, "startDate":startDate, "endDate": endDate};
    let error_message = null;

    // validate name
    if (!_.isString(name) || _.isEmpty(name.trim())){
        response["msg"] = "Invalid name for sprint was received.";
        res.status(400).send(response);
        return;
    }

    // cleaning the name
    name = name.trim();

    // validating start and end date of the sprint
    let momentStartDate = moment(startDate, SPRINT_FORMAT_DATE )
    let momentEndDate = moment(endDate, SPRINT_FORMAT_DATE )

    // first verify that team Name is string || not undefined or null
    if (!_.isString(startDate) || !_.isString(endDate)  || !momentStartDate.isValid() || !momentEndDate.isValid()) {
        response["msg"] = "Invalid dates for sprint were received.";
        res.status(400).send(response);
        return;
    }

    // validate is team was received
    if (_.isUndefined(teamId) || _.isEmpty(teamId)){
        response["msg"] = "Invalid Team was received for the sprint";
        res.status(400).send(response);
        return;
    }

    // if verify if the team is part of the project
    let addSprintToAllTeams = (teamId == ADD_SPRINT_TO_ALL_TEAM_ID);
    if (!addSprintToAllTeams && !project.isTeamInProject(teamId)){
        response["msg"] = "The team received does not belong to this project.";
        res.status(400).send(response);
        return;
    }

    let sprintStatus = getSprintDateStatus(startDate, endDate);

    // since we're creating a new sprint, They may be another sprint with the status active already
    // So this sprint status will be coming, and the user needs to change it to active in case he wants to. 
    sprintStatus = (sprintStatus == SPRINT_STATUS["Active"]) ? SPRINT_STATUS["Coming"] : sprintStatus;

    // sprint data - team Id is added below
    let sprintData = {
        "name": name,
        "projectId": projectId,
        "startDate": startDate,
        "teamId": teamId,
        "endDate": endDate,
        "status":  sprintStatus
    };

    if (addSprintToAllTeams){
        let teamWasSkyped = false;
        let sprints = [];
        for (let i = 0; i < project.teams.length; i++) {
            const projectTeamId = project.teams[i]._id;
            
            // adding sprint to the team
            sprintData["teamId"] = projectTeamId;

            // get all sprint by the team
            let errorMsg = null;
            let teamSprints = await SprintCollection.getSprintsForTeam(projectId, projectTeamId).catch(err => {
                console.error(err);
                errorMsg = err;
            });

            // check sprint
            if (_.isUndefined(teamSprints) || errorMsg){
                response["msg"] = "Sorry, There was a problem getting the sprints for this team.";
                res.status(400).send(response);
                return;
            }
    
            if (!_.isEmpty(teamSprints) && !SprintCollection.isValidSprintDate(teamSprints, startDate, endDate)){
                teamWasSkyped = true;
                // response["msg"] = "Sorry, A team cannot have more than one sprint at the same time.";
                // res.status(400).send(response);
                // return;
                continue;
            }
            
            let newSprint = await SprintCollection.create(sprintData).catch(err => {
                error_message = err;
                console.error(err);
            });
            

            if (_.isUndefined(newSprint) || error_message){
                response["msg"] = "Sorry, There was a problem creating the Sprints for the teams";
                res.status(400).send(response);
                return;
            }

            //  ===== create order for sprint =====
            await OrderSprintCollection.create({sprintId: newSprint["_id"], projectId}).catch(err => {
                console.error("Error creating the order for the sprint: ", err);
            });
            // ====================================

            newSprint = newSprint.toObject();

            // formatting sprint dates
            newSprint["startDateFormated"] = moment(newSprint["startDate"], SPRINT_FORMAT_DATE).format("MMM Do");
            newSprint["endDateFormated"] = moment(newSprint["endDate"], SPRINT_FORMAT_DATE).format("MMM Do");

            sprints.push(newSprint);
        }

        if (teamWasSkyped){
            response["msg"] = "Some of the sprints were not created because some of the teams already have a sprint with the dates selected.";
        }else{
            response["msg"] = "Sprints were created succesfully!";
        }

        response["sprint"] = sprints;
        response["multiple"] = true; // added more than one sprint

    }else{

        let errorMsg = null;
        let teamSprints = await SprintCollection.getSprintsForTeam(projectId, teamId).catch(err => {
            console.error(err);
            errorMsg = err;
        });

        if (_.isUndefined(teamSprints) || errorMsg){
            response["msg"] = "Sorry, There was a problem getting the sprints for this team.";
            res.status(400).send(response);
            return;
        }


        if (!_.isEmpty(teamSprints) && !SprintCollection.isValidSprintDate(teamSprints, startDate, endDate)){
            response["msg"] = "Sorry, A team cannot have more than one sprint at the same time.";
            res.status(400).send(response);
            return;
        }

        let newSprint = await SprintCollection.create(sprintData).catch(err => {
            error_message = err;
            console.error(err);
        });

        // validate new Sprint
        if (_.isUndefined(newSprint) || error_message){
            response["msg"] = "Sorry, There was a problem creating the Sprints for the teams";
            res.status(400).send(response);
            return;
        }

        //  ===== create order for sprint =====
        await OrderSprintCollection.create({sprintId: newSprint["_id"], projectId}).catch(err => {
            console.error("Error creating the order for the sprint: ", err);
        });
        // ====================================


        newSprint = newSprint.toObject();

        // formatting sprint dates
        newSprint["startDateFormated"] = moment(newSprint["startDate"], SPRINT_FORMAT_DATE).format("MMM Do");
        newSprint["endDateFormated"] = moment(newSprint["endDate"], SPRINT_FORMAT_DATE).format("MMM Do");
        
        response["sprint"] = newSprint;
        response["multiple"] = false; // just one sprint was added
        response["msg"] = "Sprint was created!";
    }

    res.status(200).send(response);
});


/**
 * METHOD: POST - REMOVE SPRINT FROM A TEAM
 */
router.post("/api/:id/removeSprintForTeam/:teamId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to remove sprint from team...");
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;
    
    let  { sprintId } = req.body; // request data
    let response = {"sprintId": sprintId};

    // check sprint ID
    if (_.isUndefined(sprintId)){
        response["msg"] = "Invalid Sprint was received";
        res.status(400).send(response);
        return;
    }

    const project = await ProjectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    // validate project
    if (_.isUndefined(project)){
        response["msg"] = "Sorry, There was a problem getting the project information.";
        res.status(400).send(response);
        return;
    }

    // valdiate the team is valid
    if (!project.isTeamInProject(teamId)){
        response["msg"] = "Oops, The team received is not part of the project.";
        res.status(400).send(response);
        return;   
    }

    let err_response = null;
    let sprintRemoved = await SprintCollection.findByIdAndDelete(sprintId).catch(err => {
        console.error(err);
        err_response = err;
    })

    if (err_response || _.isUndefined(sprintRemoved)){
        response["msg"] = "Sorry, There was a problem removing the sprint from the team";
        res.status(400).send(response);
        return;
    }

    //  ===== create order for sprint =====
    await OrderSprintCollection.findOneAndDelete({sprintId: sprintId, projectId}).catch(err => {
        console.error("Error deleting the order for the sprint: ", err);
    });
    // ====================================

    response["msg"] = "Sprint was removed successfully.";
    res.status(200).send(response);
});


/**
 * METHOD: POST - REMOVE SPRINT FROM PROJECT
 */
router.post("/api/:id/deleteSprintsFromProject", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to remove sprint from project...");

    const projectId = req.params.id;
    
    let  { sprintsIds } = req.body; 
    
    let response = {sprintsIds: sprintsIds};

    // empty, or not array, or not all elements in array are string
    if (_.isEmpty(sprintsIds) || !_.isArray(sprintsIds) || !sprintsIds.every( each => _.isString(each))){
        response["msg"] = "Sorry, Invalid sprints were received.";
        res.status(400).send(response);
        return;
    }

    let removedSprint = await SprintCollection.deleteMany({projectId: projectId, _id: {$in: sprintsIds}}).catch(err => {
        console.error(err);
    });
    
    if (_.isUndefined(removedSprint) || _.isNull(removedSprint)){
        response["msg"] = "Sorry, There was an error removing the sprints.";
        res.status(400).send(response);
        return;  
    }

    response["msg"] =  (sprintsIds.length > 0 ) ?  "Sprints were removed." : "Sprint was removed.";
    res.status(200).send(response);
});


/**
 * METHOD: POST - UPDATE SPRINT FOR TEAM
 */
// TODO: refactor this. instead of doing the query to update, uses the same sprint mongoose element
router.post("/api/:id/updateSprint/:teamId/:sprintId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to update sprint...");
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;
    const sprintId = req.params.sprintId;

    let response = {};

    // expected data
    let  { name, startDate, endDate, capacity } = req.body;
    let updateData = {};

    // getting the current sprint
    let sprint = await SprintCollection.findById(sprintId).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(sprint) || _.isNull(sprint)){
        response["msg"] = "Sorry, Cannot find the sprint selected.";
        res.status(400).send(response);
        return;
    }

    // ========= VERIFY DATA RECEIVED ============
    // if the name is received
    if (!_.isUndefined(name)){

        if (_.isString(name) && !_.isEmpty(name)){
            updateData["name"] = name;
        }else{
            response["msg"] = "Sorry, Invalid name for the sprint was received.";
            res.status(400).send(response);
            return;
        }
    }

    // if capacity is received
    if (!_.isUndefined(capacity) && !_.isEmpty(capacity) && !isNaN(capacity)){
        updateData["capacity"] = parseInt(capacity.trim());
    }

    // to store the date with the udated values
    let currentStartDate = undefined;
    let currentEndDate = undefined;

    // if startDate is received
    if (!_.isUndefined(startDate)){
        if (_.isString(startDate) && moment(startDate, SPRINT_FORMAT_DATE).isValid()){
            updateData["startDate"] = startDate;
            currentStartDate = startDate;
        }else{
            response["msg"] = "Sorry, Invalid start date for the sprint was received.";
            res.status(400).send(response);
            return;
        }
    }else{
        currentStartDate = sprint["startDate"];
    }

    // if endDate is received
    if (!_.isUndefined(endDate)){
        if (_.isString(endDate) && moment(endDate, SPRINT_FORMAT_DATE).isValid()){
            updateData["endDate"] = endDate;
            currentEndDate = endDate;
        }else{
            response["msg"] = "Sorry, Invalid end date for the sprint was received.";
            res.status(400).send(response);
            return;
        }
    }else{
        currentEndDate = sprint["endDate"];
    }
    
    if (_.isEmpty(updateData)){
        response["msg"] = "Sorry, There is not information to update the sprint";
        res.status(400).send(response);
        return;
    }

    // =============== Verify the date of the sprint is valid ===========
    if ( updateData["startDate"] || updateData["endDate"]){

        let errorMsg = null;
        let teamSprints = await SprintCollection.getSprintsForTeam(projectId, teamId).catch(err => {
            console.error(err);
            errorMsg = err;
        });

        if (_.isUndefined(teamSprints) || errorMsg){
            response["msg"] = "Sorry, There was a problem getting the sprints for this team.";
            res.status(400).send(response);
            return;
        }

        teamSprints = teamSprints.filter(each => { return each["_id"] != sprintId});

        if (!_.isEmpty(teamSprints) && !SprintCollection.isValidSprintDate(teamSprints, currentStartDate, currentEndDate)){
            response["msg"] = "Sorry, A team cannot have more than one sprint at the same time.";
            res.status(400).send(response);
            return;
        }
    }
    // ==================================================================

    // updating work item from sprints
    let updatedSprint = await SprintCollection.findOneAndUpdate({_id: sprintId}, updateData, {new:true}).catch(err => {
        console.error(err);
    });

    if (_.isUndefined(updatedSprint) || _.isNull(updatedSprint)){
        response["msg"] = "Sorry, There was an error updating the sprint information. Please try later.";
        res.status(400).send(response);
        return;
    }

    const sprintHaveOrder = await updatedSprint.haveOrderSchema();
    
    if (!sprintHaveOrder){
        console.log("Adding order schema to sprint");
        //  ===== create order for sprint =====
        await OrderSprintCollection.create({sprintId: sprintId, projectId}).catch(err => {
            console.error("Error creating the order for the sprint: ", err);
        });
        // ====================================
    }

    updatedSprint = updatedSprint.toObject();
    updatedSprint["startDateFormated"] = moment(updatedSprint["startDate"], SPRINT_FORMAT_DATE).format("MMM Do");
    updatedSprint["endDateFormated"] = moment(updatedSprint["endDate"], SPRINT_FORMAT_DATE).format("MMM Do");


    response["msg"] = "success";
    response["sprint"] = updatedSprint;

    console.log("Success updated sprint");
    res.status(200).send(response);
});

/**
 * METHOD: POST - CLOSE SPRINT AND ACTIVE A NEW SPRINT
 */
router.post("/api/:id/closeSprint", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to close sprint...");
    
    const projectId = req.params.id;

    // expected data
    let { closingSprint, activeSprint, sprintCapacity } = req.body;
    let response = {};

    // check data received
    if (!_.isString(closingSprint) || !_.isString(activeSprint) || _.isEmpty(sprintCapacity) || isNaN(sprintCapacity)){
        response["msg"] = "Invalid data was received.";
        res.status(400).send(response);
        return;
    }

    // get closing sprint
    let sprintToBeClose = await SprintCollection.findOne({projectId, _id: closingSprint}).catch(err =>{
        console.error("Error getting closing sprint: ", err);
    });
   
    // check closing sprint has data 
    if (_.isUndefined(sprintToBeClose) || _.isNull(sprintToBeClose)){
        response["msg"] = "Sorry, There was a problem getting the closing sprint information. Please try later.";
        res.status(400).send(response);
        return;
    }

    // getting newActiveSprint
    let sprintToBeActive = await SprintCollection.findOne({projectId, _id: activeSprint}).catch(err =>{
        console.error("Error: ", err);
    });
    if (_.isUndefined(sprintToBeActive) || _.isNull(sprintToBeActive)){
        response["msg"] = "Sorry, there was a problem getting the information of the sprint to be active";
        res.status(400).send(response);
        return;
    }

    // check the closing sprint is the current active sprint
    if (sprintToBeClose["status"] != SPRINT_STATUS["Active"]){
        response["msg"] = "The Sprint you're trying to close is not the current active sprint.";
        res.status(400).send(response);
        return;    
    }

    // update sprint to be close
    sprintToBeClose["status"] = SPRINT_STATUS["Past"];

    // Update new active sprint
    sprintToBeActive["status"] = SPRINT_STATUS["Active"];
    sprintToBeActive["capacity"] = parseInt(sprintCapacity) || 0;

    // inital points are not set yet
    if (sprintToBeActive["initialPoints"] == 0){

        let workItemsForActiveSprint = await sprintToBeActive.getWorkItemsForSprint().catch(err => {
            console.error("Error getting work items for sprint to be active");
        }) || [];

        let amountOfPoints = getPointsForStatus(workItemsForActiveSprint);

        // set initial points for the sprint
        sprintToBeActive["initialPoints"] = amountOfPoints;
    }

    // ========== Moving incompleted work items to backlog ================

    // getting incompleted work items for the closing sprint
    let incompletedWorkItems = await sprintToBeClose.getIncompletedWorkItems().catch(err => {
        console.error("Error getting incompleted work items: ", err);
    }) || [];

    // remove from sprint the imcompleted work items
    for (let workItem of incompletedWorkItems){
        sprintToBeClose["tasks"].pull(workItem["_id"]);
    }
    // ===================================================================

    // save data into the database
    sprintToBeClose.save().then( async () => {
        console.log("A sprint was closed.");

        let error_saving_active_sprint = null;
        // save active sprint
        await sprintToBeActive.save().catch(err => {
           console.error("Error saving new active sprint: ", err); 
           error_saving_active_sprint = err;
        });

        if (error_saving_active_sprint){
            response["msg"] = "Sorry, The current sprint was closed, but there was a problem activating the new sprint.";
            res.status(400).send(response);
            return;
        }

        let sprintToBeActiveStartDate = moment(sprintToBeActive["startDate"], SPRINT_FORMAT_DATE);
        let sprintToBeCloseStartDate = moment(sprintToBeClose["startDate"], SPRINT_FORMAT_DATE);

        // save boolean just to know if the active sprint button should be active
        response["isFutureSprint"] = sprintToBeActiveStartDate.isSameOrBefore(sprintToBeCloseStartDate);

        response["msg"] = "Sprint was closed successfully!";
        res.status(200).send(response);
    }).catch(err => {
        console.error("Error saving updating the sprint to be close: ", err);
        response["msg"] = "Oops, there was a problem closing the sprint. Try later.";
        res.status(400).send(response);
        return;
    });
});

/**
 * METHOD: POST - START SPRINT
 */
 router.post("/api/:id/startSprint/:teamId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to start sprint...");
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;

    // expected data
    let { sprint, capacity} = req.body;
    let response = {};

    // check data received
    if (!_.isString(sprint) || _.isEmpty(capacity) || isNaN(capacity)){
        response["msg"] = "Invalid data was received.";
        res.status(400).send(response);
        return;
    }

    // update all sprint status for this project and team that are active
    let error_update_sprints = null;
    await SprintCollection.updateMany(
        {projectId, teamId, status: SPRINT_STATUS["Active"]},
        {$set: {status: SPRINT_STATUS["Past"]}}
    ).catch(err =>{
        error_update_sprints = err;
        console.error("Error updating status for others sprint: ", err);
    });

    // check query was successfull
    if (error_update_sprints){
        response["msg"] = "Sorry, There was a problem updating the status of the current active sprint.";
        res.status(400).send(response);
        return;
    }


    // updating new sprint to be active
    let error_update_new_active_sprint = null;
    await SprintCollection.updateOne(
        {projectId, teamId, _id: sprint},
        {$set: {status: SPRINT_STATUS["Active"], capacity: capacity}}
    ).catch(err =>{
        error_update_new_active_sprint = err;
        console.error("Error updating status for new active sprint: ", err);
    });

    // check query was successfull
    if (error_update_new_active_sprint){
        response["msg"] = "Sorry, There was a problem updating the status of the new active sprint.";
        res.status(400).send(response);
        return;
    }

    response["msg"] = "Sprint was started!";
    res.status(200).send(response);
});
// ================================ END ======================================

module.exports = router;

