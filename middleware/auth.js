/**
 * Main auth middleware
 */
const { log } = require("debug");
const projectCollection = require("../dbSchema/projects");

/**
 * Verify if the user is login 
 */
module.exports.isUserLogin = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

/**
 * Verify if the user has access to a project so we can show it 
 */
module.exports.isUserInProject = async (req, res, next) => {

    const userProjects = await projectCollection.find({_id: req.params.id, users: req.user._id}).catch(err => {
        console.error("Error finding the user: ", err);
    });
    // console.log("=============");
    // console.log("USER ID: ", req.user._id);
    // console.log("Project ID: ", req.params.id);    
    // console.log("Project inf: ", userProjects);
    // console.log("=============");

    // TODO: send a message to the user when does not belong to the project
    if (response && response.length > 0)
        next();
    else 
        res.redirect("back");
}