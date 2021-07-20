/**
 * DB modal to store all project sprints
*/

// import DB
const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

let sprintSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        validate: {
            validator: function (_name) {
                return _name.length > 3 && _name.length < 25; 
            },
            message: 'Sprint name length needs to be >= 3 and <= 25.'
        }
    },
    projectId: {
        type: ObjectId,
        ref: "Project"
    },
    tasks: [
        {   
            type: ObjectId,
            ref: "WorkItem"
        }
    ],
    teamId: {
        type: ObjectId,
        ref: "Projects", // teams
        required: true
    },
    startDate: {
        type: Date, 
        required: true,
    },
    endDate: {
        type: Date, 
        required: true
    },
    isActive: {type: Boolean, default: false},
}, {timestamps: true});

module.exports = mongoose.model("Sprint", sprintSchema);
