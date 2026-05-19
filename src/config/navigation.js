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
    label: 'User Management',
    to: '/create-user',
    eyebrow: 'Users',
    title: 'User Management',
    description:
      'Add new team members, assign permissions, and keep account setup aligned with workspace roles.',
    highlights: ['14 pending invites', '6 role templates', '2 approval steps'],
  },
  {
    type: 'link',
    key: 'all-project',
    icon: 'allProjects',
    label: 'All Projects',
    to: '/all-project',
    eyebrow: 'Projects',
    title: 'All Projects',
    description:
      'Browse every active and archived initiative with quick visibility into progress, owners, and next milestones.',
    highlights: ['28 total projects', '12 active', '6 completed this quarter'],
  },
  {
    type: 'group',
    key: 'resource',
    icon: 'resource',
    label: 'Resource',
    children: [
      {
        label: 'Resource Master',
        to: '/resource/resource-master',
        eyebrow: 'Resource',
        title: 'Resource Master',
        description:
          'Manage and maintain all resource information in your organization.',
        highlights: ['10 total resources', '3 departments', '6 active roles'],
      },
      {
        label: 'Resource Allocation',
        to: '/resource/resource-allocation',
        eyebrow: 'Resource',
        title: 'Resource Allocation',
        description:
          'Track resource capacity and allocation percentage across teams.',
        highlights: ['4 fully allocated', '3 partial', '2 under allocated'],
      },
    ],
  },
  {
    type: 'group',
    key: 'project-management',
    icon: 'projectManagement',
    label: 'Project Management',
    children: [
      {
        label: 'Project Allocation',
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
    type: 'link',
    key: 'calendar',
    icon: 'calendar',
    label: 'Calendar',
    to: '/calendar',
    eyebrow: 'Calendar',
    title: 'Calendar',
    description: 'Schedule team events, deadlines, milestones, and organization holidays.',
    highlights: ['4 upcoming holidays', '2 milestones this week', '1 company-wide event'],
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

export const hiddenWorkspaceRoutes = [
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
    label: 'Expense Reports',
    to: '/expense/reports',
    eyebrow: 'Expense',
    title: 'Expense Reports',
    description:
      'Review expense summaries, monthly trends, and recovery visibility for finance and delivery teams.',
    highlights: ['6 summary views', '3 pending exports', '91% policy compliance'],
  },
]
