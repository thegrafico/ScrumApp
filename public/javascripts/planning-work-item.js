/**
 * Front-end JS Code for planing-work-item route
 */


// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // show the active tab in the sidebar
    showActiveTab();

    checkTitleWhenOpen();

    // click on planing just to show to the user in the sidebar
    $(BTN_PLANING).click();

    /**
     * CHECKBOX FOR WORK ITEM TABLE 
     */
    $(document).on("click", TABLE_ROW_CHECKBOX_ELEMENT, function () {
        highliteWorkItemRow(this, this.checked);   
    });

    // CHECK ALL ROWS ELEMENT
    $(CHECK_ALL_CHECKBOX_TABLE_ROWS).on("click", function(){
        
        let isChecked = this.checked;

        enableTrashButton(isChecked);
        $(`${TABLE_ROW_CHECKBOX_ELEMENT}:visible`).each(function(){
            
            $(this).prop('checked', isChecked);
            
            highliteWorkItemRow(this, isChecked);
        });
        
    });

    // REMOVE THE WORK ITEMS SELECTED IN CHECKBOX
    // TODO: Create a database modal to store deleted element
    $(TRASH_BTN_WORK_ITEM).on("click", function(){
        
        // get checked elements in table
        const row_checked = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        const projectId = $(PROJECT_ID).val();
        
        removeWorkItems(projectId, row_checked);

        unCheckAll();
    });

    // TOGGLE THE FILTER
    $(FILTER_BTN).on("click", function() {
        toggleFilter()
    });

    // BACKLOG
    $(document).on("click", MOVE_TO_BACKLOG_BTN, function(){
        let workItemId = $(this).attr("rel");

        // get checked elements in table
        const workItems = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        if (_.isArray(workItems) && !_.isEmpty(workItems)){   
            moveWorkItemToSprint(workItems, 'backlog');
        }else{
            moveWorkItemToSprint([workItemId], 'backlog');
        }
        
    });

    // CURRENT
    $(document).on("click", MOVE_TO_CURRENT_SPRINT_BTN, function(){
        let workItemId = $(this).attr("rel");

        // get checked elements in table
        const workItems = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        if (_.isArray(workItems) && !_.isEmpty(workItems)){   
            moveWorkItemToSprint(workItems, 'current');
        }else{
            moveWorkItemToSprint([workItemId], 'current');
        }

    });

    // NEXT
    $(document).on("click", MOVE_TO_NEXT_SPRINT_BTN, function(){
        let workItemId = $(this).attr("rel");

        // get checked elements in table
        const workItems = getCheckedElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        if (_.isArray(workItems) && !_.isEmpty(workItems)){   
            moveWorkItemToSprint(workItems, 'next');
        }else{
            moveWorkItemToSprint([workItemId], 'next');
        }
    });

});

