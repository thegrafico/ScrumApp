
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const workItemCollection        = require("../../dbSchema/workItem");
const projectCollection         = require("../../dbSchema/projects");
const userCollection            = require("../../dbSchema/user");

const _                         = require("lodash");
let router                      = express.Router();

const {
    TEAM_NAME_LENGHT_MAX_LIMIT,
    TEAM_NAME_LENGHT_MIN_LIMIT,
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


// ================= POST REQUEST ==============

/**
 * METHOD: POST - Create new work item
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

    let error_message = null;

    // first verify that team Name is string || not undefined or null
    if (!_.isString(teamName)) {
        res.status(400).send("The name of the team is undefined.");
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
        res.status(400).send(error_message);
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
        res.status(400).send("A team with the same name already exist. (Case sensitive is ignored).");
        return;
    }
    
    // TODO: update users when functionality is completed. For now is just empty string
    project.teams.push({"name": teamName, users: []}); 

    await project.save().catch(err => {
        error_message = err;
        console.log("Error adding the team to the project: ", err);
    });

    if (error_message){
        res.status(500).send(`Error adding the team to the project: ${error_message}`);
        return;
    }
    
    res.status(200).send("Successfully added team to the project");
});


/**
 * METHOD: POST - REMOVE TEAM
 */
router.post("/api/:id/deleteTeam", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;

    const {teamId} = req.body;

    // is a string
    if (_.isString(projectId) && _.isString(teamId)){
    
        // Add the comment to the DB
        const result = await projectCollection.findByIdAndUpdate(projectId, {$pull: {"teams": {"_id":teamId}}}).catch(
            err => console.error("Error getting work items: ", err)
        );

        if (!result){
            res.status(400).send("Sorry, There was a problem removing the team. Please try later.");
            return;
        }

        res.status(200).send("Team removed successfully!");
        return;
    }else{
        res.status(400).send("Oops, it looks like this is an invalid team.");
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

    if (!_.isString(teamId) || _.isUndefined(userIds) || !_.isArray(userIds) || _.isEmpty(userIds)){
        res.status(400).send("Sorry, there was an error with the request. Either cannot find the team or users to remove. ");
        return;
    }

    // Add the comment to the DB
    const projectInfo = await projectCollection.findById(projectId).catch(
        err => console.error("Error removing work items: ", err)
    );

    if (!projectInfo){
        res.status(400).send("Sorry, There was a problem finding the project information. Please try later.");
        return;
    }

    let team = projectInfo.teams.filter( each => {
        return each._id == teamId;
    })[0];

    // get the number of user before the filter
    const numberOfUsers = team.users.length;

    if (_.isUndefined(team) || _.isEmpty(team)){
        res.status(400).send("Sorry, cannot find the team information. Please try later");
        return;
    }

    // removing user from list
    team.users = team.users.filter(uId => {return !userIds.includes(uId.toString())});

    // check after filter
    if (numberOfUsers == team.users.length){
        res.status(400).send("Oops, There was a problem removing the user from the team.");
        return;
    }
    let response = await projectInfo.save().catch(err => {
        console.error(err);
    });

    if (!response){
        res.status(400).send("Oops, There was a problem saving the request");
        return;
    }

    let item_str = userIds.length === 1 ? "user" : "users";
    res.status(200).send(`Successfully removed ${item_str} from team`);
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

    if (!_.isString(userEmail) || _.isEmpty(userEmail)){
        res.status(400).send("Invalid user was received.");
        return;
    }

    // const userWasAdded = await projectCollection.findByIdAndUpdate(projectId, {$push: {users: userId}})

    // getting project
    const projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    // verify project
    if (!projectInfo){
        res.status(400).send("Oops, There was a getting the user information.");
        return;
    }

    // getting user information
    const userInfo = await userCollection.getUserByEmail(userEmail).catch(err => {
        console.error(err);
    });

    // verify if data is good
    if (_.isUndefined(userInfo) || _.isNull(userInfo)){
        res.status(400).send("Sorry, There was a problem getting user information");
        return;
    }

    // verify if the user is already in the project
    let isUserInProject = projectInfo.isUserInProject(userInfo._id.toString());

    let response = {
        msg: "Successfully added user to the project", 
        user: {
            fullName: userInfo["fullName"],
            email: userInfo["email"],
            id: userInfo["_id"]
        }
    };

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
        res.status(400).send("Sorry, there was a problem adding the user to the project.");
        return;
    }

    res.status(200).send(response);
});

/**
 * METHOD: POST - REMOVE USERS FROM PROJECT
 */
 router.post("/api/:id/deleteUser", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to remove user from project...");

    const projectId = req.params.id;
    
    let  { userId } = req.body; 

    if (!_.isString(userId) || _.isEmpty(userId)){
        res.status(400).send("Invalid user was received.");
        return;
    }

    // getting project
    const projectInfo = await projectCollection.findById(projectId).catch(err => {
        console.error(err);
    });

    // verify project
    if (!projectInfo){
        res.status(400).send("Oops, There was a getting the user information.");
        return;
    }

    // prevent owner removing himself.
    if (userId.toString() == projectInfo["author"].toString()){
        res.status(400).send("Sorry, The owner of the team cannot be removed from the team.");
        return;
    }

    let response_error = null;
    let response = await projectInfo.removeUser(userId).catch(err => {
        response_error = err;
    });

    if (_.isUndefined(response)){
        res.status(400).send(response_error);
    }

    res.status(200).send(response);
});

module.exports = router;