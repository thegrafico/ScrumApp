module.exports.projectStatus = ["New", "Active", "Completed", "Deleted", "Block", "Abandoned"];

// TODO: change to a better name
module.exports.UNASSIGNED = {
    name: "unassigned",
    id: "0",
    selected: true
};

module.exports.userStatus = ["Active", "Inactive"];

// SPRINTS CONSTANTS
module.exports.sprintTimePeriod = ["1w", "2w", "3w", "1m"];
module.exports.sprintTimePeriodDefault = "1w";
module.exports.EMPTY_SPRINT = {
    name: "None",
    "id": 0,
    isActive: true
};

// STORY TYPE and ICONS
module.exports.WORK_ITEM_ICONS = {
    "Story": {
        icon: "fa-book-open cl-blue",
        default: true
    },
    "Task": {
        icon: "fa-clipboard-check"
    },
    "Bug": {
        icon: "fa-bug cl-danger"
    },
    "Epic": {
        icon: "fa-bolt taskIcon"
    },
}


//  STATUS FOR THE WORK ITEMS
// if we change the variable here, we need to change the fron-end js to in order to show the
// values in the dropdown select opction
module.exports.WORK_ITEM_STATUS = {
    "New":          {"class": "newColor", default: true},
    "Active":       {"class": "activeColor"}, 
    "Completed":    {"class": "completedColor"}, 
    "Deleted":      {"class": "delectedColor"}, 
    "Block":        {"class": "blockColor"}, 
    "Abandoned":    {"class": "abandonedColor"}
};

// MAX STORY POINTS
module.exports.MAX_STORY_POINTS = 500;
module.exports.MAX_PRIORITY_POINTS = 5;

// Max length of char for work item description
module.exports.MAX_LENGTH_DESCRIPTION = 1000;