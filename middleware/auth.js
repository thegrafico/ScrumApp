/**
 * Main auth middleware
 */
const ProjectCollection     = require("../dbSchema/projects");
const WorkItemCollection     = require("../dbSchema/workItem");
const _                     = require("lodash");
const mongoose              = require("mongoose");

const {
    setupProjectInitials,
} = require("../dbSchema/Constanst");

/**
 * Verify if the user is login 
 */
module.exports.isUserLogin = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("error", "You need to be login.");
        res.redirect("/login");
    }
}

/**
 * Verify if the user has access to a project so we can show it 
 */
module.exports.isUserInProject = async (req, res, next) => {
    
    const projectId = req.params.id;
    // TODO: check a way to check projectId if instance of mongoose type;

    const userProjects = await ProjectCollection.find({_id: projectId, users: req.user._id}).catch(err => {
        console.error("Error finding the user: ", err);
    });

    // TODO: move this from here
    const userWorkItems = await WorkItemCollection.getUserWorkItems(projectId, req.user["_id"]).catch(err => {
        console.error("Error: ", err);
    }) || [];

    res.locals.userWorkItems = userWorkItems;

    if (userProjects && userProjects.length > 0){
        next();
        return;
    }
    // if this part of the code is reach, then we send a message to the user
    req.flash("error", "You don't have access to this project.");
    res.redirect("back");
}


/**
 * Set the projects for the user
 */
module.exports.setUserProjects = async (req, res, next) => {

    // ====== SETTING PROJECTS =========
    let projects = await getProjectsForUser(req.user._id).catch(err => {
        console.error(err)
    }) || [];

    // getting inital of the projects
    const COLORS_LIMIT = 3; //PROJECT_INITIALS_COLORS.length;
    let colorsIndex = 0;
    for (let project of projects) {

        setupProjectInitials(project, colorsIndex);

        colorsIndex++;

        if (colorsIndex >= COLORS_LIMIT){
            colorsIndex = 0;
        }
    }

    // getting user favorite projects
    let userFavoriteProjects = projects.filter(each => {
        return req.user["favoriteProjects"].includes(each["_id"].toString());
    });

    // filter normal projects
    projects = projects.filter(each => {
        return !req.user["favoriteProjects"].includes(each["_id"].toString());
    });

    res.locals.userFavoriteProjects = userFavoriteProjects;
    res.locals.userProjects = projects;
    // ============= END OF SETTING PROJECTS ==============

    // Setting work items

    next();
}


/**
 * Get all projects the user is
 * @param {*} userId - id of the user
 */
function getProjectsForUser(userId) {
    return new Promise(async function (resolve, rejected) {

        // find all projects user is
        let userProjects = await ProjectCollection.find({
            users: userId
        }).catch(err => {
            console.error("Error getting the projects for the user: ", err);
        });

        if (!userProjects || userProjects.length == 0) {
            rejected("Response is empty, cannot get the project for the user");
            return;
        }

        resolve(userProjects);
    });

}