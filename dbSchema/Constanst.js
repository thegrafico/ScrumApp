module.exports.projectStatus = ["New", "Active", "Completed", "Deleted", "Block", "Abandoned"];

module.exports.UNASSIGNED = {
    name: "unassigned",
    id: "0",
    selected: true
};

module.exports.UNASSIGNED_SPRINT = {
    name: "unassigned",
    _id: "0",
};

module.exports.userStatus = ["Active", "Inactive"];

// SPRINTS CONSTANTS
const ONE_WEEK = 7;
module.exports.SPRINT_DEFAULT_PERIOD_TIME = ONE_WEEK * 2; // TWO weeks sprint time
module.exports.SPRINT_TIME_PERIOD = {
    "One Week": ONE_WEEK, // Today - 6 days
    "Two Weeks": ONE_WEEK * 2, 
    "Three Weeks": ONE_WEEK * 3,
    "One Month": ONE_WEEK * 4,
    "Two Months": ONE_WEEK * 8,
};

module.exports.SPRINT_STATUS = {
    "Past": "Past", // Today - 6 days
    "Coming": "Coming", 
    "Active": "Active",
    "Due": "Due",
};

module.exports.SPRINT_FORMAT_DATE = "MM/DD/YYYY";
module.exports.ADD_SPRINT_TO_ALL_TEAM_ID = "ALL";


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
    SPRINT: "sprint",
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