
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

    addWorkItemEvents(WORK_ITEM);
    
    // clean the modal to add an user
    $(CREATE_WORK_ITEM_MODAL).on('shown.bs.modal', function (e) {
        $(WORK_ITEM["title"]).trigger("focus");
    });


    // clean the modal when opened
    $(CREATE_WORK_ITEM_MODAL).on('show.bs.modal', function (e) {
        cleanModal(WORK_ITEM);
    });

    // CREATE NEW WORK ITEM
    $(CREATE_WORK_ITEM_SUBMIT_BTN).on("click", async function(){
        
        const {isValid, msg} = validateFormWorkItem(WORK_ITEM);

        if (!isValid){
            $.notify(msg, "error");
            return;
        }

        const workItemRequest = {
            title : $(WORK_ITEM["title"]).val(),
            userAssigned : $(WORK_ITEM["user"]).val(),
            workItemStatus : $(WORK_ITEM["state"]).val(),
            teamAssigned : $(WORK_ITEM["team"]).val(),
            workItemType : $(WORK_ITEM["type"]).val(),
            sprint : $(WORK_ITEM["sprint"]).val(),
            workItemDescription : $(WORK_ITEM["description"]).val(),
            storyPoints : $(WORK_ITEM["points"]).val(),
            priorityPoints : $(WORK_ITEM["priority"]).val(),
            tags :getTags(WORK_ITEM),
        };

        const projectId = $(PROJECT_ID).val();

        const API_LINK_CREATE_WORK_ITEM = `/dashboard/api/${projectId}/createWorkItem`;

        let response_error = null;
        const response = await make_post_request(API_LINK_CREATE_WORK_ITEM, workItemRequest).catch(err=> {
            response_error = err;
        });

        // Success message
        if (response){
            update_html( 
                $(CURRENT_PAGE_ID).val(), 
                UPDATE_TYPE.ADD, 
                response.workItem,
                UPDATE_INPUTS.CREATE_WORK_ITEM,
            );

            updateWorkItemFeedback();
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }

        $(CREATE_WORK_ITEM_CLOSE_BTN).click();
    });


    // close select2 in case is still open
    $(CREATE_WORK_ITEM_MODAL).on('hide.bs.modal', function (e) {
        $(WORK_ITEM["user"]).select2('close');
        $(WORK_ITEM["team"]).select2('close');
        $(WORK_ITEM["sprint"]).select2('close');
        $(WORK_ITEM["priority"]).select2('close');
    });

});