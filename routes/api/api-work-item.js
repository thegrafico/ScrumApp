
const express                   = require("express");
const middleware                = require("../../middleware/auth");
const workItemCollection        = require("../../dbSchema/workItem");
let router                      = express.Router();

/**
 * METHOD: POST - Adds a comment to the
 */
router.post("/api/:id/addCommentToWorkItem/:workItemId", middleware.isUserInProject, async function (req, res) {
    
    console.log("Getting request...");
    
    // TODO: Verify if project exist and work item
    const projectId = req.params.id;
    const workItemId = req.params.workItemId;
    
    let  { comment } = req.body;

    // is a string
    if (typeof comment === 'string' || comment instanceof String || comment.trim().length > 0){
        comment = comment.trim();

        const result = await workItemCollection.updateOne({_id: workItemId}, 
            { 
                $push: { "comments": comment }
            }
        ).catch(err => console.error("Error updating comments: ", err));

        console.log("Result is ", result);
    }else{

    }

    console.log(comment);
    res.status(200).send("Sending data");
});

module.exports = router;