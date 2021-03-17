/**
 * DB modal to store teams for a project
*/

// import DB
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

let projectTeamSchema = new mongoose.Schema({
    teamName: {type: String, required: true},
    projectId: {type: ObjectId, ref: "Projects"},
    status: {type: Boolean, default: true},
}, {timestamps: true});

// set both columns to be unique ids? 
projectUserSchema.index({ "teamName": 1, "projectId": 1}, { "unique": true });

module.exports = mongoose.model("projectTeam", projectTeamSchema);
