/**
 * DB modal to store all project sprints
 */

// import DB
const mongoose          = require("mongoose");
const AutoIncrement     = require('mongoose-sequence')(mongoose);

const {
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS_COLORS,
    MAX_STORY_POINTS,
    MAX_PRIORITY_POINTS,
    MAX_LENGTH_DESCRIPTION,
    MAX_NUMBER_OF_TAGS_PER_WORK_ITEM
} = require("./Constanst");

// get just the name since that will be in the db
workType = Object.keys(WORK_ITEM_ICONS);

// get work item an default value
const workItemStatus = Object.keys(WORK_ITEM_STATUS_COLORS);
const defaultWorkItem = workItemStatus.filter(key => WORK_ITEM_STATUS_COLORS[key].default != undefined);

// ID schema object
const ObjectId = mongoose.Schema.ObjectId;

let workItemSchema = new mongoose.Schema({
    itemId: Number,
    title: {
        type: String,  //const MAX_LENGTH_TITLE = 80;
        required: true,
        trim: true,
    },
    projectId: {
        type: ObjectId,
        ref: "Projects",
        required: [true, 'Project ID is mandatory'],
    },
    assignedUser: {
        name: {type: String, default: "unassigned"},
        id: {type: ObjectId, ref: "User", default: null}
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
    comments: {
        type: [String],
        // validate: [limitOfText, "{PATH} exceeds the limit of text a comment can have"]
    },
    tags: {
        type: [String],
        validate: [limitOfTags, "{PATH} exceeds the limit of elements"]
    }
}, {
    timestamps: true,
});

workItemSchema.plugin(AutoIncrement, {id: 'sequence', inc_field: 'itemId', reference_fields: ['projectId'] });

/**
 * Function to validate the max number of tags can a work item has
 * @param {Array} tags 
 */
// TODO: create a constans for this value
function limitOfTags(tags){
    return tags.length <= MAX_NUMBER_OF_TAGS_PER_WORK_ITEM;
}


module.exports = mongoose.model("WorkItem", workItemSchema);