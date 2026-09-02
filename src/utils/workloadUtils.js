export const MONTHLY_CAPACITY = 176; // 22 working days x 8h
export const DAILY_CAPACITY = 8;

export const MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Shared table column widths — kept here so WorkLoadTable, ResourceRow and
// ProjectRow can't drift out of sync with their own copies.
export const RESOURCE_COLUMN_WIDTH = 240;
export const ROLE_COLUMN_WIDTH = 120;

export function getWorkloadStatus(value, capacity, isException = false) {
    if (value === null || value === undefined) return "non-working";
    if (isException) return "exception";
    const ratio = value / capacity;
    if (ratio > 1.08) return "overallocated";
    if (ratio < 0.85) return "underallocated";
    return "optimal";
}

// Rounds to at most 2 decimals and drops a trailing ".00"/".x0" — real
// allocation-derived hours (e.g. 9h shift x 25% = 2.25h) are exact, but
// summing several of them back-to-back accumulates classic binary
// floating-point drift (2.25 + 1.25 -> 3.4999999999999996 style errors)
// that must never reach the screen.
export function roundHours(value) {
    if (value === null || value === undefined) return value;
    return Math.round(value * 100) / 100;
}

export function formatWorkloadValue(value, capacity, unit = "hours") {
    if (value === null || value === undefined) return "NW";
    if (unit === "percentage") {
        const pct = Math.round((value / capacity) * 100);
        return `${pct}%`;
    }
    return `${roundHours(value)}h`;
}

export const STATUS_STYLES = {
    optimal: "bg-emerald-50 text-emerald-700",
    underallocated: "bg-sky-50 text-sky-700",
    overallocated: "bg-rose-50 text-rose-600",
    exception: "bg-amber-50 text-amber-700",
    "non-working": "bg-slate-50 text-slate-400",
};

export const LEGEND_ITEMS = [
    { key: "optimal", label: "Optimal", dot: "bg-emerald-400" },
    { key: "underallocated", label: "Underallocated", dot: "bg-sky-400" },
    { key: "overallocated", label: "Overallocated", dot: "bg-rose-400" },
    { key: "exception", label: "Exception", dot: "bg-amber-400" },
    { key: "non-working", label: "Non Working", dot: "bg-slate-300" },
];

export function buildDayRange(startISO, endISO) {
    const days = [];
    const current = new Date(startISO);
    const end = new Date(endISO);
    while (current <= end) {
        const isWeekend = current.getDay() === 0 || current.getDay() === 6;
        days.push({
            key: current.toISOString().slice(0, 10),
            date: current.getDate(),
            isWeekend,
            monthLabel: MONTH_LABELS[current.getMonth()],
            isMonthStart: current.getDate() === 1,
        });
        current.setDate(current.getDate() + 1);
    }
    return days;
}

export function sumHours(values) {
    const total = values.reduce((sum, value) => sum + (value || 0), 0);
    return roundHours(total);
}

export function formatDateLong(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function initials(name) {
    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
