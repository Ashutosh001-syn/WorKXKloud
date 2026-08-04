import { MONTH_LABELS } from "../utils/workloadUtils";

/**
 * Temporary mock data — used only until the backend team ships a workload
 * endpoint (no route for it exists yet in src/config/api.js).
 *
 * TODO(backend): once an endpoint is available, WorkloadPage should fetch
 * `{ activeProject, resources }` from it instead of importing the constants
 * below — keep the same shape so WorkLoadTable/ResourceRow/ProjectRow don't
 * need to change:
 *   activeProject: { id, name, priority, methodology, startDate, progress }
 *   resources: [{ id, name, role, color, projects: [{ id, name,
 *     weekdayHours, monthly, exceptions }] }]
 */

const MONTH_MULTIPLIER = [0.9, 0.85, 1.0, 1.15, 1.2, 1.0, 1.05, 1.1, 1.15, 1.05, 1.0, 0.9];

function buildMonthly(weekdayHours, { exceptionMonth = null } = {}) {
    const weekTotal = weekdayHours.reduce((total, hours) => total + hours, 0);
    const monthly = MONTH_LABELS.map((_, monthIndex) =>
        Math.round(((weekTotal * 4.33 * MONTH_MULTIPLIER[monthIndex]) / 5) * 5)
    );
    const exceptions = {};
    if (exceptionMonth !== null) exceptions[exceptionMonth] = true;
    return { monthly, exceptions };
}

// Deterministic per-day variance (not real randomness) so the same date
// always renders the same demo value across re-renders and reloads.
function jitter(dateKey) {
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) hash = (hash * 31 + dateKey.charCodeAt(i)) % 7;
    return (hash % 3) - 1; // -1, 0, or 1
}

export function dailyValueFor(weekdayHours, dateKey, dayOfWeek) {
    if (dayOfWeek === 0 || dayOfWeek === 6) return null;
    const base = weekdayHours[dayOfWeek - 1] ?? 0;
    return Math.max(0, base + jitter(dateKey));
}

export const activeProject = {
    id: "proj-website-redesign",
    name: "Website Redesign",
    priority: "High",
    methodology: "Predictive",
    startDate: "2024-03-27",
    progress: 35,
};

export const resources = [
    {
        id: "res-1",
        name: "Dianne Russell",
        role: "UI/UX Designer",
        color: "bg-fuchsia-100 text-fuchsia-700",
        projects: [
            {
                id: "p-website-redesign",
                name: "Website Redesign",
                weekdayHours: [4, 4, 5, 5, 4],
                ...buildMonthly([4, 4, 5, 5, 4]),
            },
            {
                id: "p-mobile-app",
                name: "Mobile App Development",
                weekdayHours: [2, 2, 3, 3, 2],
                ...buildMonthly([2, 2, 3, 3, 2]),
            },
        ],
    },
    {
        id: "res-2",
        name: "Brooklyn Simmons",
        role: "Frontend Developer",
        color: "bg-blue-100 text-blue-700",
        projects: [
            {
                id: "p-erp-system",
                name: "ERP System",
                weekdayHours: [4, 4, 5, 5, 4],
                ...buildMonthly([4, 4, 5, 5, 4]),
            },
            {
                id: "p-api-integration",
                name: "API Integration",
                weekdayHours: [3, 3, 3, 3, 3],
                ...buildMonthly([3, 3, 3, 3, 3]),
            },
        ],
    },
    {
        id: "res-3",
        name: "Cody Fisher",
        role: "Backend Developer",
        color: "bg-orange-100 text-orange-700",
        projects: [
            {
                id: "p-crm-development",
                name: "CRM Development",
                weekdayHours: [3, 3, 4, 4, 3],
                ...buildMonthly([3, 3, 4, 4, 3]),
            },
            {
                id: "p-database-migration",
                name: "Database Migration",
                weekdayHours: [3, 3, 3, 3, 3],
                ...buildMonthly([3, 3, 3, 3, 3]),
            },
        ],
    },
    {
        id: "res-4",
        name: "Jacob Allen",
        role: "Full Stack Developer",
        color: "bg-violet-100 text-violet-700",
        projects: [
            {
                id: "p-inventory-module",
                name: "Inventory Module",
                weekdayHours: [2, 3, 3, 3, 2],
                ...buildMonthly([2, 3, 3, 3, 2]),
            },
            {
                id: "p-reporting-module",
                name: "Reporting Module",
                weekdayHours: [2, 2, 3, 3, 2],
                // Flag July (index 6) as an exception — e.g. planned leave clash.
                ...buildMonthly([2, 2, 3, 3, 2], { exceptionMonth: 6 }),
            },
        ],
    },
    {
        id: "res-5",
        name: "Marvin Hughes",
        role: "DevOps Engineer",
        color: "bg-rose-100 text-rose-700",
        projects: [
            {
                id: "p-security-compliance",
                name: "Security & Compliance",
                weekdayHours: [8, 9, 9, 9, 8],
                ...buildMonthly([8, 9, 9, 9, 8]),
            },
        ],
    },
];
