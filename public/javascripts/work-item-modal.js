
/**
 *  Logic for work item modal 
*/
// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // ============== SELECT 2 ===================
    $(WORK_ITEM["user"]).select2();
    $(WORK_ITEM["team"]).select2();
    $(WORK_ITEM["sprint"]).select2();
    $(WORK_ITEM["priority"]).select2();
    // ===========================================

    // ADD COMMENT 
    // TODO: refactor this
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


    // When title input is changed
    $(WORK_ITEM["title"]).on("input", function () {
        
        // Using functions from helper.js in order to show or hide the elements
        if ( (($(this).val()).length) > 0) {
            hideElement(spanTitleMsg);
        } else {
            showElement(spanTitleMsg);
        }
    });


    // TEAM - CHANGE EVENT ON WORK ITEM
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


    // TYPE - CHANGE EVENT ON WORK ITEM
    $(BTN_CHANGE_WORK_ITEM_TYPE).on("click", function () {
        updateCustomSelect(this, CURRENT_WORK_ITEM_TYPE, WORK_ITEM["type"]);
    });


    // STATUS - CHANGE EVENT ON WORK ITEM
    $(BTN_CHANGE_WORK_ITEM_STATUS).on("click", function () {
        updateCustomSelect(this, CURRENT_WORK_ITEM_STATUS, WORK_ITEM["state"]);
    });


    // TAGS - work item
    $(addTagBtn).on("click", function () {

        // get number of element
        let childrens = ($(TAG_CONTAINER).children()).length;

        if (childrens <= MAX_NUMBER_OF_TAGS) {
            $(TAG_CONTAINER).append(TAG_TEMPLATE);
        } else {
            alert(`Each story cannot have more than ${MAX_NUMBER_OF_TAGS} tags`);
        }
    });


    // REMOVE TAGS - work item
    $(document).on("click", rmTag, function () {
        $(this).parent().remove();

        // Trigger the tags container in oder to active the save button
        $("#tagsContainer").trigger("change");
    });

    
    // clean the modal to add an user
    $(createWorkItemModal).on('shown.bs.modal', function (e) {
        $(WORK_ITEM["title"]).trigger("focus");
    });


    // clean the modal when opened
    $(createWorkItemModal).on('show.bs.modal', function (e) {
        cleanModal();
    });


    // CREATE WORK ITEM BTN
    $(CREATE_WORK_ITEM_FORM).on("submit", function(event){
        
        isFormValid = validateFormWorkItem();
        
        if (!isFormValid){
            event.preventDefault();
        }
    });

});