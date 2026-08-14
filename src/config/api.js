export const API_ROOT_URL =
  import.meta.env.VITE_API_ROOT_URL ||
  'http://72.61.239.7:5051/api';


export const API_BASE_URL = `${API_ROOT_URL}/admin`;

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_ROOT_URL}/auth/login`,
  FORGOT_PASSWORD_GENERATE_OTP: `${API_ROOT_URL}/auth/forgot-password/generate-otp`,
  FORGOT_PASSWORD_VERIFY_OTP: `${API_ROOT_URL}/auth/forgot-password/verify-otp`,
  FORGOT_PASSWORD_RESET: `${API_ROOT_URL}/auth/forgot-password/reset`,

  // Admin
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
  // Write-only — confirmed live, but there's no read/GET counterpart yet,
  // so it can't be the source of truth for UI state (see scheduleWorkflow.js).
  SCHEDULE_STATUS_BY_PM: `${API_ROOT_URL}/projectManager/scheduleStatusByPm`,
  // Read counterpart — confirmed live. POST (not GET), and pmo_id is
  // required + actually filters (returns only projects that PMO has
  // touched via scheduleStatusByPm). No pm_id-scoped equivalent exists yet.
  GET_PROJECTS_STATUS: `${API_ROOT_URL}/admin/getProjectsStatus`,

  // Boards
  CREATE_BOARD: `${API_ROOT_URL}/users/create_board`,
  GET_BOARD: `${API_ROOT_URL}/projectManager/getBoard`,
  // Both status moves and field edits (resource_id) go through the same
  // record-level endpoint — confirmed live, and it requires the FULL
  // record (id, project_id, task_id, resource_id, status, pm_id) on every
  // call; sending a partial body nulls out the omitted columns server-side.
  UPDATE_BOARD_STATUS: `${API_ROOT_URL}/users/editBoard`,
  UPDATE_BOARD: `${API_ROOT_URL}/users/editBoard`,
  DELETE_BOARD: `${API_ROOT_URL}/users/deleteBoard`,
  GET_USER_DISCUSSION: `${API_ROOT_URL}/users/get_userDiscussion`,

  // Milestone
  UPDATE_PROJECT_MILESTONE: `${API_ROOT_URL}/projectManager/update_project_milestone`,

  // ==========================
  // Project Schedule (Gantt)
  // ==========================
  GET_PROJECT_SCHEDULE: `${API_ROOT_URL}/projectManager/get_project_schedule`,
  SCHEDULE_PROJECT_TASK: `${API_ROOT_URL}/projectManager/schedule_project`,
  CREATE_SUBTASK_SCHEDULE: `${API_ROOT_URL}/projectManager/subTask_schedule`,

  // NEW
  UPDATE_TASK_SCHEDULE: `${API_ROOT_URL}/projectManager/editTaskScheduleProject`,
  UPDATE_SUBTASK_SCHEDULE: `${API_ROOT_URL}/projectManager/editSubTaskSchedule`,

  DELETE_TASK_SUBTASK: `${API_ROOT_URL}/projectManager/deleteTaskSubtask`,

  // TODO(backend): placeholder — no workload/resource-allocation-hours
  // endpoint exists yet (verified: not in resource_list, not in
  // ResourceAllocationPage, not anywhere else). WorkloadPage tries this URL
  // and falls back to workloadDummyData.js on failure, so once this route
  // is real, swap the URL below and the page picks it up with no other
  // changes needed. Expected shape: { success, data: { activeProject: {...},
  // resources: [{ id, name, role, projects: [{ id, name, weekdayHours,
  // monthly, exceptions }] }] } } — same as workloadDummyData.js's exports.
  GET_WORKLOAD: `${API_ROOT_URL}/admin/get_workload`,

  // Notifications
  GET_NOTIFICATIONS: `${API_ROOT_URL}/users/get_notifications`,
  MARK_NOTIFICATION_READ: `${API_ROOT_URL}/users/mark_notification_read`,
  MARK_ALL_NOTIFICATIONS_READ: `${API_ROOT_URL}/users/mark_all_notifications_read`,
  CLEAR_ALL_NOTIFICATIONS: `${API_ROOT_URL}/users/clear_all_notifications`,
  DELETE_NOTIFICATION: `${API_ROOT_URL}/users/delete_notification`,
};