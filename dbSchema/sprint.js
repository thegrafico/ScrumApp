/**
 * DB modal to store all project sprints
*/

// import DB
const mongoose = require("mongoose");
const sprintTimePeriodDefault = require('./Constanst').sprintTimePeriodDefault;

const ObjectId = mongoose.Schema.ObjectId;

let sprintSchema = new mongoose.Schema({
    name: {type: String, required: true},
    task: [
        {   
            type: ObjectId,
            ref: "WorkItem"
        }
    ],
    timePeriod: {type: String, default: sprintTimePeriodDefault},
    isActive: {String: Boolean, default: false},
}, {timestamps: true});

module.exports = mongoose.model("Sprint", sprintSchema);
