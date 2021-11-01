/**
 * Here will be all api calls for the work items API
*/

/**
 * Assign work items to a team
 * @param {Object} data -  Expecting: workItems| sprintId
 * @returns {Object} - response | error_response
 */
async function assignWorkItemToTeam(teamId, data){
    // getting project id
    const projectId = getProjectId();
    const API_LINK_ASSIGN_TEAM_TO_WORK_ITEM = `/dashboard/api/${projectId}/assignWorkItemToTeam/${teamId}`;

    let response_error = null;
    let response = await make_post_request(API_LINK_ASSIGN_TEAM_TO_WORK_ITEM, data).catch(err => {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}


/**
 * Create work item for current project 
 * @param {Object} workItemData 
 * @returns {Object} - response | error_response
 */
async function createWorkItem(workItemData){
    // getting project id
    const projectId = getProjectId();

    const API_LINK_CREATE_WORK_ITEM = `/dashboard/api/${projectId}/createWorkItem`;

    let response_error = null;
    const response = await make_post_request(API_LINK_CREATE_WORK_ITEM, workItemData).catch(err=> {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}

/**
 * update work item
 * @param {String} workItemId 
 * @param {Object} values 
 * @returns 
 */
 async function updateWorkItem(workItemId, values){
    
    const projectId = getProjectId();
    const API_LINK_UPDATE_WORK_ITEM = `/dashboard/api/${projectId}/updateWorkItem/${workItemId}`;

    let response_error = null;
    const response = await make_post_request(API_LINK_UPDATE_WORK_ITEM, values).catch(err=> {
        response_error = err;
    });

    return {"response": response, "response_error": response_error};
}