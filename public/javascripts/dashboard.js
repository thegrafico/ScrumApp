
/**
 * Dashboard main logic
*/

// Create a project
const CREATE_PROJECT_BTN = "#create-project-btn";
const CREATE_PROJECT_MODAL = "#create-project-modal";
const CREATE_PROJECT_SUBMIT_BTN = "#create-project-submit-btn";
const PROJECT_DESCRIPTION_INPUT = "#project-description";

// PROJECT INPUTS
const PROJECT_NAME_INPUT = "#project-name";

// to get from the project
const PROJECT_TITLE_TEXT = ".project-name";
const PROJECT_DESCRIPTION_TEXT = ".project-description";

const GO_TO_PROJECT = ".go-to-project";

// EDIT AND REMOVE PROJECT BTNS
const REMOVE_PROJECT_BTN = ".remove-project-btn";

// FAVORITE PROJECTS
const FAVORITE_PROJECTS_CONTAINER = "#favorite-projects-container";
const ROW_PROJECTS_CONTAINER = "#row-projects-container";


// EDIT PROJECT
const EDIT_PROJECT_BTN = ".edit-project-btn";
const EDIT_PROJECT_MODAL = "#edit-project-modal";
const EDIT_PROJECT_NAME = "#edit-project-name";
const EDIT_PROJECT_DESCRIPTION = "#edit-project-description";
const EDIT_PROJECT_SUBMIT_BTN = "#edit-project-submit-btn";
const EDIT_PROJECT_HIDDEN_INPUT = "#edit-project-id-input";

// filter dashboard projects
const FILTER_PROJECTS_INPUT = "#filter-projects";

const MAX_NUMBER_OF_FAVORITE_PROJECTS = 3;


// FAVORITE PROJECTS
const PROJECT_FAVORITE = {
    makeFavorite: {
        btn: ".make-project-favorite-btn",
        class: "make-project-favorite-btn",
        iconClass: "favoriteIconAct",
        submitBtnId: "#add-project-to-favorite-submit-btn",
        modalId: "#make-project-favorite-modal",
        projectIdHidden: "#favorite-project-id-add",
        container: ".make-project-favorite-container"
    },
    removeFavorite: {
        btn: ".remove-project-favorite-btn",
        class: "remove-project-favorite-btn",
        iconClass: "favoriteIconInactive",
        submitBtnId: "#remove-project-from-favorite-submit-btn",
        modalId: "#remove-project-favorite-modal",
        projectIdHidden: "#favorite-project-id-remove",
        container: ".remove-favorite-container"
    },
    modalProjectNameSpan: ".favorite-project-name",
}


$(function () {


    // ============ FAVORITE PROJECT ============

    // OPEN MODAL TO ADD PROJECT TO FAVORITE
    $(document).on("click", PROJECT_FAVORITE["makeFavorite"]["btn"], function(){

        // Get the project id clicked
        const projectId = $(this).attr("data-projectid");

        // get the name of the project
        const projectName = $(this).attr("data-projectname").trim() || "this project";

        // change the name of the project in the modal
        $(PROJECT_FAVORITE["modalProjectNameSpan"]).text(projectName);

        // add that id to the hidden input in the modal
        $(PROJECT_FAVORITE["makeFavorite"]["projectIdHidden"]).val(projectId);
    });

    // ADD PROJECT TO FAVORITE SUBMIT
    $(document).on("click", PROJECT_FAVORITE["makeFavorite"]["submitBtnId"], async function(){
        
        // getting the id of the project to add to favorites
        const projectId = $(PROJECT_FAVORITE["makeFavorite"]["projectIdHidden"]).val();

        if (projectId == UNNASIGNED_VALUE){
            $.notify("Sorry, cannot get the project information at this time. Please try later", "error");
            return;
        }

        let numberOfFavoriteProjects = $(FAVORITE_PROJECTS_CONTAINER).children().length;

        // check how many projects are in favorite ( 3 Max )
        if (numberOfFavoriteProjects >= MAX_NUMBER_OF_FAVORITE_PROJECTS){
            $.notify("Sorry, Max number of favorite projects has been reached", "error");
            return;
        }

        let {response, response_error} = await addProjectToFavorite(projectId);

        if (!response_error){

            closeModal(PROJECT_FAVORITE["makeFavorite"]["modalId"]);

            // remove project from row
            $(`div#${projectId}`).slideUp(function() {
                $(this).remove();
            });

            // add project to favorite
            addProjectToUI(response["project"], true);

            let maxNumberOfFavoriteProjectsHasBeenReached = numberOfFavoriteProjects + 1 >= MAX_NUMBER_OF_FAVORITE_PROJECTS;

            // disabled the add to favorite buttons if max number of favorites has been reached
            enableAddProjectToFavorite( !maxNumberOfFavoriteProjectsHasBeenReached );
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }


    });

    // - REMOVE PROJECT FROM PROJECT -

    // OPEN MODAL TO REMOVE PROJECT FROM FAVORITE
    $(document).on("click", PROJECT_FAVORITE["removeFavorite"]["btn"], function(){

        // Get the project id clicked
        const projectId = $(this).attr("data-projectid");

        // get the name of the project
        const projectName = $(this).attr("data-projectname").trim() || "this project";

        // change the name of the project in the modal
        $(PROJECT_FAVORITE["modalProjectNameSpan"]).text(projectName);

        // add that id to the hidden input in the modal
        $(PROJECT_FAVORITE["removeFavorite"]["projectIdHidden"]).val(projectId);
    });

    // REMOVE PROJECT TO FAVORITE SUBMIT
    $(document).on("click", PROJECT_FAVORITE["removeFavorite"]["submitBtnId"], async function(){

        // getting the id of the project to add to favorites
        const projectId = $(PROJECT_FAVORITE["removeFavorite"]["projectIdHidden"]).val();

        if (projectId == UNNASIGNED_VALUE){
            $.notify("Sorry, cannot get the project information at this time. Please try later", "error");
            return;
        }

        let {response, response_error} = await removeProjectFromFavorite(projectId);

        if (!response_error){

            // closing modal
            closeModal(PROJECT_FAVORITE["removeFavorite"]["modalId"]);

            // remove project from row
            $(`div#${projectId}`).slideUp(function() {
                $(this).remove();
            });

            // add project to favorite
            addProjectToUI(response["project"], false);
            
            enableAddProjectToFavorite(true);
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }


    });

    // ============ CREATE PROJET ==============
    // Create Project
    $(CREATE_PROJECT_SUBMIT_BTN).on("click", async function(){

        let projectName = $(PROJECT_NAME_INPUT).val().trim();
        let projectDescription = $(PROJECT_DESCRIPTION_INPUT).val().trim();

        if (_.isEmpty(projectName)){
            showPopupMessage(PROJECT_NAME_INPUT, "Cannot be empty", "error", "top-right");
            return;
        }

        if (projectName.length < MIN_LENGTH_TITLE){
            showPopupMessage(PROJECT_NAME_INPUT, "Name is to short", "error", "top-right");
            return;
        }

        if (projectDescription.length > MAX_LENGTH_DESCRIPTION){
            showPopupMessage(PROJECT_DESCRIPTION_INPUT, "Description is too long", "error", "top-right");
            return;
        }

        let {response, response_error} = await createProject(projectName, projectDescription);

        if (!response_error){
            
            // check where to add project
            let addToFavorite = !($(FAVORITE_PROJECTS_CONTAINER).children().length >= MAX_NUMBER_OF_FAVORITE_PROJECTS);
            console.log(addToFavorite)
            
            addProjectToUI(response["project"], false);

            closeModal(CREATE_PROJECT_MODAL);
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });

    // Create project modal is closed
    $(CREATE_PROJECT_MODAL).on("hide.bs.modal", function(){

        // reset values to default. 
        $(PROJECT_NAME_INPUT).val("");
        $(PROJECT_DESCRIPTION_INPUT).val("");
    });
    // =========================================


    // =============== REMOVE PROJECT ==========
    // Remove modal is opening
    $(document).on("click", REMOVE_PROJECT_BTN, function(){
        
        const projectId = $(this).attr("data-projectid");

        if (_.isUndefined(projectId) || _.isNull(projectId) || _.isEmpty(projectId)){
            $.notify("Sorry, Cannot remove the project at this moment", "error");
            return;
        }

        // getting project name
        let projectName = $(`div#${projectId}`).find(PROJECT_TITLE_TEXT).text().trim();

        let removeModalParams = {
            title: "Removing project",
            body: `Are you sure you want to remove "${projectName}"?`,
            id: projectId,
        }

        // setup delete modal for project
        setUpRemoveModal(removeModalParams);
    });

    // SUBMIT BTN FOR REMOVE PROJECT
    $(REMOVE_CONFIRMATION_SUBMIT_BTN).on("click", async function(){
        const projectId = $(REMOVE_CONFIRMATION_HIDDEN_INPUT).val();

        if (_.isUndefined(projectId) || _.isNull(projectId) || _.isEmpty(projectId)){
            $.notify("Sorry, Cannot remove the project at this moment", "error");
            return;
        }

        let {response, response_error} = await deleteProject(projectId);
        
        if (!response_error){
            $.notify(response.msg, "success");

            // remove project from ui
            $(`div#${projectId}`).remove();

            // close modal
            closeModal(REMOVE_CONFIRMATION_MODAL);

        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });
    // ======================================


    // =============== EDIT PROJECT ==========
    $(document).on("click", EDIT_PROJECT_BTN, function(){
        const projectId = $(this).attr("data-projectid");

        if (_.isUndefined(projectId) || _.isNull(projectId) || _.isEmpty(projectId)){
            $.notify("Sorry, cannot edit the project at this moment", "error");
            return;
        }

        // getting project name
        let projectName = $(`div#${projectId}`).find(PROJECT_TITLE_TEXT).text().trim();
        let projectDescription = $(`div#${projectId}`).find(PROJECT_DESCRIPTION_TEXT).text();

        // updating modal with project information
        $(EDIT_PROJECT_NAME).val(projectName);
        $(EDIT_PROJECT_DESCRIPTION).val(projectDescription);
        $(EDIT_PROJECT_HIDDEN_INPUT).val(projectId);
    });

    // SUBMIT CHANGES FOR PROJECT
    $(EDIT_PROJECT_SUBMIT_BTN).on("click", async function(){
        const projectId = $(EDIT_PROJECT_HIDDEN_INPUT).val();

        if (_.isUndefined(projectId) || _.isNull(projectId) || _.isEmpty(projectId)){
            $.notify("Sorry, cannot update the project at this moment", "error");
            return;
        }

        let projectName = $(EDIT_PROJECT_NAME).val().trim();
        let projectDescription = $(EDIT_PROJECT_DESCRIPTION).val().trim();

        if (_.isEmpty(projectName)){
            showPopupMessage(PROJECT_NAME_INPUT, "Cannot be empty", "error", "top-right");
            return;
        }

        if (projectName.length < MIN_LENGTH_TITLE){
            showPopupMessage(PROJECT_NAME_INPUT, "Name is to short", "error", "top-right");
            return;
        }

        if (projectDescription.length > MAX_LENGTH_DESCRIPTION){
            showPopupMessage(PROJECT_DESCRIPTION_INPUT, "Description is too long", "error", "top-right");
            return;
        }

        let update = {
            name: projectName,
            description: projectDescription,
        }

        let {response, response_error} = await updateProject(projectId, update);
        
        if (!response_error){
            $.notify(response.msg, "success");

           // update title
            $(`div#${projectId} ${PROJECT_TITLE_TEXT}`).text(projectName);

            // update description
            $(`div#${projectId} ${PROJECT_DESCRIPTION_TEXT}`).text(projectDescription);

            // close modal
            closeModal(EDIT_PROJECT_MODAL);

            // reset hidden input
            $(EDIT_PROJECT_HIDDEN_INPUT).val(UNNASIGNED_VALUE);
        }else{
            $.notify(response_error.data.responseJSON.msg, "error");
        }
    });
    // ======================================

    // =============== FILTER PROJECT ==========

    // when the user types something in the search filter
    $(FILTER_PROJECTS_INPUT).keyup( function(){
        let userInput = $(this).val().toLowerCase().trim();

        // Filter favorites projects
        filterProject(FAVORITE_PROJECTS_CONTAINER, userInput);

        // Filter row projects
        filterProject(ROW_PROJECTS_CONTAINER, userInput);
        
    });

    // GO TO PROJECT 
    $(document).on("click", GO_TO_PROJECT, function(){

        // get the id of the project the user clicked
        const clickedProjectId = $(this).attr("data-projectid");

        window.location.href = `/dashboard/${clickedProjectId}`;
    });
});

/**
 * Filter project in UI
 * @param {String} selector 
 * @param {String} userInput 
 */
function filterProject(selector, userInput){

    $(`${selector} .project-container`).each(function(){

        // getting project name and description
        let projectName = $(this).find(".project-name").text().toLowerCase().trim();

        // check if user input match project name or description
        let userInputMatchProjectName = projectName.includes(userInput);

        if (userInputMatchProjectName){
            $(this).removeClass("d-none");
        }else{
            $(this).addClass("d-none");
        }
    });
}


/**
 * Add project to UI 
 * @param {Object} project 
 * @param {Boolean} isFavorite 
 */
function addProjectToUI(project, isFavorite){

    let projectTemplate = '';

    if (isFavorite){
        projectTemplate = `
        <div id="${project["_id"]}" class="col-3 card text-white bg-dark mb-6 card-project add-shadow-box">             
        
            <div class="favorite-icon-project-container remove-favorite-container">
                <span class="favorite-icon-container remove-project-favorite-btn" 
                data-projectid="${project["_id"]}"
                data-projectname="${project["title"]}"
                data-toggle="modal" 
                data-target="#remove-project-favorite-modal">
                    <i class="fas fa-star favoriteIconAct"></i>
                </span>
            </div>

            <div class="card-body">
                <div class="initals-container card-initials pr-2 go-to-project" data-projectid="${project["_id"]}">
                    <div class="project-initials-container bg-initials-color" style="background-color: ${project['initialsColors']}">
                        <span>${project["initials"]}</span>
                    </div>
                </div>
                
                <h4 class="card-title go-to-project project-name" data-projectid="${project["_id"]}">
                    ${project["title"]}
                </h4>
                <p class="card-text project-description description-color">
                    ${project["description"]}
                </p>
            </div>
            <div class="pr-4 project-icons" style="text-align: right;">
            <span class="edit-project-btn" data-projectid="${project["_id"]}"><i class="fas fa-edit"></i></span>
            <span class="remove-project-btn" data-toggle="modal" data-target="#remove-confirmation-modal" data-projectid="${project["_id"]}"><i class="fas fa-trash"></i></span>
            </div>
        </div>`;

        // add to UI
        $(FAVORITE_PROJECTS_CONTAINER).append(projectTemplate);
        console.log("ADDING TO FAVORITE");
    }else{
        projectTemplate = `
        <div id="${project["_id"]}" class="row mb-4 add-shadow-box project-row">

            <div class="favorite-icon-project-container make-project-favorite-container">
                <span 
                    class="favorite-icon-container make-project-favorite-btn" 
                    data-projectid="${project["_id"]}"
                    data-projectname="${project["title"]}"
                    data-toggle="modal" data-target="#make-project-favorite-modal">
                    <i class="fas fa-star favoriteIconInactive"></i>
                </span>
            </div>

            <div class="initals-container pt-4 go-to-project" data-projectid="${project["_id"]}">
                <div class="project-initials-container bg-initials-color" style="background-color: ${project['initialsColors']}">
                    <span>${project["initials"]}</span>
                </div>
            </div>
            <div class="col-9 pt-2">

                <div class="row">
                    <div class="col-12 go-to-project" data-projectid="${project["_id"]}">
                        <span class="project-name"> ${project["title"]}</span>
                    </div>

                    <div class="col-12">
                        <span class="project-description description-color">
                            ${project["description"]}
                            &nbsp;
                        </span>

                    </div>

                    <div class="col-12">
                        <span class="project-work-done description-color"> 
                            <i class="fas fa-clipboard-list"></i> 0/0 Work items completed
                        </span>
                    </div>
                </div>
            </div>

            <div class="col-2">
                <div class="pr-4 project-icons project-icons-row" style="text-align: right;">
                    <span class="edit-project-btn" data-projectid="${project["_id"]}">
                        <i class="fas fa-edit"></i>
                    </span>
                    <span class="remove-project-btn" data-toggle="modal" data-target="#remove-confirmation-modal" data-projectid="${project["_id"]}">
                        <i class="fas fa-trash"></i>
                    </span>
                </div>
            </div>
        </div>`;

        $(ROW_PROJECTS_CONTAINER).append(projectTemplate);
    }
}

/**
 * Disable the add project to favorite button.
 * @param {Boolean} enable 
 */
function enableAddProjectToFavorite(enable){
    
    if (enable){
        $(PROJECT_FAVORITE["makeFavorite"]["container"]).removeClass("d-none");
    }else{ // disabled
        $(PROJECT_FAVORITE["makeFavorite"]["container"]).addClass("d-none");
    }
}