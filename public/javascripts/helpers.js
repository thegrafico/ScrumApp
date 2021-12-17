/**
 * expected value of param is {id: .., type: ..., null: ...}
 * @param {String} formId - id of the form
 * @param {Array[Object]} formParams - Form parameters. Expecting {id, type, null}
 * @returns {Boolean} True if the form is valid
 */
function validateForm(formParams) {
    let formIsValid = true;

    // validate each parameter
    for (param of formParams) {

        // if the param has the null key and the param cannot be null
        if (param["null"] != true) {
            console.log("Evaluating params");

            // get the value of the element
            let paramValue = $(param["id"]).val();
            console.log("The value of the param is: ", paramValue);

            if (param["type"] == "string") {
                if (paramValue == "" || paramValue.length == 0 || paramValue.length > param["limit"]) {
                    showErrSpanMessage(param["spanId"], param["errMsg"]);
                    formIsValid = false;
                } else {
                    hideErrSpanMessage(param["spanId"]);
                }
            } else { //number
                if (isNaN(paramValue)) {
                    showErrSpanMessage(param["spanId"], param["errMsg"]);
                    formIsValid = false;
                } else {
                    hideErrSpanMessage(param["spanId"]);
                }
            }

        }
    }
    return formIsValid;
}

/**
 * Check if a string contains symbols
 * @param {String} string 
 */
function containsSymbols(string){
    return INVALID_SYMBOLS.test(string);
}

/**
 * Show a span element with an error message
 * @param {String} spanId - id of the span to show
 * @param {String} message - message the span will have 
 * @returns {null}
 */
function showErrSpanMessage(spanId, message) {
    $(spanId).text(message);
    $(spanId).removeClass("invisible");
}

/**
 * show an HTML element if the element has the class d-none
 * @param {String} elementId - id of the span to show
 */
function showElement(elementId) {
    $(elementId).removeClass("d-none");
    $(elementId).removeClass("invisible");
}

/**
 * Hide a HTML element
 * @param {String} elementId - id of the span to show
 */
function hideElement(elementId) {
    $(elementId).addClass("d-none");
    $(elementId).addClass("invisible");
}
/**
 * hide a span element
 * @param {String} spanId id of the span message 
 */
function hideErrSpanMessage(spanId) {
    $(spanId).text('');
    $(spanId).addClass("invisible");
}

/**
 * Validate if email
 * @param {String} email 
 * @returns {Boolean} - True if the email is valid
 */
function isEmail(email) {
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
function showActiveTab() {

    currentTabValue = $("#currentTab").val();

    if (currentTabValue.includes(",")) {

        currentTabs = currentTabValue.split(",");

        // click on planing just to show to the user in the sidebar
        $(`#${currentTabs[1]}`).click();

        currentTabs.forEach(each => {
            $(`#${each}`).addClass("currentTab");
        })
        return;
    } else {
        $(`#${currentTabValue}`).click();
    }

    $(`#${currentTabValue}`).addClass("currentTab");
}

/**
 * Toggle the filter element
 */
function toggleFilter() {
    let filterDiv = "#filterDiv";
    $(filterDiv).toggle();
}


/**
 * Add html to an container
 * @param {String} containerId 
 * @param {String} html 
 */
function addToHtml(containerId, html) {
    $(containerId).prepend(html);
}

/**
 * Send a request to the backend
 * @param {String} link - Link where the request goes
 * @param {Object} data - Object with the data to be send
 * @returns {Promise} True if the request was sent successfully
 */
function make_post_request(link, data) {
    return new Promise((resolve, reject) => {

        showLoader();

        const response = $.post(link, data,
                function () {
                    console.log("Sent!");
                })
            .done(function (data, status) {
                // console.log(data, status);
                return resolve(data, status);
            })
            .fail(function (data, status) {
                // console.log(data, status);
                return reject({
                    data,
                    status
                });
            }).always(function () {
                hideLoader();
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
function make_get_request(link) {
    return new Promise((resolve, reject) => {
        showLoader();
        const response = $.get(link,
                function () {})
            .done(function (data, status) {
                return resolve(data, status);
            })
            .fail(function (data, status) {
                return reject({
                    data,
                    status
                });
            }).always(function () {
                hideLoader();
            });
    });
}

function showLoader () {
    $(LOADER["element"]).addClass(LOADER["spinner"]);
    $(LOADER["container"]).removeClass("d-none");
}

function hideLoader (){
    $(LOADER["element"]).removeClass(LOADER["spinner"]);
    $(LOADER["container"]).addClass("d-none");
}

// TODO: Implement timeout on Promise
// https://italonascimento.github.io/applying-a-timeout-to-your-promises/

/**
 * Return the value of the new value if is different from current
 * @param {Object} currentVal 
 * @param {Object} newVal 
 * @returns new value if current and new are different, otherwise retun undefined 
 */
function swap(currentVal, newVal) {

    // console.log(`Current: ${currentVal}, New: ${newVal}. Result ${currentVal != newVal}`);
    if (currentVal != newVal) {
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
    showElement(spanTitleMsg);

    // reset assigned user
    $(element["user"]).val(0).trigger("change");

    // reset tags
    $(`${element["tag_container"]} span`).remove();

    // reset status
    $(`${element["btn_change_status"]} span.New`)[0].click();

    // reset type
    $(`${element["btn_change_type"]} span.Story`)[0].click();

    // Reset description
    $(element["description"]).val("");

    // reset points
    $(element["points"]).val("");

    // reset priority
    $(element["priority"]).val(PRIORITY_POINTS["Low"]).change();

    // reset discussion
    $(element["discussion"]).val("");

    // reset links
    $(RELATIONSHIP_WORK_ITEM_CONTAINER).empty();
}

/**
 * Update custom select options
 * @param {Object} currentElement - this element - current element
 * @param {String} tagCurrentItem - current tag item for the html
 * @param {String} tagInputItem - hidden input tag
 */
function updateCustomSelect(currentElement, tagCurrentItem, tagInputItem) {
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
function validateFormWorkItem(workItem) {

    try {
        const title = $(workItem["title"]).val().trim();
        // const state = $(WORK_ITEM["state"]).val();
        // const teamId = $(WORK_ITEM["team"]).val();
        // const type = $(WORK_ITEM["type"]).val();
        // const sprint = $(WORK_ITEM["sprint"]).val();
        const description = $(workItem["description"]).val();
        const points = $(workItem["points"]).val() || 0;
        const priority = $(workItem["priority"]).val() || MAX_PRIORITY_POINTS;

        // Validate title
        if (!_.isString(title) || title.length < MIN_LENGTH_TITLE) {
            return {
                isValid: false,
                msg: `Title cannot be less than ${MIN_LENGTH_TITLE} chars`
            };
        }

        // validate points
        if (!_.isEmpty(points) && isNaN(points)) {
            return {
                isValid: false,
                msg: "Points only accept numbers"
            };
        }

        // validate priority
        if (!_.isEmpty(priority) && isNaN(priority)) {
            return {
                isValid: false,
                msg: "Priority only accept numbers"
            };
        }

    } catch (err) {
        return {
            isValid: false,
            msg: "Sorry, There was an unexpected error"
        };
    }

    return {
        isValid: true,
        msg: "Valid work item"
    };
}

function cleanTable(tableId) {
    $(`${tableId} > tbody`).empty();
}

/**
 * get the header of the nable
 * @param {String} tableId 
 * @return {Array} header of the table in order 
 */
function getTableHeadersArray(tableId) {

    let header = [];
    // Get each th Which is a table header
    $(`${tableId} thead tr.tableHeader th`).each(function () {
        header_text = $(this).text().trim().toLowerCase();
        // header[header_text] = header_text;
        header.push(header_text)
    });

    return header;
}

/**
 * Get the text inside the search
 * @param {String} searchId 
 */
function getSearchInput(searchId){
    return document.getElementById(searchId).value.toLowerCase();
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
function appendToWotkItemTable(workItems, index = null, showIfSprint = true, removeTable = true, activeSprintId = "0") {

    if (!_.isArray(workItems) || _.isEmpty(workItems)) {
        console.log("Work items is empty");
        return;
    }

    if (removeTable) {
        // clean the table
        cleanTable(WORK_ITEM_TABLE);
    }

    let headers_array = getTableHeadersArray(WORK_ITEM_TABLE);
    let headers_object = {};

    for (let i = 0; i < workItems.length; i++) {
        const workItem = workItems[i];

        // if showIfSprint if false, and the work item have a sprint
        if (!showIfSprint && workItem["sprint"] && workItem["sprint"]["_id"] != "0") {
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
        let order = `<td class="orderColumn"> <span> ${i+1} </span></td>`;
        headers_object["order"] = order;


        // ID
        let id = `<td class="tableColumnID"> <span> ${workItem['itemId']} </span></td>`;
        headers_object["id"] = id;


        // TYPE
        let type = `
            <td class="d-none"> <i class="fas ${WORK_ITEM_ICONS[workItems[i]['type']].icon}"></i> <span>${workItem['type']} </span> </td>
        `;
        headers_object["type"] = type;

        // TITLE
        let title = `
            <td class="openStory">
                <a href="/dashboard/${workItem["projectId"]}/planing/workitems/${workItem['_id']}" class="open-existing-work-item-modal" target="_blank" rel="${workItem['_id']}">
                    <i class="fas  ${WORK_ITEM_ICONS[workItems[i]['type']].icon}"></i> 
                    <span> ${workItem['title']} </span>
                </a> 
            </td>
        `;
        headers_object["title"] = title;

        // SUB MENU
        let submenu = getPageSubMenu($(CURRENT_PAGE_ID).val(), workItem['_id'], activeSprintId);
        headers_object["submenu"] = submenu;


        // USER
        let userid = workItem["assignedUser"]["id"] || UNNASIGNED_VALUE;
        let assigned = `
            <td> 
                <i class="fas fa-user-astronaut"></i> 
                <span class="userName ${userid}">
                    ${workItem["assignedUser"]["name"]}
                </span> 
            </td>
        `;
        headers_object["assigned"] = assigned;


        // STATUS
        let state = `
            <td><i class="fa fa-circle ${workItem['status']}Color" aria-hidden="true"></i> <span> ${workItem['status']} </span></td>
        `;
        headers_object["state"] = state;

        // TEAM
        if (workItem["team"] && workItem["team"]["name"]) {
            let team = `
                <td class="teamColumnName ${workItem["team"]["_id"]}"> <span> ${workItem["team"]["name"]} </span></td>
            `;
            headers_object["team"] = team;
        }

        // SPRINT
        if (workItem["sprint"] && workItem["sprint"]["name"]) {
            let iteration = `
                <td class="sprintColumnName ${workItem['sprint']['_id']}"> 
                    <span> ${workItem["sprint"]["name"]} </span>
                </td>
            `;
            headers_object["iteration"] = iteration;
        }

        // TAGS
        let tags = null;
        if (workItem["tags"].length > 0) {
            let spans = "";
            workItem["tags"].forEach(tag => {
                spans += `<span class="btn btn-info disabled btn-sm tags-container">${tag}</span> `;
            });

            tags = `<td class="tags-td"> ${spans} </td>`
        } else {
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
            <td class="storyPointsRow ${workItem['status']}"> <span> ${workItem['storyPoints']} </span></td>
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
        if (index != null) {

            let numberOflements = $(`${WORK_ITEM_TABLE} > tbody > tr`).length;

            if (index == 0 && numberOflements == 0){
                $(`${WORK_ITEM_TABLE} > tbody:last-child`).append(table_row);
            }else if (numberOflements != index) {
                $(`${WORK_ITEM_TABLE} > tbody > tr`).eq(index).before(table_row);
            } else {
                $(`${WORK_ITEM_TABLE} > tbody > tr`).eq(index - 1).after(table_row);
            }
            index = null;
        } else {
            $(`${WORK_ITEM_TABLE} > tbody:last-child`).append(table_row);
        }
    }

}

/**
 * Get the work item sub menu
 * @param {String} page 
 */
function getPageSubMenu(page, workItemId, activeSprintId) {

    let subMenuHtml = "";
    switch (page) {

        case PAGES["WORK_ITEMS"]:
            subMenuHtml = `
            <td class="tdWorkItemSubMenu">
                <span class="btn btn-outline-info workItemOpenSubMenu" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v workItemSubMenuIcon"></i>
                </span>
                <div id="workItemSubMenu" class="dropdown-menu " data-bs-popper="none">
                    <a class="dropdown-item subMenuItem subMenuAssignUser"  data-toggle="modal" data-target="#assign-to-user-modal" href="#" id="${workItemId}">
                        Assign to a user <i class="fas fa-user-astronaut"></i>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item subMenuItem subMenuAssignTeam" data-toggle="modal" data-target="#assign-to-team-modal" href="#" id="${workItemId}">
                        Assign to a team <i class="fas fa-users"></i>
                    </a>
            </td>`;
            break;

        case PAGES["BACKLOG"]:
            subMenuHtml = `
            <td class="tdWorkItemSubMenu">
                <span class="btn btn-outline-info workItemOpenSubMenu" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v workItemSubMenuIcon"></i>
                </span>
                <div id="workItemSubMenu" class="dropdown-menu " data-bs-popper="none">                     
                    <a class="dropdown-item subMenuItem subMenuAssignTeam subMenuMoveToSprint" data-toggle="modal" data-target="#move-to-sprint-modal" href="#" id="${workItemId}">
                        Move to sprint...
                    </a>
                </div>
            </td>`;
            break;
        case PAGES["SPRINT"]:
            subMenuHtml = `
            <td class="tdWorkItemSubMenu">
                <span class="btn btn-outline-info workItemOpenSubMenu" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v workItemSubMenuIcon"></i>
                </span>
                <div id="workItemSubMenu" class="dropdown-menu " data-bs-popper="none">
                    <a class="dropdown-item subMenuItem subMenuSprintItem moveToBacklog" href="#" rel="${UNNASIGNED_VALUE}" id="${workItemId}">
                        Move to Backlog
                    </a>                                        
                </div>
            </td>`;
            break;
        default:
            break;
    }

    return subMenuHtml;
}

/**
 * Add work item to the sprint baord
 * @param {Object} workItem 
 * @param {Number} index 
 * @param {Boolean} cleanTable 
 */
function addWorkItemToBoard(workItem, index) {

    const projectId = getProjectId();
    const id = workItem["_id"];
    const user = workItem["assignedUser"];
    const userId = user["id"] || UNNASIGNED_VALUE;
    let status = workItem["status"];
    let type = workItem["type"];
    let icon = WORK_ITEM_ICONS[type].icon;

    // TAGS
    let tags = null;
    if (workItem["tags"].length > 0) {
        let spans = "";
        workItem["tags"].forEach(tag => {
            spans += `<span class="btn btn-info disabled btn-sm tags-container">${tag}</span> `;
        });

        tags = `<td class="tags-td"> ${spans} </td>`
    } else {
        tags = "<td class='tags-td'>   </td>"
    }

    const link = `/dashboard/${projectId}/planing/workitems/${id}`;

    let workItemBoardTemplate = `
    
    <div class="card border-dark mb-3" style="max-width: 20rem;" id="${id}">
        <div class="card-header">
            <span class="table-icon mr-1"> 
                <i class="fas ${icon}"></i> 
            </span> 
            <span>
                ID: ${workItem["itemId"]}
            </span>
        </div>
        <div class="card-body">
            <h4 class="card-title">
                
                <a href="${link}" class="open-existing-work-item-modal" rel="${id}">  
                   ${workItem["title"]}
                </a> 
                
            </h4>
            ${tags}
            <h4 class="card-botton"> <i class="far fa-user"></i> <span class="userName ${userId}"> ${user["name"]} </span></h4>
        </div>
    </div>`;

    // add at index if user wants to.
    console.log("INDEX: ", index);
    if (index != null) {

        let numberOflements = $(`div#${status} > div`).length;
        
        if (index == 0 && numberOflements == 0){
            $(`div#${status}`).append(workItemBoardTemplate);
        }else if (numberOflements != index) {
            $(`div#${status} > div`).eq(index).before(workItemBoardTemplate);
        } else {
            $(`div#${status} > div`).eq(index - 1).after(workItemBoardTemplate);
        }
        index = null;
    } else {
        // Adding here;
        $(`div#${status}`).append(workItemBoardTemplate);
    }
}

/**
 * Clean sprint board
 * @param {Array} workItemStatuses - array with the id inside the divs 
 */
function cleanSprintBoard(workItemStatuses = Object.keys(WORK_ITEM_STATUS)) {
    for (let divId of workItemStatuses) {
        $(`div#${divId}`).empty();
    }
}

function highliteWorkItemRow(checkedElement, checkElement) {
    // get the parent element. In this case, it will be the the label element
    let _parent = $(checkedElement).parent();

    // since we are changing the whole row, we need the element that has everything inside
    let granFather = $(_parent).parent().parent();

    let atLeastOneCheckBoxIsChecked = ($(`${TABLE_ROW_CHECKBOX_ELEMENT}:checked`).length > 0);

    enableTrashButton(atLeastOneCheckBoxIsChecked);

    if (checkElement) {
        _parent.removeClass("invisible");
        granFather.addClass(HIGHLIGST_CLASS);
    } else {
        _parent.addClass("invisible");
        granFather.removeClass(HIGHLIGST_CLASS);
    }
}

/**
 * Get all checked elements
 * @param {String} selector 
 * @returns 
 */
function getCheckedElements(selector) {
    return $(`${selector}:checked`);
}


/**
 * Get id of checked elements
 * @param {String} elementClassOrId - selector
 * @param {Boolean} onlyVisibles - get only visibles elements in the UI
 * @returns {Array}
 */
function getCheckedElementIds(elementClassOrId, onlyVisibles = true) {
    let row_checked = []

    if (onlyVisibles){

        $(`${elementClassOrId}:visible`).each(function () {

            row_checked.push($(this).val())
        });
    
    }else{
        $(elementClassOrId).each(function () {
            row_checked.push($(this).val())
        });

    }

    return row_checked;
}



/**
 * Remove the checkbox element from the table
 * @param {String} checkboxClass 
 */
function removeCheckedElement(checkboxClass = TABLE_ROW_CHECKBOX_ELEMENT_CHECKED) {
    console.log("Removing checked elements");
    console.log("THERE IS: ", $(checkboxClass).length);
    $(checkboxClass).each(function () {
        let rowid = $(this).val();
        // console.log("REMOVING: ", rowid);
        $(`tr#${rowid}`).remove();
    });
}

/**
 * Add the disable attr to an select element and set the default to be the current
 * @param {String} selectElement 
 * @param {String} value 
 */
function addDisableAttr(selectElement, value) {
    $(`${selectElement}`).children(`[value="${value}"]`).attr('disabled', true);
    $(selectElement).val("0").change();
}

/**
 * 
 * @param {String} selectId - id of the select element
 * @param {Boolean} enable - true to enable the disabled attr
 */
function setDisabledAttr(selectId, enable) {
    $(selectId).attr("disabled", enable);
}

/**
 * Return if there is at least one element checked from the selector class
 * @param {String} inputClassCheckbox - class that the input element has 
 * @returns {Boolean} True if there is at least one elemenet checked
 */
function anyCheckboxChecked(inputClassCheckbox) {
    return ($(`${inputClassCheckbox}:checked`).length > 0);
}

/**
 * Remove the disable attr from select options
 * @param {String} selectElement 
 * @param {String} values 
 */
function removeDisableAttr(selectElement, values) {

    if (_.isEmpty(selectElement) || !_.isArray(values)) {
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
function removeWorkItemsFromTable(workItems) {

    if (!_.isArray(workItems) || _.isEmpty(workItems)) {
        console.error("Cannot remove the work item from table 'cause is either empty or undefined");
        return;
    }

    for (let itemId of workItems) {
        $(`tr#${itemId}`).remove();
    }
    enableTrashButton(false);
}


function removeAllDisableAttr(selectElement) {
    $(`${selectElement} *`).attr('disabled', false);
}

/**
 * Clean the input id
 * @param {String} inputId 
 */
function cleanInput(inputId) {
    $(inputId).val('');
}

/**
 * clean select opction
 * @param {String} selectId 
 */
function cleanSelect(selectId) {
    $(selectId).prop('selectedIndex', 0);
}


/**
 * Update a select opction
 * @param {String} selectId - id of the select option
 * @param updateType.ADD  add the new value to the select
 * @param updateType.DELETE remove the value from the select
 * @param valueToUpdate.value - value to add or remove
 * @param valueToUpdate.text - text value for select
 * @param {Object} addDataAttribute Add attributes to the select option
 * 
 */
function updateSelectOption(selectId, updateType, valueToUpdate, selected = false, addDataAttribute = null) {

    if (updateType == UPDATE_TYPE.ADD) {
        $(selectId).append(new Option(valueToUpdate.text, valueToUpdate.value, false, selected));

        // in case the select option has a data attribute
        if (addDataAttribute) {

            // adding attribute to the select option just created
            for (let key of Object.keys(addDataAttribute)) {
                $(`${selectId} option[value=${valueToUpdate.value}]`).attr(`data-${key}`, addDataAttribute[key]);
            }
        }

    } else if (updateType == UPDATE_TYPE.DELETE) {
        $(`${selectId} option[value=${valueToUpdate}]`).remove();
    } else if (updateType == UPDATE_TYPE.CHANGE) {
        IS_UPDATE_SELECT_OPTION = true;
        $(selectId).val(valueToUpdate).change();
    }
}

/**
 * Show a popup message at the top of the element
 * @param {String} selector id or class of the element
 * @param {String} message - message to show
 * @param {String} style - style class ("success" | "error" | "warning")
 * @param {Number} duration - duration in seconds
 */
function showPopupMessage(selector, message, style = "error", position = "right", duration = null) {

    let params = {
        position: position,
        autoHide: true,
        clickToHide: true,
        className: style
    };

    if (duration) {
        params["autoHideDelay"] = duration * 1000;
    }

    $(selector).notify(message, params);
}


/**
 * Remove all options from select and add a default value
 * @param {String} selectId - if of the select option
 * @param defaultValue.text - text value of default
 * @param defaultValue.value  - value of the default
 */
function removeAllOptionsFromSelect(selectId, defaultValue) {

    if (_.isUndefined(defaultValue) || _.isNull(defaultValue)) {
        $(selectId)
            .find('option')
            .remove()
            .end()
        // .trigger("change");
    } else {
        $(selectId)
            .find('option')
            .remove()
            .end()
            .append(new Option(defaultValue.text, defaultValue.value, false, false))
        // .trigger("change", ["Parant", "Parant2"]);
    }

}

function unCheckAll() {

    let is_checked = $(CHECK_ALL_CHECKBOX_TABLE_ROWS).prop("checked");

    if (is_checked) {
        $(CHECK_ALL_CHECKBOX_TABLE_ROWS).click();
    }
}

/**
 * Move a work item to the next sprint
 * @param {Array} workItemId - Array with the Ids of the work items
 * @param {String} sprintId - id of the sprint. if null, then is sent to the backlog 
 * @returns {Boolean} - true if work items were moved
 */
async function moveWorkItemToSprint(workItemId, sprintId) {

    // check work item
    if (_.isUndefined(workItemId) || _.isEmpty(workItemId) || !_.isArray(workItemId)) {
        $.notify("Invalid work item was selected.", "error");
        return;
    }

    // check project id information
    const projectId = getProjectId();
    if (_.isUndefined(projectId) || _.isEmpty(projectId)) {
        $.notify("Sorry, we cannot find the project information. Try later", "error");
        return;
    }


    const teamId = $(FILTER_BY_TEAM_GENERAL_CLASS).val();
    if (_.isUndefined(teamId) || _.isEmpty(teamId)) {
        $.notify("Please select a team to move to work item.", "error");
        return;
    }

    const data = {
        "sprintId": sprintId,
        workItemIds: workItemId
    };

    // link to make the request
    const API_LINK_MOVE_WORK_ITEM_TO_SPRINT = `/dashboard/api/${projectId}/moveWorkItemsToSprint/${teamId}`;

    let response_error = null;
    const response = await make_post_request(API_LINK_MOVE_WORK_ITEM_TO_SPRINT, data).catch(err => {
        response_error = err;
    });

    let workItemsWereMoved = false;
    if (response) {
        $.notify(response.msg, "success");
        removeWorkItemsFromTable(workItemId);
        workItemsWereMoved = true;
    } else {
        $.notify(response_error.data.responseJSON.msg, "error");
    }

    unCheckAll();

    return workItemsWereMoved;
}


/**
 * Update HMTL after a POST request was successful
 * @param {String} currentPage - current page the user at
 * @param {String} updateType - type of updete - ADD, UPDATE, REMOVE
 * @param {Any} valueToUpdate - Value to update
 * @param {Object} inputType  - Input type 
 * @param {Object} others - Additional data if needed 
 */
function updateHtml(currentPage, updateType, valueToUpdate, inputType, others = null) {

    // since most of the page share the same top navbar, we can update those values just once
    updateUIFromTopNabvar(inputType, updateType, valueToUpdate);

    switch (currentPage) {
        case PAGES["STATISTICS"]:
            updateStatisticsHtml(updateType, valueToUpdate);
            break;
        case PAGES["WORK_ITEMS"]:

            // update from create work item
            if (inputType === UPDATE_INPUTS.CREATE_WORK_ITEM) {
                appendToWotkItemTable([valueToUpdate], 0, true, false);
            }

            // update from top navbar menu
            if (inputType === UPDATE_INPUTS.USER) {

                // update create work item modal 
                updateSelectOption(WORK_ITEM["user"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["user"], updateType, valueToUpdate);

                // update filter if user is removed from filter
                updateOptionFromFilter(FILTER_OPTIONS["user"], updateType, valueToUpdate);

                // remove user from table
                if (updateType == UPDATE_TYPE["DELETE"]) {
                    // change the name for unnasigned in the UI
                    $(`.rowValues span.userName.${valueToUpdate}`).text(UNNASIGNED_NAME);

                    // remove any record of the user in this row
                    $(`.rowValues span.userName.${valueToUpdate}`).removeClass(valueToUpdate);
                }
            }

            if (inputType === UPDATE_INPUTS.TEAM) {
                 // work item
                updateSelectOption(WORK_ITEM["team"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["team"], updateType, valueToUpdate);

                // updating filter by team
                updateOptionFromFilter(FILTER_OPTIONS["team"], updateType, valueToUpdate);
                // remove team from table
                if (updateType == UPDATE_TYPE["DELETE"]) {
                    // change the name for unnasigned in the UI
                    $(`.rowValues .teamColumnName.${valueToUpdate}`).text(UNNASIGNED_NAME);

                    // if the team is deleted, then we should remove sprints reference in table
                    $(`.rowValues .teamColumnName.${valueToUpdate}`).parent().find(".sprintColumnName").text(UNNASIGNED_NAME);

                    // remove the team reference from the table
                    $(`.rowValues .teamColumnName.${valueToUpdate}`).removeClass(valueToUpdate);

                }
            }

            if (inputType === UPDATE_INPUTS.SPRINT) {

                // check if we have sprint
                if (others && others["sprint"]) {
                    
                    // now check the team for that sprint is selected
                    let teamSelected = $(WORK_ITEM["team"]).val();

                    // if the team is not the same of the sprint created, then ignored
                    if (teamSelected.toString() != others["sprint"]["teamId"].toString()){
                        break
                    }
                }

                updateSelectOption(WORK_ITEM["sprint"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["sprint"], updateType, valueToUpdate);

                // remove team from table
                if (updateType == UPDATE_TYPE["DELETE"]) {
                    // change the name for unnasigned in the UI
                    $(`.rowValues .sprintColumnName.${valueToUpdate}`).text(UNNASIGNED_NAME);

                    $(`.rowValues .sprintColumnName.${valueToUpdate}`).removeClass(valueToUpdate);
                }
            }
            break;
        case PAGES["BACKLOG"]:
            // adding work item to the backlog only if new work item does not have a sprint assigned
            if (inputType === UPDATE_INPUTS.CREATE_WORK_ITEM) {
                if (valueToUpdate["sprint"] == null || valueToUpdate["sprint"]["_id"] === UNASSIGNED_SPRINT["_id"]) {
                    appendToWotkItemTable([valueToUpdate], 0, true, false);
                }
            }

            // update from top navbar menu
            if (inputType === UPDATE_INPUTS.USER) {

                // update create work item modal 
                updateSelectOption(WORK_ITEM["user"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["user"], updateType, valueToUpdate);


                // update the remove user from project option
                updateSelectOption(MODAL_REMOVE_USER_INPUT, updateType, valueToUpdate);

                // update filter if user is removed from filter
                updateOptionFromFilter(FILTER_OPTIONS["user"], updateType, valueToUpdate);

                // remove user from table
                if (updateType == UPDATE_TYPE["DELETE"]) {
                    // change the name for unnasigned in the UI
                    $(`.rowValues span.userName.${valueToUpdate}`).text(UNNASIGNED_NAME);

                    // remove any record of the user in this row
                    $(`.rowValues span.userName.${valueToUpdate}`).removeClass(valueToUpdate);
                }
            }

            // check update in teams
            if (inputType === UPDATE_INPUTS.TEAM) {
                // work item
                updateSelectOption(WORK_ITEM["team"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["team"], updateType, valueToUpdate);

                // updating filter by team
                updateOptionFromFilter(FILTER_OPTIONS["team"], updateType, valueToUpdate);
            }

            // check update in sprints
            if (inputType === UPDATE_INPUTS.SPRINT) {

                // check if we have sprint
                if (others && others["sprint"]) {
                    
                    // now check the team for that sprint is selected
                    let teamSelected = $(WORK_ITEM["team"]).val();

                    // if the team is not the same of the sprint created, then ignored
                    if (teamSelected.toString() != others["sprint"]["teamId"].toString()){
                        break
                    }
                }

                updateSelectOption(WORK_ITEM["sprint"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["sprint"], updateType, valueToUpdate);
            }
            break;
        case PAGES["SPRINT"]:

            // adding work item to the backlog only if new work item does not have a sprint assigned
            if (inputType === UPDATE_INPUTS.CREATE_WORK_ITEM) {

                const currentSprintSelected = $(FILTER_BY_SPRINT_INPUT).val() || "0";
                if (valueToUpdate["sprint"]["_id"].toString() === currentSprintSelected) {
                    appendToWotkItemTable([valueToUpdate], null, true, false);
                    resetColumnOrder();
                }

                break;
            }

            // update from top navbar menu
            if (inputType === UPDATE_INPUTS.USER) {

                // update create work item modal 
                updateSelectOption(WORK_ITEM["user"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["user"], updateType, valueToUpdate);

                // update filter if user is removed from filter
                updateOptionFromFilter(FILTER_OPTIONS["user"], updateType, valueToUpdate);

                // remove user from table
                if (updateType == UPDATE_TYPE["DELETE"]) {
                    // change the name for unnasigned in the UI
                    $(`.rowValues span.userName.${valueToUpdate}`).text(UNNASIGNED_NAME);

                    // remove any record of the user in this row
                    $(`.rowValues span.userName.${valueToUpdate}`).removeClass(valueToUpdate);
                }
            }

            if (inputType === UPDATE_INPUTS.TEAM) {
                // work item
                updateSelectOption(WORK_ITEM["team"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["team"], updateType, valueToUpdate);

                // updating filter by team
                updateOptionFromFilter(FILTER_OPTIONS["team"], updateType, valueToUpdate);
            }

            // check update in sprints
            if (inputType === UPDATE_INPUTS.SPRINT) {

                // check if we have sprint
                if (others && others["sprint"]) {
    
                    // now check the team for that sprint is selected
                    let teamSelected = $(WORK_ITEM["team"]).val();

                    // if the team is not the same of the sprint created, then ignored
                    if (teamSelected != others["sprint"]["teamId"].toString()){
                        break;
                    }
                }

                updateSelectOption(WORK_ITEM["sprint"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["sprint"], updateType, valueToUpdate);
                
                // SPRINT FILTERING
                updateSelectOption(SPRINT_FILTER_BY_SPRINT_SELECT, updateType, valueToUpdate);
                updateSelectOption(FILTER_BY_TEAM_SPRINT, updateType, valueToUpdate);
            }


            break;
        case PAGES["SPRINT_BOARD"]:

            // adding work item to the backlog only if new work item does not have a sprint assigned
            if (inputType === UPDATE_INPUTS.CREATE_WORK_ITEM) {

                const currentSprintSelected = $(FILTER_BY_SPRINT_INPUT).val() || "0";

                if (valueToUpdate["sprint"]["_id"].toString() === currentSprintSelected) {
                    addWorkItemToBoard(valueToUpdate, null, false);
                }
            }

            // update from top navbar menu
            if (inputType === UPDATE_INPUTS.USER) {

                // update create work item modal 
                updateSelectOption(WORK_ITEM["user"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["user"], updateType, valueToUpdate);

                // remove user from table
                if (updateType == UPDATE_TYPE["DELETE"]) {
                    // change the name for unnasigned in the UI
                    $(`span.userName.${valueToUpdate}`).text(UNNASIGNED_NAME);

                    // remove any record of the user in this row
                    $(`span.userName.${valueToUpdate}`).removeClass(valueToUpdate);
                }
            }

            // check update in teams
            if (inputType === UPDATE_INPUTS.TEAM) {

                // check if update is delete and has deleted the same team is active
                if (updateType == UPDATE_TYPE["DELETE"]) {

                    // update the page if the current active team was removed
                    refreshIfCurrentItemWasRemoved(valueToUpdate, FILTER_BY_TEAM_SPRINT);
                }

                // work item
                updateSelectOption(WORK_ITEM["team"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["team"], updateType, valueToUpdate);

                // update filter by team in page
                updateSelectOption(FILTER_BY_TEAM_SPRINT, updateType, valueToUpdate);
            }

            // check update in sprints
            if (inputType === UPDATE_INPUTS.SPRINT) {

                // check if we have sprint
                if (others && others["sprint"]) {
    
                    // now check the team for that sprint is selected
                    let teamSelected = $(WORK_ITEM["team"]).val();

                    // if the team is not the same of the sprint created, then ignored
                    if (teamSelected.toString() != others["sprint"]["teamId"].toString()){
                        break
                    }
                }

                if (updateType == UPDATE_TYPE["DELETE"]) {
                    // update the page if the current active team was removed
                    refreshIfCurrentItemWasRemoved(valueToUpdate, FILTER_BY_SPRINT_INPUT);
                }

                // update work items
                updateSelectOption(WORK_ITEM["sprint"], updateType, valueToUpdate);
                updateSelectOption(UPDATE_WORK_ITEM["sprint"], updateType, valueToUpdate);

                // update filter by sprint
                updateSelectOption(FILTER_BY_SPRINT_INPUT, updateType, valueToUpdate);
            }

            break;
        case PAGES["MANAGE_USER"]:

            if (inputType === UPDATE_INPUTS.USER) {

                if (updateType == UPDATE_TYPE["ADD"]) {
                    addUserToTable(others);
                } else if (updateType == UPDATE_TYPE["DELETE"]) {
                    $(`.rowValues#${valueToUpdate}`).remove();
                }
            }

            break;
        case PAGES["MANAGE_SPRINT"]:

            // SPRINT
            if (inputType === UPDATE_INPUTS.SPRINT) {

                // in case we received a sprint
                if (others && others["sprint"]) {
                    addSprintToTable(others["sprint"]);
                }

                if (updateType == UPDATE_TYPE["DELETE"]) {
                    $(`.rowValues#${valueToUpdate}`).remove();
                }
            }

            // TEAM 
            if (inputType === UPDATE_INPUTS.TEAM) {

                if (updateType == UPDATE_TYPE["DELETE"]){
                    // update the page if the current active team was removed
                    refreshIfCurrentItemWasRemoved(valueToUpdate, UPDATE_FILTER_BY_TEAM);
                }

                updateSelectOption(UPDATE_FILTER_BY_TEAM, updateType, valueToUpdate);

            }
            break;
        case PAGES["MANAGE_TEAM"]:

            // TEAM 
            if (inputType === UPDATE_INPUTS.TEAM) {

                // update select team from add user
                updateSelectOption(SELECT_TEAM_TO_ADD_USER_INPUT, updateType, valueToUpdate);

                if (updateType == UPDATE_TYPE["ADD"]){
                    if (others && others["team"]){
                        addTeamToTable(others["team"]);
                    }
                }else if (updateType == UPDATE_TYPE["DELETE"]){
                    $(`.rowValues#${valueToUpdate}`).remove();
                }
            }

            break;
        case PAGES["QUERIES"]:

            break;
        default:
            break;
    }
}

/**
 * Update User UI if there is any top nabvar update
 * @param {Enum} inputType 
 * @param {Enum} updateType 
 * @param {Any} valueToUpdate 
 */
function updateUIFromTopNabvar(inputType, updateType, valueToUpdate){

    switch (inputType) {
        case UPDATE_INPUTS.USER:
            // if a user is added or removed from topnavar option (users)
            updateSelectOption(MODAL_REMOVE_USER_INPUT, updateType, valueToUpdate);
            break;

        case UPDATE_INPUTS.TEAM:
            // update delete team modal when a team has been created
            updateSelectOption(DELETE_TEAM_SELECT_INPUT, updateType, valueToUpdate);

            // sprint modal
            updateSelectOption(SPRINT_CREATE_MODAL_TEAM_INPUT, updateType, valueToUpdate);
            updateSelectOption(SPRINT_DELETE_MODAL_SELECT_TEAM, updateType, valueToUpdate);
            break;
    
        case UPDATE_INPUTS.SPRINT:
            // sprint modal
            updateSelectOption(SPRINT_CREATE_MODAL_TEAM_INPUT, updateType, valueToUpdate);
            updateSelectOption(SPRINT_DELETE_MODAL_SELECT_SPRINT, updateType, valueToUpdate);
            break;
    
        default:
            break;
    }
}

/**
 * Refresh the page if the element removed and the current item are the same
 * @param {String} itemRemoved 
 * @param {String} selector 
 * @returns {Void}
 */
function refreshIfCurrentItemWasRemoved(itemRemoved, selector) {
    // get current id selected of the team
    let currentItem = $(selector).val();

    // if the user deleting the current team that is active in the ui? 
    if (itemRemoved && itemRemoved.toString() === currentItem) {
        // refresh the page
        refreshPage();
    }
}


/**
 * 
 * @param {String} rowId - id of the row to be update
 * @param {Object} elementToUpdate - data of the element to be updated in the tab;e
 * @param {*} appendFunction  - function to append the element to the table
 * @param {*} functionParams - parameters of the function to append the element to the table
 */
function updateTableElement(rowId, elementToUpdate, appendFunction, functionParams = []) {
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
function updateSprintBoardWorkItem(elementId, workItem) {

    const status = workItem["status"];
    const NOT_FOUND = 0;
    let index = $(`div#${status} div#${elementId}`).index();

    // remove element from UI
    removeWorkItemFromBoard(elementId);

    // Check the sprint of the work item is DIFFERENT as the current sprint selected
    if (workItem["sprint"]["_id"].toString() != $(FILTER_BY_SPRINT_INPUT).val()){
        return;
    }

    // check if the team of the work item is DIFFERNET as the current team selected
    if (workItem["teamId"].toString() != $(FILTER_BY_TEAM_SPRINT).val()){
        return;
    }

    // Check if index is not found
    if (index < NOT_FOUND) {
        addWorkItemToBoard(workItem, null);
    } else {
        addWorkItemToBoard(workItem, index);
    }
}

/**
 * 
 */
function removeWorkItemFromBoard(workItemId) {
    $(`div#${workItemId}`).remove();
}


/**
 * Enable the functionality for the trash button
 * @param {Boolean} enable - True if wants to enable the trash button, false if wants to disable
 */
function enableTrashButton(enable) {

    if (enable) {
        $(TRASH_BTN_GENERAL_CLASS).attr("disabled", false);
        $(`${TRASH_BTN_GENERAL_CLASS} i`).removeClass("grayColor");
        $(`${TRASH_BTN_GENERAL_CLASS} i`).addClass("redColor");
    } else {
        $(TRASH_BTN_GENERAL_CLASS).attr("disabled", true);
        $(`${TRASH_BTN_GENERAL_CLASS} i`).removeClass("redColor");
        $(`${TRASH_BTN_GENERAL_CLASS} i`).addClass("grayColor");
    }
}


/**
 * Add user to table for manage table
 * @param {Object} userInfo 
 */
function addUserToTable(userInfo) {

    if (_.isEmpty(userInfo) || _.isNull(userInfo) || _.isUndefined(userInfo)) {
        return;
    }

    let td_checkbox = `
    <td class="tableCheckBoxRowElement"> 
        <label class="invisible labelcheckbox"> 
            <input type="checkbox" aria-label="table-row-checkbox" name="checkboxWorkItem[]" value="${userInfo['id']}" class="checkboxRowElement" />
        </label> 
    </td>`;

    let td_privilege = `
    <td>
        ${userInfo['privilege']}
    </td>`;

    let td_edit = `
    <td class="column-edit-team">
        <button 
            class="btn btn-warning edit-user-team-btn btn-update-user-modal-open"  
            data-toggle="modal" 
            id="${userInfo['id']}"
            data-target=".update-user-modal">
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
    <tr class="rowValues" id="${userInfo['id']}">
        ${td_checkbox}
        ${td_name}
        ${td_email}
        ${td_privilege}
        ${td_edit}
    </tr>`;

    $(`${MANAGE_TABLE_ID} > tbody:last-child`).append(table_row);
}

/**
 * Add team to table for manage teams
 * @param {Object} teamInfo 
 */
function addTeamToTable(teamInfo) {

    if (_.isEmpty(teamInfo) || _.isNull(teamInfo) || _.isUndefined(teamInfo)) {
        return;
    }

    let td_checkbox = `
    <td class="tableCheckBoxRowElement"> 
        <label class="invisible labelcheckbox"> 
            <input type="checkbox" aria-label="table-row-checkbox" name="checkboxWorkItem[]" value="${teamInfo["id"]}" class="checkboxRowElement" />
        </label> 
    </td>`;

    let td_name = `
    <td class="row-team-name">
        ${teamInfo["name"]}
    </td>`;

    let td_view_users = `
    <td class="column-view-team-users">
        <button 
            class="btn btn-warning edit-user-team-btn btn-view-user-modal-open"  
            data-toggle="modal"
            data-target="#view-team-users-modal">
           ${teamInfo["users"].length}
        </button>
    </td>`;


    let td_edit_team = `
    <td class="column-edit-team">
        <button 
            class="btn btn-warning edit-user-team-btn btn-update-team-modal-open"  
            data-toggle="modal" 
            data-target=".edit-team-modal">
            <i class="fas fa-user-edit"></i>
        </button>
    </td>`;

    let table_row = `
    <tr class="rowValues" id="${teamInfo['id']}">
        ${td_checkbox}
        ${td_name}
        ${td_view_users}
        ${td_edit_team}
    </tr>`;

    $(`${MANAGE_TABLE_ID} > tbody:last-child`).append(table_row);
}


/**
 * Add a comment to a work item for a project
 * @param {String} projectId 
 * @param {String} workItemId 
 * @param {String} comment 
 */
async function addCommentToWorkItemDb(projectId, workItemId, comment, numbeOfCommentSpan = NUMBER_OF_COMMENTS_SPAN) {

    if (projectId == undefined || workItemId == undefined) {
        // TODO: add error message to the user
        alert("Error getting the paramenters to add the comment to work item");
        return;
    }

    // check of comments
    if (comment.trim().length == 0) {
        console.error("Cannot add empty comment");
        return;
    }

    let {response, response_error} = await addCommentToWorkItem(workItemId, comment.trim());

    if (!response_error) {

        if (!response["comment"]){
            refreshPage();
            return;
        }

        let comment = response["comment"];
        comment["isMyComment"] = true;

        addCommentToUI(comment, USER_COMMENT_CONTAINER);


        // // update the number of comments
        let currentNumberOfComments = parseInt($(numbeOfCommentSpan).text().trim());
        $(numbeOfCommentSpan).text(++currentNumberOfComments);

        return true;
    } else {
        $.notify(response_error.data.responseJSON.msg, "error");
        return false;
    }
}

/**
 * Add work item comment to the UI
 * @param {Object} comment 
 * @param {String} numbeOfCommentSpan 
 * @param {String} container 
 */
function addCommentToUI(comment, container){

    let commentTemplate = undefined;
    
    if (comment["isMyComment"]){
        commentTemplate = `
        <div class="work-item-comment" id="${comment["_id"]}">
            
            <div class="flex">
    
                <div class="work-item-comment-user-name">
                    <span class="small">
                        My comment
                    </span>
                </div>
                
                <div class="work-item-comment-buttons">
                    <span role="button" class="removeCommentIcon" data-comment-id="${comment["_id"]}" data-toggle="modal" data-target="#remove-confirmation-modal">
                        <i class="fas fa-trash"></i>
                    </span>
                </div>
            </div>
    
            <div>
                <textarea name="comments" 
                rows="3"
                data-comment-id="${comment["_id"]}"
                placeholder="Add a comment for this work item." 
                class="bx-shadow addCommentBox userCommentBox">${comment["comment"]}</textarea>
            </div>
        </div>`;
    }else{
        commentTemplate = `
        <div class="work-item-comment" id="${comment["_id"]}">
            <div>

                <div class="flex">
                
                    <div class="work-item-comment-user-name">
                        <span class="small">
                            ${comment["userName"]}
                        </span>
                    </div>
                </div>

                <textarea name="comments" 
                rows="3"
                disabled
                placeholder="Add a comment for this work item." 
                class="bx-shadow addCommentBox">${comment["comment"]}</textarea>
            </div>
        </div>`;
    }

    $(container).prepend(commentTemplate);

}

/**
 * Remove the work item from the project
 * @param {Array} workItemsId - Array with all work item ids 
 */
async function removeWorkItems(workItemsId) {
  
    if (!workItemsId || workItemsId.length == 0) {
        console.error("Cannot find the work items to remove");
        return;
    }

    const {response, response_error} = await deleteWorkItems(workItemsId);

    if (response) {
        removeCheckedElement();

        $.notify(response, "success");

        // disable the trash button again
        enableTrashButton(false);

        // updating the feedback messages
        updateWorkItemFeedback();
    } else {
        $.notify(response_error.data.responseText, "error");
    }
}


/**
 * In order to focus the work item, click the title when focus
 */
function checkTitleWhenOpen(selector) {
    try {
        //  PRIOR check if the title has already something in it
        if ($(selector["title"]).val().length == 0) {
            showElement(spanTitleMsg);
        }
    } catch (err) {

    }
}


/**
 * Add events for work item update and create
 * @param {Object} element 
 */
function addWorkItemEvents(element) {

    // When title input is changed
    $(element["title"]).on("input", function () {

        // Using functions from helper.js in order to show or hide the elements
        if ((($(this).val()).length) > 0) {
            hideElement(element["title_span_msg"]);
        } else {
            showElement(element["title_span_msg"]);
        }
    });

    // ADD COMMENT 
    // TODO: refactor this
    $(element["btn_add_comment"]).on("click", function () {

        const comment = $(element["discussion"]).val();
        const workItemId = $(WORK_ITEM_ID).val();
        const projectId = getProjectId();

        if (workItemId == undefined || projectId == undefined) {
            $.notify("Sorry, We cannot find the information of this work item", "error")
            return;
        }

        if ((comment && comment.trim().length > 0)) {

            let commentWasAdded = addCommentToWorkItemDb(projectId, workItemId, comment.trim(), element["number_of_comments"]);

            // cleaning the dissusion val
            if (commentWasAdded) {
                $(element["discussion"]).val("");
            }
        } else {
            $.notify("Sorry, Invalid comment", "error")
            return;
        }
    });

    // TEAM - CHANGE EVENT ON WORK ITEM
    $(element["team"]).on("change", async function () {

        // check from where the change trigger is coming
        if (IS_UPDATE_SELECT_OPTION) {
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
        const projectId = getProjectId();

        if (!_.isString(teamId) || !_.isString(projectId) || teamId == "0") {
            // $.notify("Invalid team was selected.", "error");
            return;
        }

        const API_LINK_GET_SPRINTS_FOR_TEAM = `/dashboard/api/${projectId}/getTeamSprints/${teamId}`;

        let response_error = null;
        const response = await make_get_request(API_LINK_GET_SPRINTS_FOR_TEAM).catch(err => {
            response_error = err;
        });

        // Success message
        if (response) {

            if (response.sprints && response.sprints.length > 0) {
                for (const sprint of response.sprints) {
                    let optionText = "";
                    let isSelected = false;

                    if (response["activeSprintId"]) {
                        isSelected = sprint["_id"].toString() == response["activeSprintId"].toString();
                    }

                    if (sprint["_id"] == "0") {
                        optionText = sprint["name"];
                    } else {
                        optionText = formatSprintText(sprint, isSelected);
                    }

                    updateSelectOption(
                        element["sprint"],
                        UPDATE_TYPE.ADD, {
                            "value": sprint["_id"],
                            "text": optionText
                        },
                        isSelected
                    );
                }
            } else {
                $.notify("Sorry, it seems this team does not have sprints yet.", "error");
            }
        } else { // error messages
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

        if (selectedStatus != WORK_ITEM_STATUS["New"] && currentAssignedUser == "0") {
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
function updateWorkItemFeedback() {
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
function getPointsAndUpdate(selector, updateTextValue = true) {

    let totalNumberOfPoints = sumTextValueOnClassElement(`${selector}`);
    let totalOfCompletedPoints = sumTextValueOnClassElement(`${selector}.Completed`);
    let totalOfActivePoints = sumTextValueOnClassElement(`${selector}.Active`);
    let totalOfNewPoints = sumTextValueOnClassElement(`${selector}.New`);
    let totalOfReviewPoints = sumTextValueOnClassElement(`${selector}.Review`);

    if (updateTextValue) {
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
function sumTextValueOnClassElement(selector) {
    try {
        let total = 0;
        $(selector).each(function () {
            total += parseInt($(this).text().trim());
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
function updateNumberOfWorkItems(selector, option) {

    try {
        let numberOfElements = 0;

        if (option == null) {
            numberOfElements = $("tr.rowValues").length;

            let text = numberOfElements > 0 ? `${numberOfElements} Work Items` : `${numberOfElements} Work Item`;

            $(selector).text(text);
        } else {


            let tableHeader = getTableHeadersArray(WORK_ITEM_TABLE);
            let stateIndex = tableHeader.indexOf("state") + 1; // add one couse index is 0 base

            $(`tr.rowValues td:nth-child(${stateIndex})`).each(function (i) {
                if (option.toLowerCase().trim() === $(this).text().toLowerCase().trim()) {
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
function showFeedbackCheckedElements(counter) {
    if (counter > 4) {
        // console.log("showing");
        NOTIFY.showGlobalNotification(`${counter} Work items selected`);
    } else {
        // console.log("HIDING");
        NOTIFY.hideGlobalNotifyMsg();
    }
}


/**
 * Update link
 * @param {String} selector 
 * @param {String} newLink 
 */
function updateLinkHref(selector, newLink) {
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
function filterElementsByValue(data, key, value, notIn = false) {

    if (notIn) {
        return data.filter(each => {
            return each[key] != value
        });
    }

    return data.filter(each => {
        return each[key] == value
    });

}

/**
 * Return the sum of the values
 * @param {Array} element -  
 * @param {String} key -
 */
function sumObjectValue(element, key) {

    let sum = 0;

    element.forEach(each => {
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
function formatSprintText(sprint, isSelected = false) {

    let optionText = '';

    if (isSelected) {
        optionText = `${sprint["name"]} : ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]} (current)`;
    } else {
        optionText = `${sprint["name"]} : ${sprint["startDateFormated"]} - ${sprint["endDateFormated"]}`;
    }

    return optionText
}

/**
 * Get the text inside every tag
 * @param {String} workItemSelector 
 * @returns 
 */
function getTags(workItemSelector) {
    // get all the tags available
    let tags_available = $(workItemSelector["tags"]).map((_, element) => element.value.trim()).get().filter(element => {
        return !_.isEmpty(element);
    });

    return tags_available;
}


/**
 * Get an object form and array. every element is the key and the value
 * @param {Array} arr 1D array
 * @returns {Object} object with keys/values with the value of the each array element
 */
function arrayToObject(arr) {
    return arr.reduce((acc, curr) => (acc[curr] = curr, acc), {});
}


/**
 * Get a unique string
 * @param {Number} length - Size of the unique string
 * @returns 
 */
function getRandomString(length) {
    let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return id;
}


/**
 * Get the element key by value (Just one)
 * @param {Object} element 
 * @param {Any} value 
 * @return {String} key of the element 
 */
function getKeyByValue(element, value) {
    return _.findKey(element, val => val === value);
}

/**
 * Show a bounce error animation in a input element
 * @param {Object} selector - Element container
 * @param {Number} seconds - number of seconds to show the animation. Default is one second
 */
function showErrorBounceAnimation(selector, seconds = 1) {

    // since setTimeOut works on miliseconds
    seconds = seconds * 1000;

    // change the css for the operator 
    $(selector).addClass("bounce");

    setTimeout(function () {
        //remove the class so animation can occur as many times as user triggers event, delay must be longer than the animation duration and any delay.
        $(selector).removeClass("bounce");
    }, seconds);

}


/**
 * Add default value to select option
 * @param {String} selectId - id of the select
 * @param {String} text - Default text 
 */
function cleanAndaddDefaultToSelect(selectId, text) {
    $(selectId).empty();
    updateSelectOption(selectId, UPDATE_TYPE.ADD, {
        "text": text,
        value: UNNASIGNED_VALUE
    }, true);
}

/**
 * Clean an element using the selector
 * @param {String} selector 
 */
function cleanElement(selector){
    $(selector).empty();
}

/**
 * Remove the disabled attribute from the select option
 * @param {String} selector - Selector element
 */
function removeDisabledFromSelectOption(selector) {
    // in case there is a previus disabled option, remove the disabled attr
    $(`${selector} option`).each(function () {
        $(this).attr("disabled", false);
    });
}

/**
 * 
 * @param {String} selector - select id or class
 * @param {String} value - value of the option
 * @param {Boolean} disabled - true if element should be disabled
 */
function setDisableAttrToSelectOption(selector, value, disabled) {
    $(`${selector} option[value=${value}]`).attr("disabled", disabled);
}

/**
 * Get the attribute from an array of selector
 * @param {Array} arrayWithSelectors - Array of selector elements
 */
function getvalueFromArraySelector(arrayWithSelectors) {


    if (_.isEmpty(arrayWithSelectors)) {
        console.log("Not checked elements found");
        return [];
    }

    let attr = [];

    for (let selector of arrayWithSelectors) {
        attr.push($(selector).val());
    }

    return attr;
}

/**
 * get the project id
 * @returns {String}
 */
function getProjectId() {
    return $(PROJECT_ID).val();
}

/**
 * 
 * @param {String} selector 
 * @param {String} idToRemove 
 */
function updateOptionFromFilter(selector, updateType, valueToUpdate) {

    if (updateType == UPDATE_TYPE.ADD) {
        let filterOption = `
        <li id="${valueToUpdate["value"]}">
            <label class="small checkbox-container">
                <input type="checkbox" data-id="<%=user['id']%>" class="userCheckbox" value="${valueToUpdate["text"]}" />&nbsp;
                ${valueToUpdate["text"]}
            </label>
        </li>`;

        $(`.table-filter-container ${selector}`).prepend(filterOption);
    } else if (updateType == UPDATE_TYPE.DELETE) {
        $(`.table-filter-container ${selector} li#${valueToUpdate}`).remove();
    } else if (updateType == UPDATE_TYPE.CHANGE) {
        console.log("user has change in filter options?")
    }
}

/**
 * Refresh current page the user at
 * @returns {Void};
 */
function refreshPage() {
    location.reload();
    return;
}

/**
 * Set up the title, body text, and element to be removed in delete modal
 * @param {Object} data 
 */
function setUpRemoveModal(data){
    console.log("Setting up delete modal...");

    // setting title
    $(REMOVE_CONFIRMATION_TITLE).text(data["title"]);
    
    // setting body text
    $(REMOVE_CONFIRMATION_BODY_TEXT).text(data["body"]);

    // in case dev needs to store an id
    $(REMOVE_CONFIRMATION_HIDDEN_INPUT).val(data["id"]);

    // what are we deleting
    $(REMOVE_OPTION_HIDDEN_INPUT).val(data["option"]);
}

/**
 * Close modal is has close class
 * @param {String} modalId 
 */
function closeModal(modalId){
    $(`${modalId} .close`).click();
}

/**
 * Base on the relationship, set a new relationship for the work item
 * @param {String} relationship 
 * @returns 
 */
function getRelationShipForWorkItem(relationship){
    
    const RELATIONSHIP = arrayToObject(Object.keys(WORK_ITEM_RELATIONSHIP));

    let newRelationship = relationship;
    switch (relationship) {

        // If the relationship is child, then this work item is the parent
        case RELATIONSHIP["CHILD"]:
            newRelationship = RELATIONSHIP["PARENT"];
            break;
        // If the relationship is parent, then this work item is the child
        case RELATIONSHIP["PARENT"]:
            newRelationship = RELATIONSHIP["CHILD"];
            break;
        // If the relationship is duplicate by, then this work item is the duplicate from
        case RELATIONSHIP["DUPLICATE"]:
            newRelationship = RELATIONSHIP["DUPLICATE_FROM"];
            break;
        // // If the relationship is Blocked by, then this work item is the one blocking
        // case RELATIONSHIP["BLOCKED"]:
        //     newRelationship = RELATIONSHIP["BLOCKING"];
        //     break;
        default:
            break;
    }
    return newRelationship;
}


/**
 * get the chartJs object
 * @param {Object} config 
 * @param {String} divId 
 * @returns {ChartJs}
 */
function getChart(config, divId){

    let ctx = document.getElementById(divId).getContext('2d');
    
    return new Chart(ctx, config);
}


/**
 * Open URL in new tab
 * @param {String} url 
 */
function openInNewTab(url) {
    window.open(url, '_blank').focus();
}

