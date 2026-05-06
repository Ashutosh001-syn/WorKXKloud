export const API_BASE_URL = 'http://103.185.75.124:8021/api/admin';

export const API_ENDPOINTS = {
  USER_LIST: `${API_BASE_URL}/user_list`,
  CREATE_USER: `${API_BASE_URL}/create_user`,
  UPDATE_USER: `${API_BASE_URL}/update_user`,
  UPDATE_STATUS: `${API_BASE_URL}/update_status`,
  CREATE_PROJECT_API: `${API_BASE_URL}/create_project`,
  ADD_PROJECT: `${API_BASE_URL}/add-project`,
  GET_PROJECT_LIST: `${API_BASE_URL}/get_projectList`,
  UPDATE_PROJECT: `${API_BASE_URL}/update_project`,
  REALLOCATE_PROJECT: `${API_BASE_URL}/re-allocated`,
    RESOURCE_LIST: `${API_BASE_URL}/resource_list`,
  CREATE_RESOURCE: `${API_BASE_URL}/create_resource`,
  UPDATE_RESOURCE: `${API_BASE_URL}/update_resource`,
  DEACTIVATE_RESOURCE: `${API_BASE_URL}/deactivate_resource`,
};
