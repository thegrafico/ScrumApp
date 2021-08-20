/**
 * Front-end JS Code for planing-work-item route
 */


// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // show the active tab in the sidebar
    showActiveTab();

    // make the sprint available when user view all sprints in sub menu
    $(document).on("click", OPEN_WORK_ITEM_SUB_MENU_BTN, function(){
        // console.log("reset scroll");
        SCROLL_TO_CURRENT_SPRINT_ONCE = true;
    });

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

        updateWorkItemFeedback();

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
            moveWorkItemToSprint(workItems, UNNASIGNED_VALUE);
        }else{
            moveWorkItemToSprint([workItemId], UNNASIGNED_VALUE);
        }
        
    });

    // MOVE WORK ITEM TO SPRINT
    $(document).on("click", MOVE_TO_SUB_MENU_SPRINT_ITEM, function(){
        
        let sprintId = $(this).attr("rel");
        let workItemId = $(this).attr("id");

        console.log(`Moving ${workItemId} to: ${sprintId}`);
        
        // get checked elements in table
        const workItems = getVisibleElements(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        if (_.isArray(workItems) && !_.isEmpty(workItems)){   
            moveWorkItemToSprint(workItems, sprintId);
        }else{
            moveWorkItemToSprint([workItemId], sprintId);
        }

    });


    // TODO: REFACTOR THIS
    $(document).on('mouseover', '.open-sub-menu-select-sprints-container', function(){
        $(this).find('.dropdown-menu').show();

        if (SCROLL_TO_CURRENT_SPRINT_ONCE){
            $(this).find(".currentSubMenuSprint")[0].scrollIntoView({
                behavior: 'smooth'
            });
            SCROLL_TO_CURRENT_SPRINT_ONCE = false;
        }    
    });

    $(document).on('mouseover', '.subMenuItem', function(e){
        $(".open-sub-menu-select-sprints-container").find('.dropdown-menu').hide();
    });

    updateWorkItemFeedback();
});


