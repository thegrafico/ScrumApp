/**
 * To Send to the UI a feedback message from the backend. 
*/

// feedback
const SUCCESS_FEEDBACK_INPUT = "#success-feedback-msg";
const ERROR_FEEDBACK_INPUT = "#error-feedback-msg";

$(function () {
    let successMsg = $(SUCCESS_FEEDBACK_INPUT).val();
    let errorMsg =$(ERROR_FEEDBACK_INPUT).val();

    // show message to user
    if (successMsg && successMsg.length > 0){
        $.notify(successMsg, {
            className: 'success',
            position: "bottom-right"
        });
    }

    // show error to the user
    if (errorMsg && errorMsg.length > 0){
        $.notify(successMsg, {
            className: 'error',
            position: "bottom-right"
        });
    }

});