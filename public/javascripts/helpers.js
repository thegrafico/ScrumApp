
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

        // click on planing just to show to the user in the sidebar
        $(`#${currentTabs[1]}`).click();
        
        currentTabs.forEach(each=> {$(`#${each}`).addClass("currentTab");})
        return;
    }else{
        $(`#${currentTabValue}`).click();
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
 * Validate if the work item is valid for creation
 * @param {Object} workItem - work item selector ids
 * @returns {Object} - {Boolean, errorMessage}
 */
function validateFormWorkItem(workItem){

    try{
        const title = $(workItem["title"]).val().trim();
        // const state = $(WORK_ITEM["state"]).val();
        // const teamId = $(WORK_ITEM["team"]).val();
        // const type = $(WORK_ITEM["type"]).val();
        // const sprint = $(WORK_ITEM["sprint"]).val();
        const description = $(workItem["description"]).val();
        const points = $(workItem["points"]).val() || 0;
        const priority = $(workItem["priority"]).val() || MAX_PRIORITY_POINTS;
    
        // Validate title
        if (!_.isString(title) || title.length < MIN_LENGTH_TITLE){
            return {isValid: false, msg: `Title cannot be less than ${MIN_LENGTH_TITLE} chars`};
        }

        // validate points
        if ( !_.isEmpty(points) && isNaN(points)){
            return {isValid: false, msg: "Points only accept numbers"};
        }

        // validate priority
        if (!_.isEmpty(priority) && isNaN(priority)){
            return {isValid: false, msg: "Priority only accept numbers"};
        }

    }catch(err){
        return {isValid: false, msg: "Sorry, There was an unexpected error"};
    }

    return {isValid: true, msg: "Valid work item"};
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
                <a href="/dashboard/${workItem["projectId"]}/planing/workitems/${workItem['_id']}" class="open-existing-work-item-modal" target="_blank" rel="${workItem['_id']}">
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
            <td class="storyPointsRow ${workItem['status']}">${workItem['storyPoints']}</td>
        `;
        headers_object["points"] = points;

        // Init row
        let table_row = `<tr class="rowValues ${workItem['status']}" id="${workItem['_id']}">`
        
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

/**
 * Add work item to the sprint baord
 * @param {Object} workItem 
 * @param {Number} index 
 * @param {Boolean} cleanTable 
 */
function addWorkItemToBoard(workItem, index){

    const projectId = $(PROJECT_ID).val();
    let id = workItem["_id"]
    let status = workItem["status"];
    let type = workItem["type"];
    let icon = WORK_ITEM_ICONS[type].icon;
    let user = workItem["assignedUser"];

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

    const link = `/dashboard/${projectId}/planing/workitems/${id}`;
    
    let workItemBoardTemplate = `
    
    <div class="card border-dark mb-3" style="max-width: 20rem;" id="${id}">
        <div class="card-header">
            <span class="table-icon"> 
                <i class="fas ${icon}"></i> 
            </span> 
            ID: ${workItem["itemId"]}
        </div>
        <div class="card-body">
            <h4 class="card-title">
                
                <a href="${link}" class="open-existing-work-item-modal" rel="${id}">  
                   ${workItem["title"]}
                </a> 
                
            </h4>
            ${tags}
            <h4 class="card-botton"> <i class="far fa-user"></i> ${user["name"]} </h4>
        </div>
    </div>`;

    // add at index if user wants to.
    if (index != null){

        let numberOflements = $(`div#${status} > div`).length;

        if (numberOflements != index){
            $(`div#${status} > div`).eq(index).before(workItemBoardTemplate);
        }else{
            $(`div#${status} > div`).eq(index -1).after(workItemBoardTemplate);
        }
        index = null;
    }else{
        // Adding here;
        $(`div#${status}`).append(workItemBoardTemplate);
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
    console.log("Removing checked elements");    
    console.log ("THERE IS: ", $(checkboxClass).length);
    $(checkboxClass).each(function(){
        let rowid = $(this).val();
        // console.log("REMOVING: ", rowid);
        $(`tr#${rowid}`).remove();
    });

    // $(checkboxClass).parent().parent().parent().each(function(){
    //     $(this).remove();
    // });
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
        case PAGES["STATISTICS"]:
            updateStatisticsHtml(updateType, valueToUpdate);
            break;
        case PAGES["WORK_ITEMS"]:

            if (inputType === UPDATE_INPUTS.CREATE_WORK_ITEM){
                appendToWotkItemTable([valueToUpdate], 0, true, false);
            }

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
        case PAGES["BACKLOG"]:
            // adding work item to the backlog only if new work item does not have a sprint assigned
            if (inputType === UPDATE_INPUTS.CREATE_WORK_ITEM){

                if (valueToUpdate["sprint"] == null || valueToUpdate["sprint"]["_id"] === UNASSIGNED_SPRINT["_id"]){
                    appendToWotkItemTable([valueToUpdate], 0, true, false);
                }

            }
            break;
        case PAGES["MANAGE_USER"]:
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
        case PAGES["SPRINT"]:

            // adding work item to the backlog only if new work item does not have a sprint assigned
            if (inputType === UPDATE_INPUTS.CREATE_WORK_ITEM){
                
                const currentSprintSelected = $(FILTER_BY_SPRINT_INPUT).val() || "0";
                console.log(valueToUpdate["sprint"]["_id"], currentSprintSelected);
                if (valueToUpdate["sprint"]["_id"].toString() === currentSprintSelected){
                    appendToWotkItemTable([valueToUpdate], null, true, false);
                    resetColumnOrder();
                }

                break;
            }

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
            break;
        case PAGES["SPRINT_BOARD"]:

            // adding work item to the backlog only if new work item does not have a sprint assigned
            if (inputType === UPDATE_INPUTS.CREATE_WORK_ITEM){
                    
                const currentSprintSelected = $(FILTER_BY_SPRINT_INPUT).val() || "0";
                
                if (valueToUpdate["sprint"]["_id"].toString() === currentSprintSelected){
                    addWorkItemToBoard(valueToUpdate, null, false);
                }

                break;
            }
            break;
        case PAGES["MANAGE_SPRINT"]:
            
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
            break;
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
 * Update Work Item for Sprint board
 * @param {String} elementId 
 * @param {Object} wotkItem 
 */
function updateSprintBoardWorkItem(elementId, workItem){

    const status = workItem["status"];
    const NOT_FOUND = 0;
    let index = $(`div#${status} div#${elementId}`).index();

    console.log("index: ", index);

    // remove element from UI
    removeWorkItemFromBoard(elementId);

    // Check if index is not found
    if (index <= NOT_FOUND){
        addWorkItemToBoard(workItem, null);
    }else{
        addWorkItemToBoard(workItem, index);
    }
}

/**
 * 
*/
function removeWorkItemFromBoard(workItemId){
    $(`div#${workItemId}`).remove();
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
    // console.log("Number of elements to remove: ", workItemsId.length);
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
function checkTitleWhenOpen(selector){
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
                    
                    let isSelected = sprint["_id"].toString() == response["activeSprintId"].toString();
                    
                    if (sprint["_id"] == "0"){
                        optionText = sprint["name"];
                    }else{
                        optionText = formatSprintText(sprint, isSelected);
                    }
                    
                    updateSelectOption(
                        element["sprint"], 
                        UPDATE_TYPE.ADD,
                        {"value": sprint["_id"], "text":optionText},
                        isSelected
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
    updateNumberOfWorkItems("#numberOfCompletedWorkItems", "Completed");
    getPointsAndUpdate("td.storyPointsRow");
}

/**
 * Get story points and update
 * @param {String} selector 
 * @param {Boolean} updateTextValue 
 * @returns 
 */
function getPointsAndUpdate(selector, updateTextValue = true){

    let totalNumberOfPoints = sumTextValueOnClassElement(`${selector}`);
    let totalOfCompletedPoints = sumTextValueOnClassElement(`${selector}.Completed`);
    let totalOfActivePoints = sumTextValueOnClassElement(`${selector}.Active`);
    let totalOfNewPoints = sumTextValueOnClassElement(`${selector}.New`);
    let totalOfReviewPoints = sumTextValueOnClassElement(`${selector}.Review`);

    if (updateTextValue){
        $("#numberOfPoints").text(`${totalNumberOfPoints} Points total`);
    }

    return {
        total: totalNumberOfPoints, 
        completed: totalOfCompletedPoints, 
        active: totalOfActivePoints,
        new: totalOfNewPoints,
        review: totalOfReviewPoints
    };
}


/**
 * Sum the value for a class element
 * @param {String} selector 
 * @returns {Number} - total
 */
function sumTextValueOnClassElement(selector){
    try {
        let total = 0;
        $(selector).each( function(){
            total += parseInt( $(this).text().trim());
        });
        return total;
    } catch (error) {
        return 0;
    }
    
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

        $(selector).parent().attr("disabled", numberOfElements === 0);
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


/**
 * Update link
 * @param {String} selector 
 * @param {String} newLink 
 */
function updateLinkHref(selector, newLink){
    $(selector).attr("href", newLink);
}


/**
 * 
 * @param {Array} data 
 * @param {String} key 
 * @param {Any} value 
 * @param {Boolean} notIn 
 * @returns 
 */
function filterElementsByValue (data, key, value, notIn = false) {
    
    if (notIn){
        return data.filter(each => {return each[key] != value});
    }

    return data.filter(each => {return each[key] == value});

}

/**
 * Return the sum of the values
 * @param {Array} element -  
 * @param {String} key -
 */
function sumObjectValue(element, key){

    let sum = 0;
    
    element.forEach( each => {
        sum += each[key];
    });

    return sum;
}

/**
 * Get the sprint text for the select options
 * @param {Object} sprint 
 * @param {Boolean} isSelected 
 * @returns 
 */
function formatSprintText(sprint, isSelected=false){

    let optionText = '';
                    
    if (isSelected){
        optionText = `${sprint["name"]} : ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]} (current)`;
    }else{
        optionText = `${sprint["name"]} : ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]}`;
    }

    return optionText
}

/**
 * Get the text inside every tag
 * @param {String} workItemSelector 
 * @returns 
 */
function getTags(workItemSelector){
    // get all the tags available
    let tags_available = $(workItemSelector["tags"]).map((_,element) => element.value.trim()).get().filter( element => {
        return !_.isEmpty(element);
    });

    return tags_available;
}


/**
 * Update the status of the work item
 * @param {String} workItemId 
 * @param {String} status 
 */
async function updateWorkItemBoard(workItemId, updateData){

    const projectId = $(PROJECT_ID).val();
    const sprintId  = $(FILTER_BY_SPRINT_INPUT).val();

    const API_LINK_UPDATE_WORK_ITEM_BOARD = `/dashboard/api/${projectId}/updateWorkItemOrder/${workItemId}/${sprintId}`;

    let response_error = null;
    const response = await make_post_request(API_LINK_UPDATE_WORK_ITEM_BOARD, updateData).catch(err=> {
        response_error = err;
    });

    // Success message
    if (response_error){
        $.notify(response_error.data.responseJSON.msg, "error");
    }

}
