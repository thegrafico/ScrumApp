/**
 * DB modal to store user privilege
*/

// import DB
const mongoose                  = require("mongoose");
const moment                    = require("moment");
const _                         = require("lodash");

const {
    USER_PRIVILEGES
} = require("./Constanst");

const ObjectId = mongoose.Schema.Types.ObjectId;

let userPrivilege = new mongoose.Schema({

    userId: {
        type: ObjectId,
        ref: "User",
        index: true
    },
    projectId: {
        type: ObjectId,
        ref: "User",
        index: true
    },
    privilege: {
        type: String,
        enum: Object.values(USER_PRIVILEGES),
        required: true, 
    },
}, {timestamps: true});

// make the userId, ProjectId unique
userPrivilege.index({ userId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model("UserPrivilege", userPrivilege);
