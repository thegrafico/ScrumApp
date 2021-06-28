
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const workItemCollection        = require("../../dbSchema/workItem");
let router                      = express.Router();

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

module.exports = router;