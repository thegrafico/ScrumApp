/**
 * Front-end JS Code for planing-work-item route
 */

const WORK_ITEM = {
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
};
const createWorkItemModal = ".createNewItemModal";

// Symbol to replaces
const REPLACE_SYMBOL = "???***";

const addTagBtn = "#addTagBtn";
const FILTER_BTN = "#filterBtn"
const TAG_CONTAINER = "#tagsContainer";
const spanTitleMsg = "#title-span-msg";
const rmTag = ".rmTag";

// WORK ITEM TYPE
const BTN_CHANGE_WORK_ITEM_TYPE = ".btnType";
const CURRENT_WORK_ITEM_TYPE = "#currentType";

// WORK ITEM STATUS
const BTN_CHANGE_WORK_ITEM_STATUS = ".btnWorkItemStatus";
const CURRENT_WORK_ITEM_STATUS = "#currentWorkItemStatus";

// CHECKBOX ROW ELEMENT IN TABLE
const TABLE_ROW_CHECKBOX_ELEMENT = ".checkboxRowElement";

// SAVE WORK ITEM BTN
const SAVE_WORK_ITEM_BTN = "#saveStatusBtn";

// TRASH CAN ICON
const TRASH_BTN = "#trashBtn"; 

// ADD COMMENT - BUTTON
const BTN_ADD_COMMENT = "#add-comment";

// WORK Item ID
const WORK_ITEM_ID = "#workItemId";

// PROJECT ID
const PROJECT_ID = "#projectId";

const CREATE_WORK_ITEM_FORM = "#createWorkItemForm";
const BTN_PLANING = "#Planing";

// TAG TEMPLATE FOR WORK ITEM
const TAG_TEMPLATE = `<span class="badge badge-secondary"> <input type="text" autocomplete="off" name="tags[]" placeholder="Enter tag " class='tagNme'> <span aria-hidden="true" class="rmTag">&times;</span>  </span>`;
const COMMENT_HTML_TEMPLATE = `<div> <textarea name="comments" id="comment-textarea" rows="4" placeholder="Add a comment for this story." class="bx-shadow">${REPLACE_SYMBOL}</textarea></div>`;
const USER_COMMENT_CONTAINER = ".user-comments-container";
const NUMBER_OF_COMMENTS_SPAN = "#numberOfCommentSpan";

const WORK_ITEM_TABLE = "#workItemTable";

const MAX_NUMBER_OF_TAGS = 4;
const MAX_LENGTH_TITLE = 80;
const HIGHLIGST_CLASS = "highligtRow";

// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // show the active tab in the sidebar
    showActiveTab();

    // click on planing just to show to the user in the sidebar
    $(BTN_PLANING).click();
    /**
     * CHECKBOX BOR WORK ITEM TABLE 
     */
    $(TABLE_ROW_CHECKBOX_ELEMENT).on("click", function(){
        
        // get the parent element. In this case, it will be the the label element
        let _parent = $( this ).parent();

        // since we are changing the whole row, we need the element that has everything inside
        let granFather = $(_parent).parent().parent();

        let atLeastOneCheckBoxIsChecked = ($(`${TABLE_ROW_CHECKBOX_ELEMENT}:checked`).length > 0);
    
        enableTrashButton(atLeastOneCheckBoxIsChecked);
        
        if (_parent.hasClass("invisible")){
            _parent.removeClass("invisible");
            granFather.addClass(HIGHLIGST_CLASS);
        }else{
            _parent.addClass("invisible");
            granFather.removeClass(HIGHLIGST_CLASS);
        }
    });

    // ADD COMMENT 
    $(BTN_ADD_COMMENT).on("click", function(){
        
        const comment = $(WORK_ITEM["discussion"]).val();
        const workItemId = $(WORK_ITEM_ID).val();
        const projectId = $(PROJECT_ID).val();
    
        if (workItemId == undefined || projectId == undefined){
            // TODO: add a message to the UI
            alert("There is a problem getting the information for this work item");
            return;
        }

        // TODO: clean text before inserting in database
        if ( (comment && comment.trim().length > 0)){
            addCommentToWorkItem(projectId, workItemId, comment.trim());
        }else{
            // TODO: show a message to the user that empty comment cannot be added
            alert("Cannot add an empty comment.")
        }
    });

    // REMOVE THE WORK ITEMS SELECTED IN CHECKBOX
    // TODO: Create a database modal to store deleted element
    $(TRASH_BTN).on("click", function(){
        
        let row_checked = []
        $(".checkboxRowElement:checked").each(function(){
            row_checked.push($(this).val())
        });

        const projectId = $(PROJECT_ID).val();
        removeWorkItems(projectId, row_checked);

    });

    // ==================== CLEANING THE MODAL WHEM OPEN =================

    // clean the modal to add an user
    $(createWorkItemModal).on('shown.bs.modal', function (e) {
        $(WORK_ITEM["title"]).trigger("focus");
    });

    $(createWorkItemModal).on('show.bs.modal', function (e) {
        cleanModal();
    });

    // ================== CHECKING TITLE ERRORS =================

    //  PRIOR check if the title has already something in it
    if ($(WORK_ITEM["title"]).val().length == 0){
        showElement(spanTitleMsg);
    }

    // When title input is changed
    $(WORK_ITEM["title"]).on("input", function () {
        
        // Using functions from helper.js in order to show or hide the elements
        if ( (($(this).val()).length) > 0) {
            hideElement(spanTitleMsg);
        } else {
            showElement(spanTitleMsg);
        }
    });

    /**
     * Event to change the type of the work item
     */
    $(BTN_CHANGE_WORK_ITEM_TYPE).on("click", function () {
        updateCustomSelect(this, CURRENT_WORK_ITEM_TYPE, WORK_ITEM["type"]);
    });

    /**
     * Event to change the status of the work item
     */
    $(BTN_CHANGE_WORK_ITEM_STATUS).on("click", function () {
        updateCustomSelect(this, CURRENT_WORK_ITEM_STATUS, WORK_ITEM["state"]);
    });

    // Add tag
    $(addTagBtn).on("click", function () {

        // get number of element
        let childrens = ($(TAG_CONTAINER).children()).length;

        if (childrens <= MAX_NUMBER_OF_TAGS) {
            $(TAG_CONTAINER).append(TAG_TEMPLATE)
        } else {
            alert(`Each story cannot have more than ${MAX_NUMBER_OF_TAGS} tags`);
        }
    });

    /**
     * Event to remove the tag when the user click the 'x' button
     */
    $(document).on("click", rmTag, function () {
        $(this).parent().remove();
        
        // Trigger the tags container in oder to active the save button
        $("#tagsContainer").trigger("change");
    });

    $(CREATE_WORK_ITEM_FORM).on("submit", function(event){
        isFormValid = validateFormWorkItem();
        
        if (!isFormValid){
            event.preventDefault();
        }
    });

    // TOGGLE THE FILTER
    $(FILTER_BTN).on("click", function() {
        toggleFilter()
    });

});


// TODO: this function does exist in the backlog - refactor
function cleanModal() {

    // reset title
    $(WORK_ITEM["title"]).val("");
    $(spanTitleMsg).removeClass("d-none");

    // reset assigned user
    $(WORK_ITEM["user"]).val(0);

    // reset tags
    $(`${TAG_CONTAINER} span`).remove();

    // reset state
    // TODO: set the default value to be the firts from an array from CONSTANTS.js
    $(WORK_ITEM["state"]).val("New");

    // Reset description
    $(WORK_ITEM["description"]).val("");

    // reset points
    $(WORK_ITEM["points"]).val("");

    // reset priority
    $(WORK_ITEM["priority"]).val("");

    // reset discussion
    $(WORK_ITEM["discussion"]).val("");


    // TODO: reset links
    // TODO: reset type
    // TODO: reset team depending on the user's team
    // TODO: reset sprint depending on the current sprint
}

/**
 * 
 * @param {Object} currentElement - this element - current element
 * @param {String} tagCurrentItem - current tag item for the html
 * @param {String} tagInputItem - hidden input tag
 */
function updateCustomSelect(currentElement, tagCurrentItem, tagInputItem){
    // // get the current element
    // let currentIcon = $(tagCurrentItem).html();        

    // get the clicked element
    let clickedIcon = $(currentElement).html();
    let selecteTextValue = $(currentElement).text().trim().toLowerCase();

    // store the current element in a temporal variable
    // let temp = currentIcon;

    // clean the current element and change it with the clicked
    $(tagCurrentItem).empty().html(clickedIcon);

    // add the temporal element into the select options
    // $(currentElement).empty().html(temp)

    $(tagInputItem).val(selecteTextValue).trigger("change");
}

/**
 * This funtion validates the form to create a new WorkItem
 */
// TODO: change alert for other better ui messages
function validateFormWorkItem(){

    const title = $(WORK_ITEM["title"]).val().trim();
    // const state = $(WORK_ITEM["state"]).val();
    // const teamId = $(WORK_ITEM["team"]).val();
    // const type = $(WORK_ITEM["type"]).val();
    // const sprint = $(WORK_ITEM["sprint"]).val();
    const description = $(WORK_ITEM["description"]).val();
    const points = $(WORK_ITEM["points"]).val();
    const priority = $(WORK_ITEM["priority"]).val();

    // console.log(`POINTS: ${points}, Priority: ${priority}`);
   
    // Validate title
    if (title.length < 3){
        alert("Title cannot be less than 3 chars");
        return false;
    }

    // validate points
    if (!validator.isEmpty(points) && isNaN(points)){
        alert("Points only accept numbers");
        return false;
    }

     // validate priority
     if (!validator.isEmpty(priority) && isNaN(priority)){
        alert("Priority only accept numbers");
        return false;
    }

    return true;
}

/**
 * Enable the functionality for the trash button
 * @param {Boolean} enable - True if wants to enable the trash button, false if wants to disable
 */
function enableTrashButton(enable){
    
    if (enable){
        $(TRASH_BTN).attr("disabled", false);
        $(`${TRASH_BTN} i`).removeClass("grayColor");
        $(`${TRASH_BTN} i`).addClass("redColor");
    }else{
        $(TRASH_BTN).attr("disabled", true);
        $(`${TRASH_BTN} i`).removeClass("redColor");
        $(`${TRASH_BTN} i`).addClass("grayColor");
    }
}

/**
 * Add a comment to a work item for a project
 * @param {String} projectId 
 * @param {String} workItemId 
 * @param {String} comment 
 */
async function addCommentToWorkItem(projectId, workItemId, comment){
    
    if (projectId == undefined || workItemId == undefined){
        // TODO: add error message to the user
        alert("Error getting the paramenters to add the comment to work item");
        return;
    }

    // link to make the request
    const api_link_add_comment = `/dashboard/api/${projectId}/addCommentToWorkItem/${workItemId}`;
    
    // check of comments
    if (comment.trim().length == 0){
        console.error("Cannot add empty comment");
        return;
    }

    // Data to make the request
    const request_data = {comment: comment.trim()}

    const response = await make_post_request(api_link_add_comment,request_data).catch(err=> {
        console.error("Error adding the comment: ", err);
    });
    
    if (response){
        // since the request is done (Success), we can add the html 
        const comment_html = COMMENT_HTML_TEMPLATE.replace(REPLACE_SYMBOL, comment);
        addToHtml(USER_COMMENT_CONTAINER, comment_html); // Helper function

        // update the number of comments
        let currentNumberOfComments = parseInt($(NUMBER_OF_COMMENTS_SPAN).text().trim());
        $(NUMBER_OF_COMMENTS_SPAN).text(++currentNumberOfComments);

        // clean the textarea for the user
        $(WORK_ITEM["discussion"]).val('');
    }else{
        // TODO: add error message to the user 
    }
}

/**
 * Remove the work item from the project
 * @param {Array} workItemsId - Array with all work item ids 
 */
async function removeWorkItems(projectId, workItemsId){
    // TODO: maybe change this to the https: format? 
    const api_link_remove_work_items =`/dashboard/api/${projectId}/removeWorkItems`;

    if (!workItemsId || workItemsId.length == 0){
        console.error("Cannot find the work items to remove");
        return;
    }

    const request_data = {workItemsId};

    const response = await make_post_request(api_link_remove_work_items, request_data).catch(err=> {
        console.error("Error adding the comment: ", err);
    });

    if (response){
        $(".checkboxRowElement:checked").parent().parent().parent().each(function(){
           $(this).remove();
        });

        // disable the trash button again
        enableTrashButton(false);
    }else{
        // TODO: show error message to the user
    }
}