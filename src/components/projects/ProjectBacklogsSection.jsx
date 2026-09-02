import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronDown
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

// Small wrapper so native <select> elements get a consistent trailing chevron
// (matches the clean dropdown look in the Figma design instead of the
// browser-default arrow).
const SelectField = ({ children, className = '', ...props }) => (
  <div className="relative">
    <select
      {...props}
      className={`appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-2 text-slate-600 outline-none hover:border-slate-300 focus:border-blue-500 cursor-pointer ${className}`}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
  </div>
);

function ProjectBacklogsSection() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberFilter, setMemberFilter] = useState('All Members');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  // get_pmBacklog can return a raw board-status id (e.g. "9") instead of a
  // name — this maps it back to the real status name via getBoardStatus so
  // the table never shows a bare number to the user.
  const [statusNameById, setStatusNameById] = useState({});

  const getPmId = () => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || user.user_id || null;
      } catch (e) {
        console.error('Error parsing auth_user:', e);
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchBacklogs = async () => {
      try {
        const pmId = getPmId();
        if (!pmId) {
          console.warn("pm_id not found in localStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(API_ENDPOINTS.GET_PM_BACKLOG, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ pm_id: pmId })
        });
        const result = await response.json();

        if (result.success && result.data) {
          setTasks(result.data);
        }
      } catch (error) {
        console.error("Error fetching backlog data:", error);
      } finally {
        setLoading(false);
      }
    };

    queueMicrotask(() => fetchBacklogs());
  }, []);

  useEffect(() => {
    const fetchStatusNames = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.GET_BOARD_STATUS);
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          const map = {};
          data.data.forEach((s) => { map[String(s.id)] = s.status; });
          setStatusNameById(map);
        }
      } catch {
        // Falls back to showing the raw status value below.
      }
    };
    queueMicrotask(() => fetchStatusNames());
  }, []);

  const memberOptions = useMemo(
    () => [...new Set(tasks.map((t) => t.resource_name).filter(Boolean))],
    [tasks]
  );
  const roleOptions = useMemo(
    () => [...new Set(tasks.map((t) => t.resource_role).filter(Boolean))],
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tasks.filter((task) => {
      if (memberFilter !== 'All Members' && task.resource_name !== memberFilter) return false;
      if (roleFilter !== 'All Roles' && task.resource_role !== roleFilter) return false;
      if (term) {
        const haystack = `${task.sub_project_name || ''} ${task.project_name || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [tasks, searchTerm, memberFilter, roleFilter]);

  // Group data by resource (Team Member)
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const key = task.resource_id;
    if (!acc[key]) {
      acc[key] = {
        name: task.resource_name || 'Unknown User',
        role: task.resource_role || 'Unassigned',
        avatarUrl: task.resource_avatar_url || null,
        tasks: []
      };
    }
    acc[key].tasks.push(task);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderPriority = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') {
      return (
        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
          <ArrowUp className="w-3.5 h-3.5 text-red-500" strokeWidth={2.5} /> High
        </span>
      );
    }
    if (p === 'low') {
      return (
        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
          <ArrowDown className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} /> Low
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-slate-700 font-medium">
        <Minus className="w-3.5 h-3.5 text-orange-400" strokeWidth={2.5} /> {priority || 'Medium'}
      </span>
    );
  };

  const renderStatus = (status) => {
    // get_pmBacklog can return a raw board-status id ("9") instead of a
    // name — resolve it via statusNameById before displaying.
    const resolved = /^\d+$/.test(String(status || '')) ? statusNameById[String(status)] || status : status;
    const s = (resolved || '').toLowerCase();
    if (s === 'to do') {
      return <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 capitalize">To Do</span>;
    }
    if (s === 'in progress') {
      return <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 capitalize">In Progress</span>;
    }
    return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 capitalize">{resolved || 'Not Started'}</span>;
  };

  if (loading) {
    return <div className="mt-8 py-20 text-center text-slate-500">Loading tasks...</div>;
  }

  // Show Empty state if no data exists
  if (tasks.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
        <Inbox size={48} className="mb-3 animate-pulse text-slate-300" />
        <h3 className="text-base font-bold text-slate-700">No Backlogs Data</h3>
        <p className="mt-1 max-w-[280px] text-xs text-slate-500">
          This section is currently empty. Data will populate here as the project progresses.
        </p>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
        <Inbox size={48} className="mb-3 text-slate-300" />
        <h3 className="text-base font-bold text-slate-700">No matching tasks</h3>
        <p className="mt-1 max-w-[280px] text-xs text-slate-500">
          Try adjusting the search term or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full font-sans text-slate-800">
      {/* Top Header & Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-900">Team Member Tasks</h2>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <SelectField value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)}>
              <option>All Members</option>
              {memberOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </SelectField>
            <SelectField value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option>All Roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </SelectField>
            <div className="flex w-64 items-center rounded-lg border border-slate-200 bg-white px-3 focus-within:border-blue-500">
              <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search task"
                className="w-full border-none bg-transparent py-2 pl-2 pr-1 text-sm outline-none placeholder:text-slate-400 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Group by</span>
              <SelectField>
                <option>Member</option>
              </SelectField>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">View</span>
              <SelectField>
                <option>List</option>
              </SelectField>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium hover:bg-slate-50">
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Task Groups */}
      <div className="flex flex-col gap-6">
        {Object.values(groupedTasks).map((member, index) => (
          <div key={index} className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:flex-row">

            {/* Left Column: Member Info */}
            <div className="flex w-full min-w-[240px] flex-col items-start border-b border-slate-200 p-6 md:w-auto md:border-b-0 md:border-r">
              <div className="flex items-center gap-3">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="h-11 w-11 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-600 shadow-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-800 capitalize leading-tight">{member.name}</h4>
                  <p className="text-sm text-slate-500 capitalize">{member.role}</p>
                </div>
              </div>
              <span className="mt-4 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {member.tasks.length} Tasks
              </span>
            </div>

            {/* Right Column: Tasks Table */}
            <div className="w-full overflow-x-auto p-4">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-slate-400">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">#</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Task Name</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Project Phase</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Priority</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Due Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {member.tasks.map((task, idx) => (
                    <tr key={idx} className="group border-t border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-4 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700 capitalize">{task.sub_project_name || '-'}</td>
                      <td className="px-4 py-4 text-slate-500 capitalize">{task.project_name || '-'}</td>
                      <td className="px-4 py-4">{renderPriority(task.priority)}</td>
                      <td className="px-4 py-4">{renderStatus(task.status)}</td>
                      <td className="px-4 py-4 text-slate-500">{formatDate(task.planned_end)}</td>
                      <td className="px-4 py-4 text-right">
                        <button className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectBacklogsSection;  