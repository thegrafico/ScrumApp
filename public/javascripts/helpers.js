
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
 * Validate if email
 * @param {String} email 
 * @returns {Boolean} - True if the email is valid
 */
function isEmail(email){
    return validator.isEmail(email);
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
    isEmailValid = isEmail($(emailId).val());

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
function cleanModal(element) {

    // reset title
    $(element["title"]).val("");
    $(spanTitleMsg).removeClass("d-none");

    // reset assigned user
    $(element["user"]).val(0);

    // reset tags
    $(`${element["tag_container"]} span`).remove();

    // reset state
    // TODO: set the default value to be the firts from an array from CONSTANTS.js
    $(element["state"]).val("New");

    // Reset description
    $(element["description"]).val("");

    // reset points
    $(element["points"]).val("");

    // reset priority
    $(element["priority"]).val("");

    // reset discussion
    $(element["discussion"]).val("");

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

function cleanTable(tableId){
    $(`${tableId} > tbody`).empty(); 
}

/**
 * get the header of the nable
 * @param {String} tableId 
 * @return {Array} header of the table in order 
*/
function getTableHeadersArray(tableId){

    let header = [];
    // Get each th Which is a table header
    $(`${tableId} thead tr.tableHeader th`).each(function (){
        header_text = $(this).text().trim().toLowerCase();
        // header[header_text] = header_text;
        header.push(header_text)
    });

    return header;
}


/**
 * Add data to work item table
 * @param {Array} workItems - array of work items
 * @param {Boolean} showIfSprint -if work item have a sprint assigned, show it
 * @param {Number} index - index where you want to add the element
 * @param {Boolean} removeTable - true if wants to remove all elements from table
 * 
 * 
 */
function appendToWotkItemTable(workItems, index=null, showIfSprint=true, removeTable=true){

    if (!_.isArray(workItems) || _.isEmpty(workItems)){
        // console.log("Work items is empty");
        return;
    }
    
    if (removeTable){
        // clean the table
        cleanTable(WORK_ITEM_TABLE);
    }
    
    let headers_array = getTableHeadersArray(WORK_ITEM_TABLE);
    let headers_object = {};

    for(let i = 0; i < workItems.length; i++){
        const workItem = workItems[i];
        
        // if showIfSprint if false, and the work item have a sprint
        if (!showIfSprint && workItem["sprint"] && workItem["sprint"]["_id"] != "0"){
            continue;
        }

        // CHECKBOX
        let checkbox = `
            <td class="tableCheckBoxRowElement"> 
                <label for="checkboxRowElement" class="invisible labelcheckbox"> 
                <input type="checkbox" name="checkboxWorkItem[]" value="${workItem['_id']}" class="checkboxRowElement" />
                </label> 
            </td>
        `;
        headers_object["checkbox"] = checkbox;

        
        // ORDER
        let order = `<td class="orderColumn">${i+1}</td>`;
        headers_object["order"] = order;


        // ID
        let id = `<td class="tableColumnID"> ${workItem['itemId']}</td>`;
        headers_object["id"] = id;


        // TYPE
        let type = `
            <td class="d-none"> <i class="fas  ${WORK_ITEM_ICONS[workItems[i]['type']].icon}"></i> ${workItem['type']}</td>
        `;
        headers_object["type"] = type;

        // TITLE
        let title = `
            <td class="openStory">
                <a href="workitems/${workItem['_id']}" class="open-existing-work-item-modal" rel="${workItem['_id']}">
                    <i class="fas  ${WORK_ITEM_ICONS[workItems[i]['type']].icon}"></i> 
                    ${workItem['title']} 
                </a> 
            </td>
        `;
        headers_object["title"] = title;

        // SUB MENU
        let submenu = `
            <td class="tdWorkItemSubMenu">
                <span class="btn btn-outline-info" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v workItemSubMenuIcon"></i>
                </span>

                <div id="workItemSubMenu" class="dropdown-menu " data-bs-popper="none">
                    
                    <a class="dropdown-item moveToBacklog" href="#" role="button" rel="${workItem['_id']}">
                        Move to Backlog
                    </a>                                        
                    
                    <a class="dropdown-item moveToNextSprintBtn" href="#" rel="${workItem['_id']}">
                        Move to next Sprint
                    </a>

                </div>
            </td>
        `;
        headers_object["submenu"] = submenu;


        // USER
        let assigned = `
            <td> <i class="fas fa-user-astronaut"></i> ${workItem["assignedUser"]["name"]}</td>
        `;
        headers_object["assigned"] = assigned;


        // STATUS
        let state = `
            <td><i class="fa fa-circle ${workItem['status']}Color" aria-hidden="true"></i> ${workItem['status']}</td>
        `;
        headers_object["state"] = state;

        // TEAM
        if (workItem["team"] && workItem["team"]["name"]){
            let team = `
                <td> ${workItem["team"]["name"]}</td>
            `;
            headers_object["team"] = team;
        }

        // ITERATION / SPRINT
        if (workItem["sprint"] && workItem["sprint"]["name"]){
            let iteration = `
                <td> ${workItem["sprint"]["name"]}</td>
            `;
            headers_object["iteration"] = iteration;
        }

        // TAGS
        let tags = null;
        if (workItem["tags"].length > 0){
            let spans = "";
            workItem["tags"].forEach(tag => {
                spans += `<span class="btn btn-info disabled btn-sm tags-container">${tag}</span> `;
            });

            tags  = `<td class="tags-td"> ${spans} </td>`
        }else{
            tags = "<td class='tags-td'>   </td>"
        }
        headers_object["tags"] = tags;


        // COMMENTS
        let comments = `
            <td class="table-comments-column"><span>  <i class="fas fa-comments"></i> ${workItem['comments'].length}</span> </td>
        `;
        headers_object["comments"] = comments;


        // POINTS
        let points = `
            <td class="storyPointsRow">${workItem['storyPoints']}</td>
        `;
        headers_object["points"] = points;

        // Init row
        let table_row = `<tr class="rowValues" id="${workItem['_id']}">`
        
        // since the headers_array is in order, we just need to append it to the table row
        for (const headerKey of headers_array) {
            table_row += headers_object[headerKey];
        }

        // End row
        table_row += "</tr>";

        // add at index if user wants to.
        if (index != null){

            let numberOflements = $(`${WORK_ITEM_TABLE} > tbody > tr`).length;

            if (numberOflements != index){
                $(`${WORK_ITEM_TABLE} > tbody > tr`).eq(index).before(table_row);
            }else{
                $(`${WORK_ITEM_TABLE} > tbody > tr`).eq(index -1).after(table_row);
            }
            index = null;
        }else{
            $(`${WORK_ITEM_TABLE} > tbody:last-child`).append(table_row);
        }
    }

}

function highliteWorkItemRow(checkedElement, checkElement){
    // get the parent element. In this case, it will be the the label element
    let _parent = $( checkedElement ).parent();

    // since we are changing the whole row, we need the element that has everything inside
    let granFather = $(_parent).parent().parent();

    let atLeastOneCheckBoxIsChecked = ($(`${TABLE_ROW_CHECKBOX_ELEMENT}:checked`).length > 0);

    enableTrashButton(atLeastOneCheckBoxIsChecked);
    
    if (checkElement){
        _parent.removeClass("invisible");
        granFather.addClass(HIGHLIGST_CLASS);
    }else{
        _parent.addClass("invisible");
        granFather.removeClass(HIGHLIGST_CLASS);
    }
}


/**
 * Get all checked elements
 * @param {String} elementClassOrId 
 * @returns {Array} array with checked elements
 */
function getVisibleElements(elementClassOrId){
    let row_checked = []
    
    $(`${elementClassOrId}:visible`).each(function(){

        row_checked.push($(this).val())
    });

    return row_checked;
}

/**
 * Remove the checkbox element from the table
 * @param {String} checkboxClass 
 */
function removeCheckedElement(checkboxClass=TABLE_ROW_CHECKBOX_ELEMENT_CHECKED){
    $(checkboxClass).parent().parent().parent().each(function(){
        $(this).remove();
    });
}

/**
 * Add the disable attr to an select element and set the default to be the current
 * @param {String} selectElement 
 * @param {String} value 
 */
function addDisableAttr(selectElement, value){
    $(`${selectElement}`).children(`[value="${value}"]`).attr('disabled', true);
    $(selectElement).val("0").change();
}

/**
 * 
 * @param {String} selectId - id of the select element
 * @param {Boolean} enable - true to enable the disabled attr
 */
function setDisabledAttr(selectId, enable){
    $(selectId).attr("disabled", enable);
}

/**
 * Return if there is at least one element checked from the selector class
 * @param {String} inputClassCheckbox - class that the input element has 
 * @returns {Boolean} True if there is at least one elemenet checked
 */
function anyCheckboxCheked(inputClassCheckbox){
    return ($(`${inputClassCheckbox}:checked`).length > 0);
}

/**
 * Remove the disable attr from select options
 * @param {String} selectElement 
 * @param {String} values 
 */
function removeDisableAttr(selectElement, values){

    if (_.isEmpty(selectElement) || !_.isArray(values)){
        console.error("Select element or list of value is empty or undefined");
        return;
    }

    for (let i = 0; i < values.length; i++) {
        const val = values[i];
        $(`${selectElement}`).children(`[value="${val}"]`).attr('disabled', false);
    }
}

/**
 * Remove the work items from the table. assuming the ID of the table row is the work item id
 * @param {Array} workItems - array with the work item ids
 */
function removeWorkItemsFromTable(workItems){
    
    if (!_.isArray(workItems) || _.isEmpty(workItems)){
        console.error("Cannot remove the work item from table 'cause is either empty or undefined");
        return;
    }

    for (let itemId of workItems){
        $(`tr#${itemId}`).remove();
    }        
    enableTrashButton(false);
}


function removeAllDisableAttr(selectElement){
    $(`${selectElement} *`).attr('disabled', false);
}

/**
 * Clean the input id
 * @param {String} inputId 
 */
function cleanInput(inputId){
    $(inputId).val('');
}

/**
 * clean select opction
 * @param {String} selectId 
 */
function cleanSelect(selectId){
    $(selectId).prop('selectedIndex',0);
}


/**
 * Update a select opction
 * @param {String} selectId - id of the select option
 * @param updateType.ADD  add the new value to the select
 * @param updateType.DELETE remove the value from the select
 * @param valueToUpdate.value - value to add or remove
 * @param valueToUpdate.text - text value for select
 */
function updateSelectOption(selectId, updateType, valueToUpdate, selected=false){
    
    if (updateType == UPDATE_TYPE.ADD){
        $(selectId).append(new Option(valueToUpdate.text, valueToUpdate.value, false, selected));
    }else if(updateType == UPDATE_TYPE.DELETE){
        $(`${selectId} option[value=${valueToUpdate}]`).remove();
    }else if(updateType == UPDATE_TYPE.CHANGE){
        IS_UPDATE_SELECT_OPTION = true;
        $(selectId).val(valueToUpdate).change();
    }
}

/**
 * Show a popup message at the top of the element
 * @param {String} selector id or class of the element
 * @param {*} message - message to show
 * @param {*} style - style class ("success" | "error" | "warning")
 */
function showPopupMessage(selector, message, style="error", position="top"){
    $(selector).notify(
        message, 
        { position:position, autoHide: false, clickToHide: true, className: style}
    );
}


/**
 * Remove all options from select and add a default value
 * @param {String} selectId - if of the select option
 * @param defaultValue.text - text value of default
 * @param defaultValue.value  - value of the default
 */
function removeAllOptionsFromSelect(selectId, defaultValue){
    
    if (_.isUndefined(defaultValue) || _.isNull(defaultValue)){    
        $(selectId)
        .find('option')
        .remove()
        .end()
        // .trigger("change");
    }else{
        $(selectId)
        .find('option')
        .remove()
        .end()
        .append(new Option(defaultValue.text, defaultValue.value, false, false))
        // .trigger("change", ["Parant", "Parant2"]);
    }

}

function unCheckAll(){
    
    let is_checked = $(CHECK_ALL_CHECKBOX_TABLE_ROWS).prop("checked");
    
    if (is_checked){
        $(CHECK_ALL_CHECKBOX_TABLE_ROWS).click();
    }
}

/**
 * Move a work item to the next sprint
 * @param {Array} workItemId - Array with the Ids of the work items
 * @param {String} sprintId - id of the sprint. if null, then is sent to the backlog 
 */
async function moveWorkItemToSprint(workItemId, sprintId){

    // check work item
    if (_.isUndefined(workItemId) || _.isEmpty(workItemId) || !_.isArray(workItemId)){
        $.notify("Invalid work item was selected.", "error");
        return;
    }

    // check project id information
    const projectId = $(PROJECT_ID).val();
    if (_.isUndefined(projectId) || _.isEmpty(projectId)){
        $.notify("Sorry, we cannot find the project information. Try later", "error");
        return;
    }


    const teamId = $(FILTER_BY_TEAM_GENERAL_CLASS).val();
    if (_.isUndefined(teamId) || _.isEmpty(teamId)){
        $.notify("Please select a team to move to work item.", "error");
        return;
    }

    const data = {"sprintId": sprintId, workItemIds: workItemId};

    // link to make the request
    const API_LINK_MOVE_WORK_ITEM_TO_SPRINT = `/dashboard/api/${projectId}/moveWorkItemsToSprint/${teamId}`;
    
    let response_error = null;
    const response = await make_post_request(API_LINK_MOVE_WORK_ITEM_TO_SPRINT, data).catch(err=> {
        response_error = err;
    });
    
    if (response){
        $.notify(response.msg, "success");
        removeWorkItemsFromTable(workItemId);
    }else{
        $.notify(response_error.data.responseJSON.msg, "error");
    }

    unCheckAll();
}


/**
 * Update HMTL after a POST request was successful
 * @param {String} currentPage 
 * @param {String} updateType 
 * @param {Any} valueToUpdate 
 * @param {Object} inputType 
 * @param {Object} others 
 */
function update_html(currentPage, updateType, valueToUpdate, inputType, others=null){
    switch (currentPage){
        case "statistics":
            updateStatisticsHtml(updateType, valueToUpdate);
            break;
        case "workItems":
            // TODO: Remove user form table? or just leave it to update the page?
            if (inputType === UPDATE_INPUTS.USER){
                updateSelectOption(WORK_ITEM["user"], updateType, valueToUpdate);
                updateSelectOption(MODAL_REMOVE_USER_INPUT, updateType, valueToUpdate);
            }

            if (inputType === UPDATE_INPUTS.TEAM){
                // work item
                updateSelectOption(WORK_ITEM["team"], updateType, valueToUpdate);
                updateSelectOption(TEAM_SELECT_INPUT_ID, updateType, valueToUpdate);

                // sprint modal
                updateSelectOption(SPRINT_CREATE_MODAL_TEAM_INPUT, updateType, valueToUpdate);
                updateSelectOption(SPRINT_DELETE_MODAL_SELECT_TEAM, updateType, valueToUpdate);   
            }
            
            // TODO: verify userBestTeam
            if (inputType === UPDATE_INPUTS.SPRINT){
                updateSelectOption(WORK_ITEM["sprint"], updateType, valueToUpdate);

                // sprint modal
                updateSelectOption(SPRINT_CREATE_MODAL_TEAM_INPUT, updateType, valueToUpdate);
                updateSelectOption(SPRINT_DELETE_MODAL_SELECT_TEAM, updateType, valueToUpdate);
            }
            break;
        case "manageUser":
            // TODO: Remove user form table? or just leave it to update the page?
            if (inputType === UPDATE_INPUTS.USER){
                updateSelectOption(MODAL_REMOVE_USER_INPUT, updateType, valueToUpdate);
            }

            if (inputType === UPDATE_INPUTS.TEAM){
                updateSelectOption(TEAM_SELECT_INPUT_ID, updateType, valueToUpdate);
            } 
            
            if (inputType === UPDATE_INPUTS.SPRINT){
                updateSelectOption(WORK_ITEM["sprint"], updateType, valueToUpdate);
            }
            break;
        case "sprintPlanning":

            updateSelectOption(WORK_ITEM["user"], updateType, valueToUpdate);
            updateSelectOption(MODAL_REMOVE_USER_INPUT, updateType, valueToUpdate);

            updateSelectOption(WORK_ITEM["team"], updateType, valueToUpdate);
            updateSelectOption(TEAM_SELECT_INPUT_ID, updateType, valueToUpdate);

            // sprint modal
            updateSelectOption(SPRINT_CREATE_MODAL_TEAM_INPUT, updateType, valueToUpdate);
            updateSelectOption(SPRINT_DELETE_MODAL_SELECT_TEAM, updateType, valueToUpdate);   
            
            // TODO: verify userBestTeam
            updateSelectOption(WORK_ITEM["sprint"], updateType, valueToUpdate);

            // SPRINT FILTERING
            updateSelectOption(SPRINT_FILTER_BY_SPRINT_SELECT, updateType, valueToUpdate);
            updateSelectOption(FILTER_BY_TEAM_SPRINT, updateType, valueToUpdate);
        case "manageSprint":
            
            // USER 
            if (inputType === UPDATE_INPUTS.USER){
                updateSelectOption(WORK_ITEM["user"], updateType, valueToUpdate);
                updateSelectOption(MODAL_REMOVE_USER_INPUT, updateType, valueToUpdate);
            }

            // SPRINT
            if (inputType === UPDATE_INPUTS.SPRINT){
                updateSelectOption(WORK_ITEM["sprint"], updateType, valueToUpdate);

                // SPRINT FILTERING
                updateSelectOption(SPRINT_FILTER_BY_SPRINT_SELECT, updateType, valueToUpdate);
                updateSelectOption(FILTER_BY_TEAM_SPRINT, updateType, valueToUpdate);

                // in case we received a sprint
                if (others && others["sprint"]){
                    addSprintToTable(others["sprint"]);
                }
            }

            // TEAM 
            if (inputType === UPDATE_INPUTS.TEAM){
                updateSelectOption(SPRINT_DELETE_MODAL_SELECT_TEAM, updateType, valueToUpdate);               
                updateSelectOption(SPRINT_CREATE_MODAL_TEAM_INPUT, updateType, valueToUpdate);
                updateSelectOption(WORK_ITEM["team"], updateType, valueToUpdate);
                updateSelectOption(TEAM_SELECT_INPUT_ID, updateType, valueToUpdate);
            }   
        default:
            break;
    }
}

/**
 * 
 * @param {String} rowId - id of the row to be update
 * @param {Object} elementToUpdate - data of the element to be updated in the tab;e
 * @param {*} appendFunction  - function to append the element to the table
 * @param {*} functionParams - parameters of the function to append the element to the table
 */
function updateTableElement(rowId, elementToUpdate, appendFunction, functionParams = []){
    // get the index of the element
    let index = $(`tr#${rowId}`).index();

    // remove the element from the table
    removeWorkItemsFromTable([rowId]);

    // add the element to the table
    appendFunction(elementToUpdate, index, ...functionParams);
}


/**
 * Enable the functionality for the trash button
 * @param {Boolean} enable - True if wants to enable the trash button, false if wants to disable
 */
function enableTrashButton(enable){
    
    if (enable){
        $(TRASH_BTN_GENERAL_CLASS).attr("disabled", false);
        $(`${TRASH_BTN_GENERAL_CLASS} i`).removeClass("grayColor");
        $(`${TRASH_BTN_GENERAL_CLASS} i`).addClass("redColor");
    }else{
        $(TRASH_BTN_GENERAL_CLASS).attr("disabled", true);
        $(`${TRASH_BTN_GENERAL_CLASS} i`).removeClass("redColor");
        $(`${TRASH_BTN_GENERAL_CLASS} i`).addClass("grayColor");
    }
}


/**
 * Add user to table for manage table
 * @param {Object} userInfo 
 */
function addUserToTable(userInfo){

    if (_.isEmpty(userInfo)){
        return;
    }

    let td_checkbox = `
    <td class="tableCheckBoxRowElement"> 
        <label class="invisible labelcheckbox"> 
            <input type="checkbox" aria-label="table-row-checkbox" name="checkboxWorkItem[]" value="${userInfo['id']}" class="checkboxRowElement" />
        </label> 
    </td>`;

    let td_edit = `
    <td class="column-edit-team">
        <button value="${userInfo['id']}" class="btn btn-warning edit-user-team-btn">
            <i class="fas fa-user-edit"></i>
        </button>
    </td>`;

    let td_name = `
    <td>
        ${userInfo["fullName"]}
    </td>`;

    let td_email = `
    <td>
        ${userInfo["email"]}
    </td>`;

    let table_row = `
    <tr class="rowValues">
        ${td_checkbox}
        ${td_edit}
        ${td_name}
        ${td_email}
    </tr>`;

    $(`${MANAGE_TABLE_ID} > tbody:last-child`).append(table_row);
}


/**
 * Add a comment to a work item for a project
 * @param {String} projectId 
 * @param {String} workItemId 
 * @param {String} comment 
 */
 async function addCommentToWorkItem(projectId, workItemId, comment, numbeOfCommentSpan=NUMBER_OF_COMMENTS_SPAN){
    
    if (projectId == undefined || workItemId == undefined){
        // TODO: add error message to the user
        alert("Error getting the paramenters to add the comment to work item");
        return;
    }

    // link to make the request
    const API_LINK_ADD_COMMENT = `/dashboard/api/${projectId}/addCommentToWorkItem/${workItemId}`;
    
    // check of comments
    if (comment.trim().length == 0){
        console.error("Cannot add empty comment");
        return;
    }

    // Data to make the request
    const request_data = {comment: comment.trim()}

    let response_error = null;
    const response = await make_post_request(API_LINK_ADD_COMMENT, request_data).catch(err=> {
        response_error = err;
    });
    
    if (response){
        // since the request is done (Success), we can add the html 
        const comment_html = COMMENT_HTML_TEMPLATE.replace(REPLACE_SYMBOL, comment);
        
        addToHtml(USER_COMMENT_CONTAINER, comment_html); // Helper function

        // update the number of comments
        let currentNumberOfComments = parseInt($(numbeOfCommentSpan).text().trim());
        $(numbeOfCommentSpan).text(++currentNumberOfComments);

        return true;
    }else{
        $.notify(response_error.data.responseText, "error");
        return false;
    }
}


/**
 * Remove the work item from the project
 * @param {Array} workItemsId - Array with all work item ids 
 */
 async function removeWorkItems(projectId, workItemsId){
    // TODO: maybe change this to the https: format? 
    const API_LINK_REMOVE_WORK_ITEMS =`/dashboard/api/${projectId}/removeWorkItems`;

    if (!workItemsId || workItemsId.length == 0){
        console.error("Cannot find the work items to remove");
        return;
    }

    const request_data = {workItemsId};

    let response_error = null;
    const response = await make_post_request(API_LINK_REMOVE_WORK_ITEMS, request_data).catch(err=> {
        response_error = err;
    });

    if (response){
        removeCheckedElement();

        $.notify(response, "success");

        // disable the trash button again
        enableTrashButton(false);

        // updating the feedback messages
        updateWorkItemFeedback();
    }else{
        $.notify(response_error.data.responseText, "error");
    }
}


/**
 * In order to focus the work item, click the title when focus
 */
function checkTitleWhenOpen(selectorId){
    try{
        //  PRIOR check if the title has already something in it
        if ($(selector["title"]).val().length == 0){
            showElement(spanTitleMsg);
        }
    }catch(err) {

    }
}

/**
 * Add events for work item update and create
 * @param {Object} element 
 */
function addWorkItemEvents(element){
    
    // When title input is changed
    $(element["title"]).on("input", function () {
    
        // Using functions from helper.js in order to show or hide the elements
        if ( (($(this).val()).length) > 0) {
            hideElement(element["title_span_msg"]);
        } else {
            showElement(element["title_span_msg"]);
        }
    });

    // ADD COMMENT 
    // TODO: refactor this
    $(element["btn_add_comment"]).on("click", function(){
        
        const comment = $(element["discussion"]).val();
        const workItemId = $(WORK_ITEM_ID).val();
        const projectId = $(PROJECT_ID).val();
    
        if (workItemId == undefined || projectId == undefined){
            $.notify("Sorry, We cannot find the information of this work item", "error")
            return;
        }

        if ( (comment && comment.trim().length > 0)){
            
            let commentWasAdded = addCommentToWorkItem(projectId, workItemId, comment.trim(), element["number_of_comments"]);

            // cleaning the dissusion val
            if (commentWasAdded){
                $(element["discussion"]).val("");
            }
        }else{
            $.notify("Sorry, Invalid comment", "error")
            return;
        }
    });

    // TEAM - CHANGE EVENT ON WORK ITEM
    $(element["team"]).on("change", async function () {
    
        // check from where the change trigger is coming
        if (IS_UPDATE_SELECT_OPTION){
            console.log("Canceled on change");
            IS_UPDATE_SELECT_OPTION = false;
            return;
        }

        // clean select opction
        removeAllOptionsFromSelect(
            element["sprint"], 
            null,
        );
        const teamId = $(this).val();
        const projectId = $(PROJECT_ID).val();

        if (!_.isString(teamId) || !_.isString(projectId) || teamId == "0"){
            // $.notify("Invalid team was selected.", "error");
            return;
        }

        const API_LINK_GET_SPRINTS_FOR_TEAM = `/dashboard/api/${projectId}/getTeamSprints/${teamId}`;

        let response_error = null;
        const response = await make_get_request(API_LINK_GET_SPRINTS_FOR_TEAM).catch(err => {
            response_error = err;
        });
        
        // Success message
        if (response){

            if (response.sprints && response.sprints.length > 0){
                for (const sprint of response.sprints) {
                    let optionText = "";
                    
                    if (sprint["_id"] == "0"){
                        optionText = sprint["name"];
                    }else{
                        optionText = `${sprint["name"]} : ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]}`;
                    }
                    
                    updateSelectOption(
                        element["sprint"], 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText}
                    );
                }
            }else{
                $.notify("Sorry, it seems this team does not have sprints yet.", "error");
            }
        }else{ // error messages
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // TYPE - CHANGE EVENT ON WORK ITEM
    $(element["btn_change_type"]).on("click", function () {
        updateCustomSelect(this, element["current_type"], element["type"]);
    });

    // STATUS - CHANGE EVENT ON WORK ITEM
    $(element["btn_change_status"]).on("click", function () {
        updateCustomSelect(this, element["current_status"], element["state"]);
        
        // check if the user assigned have something, if not, them assign this user to the work item
        let selectedStatus = $(this).text().trim();
        let currentAssignedUser = $(element["user"]).val();

        if (selectedStatus != WORK_ITEM_STATUS["New"] && currentAssignedUser == "0"){
            $(element["user"]).val($(CURRENT_USER_ID).val()).change();
        }
    });

    // =============== TAGS ================
    // TAGS - Add tag to work item
    $(element['btn_add_tags']).on("click", function () {

        // get number of element
        let childrens = ($(element["tag_container"]).children()).length;
        
        if (childrens <= MAX_NUMBER_OF_TAGS) {
            $(element["tag_container"]).append(element["tag_template"]);
        } else {
            $.notify(`Each story cannot have more than ${MAX_NUMBER_OF_TAGS} tags`, "error");
        }
    });


    // REMOVE TAGS - work item
    $(document).on("click", element["btn_remove_tag"], function () {
        $(this).parent().remove();

        // Trigger the tags container in oder to active the save button
        $(element["tag_container"]).trigger("change");
    });

    // =====================================
}


/**
 * Update the feedback message from the work item table
*/
function updateWorkItemFeedback(){
    updateNumberOfWorkItems("#numberOfWorkItems");
    updateNumberOfWorkItems("#numberOfActiveWorkItems", "Active");
    updateNumberOfWorkItems("#numberOfReviewWorkItems", "Review");
}


/**
 * Update the text of the box for the feedback
 * @param {String} selector 
 * @param {String} option 
*/
function updateNumberOfWorkItems(selector, option){

    try {
        let numberOfElements = 0;

        if (option == null){
            numberOfElements = $("tr.rowValues").length;

            let text = numberOfElements > 0 ? `${numberOfElements} Work Items`: `${numberOfElements} Work Item`;
            
            $(selector).text(text);
        }else{

            
            let tableHeader = getTableHeadersArray(WORK_ITEM_TABLE);
            let stateIndex = tableHeader.indexOf("state") + 1; // add one couse index is 0 base
            
            $(`tr.rowValues td:nth-child(${stateIndex})`).each(function(i){
                if (option.toLowerCase().trim() === $(this).text().toLowerCase().trim()){
                    numberOfElements++;
                }
            });
            
            
            $(selector).text(numberOfElements);
        }
        $(selector).parent().removeClass("invisible");       
    } catch (error) {
        $(selector).parent().addClass("invisible");       
    }
}


/**
 * Show the feedback message for the checked elements
 * @param {Number} counter - Number of elements
 */
function showFeedbackCheckedElements(counter){
    if (counter > 4){
        // console.log("showing");
        NOTIFY.showGlobalNotification(`${counter} Work items selected`);
    }else{
        // console.log("HIDING");
        NOTIFY.hideGlobalNotifyMsg();
    }
}