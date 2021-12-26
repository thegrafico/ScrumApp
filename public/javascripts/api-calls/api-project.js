/**
 * Create project
 * @param {String} name - Name of the project 
 * @param {String} description - description of project 
 * @returns {Object} response, response_error
 */
async function createProject(name, description) {

    const API_LINK_CREATE_PROJECT = "/dashboard/api/createProject";
    let request_data = {
        name: name,
        description: description
    }
    let response_error = null;
    const response = await make_post_request(API_LINK_CREATE_PROJECT, request_data).catch(err => {
        response_error = err;
    });

    return {response, response_error};
}

/**
 * Delete project
 * @param {String} name - Name of the project 
 * @param {String} description - description of project 
 * @returns {Object} response, response_error
 */
 async function deleteProject(projectId) {

    const API_LINK_DELETE_PROJECT = "/dashboard/api/deleteProject";
    
    let request_data = {projectId: projectId}
    
    let response_error = null;
    
    const response = await make_post_request(API_LINK_DELETE_PROJECT, request_data).catch(err => {
        response_error = err;
    });

    return {response, response_error};
}

/**
 * Update project basic information
 * @param {String} projectId 
 * @param {Object} update 
 * @returns {Object} response, response_error
 */
 async function updateProject(projectId, update) {

    const API_LINK_UPDATE_PROJECT = "/dashboard/api/updateProject";
    let request_data = {
        projectId: projectId,
        name: update["name"],
        description: update["description"]
    }
    let response_error = null;
    const response = await make_post_request(API_LINK_UPDATE_PROJECT, request_data).catch(err => {
        response_error = err;
    });

    return {response, response_error};
}

/**
 * Add project to favorite for user 
 * @param {String} projectId 
 * @returns {Object} response, response_error
 */
 async function addProjectToFavorite(projectId) {

    const API_LINK_ADD_PROJECT_TO_FAVORITE = "/dashboard/api/addProjectToFavorite";
    let request_data = {projectId: projectId};
    let response_error = null;
    const response = await make_post_request(API_LINK_ADD_PROJECT_TO_FAVORITE, request_data).catch(err => {
        response_error = err;
    });

    return {response, response_error};
}

/**
 * remove project from favorite for user 
 * @param {String} projectId 
 * @returns {Object} response, response_error
 */
 async function removeProjectFromFavorite(projectId) {

    const API_LINK_REMOVE_PROJECT_TO_FAVORITE = "/dashboard/api/removeProjectFromFavorite";
    let request_data = {projectId: projectId};
    let response_error = null;
    const response = await make_post_request(API_LINK_REMOVE_PROJECT_TO_FAVORITE, request_data).catch(err => {
        response_error = err;
    });

    return {response, response_error};
}

/**
 * remove project from favorite for user 
 * @param {String} projectId - id of the project
 * @param {String} status - Status of the project
 * @returns {Object} response, response_error
 */
async function updateProjectStatus(projectId, status) {
    
    const API_LINK_UPDATE_PROJECT_STATUS = `/dashboard/api/${projectId}/updateProjectStatus`;
    let request_data = {status: status};
    let response_error = null;
    
    const response = await make_post_request(API_LINK_UPDATE_PROJECT_STATUS, request_data).catch(err => {
        response_error = err;
    });

    return {response, response_error};
}


/**
 * Decline project invitation
 * @param {String} projectId 
 * @param {String} notificationId 
 * @returns {Object} - response, response_error
 */
async function declineProjectInvitation(projectId, notificationId){
    const API_LINK_DECLINE_PROJECT_INVITATION = `/dashboard/api/declineProjectInvitation`;

    const requestData = {"notificationId": notificationId, "projectId": projectId};

    let response_error = undefined;
    const response = await make_post_request(API_LINK_DECLINE_PROJECT_INVITATION,requestData).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}


/**
 * Update notification status
 * @param {String} notificationId 
 * @param {String} status 
 * @returns 
 */
async function updateNotificationStatus(notificationId, status){

    const API_LINK_UPDATE_NOTIFICATION_STATUS = `/dashboard/api/updateNotificationStatus`;

    const requestData = {"notificationId": notificationId, "status": status};

    let response_error = undefined;
    const response = await make_post_request(API_LINK_UPDATE_NOTIFICATION_STATUS,requestData).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}

/**
 * Update notification status
 * @param {String} notificationId 
 * @param {String} status 
 * @returns 
 */
 async function leaveCurrentProject(){
    
    const projectId = getProjectId();

    const API_LINK_LEAVE_PROJECT = `/dashboard/api/${projectId}/leaveProject`;

    let response_error = undefined;
    const response = await make_post_request(API_LINK_LEAVE_PROJECT).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}