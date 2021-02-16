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