// id of the form 
const formCreateProjectId = "#createProjectForm";
const btnSubmitForm = "#createProjectBtn";
const projectNameId = "#projectName";
const projectDescriptionId = "#projectDescription";
const createProjectModalId = "#createProjectModal";
const formParams = [
    {"id": projectNameId, "type": "string", "null": false, "limit": 50, "errMsg": "Cannot be empty. Symbols are not allowed.", "spanId": "#projectNameSpanErr"},
    {"id": projectDescriptionId, "type": "string", "null": false, "limit": 500, "errMsg": "Sorry, there is something wrong with the description", "spanId": "#projectDescriptionSpanErr"},
];

/**
 * This function is fire as soon as the DOM element is ready to process JS logic code
 * Same as $(document).ready()...
 */
$(function (){

    // BTN when the user submit the form information to create a new project
    $(btnSubmitForm).on("click", function(event){
        
        // remove the default from the form so we can control when to submit the information. 
        event.preventDefault();

        // validating the form 
        formIsValid = validateForm(formParams);
        console.log("Form is valid: ", formIsValid);
        
        if (formIsValid){
            $(formCreateProjectId).submit();
        }
    });

    // clean the project modal
    $(createProjectModalId).on('show.bs.modal', function (e) {
        $(projectNameId).val('');
        $(projectDescriptionId).val('');
         
    });
    
});

/**
 * expected value of param is {id: .., type: ..., null: ...}
 * @param {String} formId - id of the form
 * @param {Array[Object]} formParams - Form parameters. Expecting {id, type, null}
 * @returns {Boolean} True if the form is valid
 */
function validateForm(formParams){
    let formIsValid = true;

    // validate each parameter
    for (param of formParams){

        // if the param has the null key and the param cannot be null
        if (param["null"] != true){
            console.log("Evaluating params");

            // get the value of the element
            let paramValue = $(param["id"]).val();
            console.log("The value of the param is: ", paramValue);

            if (param["type"] == "string"){
                if (paramValue == "" || paramValue.length == 0 || paramValue.length > param["limit"]){
                    showErrSpanMessage(param["spanId"], param["errMsg"]);
                    formIsValid = false;
                }else{
                    hideErrSpanMessage(param["spanId"]);
                }
            }else{ //number
                if (isNaN(paramValue)){
                    showErrSpanMessage(param["spanId"], param["errMsg"]);
                    formIsValid = false;
                }else{
                    hideErrSpanMessage(param["spanId"]);
                }
            }

        }
    }
    return formIsValid;
}



/**
 * Show a span element with an error message
 * @param {String} spanId - id of the span to show
 * @param {String} message - message the span will have 
 */
function showErrSpanMessage(spanId, message){
    $(spanId).text(message);
    $(spanId).removeClass("invisible");
}

/**
 * hide a span element
 * @param {String} spanId id of the span message 
 */
function hideErrSpanMessage(spanId){
    $(spanId).text('');
    $(spanId).addClass("invisible");
}