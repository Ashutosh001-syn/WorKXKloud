import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ResourceRow from "./ResourceRow";
import {
    MONTH_LABELS,
    MONTHLY_CAPACITY,
    DAILY_CAPACITY,
    RESOURCE_COLUMN_WIDTH,
    ROLE_COLUMN_WIDTH,
    buildDayRange,
    sumHours,
    formatDateLong,
    roundHours,
} from "../../utils/workloadUtils";

const DAILY_WINDOW = 21;

function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate.toISOString().slice(0, 10);
}

// Today's date, not a fixed placeholder — the old hardcoded "2024-05-20"
// only ever matched the dummy dataset and left the daily/monthly views
// stuck showing a stale year once real data replaced it.
function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

export default function WorkLoadTable({ resources, view, unit = "hours" }) {
    const isDailyView = view === "daily";

    const [startDate, setStartDate] = useState(todayISO);

    const endDate = useMemo(
        () => addDays(startDate, DAILY_WINDOW - 1),
        [startDate]
    );

    const days = useMemo(
        () => (isDailyView ? buildDayRange(startDate, endDate) : []),
        [isDailyView, startDate, endDate]
    );

    const capacity = isDailyView
        ? DAILY_CAPACITY
        : MONTHLY_CAPACITY;

    const getPeriodValues = (project) => {
        if (isDailyView) {
            // weekdayHours is [Mon..Fri] — real allocation-derived hours,
            // not demo data, so each weekday just shows that resource's
            // actual daily figure for this project (no fabricated
            // day-to-day jitter).
            return days.map((day) => {
                if (day.isWeekend) return null;
                const dayOfWeek = new Date(day.key).getDay(); // 0=Sun..6=Sat
                return roundHours(project.weekdayHours?.[dayOfWeek - 1] ?? 0);
            });
        }

        return (project.monthly || []).map(roundHours);
    };

    const isException = (project, columnIndex) =>
        isDailyView
            ? false
            : Boolean(project.exceptions?.[columnIndex]);

    const monthGroups = useMemo(() => {
        const groups = [];

        days.forEach((day) => {
            const label = `${day.monthLabel} ${new Date(
                day.key
            ).getFullYear()}`;

            const lastGroup = groups[groups.length - 1];

            if (lastGroup?.label === label) {
                lastGroup.span += 1;
            } else {
                groups.push({
                    label,
                    span: 1,
                });
            }
        });

        return groups;
    }, [days]);

    const visibleColumns = isDailyView
        ? days.length
        : MONTH_LABELS.length;

    const allProjectPeriodValues = resources.flatMap((resource) =>
        resource.projects.map((project) =>
            getPeriodValues(project)
        )
    );

    const grandTotals = Array.from(
        { length: visibleColumns },
        (_, columnIndex) => {
            const values = allProjectPeriodValues
                .map(
                    (periodValues) =>
                        periodValues[columnIndex]
                )
                .filter(
                    (value) =>
                        value !== null &&
                        value !== undefined
                );

            return values.length > 0
                ? sumHours(values)
                : null;
        }
    );

    const grandTotal = sumHours(grandTotals);

    return (
        <div className="px-4 pb-3">
            {/* Mobile sticky fix */}
            <style>
                {`
                    @media (max-width: 639px) {
                        .workload-scroll-container
                            th[class*="sticky"],
                        .workload-scroll-container
                            td[class*="sticky"] {
                            position: static !important;
                            left: auto !important;
                            right: auto !important;
                            top: auto !important;
                            z-index: auto !important;
                            box-shadow: none !important;
                        }

                        .workload-scroll-container
                            table {
                            min-width: max-content !important;
                            width: max-content !important;
                        }

                        .workload-scroll-container
                            th,
                        .workload-scroll-container
                            td {
                            white-space: nowrap;
                        }
                    }
                `}
            </style>

            {/* Daily Navigation */}
            {isDailyView && (
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        {formatDateLong(startDate)} -{" "}
                        {formatDateLong(endDate)}
                    </p>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() =>
                                setStartDate((date) =>
                                    addDays(date, -7)
                                )
                            }
                            className="rounded-md border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-50"
                            aria-label="Previous period"
                        >
                            <ChevronLeft size={15} />
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setStartDate((date) =>
                                    addDays(date, 7)
                                )
                            }
                            className="rounded-md border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-50"
                            aria-label="Next period"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}

            {/* Scroll Container */}
            <div
                className="
                    workload-scroll-container
                    relative
                    max-h-[68vh]
                    w-full
                    overflow-x-auto
                    overflow-y-auto
                    rounded-lg
                    border
                    border-slate-200
                    overscroll-x-contain
                "
            >
                <table className="w-max border-collapse">
                    <thead>
                        {/* Main Header */}
                        <tr className="sticky top-0 z-30 h-9 border-b border-slate-100 bg-white text-xs font-medium text-slate-500">
                            {/* Resource / Project */}
                            <th
                                className="
                                    sticky
                                    left-0
                                    z-40
                                    bg-white
                                    px-4
                                    text-left
                                    shadow-[1px_0_0_0_#e2e8f0]
                                "
                                style={{
                                    width: RESOURCE_COLUMN_WIDTH,
                                    minWidth:
                                        RESOURCE_COLUMN_WIDTH,
                                }}
                            >
                                {isDailyView
                                    ? "Resource / Project / Work Item"
                                    : "Resource / Project"}
                            </th>

                            {/* Workload */}
                            <th
                                className="
                                    sticky
                                    z-40
                                    bg-white
                                    px-3
                                    text-left
                                    shadow-[1px_0_0_0_#e2e8f0]
                                "
                                style={{
                                    left: RESOURCE_COLUMN_WIDTH,
                                    width: ROLE_COLUMN_WIDTH,
                                    minWidth: ROLE_COLUMN_WIDTH,
                                }}
                            >
                                Workload
                            </th>

                            {/* Month Groups / Dates */}
                            {isDailyView ? (
                                monthGroups.map((group) => (
                                    <th
                                        key={group.label}
                                        colSpan={group.span}
                                        className="border-l border-slate-100 bg-white px-2 text-center"
                                    >
                                        {group.label}
                                    </th>
                                ))
                            ) : (
                                <th
                                    colSpan={
                                        MONTH_LABELS.length
                                    }
                                    className="bg-white text-center"
                                >
                                    {new Date().getFullYear()}
                                </th>
                            )}

                            {/* Total */}
                            <th
                                className="
                                    sticky
                                    right-0
                                    z-40
                                    bg-white
                                    px-4
                                    text-center
                                    shadow-[-1px_0_0_0_#e2e8f0]
                                "
                            >
                                Total
                            </th>
                        </tr>

                        {/* Date / Month Header */}
                        <tr className="sticky top-9 z-30 h-8 border-b border-slate-100 bg-white text-xs text-slate-500">
                            {/* Resource */}
                            <th
                                className="
                                    sticky
                                    left-0
                                    z-40
                                    bg-white
                                "
                                style={{
                                    width: RESOURCE_COLUMN_WIDTH,
                                    minWidth:
                                        RESOURCE_COLUMN_WIDTH,
                                }}
                            />

                            {/* Workload */}
                            <th
                                className="
                                    sticky
                                    z-40
                                    bg-white
                                    shadow-[1px_0_0_0_#e2e8f0]
                                "
                                style={{
                                    left: RESOURCE_COLUMN_WIDTH,
                                    width: ROLE_COLUMN_WIDTH,
                                    minWidth: ROLE_COLUMN_WIDTH,
                                }}
                            />

                            {/* Days */}
                            {isDailyView
                                ? days.map((day) => (
                                    <th
                                        key={day.key}
                                        className="
                                              bg-white
                                              px-2
                                              text-center
                                              font-normal
                                          "
                                    >
                                        {day.date}
                                    </th>
                                ))
                                : MONTH_LABELS.map((month) => (
                                    <th
                                        key={month}
                                        className="
                                              bg-white
                                              px-2
                                              text-center
                                              font-normal
                                          "
                                    >
                                        {month}
                                    </th>
                                ))}

                            {/* Total */}
                            <th
                                className="
                                    sticky
                                    right-0
                                    z-40
                                    bg-white
                                    shadow-[-1px_0_0_0_#e2e8f0]
                                "
                            />
                        </tr>
                    </thead>

                    <tbody>
                        {/* Resources */}
                        {resources.map((resource) => (
                            <ResourceRow
                                key={resource.id}
                                resource={resource}
                                getPeriodValues={
                                    getPeriodValues
                                }
                                capacity={capacity}
                                isException={isException}
                                unit={unit}
                            />
                        ))}

                        {/* Grand Total */}
                        <tr className="border-t border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                            {/* Resource */}
                            <td
                                className="
                                    sticky
                                    left-0
                                    z-30
                                    bg-slate-50
                                    px-4
                                    py-2
                                    shadow-[1px_0_0_0_#cbd5e1]
                                "
                                style={{
                                    width: RESOURCE_COLUMN_WIDTH,
                                    minWidth:
                                        RESOURCE_COLUMN_WIDTH,
                                }}
                            >
                                Total
                            </td>

                            {/* Workload */}
                            <td
                                className="
                                    sticky
                                    z-30
                                    bg-slate-50
                                    shadow-[1px_0_0_0_#cbd5e1]
                                "
                                style={{
                                    left: RESOURCE_COLUMN_WIDTH,
                                    width: ROLE_COLUMN_WIDTH,
                                    minWidth: ROLE_COLUMN_WIDTH,
                                }}
                            />

                            {/* Period Totals */}
                            {grandTotals.map(
                                (value, index) => (
                                    <td
                                        key={index}
                                        className="px-2 py-2 text-center"
                                    >
                                        {value === null
                                            ? "–"
                                            : value.toLocaleString()}
                                    </td>
                                )
                            )}

                            {/* Grand Total */}
                            <td
                                className="
                                    sticky
                                    right-0
                                    z-30
                                    bg-slate-50
                                    px-4
                                    py-2
                                    text-center
                                    shadow-[-1px_0_0_0_#cbd5e1]
                                "
                            >
                                {grandTotal.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}