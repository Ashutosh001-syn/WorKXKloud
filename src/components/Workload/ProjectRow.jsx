import { Folder } from "lucide-react";
import {
    STATUS_STYLES,
    RESOURCE_COLUMN_WIDTH,
    ROLE_COLUMN_WIDTH,
    getWorkloadStatus,
    sumHours,
} from "../../utils/workloadUtils";

export default function ProjectRow({ project, periodValues, capacity, exceptionAt }) {
    const totalHours = sumHours(periodValues);

    return (
        <tr className="border-t border-slate-100 bg-white text-sm">
            <td className="sticky left-0 z-10 bg-white px-3 py-2" style={{ width: RESOURCE_COLUMN_WIDTH }}>
                <div className="ml-8 flex items-center gap-2">
                    <Folder size={14} className="shrink-0 text-blue-500" />
                    <span className="truncate text-slate-600">{project.name}</span>
                </div>
            </td>

            <td className="sticky z-10 bg-white" style={{ left: RESOURCE_COLUMN_WIDTH, width: ROLE_COLUMN_WIDTH }} />

            {periodValues.map((value, index) => {
                const status = getWorkloadStatus(value, capacity, exceptionAt?.(index));
                return (
                    <td key={index} className="px-2 py-2 text-center">
                        <span className={`inline-flex min-w-8 justify-center rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status]}`}>
                            {value ?? "NW"}
                        </span>
                    </td>
                );
            })}

            <td className="sticky right-0 z-10 bg-white px-3 py-2 text-center font-medium text-slate-700">
                {totalHours.toLocaleString()}
            </td>
        </tr>
    );
}
