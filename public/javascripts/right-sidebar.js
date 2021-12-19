/**
 * Logic and events for the rigth sidebar
*/

const SHOW_SIDEBAR_BTN = ".open-add-links-options";
const CLOSE_SIDEBAR_BTN = "#right-sidebar-close-btn";

// INPUTS FOR THE SIDEBAR
const RELATIONSHIP_INPUT = "#work-item-relationship";
const LIST_OF_WORK_ITEMS_INPUT = "#list-of-work-items";
const RIGHT_SIDEBAR_SUBMIT_BTN = "#right-sidebar-submit-btn";

// container
const RIGHT_SIDE_NAVBAR_CURRENT_WORK_ITEM_CONTAINER = ".right-sidebar-current-work-item-container";

// DATA LIST
const RIGHT_SIDEBAR_WORK_ITEM_LIST = "#work-item-list";

// span with the work item id
const SPAN_RELATED_WORKITEM_ITEM_ID = ".related-workitem-item-id";
const RELEATE_WORK_ITEM_CONTAINER = ".related-workitem";

// ======== REMOVE RELATIONSHIP FROM WORK ITEM ==============
const REMOVE_RELATIONSHIP_BTN = ".remove-relationship-btn";

$(function () {

    // To keep track of which modal is open, either 'create work item' or 'update work item'. 
    let activeWorkItemModal = null;
    let currentWorkItemItemId = null;

    // $(RELATIONSHIP_INPUT).select2();
    loadOptionsForRelationship();

    // show the sidebar to the user
    $(document).on("click", SHOW_SIDEBAR_BTN, function(){

        $(RIGHT_SIDE_NAVBAR_ID).toggle("slow");

        // $(LIST_OF_WORK_ITEMS_INPUT).focus();
        $(RELATIONSHIP_INPUT).val("0").trigger("change");
        $(LIST_OF_WORK_ITEMS_INPUT).val("");

        // get the modal that is open. 
        // This variable is used later to add the link to the work item modal
        activeWorkItemModal = $(this).attr("data-modal-open");

        // add the link to the modal
        if (activeWorkItemModal == WORK_ITEM_MODALS["update"]["value"]){
            currentWorkItemItemId = $(WORK_ITEM_MODALS["update"]["workItemTeamId"]).text().trim();
        }else{
            currentWorkItemItemId = null;
        }
    });

    // trying to get the work item for the user and show it ot the input list
    $(LIST_OF_WORK_ITEMS_INPUT).keyup(async function(){
        
        let workItemId = $(this).val();

        let isNumber = (!isNaN(workItemId) && !_.isEmpty(workItemId));

        // disabled the submit button if there is not a valid work item id (Number)
        // $(RIGHT_SIDEBAR_SUBMIT_BTN).attr("disabled", !isNumber);

        // do not continue if not a number
        if (!isNumber){
            // clean the data list
            cleanElement(RIGHT_SIDEBAR_WORK_ITEM_LIST);
            return;
        }

        let {response, response_error} = await getSimilarWorkItemsById(workItemId);

        if (!response_error){

            // ignore if there is not data available
            if (!_.isArray(response["workItems"]) || _.isEmpty(response["workItems"])){
                return;
            }

            // clean the data list
            cleanElement(RIGHT_SIDEBAR_WORK_ITEM_LIST);
            
            // add to the list
            for (let workItem of response["workItems"]){
                let id = workItem["itemId"];
                let title = workItem["title"];

                // adding value to datalist
                $(RIGHT_SIDEBAR_WORK_ITEM_LIST).append(`<option value="${id} - ${title}">`);

                // this is the way for the list to appear to the user. Weird JS or HTML 
                $(LIST_OF_WORK_ITEMS_INPUT).attr("list", "work-item-list");
            }           
            $(LIST_OF_WORK_ITEMS_INPUT).attr("list", "work-item-list");

        }
        // else{
        //     // $.notify(response_error.data.responseJSON.msg, "error");
        // }

    });

    // Add the relation to the work item that is currently open
    $(RIGHT_SIDEBAR_SUBMIT_BTN).on("click", async function(){
        
        let relationship = $(RELATIONSHIP_INPUT).val();

        let workItemId = $(LIST_OF_WORK_ITEMS_INPUT).val().split("-")[0].trim();

        // check is valid relationship
        if (relationship == UNNASIGNED_VALUE || !Object.keys(WORK_ITEM_RELATIONSHIP).includes(relationship)){
            showPopupMessage(RELATIONSHIP_INPUT, "Invalid option selected", "error", "top-left");
            return;
        }

        // check is valid workItemId
        if (_.isEmpty(workItemId) || isNaN(workItemId)){
            showPopupMessage(LIST_OF_WORK_ITEMS_INPUT, "Invalid id", "error", "top-left");
            return;
        }
        
        // check if ID are the same
        if (currentWorkItemItemId && currentWorkItemItemId.trim() === workItemId){
            showPopupMessage(LIST_OF_WORK_ITEMS_INPUT, "Same Id as current work item", "error", "top-left");
            return;
        }

        // check if there is a modal already open
        if (!Object.keys(WORK_ITEM_MODALS).includes(activeWorkItemModal)){
            $.notify("Sorry, cannot add the link to the work item at this moment. Please refresh the page", "error");
            return;
        }

        // Get the div container to add the elements to the UI
        let containerToAddRelationship = (activeWorkItemModal == WORK_ITEM_MODALS["create"]["value"]) ? WORK_ITEM_MODALS["create"]["container"] : WORK_ITEM_MODALS["update"]["container"]

        if (doesRelationshipExist(workItemId, containerToAddRelationship)){
            $.notify("Sorry, There is already a related work item with this id.", "error");
            return;
        };

        // Get work item by the id of the user
        let {response, response_error} = await getWorkItemByItemId(workItemId);

        if (!response_error){

            // check if we have a work item
            if (!response || !response["workItem"] || _.isEmpty(response["workItem"])){
                $.notify("Sorry, Cannot find the work item with the given id.", "error");
                return;
            }

            relationship = getRelationShipForWorkItem(relationship);

            addRelationshipToWorkItemModal([response["workItem"]], relationship, containerToAddRelationship);

            $(UPDATE_WORK_ITEM["relationship_container"]).trigger("change");
            // hide sidebar
            $(RIGHT_SIDE_NAVBAR_ID).hide("slow");
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // Remove the relationship from the work item
    $(document).on("click", REMOVE_RELATIONSHIP_BTN, async function(){
        // let relatedWorkItem = $(this).attr(ATTR_WORK_ITEM_ID);
        let currentWorkItem = $(WORK_ITEM_ID).val();

        let numberOfElements = $(this).parent().parent().find(RELEATE_WORK_ITEM_CONTAINER).length;
        // if there is not workitem id, just remove the relationship from the UI
            
        // get the number of elements inside this relationship
        if (numberOfElements <= 1){

            // remove the whole div with the relationship name
            $(this).parent().parent().remove();
        }else{

            // remove just the relationship work item
            $(this).parent().remove();
        }
        
        // only show the save button on update work item modal
        if ( !(currentWorkItem == UNNASIGNED_VALUE)){
            $(UPDATE_WORK_ITEM["relationship_container"]).trigger("change");
        }

    });

    // Close sidebar
    $(CLOSE_SIDEBAR_BTN).on("click", function(){
        $(RIGHT_SIDE_NAVBAR_ID).hide("slow");
    });

});

/**
 * Add link to the work item modal in the UI
 * @param {Object} workItem 
 * @param {String} relationship 
 * @param {String} container 
 */
function addRelationshipToWorkItemModal(relatedWorkItems, relationship, container){

    // check if there is a container already
    let containerIsAvailable = $(`${container} #${relationship}`).length > 0;

    const projectId = getProjectId();

    // if there is not contianer to add the related work items, then create one
    if (!containerIsAvailable){
        let containerTemplate = `
        <div class="work-item-relationship mb-2">
            <div class="work-item-relationship-title" id="${relationship}">
                <span>${WORK_ITEM_RELATIONSHIP[relationship]["title"]}</span>
            </div>
        </div>`;

        // create the container
        $(container).append(containerTemplate);
        console.log("related work item added!");
    }
    for( let workItem of relatedWorkItems){
        let lastUpdatedDate = moment( workItem['updatedAt']).format(SPRINT_FORMAT_DATE);

        let wTemplate = `
        <div class="related-workitem mb-2">

            <span class="remove-relationship-btn" data-workitem-id="${workItem['_id']}">
                <i class="fas fa-times-circle"></i>
            </span>

            <div class="work-item-relationship-name-container">
                
                <a href="/dashboard/${projectId}/planing/workItems/${workItem['_id']}">    
                    <span class="work-item-relationship-id">
                        <i class="fas ${WORK_ITEM_ICONS[workItem['type']].icon}"></i>
                        <span class="related-workitem-item-id"> 
                            ${workItem['itemId']} 
                        </span>
                        
                    </span>

                    <span class="work-item-relationship-name">
                        ${workItem['title']}
                    </span>
                </a>
            </div>

            <div class="work-item-relationship-status-container">

                <span class="work-item-relationship-updated">
                    Updated ${lastUpdatedDate},
                </span>

                <span class="work-item-relationship-status">
                    <i class="fa fa-circle ${workItem['status']}Color" aria-hidden="true"></i>
                    ${workItem['status']}
                </span>
            </div>
            <input class="relationship-workitem-id" type="hidden" name="workItemItemId" value="${relationship}-${workItem['_id']}">

        </div>`;
        
        $(`${container} div#${relationship}`).append(wTemplate);
        console.log("related work item added!");

    }
}

/**
 * Load the relationship options for the the rigth sidebar modal
 */
function loadOptionsForRelationship(){

    for (let key in WORK_ITEM_RELATIONSHIP){

        let text = WORK_ITEM_RELATIONSHIP[key]["text"];
        // let value = WORK_ITEM_RELATIONSHIP[key]["value"];
        updateSelectOption(RELATIONSHIP_INPUT, UPDATE_TYPE.ADD, {"text": text, "value": key})
    }
}

/**
 * Check if the itemId of the work item already is in the modal of the work item
 * @param {String} itemId 
 * @param {String} container 
 */
function doesRelationshipExist(itemId, container){

    if (!itemId || !container){
        console.error("Invalid parameters");
    }

    let exist = false;

    // look in all work items id in the link section
    $(container).find(SPAN_RELATED_WORKITEM_ITEM_ID).each(function (){
        let workItemId = $(this).text().trim();
        if (itemId === workItemId){
            exist = true;
        }
    });

    return exist;
}

