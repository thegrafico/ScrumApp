
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const workItemCollection        = require("../../dbSchema/workItem");
const projectCollection         = require("../../dbSchema/projects");
const userCollection            = require("../../dbSchema/user");
const SprintCollection          = require("../../dbSchema/sprint");
const moment                    = require("moment");
const _                         = require("lodash");
let router                      = express.Router();

const {
    TEAM_NAME_LENGHT_MAX_LIMIT,
    TEAM_NAME_LENGHT_MIN_LIMIT,
    SPRINT_FORMAT_DATE,
    ADD_SPRINT_TO_ALL_TEAM_ID,
    SPRINT_STATUS,
    UNASSIGNED,
    MAX_LENGTH_TITLE,
    MAX_LENGTH_DESCRIPTION,
    MAX_PRIORITY_POINTS,
    MAX_STORY_POINTS,
    EMPTY_SPRINT,
    WORK_ITEM_STATUS,
    WORK_ITEM_ICONS,
    capitalize
} = require('../../dbSchema/Constanst');

// ================= GET REQUEST ==============

/**
 * METHOD: GET - fetch all users from project
 */
router.get("/api/:id/getProjectUsers/", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;

    // getting project
    const projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.error(err);
    });
    
    // verify project
    if (!projectInfo){
        res.status(400).send("Sorry, Cannot get the information of the project.");
        return;
    }

    const users = projectInfo.getUsers();

    let response = {
        msg: "success",
        users: users
    }

    res.status(200).send(response);
});


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
router.get("/api/:id/getTeamUsers/:teamId", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;

    // is a string
    if (_.isString(projectId) && _.isString(teamId)){
    
        // Add the comment to the DB
        const project = await projectCollection.findById(projectId).catch(err => {
            console.error("Error getting the project: ", err);
        });

        if (!project){
            res.status(400).send("Sorry, There was a problem getting Project information. Please try later.");
            return;
        }

        let users = await project.getUsersForTeam(teamId).catch(err => {
            console.error("Error getting the users from project: ", err);
        });

        if (_.isUndefined(users)){
            res.status(400).send("Oops, There was a problem getting the users from the project.");
            return;
        }


        // just sent the needed information to the frontend
        users = users.map( function (each) {
            return {"fullName": each["fullName"], "email": each["email"], "id": each["_id"]};
        });

        res.status(200).send({msg: "Success", users: users});
        return;
    }else{
        res.status(400).send("Oops, it looks like this is an invalid team.");
        return;
    }
});

/**
 * METHOD: GET - fetch all sprints for a team
 */
 router.get("/api/:id/getTeamSprints/:teamId", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;
    const teamId = req.params.teamId;

    let response = {projectId, teamId};
    // is a string
    if (_.isString(projectId) && _.isString(teamId)){

        let project = await projectCollection.findById(projectId).catch(err => {
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

        let sprints = await SprintCollection.getSprintsForTeam(teamId).catch(err => {
            console.error(err);
        });

        // check sprint
        if (_.isUndefined(sprints)){
            response["msg"] = "Sorry, There was a problem getting the sprints";
            res.status(400).send(response);
            return;
        }
        // send response to user
        response["msg"] = "Success";
        response["sprints"] = sprints;
        res.status(200).send(response);
        return;
    }else{
        res.status(400).send("Oops, it looks like this is an invalid team.");
        return;
    }
});


// ================= POST REQUEST ==============

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
 * METHOD: POST - Create SPRINT
 */
router.post("/api/:id/createSprint", middleware.isUserInProject, async function (req, res) {

    let projectId = req.params.id;

    // validate project
    let project = await projectCollection.findById(projectId).catch(err => {
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

    const today = moment(new Date());
    let sprintStatus = ""; // default?
    if (today.isAfter(momentEndDate)){
        sprintStatus = SPRINT_STATUS["Past"];
    }else if(today.isBefore(momentStartDate)){
        sprintStatus = SPRINT_STATUS["Coming"];
    }else if(today.isBetween(momentStartDate, momentEndDate)){
        sprintStatus = SPRINT_STATUS["Active"];
    }

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
            let teamSprints = await SprintCollection.getSprintsForTeam(projectTeamId).catch(err => {
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
        let teamSprints = await SprintCollection.getSprintsForTeam(teamId).catch(err => {
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

    const project = await projectCollection.findById(projectId).catch(err => {
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

    response["msg"] = "Sprint was removed successfully.";
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

    // is a string
    if (workItemsId && workItemsId.length > 0){
    
        // Add the comment to the DB
        const result = await workItemCollection.deleteMany({projectId: projectId, _id: workItemsId}).catch(
            err => console.error("Error removing work items: ", err)
        );

        if (!result){
            res.status(400).send("Sorry, There was a problem removing work items. Please try later.");
            return;
        }
    }else{
        res.status(400).send("Sorry, We cannot find any work item to remove. Please try later.");
        return;
    }
    let item_str = workItemsId.length === 1 ? "item" : "items";
    res.status(200).send(`Successfully removed work ${item_str}`);
});


/**
 * METHOD: POST - REMOVE USERS FROM TEAM
 */
router.post("/api/:id/removeUsersFromTeam", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to remove work items...");
    
    const projectId = req.params.id;
    
    let  { teamId, userIds } = req.body; // expected array
    let response = {teamId: teamId, userIds: userIds};
    if (!_.isString(teamId) || _.isUndefined(userIds) || !_.isArray(userIds) || _.isEmpty(userIds)){
        response["msg"] = "Sorry, there was an error with the request. Either cannot find the team or users to remove.";
        res.status(400).send(response);
        return;
    }

    // Add the comment to the DB
    const projectInfo = await projectCollection.findById(projectId).catch(
        err => console.error("Error removing work items: ", err)
    );

    if (!projectInfo){
        response["msg"] = "Sorry, There was a problem finding the project information. Please try later.";
        res.status(400).send(response);
        return;
    }

    let team = projectInfo.teams.filter( each => {
        return each._id == teamId;
    })[0];

    // get the number of user before the filter
    const numberOfUsers = team.users.length;

    if (_.isUndefined(team) || _.isEmpty(team)){
        response["msg"] = "Sorry, cannot find the team information. Please try later"
        res.status(400).send(response);
        return;
    }

    // removing user from list
    team.users = team.users.filter(uId => {return !userIds.includes(uId.toString())});

    // check after filter
    if (numberOfUsers == team.users.length){
        response["msg"] = "Oops, There was a problem removing the user from the team.";
        res.status(400).send(response);
        return;
    }

    let projectWasSaved = await projectInfo.save().catch(err => {
        console.error(err);
    });

    if (!projectWasSaved){
        response["msg"] = "Oops, There was a problem saving the request";
        res.status(400).send(response);
        return;
    }

    let item_str = userIds.length === 1 ? "user" : "users";
    response["msg"] = `Successfully removed ${item_str} from team`;
    res.status(200).send(response);
});


/**
 * METHOD: POST - ADD USERS TO TEAM
 */
router.post("/api/:id/addUserToTeam", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to add user to team...");

    const projectId = req.params.id;
    
    let  { teamId, userId } = req.body; 

    if (!_.isString(teamId) || _.isUndefined(userId) || !_.isString(userId) || _.isEmpty(userId)){
        res.status(400).send("Sorry, there was an error with the request. Either cannot find the team or users to remove. ");
        return;
    }

    const projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    if (!projectInfo){
        res.status(400).send("Oops, There was a problem adding the user to the team. Please try later");
        return;
    }

    let team = projectInfo.teams.filter( tm => {return tm._id.toString() == teamId} )[0];
    
    if (team.users.includes(userId)){
        res.status(200).send("User is already in project");
        return;
    }

    // add the user
    team.users.push(userId);

    let projectResponse = await projectInfo.save().catch( err => {
        console.error(err);
    });

    if (!projectResponse){
        res.status(400).send("Sorry, There was a problem adding the user to the team.");
        return;
    }

    let addedUser = await projectInfo.getUserName(userId).catch(err => {
        console.error("Error getting the user: ", err);
    });


    let response = {msg: "Successfully added user to the team"};

    // send the user in ordet to udate the html table
    if (addedUser){
        response["user"] = {
            fullName: addedUser["fullName"], 
            email: addedUser["email"], 
            id: addedUser["_id"]
        }
    }

    res.status(200).send(response);
});


/**
 * METHOD: POST - ADD USERS TO Project
 */
router.post("/api/:id/addUserToProject", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to add user to team...");

    const projectId = req.params.id;
    
    let  { userEmail } = req.body; 
    let response = { user: null};
    
    if (!_.isString(userEmail) || _.isEmpty(userEmail)){
        response["msg"] = "Invalid user was received.";
        res.status(400).send(response);
        return;
    }

    // getting project
    const projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    // verify project
    if (!projectInfo){
        response["msg"] = "Oops, There was a getting the user information.";
        res.status(400).send(response);
        return;
    }

    // getting user information
    const userInfo = await userCollection.getUserByEmail(userEmail).catch(err => {
        console.error(err);
    });

    // verify if data is good
    if (_.isUndefined(userInfo) || _.isNull(userInfo)){
        response["msg"] = "Sorry, We cannot find that user in our records.";
        res.status(400).send(response);
        return;
    }

    // verify if the user is already in the project
    let isUserInProject = projectInfo.isUserInProject(userInfo._id.toString());

    if  (isUserInProject){
        response["msg"] = "User is already in project!";
        res.status(200).send(response);
        return;
    }

    // adding the user to the project
    projectInfo.users.push(userInfo._id);

    let projectWasSaved = await projectInfo.save().catch( err => {
        console.error(err);
    });

    if (_.isUndefined(projectWasSaved) || _.isNull(projectWasSaved)){
        response["msg"] = "Sorry, there was a problem adding the user to the project.";
        res.status(400).send(response);
        return;
    }

    // adding user to response
    response = {
        msg: "User was added to the project!",
        user: {
            fullName: userInfo["fullName"],
            email: userInfo["email"],
            id: userInfo["_id"]
        }
    };

    res.status(200).send(response);
});


/**
 * METHOD: POST - REMOVE A USER FROM PROJECT
 */
router.post("/api/:id/deleteUserFromProject", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to remove user from project...");

    const projectId = req.params.id;
    
    let  { userId } = req.body; 
    
    let response = {userId: userId}

    if (!_.isString(userId) || _.isEmpty(userId)){
        response["msg"] = "Invalid user was received.";
        res.status(400).send(response);
        return;
    }

    // getting project
    const projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    // verify project
    if (!projectInfo){
        response["msg"] = "Oops, There was a problem getting the user information.";
        res.status(400).send(response);
        return;
    }

    // prevent owner removing himself.
    if (userId.toString() == projectInfo["author"].toString()){
        response["msg"] = "Sorry, The owner of the team cannot be removed from the team."
        res.status(400).send(response);
        return;
    }

    let response_error = null;
    response = await projectInfo.removeUser(userId).catch(err => {
        response_error = err;
    });

    if (_.isUndefined(response)){
        res.status(400).send(response_error);
    }

    res.status(200).send(response);
});


/**
 * METHOD: POST - REMOVE USERS FROM PROJECT
 */
router.post("/api/:id/deleteUsersFromProject", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to remove user from project...");

    const projectId = req.params.id;
    
    let  { userIds } = req.body; 
    
    let response = {userIds: userIds}

    console.log("Request from user: ", userIds);
    // empty, or not array, or not all elements in array are string
    if (_.isEmpty(userIds) || !_.isArray(userIds) || !userIds.every( each => _.isString(each))){
        response["msg"] = "Sorry, Invalid users were received.";
        res.status(400).send(response);
        return;
    }

    // getting project
    const projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    // verify project
    if (!projectInfo){
        response["msg"] = "Oops, There was problem a getting the user information.";
        res.status(400).send(response);
        return;
    }

    // prevent owner removing himself.
    if (userIds.some(each => each.toString() == projectInfo["author"].toString()) ){
        response["msg"] = "Sorry, The owner of the team cannot be removed from the project."
        res.status(400).send(response);
        return;
    }

    let response_error = null;
    response = await projectInfo.removeUsers(userIds).catch(err => {
        response_error = err;
        console.error(err);
    });

    if (_.isUndefined(response)){
        res.status(400).send(response_error);
    }

    res.status(200).send(response);
});

module.exports = router;