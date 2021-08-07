/**
 * Front-end JS Code for planing-work-item route
 */


// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // show the active tab in the sidebar
    showActiveTab();

    // click on planing just to show to the user in the sidebar
    $(BTN_PLANING).click();

    // // TABLE resized
    // $(WORK_ITEM_TABLE).colResizable({
    //     liveDrag:true,
    //     gripInnerHtml:"<div class='grip'></div>", 
    //     draggingClass:"dragging", 
    // });
    // $(WORK_ITEM_TABLE).colResizable({resizeMode:'flex'});
    /**
     * CHECKBOX FOR WORK ITEM TABLE 
     */
    $(document).on("click", TABLE_ROW_CHECKBOX_ELEMENT, function () {
        
        highliteWorkItemRow(this, this.checked);

        let counter = 0;

        $(`${TABLE_ROW_CHECKBOX_ELEMENT}:visible`).each(function(){
           
            if (this.checked){
                counter++;
            }
        });

        showFeedbackCheckedElements(counter);
    });

    // CHECK ALL ROWS ELEMENT
    $(CHECK_ALL_CHECKBOX_TABLE_ROWS).on("click", function(){

        // get checked
        let isChecked = this.checked;

        // enable the trash button if checked
        enableTrashButton(isChecked);
        let counter = 0;

        $(`${TABLE_ROW_CHECKBOX_ELEMENT}:visible`).each(function(){
           
            if (isChecked){
                counter++;
            }
            
            $(this).prop('checked', isChecked);
            
            highliteWorkItemRow(this, isChecked);
        });

        showFeedbackCheckedElements(counter);
    });

    // REMOVE THE WORK ITEMS SELECTED IN CHECKBOX
    // TODO: Create a database modal to store deleted element
    $(TRASH_BTN_WORK_ITEM).on("click", function(){
        
        // get checked elements in table
        const row_checked = getVisibleElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        const projectId = $(PROJECT_ID).val();
        
        removeWorkItems(projectId, row_checked);

        unCheckAll();
    });

    // TOGGLE THE FILTER
    $(FILTER_BTN).on("click", function() {
        toggleFilter()
    });

    // ==================== MOVE TO ======================
    // BACKLOG
    $(document).on("click", MOVE_TO_BACKLOG_BTN, function(){
        let workItemId = $(this).attr("rel");

        // get checked elements in table
        const workItems = getVisibleElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

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
        const workItems = getVisibleElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

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
        const workItems = getVisibleElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        if (_.isArray(workItems) && !_.isEmpty(workItems)){   
            moveWorkItemToSprint(workItems, 'next');
        }else{
            moveWorkItemToSprint([workItemId], 'next');
        }
    });
    // =====================================================

    updateWorkItemFeedback();
});


