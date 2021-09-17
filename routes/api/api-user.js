
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const projectCollection         = require("../../dbSchema/projects");
const userCollection            = require("../../dbSchema/user");
const userPrivilegeCollection   = require("../../dbSchema/userPrivilege");

const moment                    = require("moment");
const _                         = require("lodash");
let router                      = express.Router();

const {USER_PRIVILEGES} = require("../../dbSchema/Constanst");

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

    const users = await projectInfo.getUsers();

    let response = {
        msg: "success",
        users: users
    }

    res.status(200).send(response);
});

/**
 * METHOD: GET - fetch all users for a team
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

// ========================================== POST ==========================================

/**
 * METHOD: POST - ADD USERS TO Project
 */
router.post("/api/:id/addUserToProject", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to add user to project...");

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
    
    // ============================== PRIVILEGE ==============================
    // add privilege to user
    const newUserPrivilege = {
        userId: userInfo["_id"],
        projectId: projectId,
        privilege: USER_PRIVILEGES["MEMBER"] // Default
    } 

    await userPrivilegeCollection.create(newUserPrivilege).catch(err => {
        console.error("Error saving the user privilege: ", err);
    });

    //======================================================================

    // adding user to response
    response = {
        msg: "User was added to the project!",
        user: {
            fullName: userInfo["fullName"],
            email: userInfo["email"],
            privilege: USER_PRIVILEGES["MEMBER"],
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
    
    console.log("Getting request to remove users from project...");

    const projectId = req.params.id;
    
    let  { userIds } = req.body; 
    
    let response = {userIds: userIds}

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
 * METHOD: POST - REMOVE USERS FROM TEAM
 */
router.post("/api/:id/removeUsersFromTeam", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to remove user from team...");
    
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


module.exports = router;
