


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