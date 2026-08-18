// Initial mock dataset and localStorage storage helper for PMO Resource Change Requests

const STORAGE_KEY = 'workxkloud_pmo_resource_change_requests'
const BADGE_KEY = 'pmo_pending_resource_requests_badge'

export const INITIAL_RESOURCE_CHANGE_REQUESTS = [
  {
    id: 'RCR-2026001',
    requestedOn: '2025-05-31T11:30:00',
    requestedOnFormatted: '31 May 2025, 11:30 AM',
    status: 'Pending PMO Review', // 'Pending PMO Review' | 'Approved' | 'Rejected' | 'Clarification Requested'
    priority: 'High',
    department: 'IT',
    projectId: 'PJ-2026001',
    projectName: 'Website Redesign',
    projectManager: 'Ankit Sharma',
    projectManagerEmail: 'ankit.sharma@workxkloud.com',
    dueDate: '2026-06-30',
    dueDateFormatted: '30 Jun 2026',
    startDate: '2025-01-15',
    startDateFormatted: '15 Jan 2025',
    duration: '180 days',
    projectType: 'Web Development',
    methodology: 'Agile Scrum',
    location: 'Noida, India / Remote',
    budget: 1850000,
    noBilling: 'Fixed Price Milestone',
    technology: 'React 19, Tailwind CSS, Node.js, PostgreSQL',
    projectScope: 'Complete redesign of corporate client portal, incorporating multi-tenant dashboards, high-speed reporting, and role-based permissions.',
    
    requestSummary: 'PM has requested changes in the resource allocation for better project execution.',
    reasonProvidedByPM: 'Ravi is overloaded in another critical project. Need Aman for UI development. Also need one additional QA resource.',
    
    currentAllocation: [
      {
        srNo: 1,
        id: 'res-101',
        resourceName: 'Ravi Sharma',
        role: 'UI Developer',
        allocation: 100,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
      },
      {
        srNo: 2,
        id: 'res-102',
        resourceName: 'Sagar Patel',
        role: 'Backend Developer',
        allocation: 100,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
      },
      {
        srNo: 3,
        id: 'res-103',
        resourceName: 'Anita Verma',
        role: 'QA Engineer',
        allocation: 70,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
      },
    ],
    
    requestedAllocation: [
      {
        srNo: 1,
        id: 'res-104',
        resourceName: 'Aman Singh',
        role: 'UI Developer',
        allocation: 100,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
        change: 'Added', // 'Added' | 'Removed' | 'Modified' | 'Unchanged'
      },
      {
        srNo: 2,
        id: 'res-102',
        resourceName: 'Sagar Patel',
        role: 'Backend Developer',
        allocation: 100,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
        change: 'Unchanged',
      },
      {
        srNo: 3,
        id: 'res-103',
        resourceName: 'Anita Verma',
        role: 'QA Engineer',
        allocation: 70,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
        change: 'Unchanged',
      },
      {
        srNo: 4,
        id: 'res-105',
        resourceName: 'New QA Resource',
        role: 'QA Engineer',
        allocation: 50,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
        change: 'Added',
      },
    ],

    pmRequestNote: 'Ravi Sharma is currently allocated to another high priority project and will not be able to meet the timelines. Requesting to replace with Aman Singh who is available and experienced in similar projects. Also requesting one additional QA resource to improve testing coverage.',
    
    attachments: [
      {
        id: 'att-1',
        name: 'Resource_Justification.pdf',
        size: '245 KB',
        url: '#',
        uploadedAt: '31 May 2025, 11:25 AM',
      },
    ],

    clientDetails: {
      clientName: 'Acme Cloud Solutions Inc.',
      clientCode: 'CL-8802',
      primaryContact: 'David Miller',
      role: 'VP of Engineering',
      email: 'david.miller@acmecloud.com',
      phone: '+1 (555) 349-2810',
      address: '450 Mission St, Suite 1200, San Francisco, CA 94105',
      timeZone: 'PST (UTC-8)',
    },

    paymentMilestones: [
      {
        id: 'pm-1',
        milestone: 'UI/UX Design System & Architectural Blueprint',
        percentage: 20,
        amount: 370000,
        status: 'Completed',
        dueDate: '2025-02-28',
      },
      {
        id: 'pm-2',
        milestone: 'Core Frontend Modules & Authentication Integration',
        percentage: 30,
        amount: 555000,
        status: 'In Progress',
        dueDate: '2025-07-15',
      },
      {
        id: 'pm-3',
        milestone: 'Backend API Service & QA Automation Suite',
        percentage: 30,
        amount: 555000,
        status: 'Pending',
        dueDate: '2025-11-30',
      },
      {
        id: 'pm-4',
        milestone: 'Production Go-Live, Load Testing & Handover',
        percentage: 20,
        amount: 370000,
        status: 'Pending',
        dueDate: '2026-06-30',
      },
    ],

    activityLog: [
      {
        id: 'act-1',
        timestamp: '31 May 2025, 11:30 AM',
        author: 'Ankit Sharma (Project Manager)',
        avatarTone: 'bg-blue-100 text-blue-700',
        action: 'Resource Change Request Submitted',
        details: 'Requested replacement of Ravi Sharma with Aman Singh and added 1 QA resource (50% allocation).',
      },
      {
        id: 'act-2',
        timestamp: '31 May 2025, 11:31 AM',
        author: 'System Notification',
        avatarTone: 'bg-amber-100 text-amber-700',
        action: 'Pending PMO Review',
        details: 'Change request queued for PMO allocation and approval.',
      },
    ],
  },
  {
    id: 'RCR-2026002',
    requestedOn: '2025-06-01T09:15:00',
    requestedOnFormatted: '01 Jun 2025, 09:15 AM',
    status: 'Pending PMO Review',
    priority: 'Medium',
    department: 'Mobile Apps',
    projectId: 'PJ-2026012',
    projectName: 'Mobile Banking App 2.0',
    projectManager: 'Pooja Hegde',
    projectManagerEmail: 'pooja.hegde@workxkloud.com',
    dueDate: '2026-08-15',
    dueDateFormatted: '15 Aug 2026',
    startDate: '2025-03-01',
    startDateFormatted: '01 Mar 2025',
    duration: '210 days',
    projectType: 'Mobile Development (iOS & Android)',
    methodology: 'Agile Scrum',
    location: 'Bangalore, India',
    budget: 2400000,
    noBilling: 'Time & Material',
    technology: 'React Native, Swift, Kotlin, GraphQL',
    projectScope: 'Native biometric auth and UPI 2.0 module for tier-1 banking client.',
    
    requestSummary: 'Requesting additional iOS specialist due to Apple compliance updates.',
    reasonProvidedByPM: 'Apple App Store guideline change requires Swift Native bridge refactor.',
    
    currentAllocation: [
      {
        srNo: 1,
        id: 'res-201',
        resourceName: 'Vikram Joshi',
        role: 'Mobile Lead',
        allocation: 100,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
      },
      {
        srNo: 2,
        id: 'res-202',
        resourceName: 'Neha Rao',
        role: 'React Native Dev',
        allocation: 100,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
      },
    ],
    
    requestedAllocation: [
      {
        srNo: 1,
        id: 'res-201',
        resourceName: 'Vikram Joshi',
        role: 'Mobile Lead',
        allocation: 100,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
        change: 'Unchanged',
      },
      {
        srNo: 2,
        id: 'res-202',
        resourceName: 'Neha Rao',
        role: 'React Native Dev',
        allocation: 100,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
        change: 'Unchanged',
      },
      {
        srNo: 3,
        id: 'res-203',
        resourceName: 'Rohan Mehra',
        role: 'iOS Specialist',
        allocation: 80,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
        change: 'Added',
      },
    ],

    pmRequestNote: 'Need senior iOS engineer for 6 weeks to ensure security compliance and encryption audit pass.',
    attachments: [
      {
        id: 'att-2',
        name: 'Apple_Security_Compliance_Doc.pdf',
        size: '1.2 MB',
        url: '#',
        uploadedAt: '01 Jun 2025, 09:10 AM',
      },
    ],

    clientDetails: {
      clientName: 'Fintech Trust Corp',
      clientCode: 'CL-9244',
      primaryContact: 'Sarah Jenkins',
      role: 'Head of Digital Banking',
      email: 'sjenkins@fintechtrust.com',
      phone: '+44 20 7946 0912',
      address: '100 Bishopsgate, London EC2N 4AG, UK',
      timeZone: 'GMT (UTC+0)',
    },

    paymentMilestones: [
      {
        id: 'pm-21',
        milestone: 'Sprint 1 - 3 Core Banking APIs',
        percentage: 40,
        amount: 960000,
        status: 'Completed',
        dueDate: '2025-05-15',
      },
      {
        id: 'pm-22',
        milestone: 'iOS Swift Native Integration & Audit',
        percentage: 30,
        amount: 720000,
        status: 'In Progress',
        dueDate: '2025-09-30',
      },
      {
        id: 'pm-23',
        milestone: 'UAT & Store Deployment',
        percentage: 30,
        amount: 720000,
        status: 'Pending',
        dueDate: '2026-08-15',
      },
    ],

    activityLog: [
      {
        id: 'act-21',
        timestamp: '01 Jun 2025, 09:15 AM',
        author: 'Pooja Hegde (Project Manager)',
        avatarTone: 'bg-purple-100 text-purple-700',
        action: 'Resource Change Request Submitted',
        details: 'Requested addition of Rohan Mehra (iOS Specialist, 80%).',
      },
    ],
  },
  {
    id: 'RCR-2026003',
    requestedOn: '2025-05-28T14:45:00',
    requestedOnFormatted: '28 May 2025, 02:45 PM',
    status: 'Approved',
    priority: 'Low',
    department: 'Cloud Ops',
    projectId: 'PJ-2026008',
    projectName: 'AWS Cloud Infrastructure Migration',
    projectManager: 'Sunil Kumar',
    projectManagerEmail: 'sunil.kumar@workxkloud.com',
    dueDate: '2025-12-31',
    dueDateFormatted: '31 Dec 2025',
    startDate: '2025-02-01',
    startDateFormatted: '01 Feb 2025',
    duration: '150 days',
    projectType: 'DevOps & Cloud',
    methodology: 'Kanban',
    location: 'Hyderabad, India',
    budget: 950000,
    noBilling: 'Fixed Price',
    technology: 'AWS, Terraform, Kubernetes, Docker',
    projectScope: 'Lift-and-shift legacy monolith into Kubernetes EKS cluster.',
    
    requestSummary: 'DevOps resource hours reduced as migration completed ahead of schedule.',
    reasonProvidedByPM: 'Phase 1 completed smoothly, freeing up 50% capacity of DevOps Engineer.',
    
    currentAllocation: [
      {
        srNo: 1,
        id: 'res-301',
        resourceName: 'Kunal Sen',
        role: 'DevOps Architect',
        allocation: 100,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
      },
    ],
    
    requestedAllocation: [
      {
        srNo: 1,
        id: 'res-301',
        resourceName: 'Kunal Sen',
        role: 'DevOps Architect',
        allocation: 50,
        workingDays: ['M', 'T', 'W', 'T', 'F'],
        change: 'Modified',
      },
    ],

    pmRequestNote: 'Kunal has stabilized EKS clusters. We can release 50% of his bandwidth for other critical company projects.',
    attachments: [],

    clientDetails: {
      clientName: 'Global Logistics Hub',
      clientCode: 'CL-5519',
      primaryContact: 'Arun Nair',
      role: 'CTO',
      email: 'arun.nair@globallogistics.com',
      phone: '+91 98450 11223',
      address: 'HITEC City, Hyderabad, India',
      timeZone: 'IST (UTC+5:30)',
    },

    paymentMilestones: [
      {
        id: 'pm-31',
        milestone: 'Cloud Architecture & Terraform Scripts',
        percentage: 50,
        amount: 475000,
        status: 'Completed',
        dueDate: '2025-04-15',
      },
      {
        id: 'pm-32',
        milestone: 'Final Cutover & Verification',
        percentage: 50,
        amount: 475000,
        status: 'Completed',
        dueDate: '2025-12-31',
      },
    ],

    activityLog: [
      {
        id: 'act-31',
        timestamp: '28 May 2025, 02:45 PM',
        author: 'Sunil Kumar (Project Manager)',
        avatarTone: 'bg-emerald-100 text-emerald-700',
        action: 'Resource Change Request Submitted',
        details: 'Requested reduction of Kunal Sen allocation from 100% to 50%.',
      },
      {
        id: 'act-32',
        timestamp: '29 May 2025, 10:00 AM',
        author: 'Admin (PMO)',
        avatarTone: 'bg-emerald-100 text-emerald-700',
        action: 'Changes Approved by PMO',
        details: 'Approved. Resource allocation updated in PMO Master registry.',
      },
    ],
  },
]

// Fetch all requests
export function getResourceChangeRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESOURCE_CHANGE_REQUESTS))
      updateBadgeCount(INITIAL_RESOURCE_CHANGE_REQUESTS)
      return INITIAL_RESOURCE_CHANGE_REQUESTS
    }
    const parsed = JSON.parse(raw)
    updateBadgeCount(parsed)
    return parsed
  } catch {
    return INITIAL_RESOURCE_CHANGE_REQUESTS
  }
}

// Fetch single request by ID
export function getResourceChangeRequestById(id) {
  const all = getResourceChangeRequests()
  return all.find((item) => item.id.toLowerCase() === (id || '').toLowerCase()) || all[0]
}

// Update badge count
export function updateBadgeCount(requests) {
  const pendingCount = (requests || []).filter(
    (r) => r.status === 'Pending PMO Review' || r.status === 'Clarification Requested'
  ).length
  localStorage.setItem(BADGE_KEY, String(pendingCount))
  window.dispatchEvent(new Event('badge-update'))
}

// Approve Request
export function approveResourceChangeRequest(id, pmoNotes = '') {
  const all = getResourceChangeRequests()
  const now = new Date()
  const timeFormatted = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ', ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const updated = all.map((req) => {
    if (req.id.toLowerCase() === (id || '').toLowerCase()) {
      return {
        ...req,
        status: 'Approved',
        pmoActionNotes: pmoNotes,
        decidedAt: timeFormatted,
        activityLog: [
          ...req.activityLog,
          {
            id: `act-${Date.now()}`,
            timestamp: timeFormatted,
            author: 'Admin (PMO)',
            avatarTone: 'bg-emerald-100 text-emerald-700',
            action: 'Request Approved by PMO',
            details: pmoNotes ? `Approved with note: "${pmoNotes}"` : 'All requested resource changes have been approved and applied.',
          },
        ],
      }
    }
    return req
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  updateBadgeCount(updated)
  return updated.find((r) => r.id.toLowerCase() === (id || '').toLowerCase())
}

// Reject Request
export function rejectResourceChangeRequest(id, reason = '') {
  const all = getResourceChangeRequests()
  const now = new Date()
  const timeFormatted = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ', ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const updated = all.map((req) => {
    if (req.id.toLowerCase() === (id || '').toLowerCase()) {
      return {
        ...req,
        status: 'Rejected',
        rejectionReason: reason,
        decidedAt: timeFormatted,
        activityLog: [
          ...req.activityLog,
          {
            id: `act-${Date.now()}`,
            timestamp: timeFormatted,
            author: 'Admin (PMO)',
            avatarTone: 'bg-rose-100 text-rose-700',
            action: 'Request Rejected by PMO',
            details: `Rejection reason: "${reason}"`,
          },
        ],
      }
    }
    return req
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  updateBadgeCount(updated)
  return updated.find((r) => r.id.toLowerCase() === (id || '').toLowerCase())
}

// Ask for Clarification
export function clarifyResourceChangeRequest(id, clarificationQuery = '') {
  const all = getResourceChangeRequests()
  const now = new Date()
  const timeFormatted = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ', ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const updated = all.map((req) => {
    if (req.id.toLowerCase() === (id || '').toLowerCase()) {
      return {
        ...req,
        status: 'Clarification Requested',
        clarificationQuery: clarificationQuery,
        activityLog: [
          ...req.activityLog,
          {
            id: `act-${Date.now()}`,
            timestamp: timeFormatted,
            author: 'Admin (PMO)',
            avatarTone: 'bg-blue-100 text-blue-700',
            action: 'Clarification Requested from PM',
            details: `PMO query: "${clarificationQuery}"`,
          },
        ],
      }
    }
    return req
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  updateBadgeCount(updated)
  return updated.find((r) => r.id.toLowerCase() === (id || '').toLowerCase())
}
