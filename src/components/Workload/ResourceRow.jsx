import { Fragment, useState } from "react";
import { ChevronRight } from "lucide-react";

import ProjectRow from "./ProjectRow";
import {
    STATUS_STYLES,
    RESOURCE_COLUMN_WIDTH,
    ROLE_COLUMN_WIDTH,
    getWorkloadStatus,
    initials,
    sumHours,
} from "../../utils/workloadUtils";

export default function ResourceRow({ resource, getPeriodValues, capacity, isException }) {
    const [expanded, setExpanded] = useState(true);

    const projectValues = resource.projects.map((project) => getPeriodValues(project));
    const columnCount = projectValues[0]?.length ?? 0;

    const resourceTotals = Array.from({ length: columnCount }, (_, columnIndex) => {
        const values = projectValues.map((value) => value[columnIndex]);
        const hasValue = values.some((value) => value !== null && value !== undefined);
        return hasValue ? sumHours(values) : null;
    });

    const totalHours = sumHours(resourceTotals);

    return (
        <Fragment>
            <tr className="border-t border-slate-100 bg-slate-50/50 text-sm">
                <td className="sticky left-0 z-20 bg-slate-50 px-3 py-2" style={{ width: RESOURCE_COLUMN_WIDTH }}>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setExpanded((value) => !value)}
                            className="rounded p-0.5 text-slate-400 transition hover:bg-slate-200"
                        >
                            <ChevronRight size={14} className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
                        </button>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${resource.color}`}>
                            {initials(resource.name)}
                        </span>
                        <span className="truncate font-medium text-slate-700">{resource.name}</span>
                    </div>
                </td>

                <td className="sticky z-20 bg-slate-50 px-3 py-2" style={{ left: RESOURCE_COLUMN_WIDTH, width: ROLE_COLUMN_WIDTH }}>
                    <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        {resource.role}
                    </span>
                </td>

                {resourceTotals.map((value, index) => {
                    const status = getWorkloadStatus(value, capacity);
                    return (
                        <td key={index} className="px-2 py-2 text-center">
                            <span className={`inline-flex min-w-8 justify-center rounded px-1.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status]}`}>
                                {value ?? "NW"}
                            </span>
                        </td>
                    );
                })}

                <td className="sticky right-0 z-20 bg-slate-50 px-3 py-2 text-center font-semibold text-slate-700">
                    {totalHours.toLocaleString()}
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
                    />
                ))}
        </Fragment>
    );
}
