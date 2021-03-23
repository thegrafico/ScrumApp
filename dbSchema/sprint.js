/**
 * DB modal to store all project sprints
*/

// import DB
const mongoose = require("mongoose");
const sprintTimePeriodDefault = require('./Constanst').sprintTimePeriodDefault;

const ObjectId = mongoose.Schema.ObjectId;

let sprintSchema = new mongoose.Schema({
    name: {type: String, required: true},
    projectId: {type: ObjectId, ref: "Projects"},
    task: [
        {   
            type: ObjectId,
            ref: "workitem"
        }
    ],
    timePeriod: {type: String, default: sprintTimePeriodDefault},
    isActive: {String: Boolean, default: false},
}, {timestamps: true});

// set both columns to be unique ids? 
sprintSchema.index({ "name": 1, "projectId": 1}, { "unique": true });

module.exports = mongoose.model("sprint", sprintSchema);
