export const sidebarMenu = [
  {
    type: 'link',
    key: 'dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    to: '/',
  },
  {
    type: 'link',
    key: 'create-user',
    icon: 'users',
    label: 'Create User',
    to: '/create-user',
    eyebrow: 'Users',
    title: 'Create User',
    description:
      'Add new team members, assign permissions, and keep account setup aligned with workspace roles.',
    highlights: ['14 pending invites', '6 role templates', '2 approval steps'],
  },
  {
    type: 'link',
    key: 'all-project',
    icon: 'allProjects',
    label: 'All Project',
    to: '/all-project',
    eyebrow: 'Projects',
    title: 'All Project',
    description:
      'Browse every active and archived initiative with quick visibility into progress, owners, and next milestones.',
    highlights: ['28 total projects', '12 active', '6 completed this quarter'],
  },
  {
    type: 'group',
    key: 'project-management',
    icon: 'projectManagement',
    label: 'Project Management',
    children: [
      {
        label: 'Create Project',
        to: '/project-management/create-project',
        eyebrow: 'Management',
        title: 'Create Project',
        description:
          'Launch new projects with owner details, schedules, budgets, and delivery defaults already prepared.',
        highlights: ['4 starter templates', '7 required fields', '1 approval workflow'],
      },
      {
        label: 'Project List',
        to: '/project-management/project-list',
        eyebrow: 'Management',
        title: 'Project List',
        description:
          'Review the full project register, inspect health quickly, and move between delivery workstreams.',
        highlights: ['18 tracked items', '5 filtered views', '3 overdue milestones'],
      },
    ],
  },
  {
    type: 'group',
    key: 'expense',
    icon: 'expense',
    label: 'Expense',
    children: [
      {
        label: 'Expense List',
        to: '/expense',
        eyebrow: 'Expense',
        title: 'Expense List',
        description:
          'Track submitted spending, reimbursement status, and budget exceptions across current projects.',
        highlights: ['34 requests open', '12 billable items', '2 flagged claims'],
      },
      {
        label: 'Reports',
        to: '/expense/reports',
        eyebrow: 'Expense',
        title: 'Expense Reports',
        description:
          'Review expense summaries, monthly trends, and recovery visibility for finance and delivery teams.',
        highlights: ['6 summary views', '3 pending exports', '91% policy compliance'],
      },
    ],
  },
]

export const workspaceRoutes = sidebarMenu.flatMap((item) => {
  if (item.type === 'group') {
    return item.children
  }

  if (item.to === '/') {
    return []
  }

  return [item]
})
