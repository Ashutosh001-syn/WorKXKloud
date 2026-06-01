import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowUp, 
  Minus 
} from 'lucide-react';

function ProjectBacklogsSection() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBacklogs = async () => {
      try {
        // Adjust method to POST if your backend requires it (along with body: JSON.stringify({ pm_id: 4 }))
        const response = await fetch('http://103.185.75.124:8021/api/projectManager/get_pmBacklog?pm_id=4', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
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

    fetchBacklogs();
  }, []);

  // Group data by resource (Team Member)
  const groupedTasks = tasks.reduce((acc, task) => {
    const key = task.resource_id;
    if (!acc[key]) {
      acc[key] = {
        name: task.resource_name || 'Unknown User',
        role: task.resource_role || 'Unassigned',
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
        <span className="flex items-center gap-1.5 text-slate-700">
          <ArrowUp className="w-4 h-4 text-red-500" /> High
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-slate-700">
        <Minus className="w-4 h-4 text-orange-400" /> Medium
      </span>
    );
  };

  const renderStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'to do') {
      return <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600 capitalize">To Do</span>;
    }
    if (s === 'in progress') {
      return <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 capitalize">In Progress</span>;
    }
    return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 capitalize">{status || 'Not Started'}</span>;
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

  return (
    <div className="mt-8 w-full font-sans text-slate-800">
      {/* Top Header & Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-900">Team Member Tasks</h2>
        
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 outline-none hover:border-slate-300 focus:border-blue-500">
              <option>All Members</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 outline-none hover:border-slate-300 focus:border-blue-500">
              <option>All Roles</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search task" 
                className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 outline-none placeholder:text-slate-400 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Group by</span>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none hover:border-slate-300 focus:border-blue-500">
                <option>Member</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">View</span>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none hover:border-slate-300 focus:border-blue-500">
                <option>List</option>
              </select>
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
          <div key={index} className="flex flex-col rounded-xl border border-slate-200 bg-white md:flex-row">
            
            {/* Left Column: Member Info */}
            <div className="flex w-full min-w-[240px] flex-col items-start border-b border-slate-200 p-6 md:w-auto md:border-b-0 md:border-r">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 shadow-sm">
                  {/* Mocking Avatar via Initial */}
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 capitalize">{member.name}</h4>
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
                  <tr className="text-slate-500">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Task Name</th>
                    <th className="px-4 py-3 font-semibold">Project Phase</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Due Date</th>
                    <th className="px-4 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {member.tasks.map((task, idx) => (
                    <tr key={idx} className="group border-t border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-4 text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-4 font-medium text-slate-700 capitalize">{task.sub_project_name}</td>
                      <td className="px-4 py-4 text-slate-500 capitalize">{task.project_name}</td>
                      <td className="px-4 py-4">{renderPriority(task.priority)}</td>
                      <td className="px-4 py-4">{renderStatus(task.status)}</td>
                      <td className="px-4 py-4 text-slate-500">{formatDate(task.planned_end)}</td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal className="h-5 w-5" />
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