import { Fragment, useState } from "react";
import { ChevronRight } from "lucide-react";

import ProjectRow from "./ProjectRow";
import {
    STATUS_STYLES,
    RESOURCE_COLUMN_WIDTH,
    ROLE_COLUMN_WIDTH,
    getWorkloadStatus,
    formatWorkloadValue,
    initials,
    sumHours,
} from "../../utils/workloadUtils";

export default function ResourceRow({ resource, getPeriodValues, capacity, isException, unit = "hours" }) {
    const [expanded, setExpanded] = useState(true);

    const projectValues = resource.projects.map((project) => getPeriodValues(project));
    const columnCount = projectValues[0]?.length ?? 0;

    const resourceTotals = Array.from({ length: columnCount }, (_, columnIndex) => {
        const values = projectValues.map((value) => value[columnIndex]);
        const hasValue = values.some((value) => value !== null && value !== undefined);
        return hasValue ? sumHours(values) : null;
    });

    const totalHours = sumHours(resourceTotals);
    const activeColumnsCount = resourceTotals.filter((v) => v !== null).length || 1;
    const avgUtilization = Math.round((totalHours / (capacity * activeColumnsCount)) * 100);

    return (
        <Fragment>
            <tr className="border-t border-slate-100 bg-slate-50/70 text-sm hover:bg-slate-100/50 transition">
                <td className="sticky left-0 z-20 bg-slate-50 px-3 py-2.5" style={{ width: RESOURCE_COLUMN_WIDTH }}>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setExpanded((value) => !value)}
                            className="rounded p-0.5 text-slate-400 transition hover:bg-slate-200 cursor-pointer"
                        >
                            <ChevronRight size={14} className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
                        </button>
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-2xs ${resource.color}`}>
                            {initials(resource.name)}
                        </span>
                        <span className="truncate font-bold text-slate-800 text-xs">{resource.name}</span>
                    </div>
                </td>

                <td className="sticky z-20 bg-slate-50 px-3 py-2.5" style={{ left: RESOURCE_COLUMN_WIDTH, width: ROLE_COLUMN_WIDTH }}>
                    <span className="inline-flex rounded-lg bg-blue-50/90 border border-blue-100/60 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {resource.role}
                    </span>
                </td>

                {resourceTotals.map((value, index) => {
                    const status = getWorkloadStatus(value, capacity);
                    return (
                        <td key={index} className="px-2 py-2 text-center">
                            <span className={`inline-flex min-w-9 justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold shadow-2xs transition ${STATUS_STYLES[status]}`}>
                                {formatWorkloadValue(value, capacity, unit)}
                            </span>
                        </td>
                    );
                })}

                <td className="sticky right-0 z-20 bg-slate-50 px-3 py-2.5 text-center text-xs font-bold text-slate-800">
                    {unit === "percentage" ? (
                        <span className="inline-flex items-center gap-1">
                            <span>{avgUtilization}%</span>
                            <span className="text-[10px] text-slate-400 font-normal">({totalHours}h)</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1">
                            <span>{totalHours.toLocaleString()}h</span>
                            <span className="text-[10px] text-slate-400 font-normal">({avgUtilization}%)</span>
                        </span>
                    )}
                </td>
            </tr>

            {expanded &&
                resource.projects.map((project, index) => (
                    <ProjectRow
                        key={project.id}
                        project={project}
                        periodValues={projectValues[index]}
                        capacity={capacity}
                        exceptionAt={(columnIndex) => isException?.(project, columnIndex) ?? false}
                        unit={unit}
                    />
                ))}
        </Fragment>
    );
}
