import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import Header from "../../components/Workload/Header";
import Legend from "../../components/Workload/Legend";
import WorkLoadTable from "../../components/Workload/WorkLoadTable";
import Pagination from "../../components/Workload/Pagination";
import { activeProject as dummyActiveProject, resources as dummyResources } from "../../data/workloadDummyData";
import { API_ENDPOINTS } from "../../config/api";
import { aggregateWorkload } from "../../utils/workloadCalc";

const PAGE_SIZE = 6;

// Workload has no dedicated backend endpoint (get_workload 404s and is no
// longer being requested — see workload.todo). It's computed client-side
// from resource_list's shift timing + get_projectList's resource_allocations,
// per the confirmed formula: dailyAllocatedHours = shiftHours × allocation%.
export default function WorkloadPage() {
  const [view, setView] = useState("monthly");
  const [unit, setUnit] = useState("hours"); // "hours" | "percentage"
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [activeProject, setActiveProject] = useState(dummyActiveProject);
  const [resources, setResources] = useState(dummyResources);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkload() {
      setIsLoading(true);
      try {
        const [resourceListRes, projectListRes, holidaysRes] = await Promise.all([
          fetch(API_ENDPOINTS.RESOURCE_LIST),
          fetch(API_ENDPOINTS.GET_PROJECT_LIST),
          fetch(API_ENDPOINTS.HOLIDAYS).catch(() => null),
        ]);

        const resourceListData = await resourceListRes.json();
        const projectListData = await projectListRes.json();
        if (!resourceListData?.success || !projectListData?.success) {
          throw new Error("resource_list or get_projectList unavailable");
        }

        let holidayDateSet = new Set();
        if (holidaysRes) {
          try {
            const holidaysData = await holidaysRes.json();
            if (holidaysData?.success) {
              holidayDateSet = new Set(
                (holidaysData.data || [])
                  .map((h) => h.holiday_date && new Date(h.holiday_date).toISOString().slice(0, 10))
                  .filter(Boolean)
              );
            }
          } catch {
            // Holidays are an optional refinement to the monthly calc, not
            // required — a fetch/parse failure here shouldn't block workload.
          }
        }

        const { resources: computedResources } = aggregateWorkload(
          projectListData.data || [],
          resourceListData.data || [],
          { holidayDateSet }
        );

        if (cancelled) return;

        if (computedResources.length === 0) {
          // No allocations anywhere yet — show the real empty state, not
          // demo data pretending to be live.
          setActiveProject(null);
          setResources([]);
          setUsingFallback(false);
          return;
        }

        // "Active project" has no single source of truth once workload is
        // computed per-resource-across-many-projects (see workload.todo
        // section 5) — showing whichever project currently has the most
        // allocated hours this month is a reasonable placeholder pending
        // an actual product decision here.
        const projectHoursTotals = new Map();
        computedResources.forEach((r) => {
          r.projects.forEach((p) => {
            const monthTotal = p.monthly?.[new Date().getMonth()] || 0;
            projectHoursTotals.set(p.id, (projectHoursTotals.get(p.id) || 0) + monthTotal);
          });
        });
        const topProjectId = [...projectHoursTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        const topProjectRaw = (projectListData.data || []).find((p) => String(p.id) === String(topProjectId));

        // No dedicated progress field on a project — approximate it from
        // its milestones (highest percentage reached so far), same data
        // already shown elsewhere (e.g. project detail pages). Falls back
        // to 0 only when a project genuinely has no milestones yet.
        const milestoneProgress = Array.isArray(topProjectRaw?.milestones)
          ? Math.max(0, ...topProjectRaw.milestones.map((m) => Number(m.percentage) || 0))
          : 0;

        setActiveProject(
          topProjectRaw
            ? {
                id: String(topProjectRaw.id),
                name: topProjectRaw.project_name || "Untitled Project",
                priority: topProjectRaw.priority || "Medium",
                methodology: topProjectRaw.methodology || "-",
                startDate: topProjectRaw.start_date || null,
                progress: milestoneProgress,
              }
            : dummyActiveProject
        );
        setResources(computedResources);
        setUsingFallback(false);
      } catch {
        if (cancelled) return;
        setActiveProject(dummyActiveProject);
        setResources(dummyResources);
        setUsingFallback(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadWorkload();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtered resources based on search and role
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesSearch =
        res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.projects?.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === "All" || res.role.toLowerCase().includes(roleFilter.toLowerCase());
      return matchesSearch && matchesRole;
    });
  }, [resources, searchQuery, roleFilter]);

  // Unique roles for dropdown filter
  const allRoles = useMemo(() => {
    const rolesSet = new Set(resources.map((r) => r.role));
    return ["All", ...Array.from(rolesSet)];
  }, [resources]);

  // KPI Metrics Calculation — utilization is measured against each
  // resource's OWN weekly capacity (their real shift hours × working
  // days, from resource_list), not a flat assumed 40h/week — a 9h-shift
  // resource has 45h/week capacity, so judging them against 40h would
  // mislabel a fully-booked week as "overcapacity". avgUtilization is
  // NOT capped at 100 — a team that's genuinely over capacity should show
  // that (e.g. 145%), not a misleadingly clamped "100% Healthy".
  const metrics = useMemo(() => {
    const total = resources.length;
    let totalAssignedHours = 0;
    let totalCapacityHours = 0;
    let overcapacityCount = 0;
    let optimalCount = 0;

    resources.forEach((r) => {
      const weekHours = r.projects?.reduce((acc, p) => {
        const sum = p.weekdayHours?.reduce((s, h) => s + h, 0) || 0;
        return acc + sum;
      }, 0) || 0;
      const capacityHours = r.weeklyCapacityHours || 40;
      const utilizationPct = capacityHours > 0 ? (weekHours / capacityHours) * 100 : 0;

      totalAssignedHours += weekHours;
      totalCapacityHours += capacityHours;
      if (utilizationPct > 100) overcapacityCount++;
      else if (utilizationPct >= 70 && utilizationPct <= 100) optimalCount++;
    });

    const avgUtilization = totalCapacityHours > 0
      ? Math.round((totalAssignedHours / totalCapacityHours) * 100)
      : 0;
    const utilizationStatus =
      avgUtilization > 100 ? "Overloaded" : avgUtilization >= 70 ? "Healthy" : "Underutilized";

    return { total, avgUtilization, overcapacityCount, optimalCount, utilizationStatus };
  }, [resources]);

  const pagedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredResources.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredResources, currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d2646] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md px-6 py-4 text-white shadow-xl">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          <span className="text-sm font-bold">Loading Workload & Capacity Matrix...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d2646] p-4 sm:p-6 lg:p-8">
      {/* Top Back Button */}
      <div className="mb-6">
        <BackButton variant="dark" label="Back to Dashboard" fallbackUrl="/dashboard" />
      </div>

      {/* Main Glassmorphic Container */}
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-[28px] bg-white p-4 sm:p-6 md:p-8 shadow-[0_24px_60px_rgba(3,10,24,0.14)] space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                <h1 className="text-2xl sm:text-[1.8rem] font-bold text-slate-900 tracking-tight leading-tight">
                  Team Workload & Capacity
                </h1>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-500">
                Track bandwidth, resource allocation heatmaps, and avoid project staffing bottlenecks.
              </p>
            </div>

            {usingFallback && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200/90 bg-amber-50/80 px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Demo Preview (Awaiting Backend API)</span>
              </div>
            )}
          </div>

          {/* 4 Stat KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Resources */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50 hover:border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Tracked Team</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/70 text-blue-600">
                  <Users size={16} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{metrics.total}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-400">Active engineers & designers</p>
            </div>

            {/* Average Utilization */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50 hover:border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Utilization</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-600">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className={`text-2xl font-extrabold ${
                  metrics.utilizationStatus === "Overloaded" ? "text-rose-700"
                  : metrics.utilizationStatus === "Underutilized" ? "text-sky-700"
                  : "text-emerald-700"
                }`}>{metrics.avgUtilization}%</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  metrics.utilizationStatus === "Overloaded" ? "text-rose-600 bg-rose-50"
                  : metrics.utilizationStatus === "Underutilized" ? "text-sky-600 bg-sky-50"
                  : "text-emerald-600 bg-emerald-50"
                }`}>{metrics.utilizationStatus}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    metrics.utilizationStatus === "Overloaded" ? "bg-rose-500"
                    : metrics.utilizationStatus === "Underutilized" ? "bg-sky-500"
                    : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, metrics.avgUtilization)}%` }}
                />
              </div>
            </div>

            {/* Optimal Bandwidth */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50 hover:border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Optimal Bandwidth</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100/70 text-indigo-600">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{metrics.optimalCount}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-indigo-600">70% – 100% target utilization</p>
            </div>

            {/* Overcapacity Warning */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:bg-slate-50 hover:border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overcapacity Risk</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/70 text-amber-600">
                  <AlertTriangle size={16} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-amber-600">{metrics.overcapacityCount}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-400">&gt;40 hrs/week workload</p>
            </div>
          </div>

          {/* Controls Bar (Search + Role Filter) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by resource, role or project..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 transition shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
                <Filter size={13} />
                <span>Role:</span>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition shadow-2xs"
              >
                {allRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Workload Table Container */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {resources.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <p className="text-sm font-bold text-slate-700">No resource allocations found yet.</p>
                <p className="max-w-xs text-xs text-slate-500">
                  Workload will populate here once projects have resources allocated with a set shift schedule.
                </p>
              </div>
            ) : (
              <>
                {activeProject && <Header project={activeProject} />}
                <Legend
                  view={view}
                  onViewChange={setView}
                  unit={unit}
                  onUnitChange={setUnit}
                />
                <WorkLoadTable resources={pagedResources} view={view} unit={unit} />
                <Pagination
                  page={currentPage}
                  pageSize={PAGE_SIZE}
                  total={filteredResources.length}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

