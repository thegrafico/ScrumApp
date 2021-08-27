/**
 * DB modal to store all project sprints
 */

// import DB
const mongoose          = require("mongoose");
const AutoIncrement     = require('mongoose-sequence')(mongoose);
const SprintCollection  = require("./sprint");
const _                 = require("lodash");
const moment            = require("moment");;


const {
    WORK_ITEM_ICONS,
    WORK_ITEM_STATUS_COLORS,
    MAX_STORY_POINTS,
    MAX_PRIORITY_POINTS,
    MAX_LENGTH_DESCRIPTION,
    MAX_NUMBER_OF_TAGS_PER_WORK_ITEM,
    SPRINT_FORMAT_DATE,
    WORK_ITEM_STATUS,
    getPointsForStatus
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

// Triggers: create, update
workItemSchema.post('save', async function(workItem) {

    console.log("Saving the work item...");

    const projectId = workItem["projectId"].toString();
    const workItemId = workItem["_id"].toString();

    const sprint = await SprintCollection.getSprintForWorkItem(projectId, workItemId).catch( err => {
        console.error("error getting sprint for work item: ", err);
    });

    // exit if not found
    if (!sprint){return;}

    let sprintWorkItems = await this.constructor.find({_id: {$in: sprint["tasks"]}}).catch(err => {
        console.error("Error getting work items: ", err);
    });

    // check work items
    if (!_.isArray(sprintWorkItems) || _.isEmpty(sprintWorkItems)){
        console.log("Not work item found");
        return;
    }

    const today = moment(new Date).format(SPRINT_FORMAT_DATE);
    let totalPoints = getPointsForStatus(sprintWorkItems);
    let completedPoints = getPointsForStatus(sprintWorkItems, WORK_ITEM_STATUS['Completed']);
    let currentAmountOfPoints = (totalPoints - completedPoints >= 0) ? totalPoints - completedPoints : 0;

    // if note empty, check 
    if (!_.isEmpty(sprint["pointsHistory"])){
        let todaysPoints = sprint["pointsHistory"].filter(each => {return each["date"] == today});

        // there is not record for today
        if (_.isEmpty(todaysPoints)){
            sprint["pointsHistory"].push( {date: today, points: currentAmountOfPoints} );
        }else{ // there is record for points changes for today's date
            todaysPoints[0]["points"] = currentAmountOfPoints;
        }
    }

    await sprint.save().catch(err => {
        console.error("error saving sprint");
    });
});

workItemSchema.post('findOneAndDelete', async function(workItem) {

    console.log("Removing work item...");

    const projectId = workItem["projectId"].toString();
    const workItemId = workItem["_id"].toString();
    
    // getting sprint of the work item
    const sprint = await SprintCollection.getSprintForWorkItem(projectId, workItemId).catch( err => {
        console.error("error getting sprint for work item: ", err);
    });

    // exit if not found
    if (!sprint){return;}

    // removing work item from sprint
    sprint["tasks"].pull(workItemId);
 
    let sprintWorkItems = await this.model.find({"_id": {$in: sprint["tasks"]}}).catch(err => {
        console.error("Error getting work items: ", err);
    });

    // check work items
    if (!_.isArray(sprintWorkItems) || _.isEmpty(sprintWorkItems)){
        console.log("Not work item found");

        // saving before closing
        await sprint.save().catch(err => {
            console.error("error saving sprint");
        });

        console.log("Work item removed from sprint");
        return;
    }

    const today = moment(new Date).format(SPRINT_FORMAT_DATE);
    let totalPoints = getPointsForStatus(sprintWorkItems);
    let completedPoints = getPointsForStatus(sprintWorkItems, WORK_ITEM_STATUS['Completed']);
    let currentAmountOfPoints = (totalPoints - completedPoints >= 0) ? totalPoints - completedPoints : 0;

    // if note empty, check 
    if (!_.isEmpty(sprint["pointsHistory"])){
        let todaysPoints = sprint["pointsHistory"].filter(each => {return each["date"] == today});

        // there is not record for today
        if (_.isEmpty(todaysPoints)){
            sprint["pointsHistory"].push( {date: today, points: currentAmountOfPoints} );
        }else{ // there is record for points changes for today's date
            todaysPoints[0]["points"] = currentAmountOfPoints;
        }
    }

    await sprint.save().catch(err => {
        console.error("error saving sprint");
    });

    console.log("Work item removed from sprint");
});


module.exports = mongoose.model("WorkItem", workItemSchema);



// sprint["pointsHistory"] = [
//     {date: "08/16/2021", points: initialPoints},
//     {date: "08/17/2021", points: 35},
//     {date: "08/19/2021", points: 32},
//     {date: "08/20/2021", points: 37},
//     {date: "08/22/2021", points: 30},
//     {date: "08/23/2021", points: 15},
//     {date: "08/24/2021", points: 12},
// ];