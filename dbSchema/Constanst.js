module.exports.projectStatus = ["New", "Active", "Completed", "Deleted", "Block", "Abandoned"];

// TODO: change to a better name
module.exports.UNASSIGNED_USER = {name: "Unassigned", id: "0", selected: true};

module.exports.userStatus = ["Active", "Inactive"];

// SPRINTS CONSTANTS
module.exports.sprintTimePeriod = ["1w", "2w", "3w", "1m"];
module.exports.sprintTimePeriodDefault = "1w";
module.exports.EMPTY_SPRINT = {name: "None", "id": 0, isActive: true};

// STORY TYPE
module.exports.WORK_ITEM_TYPE = [
    {
        icon: "fa-book-open cl-blue",
        name: "Story",
        active: true
    },
    {
        icon: "fa-clipboard-check",
        name: "Task",
        active: false
    },
    {
        icon: "fa-bug cl-danger",
        name: "Bug",
        active: false
    },
    {
        icon: "fa-bolt taskIcon",
        name: "Epic",
        active: false
    }
];

module.exports.WORK_ITEM_STATUS = [
    
];
