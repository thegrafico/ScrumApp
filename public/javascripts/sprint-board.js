


$( function() {
    
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
            let statusMoved = $(cardDiv).parent().attr("id");
            let workItemId = $(cardDiv).attr("id");

            // update the status of the work item
            await updateWorkItemBoard(workItemId, statusMoved);

            console.log("ITEM WAS MOVED TO: ", statusMoved);
        },
    });
 
    $(".card")
        .addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
        .find(".card-header")
        .addClass("ui-widget-header ui-corner-all")
        .prepend("<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>");

    $(".portlet-toggle").on("click", function () {
        var icon = $(this);
        icon.toggleClass("ui-icon-minusthick ui-icon-plusthick");
        icon.closest(".portlet").find(".portlet-content").toggle();
    });
} );

/**
 * Update the status of the work item
 * @param {String} workItemId 
 * @param {String} status 
 */
async function updateWorkItemBoard(workItemId, status){

    const projectId = $(PROJECT_ID).val();
    const sprintId  = $(FILTER_BY_SPRINT_INPUT).val();

    const API_LINK_UPDATE_WORK_ITEM_BOARD = `/dashboard/api/${projectId}/updateWorkItemOrder/${workItemId}/${sprintId}`;

    const indexOfWorkItemInBoard = $(`div#${workItemId}`).index();    

    // request data
    let request_data = {
        "status": status,
        "location": "sprintBoard",
        "index": indexOfWorkItemInBoard,
    }

    let response_error = null;
    const response = await make_post_request(API_LINK_UPDATE_WORK_ITEM_BOARD, request_data).catch(err=> {
        response_error = err;
    });

    // Success message
    if (response_error){
        $.notify(response_error.data.responseJSON.msg, "error");
    }

}