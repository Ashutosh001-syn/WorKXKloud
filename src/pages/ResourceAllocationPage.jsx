import { createElement } from "react";
import { Eye, PencilLine, Trash2 } from "lucide-react";

const allocationRows = [
  { id: 1, resourceId: "1234576", name: "Rahul", role: "Project Manager", allocation: 100 },
  { id: 2, resourceId: "1234576", name: "Rahul", role: "Tech Lead", allocation: 40 },
  { id: 3, resourceId: "1234576", name: "Rahul", role: "Tester", allocation: 12 },
  { id: 4, resourceId: "1234576", name: "Rahul", role: "Management", allocation: 100 },
  { id: 5, resourceId: "1234576", name: "Rahul", role: "Architect", allocation: 40 },
  { id: 6, resourceId: "1234576", name: "Rahul", role: "Account Manager", allocation: 12 },
  { id: 7, resourceId: "1234576", name: "Rahul", role: "Project Manager", allocation: 100 },
  { id: 8, resourceId: "1234576", name: "Rahul", role: "Architect", allocation: 40 },
];

/* ================= ROLE COLORS (SOFT + PREMIUM) ================= */

const roleTone = {
  "Project Manager": "bg-[#e0ecff] text-[#1e3a8a]",
  "Tech Lead": "bg-[#fff4e5] text-[#92400e]",
  Tester: "bg-[#f3e8ff] text-[#6b21a8]",
  Management: "bg-[#e6f7ec] text-[#166534]",
  Architect: "bg-[#ffe4e6] text-[#9f1239]",
  "Account Manager": "bg-[#e0f2fe] text-[#075985]",
};

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

/* ================= ACTION BUTTON ================= */

function RowAction({ icon, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b] transition hover:bg-[#e2e8f0] hover:text-[#0f172a]"
    >
      {createElement(icon, { size: 14, strokeWidth: 2 })}
    </button>
  );
}

/* ================= MAIN PAGE ================= */

function ResourceAllocationPage() {
  return (
    <div className="min-h-screen bg-[#0b1f3a] px-3 py-6">
      <section className="rounded-xl bg-[#f8fafc] px-5 py-6 shadow-[0_20px_50px_rgba(2,12,28,0.2)]">
        
        {/* HEADER */}
        <h1 className="text-[2rem] font-semibold text-[#0f172a]">
          Resource Allocation
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Manage and maintain all resources in the organization
        </p>

        {/* TABLE */}
        <div className="mt-10 overflow-x-auto">
          <div className="min-w-[1040px]">
            
            {/* TABLE HEADER */}
            <div className="grid h-[48px] grid-cols-[60px_130px_100px_1fr_1.5fr_1fr_120px] items-center gap-3 rounded-lg bg-[#f1f5f9] px-4 text-sm font-semibold text-[#334155]">
              <span>Sr.no</span>
              <span>Resource ID</span>
              <span>Name</span>
              <span>Role</span>
              <span>Allocation %</span>
              <span>Status</span>
              <span className="text-center">Action</span>
            </div>

            {/* TABLE ROWS */}
            {allocationRows.map((row) => {
              const meta = allocationMeta(row.allocation);

              return (
                <div
                  key={row.id}
                  className="mt-2 grid h-[60px] grid-cols-[60px_130px_100px_1fr_1.5fr_1fr_120px] items-center gap-3 rounded-lg border border-[#e2e8f0] bg-white px-4 text-sm text-[#475569] transition hover:bg-[#f8fafc]"
                >
                  <span>{row.id}.</span>
                  <span>{row.resourceId}</span>
                  <span className="font-medium text-[#0f172a]">{row.name}</span>

                  {/* ROLE */}
                  <span>
                    <span className={`inline-flex rounded-md px-3 py-1 text-xs font-medium ${roleTone[row.role]}`}>
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
                        style={{ width: `${row.allocation}%` }}
                      />
                    </span>
                  </span>

                  {/* STATUS */}
                  <span>
                    <span className={`inline-flex rounded-md px-3 py-1 text-xs font-medium ${meta.badgeTone}`}>
                      {meta.badge}
                    </span>
                  </span>

                  {/* ACTIONS */}
                  <div className="flex items-center justify-center gap-2">
                    <RowAction icon={Eye} label="View allocation" />
                    <RowAction icon={PencilLine} label="Edit allocation" />
                    <RowAction icon={Trash2} label="Delete allocation" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResourceAllocationPage;