import { LEGEND_ITEMS } from "../../utils/workloadUtils";

const VIEW_OPTIONS = [
    { label: "Monthly", value: "monthly" },
    { label: "Daily", value: "daily" },
];

export default function Legend({ view, onViewChange }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-slate-100 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-3">
                {LEGEND_ITEMS.map((item) => (
                    <div key={item.key} className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                        <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
                {VIEW_OPTIONS.map((option) => {
                    const active = option.value === view;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onViewChange(option.value)}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all duration-200 ${
                                active ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
