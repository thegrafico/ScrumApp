/**
 * DB modal to store all project sprints
 */

// import DB
const mongoose = require("mongoose");
const {
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS,
    MAX_STORY_POINTS,
    MAX_PRIORITY_POINTS,
    MAX_LENGTH_DESCRIPTION,
} = require("./Constanst");

// get just the name since that will be in the db
workType = Object.keys(WORK_ITEM_ICONS);

// get work item an default value
const workItemStatus = Object.keys(WORK_ITEM_STATUS);
const defaultWorkItem = workItemStatus.filter(key => WORK_ITEM_STATUS[key].default != undefined);

// ID schema object
const ObjectId = mongoose.Schema.ObjectId;

let workItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    projectId: {
        type: ObjectId,
        ref: "Projects",
        required: [true, 'Project ID is mandatory'],
    },
    assignedUser: {
        name: {type: String, default: "Unnasigned"},
        id: {type: ObjectId, ref: "User", default: null}
    },
    sprint: {
        type: ObjectId,
        ref: "sprint",
        default: null,
    },
    storyPoints: {
        type: Number,
        min: 0,
        max: MAX_STORY_POINTS,
        default: 0,
    },
    priorityPoints: {
        type: Number,
        min: 1,
        max: MAX_PRIORITY_POINTS,
        default: MAX_PRIORITY_POINTS,
    },
    status: {
        type: String,
        enum: workItemStatus,
        default: defaultWorkItem[0],
    },
    teamId: {
        type: ObjectId,
        ref: "projectTeam",
        default: null,
    },
    type: {
        type: String,
        enum: workType,
        required: true,
    },
    description: {
        type: String,
        default: "",
        trim: true,
        maxLength: MAX_LENGTH_DESCRIPTION,
    },
    comments: [{
        type: ObjectId,
        ref: "workItemComments",
    }, ],
}, {
    timestamps: true,
});

module.exports = mongoose.model("WorkItem", workItemSchema);