
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const WorkItemCollection        = require("../../dbSchema/workItem");
const ProjectCollection         = require("../../dbSchema/projects");
const SprintCollection          = require("../../dbSchema/sprint");
const UserCollection            = require("../../dbSchema/user");
const NotificationCollection    = require("../../dbSchema/notification");
const UserPrivilege             = require("../../dbSchema/userPrivilege");
const moment                    = require("moment");
const _                         = require("lodash");
let router                      = express.Router();

const {
    TEAM_NAME_LENGHT_MAX_LIMIT,
    TEAM_NAME_LENGHT_MIN_LIMIT,
    PROJECT_INITIALS_COLORS,
    MAX_LENGTH_DESCRIPTION,
    MAX_LENGTH_TITLE,
    MAX_NUMBER_OF_FAVORITE_PROJECTS,
    UNASSIGNED_SPRINT,
    joinData,
    sortByDate,
    projectStatus,
    containsSymbols,
    setupProjectInitials,
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
        const result = await WorkItemCollection.find({"projectId": projectId, "teamId": teamId}).catch(
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
        const workItems = await WorkItemCollection.find({"projectId": projectId, "teamId": teamId}).lean().catch(
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


/**
 * METHOD: POST - CREATE PROJECT
*/
router.post("/api/createProject", async function (req, res) {
    
    console.log("Getting request to create a project...");
    // project name and description
    let {name, description} = req.body;

    let response = {};

    if (!_.isString(name) || name.length > MAX_LENGTH_TITLE){
        response["msg"] = "Invalid project name";
        res.status(400).send(response);
        return;
    }

    if (containsSymbols(name)){
        response["msg"] = "Project name cannot have symbols";
        res.status(400).send(response);
        return;
    }

    if (_.isString(description) && description.length > MAX_LENGTH_DESCRIPTION){
        response["msg"] = "Project description is too long.";
        res.status(400).send(response);
        return;
    }

    const newProject = {
        "title": name,
        "description": description,
        "author": req.user._id,
        "users": [req.user._id],
    };

    ProjectCollection.create(newProject).then((project) => {
        project = project.toObject();

        if (name.length > 1) {
            project["initials"] = name[0][0].toUpperCase() + name[1][0].toUpperCase();
        } else {
            project["initials"] = name[0][0].toUpperCase();
        }
        project["initialsColors"] = PROJECT_INITIALS_COLORS[0];

        response["project"] = project;
        response["msg"] = "Project created.";
        res.status(200).send(response);
    }).catch(err => {
        console.log("Error creating project: ", err);
        response["msg"] = "Sorry, it seems there was a problem creating the project. Please try later.";
        res.status(400).send(response);
    });
});

/**
 * METHOD: POST - DELETE PROJECT
*/
router.post("/api/deleteProject", async function (req, res) {
    
    console.log("Getting request to delete a project...");
    
    // project name and description
    let {projectId} = req.body;

    let response = {};

    let getting_project_error = null;
    let project = await ProjectCollection.findById(projectId).catch(err =>{
        getting_project_error = err;
        console.error("There was a problem getting the project to be removed: ", err);
    });

    if (getting_project_error){
        response["msg"] = "Sorry, it seems there was a problem finding the project to remove.";
        res.status(400).send(response);
        return;
    }

    if (_.isUndefined(project) || _.isNull(project) || _.isEmpty(project)){
        response["msg"] = "Sorry, we did not find the information of the project";
        res.status(400).send(response);
        return;
    }

    // if the current user login the author of the project
    if (!project.isProjectAuthor(req.user._id) ){
        response["msg"] = "You don't have permission to remove the project";
        res.status(400).send(response);
        return;
    }

    // ================ REMOVING SPRINTS ==============
    let sprintWasRemoved = await SprintCollection.removeSprintsFromProject(projectId).catch(err => {
        console.error("There was a problem removing the sprints from project: ", err);
    });

    if (!sprintWasRemoved){
        response["msg"] = "Sorry, There was a problem removing the sprints for the project. Please try later.";
        res.status(400).send(response);
        return;
    }
    // ================ REMOVING WORK ITEMS ==============
    let workItemWasRemoved = await WorkItemCollection.removeWorkItemsFromProject(projectId).catch(err =>{
        console.error("Error removing work items from project: ", err);
    });

    if (!workItemWasRemoved){
        response["msg"] = "Sorry, There was a problem removing the work items from the project. Please try later.";
        res.status(400).send(response);
        return;
    }

    // ================ REMOVING USER PROJECT PRIVILEGES ==============
    let privilegeWereRemoved = await UserPrivilege.removeProjectPrivilege(projectId).catch(err =>{
        console.error("Error removing privilege from project: ", err);
    });
    
    if (!privilegeWereRemoved){
        response["msg"] = "Sorry, There was a problem removing users from the project. Please try later.";
        res.status(400).send(response);
        return;
    }

    // remove project from favorite projects
    let errorRemovingFromFavorite = null;
    await UserCollection.updateMany(
        {_id: {$in: project["users"]}},
        {$pull: {favoriteProjects: projectId}}
    ).catch(err => {
        errorRemovingFromFavorite = err;
        console.error("Error removing project from favorite: ", err);
    });

    if (errorRemovingFromFavorite){
        response["msg"] = "Sorry, There was a problem removing the project from favorites.";
        res.status(400).send(response);
        return;
    }

    // DELETE NOTIFICATIONS RELATED TO THIS PROJECT
    await NotificationCollection.deleteMany({projectId: projectId}).catch(err => {
        console.error("Error deleting all notifications from a project: ", err);
    }); 

    // ================ REMOVING Project instance ==============
    ProjectCollection.deleteOne({_id: projectId}).then(() => {
        console.log("Project was removed successfully");
        response["msg"] = "Project was removed!";
        response["removedProjectId"] = projectId;
        res.status(200).send(response);
        return;
    }).catch(err =>{
        console.error("There was a problem removing the project: ", err);
        response["msg"] = "Oops, There was a problem removing the project. Please try again.";
        res.status(400).send(response);
    });
});

/**
 * METHOD: POST - UPDATE PROJECT
*/
router.post("/api/updateProject", async function (req, res) {
    
    console.log("Getting request to update a project...");
    // project name and description
    let {projectId, name, description} = req.body;

    let response = {};

    if (!_.isString(name) || name.length > MAX_LENGTH_TITLE){
        response["msg"] = "Invalid project name";
        res.status(400).send(response);
        return;
    }

    if (containsSymbols(name)){
        response["msg"] = "Project name cannot have symbols";
        res.status(400).send(response);
        return;
    }
   
    if (_.isString(description) && description.length > MAX_LENGTH_DESCRIPTION){
        response["msg"] = "Project description is too long.";
        res.status(400).send(response);
        return;
    }

    // update my project 
    ProjectCollection.updateOne(
        {_id: projectId, author: req.user["_id"]}, 
        {$set: {title:name, description:  description}})
    .then( () => {
        console.log("Project updated!");
        response["msg"] = "Project was updated!";
        res.status(200).send(response);
        return;
    }).catch(err => {
        console.log("Error updating project: ", err);
        response["msg"] = "Sorry, it seems there was a problem updating the project. Please try later.";
        res.status(400).send(response);
        return;
    });
});

/**
 * METHOD: POST - UPDATE PROJECT STATUS
*/
router.post("/api/:id/updateProjectStatus", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to update a project status...");
    
    const projectId = req.params.id;

    // get request data
    let { status } = req.body;

    let response = {};

    // check if the status is valid
    if (!_.isString(status) || !projectStatus.includes(status)){
        response["msg"] = "Invalid project status";
        res.status(400).send(response);
        return;
    }

    // update my project 
    ProjectCollection.updateOne(
        {_id: projectId}, 
        {$set: {status: status}})
    .then( () => {
        console.log("Project updated!");
        response["msg"] = "Project was updated!";
        res.status(200).send(response);
        return;
    }).catch(err => {
        console.log("Error updating project: ", err);
        response["msg"] = "Sorry, it seems there was a problem updating the project. Please try later.";
        res.status(400).send(response);
        return;
    });
});

/**
 * METHOD: POST - ADD PROJECT TO FAVORITE
*/
router.post("/api/addProjectToFavorite", async function (req, res) {
    
    console.log("Getting request to add a project to favorite...");
    
    // getting data received
    let { projectId } = req.body;
    const currentUserId = req.user["_id"];

    let response = {};

    // check the user is in the project
    let project = await ProjectCollection.findById(projectId).catch(err =>{
        console.error("Error getting project: ", err);
    });

    // check project
    if (_.isNull(project) || _.isUndefined(project) || !project){
        response["msg"] = "Oops, cannot find the information of the project";
        res.status(400).send(response);
        return;
    }

    let userIsProjectOwner = project["author"].toString() === currentUserId.toString();

    // check if the user DOES NOT has access to this project
    if ( !userIsProjectOwner && !project["users"].includes(currentUserId)){
        response["msg"] = "You don't have permission to add this project to your favorites.";
        res.status(400).send(response);
        return;
    }

    // getting user information 
    let userInfo = await UserCollection.findById(currentUserId).catch(err => {
        console.error("Error getting user info: ", err);
    });

    if (_.isUndefined(userInfo) || _.isNull(userInfo) || !userInfo){
        response["msg"] = "Sorry, there was a problem getting your information. Please try later.";
        res.status(400).send(response);
        return;
    }
    
    // check if the user can not add a favorite project 
    if (userInfo["favoriteProjects"].length > MAX_NUMBER_OF_FAVORITE_PROJECTS - 1){
        response["msg"] = "Sorry, Max number of favorite projects has been reached.";
        res.status(400).send(response);
        return;
    }

    // adding project to favorites
    userInfo["favoriteProjects"].push(projectId);

    userInfo.save().then( () => {
        response["msg"] = "Project was added to your favorites.";
        let favProject = project.toObject();
        favProject["isMyProject"] = userIsProjectOwner;
        setupProjectInitials(favProject);
        response["project"] = favProject;
        res.status(200).send(response);
        return;
    }).catch(err => {
        console.error(err);
        response["msg"] = "Oops, there was a problem adding the project to your favorites. Try again.";
        res.status(400).send(response);
        return;
    });
});

/**
 * METHOD: POST - REMOVE PROJECT TO FAVORITE
*/
router.post("/api/removeProjectFromFavorite", async function (req, res) {
    
    console.log("Getting request to remove a project from favorite...");
    
    // getting data received
    let { projectId } = req.body;
    const currentUserId = req.user["_id"];

    let response = {};

    // check the user is in the project
    let project = await ProjectCollection.findById(projectId).catch(err =>{
        console.error("Error getting project: ", err);
    });

    // check project
    if (_.isNull(project) || _.isUndefined(project) || !project){
        response["msg"] = "Oops, cannot find the information of the project";
        res.status(400).send(response);
        return;
    }

    let userIsProjectOwner = project["author"].toString() === currentUserId.toString();

    // check if the user DOES NOT has access to this project
    if ( !userIsProjectOwner && !project["users"].includes(currentUserId)){
        response["msg"] = "You don't have permission to remove this project from your favorites.";
        res.status(400).send(response);
        return;
    }

    // getting user information 
    let userInfo = await UserCollection.findById(currentUserId).catch(err => {
        console.error("Error getting user info: ", err);
    });

    if (_.isUndefined(userInfo) || _.isNull(userInfo) || !userInfo){
        response["msg"] = "Sorry, there was a problem getting your information. Please try later.";
        res.status(400).send(response);
        return;
    }
    
    // remove project to favorites
    userInfo["favoriteProjects"].pull(projectId);

    userInfo.save().then( () => {
        response["msg"] = "Project was removed from your favorites.";
        let favProject = project.toObject();
        favProject["isMyProject"] = userIsProjectOwner;
        setupProjectInitials(favProject);
        response["project"] = favProject;
        res.status(200).send(response);
        return;
    }).catch(err => {
        console.error(err);
        response["msg"] = "Oops, there was a problem removing the project from your favorites. Try again.";
        res.status(400).send(response);
        return;
    });
});


// =========================== TEAM REQUEST =====================

/**
 * METHOD: POST - Create team
 */
router.post("/api/:id/newTeam", middleware.isUserInProject, async function (req, res) {

    // validate project
    let project = await ProjectCollection.findById(req.params.id).catch(err => {
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
    response["team"] = { name: teamName, id: team["_id"], users: team["users"]};

    res.status(200).send(response);
});


/**
 * METHOD: POST - REMOVE ONE TEAM
 */
router.post("/api/:id/deleteTeam", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;

    const {teamId} = req.body;

    let response = {"teamId": teamId};

    // is a string
    if (_.isString(projectId) && _.isString(teamId) && !_.isEmpty(teamId)){
        // Add the comment to the DB
        const projectInfo = await ProjectCollection.findById(projectId).catch(
            err => console.error("Error getting project information: ", err)
        );

        // validate project
        if (_.isUndefined(projectInfo) || _.isNull(projectInfo)){
            response["msg"] = "Sorry, There was a problem getting the project information. Please try leter.";
            res.status(400).send(response);
            return;
        }

        // remove all sprints from this team
        SprintCollection.deleteMany({teamId}).then( async () => {
            // sprints were removed from the team

            let err_response = null;
            let teamWasRemovedResponse = await projectInfo.removeTeam(teamId).catch(err =>{
                err_response = err;
            });

            // validate response
            if (err_response || _.isUndefined(teamWasRemovedResponse)){
                response["msg"] = "Oops, There was a problem removing the team from the project. Please try later.";
                res.status(400).send(response);
                return;
            }

            response["msg"] = "Team was removed from project.";
            res.status(200).send(response);
            return;

        }).catch(err => {
            console.error("Error deleting sprints for teams: ", err);
            response["msg"] = "Oops, There was a problem deleting the sprints for this team.";
            res.status(400).send(response);
            return;
        });
    }else{
        response["msg"] = "Oops, it looks like this is an invalid team.";
        res.status(400).send(response);
        return;
    }
});

/**
 * METHOD: POST - REMOVE TEAMS
 */
router.post("/api/:id/deleteTeams", middleware.isUserInProject, async function (req, res) {
    
    const projectId = req.params.id;

    const { teamsId } = req.body;

    let response = {"teamsId": teamsId};

    // is a string
    if (_.isString(projectId) && _.isArray(teamsId) && !_.isEmpty(teamsId)){
        // Add the comment to the DB
        const projectInfo = await ProjectCollection.findById(projectId).catch(
            err => console.error("Error getting project information: ", err)
        );

        // validate project
        if (_.isUndefined(projectInfo) || _.isNull(projectInfo)){
            response["msg"] = "Sorry, There was a problem getting the project information. Please try leter.";
            res.status(400).send(response);
            return;
        }

        // remove all sprints from this team
        SprintCollection.deleteMany({teamId: {$in: teamsId}}).then( async () => {
            // sprints were removed from the team

            let err_response = null;
            let teamWasRemovedResponse = await projectInfo.removeTeams(teamsId).catch(err =>{
                err_response = err;
                console.log("Error removing team from project: ", err);
            });

            // validate response
            if (err_response || _.isUndefined(teamWasRemovedResponse)){
                response["msg"] = "Oops, There was a problem removing teams from the project. Please try later.";
                res.status(400).send(response);
                return;
            }

            response["msg"] = "Team was removed from project.";
            res.status(200).send(response);
            return;

        }).catch(err => {
            console.error("Error deleting sprints for teams: ", err);
            response["msg"] = "Oops, There was a problem removing sprint data for a team.";
            res.status(400).send(response);
            return;
        });
    }else{
        response["msg"] = "Oops, it looks like this is an invalid team.";
        res.status(400).send(response);
        return;
    }
});

/**
 * METHOD: POST - Create team
 */
router.post("/api/:id/editTeam/:teamid", middleware.isUserInProject, async function (req, res) {

    const projectId = req.params.id;
    const teamId = req.params.teamid;

    // validate project
    let project = await ProjectCollection.findById(projectId).catch(err => {
        console.error("Error getting the project: ", err);
    });

    if (_.isUndefined(project) || _.isEmpty(project)){
        response["msg"] = "Error getting the project information. Please refresh the page and try again.";
        res.status(400).send(response);
        return;
    }

    if (!project.isTeamInProject){
        response["msg"] = "Oops, it seems this team does not belong to the project";
        res.status(400).send(response);
        return;
    }

    // Getting data from user
    let { name } = req.body;

    let response = {};
    let error_message = null;

    // first verify that team Name is string || not undefined or null
    if (_.isUndefined(name)) {
        response["msg"] = "The name of the team cannot be empty.";
        res.status(400).send(response);
        return;
    }
    
    // clean the name
    name = name.trim()

    // Validating team name
    if (_.isEmpty(name)){
        error_message = "Team name cannot be empty.";
    }else if( !(/^[a-zA-Z\s]+$/.test(name)) ){
        error_message = "Team name cannot include symbols and numbers.";
    }else if(name.length < TEAM_NAME_LENGHT_MIN_LIMIT){
        error_message = "Team name to short.";
    }else if(name.length > TEAM_NAME_LENGHT_MAX_LIMIT){
        error_message = "Team name is to long.";
    }

    if (error_message){
        response["msg"] = error_message;
        res.status(400).send(response);
        return;
    }

    let nameIsInProject = false;

    for(let i =  0; i < project.teams.length; i ++){
        const pTeam = project.teams[i];

        if (pTeam["name"].toLowerCase() === name.toLowerCase()){
            nameIsInProject = true;
            break;
        }
    }

    // check if the name already exist in project
    if (nameIsInProject){
        response["msg"] = "A team with the same name already exist. (Case sensitive is ignored).";
        res.status(400).send(response);
        return;
    }

    // updating name of the team
    for(let i =  0; i < project.teams.length; i ++){
        const pTeam = project.teams[i];

        if (pTeam["_id"] == teamId){
            project.teams[i]["name"] = name;
            console.log("Team name updated");
            break;
        }
    }
    
    await project.save().catch(err => {
        error_message = err;
        console.log("Error adding the team to the project: ", err);
    });

    if (error_message){
        response["msg"] = `Error updating team name: ${error_message}`;
        res.status(400).send(response);
        return;
    }

    response["msg"] = "Successfully updated team name";
    response["team"] = { name: name, id: teamId};

    res.status(200).send(response);
});

module.exports = router;