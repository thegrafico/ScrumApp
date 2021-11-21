/**
 * DB modal to store all projects for a user
 */

// import DB
const userCollection            = require("./user");
const projectStatus             = require("./Constanst").projectStatus;
const workItemCollection        = require("./workItem");
const UserPrivilegeCollection   = require("./userPrivilege");
const _                         = require("lodash");
const mongoose                  = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;

const { UNASSIGNED, NOTIFICATION_TYPES, NOTIFICATION_STATUS} = require('./Constanst');

let notificationSchema = new mongoose.Schema({

    // User sending the notification
    from: {
        type: ObjectId,
        ref: "User",
        required: true
    },

    // user receiving the notification 
    to: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    
    // Notification Type - depending on the type, the template of the notification is different. 
    // Look for NOTIFICATION_TYPES
    type: {
        type: String,
        enum: Object.keys(NOTIFICATION_TYPES),
        required: true,
    },

    // to store either the project id, team id, work item id
    // depending on the type. 
    referenceId: {
        type: ObjectId,
        required: true,
    },
    status: {
        type: String,
        enum: Object.keys(NOTIFICATION_STATUS),
        required: true,
    },

    // To store from where project this notification was sent
    projectId: {
        type: ObjectId,
        required: true,
    }

}, {
    timestamps: true
});

// making the fields from, to, and refenceId unique. to avoid duplicates notification
notificationSchema.index({ "from": 1, "to": 1, "referenceId": 1}, { "unique": true });



module.exports = mongoose.model("Notification", notificationSchema);