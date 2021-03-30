/**
 * DB modal to store all project sprints
*/

// import DB
const mongoose = require("mongoose");
const {WORK_ITEM_TYPE} = require('./Constanst');

// get just the name since that will be in the db
workType = WORK_ITEM_TYPE.map(e => e.name);

const ObjectId = mongoose.Schema.ObjectId;

let workItemSchema = new mongoose.Schema({
    title: {type: String, required: true,  trim: true},
    projectId: {type: ObjectId, ref: "projects", require: true},
    assignedUser: {type: ObjectId, ref: "user", default: null},
    sprint: {type: ObjectId, ref: "sprint", default: null},
    storyPoints: {type: Number, min: 0, max: 500},
    status: {},
    type: {
        type: String,
        enum: workType,
        require: true,
    },
}, {timestamps: true});

// set both columns to be unique ids? 
workItemSchema.index({ "name": 1, "projectId": 1}, { "unique": true });

module.exports = mongoose.model("sprint", workItemSchema);
