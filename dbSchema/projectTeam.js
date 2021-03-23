/**
 * DB modal to store teams for a project
*/

// import DB
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

let projectTeamSchema = new mongoose.Schema({
    name: {type: String, required: true}, // name of the team
    projectId: {type: ObjectId, ref: "Projects"}, // id of the project
    status: {type: Boolean, default: true},
    users: [
        {
            type: ObjectId,
            ref: "User"
        }
    ],
}, {timestamps: true});

// set both columns to be unique ids? 
projectTeamSchema.index({ "name": 1, "projectId": 1}, { "unique": true });

module.exports = mongoose.model("projectTeam", projectTeamSchema);