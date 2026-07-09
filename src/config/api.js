export const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL || 
'http://103.185.75.124:8021/api'
// 'http://localhost:8021/api'
;
export const API_BASE_URL = `${API_ROOT_URL}/admin`;

export const API_ENDPOINTS = {
  LOGIN: `${API_ROOT_URL}/auth/login`,
  FORGOT_PASSWORD_GENERATE_OTP: `${API_ROOT_URL}/auth/forgot-password/generate-otp`,
  FORGOT_PASSWORD_VERIFY_OTP: `${API_ROOT_URL}/auth/forgot-password/verify-otp`,
  FORGOT_PASSWORD_RESET: `${API_ROOT_URL}/auth/forgot-password/reset`,
  ALL_PROJECTS: `${API_BASE_URL}/all_projects`,
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
  ASSIGN_PROJECT: `${API_ROOT_URL}/projectManager/assign_project`,
  DEACTIVATE_RESOURCE: `${API_BASE_URL}/deactivate_resource`,
  // Holidays
  HOLIDAYS: `${API_BASE_URL}/holidays`,
  ADD_HOLIDAY: `${API_BASE_URL}/add_holiday`,
  UPDATE_HOLIDAY: `${API_BASE_URL}/update_holiday`,
  DELETE_HOLIDAY: `${API_BASE_URL}/delete_holiday`,
  CHECK_HOLIDAYS: `${API_BASE_URL}/check_holidays`,
  // Project Manager
  GET_PROJECTS_BY_PM: `${API_ROOT_URL}/projectManager/get_projectsByPm`,
  PROJECT_APPROVAL_BY_PM: `${API_ROOT_URL}/projectManager/project_approvalBYPM`,
  CREATE_REQUIRED_RESOURCE: `${API_ROOT_URL}/projectManager/create_requiredResource`,
  GET_PM_BACKLOG: `${API_ROOT_URL}/projectManager/get_pmBacklog`,
  GET_BOARDS_BY_RESOURCE: `${API_ROOT_URL}/users/get_BoardsByResource`,
  CREATE_BOARD: `${API_ROOT_URL}/users/create_board`,
  GET_USER_DISCUSSION: `${API_ROOT_URL}/users/get_userDiscussion`,
  UPDATE_PROJECT_MILESTONE: `${API_ROOT_URL}/projectManager/update_project_milestone`,
};
