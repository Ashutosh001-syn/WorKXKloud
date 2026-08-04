import { useMemo, useState } from "react";
import Header from "../../components/Workload/Header";
import Legend from "../../components/Workload/Legend";
import WorkLoadTable from "../../components/Workload/WorkLoadTable";
import Pagination from "../../components/Workload/Pagination";
import { activeProject, resources } from "../../data/workloadDummyData";

const PAGE_SIZE = 5;

// TODO(backend): activeProject/resources are still mock data (see
// src/data/workloadDummyData.js — no workload endpoint exists yet). Once
// one ships, load both here behind isLoading/error state the same way
// ProjectBoardSection.jsx does for board tasks, and keep pagedResources
// client-side unless the API paginates server-side.
export default function WorkloadPage() {
    const [view, setView] = useState("monthly");
    const [currentPage, setCurrentPage] = useState(1);

    const pagedResources = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return resources.slice(startIndex, startIndex + PAGE_SIZE);
    }, [currentPage]);

    return (
        <div className="min-h-full bg-slate-50 p-5">
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
