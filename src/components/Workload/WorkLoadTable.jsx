import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ResourceRow from "./ResourceRow";
import { dailyValueFor } from "../../data/workloadDummyData";
import {
    MONTH_LABELS,
    MONTHLY_CAPACITY,
    DAILY_CAPACITY,
    RESOURCE_COLUMN_WIDTH,
    ROLE_COLUMN_WIDTH,
    buildDayRange,
    sumHours,
    formatDateLong,
} from "../../utils/workloadUtils";

const DAILY_WINDOW = 21;
// TODO(backend): default to today's date (or the resource's active range)
// once real data is wired up — this fixed date only matches the dummy set.
const DEFAULT_START_DATE = "2024-05-20";

function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate.toISOString().slice(0, 10);
}

export default function WorkLoadTable({ resources, view }) {
    const isDailyView = view === "daily";
    const [startDate, setStartDate] = useState(DEFAULT_START_DATE);

    const endDate = useMemo(() => addDays(startDate, DAILY_WINDOW - 1), [startDate]);
    const days = useMemo(
        () => (isDailyView ? buildDayRange(startDate, endDate) : []),
        [isDailyView, startDate, endDate]
    );
    const capacity = isDailyView ? DAILY_CAPACITY : MONTHLY_CAPACITY;

    const getPeriodValues = (project) => {
        if (isDailyView) {
            return days.map((day) =>
                day.isWeekend ? null : dailyValueFor(project.weekdayHours, day.key, new Date(day.key).getDay())
            );
        }
        return project.monthly;
    };

    const isException = (project, columnIndex) =>
        isDailyView ? false : Boolean(project.exceptions?.[columnIndex]);

    const monthGroups = useMemo(() => {
        const groups = [];
        days.forEach((day) => {
            const label = `${day.monthLabel} ${new Date(day.key).getFullYear()}`;
            const lastGroup = groups[groups.length - 1];
            if (lastGroup?.label === label) {
                lastGroup.span += 1;
            } else {
                groups.push({ label, span: 1 });
            }
        });
        return groups;
    }, [days]);

    const visibleColumns = isDailyView ? days.length : MONTH_LABELS.length;

    const allProjectPeriodValues = resources.flatMap((resource) =>
        resource.projects.map((project) => getPeriodValues(project))
    );

    const grandTotals = Array.from({ length: visibleColumns }, (_, columnIndex) => {
        const values = allProjectPeriodValues
            .map((periodValues) => periodValues[columnIndex])
            .filter((value) => value !== null && value !== undefined);
        return values.length > 0 ? sumHours(values) : null;
    });

    const grandTotal = sumHours(grandTotals);

    return (
        <div className="px-4 pb-3">
            {isDailyView && (
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        {formatDateLong(startDate)} - {formatDateLong(endDate)}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setStartDate((date) => addDays(date, -7))}
                            className="rounded-md border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-50"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setStartDate((date) => addDays(date, 7))}
                            className="rounded-md border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-50"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}

            <div className="relative max-h-[68vh] overflow-auto rounded-lg border border-slate-200">
                <table className="min-w-max border-collapse">
                    <thead>
                        <tr className="sticky top-0 z-30 h-9 border-b border-slate-100 bg-white text-xs font-medium text-slate-500">
                            <th className="sticky left-0 z-30 bg-white px-4 text-left" style={{ width: RESOURCE_COLUMN_WIDTH }}>
                                {isDailyView ? "Resource / Project / Work Item" : "Resource / Project"}
                            </th>
                            <th
                                className="sticky z-30 bg-white px-3 text-left"
                                style={{ left: RESOURCE_COLUMN_WIDTH, width: ROLE_COLUMN_WIDTH }}
                            >
                                Workload
                            </th>
                            {isDailyView ? (
                                monthGroups.map((group) => (
                                    <th key={group.label} colSpan={group.span} className="border-l border-slate-100 bg-white text-center">
                                        {group.label}
                                    </th>
                                ))
                            ) : (
                                <th colSpan={MONTH_LABELS.length} className="bg-white text-center">
                                    {new Date(DEFAULT_START_DATE).getFullYear()}
                                </th>
                            )}
                            <th className="sticky right-0 z-30 bg-white px-4 text-center">Total</th>
                        </tr>

                        <tr className="sticky top-9 z-30 h-8 border-b border-slate-100 bg-white text-xs text-slate-500">
                            <th className="sticky left-0 bg-white" style={{ width: RESOURCE_COLUMN_WIDTH }} />
                            <th className="sticky bg-white" style={{ left: RESOURCE_COLUMN_WIDTH, width: ROLE_COLUMN_WIDTH }} />
                            {isDailyView
                                ? days.map((day) => (
                                    <th key={day.key} className="bg-white px-2 text-center font-normal">
                                        {day.date}
                                    </th>
                                ))
                                : MONTH_LABELS.map((month) => (
                                    <th key={month} className="bg-white px-2 text-center font-normal">
                                        {month}
                                    </th>
                                ))}
                            <th className="sticky right-0 z-30 bg-white" />
                        </tr>
                    </thead>

                    <tbody>
                        {resources.map((resource) => (
                            <ResourceRow
                                key={resource.id}
                                resource={resource}
                                getPeriodValues={getPeriodValues}
                                capacity={capacity}
                                isException={isException}
                            />
                        ))}

                        <tr className="border-t border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                            <td className="sticky left-0 z-20 bg-slate-50 px-4 py-2" style={{ width: RESOURCE_COLUMN_WIDTH }}>
                                Total
                            </td>
                            <td className="sticky z-20 bg-slate-50" style={{ left: RESOURCE_COLUMN_WIDTH, width: ROLE_COLUMN_WIDTH }} />
                            {grandTotals.map((value, index) => (
                                <td key={index} className="px-2 py-2 text-center">
                                    {value === null ? "–" : value.toLocaleString()}
                                </td>
                            ))}
                            <td className="sticky right-0 z-20 bg-slate-50 px-4 py-2 text-center">
                                {grandTotal.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
