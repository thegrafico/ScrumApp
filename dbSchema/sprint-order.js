/**
 * DB modal to store all project sprints
*/

// import DB
const mongoose  = require("mongoose");
const moment    = require("moment");
const _         = require("lodash");

const {
    WORK_ITEM_STATUS
} = require("./Constanst");

const ObjectId = mongoose.Schema.ObjectId;

// Sprint Order DB model
let sprintOrderSchema = new mongoose.Schema({
    sprintId: {
        type: ObjectId,
        ref: "Sprint",
        required: true,
        unique: true,
    },
    projectId: {
        type: ObjectId,
        ref: "Project"
    },
    order:{

        sprintBacklog: [{
            status: { 
                type: String, 
                enum: Object.keys(WORK_ITEM_STATUS),
                required:true
            },

            index : [{type: ObjectId, ref: "WorkItem"}],

            firstTimeSet: {type: Boolean, default: false}
        }],

        sprintPlaning: [{
            status: { 
                type: String, 
                enum: Object.keys(WORK_ITEM_STATUS),
                required:true
            },

            orderIndex : [{type: ObjectId, ref: "WorkItem"}],
            firstTimeSet: {type: Boolean, default: false}

        }],

        sprintBoard: [
            {
                status: { 
                    type: String, 
                    enum: Object.keys(WORK_ITEM_STATUS),
                    required:true,
                },
                index : [{type: ObjectId, ref: "WorkItem"}],
                firstTimeSet: {type: Boolean, default: false}
            }
        ],
    },
});

module.exports = mongoose.model("SprintOrder", sprintOrderSchema);
