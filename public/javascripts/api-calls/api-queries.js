

/**
 * Save the query for the user
 * @param {String} name - name of the query
 * @param {Array} query - query
 * @returns 
 */
async function saveQuery(name, query) {

    // making the request to the API
    const projectId = getProjectId();
    const API_LINK_SAVE_QUERY = `/dashboard/api/${projectId}/saveQuery`;

    let response_error = null;
    const response = await make_post_request(API_LINK_SAVE_QUERY, {"query": query, "name": name}).catch(err=> {
        response_error = err;
    });

    return {response, response_error};
}

/**
 * Get work items from query
 * @param {Array} query - query
 * @returns 
 */
 async function getWorkItemsByQuery(query) {
    // making the request to the API
    const projectId = getProjectId();
    const API_LINK_GET_QUERY = `/dashboard/api/${projectId}/getWorkItemsByQuery`;

    let response_error = null;
    const response = await make_post_request(API_LINK_GET_QUERY, {"query": query}).catch(err=> {
        response_error = err;
    });

    return {response, response_error};
}


/**
 * Getting query by id
 * @param {String} queryId - Id of the query
 * @returns 
 */
async function getQueryById(queryId) {
   
    // making the request to the API
    const projectId = getProjectId();
    const API_LINK_GET_QUERY = `/dashboard/api/${projectId}/getQuery?queryId=${queryId}`;

    let response_error = null;
    const response = await make_get_request(API_LINK_GET_QUERY).catch(err=> {
        response_error = err;
    });

    return {response, response_error};
}

/**
 * Remove query from user
 * @param {String} queryId - Id of the query
 * @returns 
 */
async function removeQueryById(queryId) {
   
    // making the request to the API
    const projectId = getProjectId();
    const API_LINK_REMOVE_QUERY = `/dashboard/api/${projectId}/removeMyQuery`;

    let response_error = null;
    const response = await make_post_request(API_LINK_REMOVE_QUERY, {queryId: queryId}).catch(err=> {
        response_error = err;
    });

    return {response, response_error};
}