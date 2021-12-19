
const express                   = require("express");
const ProjectCollection         = require("../../dbSchema/projects");
const NotificationCollection    = require("../../dbSchema/notification");
let router                      = express.Router();

const {
    NOTIFICATION,
    NOTIFICATION_STATUS,
} = require('../../dbSchema/Constanst');


/**
 * METHOD: POST - Decline project invitation
 */
router.post("/api/declineProjectInvitation", async function (req, res) {

    const { notificationId, projectId } = req.body;
    let response = {notificationId};
    const userId = req.user["_id"];

    // validate project
    let project = await ProjectCollection.findById(projectId).catch(err => {
        console.error("Error getting the project: ", err);
    });

    // checking the project
    if (_.isUndefined(project) || _.isEmpty(project)){
        response["msg"] = "Sorry, Cannot find the information of the project you were invited."
        res.status(400).send(response);
        return;
    }

    // getting the notification
    let notification = await NotificationCollection.findById(notificationId).catch(err => {
        console.error("Error finding the notification: ", err);
    });

    // check if notification was found
    if (!notification){
        console.log("NOTIFICATION ID:", notificationId);
        response["msg"] = "Sorry, It seems this project invitation was deleted.";
        res.status(400).send(response);
        return;
    }

    // check if the current user owns the notification
    if (notification["to"].toString() != userId.toString()){
        response["msg"] = "Sorry, It seems this project invitation does not belong to you.";
        res.status(400).send(response);
        return;
    }

    // at this point we know the notification belongs to the user. 

    // check the notification is a project invitation
    if (notification["type"] != NOTIFICATION["PROJECT_INVITATION"]){
        response["msg"] = "Sorry, it seems this project invitation does not belong to you.";
        res.status(400).send(response);
        return;
    }

    // Remove the notification so the user does not see the notification after declining the project
    // invitation
    NotificationCollection.findByIdAndDelete(notificationId).then( () => {
        console.log("Project invitation was deleted...");
        response["msg"] = "Notification was removed";
        res.status(200).send(response);
        return;
    }).catch(err =>{
        console.error("Error deleting the project invitation: ", err);
        response["msg"] = "Oops, it seem there was a problem removing the project invitation. Please try later.";
        res.status(400).send(response);
        return
    });
});

/**
 * METHOD: POST - UPDATE NOTIFICATION STATUS
 */
router.post("/api/updateNotificationStatus", async function (req, res) {

    const { notificationId, status } = req.body;
    const userId = req.user["_id"];

    let response = {notificationId};

    // check if the status is valid
    if (!status || !Object.keys(NOTIFICATION_STATUS).includes(status)){
        response["msg"] = "Invalid status for the notification was received.";
        res.status(400).send(response);
        return;
    }

    // getting the notification
    let notification = await NotificationCollection.findById(notificationId).catch(err => {
        console.error("Error finding the notification: ", err);
    });

    // check if notification was found
    if (!notification){
        response["msg"] = "Oops, Cannot find the notification requested.";
        res.status(400).send(response);
        return;
    }

    // check if the current user owns the notification
    if (notification["to"].toString() != userId.toString()){
        response["msg"] = "Sorry, You don't have the permission to change the notification status";
        res.status(400).send(response);
        return;
    }

    // at this point we know the notification belongs to the user.

    if (notification["status"] == status){
        response["msg"] = "Notification already has the status desired.";
        res.status(200).send(response);
        return;
    }

    // changing the status
    notification['status'] = status;

    // save the notification
    notification.save().then( () => {
        console.log("Notification status was updated...");
        response["msg"] = "Success";
        res.status(200).send(response);
        return;
    }).catch(err =>{
        console.error("Error updating the status for the notification: ", err);
        response["msg"] = "Oops, it seem there was a problem updating notification status. Please try later.";
        res.status(400).send(response);
        return
    });
});


module.exports = router;