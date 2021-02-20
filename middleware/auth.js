/**
 * Main auth middleware
 */
const projectUsersCollection = require("../models/projectUsers");

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

    const response = await projectUsersCollection.find({userId: req.user._id, projectId: req.params.id}).catch(err => {
        console.error("Error finding the user: ", err);
    });

    if (response && response.length > 0)
        next();
    else 
        res.redirect("back");
}