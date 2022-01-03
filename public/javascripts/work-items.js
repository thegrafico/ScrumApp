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

        let numberOfCheckedElements = getCheckedElementIds(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED).length;
        let workItemText = (numberOfCheckedElements > 1) ? "Work items" : "Work item";
        let removeWorkItemsData = {
            title: "Removing work items",
            body: `Are you sure you want to remove ${numberOfCheckedElements} ${workItemText}?`,
            id: null,
            option: REMOVE_OPTIONS["WORK_ITEMS"]
        }
        setUpRemoveModal(removeWorkItemsData);
    });

    // Confirmation modal to remove the work items
    $(REMOVE_CONFIRMATION_SUBMIT_BTN).on("click", async function(){


        const GET_ONLY_VISIBLES_CHECKED_ELEMENTS = false;

        // get checked elements in table
        const rowsChecked = getCheckedElementIds(TABLE_ROW_CHECKBOX_ELEMENT_CHECKED, GET_ONLY_VISIBLES_CHECKED_ELEMENTS);

        let elementToRemove = $(REMOVE_OPTION_HIDDEN_INPUT).val();

        if (elementToRemove == UNNASIGNED_VALUE){
            $.notify("Oops, There was a problem getting the information to remove. Please try later.");
            return;
        }

        switch (elementToRemove) {

            // Removing work items
            case REMOVE_OPTIONS["WORK_ITEMS"]:
                await removeWorkItems(rowsChecked);
                updateWorkItemFeedback();
                break;
            case REMOVE_OPTIONS["USERS"]:
                await removeUsersManage(rowsChecked)
                break;
            case REMOVE_OPTIONS["TEAMS"]:
                await removeTeamManage(rowsChecked);
                break;
            case REMOVE_OPTIONS["SPRINTS"]:
                await removeSprintManage(rowsChecked);
                break;
            case REMOVE_OPTIONS["WORK_ITEM_COMMENT"]:
                let commentId = $(REMOVE_CONFIRMATION_HIDDEN_INPUT).val();
                let workItemId = $(WORK_ITEM_ID).val();
                await removeCommentFromWorkItem(workItemId, commentId);
                // remove from the UI
                $(`div #${commentId}`).remove();
                break;
            default:
                console.log("Invalid option to remove: ", elementToRemove);
            break;
        }
       
        unCheckAll();

        closeModal(REMOVE_CONFIRMATION_MODAL);

    });

    // TOGGLE THE FILTER
    $(FILTER_BTN).on("click", function() {
        toggleFilter()
    });

    // REMOVE COMMENT FROM WORK ITEM
    $(document).on("click", REMOVE_COMMENT_WORK_ITEM_BTN, async function(){

        const commentId = $(this).attr("data-comment-id");

        // validate data
        if (!commentId || _.isEmpty(commentId)){
            $.notify("Opps, There was a problem deleting the comment from the work item");
            return
        }

        let removeWorkItemsComment = {
            title: "Removing Comment",
            body: `Are you sure you want to remove this comment?`,
            id: commentId,
            option: REMOVE_OPTIONS["WORK_ITEM_COMMENT"]
        };

        setUpRemoveModal(removeWorkItemsComment);
    });

    $(document).on("focusout", WORK_ITEM_COMMENT_BOX, async function(){
        console.log("Updating work item");
        
        let workItemId = $(WORK_ITEM_ID).val();
        let commentId = $(this).attr("data-comment-id");
        let comment = $(this).val();

        await updateWorkItemComment(workItemId, commentId, comment);
    });

    updateWorkItemFeedback();
});


