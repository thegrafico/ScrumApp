// id of the form 
const MODAL_ADD_USER_ID = "#add-user-project";
const MODAL_USER_EMAIl_INPUT = "#modal-user-email-input";
const MODAL_ADD_USER_BTN_SUBMIT = "#add-user-modal-btn";
const MODAL_SPAN_EMAIl_ERROR = "#modal-create-user-span-error";

/**
 * This function is fire as soon as the DOM element is ready to process JS logic code
 * Same as $(document).ready()...
 */
$(function (){

    // BTN when the user submit the form information to create a new user
    $(MODAL_ADD_USER_BTN_SUBMIT).on("click", async function(event){
        let userEmail = $(MODAL_USER_EMAIl_INPUT).val().trim();
        
        console.log(userEmail);
        if (!isEmail(userEmail)){
            showErrSpanMessage(MODAL_SPAN_EMAIl_ERROR, "Invalid email");
            return;
        }

        hideErrSpanMessage(MODAL_SPAN_EMAIl_ERROR);

        const projectId = $(PROJECT_ID).val();

        if (!_.isString(projectId)){
            $.notify("Sorry, Cannot find the project at this moment.", "error");
            return;
        }

        const API_LINK_ADD_USER_TO_PROJECT = `/dashboard/api/${projectId}/addUserToProject`;
        const data = {"userEmail": userEmail};

        let response_error = null;
        const response = await make_post_request(API_LINK_ADD_USER_TO_PROJECT, data).catch(err => {
            response_error = err;
        });
        
        console.log("here");
        console.log(response);
        // Success message
        if (response){
            $.notify(response.msg, "success");
            // cleanInput(MODAL_USER_EMAIl_INPUT);
        }else{ // error messages
            $.notify(response_error.data.responseText, "error");
        }
    });

    // clean the project modal
    $(MODAL_ADD_USER_ID).on('show.bs.modal', function (e) {
        $(MODAL_USER_EMAIl_INPUT).val(''); 
    });
});
