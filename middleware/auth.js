/**
 * Main auth middleware
 */
const projectCollection = require("../dbSchema/projects");
const _ = require("lodash");
const mongoose = require("mongoose");

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

    const userProjects = await projectCollection.find({_id: projectId, users: req.user._id}).catch(err => {
        console.error("Error finding the user: ", err);
    });

    if (userProjects && userProjects.length > 0){
        next();
        return;
    }

    // if this part of the code is reach, then we send a message to the user
    req.flash("error", "You don't have access to this project.");
    res.redirect("back");
}