


$( function() {
    
    setupDragInBoard();
} );


/**
 * Setup the drag and drop function in the sprint board page
 */
function setupDragInBoard(){

    // moving card
    $( ".container-column" ).sortable({
        connectWith: ".container-column",
        handle: ".card-header",
        cancel: ".portlet-toggle",
        placeholder: "portlet-placeholder ui-corner-all",
        dropOnEmpty: true,
        // distance: 0.1,
        start: function(event, ui){
            $(ui.item).addClass("glowBorder")
        },
        stop: async function(event, ui){

            // remove the glow styles
            $(ui.item).removeClass("glowBorder");

            // getting the current draggable element
            const cardDiv = ui.item;
            
            // the parent element have the status where the dragble element was moved
            const statusMoved = $(cardDiv).parent().attr("id");
            const workItemId = $(cardDiv).attr("id");
            const indexOfWorkItemInBoard = $(`div#${workItemId}`).index();    

            const updateData = {
                "status": statusMoved, 
                "index": indexOfWorkItemInBoard, 
                "location": "sprintBoard"
            };

            // update the status of the work item
            await updateWorkItemBoard(workItemId, updateData);
        },
    });
    
    // setup of the card
    $(".card")
    .addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
    .find(".card-header")
    .addClass("ui-widget-header ui-corner-all")
    .prepend("<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>");

    // style while moving
    $(".portlet-toggle").on("click", function () {
        var icon = $(this);
        icon.toggleClass("ui-icon-minusthick ui-icon-plusthick");
        icon.closest(".portlet").find(".portlet-content").toggle();
    });

}

/**
 * Update the status of the work item
 * @param {String} workItemId 
 * @param {String} status 
 */
async function updateWorkItemBoard(workItemId, updateData) {

    const projectId = getProjectId();
    const sprintId = $(FILTER_BY_SPRINT_INPUT).val();

    const API_LINK_UPDATE_WORK_ITEM_BOARD = `/dashboard/api/${projectId}/updateWorkItemOrder/${workItemId}/${sprintId}`;

    let response_error = null;
    const response = await make_post_request(API_LINK_UPDATE_WORK_ITEM_BOARD, updateData).catch(err => {
        response_error = err;
    });

    // Success message
    if (!response_error) {

        if (response["userWasUpdated"]){

            // update card information in the UI
            let spanToUpdate = $(`.card#${workItemId}`).find("span.userName");
            $(spanToUpdate).removeClass(UNNASIGNED_VALUE);
            $(spanToUpdate).addClass(response["assignedUser"]["id"]);
            $(spanToUpdate).text(response["assignedUser"]["name"]);
        }
    }else{
        $.notify(response_error.data.responseJSON.msg, "error");
    }
}