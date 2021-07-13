
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
 * @returns {null}
 */
function showErrSpanMessage(spanId, message){
    $(spanId).text(message);
    $(spanId).removeClass("invisible");
}

/**
 * show an HTML element if the element has the class d-none
 * @param {String} elementId - id of the span to show
 */
function showElement(elementId){
    $(elementId).removeClass("d-none");
    $(elementId).removeClass("invisible");
}

/**
 * Hide a HTML element
 * @param {String} elementId - id of the span to show
 */
function hideElement(elementId){
    $(elementId).addClass("d-none");
    $(elementId).addClass("invisible");
}
/**
 * hide a span element
 * @param {String} spanId id of the span message 
 */
function hideErrSpanMessage(spanId){
    $(spanId).text('');
    $(spanId).addClass("invisible");
}

/**
 * Validate the email of the user, if the email is invalid show a message to the user using a span element
 * @param {String} emailId - input email id 
 * @param {String} formId - form id 
 * @param {String} spanId - id of the span to show the message 
 * @param {Object} event - event fired
 */
function validateEmail(emailId, formId, spanId, event) {

    // remove the default from the form so we can control when to submit the information. 
    event.preventDefault();

    // validating the form 
    isEmailValid = validator.isEmail($(emailId).val());

    if (!isEmailValid) {
        showErrSpanMessage(spanId, "Invalid email, please try again.");
        return;
    }

    $(formId).trigger("submit");
}

/**
 * Show the current tab at the side bar
 */
function showActiveTab(){

    currentTabValue = $("#currentTab").val();
    
    if (currentTabValue.includes(",")){
        currentTabs = currentTabValue.split(",");
        currentTabs.forEach(each=> {$(`#${each}`).addClass("currentTab");})
        return;
    }

    $(`#${currentTabValue}`).addClass("currentTab");
}

/**
 * Toggle the filter element
 */
function toggleFilter(){
    let filterDiv = "#filterDiv";
    $(filterDiv).toggle();
}


/**
 * Add html to an container
 * @param {String} containerId 
 * @param {String} html 
 */
 function addToHtml(containerId, html){
    $(containerId).prepend(html);
}

/**
 * Send a request to the backend
 * @param {String} link - Link where the request goes
 * @param {Object} data - Object with the data to be send
 * @returns {Promise} True if the request was sent successfully
 */
 function make_post_request(link, data){
    return new Promise( (resolve, reject) => {
        const response = $.post( link, data, 
            function() {
                console.log("Sent!");
            })
            .done(function(data, status) {
                return resolve(data, status);
            })
            .fail(function(data, status) {
                return reject({data, status});
            }).always(function(){
                console.log("Finished Post request");
        });
    });
}

/**
 * Send a GET request to the backend
 * @param {String} link - Link where the request goes
 * @param {Object} data - Object with the data to be send
 * @returns {Promise} True if the request was sent successfully
 */
function make_get_request(link){
    return new Promise( (resolve, reject) => {
        const response = $.get( link,
            function() {
            })
            .done(function(data, status) {
                return resolve(data, status);
            })
            .fail(function(data, status) {
                return reject({data, status});
            }).always(function(){
        });
    });
}

// TODO: Implement timeout on Promise
// https://italonascimento.github.io/applying-a-timeout-to-your-promises/

/**
 * Return the value of the new value if is different from current
 * @param {Object} currentVal 
 * @param {Object} newVal 
 * @returns new value if current and new are different, otherwise retun undefined 
 */
 function swap(currentVal, newVal){

    // console.log(`Current: ${currentVal}, New: ${newVal}. Result ${currentVal != newVal}`);
    if (currentVal != newVal){
        return newVal;
    }

    return undefined;
}


/**
 * Clean the work item modal
 * This function is call anywhere is possible to create a work item
 */
function cleanModal() {

    // reset title
    $(WORK_ITEM["title"]).val("");
    $(spanTitleMsg).removeClass("d-none");

    // reset assigned user
    $(WORK_ITEM["user"]).val(0);

    // reset tags
    $(`${TAG_CONTAINER} span`).remove();

    // reset state
    // TODO: set the default value to be the firts from an array from CONSTANTS.js
    $(WORK_ITEM["state"]).val("New");

    // Reset description
    $(WORK_ITEM["description"]).val("");

    // reset points
    $(WORK_ITEM["points"]).val("");

    // reset priority
    $(WORK_ITEM["priority"]).val("");

    // reset discussion
    $(WORK_ITEM["discussion"]).val("");


    // TODO: reset links
    // TODO: reset type
    // TODO: reset team depending on the user's team
    // TODO: reset sprint depending on the current sprint
}

/**
 * Update custom select options
 * @param {Object} currentElement - this element - current element
 * @param {String} tagCurrentItem - current tag item for the html
 * @param {String} tagInputItem - hidden input tag
 */
function updateCustomSelect(currentElement, tagCurrentItem, tagInputItem){
    // // get the current element
    // let currentIcon = $(tagCurrentItem).html();        

    // get the clicked element
    let clickedIcon = $(currentElement).html();
    let selecteTextValue = $(currentElement).text().trim().toLowerCase();

    // store the current element in a temporal variable
    // let temp = currentIcon;

    // clean the current element and change it with the clicked
    $(tagCurrentItem).empty().html(clickedIcon);

    // add the temporal element into the select options
    // $(currentElement).empty().html(temp)

    $(tagInputItem).val(selecteTextValue).trigger("change");
}


/**
 * This funtion validates the form to create a new WorkItem
 */
// TODO: change alert for other better ui messages
function validateFormWorkItem(){

    try{
        const title = $(WORK_ITEM["title"]).val().trim();
        // const state = $(WORK_ITEM["state"]).val();
        // const teamId = $(WORK_ITEM["team"]).val();
        // const type = $(WORK_ITEM["type"]).val();
        // const sprint = $(WORK_ITEM["sprint"]).val();
        const description = $(WORK_ITEM["description"]).val();
        const points = $(WORK_ITEM["points"]).val() || 0;
        const priority = $(WORK_ITEM["priority"]).val() || MAX_PRIORITY_POINTS;
    
        // Validate title
        if (!_.isString(title) || title.length < MIN_LENGTH_TITLE){
            alert(`Title cannot be less than ${MIN_LENGTH_TITLE} chars`);
            return false;
        }

        // validate points
        if ( !_.isEmpty(points) && isNaN(points)){
            alert("Points only accept numbers");
            return false;
        }

        // validate priority
        if (!_.isEmpty(priority) && isNaN(priority)){
            alert("Priority only accept numbers");
            return false;
        }

    }catch(err){
        alert(err);
        return false;  
    }

    return true;
}

/**
 * Add data to work item table
 * @param {Array} workItems - array of work items
 */
function appendToWotkItemTable(workItems){

    if (!_.isArray(workItems) || _.isEmpty(workItems)){
        // console.log("Work items is empty");
        return;
    }
    
    $(`#workItemTable > tbody`).empty();

    for(let i = 0; i < workItems.length; i++){
        const workItem = workItems[i];

        let td_checkbox = `
            <td class="tableCheckBoxRowElement"> 
                <label for="checkboxRowElement" class="invisible labelcheckbox"> 
                <input type="checkbox" name="checkboxWorkItem[]" value="${workItem['_id']}" class="checkboxRowElement" />
                </label> 
            </td>`;

        let td_order = `<td class="orderColumn">${i+1}</td>`;

        let td_id = `<td class="tableColumnID"> ${workItem['itemId']}</td>`;

        let td_type = `
            <td> <i class="fas  ${WORK_ITEM_ICONS[workItems[i]['type']].icon}"></i> ${workItem['type']}</td>
        `;

        let td_title = `
            <td class="openStory"> <a href="workitems/${workItem['_id']}"> ${workItem['title']} </a> </td>
        `;

        let td_user = `
            <td> <i class="fas fa-user-astronaut"></i> ${workItem["assignedUser"]["name"]}</td>
        `;

        let td_status = `
            <td><i class="fa fa-circle ${workItem['status']}Color" aria-hidden="true"></i> ${workItem['status']}</td>
        `;

        let td_comments = `
            <td class="table-comments-column"><span>  <i class="fas fa-comments"></i> ${workItem['comments'].length}</span> </td>
        `;
        
        let td_tags = null;
        if (workItem["tags"].length > 0){
            let spans = "";
            workItem["tags"].forEach(tag => {
                spans += `<span class="btn btn-info disabled btn-sm tags-container">${tag}</span> `;
            });

            td_tags  = `<td class="tags-td"> ${spans} </td>`
        }else{
            td_tags = "<td class='tags-td'>   </td>"
        }

        let table_row = `
        <tr class="rowValues">
            ${td_checkbox}
            ${td_order}
            ${td_id}
            ${td_type}
            ${td_title}
            ${td_user}
            ${td_status}
            ${td_tags}
            ${td_comments}
        </tr>
        `;

        $(`#workItemTable > tbody:last-child`).append(table_row);
    }

}

/**
 * Get all checked elements
 * @param {String} elementClassOrId 
 * @returns {Array} array with checked elements
 */
function getCheckedElements(elementClassOrId){
    let row_checked = []
    
    $(elementClassOrId).each(function(){
        row_checked.push($(this).val())
    });

    return row_checked;
}