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

        setFeedbackButton(BTN_TOTAL_WORK_ITEMS, isChecked);

        showFeedbackCheckedElements(counter);
    });


    // REMOVE THE WORK ITEMS SELECTED IN CHECKBOX
    // TODO: Create a database modal to store deleted element
    $(TRASH_BTN_WORK_ITEM).on("click", async function(){
        
        // get checked elements in table
        const row_checked = getCheckedElementIds(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED);

        const projectId = getProjectId();
        
        await removeWorkItems(projectId, row_checked);

        updateWorkItemFeedback();

        unCheckAll();
    });

    // TOGGLE THE FILTER
    $(FILTER_BTN).on("click", function() {
        toggleFilter()
    });

    updateWorkItemFeedback();
});


