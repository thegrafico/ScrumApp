// CREATE USER
const MODAL_ADD_USER_ID = "#add-user-project";
const MODAL_USER_EMAIl_INPUT = "#modal-user-email-input";
const MODAL_ADD_USER_BTN_SUBMIT = "#add-user-modal-btn";
const MODAL_SPAN_EMAIl_ERROR = "#modal-create-user-span-error";

// REMOVE USER
const MODAL_REMOVE_USER_ID = "#delete-user-modal";
const MODAL_REMOVE_USER_INPUT = "#modal-remove-user-select-user";
const MODAL_REMOVE_SUBMIT_BTN = "#modal-delete-user-submit-btn";

/**
 * This function is fire as soon as the DOM element is ready to process JS logic code
 * Same as $(document).ready()...
 */
$(function (){

    // BTN ADD USER
    $(MODAL_ADD_USER_BTN_SUBMIT).on("click", async function(event){
        let userEmail = $(MODAL_USER_EMAIl_INPUT).val().trim();
        
        if (!isEmail(userEmail)){
            showErrSpanMessage(MODAL_SPAN_EMAIl_ERROR, "Invalid email");
            return;
        }

        hideErrSpanMessage(MODAL_SPAN_EMAIl_ERROR);

        let projectId = $(PROJECT_ID).val();

        if (!_.isString(projectId)){
            $.notify("Sorry, Cannot find the project at this moment.", "error");
            return;
        }

        const API_LINK_ADD_USER_TO_PROJECT = `/dashboard/api/${projectId}/addUserToProject`;
        let data = {"userEmail": userEmail};

        let response_error = null;
        let response = await make_post_request(API_LINK_ADD_USER_TO_PROJECT, data).catch(err => {
            response_error = err;
        });

        // Success message
        if (response){
            $.notify(response.msg, "success");
            cleanInput(MODAL_USER_EMAIl_INPUT);

            if (response.user){
                update_html( 
                    $(CURRENT_PAGE_ID).val(),
                    UPDATE_TYPE.ADD, 
                    {"value": response.user.id, "text": response.user.fullName}, 
                    UPDATE_INPUTS.USER
                );
            }
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // BTN REMOVE USER
    $(MODAL_REMOVE_SUBMIT_BTN).on("click", async function(event){

        let userId = $(MODAL_REMOVE_USER_INPUT).val().trim();
        
        if (_.isNull(userId) || _.isUndefined(userId) || userId == "0"){
            $.notify("Invalid user.", "error");
            return;
        }

        const projectId = $(PROJECT_ID).val();

        if (!_.isString(projectId)){
            $.notify("Sorry, Cannot find the project at this moment.", "error");
            return;
        }

        const API_LINK_REMOVE_USER_FROM_PROJECT = `/dashboard/api/${projectId}/deleteUserFromProject`;
        const data = {"userId": userId};

        let response_error = null;
        const response = await make_post_request(API_LINK_REMOVE_USER_FROM_PROJECT, data).catch(err => {
            response_error = err;
        });
        
        // Success message
        if (response){
            $.notify(response.msg, "success");
            cleanSelect(MODAL_REMOVE_USER_INPUT);
            update_html( 
                $(CURRENT_PAGE_ID).val(), 
                UPDATE_TYPE.DELETE, 
                response.userId, 
                UPDATE_INPUTS.USER
            );
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // clean the project modal
    $(MODAL_ADD_USER_ID).on('shown.bs.modal', function (e) {
        $(MODAL_USER_EMAIl_INPUT).val(''); 
    });

    // clean the project modal
    $(MODAL_REMOVE_USER_ID).on('shown.bs.modal', function () {
        $(MODAL_REMOVE_USER_INPUT).val("0").trigger("change"); 
    });
});
