import { LEGEND_ITEMS } from "../../utils/workloadUtils";
import { Clock, Percent } from "lucide-react";

const VIEW_OPTIONS = [
    { label: "Monthly", value: "monthly" },
    { label: "Daily", value: "daily" },
];

const UNIT_OPTIONS = [
    { label: "Hours", value: "hours", icon: Clock },
    { label: "Percentage", value: "percentage", icon: Percent },
];

export default function Legend({ view, onViewChange, unit = "hours", onUnitChange }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-y-3 border-b border-slate-100 px-5 py-3 bg-white">
            {/* Status Legend Pills */}
            <div className="flex flex-wrap items-center gap-3.5">
                {LEGEND_ITEMS.map((item) => (
                    <div key={item.key} className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full shadow-2xs ${item.dot}`} />
                        <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* View Mode & Unit Display Toggles */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Unit Switcher: Hours vs % */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-2xs">
                    {UNIT_OPTIONS.map((opt) => {
                        const active = opt.value === unit;
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onUnitChange?.(opt.value)}
                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
                                    active
                                        ? "bg-white text-blue-600 shadow-xs ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                <Icon size={12} className={active ? "text-blue-600" : "text-slate-400"} />
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* View Switcher: Monthly vs Daily */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-2xs">
                    {VIEW_OPTIONS.map((option) => {
                        const active = option.value === view;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onViewChange(option.value)}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
                                    active
                                        ? "bg-white text-blue-600 shadow-xs ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
