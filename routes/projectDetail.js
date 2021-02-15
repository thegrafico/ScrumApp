/**
 * MAIN page to show a project detail
 * AUTHOR: Raul Pichardo
 * DATE: Jan 31, 2021
*/

// ============= CONST AND DEPENDENCIES =============
const express           = require("express");
const _                 = require("lodash");
const STATUS            = require('../models/Constanst').projectStatus;
const moment            = require('moment');
let projectCollection   = require("../models/projects");
const middleware        = require("../middleware/auth");
let router              = express.Router();
// ===================================================


/**
 * METHOD: GET - show the main page for projects
 */
router.get("/:id", middleware.isUserInProject, async function (req, res) {
   
    let projectId = req.params.id;
   
    // verify is the project exists
    // TODO: verify if the user can access to the project
    let projectInfo = await projectCollection.findOne({_id: projectId}).catch(err => {
        console.log("Error is: ", err.reason);
    });

    // console.log("Project information: ", projectInfo);

    if (_.isUndefined(projectInfo) || _.isEmpty(projectInfo)){
        // TODO: show a message to the user
        return res.redirect('/');
    }
    
    let params = {"project": projectInfo, "projectStatus": STATUS, "creationDate": formatDate(projectInfo["createdAt"])};

    res.render("projectDetail", params);
});

function formatDate(mongoDate){
    return moment(mongoDate, "YYYYMMDD").fromNow();
}

module.exports = router;
