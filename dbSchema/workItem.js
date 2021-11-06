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
    getPointsForStatus,
    UNASSIGNED_USER,
    WORK_ITEM_RELATIONSHIP,
    arrayToObject,
    getRelationShipForWorkItem,
} = require("./Constanst");

// get just the name since that will be in the db
const workType = Object.keys(WORK_ITEM_ICONS);
const RELATIONSHIP = arrayToObject(Object.keys(WORK_ITEM_RELATIONSHIP));

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
        name: {type: String, default: UNASSIGNED_USER["name"]},
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
    },
    links: {
        type: [{relationship: String, workItemId: {type: ObjectId, ref: "WorkItem"}}]
    }
}, {
    timestamps: true,
});

workItemSchema.plugin(AutoIncrement, {id: 'sequence', inc_field: 'itemId', reference_fields: ['projectId'] });


/**
 * Check if the work item has a user assigned
 * @returns {Boolean}
 */
workItemSchema.methods.hasUserAssigned = function() {

    let workItem = this;
    
    // check if the user has a unnasigned user and then negate the condition
    return !(
        workItem["assignedUser"]["name"] == UNASSIGNED_USER["name"] || 
        workItem["assignedUser"]["id"] == null ||
        workItem["assignedUser"]["id"].toString() == UNASSIGNED_USER["id"]
    );
};

/**
 * get user work items 
 * @param {String} projectId - id of the project 
 * @param {String} userId - id of the project
 * @param {Number} numberOfRecords - Number of elements to retreive
 * @returns {Promise}
 */
workItemSchema.statics.getUserWorkItems = async function(projectId, userId, numberOfRecords=5) {

    let father = this;
    return new Promise( async function (resolve, reject){

        if (!projectId || !userId){
            return reject("Invalid parameters passed.");
        }

        let error = null;
        let userWorkItems = await father.find({
            "projectId": projectId, 
            "assignedUser.id": userId,
            "status": {$in: [WORK_ITEM_STATUS["New"], WORK_ITEM_STATUS["Active"], WORK_ITEM_STATUS["Review"]]}
        }).limit(numberOfRecords).catch( err => {
            console.error("Error getting user work items: ", err);
            error = err;
        }) || [];

        if (error){
            return reject("Sorry, There was a problem getting the work items for the user.");
        }

        return resolve(userWorkItems);
    });
};

/**
 * Remove all work items for a project
 * @param {String} projectId - id of the project
 * @returns {Promise}
 */
workItemSchema.statics.removeWorkItemsFromProject = async function(projectId) {
    
    let father = this;

    return new Promise(async function (resolve, reject){

        let err_msg = null;
        if (_.isUndefined(projectId) || _.isNull(projectId)){
            err_msg = 'Invalid project id received.';
            return reject(err_msg);
        }

        // ============= REMOVE WORK ITEMS ==============
        await father.deleteMany({ projectId: projectId}).catch(err =>{
            err_msg = err;
        });
        
        if (err_msg){
            return reject(err_msg);        
        }

        return resolve(true);
    });
};


/**
 * Add relationship to other work items
 * @param {String} projectId 
 * @param {Array} relatedWorkItems 
 * @returns 
 */
workItemSchema.statics.addRelationToWorkItem = async function(projectId, relatedWorkItems, workItemIdFrom) {

    let father = this;
    return new Promise( async function (resolve, reject){

        if (!projectId || !relatedWorkItems || !_.isArray(relatedWorkItems)){
            return reject("Invalid parameters passed.");
        }
        
        // work item that is adding the relationship
        const addingFrom = workItemIdFrom;

        for (let workItemRelationship of relatedWorkItems){

            let addingTo = workItemRelationship["addTo"];

            // set new relationship
            // E.X -> Work Item A Is child of Work item B
            // So, Work Item B is parent of Work Item A.
            let relationship = getRelationShipForWorkItem(workItemRelationship["relationship"]);

            let wasUpdated = await father.updateOne(
                {projectId, _id: addingTo},
                {$push: {links: {relationship: relationship, workItemId:addingFrom}}}
            ).catch(err => {
                console.error("Error adding relationship to work item: ", err);
            });

            if (!wasUpdated){
                return reject("There was a problem updating the other work item relationship.");
            }
        }

        return resolve(true);
    });
};

/**
 * 
 * @param {String} projectId - id of the project
 * @param {String} workItemId - id of the work item to be removed from other work items
 * @param {Array} currentLinks - links before update
 * @param {Array} updatedLinks - links after update
 * @returns {Promise}
 */
 workItemSchema.statics.removeRelationFromWorkItem = async function(projectId, workItemId, currentLinks, updatedLinks) {

    let father = this;
    return new Promise( async function (resolve, reject){

        if (!projectId || !workItemId || !currentLinks || !updatedLinks){
            return reject("Invalid parameters passed.");
        }
        
        let previusWorkItems = currentLinks.map(each => each["workItemId"]);
        let updatedWorkItems = updatedLinks.map(each => each["workItemId"]);

        // getting which work items were removed. 
        let differentWorkItems = previusWorkItems.filter(workItem => !updatedWorkItems.includes(workItem));
        
        for (let workItemToRemove of differentWorkItems){

            let wasRemoved = await father.updateOne(
                {projectId, _id: workItemToRemove},
                {$pull: {"links": {"workItemId": workItemId}}}
            ).catch(err => {
                console.error("Error removing relationship from work item: ", err);
            });

            if (!wasRemoved){
                return reject("There was a problem removing the other work item relationship.");
            }
        }

        return resolve(true);
    });
};

/**
 * Add relationship to other work items
 * @param {String} projectId 
 * @param {Array} relatedWorkItems 
 * @returns 
 */
workItemSchema.statics.setRelationship = async function(workItem) {

    let father = this;

    // insted of adding the relationship in an array, it'll be better to have an object with arrays
    // something like: {"Parent": [{}, {}], "Child": [{}, {}]}
    let filterRelationship = {};
    return new Promise( async function (resolve, reject){

        if (_.isUndefined(workItem) || _.isNull(workItem) || _.isEmpty(workItem)){
            return reject("Invalid work item");
        }

        // get the links for the work item
        if (!_.isEmpty(workItem["links"])){

            // get only the work item ids
            let wIds = workItem["links"].map( each => each["workItemId"]);

            // find the related work items
            let relatedWorkItems = await father.find({"_id": {$in: wIds}}).lean().catch(err => {
                console.error("Error getting related work items: ", err);
            }) || [];

            for (let realteWorkItem of relatedWorkItems){
                
                // getting One related work item at time
                let relationshipWithWorkItem = workItem["links"].filter(each => {
                    return each["workItemId"].toString() === realteWorkItem["_id"].toString();
                })[0];

                // store the relationship with the current work item
                const relationship = relationshipWithWorkItem["relationship"];

                realteWorkItem["relationship"] = relationship;
                realteWorkItem["lastUpdatedDate"] = moment(realteWorkItem["updatedAt"]).format(SPRINT_FORMAT_DATE);

                // check if the relationship is already in our object
                if (relationship in filterRelationship){
                    //if so, then append to the array
                    filterRelationship[relationship].push(realteWorkItem);
                }else{
                    filterRelationship[relationship] = [realteWorkItem]
                }
            }

            workItem["relatedWorkItems"] = filterRelationship;
        }else {
            workItem["relatedWorkItems"] = {};
        }
        resolve(true);
    });
};



/**
 * Function to validate the max number of tags can a work item has
 * @param {Array} tags 
 */
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

    // getting all work items from sprint
    let sprintWorkItems = await this.constructor.find({_id: {$in: sprint["tasks"]}}).catch(err => {
        console.error("Error getting work items: ", err);
    });

    // check work items
    if (!_.isArray(sprintWorkItems) || _.isEmpty(sprintWorkItems)){
        console.log("Not work item found");
        return;
    }

    const today = moment(new Date)
    const totalPoints = getPointsForStatus(sprintWorkItems);
    const completedPoints = getPointsForStatus(sprintWorkItems, WORK_ITEM_STATUS['Completed']);
    const currentAmountOfActivePoints = (totalPoints - completedPoints >= 0) ? totalPoints - completedPoints : 0;
    const formatedToday = today.format(SPRINT_FORMAT_DATE);
    
    // if note empty, check 
    if (!_.isEmpty(sprint["pointsHistory"])){
        let todaysPoints = sprint["pointsHistory"].filter(each => {return each["date"] == formatedToday});

        // there is not record for today
        if (_.isEmpty(todaysPoints)){
            sprint["pointsHistory"].push( {date: formatedToday, points: currentAmountOfActivePoints} );
        }else{ // there is record for points changes for today's date
            todaysPoints[0]["points"] = currentAmountOfActivePoints;
        }
    }else{
        sprint["pointsHistory"].push({date: formatedToday, points: currentAmountOfActivePoints});
    }

    await sprint.save().catch(err => {
        console.error("error saving sprint: ", err);
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

    // remove the work item from the sprint  - and order
    await sprint.removeWorkItemFromSprints(workItemId).catch(err => {
        console.error("Error removing work item from sprint: ", err);
    });

    // getting all work items that belong to the sprint
    let sprintWorkItems = await this.model.find({"_id": {$in: sprint["tasks"]}}).catch(err => {
        console.error("Error getting work items: ", err);
    });

    // check work items
    if (!_.isArray(sprintWorkItems) || _.isEmpty(sprintWorkItems)){
        console.log("Not work items found");
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