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
// TODO: add this to the database since other files is using it too
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

// max number of tags per work item
module.exports.MAX_NUMBER_OF_TAGS_PER_WORK_ITEM = 4;

module.exports.MAX_LENGTH_TITLE = 80;

// MAX STORY POINTS
module.exports.MAX_STORY_POINTS = 500;
module.exports.MAX_PRIORITY_POINTS = 5;

// Max length of char for work item description
module.exports.MAX_LENGTH_DESCRIPTION = 1000;

// TEAM NAME LIMITS
module.exports.TEAM_NAME_LENGHT_MAX_LIMIT = 20;
module.exports.TEAM_NAME_LENGHT_MIN_LIMIT = 3;

module.exports.PRIORITY_POINTS = {
    "Low": 1,
    "Median": 2,
    "High": 3,
    "Highest": 4,
    "Critical": 5,
};

module.exports.PAGES = {
    STATISTICS: "statistics",
    WORK_ITEMS: "workItems",
    UNIQUE_WORK_ITEM: "workItem",
    BACKLOG: "backlog",
    MANAGE_TEAM: "manageTeam",
    MANAGE_USER: "manageUser",
    MANAGE_SPRINT: "manageSprint", 
}

/**
 * Capitalize a String
 * @param {String} s 
 * @returns {String} capizalize string
 */
module.exports.capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}