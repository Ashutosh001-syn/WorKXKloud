/**
 * Temporary mock data — used only until the backend team ships
 * GET_BOARDS_BY_RESOURCE for the Kanban board (see src/config/api.js).
 *
 * Shape mirrors ProjectBoardSection's mapped task shape 1:1, so
 * fetchBoardTasks() in ProjectBoardSection.jsx only needs its fetch call
 * uncommented once the endpoint is live — no changes needed anywhere else.
 */

const MOCK_ASSIGNEE = {
  resource_id: 'res-dianne',
  resource_name: 'Dianne Russell',
  resource_role: 'UI/UX Designer',
};

const RAW_MOCK_BOARD_TASKS = [
  { boardId: 1, title: 'Research & Analysis', status: 'To Do', priority: 'High', dueDate: '2024-07-09' },
  { boardId: 4, title: 'Design System & Style Guide', status: 'To Do', priority: 'Medium', dueDate: '2024-07-12' },
  { boardId: 5, title: 'Mobile UI Design', status: 'To Do', priority: 'Medium', dueDate: '2024-07-13' },
  { boardId: 2, title: 'Wireframe Design', status: 'In Progress', priority: 'High', dueDate: '2024-07-10' },
  { boardId: 8, title: 'Responsive Implementation', status: 'In Progress', priority: 'High', dueDate: '2024-07-15' },
  { boardId: 3, title: 'UI Design', status: 'Review', priority: 'High', dueDate: '2024-07-11' },
  { boardId: 9, title: 'API Integration', status: 'Review', priority: 'Medium', dueDate: '2024-07-16' },
  { boardId: 6, title: 'Competitor Analysis', status: 'Completed', priority: 'Medium', dueDate: '2024-07-09' },
  { boardId: 10, title: 'Cross Browser Testing', status: 'Completed', priority: 'Medium', dueDate: '2024-07-18' },
];

export function getMockBoardTasks(projectId, projectName = 'Website Redesign') {
  return RAW_MOCK_BOARD_TASKS.map((item) => ({
    id: `WR-${String(item.boardId).padStart(2, '0')}`,
    boardId: item.boardId,
    title: item.title,
    projectName,
    priority: item.priority,
    date: new Date(item.dueDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    isCompleted: item.status === 'Completed',
    status: item.status,
    rawApiData: {
      project_id: projectId,
      due_date: item.dueDate,
      resource_id: MOCK_ASSIGNEE.resource_id,
      resource_name: MOCK_ASSIGNEE.resource_name,
      resource_role: MOCK_ASSIGNEE.resource_role,
    },
  }));
}

export const mockBoardResources = [
  { id: 'res-dianne', name: 'Dianne Russell', role: 'UI/UX Designer' },
  { id: 'res-raj', name: 'Raj Verma', role: 'Frontend Developer' },
  { id: 'res-priya', name: 'Priya Singh', role: 'Backend Developer' },
  { id: 'res-neha', name: 'Neha Kumari', role: 'QA Engineer' },
];
