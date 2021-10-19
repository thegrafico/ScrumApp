/**
 * Create project
 * @param {String} name - Name of the project 
 * @param {String} description - description of project 
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