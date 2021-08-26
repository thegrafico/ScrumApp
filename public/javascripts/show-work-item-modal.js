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
        let ctrlIsPressed = event.metaKey | event.trlKey;

        // Open the modal if the user is not pressing clrt
        if (!ctrlIsPressed){   
            // prevent the link to open in another tab
            event.preventDefault();

            // the work item url
            let workItemId = $(this).attr("rel");
            
            // need update this in order to send the reques to the good URL
            $(WORK_ITEM_ID).val(workItemId)

            populateWorkItemModal(workItemId);

            $(WORK_ITEM_MODAL).modal("toggle");
        }

    });

    // CLOSE MODAL
    $(CLOSE_WORK_ITEM_MODAL).on("click", function(){
        $(WORK_ITEM_MODAL).modal("hide");
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

    // SUB ID
    $(UPDATE_WORK_ITEM["subId"]).text(workItem["itemId"]);

    // TITLE
    $(UPDATE_WORK_ITEM["title"]).val(workItem["title"]);

    // ASSIGNED USER
    $(UPDATE_WORK_ITEM["user"]).val(workItem["assignedUser"]["id"] || "0").change();

    // STATUS
    const status = workItem["status"];
    $(`${UPDATE_WORK_ITEM["btn_change_status"]} span.${status}`)[0].click();
    
    // TYPE
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
    for (let comment of workItem["comments"]){
        // since the request is done (Success), we can add the html 
        const comment_html = COMMENT_HTML_TEMPLATE.replace(REPLACE_SYMBOL, comment);
        addToHtml(USER_COMMENT_CONTAINER, comment_html); // Helper function
    }

    resetWorkItemState();
    activeSaveButton();
    setWorkItemState();

    let isCompletedWorkItem = (status == "Completed");

    makeWorkItemUpdatable(isCompletedWorkItem);
}

/**
 * Make the work item updatable, meaning it can be update. 
 * @param {Boolean} makeItUpdatable - if true work item can be saved. 
 */
function makeWorkItemUpdatable(makeItUpdatable){
    // ASSIGNED USER
    if (makeItUpdatable){
        $(SAVE_UPDATE_WORK_ITEM_BTN).addClass("d-none");
        $(COMPLETED_WORK_ITEM_MESSAGE).removeClass("d-none");
    }else{
        $(COMPLETED_WORK_ITEM_MESSAGE).addClass("d-none");
        $(SAVE_UPDATE_WORK_ITEM_BTN).removeClass("d-none");
    }
}

/**
 * 
 * @param {String} workItemId - id of the work item 
 * @returns {object}
 */
async function getWorkItemData(workItemId){
    
    let response = {error:null};
    let projectId = $(PROJECT_ID).val();

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
