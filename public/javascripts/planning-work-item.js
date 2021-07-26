/**
 * Front-end JS Code for planing-work-item route
 */


// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // show the active tab in the sidebar
    showActiveTab();

    checkTitleWhenOpen();

    // click on planing just to show to the user in the sidebar
    $(BTN_PLANING).click();

    
    /**
     * CHECKBOX FOR WORK ITEM TABLE 
     */
    $(document).on("click", TABLE_ROW_CHECKBOX_ELEMENT, function () {
        highliteWorkItemRow(this, this.checked);   
    });

       // CHECK ALL ROWS ELEMENT
    $(CHECK_ALL_CHECKBOX_TABLE_ROWS).on("click", function(){
        
        let isChecked = this.checked;

        enableTrashButton(isChecked);
        $(`${TABLE_ROW_CHECKBOX_ELEMENT}:visible`).each(function(){
            
            $(this).prop('checked', isChecked);
            
            highliteWorkItemRow(this, isChecked);
        });
        
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
    $(TRASH_BTN_WORK_ITEM).on("click", function(){
        
        // get checked elements in table
        const row_checked = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        const projectId = $(PROJECT_ID).val();
        
        removeWorkItems(projectId, row_checked);

        unCheckAll();
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
    // When title input is changed
    $(WORK_ITEM["title"]).on("input", function () {
        
        // Using functions from helper.js in order to show or hide the elements
        if ( (($(this).val()).length) > 0) {
            hideElement(spanTitleMsg);
        } else {
            showElement(spanTitleMsg);
        }
    });

    //  TEAM ON CHANGE
    $(WORK_ITEM["team"]).on("change", async function () {
        
        // check from where the change trigger is coming
        if (IS_UPDATE_SELECT_OPTION){
            console.log("Canceled on change");
            IS_UPDATE_SELECT_OPTION = false;
            return;
        }

        // clean select opction
        removeAllOptionsFromSelect(
            WORK_ITEM["sprint"], 
            null,
        );
        const teamId = $(this).val();
        const projectId = $(PROJECT_ID).val();

        if (!_.isString(teamId) || !_.isString(projectId) || teamId == "0"){
            $.notify("Invalid team was selected.", "error");
            return;
        }

        const API_LINK_GET_SPRINTS_FOR_TEAM = `/dashboard/api/${projectId}/getTeamSprints/${teamId}`;

        let response_error = null;
        const response = await make_get_request(API_LINK_GET_SPRINTS_FOR_TEAM).catch(err => {
            response_error = err;
        });
        
        // Success message
        if (response){

            if (response.sprints && response.sprints.length > 0){
                for (const sprint of response.sprints) {
                    updateSelectOption(
                        WORK_ITEM["sprint"], 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":sprint["name"]}
                    );
                }
            }else{
                $.notify("Sorry, it seems this team does not have sprints yet.", "error");
            }
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
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
            $(TAG_CONTAINER).append(TAG_TEMPLATE);
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

    // BACKLOG
    $(document).on("click", MOVE_TO_BACKLOG_BTN, function(){
        let workItemId = $(this).attr("rel");

        // get checked elements in table
        const workItems = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        if (_.isArray(workItems) && !_.isEmpty(workItems)){   
            moveWorkItemToSprint(workItems, 'backlog');
        }else{
            moveWorkItemToSprint([workItemId], 'backlog');
        }
        
    });

    // CURRENT
    $(document).on("click", MOVE_TO_CURRENT_SPRINT_BTN, function(){
        let workItemId = $(this).attr("rel");

        // get checked elements in table
        const workItems = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        if (_.isArray(workItems) && !_.isEmpty(workItems)){   
            moveWorkItemToSprint(workItems, 'current');
        }else{
            moveWorkItemToSprint([workItemId], 'current');
        }

    });

    // NEXT
    $(document).on("click", MOVE_TO_NEXT_SPRINT_BTN, function(){
        let workItemId = $(this).attr("rel");

        // get checked elements in table
        const workItems = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        if (_.isArray(workItems) && !_.isEmpty(workItems)){   
            moveWorkItemToSprint(workItems, 'next');
        }else{
            moveWorkItemToSprint([workItemId], 'next');
        }
    });

});

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
    const API_LINK_ADD_COMMENT = `/dashboard/api/${projectId}/addCommentToWorkItem/${workItemId}`;
    
    // check of comments
    if (comment.trim().length == 0){
        console.error("Cannot add empty comment");
        return;
    }

    // Data to make the request
    const request_data = {comment: comment.trim()}

    let response_error = null;
    const response = await make_post_request(API_LINK_ADD_COMMENT, request_data).catch(err=> {
        response_error = err;
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
        $.notify(response_error.data.responseText, "error");
    }
}

/**
 * Remove the work item from the project
 * @param {Array} workItemsId - Array with all work item ids 
 */
async function removeWorkItems(projectId, workItemsId){
    // TODO: maybe change this to the https: format? 
    const API_LINK_REMOVE_WORK_ITEMS =`/dashboard/api/${projectId}/removeWorkItems`;

    if (!workItemsId || workItemsId.length == 0){
        console.error("Cannot find the work items to remove");
        return;
    }

    const request_data = {workItemsId};

    let response_error = null;
    const response = await make_post_request(API_LINK_REMOVE_WORK_ITEMS, request_data).catch(err=> {
        response_error = err;
    });

    if (response){
        removeCheckedElement();

        $.notify(response, "success");

        // disable the trash button again
        enableTrashButton(false);
    }else{
        $.notify(response_error.data.responseText, "error");
    }
}

function checkTitleWhenOpen(){
    try{
        //  PRIOR check if the title has already something in it
        if ($(WORK_ITEM["title"]).val().length == 0){
            showElement(spanTitleMsg);
        }
    }catch(err) {

    }

}