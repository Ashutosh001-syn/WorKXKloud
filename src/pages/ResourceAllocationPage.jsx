import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

/* ================= ROLE COLORS (SOFT + PREMIUM) ================= */

const ROLE_TONES = [
  "bg-[#e0ecff] text-[#1e3a8a]",
  "bg-[#fff4e5] text-[#92400e]",
  "bg-[#f3e8ff] text-[#6b21a8]",
  "bg-[#e6f7ec] text-[#166534]",
  "bg-[#ffe4e6] text-[#9f1239]",
  "bg-[#e0f2fe] text-[#075985]",
];

function roleTone(role) {
  if (!role) return ROLE_TONES[0];
  let hash = 0;
  for (let i = 0; i < role.length; i++) hash = (hash * 31 + role.charCodeAt(i)) % ROLE_TONES.length;
  return ROLE_TONES[hash];
}

/* ================= ALLOCATION COLORS ================= */

function allocationMeta(value) {
  if (value >= 100) {
    return {
      bar: "bg-[#16a34a]",
      badge: "Fully Allocated",
      badgeTone: "bg-[#dcfce7] text-[#166534]",
      track: "bg-[#ecfdf5]",
    };
  }

  if (value >= 40) {
    return {
      bar: "bg-[#d97706]",
      badge: "Partially Allocated",
      badgeTone: "bg-[#fef3c7] text-[#92400e]",
      track: "bg-[#fffbeb]",
    };
  }

  return {
    bar: "bg-[#dc2626]",
    badge: "Under Allocated",
    badgeTone: "bg-[#fee2e2] text-[#991b1b]",
    track: "bg-[#fef2f2]",
  };
}

// resource_allocations is a JSON *string* per project (same field GanttChart's
// PMO detail view already parses) — a list of groups like
// { type: "In-house" | "Freelancer" | "Cost", rows: [...] }. "Cost" rows are
// budget line items (name/amount), not people, so they're skipped here.
function flattenAllocations(projects) {
  const rows = [];
  projects.forEach((project) => {
    let groups = [];
    try {
      const parsed = Array.isArray(project.resource_allocations)
        ? project.resource_allocations
        : JSON.parse(project.resource_allocations || "[]");
      groups = Array.isArray(parsed) ? parsed : [];
    } catch {
      groups = [];
    }

    groups.forEach((group) => {
      if (group.type === "Cost") return;
      (group.rows || []).forEach((row, idx) => {
        if (!row.resourceName) return;
        rows.push({
          id: `${project.id}-${group.type}-${idx}`,
          resourceId: row.id ?? row.resource_id ?? row.tl_id ?? "-",
          name: row.resourceName,
          role: row.role || "-",
          allocation: Number(row.allocation) || 0,
          projectName: project.project_name,
          type: group.type,
        });
      });
    });
  });
  return rows;
}

/* ================= MAIN PAGE ================= */

function ResourceAllocationPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_ENDPOINTS.GET_PROJECT_LIST);
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch resource allocations");
      }
      setProjects(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message || "Unable to reach server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { queueMicrotask(() => fetchProjects()); }, []);

  const allocationRows = useMemo(() => flattenAllocations(projects), [projects]);

  return (
    <div className="min-h-screen bg-[#0b1f3a] px-3 py-6">
      <section className="rounded-xl bg-[#f8fafc] px-5 py-6 shadow-[0_20px_50px_rgba(2,12,28,0.2)]">

        {/* HEADER */}
        <h1 className="text-[2rem] font-semibold text-[#0f172a]">
          Resource Allocation
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Staffing plans submitted per project, across the organization.
        </p>

        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
            <Loader2 size={32} className="text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-bold text-[#475569]">Loading allocations...</p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={28} className="text-rose-400 mb-3" />
            <p className="text-sm font-bold text-[#334155]">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {!loading && !error && allocationRows.length === 0 && (
          <div className="mt-16 flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-bold text-[#334155]">No resource allocations found yet.</p>
            <p className="mt-1 text-xs text-[#64748b] max-w-xs">
              Staffing plans will appear here once a project is created with resources assigned.
            </p>
          </div>
        )}

        {/* TABLE */}
        {!loading && !error && allocationRows.length > 0 && (
          <div className="mt-10 overflow-x-auto">
            <div className="min-w-[1040px]">

              {/* TABLE HEADER */}
              <div className="grid h-[48px] grid-cols-[60px_130px_1fr_1fr_1.5fr_1fr_1fr] items-center gap-3 rounded-lg bg-[#f1f5f9] px-4 text-sm font-semibold text-[#334155]">
                <span>Sr.no</span>
                <span>Resource ID</span>
                <span>Name</span>
                <span>Role</span>
                <span>Allocation %</span>
                <span>Status</span>
                <span>Project</span>
              </div>

              {/* TABLE ROWS */}
              {allocationRows.map((row, idx) => {
                const meta = allocationMeta(row.allocation);

                return (
                  <div
                    key={row.id}
                    className="mt-2 grid h-[60px] grid-cols-[60px_130px_1fr_1fr_1.5fr_1fr_1fr] items-center gap-3 rounded-lg border border-[#e2e8f0] bg-white px-4 text-sm text-[#475569] transition hover:bg-[#f8fafc]"
                  >
                    <span>{idx + 1}.</span>
                    <span>{row.resourceId}</span>
                    <span className="font-medium text-[#0f172a] truncate">{row.name}</span>

                    {/* ROLE */}
                    <span>
                      <span className={`inline-flex rounded-md px-3 py-1 text-xs font-medium ${roleTone(row.role)}`}>
                        {row.role}
                      </span>
                    </span>

                    {/* PROGRESS */}
                    <span>
                      <span className="mb-1 block text-xs text-[#64748b]">
                        {row.allocation}%
                      </span>
                      <span className={`block h-[6px] w-full rounded-full ${meta.track}`}>
                        <span
                          className={`block h-[6px] rounded-full ${meta.bar}`}
                          style={{ width: `${Math.min(100, row.allocation)}%` }}
                        />
                      </span>
                    </span>

                    {/* STATUS */}
                    <span>
                      <span className={`inline-flex rounded-md px-3 py-1 text-xs font-medium ${meta.badgeTone}`}>
                        {meta.badge}
                      </span>
                    </span>

                    {/* PROJECT */}
                    <span className="truncate text-xs text-[#64748b]" title={row.projectName}>
                      {row.projectName || "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default ResourceAllocationPage;
