import { Calendar } from "lucide-react";

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getPriorityStyle(priority) {
    switch (priority) {
        case "High":
            return "bg-red-50 text-red-600";
        case "Medium":
            return "bg-amber-50 text-amber-600";
        default:
            return "bg-emerald-50 text-emerald-600";
    }
}

export default function Header({ project }) {
    return (
        <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <h2 className="text-lg font-semibold tracking-tight text-slate-800">
                        {project.name}
                    </h2>
                </div>

                <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Priority
                    </p>
                    <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${getPriorityStyle(project.priority)}`}>
                        {project.priority}
                    </span>
                </div>

                <div>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Methodology
                    </p>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                        {project.methodology}
                    </div>
                </div>
            </div>

            <div className="flex min-w-65 items-center gap-4">
                <div className="shrink-0">
                    <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Calendar size={12} />
                        Start
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                        {formatDate(project.startDate)}
                    </div>
                </div>

                <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-400">Progress</span>
                        <span className="text-[11px] font-semibold text-blue-600">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
