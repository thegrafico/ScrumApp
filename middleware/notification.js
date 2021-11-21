/**
 * Main auth middleware
 */
const ProjectCollection         = require("../dbSchema/projects");
const WorkItemCollection        = require("../dbSchema/workItem");
const UserCollection            = require("../dbSchema/user");
const NotificationCollection    = require("../dbSchema/notification");

const _ = require("lodash");
const mongoose = require("mongoose");

const {
    setupProjectInitials,
    NOTIFICATION_STATUS,
    NOTIFICATION,
    NOTIFICATION_TYPES,
    getInitials,
    sortByDate,
} = require("../dbSchema/Constanst");

/**
 * Load user notifications 
 */
module.exports.getUserNotifications = async (req, res, next) => {
    
    const myUserId = req.user["_id"];

    // const userProjects = req.user["projects"] || [];

    // TODO: maybe load the notifications every amount of time?
    // it would be good to investigate about this more. 

    // getting all active notification for the user
    let myNotifications = await NotificationCollection.find({to: myUserId, status: {$in: [ NOTIFICATION_STATUS["ACTIVE"], NOTIFICATION_STATUS["NEW"]] }}).lean().catch(err => {
        console.error("Error getting user notifications: ", err);
    });

    // sort notification
    myNotifications = sortByDate(myNotifications, "createdAt");

    // notifications to send to the user;
    let goodNotifications = [];

    let numberOfNewNotifications = 0;

    for (let notification of myNotifications){

        if (notification["status"] === NOTIFICATION_STATUS["NEW"]){
            numberOfNewNotifications += 1;
        }
        
        let isGoodNotification = false;

        switch(notification['type']){
            case NOTIFICATION["PROJECT_INVITATION"]:
                isGoodNotification = await setupProjectInvitationNotification(notification);
                break;
            case NOTIFICATION["TEAM_ADDED"]:
                break;
            case NOTIFICATION["MENTIONED"]:
                break;
            case NOTIFICATION["ASSIGNED_WORK_ITEM"]:
                isGoodNotification = await setupAssignedWorkItemNotification(notification);
                break;
            case NOTIFICATION["WORK_ITEM_UPDATED"]:
                break;
            default: 
                break;
        }

        // add the notification if the information was found
        if (isGoodNotification){
            goodNotifications.push(notification);
        }
    }

    // to use it in the UI
	res.locals.myNotifications = goodNotifications;
    res.locals.numberOfNotifications = numberOfNewNotifications;

    // console.log("My notifications are: ", myNotifications);
    // console.log("NEW NOTIFICATIONS: ", numberOfNewNotifications);
    next();
}

/**
 * Setup the notification for project invitation
 * @param {Object} notification 
 * @returns {Boolean}
 */
async function setupProjectInvitationNotification(notification){

    // if its a project invitation, we know the user does not belong to the project
    // so we look the project.        
    const project = await ProjectCollection.findOne({_id: notification["referenceId"]}).catch(err =>{
        console.error("Error getting the invitation from the project: ", err);
    });

    if (!project) {
        console.log("There is a problem in the notification section");
        return false;
    }

    const fromUser = await UserCollection.findById(notification["from"]).catch(err => {
        console.error("Error getting user who sends the invitation: ", err);
    });

    if (!fromUser) {
        console.log("Cannot find the user who sent the project invitation");
        return false;
    }

    let message = NOTIFICATION_TYPES["PROJECT_INVITATION"]["getMessage"](project["title"]);
    
    notification["from"] = {_id: notification["from"], name: fromUser["fullName"]};
    notification['message'] = message;
    notification['initials'] = getInitials(project["title"]);
    notification['icon'] = NOTIFICATION_TYPES["PROJECT_INVITATION"]["icon"];
    return true;
}

/**
 * Setup the notification for project invitation
 * @param {Object} notification 
 * @returns {Boolean}
 */
async function setupAssignedWorkItemNotification(notification){

    // find the work item for the user
    const workItem = await WorkItemCollection.findById(notification["referenceId"]).catch(err =>{
        console.error("Error getting the work item from the project: ", err);
    });

    if (!workItem) {
        console.log("Cannot find the work item");
        return false;
    }
    
    // find the project for this work item
    const project = await ProjectCollection.findOne({_id: notification["projectId"]}).catch(err =>{
        console.error("Error getting the project: ", err);
    });

    if (!project) {
        console.log("There is a problem in the notification section");
        return false;
    }

    let message = NOTIFICATION_TYPES["ASSIGNED_WORK_ITEM"]["getMessage"](project["title"], workItem["itemId"]);
    
    notification['message'] = message;
    notification['initials'] = getInitials(workItem["title"]);
    notification['icon'] = NOTIFICATION_TYPES["ASSIGNED_WORK_ITEM"]["icon"];
    return true;
}