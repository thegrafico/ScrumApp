
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const workItemCollection        = require("../../dbSchema/workItem");
const projectCollection         = require("../../dbSchema/projects");
const SprintCollection          = require("../../dbSchema/sprint");
const moment                    = require("moment");
const _                         = require("lodash");
let router                      = express.Router();

const {
    TEAM_NAME_LENGHT_MAX_LIMIT,
    TEAM_NAME_LENGHT_MIN_LIMIT,
    UNASSIGNED_SPRINT,
    joinData,
    sortByDate,
} = require('../../dbSchema/Constanst');

// ================= GET REQUEST ==============

/**
 * METHOD: GET - fetch all work items for a team
 */
router.get("/api/:id/getworkItemsByTeamId/:teamId", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;

    // is a string
    if (_.isString(projectId) && _.isString(teamId)){
    
        // Add the comment to the DB
        const result = await workItemCollection.find({"projectId": projectId, "teamId": teamId}).catch(
            err => console.error("Error getting work items: ", err)
        );

        if (!result){
            res.status(400).send("Sorry, There was a problem getting work items. Please try later.");
            return;
        }
        res.status(200).send(result);
        return;
    }else{
        res.status(400).send("Oops, it looks like this is an invalid team.");
        return;
    }
});

/**
 * METHOD: GET - fetch all work items for a team
 */
router.get("/api/:id/getworkItemsAndSprintsByTeam/:teamId", middleware.isUserInProject, async function (req, res) {
    

    const projectId = req.params.id;
    const teamId = req.params.teamId;
    let response = {teamId};

    // is a string
    if (_.isString(projectId) && _.isString(teamId)){
    
        // Add the comment to the DB
        // THIS IS NOT A MONGOOSE OBJECT - lean()
        const workItems = await workItemCollection.find({"projectId": projectId, "teamId": teamId}).lean().catch(
            err => console.error("Error getting work items: ", err)
        );

        if (_.isUndefined(workItems) || _.isNull(workItems)){
            response["msg"] = "Sorry, There was a problem getting work items. Please try later.";
            res.status(400).send(response);
            return;
        }

        // getting sprints
        let sprints = await SprintCollection.getSprintsForTeam(projectId, teamId).catch(err => {
            console.error(err);
        });

        if (_.isUndefined(sprints) || _.isNull(sprints)){
            response["msg"] = "Sorry, There was a problem getting sprints for the team. Please try later.";
            res.status(400).send(response);
            return;
        }

        joinData(workItems, sprints, "_id", "is in", "tasks", "sprint", UNASSIGNED_SPRINT);

        // sorting sprint
        sprints = sortByDate(sprints, "startDate");

        let activeSprint = SprintCollection.getActiveSprint(sprints);

        sprints.unshift(UNASSIGNED_SPRINT);
        response["msg"] = "Success.";
        response["workItems"] = workItems;
        response["sprints"] = sprints;
        response["activeSprint"] = activeSprint["_id"] || "";

        res.status(200).send(response);
        return;
    }else{
        response["msg"] = "Invalid team was received.";
        res.status(400).send(response);
        return;
    }
});


// =========================== TEAM REQUEST =====================

/**
 * METHOD: POST - Create team
 */
router.post("/api/:id/newTeam", middleware.isUserInProject, async function (req, res) {

    // validate project
    let project = await projectCollection.findById(req.params.id).catch(err => {
        console.error("Error getting the project: ", err);
    });

    if (_.isUndefined(project) || _.isEmpty(project)){
        res.status(500).send("Error getting the project information. Please refresh the page and try again.");
        return;
    }

    // Getting data from user
    let {
        teamName,
        teamUsers,
    } = req.body;

    let response = {team: null};
    let error_message = null;

    // first verify that team Name is string || not undefined or null
    if (!_.isString(teamName)) {
        response["msg"] = "The name of the team is undefined.";
        res.status(400).send(response);
        return;
    }
    
    // clean the name
    teamName = teamName.trim()

    // Validating team name
    if (_.isEmpty(teamName)){
        error_message = "Team Name cannot be empty.";
    }else if( !(/^[a-zA-Z\s]+$/.test(teamName)) ){
        error_message = "Teman Name cannot include symbols and numbers.";
    }else if(teamName.length < TEAM_NAME_LENGHT_MIN_LIMIT){
        error_message = "Team name to short.";
    }else if(teamName.length > TEAM_NAME_LENGHT_MAX_LIMIT){
        error_message = "Team name is to big.";
    }

    if (error_message){
        response["msg"] = error_message;
        res.status(400).send(response);
        return;
    }

    let nameIsInProject = false;

    for(let i =  0; i < project.teams.length; i ++){
        const pTeam = project.teams[i];

        if (pTeam["name"].toLowerCase() === teamName.toLowerCase()){
            nameIsInProject = true;
            break;
        }
    }

    if (nameIsInProject){
        response["msg"] = "A team with the same name already exist. (Case sensitive is ignored).";
        res.status(400).send(response);
        return;
    }
    
    // TODO: update users when functionality is completed. For now is just empty string
    project.teams.push({"name": teamName, users: []}); 
    
    let team = project.teams.filter( each => { return each["name"] === teamName})[0];
   
    await project.save().catch(err => {
        error_message = err;
        console.log("Error adding the team to the project: ", err);
    });

    if (error_message){
        response["msg"] = `Error adding the team to the project: ${error_message}`;
        res.status(500).send(response);
        return;
    }

    response["msg"] = "Successfully added team to the project.";
    response["team"] = { name: teamName, id: team["_id"]};

    res.status(200).send(response);
});


/**
 * METHOD: POST - REMOVE TEAM
 */
router.post("/api/:id/deleteTeam", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;

    const {teamId} = req.body;

    let response = {"teamId": null};

    // is a string
    if (_.isString(projectId) && _.isString(teamId) && !_.isEmpty(teamId)){
        // Add the comment to the DB
        const projectInfo = await projectCollection.findById(projectId).catch(
            err => console.error("Error getting project information: ", err)
        );

        // validate project
        if (_.isUndefined(projectInfo) || _.isNull(projectInfo)){
            response["msg"] = "Sorry, There was a problem getting the project information. Please try leter.";
            res.status(400).send(response);
            return;
        }

        let err_response = null;
        let teamWasRemovedResponse = await projectInfo.removeTeam(teamId).catch(err =>{
            err_response = err;
        });

        // validate response
        if (!_.isNull(err_response) || _.isUndefined(teamWasRemovedResponse)){
            res.status(400).send(err_response);
            return;
        }

        res.status(200).send(teamWasRemovedResponse);
        return;
    }else{
        response["msg"] = "Oops, it looks like this is an invalid team.";
        res.status(400).send(response);
        return;
    }
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
            const result = await workItemCollection.findOneAndDelete({projectId: projectId, _id: workItemId}).catch(
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


module.exports = router;