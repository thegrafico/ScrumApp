/**
 * DB modal to store all projects for a user
 */

// import DB
const mongoose = require("mongoose");
const projectStatus = require('./Constanst').projectStatus;

const ObjectId = mongoose.Schema.ObjectId;

let projectSchema = new mongoose.Schema({
    author: {type: ObjectId, ref: "User", required: true},
    title: String,
    description: String,
    status: {type: String, enum: projectStatus, default: "New"}
}, {timestamps: true});

module.exports = mongoose.model("Projects", projectSchema);
