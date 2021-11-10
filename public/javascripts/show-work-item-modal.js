/**
 * Front-end JS Code for showing the work item when the user clicks on the link
 */

const OPEN_WORK_ITEM_MODAL = ".open-existing-work-item-modal";
const WORK_ITEM_MODAL = ".work-item-information";
const CLOSE_WORK_ITEM_MODAL = ".close-modal-button"
// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {


    // OPEN MODAL AND POPULATE DATA
    $(document).on("click", OPEN_WORK_ITEM_MODAL, function(event){
        // check if the ctrl key is pressed while the element is also pressed
        let ctrlIsPressed = event.metaKey | event.ctrlKey;
        // Open the modal if the user is not pressing clrt
        if (!ctrlIsPressed){   
            // prevent the link to open in another tab
            event.preventDefault();

            // the work item url
            let workItemId = $(this).attr("rel");
            
            // need update this in order to send the reques to the good URL
            $(WORK_ITEM_ID).val(workItemId);

            populateWorkItemModal(workItemId);

            $(WORK_ITEM_MODAL).modal("toggle");
        }

    });

    // CLOSE MODAL
    $(CLOSE_WORK_ITEM_MODAL).on("click", function(){
        $(WORK_ITEM_MODAL).modal("hide");
        $(WORK_ITEM_ID).val(UNNASIGNED_VALUE);
    });

    // close select2 in case is still open
    $(WORK_ITEM_MODAL).on('hide.bs.modal', function (e) {
        $(UPDATE_WORK_ITEM["user"]).select2('close');
        $(UPDATE_WORK_ITEM["team"]).select2('close');
        $(UPDATE_WORK_ITEM["sprint"]).select2('close');
        $(UPDATE_WORK_ITEM["priority"]).select2('close');

        // In case right side is open
        $(RIGHT_SIDE_NAVBAR_ID).hide("slow");
    });

});



/**
 * populate the modal with the work item information
 * @param {String} workItemId 
 * 
 */
async function populateWorkItemModal(workItemId){
    
    if (!_.isString(workItemId)){
        $.notify("Sorry, There was a problem getting the work item information. Please open in new tab.", "error");
        return;
    }

    let workItemResponse = await getWorkItemData(workItemId).catch(err => {
        console.error(err);
    });

    // check for errors
    if (workItemResponse["error"]){
        $.notify(workItemResponse["error"].data.responseJSON.msg, "error");
        return;
    }

    const workItem = workItemResponse["response"]["workItem"];
    const sprints = workItemResponse["response"]["sprints"];
    const activeSprint = workItemResponse["response"]["activeSprint"] || "";

    if (_.isUndefined(workItem) || _.isNull(workItem)){
        $.notify("Sorry, Cannot find the work item information", "error");
        return;
    }

    const assignedUserId =  workItem["assignedUser"]["id"] || "0";

    // SUB ID
    $(UPDATE_WORK_ITEM["subId"]).text(workItem["itemId"]);

    // TITLE
    $(UPDATE_WORK_ITEM["title"]).val(workItem["title"]);

    // STATUS
    const status = workItem["status"];
    $(`${UPDATE_WORK_ITEM["btn_change_status"]} span.${status}`)[0].click();
    
    let type = workItem["type"];
    $(`${UPDATE_WORK_ITEM["btn_change_type"]} span.${type}`)[0].click();

    // TEAM
    IS_UPDATE_SELECT_OPTION = true; // enable to  make a request when changin the team select
    $(UPDATE_WORK_ITEM["team"]).val(workItem["teamId"] || "0").change();

    // DESCRIPTION
    $(UPDATE_WORK_ITEM["description"]).val(workItem["description"]);

    // POINTS
    $(UPDATE_WORK_ITEM["points"]).val(workItem["storyPoints"]);

    // Priority
    $(UPDATE_WORK_ITEM["priority"]).val(workItem["priorityPoints"]).change();

    // Cleaning tags
    $(`${UPDATE_WORK_ITEM["tag_container"]} span`).remove();

    // ASSIGNED USER
    $(UPDATE_WORK_ITEM["user"]).val(assignedUserId).change();

    // Adding TAGS
    for (const tag of workItem["tags"]) {
        const html_tag = ADD_TAG_TEMPLATE.replace(REPLACE_SYMBOL, tag);
        $(UPDATE_WORK_ITEM["tag_container"]).append(html_tag);
    }

    // SPRINTS
    // clean sprint
    removeAllOptionsFromSelect(UPDATE_WORK_ITEM["sprint"], null);
    // add sprint
    for (const sprint of sprints) {
        let isSelected = (sprint["_id"].toString() === activeSprint.toString());
        
        let isActive =  sprint["status"] === "Active";
        
        let selectedText = sprint["name"];
        
        if (sprint["startDateFormated"] && sprint["endDateFormated"]){
            selectedText += `: ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]}`;
        }

        if (isActive){
            selectedText += " (current)";
        }

        updateSelectOption(
            UPDATE_WORK_ITEM["sprint"], 
            UPDATE_TYPE.ADD,
            {text: selectedText, value: sprint["_id"]},
            isSelected
        );
    }    

    // add update number of comments
    $(UPDATE_WORK_ITEM["number_of_comments"]).text(workItem["comments"].length);

    // Add comments
    $(UPDATE_WORK_ITEM_USER_COMMENT).empty();
    for (let comment of workItem["comments"]){
        // since the request is done (Success), we can add the html 
        const comment_html = COMMENT_HTML_TEMPLATE.replace(REPLACE_SYMBOL, comment);
        addToHtml(UPDATE_WORK_ITEM_USER_COMMENT, comment_html); // Helper function
    }

    // update link attribute
    $(UPDATE_WORK_ITEM["add_link"]).attr(ATTR_WORK_ITEM_ID, workItem["itemId"]);
    $(UPDATE_WORK_ITEM["add_link"]).attr(ATTR_WORK_ITEM_NAME, workItem["title"]);
    
    // Update Icon to remove relationship
    $(UPDATE_WORK_ITEM["btn_remove_relationship"]).attr(ATTR_WORK_ITEM_ID, workItem["_id"]);

    // clean links as default
    cleanElement($(WORK_ITEM_MODALS["update"]["container"]));
    // check if work item has links

    console.log(workItem);
    console.log(workItem["relatedWorkItems"]);

    if (workItem["relatedWorkItems"] && Object.keys(workItem["relatedWorkItems"]).length > 0){
        console.log("related work item found");
        for (let relationKey of Object.keys(workItem["relatedWorkItems"])){
            // add to modad
            addRelationshipToWorkItemModal(
                workItem["relatedWorkItems"][relationKey], 
                relationKey, 
                WORK_ITEM_MODALS["update"]["container"]
            );
        }
    }

    resetWorkItemState();
    activeSaveButton();
    setWorkItemState();

    let isCompletedWorkItem = (status == "Completed");

    makeWorkItemUpdatableIfNotCompleted(UPDATE_WORK_ITEM, isCompletedWorkItem);
}

/**
 * Make the work item updatable, meaning it can be update. 
 * @param {Boolean} makeItUpdatable - if true work item can be saved. 
 */
function makeWorkItemUpdatableIfNotCompleted(workItemInputs, workItemIsCompleted){

    const disabledClass = "addDisabled";
    const addDisabledAttr = [
        workItemInputs["title"],
        workItemInputs["user"],
        workItemInputs["btn_add_tags"],
        workItemInputs["team"],
        workItemInputs["sprint"],
        workItemInputs["description"],
        workItemInputs["points"],
        workItemInputs["priority"],
    ];

    const select2Ids = [
        workItemInputs["current_type"],
        "#select2-update-assigned-user-container",
        "#select2-update-work-item-team-container",
        "#select2-update-work-item-sprints-container",
        "#select2-update-work-item-priority-container"
    ];

    // disabled the work item if is completed 
    if (workItemIsCompleted){
        
        // Add the disabled attribute
        for (let input of addDisabledAttr){
            $(input).attr("disabled", true);
            $(input).addClass(disabledClass);
        }

        // since type is a custom input, we need to disabled this way
        $(workItemInputs["type_container"]).find(".dropdown-menu").addClass("d-none")

        // add css style class to select2 elements
        for (let input of select2Ids){
            $(input).addClass(disabledClass);
        }
       
        $(COMPLETED_WORK_ITEM_MESSAGE).removeClass("d-none");
    }else{ // the work item is not completed
     
        // remove the disabled attribute
        for (let input of addDisabledAttr){
            $(input).attr("disabled", false);
            $(input).removeClass("addDisabled");
        }

        // since type is a custom input, we need to disabled this way
        $(workItemInputs["type_container"]).find(".dropdown-menu").removeClass("d-none")

        // remove css style class to select2 elements
        for (let input of select2Ids){
            $(input).removeClass(disabledClass);
        }
        $(COMPLETED_WORK_ITEM_MESSAGE).addClass("d-none");
    }
}

/**
 * 
 * @param {String} workItemId - id of the work item 
 * @returns {object}
 */
async function getWorkItemData(workItemId){
    
    let response = {error:null};
    let projectId = getProjectId();

    if (!_.isString(projectId) || _.isEmpty(projectId)){
        $.notify("Sorry, Cannot find the Project information at this moment. Try later.", "error");
        return;
    }

    const API_LINK_GET_WORK_ITEM= `/dashboard/api/${projectId}/getWorkItem/${workItemId}`;

    let response_error = null;
    let workItemResponse = await make_get_request(API_LINK_GET_WORK_ITEM).catch(err=> {
        response_error = err;
    });

    if (workItemResponse){
        response["response"] = workItemResponse;
        return response;
    }else{
        response["error"] = response_error;
        return response
    }

}
