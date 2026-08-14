import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import Header from "../../components/Workload/Header";
import Legend from "../../components/Workload/Legend";
import WorkLoadTable from "../../components/Workload/WorkLoadTable";
import Pagination from "../../components/Workload/Pagination";
import { activeProject as dummyActiveProject, resources as dummyResources } from "../../data/workloadDummyData";
import { API_ENDPOINTS } from "../../config/api";

const PAGE_SIZE = 5;

// TODO(backend): GET_WORKLOAD (api.js) is a placeholder — no real endpoint
// exists yet. This fetches it anyway and falls back to workloadDummyData.js
// on any failure (expected right now), so the only change needed once the
// real endpoint ships is the URL in api.js — this component already reads
// from state, not the static import, and expects the same
// { activeProject, resources } shape the dummy data exports.
export default function WorkloadPage() {
    const [view, setView] = useState("monthly");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeProject, setActiveProject] = useState(dummyActiveProject);
    const [resources, setResources] = useState(dummyResources);
    const [isLoading, setIsLoading] = useState(true);
    const [usingFallback, setUsingFallback] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadWorkload() {
            setIsLoading(true);
            try {
                const response = await fetch(API_ENDPOINTS.GET_WORKLOAD, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                });
                const data = await response.json();
                if (!response.ok || !data?.success || !data?.data?.resources) {
                    throw new Error(data?.message || "Workload endpoint not available yet");
                }
                if (cancelled) return;
                setActiveProject(data.data.activeProject || dummyActiveProject);
                setResources(data.data.resources);
                setUsingFallback(false);
            } catch (err) {
                if (cancelled) return;
                console.warn("Workload API not available, using demo data:", err.message);
                setActiveProject(dummyActiveProject);
                setResources(dummyResources);
                setUsingFallback(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadWorkload();
        return () => { cancelled = true; };
    }, []);

    const pagedResources = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return resources.slice(startIndex, startIndex + PAGE_SIZE);
    }, [resources, currentPage]);

    if (isLoading) {
        return (
            <div className="min-h-full bg-slate-50 flex items-center justify-center p-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                <span className="text-sm text-slate-500">Loading workload...</span>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-slate-50 p-5">
            {usingFallback && (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                    Showing demo data — the workload API isn't live yet.
                </div>
            )}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Header project={activeProject} />
                <Legend view={view} onViewChange={setView} />
                <WorkLoadTable resources={pagedResources} view={view} />
                <Pagination
                    page={currentPage}
                    pageSize={PAGE_SIZE}
                    total={resources.length}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
