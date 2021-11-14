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

const { UNASSIGNED, NOTIFICATION_TYPES } = require('./Constanst');

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
    },

}, {
    timestamps: true
});



module.exports = mongoose.model("Notification", notificationSchema);