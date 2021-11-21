
// TAG TEMPLATE FOR WORK ITEM
const TAG_TEMPLATE = `<span class="badge badge-secondary"> <input type="text" autocomplete="off" name="tags[]" placeholder="Enter tag" class='tagNme'> <span aria-hidden="true" class="rmTag">&times;</span>  </span>`;
const UPDATE_TAG_TEMPLATE = `<span class="badge badge-secondary"> <input type="text" autocomplete="off" name="tags[]" placeholder="Enter tag" class='update-work-item-tags'> <span aria-hidden="true" class="rmTag">&times;</span>  </span>`;

// Work item schema - all values that change from work item are in here
const WORK_ITEM = {
    // FOR WORK ITEM
    title: "#new-item-title",
    user: "#assignedUser",
    state: "#workItemStatus",
    team: "#teamAssigned",
    type: "#workItemType",
    description: "#description-textarea",
    points: "#workItemPoints",
    sprint: "#sprints",
    priority: "#workItemPriority",
    discussion: "#comment-textarea",
    tags: ".tagNme",

    current_type: "#currentType",
    current_status: "#currentWorkItemStatus",

    // OTHER DATA VALUES
    title_span_msg: "#title-span-msg",
    btn_add_comment: "#add-comment", 
    btn_change_type: ".btnType",
    btn_change_status: ".btnWorkItemStatus",
    btn_add_tags: "#addTagBtn",
    btn_remove_tag: ".rmTag",
    number_of_comments: "#numberOfCommentSpan",
    subId: null,
    btn_remove_relationship: ".remove-relationship-btn",

    // CONTAINERS
    tag_container: ".tagsContainer",
    tag_template: TAG_TEMPLATE,
    relationship_container : ".create-work-item-relationship-container",

    // Modal Id
    modal_id :".createNewItemModal",

    // ADD LINK
    add_link: ".open-add-links-options"
};

// same as work item but for the update part
const UPDATE_WORK_ITEM = {
    // FOR WORK ITEM
    title: "#update-work-item-title",
    user: "#update-assigned-user",
    state: "#update-work-item-status",
    team: "#update-work-item-team",
    type: "#update-work-item-type",
    description: "#update-work-item-description",
    points: "#update-work-item-points",
    sprint: "#update-work-item-sprints",
    priority: "#update-work-item-priority",
    discussion: "#update-work-item-comments",
    tags: ".update-work-item-tags",

    // OTHER VALUES
    title_span_msg: "#update-title-span-msg",
    btn_add_comment: "#update-add-comment",
    btn_change_type: ".update-btn-type",
    btn_change_status: ".update-btn-status",
    btn_add_tags: "#udpate-add-tags-btn",
    btn_remove_tag: ".rmTag",
    subId: "#update-work-item-sub-id",
    number_of_comments: "#update-number-of-comments",
    btn_remove_relationship: ".remove-relationship-btn",

    current_type: "#update-current-type",
    current_status: "#update-current-work-item-status",

    // CONTAINERS
    tag_container: ".update-tags-container",
    tag_template: UPDATE_TAG_TEMPLATE,
    relationship_container: ".update-work-item-relationship-container",
    type_container: "#update-work-item-type-container",

    // Modal Id
    modal_id: ".work-item-information",

    // ADD LINK
    add_link: ".open-add-links-options"
};

// attribute for the work item id
const ATTR_WORK_ITEM_ID = "data-workitem-id";
const ATTR_WORK_ITEM_NAME = "data-workitem-name";

// create work item submit btn
const CREATE_WORK_ITEM_SUBMIT_BTN = "#create-work-item-submit-btn";
const UPDATE_WORK_ITEM_USER_COMMENT = ".update-user-comment-container";

const WORK_ITEM_ICONS = {
    "Story": {
        icon: "fa-book-open cl-blue",
        default: true
    },
    "Task": {
        icon: "fa-clipboard-check"
    },
    "Research": {
        icon: "far fa-newspaper"
    },
    "Bug": {
        icon: "fa-bug cl-danger"
    },
    "Epic": {
        icon: "fa-bolt taskIcon"
    },
}

// ============ WORK ITEM =============
const WORK_ITEM_STATUS = {
    "New":          "New",
    "Active":       "Active",
    "Review":       "Review",
    "Completed":    "Completed", 
    "Block":        "Block", 
    "Abandoned":    "Abandoned"
};

const WORK_ITEM_STATUS_COLORS = {
    "New":          {"class": "newColor", default: true},
    "Active":       {"class": "activeColor"}, 
    "Review":       {"class": "reviewColor"}, 
    "Completed":    {"class": "completedColor"}, 
    "Block":        {"class": "blockColor"}, 
    "Abandoned":    {"class": "abandonedColor"}
};
// =============================

// to keep track which modal is open for the user
const WORK_ITEM_MODALS = {
    create: {
        value: "create", 
        container: ".create-work-item-relationship-container",
        workItemTeamId: null, // Create work item does not have id
    },
    update: {
        value: "update", 
        container: ".update-work-item-relationship-container",
        workItemTeamId: UPDATE_WORK_ITEM["subId"]
    }
}

const CREATE_WORK_ITEM_MODAL = "#create-work-item-modal";
const CREATE_WORK_ITEM_CLOSE_BTN = "#close-create-work-item";
const UPDATE_WORK_ITEM_MODAL = "#update-work-item-modal";
// const createWorkItemModal = ".createNewItemModal";

// Symbol to replaces
const REPLACE_SYMBOL = "???***";

const addTagBtn = "#addTagBtn";
const FILTER_BTN = "#filterBtn"
const TAG_CONTAINER = ".tagsContainer";
const spanTitleMsg = "#title-span-msg";
const rmTag = ".rmTag";

// WORK ITEM TYPE
const BTN_CHANGE_WORK_ITEM_TYPE = ".btnType";
const CURRENT_WORK_ITEM_TYPE = ".currentType";

// REMOVE COMMENT FROM WORK ITEM
const REMOVE_COMMENT_WORK_ITEM_BTN = ".removeCommentIcon";
const WORK_ITEM_COMMENT_CONTAINER = ".work-item-comment";

// WORK ITEM STATUS
const BTN_CHANGE_WORK_ITEM_STATUS = ".btnWorkItemStatus";
const CURRENT_WORK_ITEM_STATUS = ".currentWorkItemStatus";

// CHECKBOX ROW ELEMENT IN TABLE
const TABLE_ROW_CHECKBOX_ELEMENT_CONTAINER = ".tableCheckBoxRowElement";
const TABLE_ROW_CHECKBOX_ELEMENT = ".checkboxRowElement";
const TABLE_ROW_CHECKBOX_ELEMENT_CHECKED = ".checkboxRowElement:checked";

const CHECK_ALL_CHECKBOX_TABLE_ROWS = "#checkAllTableRow";

// FILTER TEAMS
const FILTER_BY_TEAM_INPUT = "#filterByTeam";
const FILTER_BY_TEAM_GENERAL_CLASS = ".seletedTeamToFilter";
const FILTER_BY_TEAM_MANAGE_INPUT = "#manage-filter-by-team";

// SAVE WORK ITEM BTN
const SAVE_WORK_ITEM_BTN = "#saveStatusBtn";
const SAVE_UPDATE_WORK_ITEM_BTN = ".saveUpdateWorkItem";

const COMPLETED_WORK_ITEM_MESSAGE = ".completedWorkItemsMsg";

// MODAL TO REMOVE USER INPUT
const REMOVE_USER_MODAL_INPUT = "#modal-remove-user-select-user";

// TRASH CAN ICON
const TRASH_BTN_WORK_ITEM = "#trashBtnWorkItem";
const TRASH_BTN_MANAGE = "#trashBtnManage";
const TRASH_BTN_GENERAL_CLASS = ".trash-btn";

// ADD COMMENT - BUTTON
const BTN_ADD_COMMENT = "#add-comment";

// WORK Item ID
const WORK_ITEM_ID = "#workItemId";

// PROJECT ID
const PROJECT_ID = "#projectId";

const CREATE_WORK_ITEM_FORM = "#createWorkItemForm";
const BTN_PLANING = "#Planing";


const COMMENT_HTML_TEMPLATE = `<div> <textarea name="comments" class=" bx-shadow addCommentBox" rows="4" placeholder="Add a comment for this work item.">${REPLACE_SYMBOL}</textarea></div>`;
const USER_COMMENT_CONTAINER = ".user-comments-container";
const NUMBER_OF_COMMENTS_SPAN = "#numberOfCommentSpan";
const WORK_ITEM_COMMENT_BOX = ".userCommentBox";

// TAGS template for adding
const ADD_TAG_TEMPLATE = `<span class="badge badge-secondary"> <input type="text" name="tags[]" autocomplete="off" value="${REPLACE_SYMBOL}" placeholder="Enter tag " class='update-work-item-tags'> <span aria-hidden="true" class="rmTag">&times;</span></span>`;

const WORK_ITEM_TABLE = "#workItemTable";

const MAX_NUMBER_OF_TAGS = 4;
const MAX_LENGTH_TITLE = 80;
const MIN_LENGTH_TITLE = 3;
const MAX_PRIORITY_POINTS = 5;
const MAX_LENGTH_DESCRIPTION = 500;

const HIGHLIGST_CLASS = "highligtRow";

// DELETE TEAM CONSTASNT
const DELETE_TEAM_SUBMIT_BTN = "#delete-team-submit-btn";
const DELETE_TEAM_SELECT_INPUT = "#listOfTeams";

const MANAGE_TABLE_ID = "#manage-table";
const CURRENT_PAGE_ID = "#current-page";

const UPDATE_TYPE = {ADD: "ADD", DELETE: "DELETE", CHANGE: "CHANGE"};
const UPDATE_INPUTS = {USER: "USER", TEAM: "TEAM", SPRINT: "SPRINT", CREATE_WORK_ITEM: "WORK_ITEM"};

// find a way to create this in only one place. // also in db constants
const PAGES = {
    STATISTICS: "statistics",
    WORK_ITEMS: "workItems",
    UNIQUE_WORK_ITEM: "workItem",
    BACKLOG: "sprintBacklog",
    SPRINT: "sprintPlaning",
    SPRINT_BOARD: "sprintBoard",
    MANAGE_TEAM: "manageTeam",
    MANAGE_USER: "manageUser",
    MANAGE_SPRINT: "manageSprint",
    QUERIES: "queries",
}

const INVALID_SYMBOLS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;


// Background color for project initials in dashboard
const PROJECT_INITIALS_COLORS = [
    "#2f4d6c",
    "#2c81ba",
    "#15aabf",
    "#822bad",
    "#2487b6",
    "#b32e6f",
    "#5e38a4",
    "#3ab8c5"
];


// REMOVE CONFIRMATION MODAL
const REMOVE_CONFIRMATION_MODAL = "#remove-confirmation-modal";
const REMOVE_CONFIRMATION_TITLE = "#remove-confirmation-title";
const REMOVE_CONFIRMATION_BODY_TEXT = "#remove-confirmation-body-text";
const REMOVE_CONFIRMATION_SUBMIT_BTN = "#remove-confirmation-submit-btn";
const REMOVE_CONFIRMATION_HIDDEN_INPUT = "#remove-confirmation-id-input";
const REMOVE_OPTION_HIDDEN_INPUT = "#remove-option-to-remove";

const REMOVE_OPTIONS = {
    WORK_ITEMS: "1",
    USERS: "2",
    TEAMS: "3",
    SPRINTS: "4",
    TEAM_USER: "5",
    WORK_ITEM_COMMENT: "6",
}

//  ======= SPRINT

const SPRINT_FORMAT_DATE = "MM/DD/YYYY";

const FILTER_BY_SPRINT_INPUT = "#filterBySprint";
const FILTER_BY_TEAM_SPRINT = "#filter-by-team-sprint";

// CREATE MODAL
const SPRINT_CREATE_MODAL_TEAM_INPUT = "#sprint-team-input";

// DELETE MODAL
const SPRINT_DELETE_MODAL_SELECT_TEAM = "#modal-remove-sprint-select-team";
const SPRINT_DELETE_MODAL_SELECT_SPRINT = "#modal-remove-sprint-select-sprint";
const SPRINT_DELETE_MODAL = "#remove-sprint-modal";

const SPRINT_FILTER_BY_SPRINT_SELECT = "#filterBySprint";

// GENERAL
const SPRINT_TIME_PERIDO_INPUT_ID = "#sprint-time-period";
const ONE_WEEK = 7;
const SPRINT_TIME_PERIOD = {
    "One Week": ONE_WEEK,
    "Two Weeks": ONE_WEEK * 2, 
    "Three Weeks": ONE_WEEK * 3,
    "One Month": ONE_WEEK * 4,
    "Two Months": ONE_WEEK * 8,
};

const SPRINT_STATUS = {
    "Past": "Past", // Today - 6 days
    "Coming": "Coming", 
    "Active": "Active",
};

const UNNASIGNED_VALUE = "0";
const UNNASIGNED_NAME = "unassigned";
const INVALID_OPTION_VALUE = "-1";

const UNASSIGNED_SPRINT = {
    name: "unassigned",
    _id: "0",
};

const MOVE_TO_BACKLOG_BTN = ".moveToBacklog";
const MOVE_TO_CURRENT_SPRINT_BTN = ".moveToCurrentSprintBtn";
const MOVE_TO_NEXT_SPRINT_BTN = ".moveToNextSprintBtn";


const MOVE_TO_SUB_MENU_SPRINT_ITEM = ".subMenuSprintItem";
const OPEN_WORK_ITEM_SUB_MENU_BTN = ".workItemOpenSubMenu";
// for the scroll bar in the sub menu for moving work item to differents sprints
let SCROLL_TO_CURRENT_SPRINT_ONCE = false;

// if the function "updateSelectOption" changes, then this variable becomes true
let IS_UPDATE_SELECT_OPTION = false;
// =========== END

// ===== FILTERS ==========
const FILTER_OPTIONS = {
    user: "#filter-by-user",
    type: "#filter-by-type",
    status: "#filter-by-status",
    team: "#filter-by-teams",
};
const FILTER_BY_USER_CONTAINER = "#filter-by-user";
const FILTER_BY_TYPE_CONTAINER = "#filter-by-type";
const FILTER_BY_STATUS_CONTAINER = "#filter-by-status";
const FILTER_BY_TEAMS_CONTAINER = "#filter-by-teams";

const CURRENT_USER_ID = "#current-user-id";

const PRIORITY_POINTS = {
    "Low": 1,
    "Median": 2,
    "High": 3,
    "Highest": 4,
    "Critical": 5,
};

// RIGHT SIDE NAVBAR
const RIGHT_SIDE_NAVBAR_ID = "#right-sidebar";
// RELATIONSHIP WORK ITEM ID HIDDEN INPUT
const RELATIONSHIP_WORK_ITEM_ID = ".relationship-workitem-id";
const RELATIONSHIP_WORK_ITEM_CONTAINER = ".work-item-relationship-container";
const WORK_ITEM_RELATIONSHIP = {
    RELATED:        {value: 1, text: "Is Related to",   title: "Related"},
    CHILD:          {value: 2, text: "Is Child of",     title: "Child"}, 
    PARENT:         {value: 3, text: "Is Parent of",    title: "Parent"}, 
    DUPLICATE:      {value: 4, text: "Is Duplicate by", title: "Duplicate by"}, 
    BLOCKED:        {value: 5, text: "Is Blocked By",   title: "Blocked by"},
    DUPLICATE_FROM: {value: 6, text: "Is Duplicating",  title: "Duplicating"},
    BLOCKING:       {value: 7, text: "Is Blocking",     title: "Bloking"}
};

// =========== QUERY DATA ===========
const QUERY_OPERATOR = {
    EQUAL: "=",
    NOT_EQUAL: "<>",
    GREATER: ">",
    LESS: "<",
    GREATER_EQUAL: ">=",
    LESS_EQUAL: "<=",
    CONTAINS: "Contains",
    DOES_NOT_CONTAINS: "Does Not Contain",
    IN: "In",
    NOT_IN: "Not In",
    IS_EMPTY: "Is Empty",
    NOT_EMPTY: "Is Not Empty",
}

const QUERY_FIELD = {
    ID:                     {text: "Work Item Id", dbField: "itemId"},
    WORK_ITEM_TITLE:        {text: "Work Item Title", dbField: "title"},
    ASSIGNED_USER:          {text: "Assigned User", dbField: "assignedUser"},
    STORY_POINTS:           {text: "Story Points", dbField: "storyPoints"},
    PRIORITY_POINTS:        {text: "Priority", dbField: "priorityPoints"},
    WORK_ITEM_STATUS:       {text: "Work Item Status", dbField: "status"},
    TEAM:                   {text: "Team", dbField: "team"},
    WORK_ITEM_TYPE:         {text: "Work Item Type", dbField: "type"},
    WORK_ITEM_DESCRIPTION:  {text: "Work Item Description", dbField: "description"},
    TAGS:                   {text: "Tags", dbField: "tags"},
    COMMENTS:               {text: "Comments", dbField: "comments"},
    WORK_ITEM_CREATION:     {text: "Work Item Creation Date", dbField: "createdAt"},
    SPRINT_NAME:            {text: "Sprint Name", dbField: "name"},
    SPRINT_START_DATE:      {text: "Sprint Start Date", dbField: "startDate"},
    SPRINT_END_DATE:        {text: "Sprint End Date", dbField: "endDate"},
    SPRINT_STATUS:          {text: "Sprint Status", dbField: "status"},
    SPRINT_POINTS:          {text: "Sprint Points", dbField: "initialPoints"}
}

const QUERY_LOGICAL_CONDITION = {
    AND: "And",
    OR: "Or"
}

const QUERY_SPECIAL_VALUE = "[ANY]";

// EDIT USER IN MANAGE
const USER_PRIVILEGES = {
    "MEMBER": "Member",
    "SCRUM_MASTER": "Scrum Master",
    "PRODUCT_OWNER": "Product Owner",
};
// =========================

// NOTIFICATIONS
const NOTIFICATION_TYPES = {
    "PROJECT_INVITATION": "PROJECT_INVITATION",
    "TEAM_ADDED": "TEAM_ADDED",
    "MENTIONED": "MENTIONED",
    "ASSIGNED_WORK_ITEM": "ASSIGNED_WORK_ITEM",
    "WORK_ITEM_UPDATED": "WORK_ITEM_UPDATED",
}

const NOTIFICATION_STATUS = {
    "NEW": "NEW",
    "ACTIVE": "ACTIVE",
    "INACTIVE": "INACTIVE",
};

const NUMBER_OF_NEW_NOTIFICATIONS = "#number-of-notifications";
// ========

const NOTIFY = {

    isShowm: false,
    showGlobalNotification: function (message, position="right botton", autoHide=false){
        
        if (!this.isShowm){
            $.notify({
                text: message,
            }, { 
                style: 'custom',
                autoHide: autoHide,
                position: position
            });
            this.isShowm = true;
        }else{
            this.updateNotifyText(message);
        }
    },
    hideGlobalNotifyMsg: function(){
        this.isShowm = false;
        $('.notifyjs-custom-base').trigger("notify-hide");
    },

    updateNotifyText: function(text){
        $('.notifyjs-custom-base .text').text(text);
    }
}