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
        let formIsValid = validateForm(formParams);
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