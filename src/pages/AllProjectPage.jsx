import { useMemo, useState } from 'react'
import { ChevronDown, Eye, Search } from 'lucide-react'

const baseRows = [
  {
    id: 1,
    projectName: 'Project 1',
    budget: 'Project 1',
    cost: 'Project 1',
    priority: 'Project 1',
    schedule: '10/06/26',
    plannedStartDate: '10/06/26',
    deadline: '10/06/26',
    clientName: 'Jerome Bell',
    pm: 'Ronald Richards',
    status: 'Approved',
  },
  {
    id: 2,
    projectName: 'Project 2',
    budget: 'Project 2',
    cost: 'Project 2',
    priority: 'Project 2',
    schedule: '10/28/26',
    plannedStartDate: '10/28/26',
    deadline: '10/28/26',
    clientName: 'Ralph Edwards',
    pm: 'Esther Howard',
    status: 'Completed',
  },
  {
    id: 3,
    projectName: 'Project 3',
    budget: 'Project 3',
    cost: 'Project 3',
    priority: 'Project 3',
    schedule: '03/04/26',
    plannedStartDate: '03/04/26',
    deadline: '03/04/26',
    clientName: 'Darrell Steward',
    pm: 'Courtney Henry',
    status: 'Pending',
  },
  {
    id: 4,
    projectName: 'Project 4',
    budget: 'Project 4',
    cost: 'Project 4',
    priority: 'Project 4',
    schedule: '08/15/26',
    plannedStartDate: '08/15/26',
    deadline: '08/15/26',
    clientName: 'Floyd Miles',
    pm: 'Ralph Edwards',
    status: 'Completed',
  },
]

const rows = Array.from({ length: 14 }, (_, index) => {
  const row = baseRows[index % baseRows.length]
  return {
    ...row,
    id: index + 1,
  }
})

function getStatusTone(status) {
  if (status === 'Approved') {
    return 'bg-[#d9f7dd] text-[#2bb74a]'
  }

  if (status === 'Pending') {
    return 'bg-[#ffdede] text-[#ea5656]'
  }

  return 'bg-[#ffeebf] text-[#e5a200]'
}

function AllProjectPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Status')

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const text = `${row.projectName} ${row.pm} ${row.clientName}`.toLowerCase()
      const matchesSearch = text.includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'Status' ? true : row.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  return (
    <div className="min-h-screen bg-[#0d2646] px-2 py-4 sm:px-3">
      <section className="rounded-[8px] bg-[#fdfefe] px-3 pb-5 pt-4 shadow-[0_18px_40px_rgba(2,12,28,0.15)] sm:px-4">
        <h1 className="text-[2.2rem] font-semibold tracking-[-0.03em] text-[#191919]">All Project</h1>
        <p className="mt-1   text-[13px] text-[#8ea0b8]">
          Manage and maintain all resource in the organization
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <label className="relative w-full max-w-[360px]">
            <Search
              size={15}
              strokeWidth={2}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a8b4c4]"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by Project Name, PM, Client Name"
              className="h-12 w-full rounded-[6px] border border-[#e0e6ef] bg-white pl-11 pr-4 text-[14px] text-[#5f7188] outline-none placeholder:text-[#b4becc]"
            />
          </label>

          <label className="relative w-full max-w-[170px]">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 w-full appearance-none rounded-[6px] border border-[#e0e6ef] bg-white px-4 pr-9 text-[14px] text-[#8a97aa]"
            >
              <option value="Status">Status</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown
              size={16}
              strokeWidth={1.9}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a6b2c1]"
            />
          </label>
        </div>

        <div className="mt-4 overflow-hidden rounded-[8px] border border-[#e3e9f2] bg-white">
          <div className="max-h-[660px] overflow-auto">
            <table className="w-full min-w-[1220px] border-collapse text-left text-[13px] text-[#68788f]">
              <thead>
                <tr className="bg-[#edf3f8] text-[#39485c]">
                  <th className="w-[54px] px-4 py-3 font-medium">View</th>
                  <th className="px-4 py-3 font-medium">Project name</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Schedule</th>
                  <th className="px-4 py-3 font-medium">Planned start date</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Client Name</th>
                  <th className="px-4 py-3 font-medium">PM</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-[#edf2f7] last:border-b-0">
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#8e99a8] transition hover:bg-[#edf2f7]"
                        aria-label={`View ${row.projectName}`}
                      >
                        <Eye size={13} strokeWidth={2} />
                      </button>
                    </td>
                    <td className="px-4 py-2.5">{row.projectName}</td>
                    <td className="px-4 py-2.5">{row.budget}</td>
                    <td className="px-4 py-2.5">{row.cost}</td>
                    <td className="px-4 py-2.5">{row.priority}</td>
                    <td className="px-4 py-2.5">{row.schedule}</td>
                    <td className="px-4 py-2.5">{row.plannedStartDate}</td>
                    <td className="px-4 py-2.5">{row.deadline}</td>
                    <td className="px-4 py-2.5">{row.clientName}</td>
                    <td className="px-4 py-2.5">{row.pm}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium ${getStatusTone(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AllProjectPage
