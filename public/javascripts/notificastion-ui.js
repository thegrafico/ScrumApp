/**
 * Manage notification for the user
 */
$(function () {

    const PROJECT_INVITATION = {
        body: "#project-invitation-body-text",
        modal: "#project-invitation-modal",
        projectIdHiddenInput: "#project-id-invitation",
        NotificationIdHiddenInput: "#project-invitation-notification-id",
        declineProjectInvatationBtn: "#decline-project-invitation-btn",
        acceptProjectInvitationBtn: "#accept-project-invitation-btn",
    }

    const NOTIFICATION_UI = {
        row: ".notification-row",
        body: ".notification-body",
        emptyContainer: ".empty-notification-container",
    }

    // CLICK ON NOTIFICATION
    $(NOTIFICATION_UI["row"]).on("click", async function(){

        const currentNotification = this;
        const notificationId = $(currentNotification).attr("id");

        // get the type of the notification
        const currentNotificationType = $(currentNotification).attr("data-notification-type");
        
        // getting the project of the notification
        const notificationProjectId = $(currentNotification).attr("data-notification-projectId");

        // open or do wathever depending on the type of the notification for the user
        switch (currentNotificationType) {
            case NOTIFICATION_TYPES["PROJECT_INVITATION"]:

                // populate hidden inputs in project invitation modal
                $(PROJECT_INVITATION["projectIdHiddenInput"]).val(notificationProjectId);
                $(PROJECT_INVITATION["NotificationIdHiddenInput"]).val(notificationId);

                // clean the modal body
                cleanElement(PROJECT_INVITATION["body"]);

                // Show modal
                $(PROJECT_INVITATION["modal"]).modal('toggle');

                // Clone the HTML from the notification into the Modal
                $(currentNotification).find(NOTIFICATION_UI["body"]).clone().appendTo(PROJECT_INVITATION["body"]);
                break;
        
            case NOTIFICATION_TYPES["ASSIGNED_WORK_ITEM"]:
                const workItemId = $(currentNotification).attr("data-notification-reference-id");

                let URL = `/dashboard/${notificationProjectId}/planing/workItems/${workItemId}`;

                openInNewTab(URL);
                break;
            case NOTIFICATION_TYPES["TEAM_ADDED"]:
                break;
            case NOTIFICATION_TYPES["MENTIONED"]:
                break;
            case NOTIFICATION_TYPES["WORK_ITEM_UPDATED"]:
                break;
            default:
                console.log("Invalid notification type received");
                break;
        }

        await updateStatusForNotificationIfNew(currentNotification, notificationId);
        
    });

    // ======== PROJECT INVITATION ==========

    // DECLINE PROJECT INVITATION
    $(PROJECT_INVITATION["declineProjectInvatationBtn"]).on("click", async function(){
        const projectId = $(PROJECT_INVITATION["projectIdHiddenInput"]).val();
        const notificationId = $(PROJECT_INVITATION["NotificationIdHiddenInput"]).val();

        // remove notification
        let {response, response_error} = await declineProjectInvitation(projectId, notificationId);

        if (!response_error){

            // remove notification from UI
            $(`${NOTIFICATION_UI["row"]}#${notificationId}`).fadeOut("slow").remove();

            showEmptyContainerForNotification();
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // ACCEPT PROJECT INVITATION
    $(PROJECT_INVITATION["acceptProjectInvitationBtn"]).on("click", async function(){
        const projectId = $(PROJECT_INVITATION["projectIdHiddenInput"]).val();
        const notificationId = $(PROJECT_INVITATION["NotificationIdHiddenInput"]).val();

        // remove notification
        let {response, response_error} = await addUserToProject(projectId, notificationId);

        if (!response_error){

            // remove notification from UI
            $(`${NOTIFICATION_UI["row"]}#${notificationId}`).fadeOut("slow").remove();

            showEmptyContainerForNotification();

            // set values to default 
            $(PROJECT_INVITATION["projectIdHiddenInput"]).val(0);
            $(PROJECT_INVITATION["NotificationIdHiddenInput"]).val(0);

            // hide the modal
            $(PROJECT_INVITATION["modal"]).modal('hide');
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // CLOSE MODAL FOR PROJECT INVITATION
    $(`${PROJECT_INVITATION["modal"]} .close-modal`).on("click", function(){

        // set values to default 
        $(PROJECT_INVITATION["projectIdHiddenInput"]).val(0);
        $(PROJECT_INVITATION["NotificationIdHiddenInput"]).val(0);

        // hide the modal
        $(PROJECT_INVITATION["modal"]).modal('hide');
    });

    // ===================================

    /**
     * Show the empty container message if show is true, otherwise hide it.
     */
    function showEmptyContainerForNotification(){

        let numberOfNotifications = $(NOTIFICATION_UI["row"]).length; 
        if (numberOfNotifications === 0){
            $(NOTIFICATION_UI["emptyContainer"]).removeClass("d-none");
        }else{
            $(NOTIFICATION_UI["emptyContainer"]).addClass("d-none");
        }
    }

    /**
     * Update the status of the notification so the number of notification is updated for the user
     * @param {HTMLBodyElement} uiNotification 
     */
    async function updateStatusForNotificationIfNew(uiNotification, notificationId){
        // getting the status of the current notification
        const currentNotificationStatus = $(uiNotification).attr("data-notification-status");

        // update the status of the notification if the status is new - (To Update the number of notifications)
        if (currentNotificationStatus === NOTIFICATION_STATUS["NEW"]){
            await updateNotificationStatus(notificationId, NOTIFICATION_STATUS['ACTIVE']);

            // update the notification so the user don't udpate the status again
            $(uiNotification).attr("data-notification-type", NOTIFICATION_STATUS['ACTIVE']);

            // remove -1 from the current number of notifications
            let newNumberOfNotifications = parseInt($(NUMBER_OF_NEW_NOTIFICATIONS).attr("data-n-notifications")) - 1;
            
            // update the current value in case of more notifications
            $(NUMBER_OF_NEW_NOTIFICATIONS).attr("data-n-notifications", newNumberOfNotifications);

            if (newNumberOfNotifications === 0){
                $(NUMBER_OF_NEW_NOTIFICATIONS).addClass('d-none');
            }else if (newNumberOfNotifications < 10){
                $(NUMBER_OF_NEW_NOTIFICATIONS).text(newNumberOfNotifications);
            }

        }
    }
});

