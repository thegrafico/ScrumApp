
/**
 *  Logic for work item modal 
*/
// =========== This function is fire as soon as the file is loaded after the HTML ===========
$(function () {

    // ============== SELECT 2 ===================
    $(WORK_ITEM["user"]).select2();
    $(WORK_ITEM["team"]).select2();
    $(WORK_ITEM["sprint"]).select2();
    $(WORK_ITEM["priority"]).select2();
    // ===========================================

    addWorkItemEvents(WORK_ITEM);
    
    // clean the modal to add an user
    $(createWorkItemModal).on('shown.bs.modal', function (e) {
        $(WORK_ITEM["title"]).trigger("focus");
    });


    // clean the modal when opened
    $(createWorkItemModal).on('show.bs.modal', function (e) {
        cleanModal(WORK_ITEM);
    });


    // CREATE WORK ITEM BTN
    $(CREATE_WORK_ITEM_FORM).on("submit", function(event){
        
        isFormValid = validateFormWorkItem();
        
        if (!isFormValid){
            event.preventDefault();
        }
    });

});