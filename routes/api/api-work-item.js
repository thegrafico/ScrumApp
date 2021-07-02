
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const workItemCollection        = require("../../dbSchema/workItem");
const projectCollection         = require("../../dbSchema/projects");
const _                         = require("lodash");
let router                      = express.Router();

const {
    UNASSIGNED,
    MAX_LENGTH_TITLE,
    MAX_STORY_POINTS,
    EMPTY_SPRINT,
    WORK_ITEM_STATUS,
    capitalize
} = require('../../dbSchema/Constanst');

/**
 * METHOD: POST - Adds a comment to the
 */
router.post("/api/:id/addCommentToWorkItem/:workItemId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to add a comment to a work item...");
    
    // TODO: Verify if project exist and work item
    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    
    let  { comment } = req.body;

    // is a string
    if (typeof comment === 'string' || comment instanceof String || comment.trim().length > 0){
        
        // clean the comment in case
        comment = comment.trim();

        // Add the comment to the DB
        const result = await workItemCollection.updateOne({_id: workItemId}, 
            { 
                $push: { "comments": comment }
            }
        ).catch(err => console.error("Error updating comments: ", err));

        if (!result){
            res.status(400).send("Error adding the comment to the work item, Please try later.");
            return;
        }
    }else{
        res.status(400).send("Error with the comment sent");
        return;
    }

    res.status(200).send("Comment was added successfully!");
});

/**
 * METHOD: POST - REMOVE WORK ITEMS FROM PROJECT
 */
 router.post("/api/:id/removeWorkItems", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to remove work items...");
    
    // TODO: Verify if project exist and work item
    const projectId = req.params.id;
    
    let  { workItemsId } = req.body;

    // is a string
    if (workItemsId && workItemsId.length > 0){
    
        // Add the comment to the DB
        const result = await workItemCollection.deleteMany({projectId: projectId, _id: workItemsId}).catch(
            err => console.error("Error removing work items: ", err)
        );

        if (!result){
            res.status(400).send("Error removing work items. Please try later.");
            return;
        }
    }else{
        res.status(400).send("Error removing work items");
        return;
    }

    res.status(200).send("Work items were removed successfully!");
});

/**
 * METHOD: POST - Update work item
 */
 router.post("/api/:id/update_work_item/:workItemId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request to update work item...");
    
    // TODO: Verify if project exist and work item
    const projectId = req.params.id;
    const workItemId = req.params.workItemId;

    const project = await projectCollection.findById(projectId).catch(err => {
        console.error("Error getting the project info: ", err);
    });

    // verify project is good.
    if (_.isUndefined(project) || _.isEmpty(project)){
        res.status(400).send("Error getting the project information. Try later");
        return;
    }
    
    // waiting for this params. Anything that cames undefined was not sent
    let  { 
        title,
        assignedUser,
        sprint,
        storyPoints,
        priorityPoints,
        status,
        teamId,
        type,
        description,
        tags,
    } = req.body;

    console.log(req.body);
    
    let updateValues = {};

    // verify title
    if (_.isString(title) && title.length < MAX_LENGTH_TITLE){
        updateValues["title"] = title;
    }

    // verify assigned user
    if (_.isString(assignedUser)){
        
        // verify if the user was selected to unnasigned
        if (assignedUser == UNASSIGNED.id){
            updateValues["assignedUser"] = null;
        }else if(project.isUserInProject(assignedUser)){
            // verify is the user is in the project
            updateValues["assignedUser"] = assignedUser
        }
    }
    
    // TODO: Verify sprint

    // verify story points
    if (!_.isEmpty(storyPoints) && !isNaN(storyPoints)){
        storyPoints = parseInt(storyPoints);
        if (storyPoints <= MAX_STORY_POINTS){
            updateValues["storyPoints"] = storyPoints;
        }
    }

    // verify Priority points
    if (!_.isEmpty(priorityPoints) && !isNaN(priorityPoints)){
        priorityPoints = parseInt(priorityPoints);
        if (storyPoints <= MAX_STORY_POINTS){
            updateValues["storyPoints"] = storyPoints;
        }
    }

    // verify Status
    if (_.isString(status)){
        const STATUS = Object.keys(WORK_ITEM_STATUS);
        status = capitalize(status);

        if (STATUS.includes(status)){
            updateValues["status"] = status;
        }else{
            // TODO: error message to the user? 
        }
    }

    res.status(200).send("Work Item was updated successfully!");
});

module.exports = router;