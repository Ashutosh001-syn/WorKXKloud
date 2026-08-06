import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Search, Filter, MoreHorizontal, Calendar, GripVertical,
  ArrowUp, Minus, CheckCircle2, Plus, Loader2, X, Copy, Trash2,
  ArrowRightLeft, Pencil, Tag, CheckSquare, MessageSquare, Paperclip, Settings2,
  ChevronDown, Check, ListFilter, User
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../hooks/useToast';
import { useBoardExtras } from '../../hooks/useBoardExtras';
import ToastStack from '../ui/ToastStack';
import TaskDetailModal from './board/TaskDetailModel';
import { getMockBoardTasks, mockBoardResources } from '../../data/mockBoardTasks';

const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

let mockBoardIdSeq = 1000;
const nextMockBoardId = () => (mockBoardIdSeq += 1);

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// --- Small presentational helpers ---
const PriorityBadge = ({ level }) => {
  if (level === 'High') {
    return (
      <div className="flex items-center text-red-500 text-xs font-medium gap-1">
        <ArrowUp className="w-3 h-3" /> {level}
      </div>
    );
  }
  return (
    <div className="flex items-center text-orange-400 text-xs font-medium gap-1">
      <Minus className="w-3 h-3" /> {level}
    </div>
  );
};

// --- Initials avatar (no external image dependency — reflects the actual
// assigned resource, unlike a static placeholder photo) ---
const AVATAR_PALETTE = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#db2777', '#4f46e5'];

function avatarColor(name) {
  if (!name) return '#94a3b8';
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function initialsFor(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function AssigneeAvatar({ name, size = 24 }) {
  if (!name) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-slate-300"
        style={{ width: size, height: size }}
        title="Unassigned"
      >
        <User size={Math.round(size * 0.55)} />
      </div>
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42), backgroundColor: avatarColor(name) }}
      title={name}
    >
      {initialsFor(name)}
    </div>
  );
}

// --- Quick-assign popover, opened from the card's avatar. Doesn't open the
// full task modal — just lets you pick a resource in place. ---
function AssigneePicker({ resources, resourcesLoading, currentResourceId, currentResourceName, onRequestResources, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="relative" ref={ref} draggable={false}>
      <button
        type="button"
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
          const next = !open;
          setOpen(next);
          if (next) onRequestResources();
        }}
        title={currentResourceName ? `Assigned to ${currentResourceName}` : 'Assign resource'}
        className="rounded-full transition hover:ring-2 hover:ring-blue-200"
      >
        <AssigneeAvatar name={currentResourceName} />
      </button>

      {open && (
        <div
          className="absolute bottom-8 left-0 z-30 w-44 max-h-56 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-lg py-1.5 text-[13px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => { onSelect(''); setOpen(false); }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 hover:bg-slate-50 ${!currentResourceId ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}
          >
            <AssigneeAvatar name={null} size={18} /> Unassigned
          </button>
          <div className="my-1 border-t border-slate-100" />
          {resourcesLoading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 text-slate-400">
              <Loader2 size={13} className="animate-spin" /> Loading…
            </div>
          ) : resources.length === 0 ? (
            <p className="px-3 py-1.5 text-[12px] text-slate-400">No resources found.</p>
          ) : (
            resources.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { onSelect(r.id); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 hover:bg-slate-50 ${String(currentResourceId) === String(r.id) ? 'text-blue-600 font-semibold' : 'text-slate-600'}`}
              >
                <AssigneeAvatar name={r.name} size={18} />
                <span className="truncate">{r.name}</span>
                {String(currentResourceId) === String(r.id) && <Check size={13} className="ml-auto shrink-0 text-blue-600" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// --- Due-date quick edit: click opens the native date picker directly on
// the card, no full modal needed. ---
function DueDatePicker({ isoDate, displayDate, onChange }) {
  const inputRef = useRef(null);

  const openPicker = (e) => {
    e.stopPropagation();
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker();
        return;
      } catch {
        // unsupported in this context — fall back to focusing below
      }
    }
    el.focus();
  };

  return (
    <div className="relative flex items-center gap-1.5 text-slate-400 text-xs font-medium" draggable={false}>
      <button
        type="button"
        draggable={false}
        onClick={openPicker}
        className="flex items-center gap-1.5 hover:text-blue-600 transition"
        title="Change due date"
      >
        <Calendar className="w-3.5 h-3.5" />
        {displayDate}
      </button>
      <input
        ref={inputRef}
        type="date"
        defaultValue={isoDate || ''}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => { e.stopPropagation(); onChange(e.target.value); }}
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}

function LabelChips({ labels }) {
  if (!labels?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <span
          key={label.name}
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: `${label.color}1f`, color: label.color }}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
}

function CardMenu({ onEdit, onDuplicate, onDelete, columns, currentTitle, onMoveTo }) {
  const [open, setOpen] = useState(false);
  const [showMoveTo, setShowMoveTo] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowMoveTo(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-30 w-40 rounded-xl border border-slate-100 bg-white shadow-lg py-1.5 text-[13px]">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); setOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); setOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
          >
            <Copy size={13} /> Duplicate
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowMoveTo((v) => !v); }}
              className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
            >
              <span className="flex items-center gap-2"><ArrowRightLeft size={13} /> Move to</span>
            </button>
            {showMoveTo && (
              <div className="absolute left-full top-0 ml-1 w-36 rounded-xl border border-slate-100 bg-white shadow-lg py-1.5">
                {columns.filter((c) => c.title !== currentTitle).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onMoveTo(c.title); setOpen(false); setShowMoveTo(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 text-left"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${c.color}`} />
                    {c.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); setOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

const TaskCard = ({
  task, extras, columns, isDragging, isDropTargetAbove,
  resources, resourcesLoading,
  onDragStart, onDragOverCard, onOpen,
  onEdit, onDuplicate, onDelete, onMoveTo,
  onEnsureResources, onAssigneeChange, onDateChange,
}) => (
  <div className="relative">
    {isDropTargetAbove && <div className="absolute -top-1.5 left-0 right-0 h-0.5 rounded-full bg-blue-500" />}
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOverCard}
      onClick={onOpen}
      className={`bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3 hover:shadow-md cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'opacity-40' : ''
        }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col min-w-0">
          {task.projectName && (
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              {task.projectName}
            </span>
          )}
          <h4 className="text-sm font-semibold text-slate-800 leading-snug capitalize truncate">
            {task.title}
          </h4>
        </div>
        <CardMenu
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onMoveTo={onMoveTo}
          columns={columns}
          currentTitle={task.status}
        />
      </div>

      <LabelChips labels={extras.labels} />

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-slate-500 font-medium">#{task.id}</span>
        <PriorityBadge level={task.priority || 'Medium'} />
      </div>

      {(extras.subtasks.length > 0 || extras.comments.length > 0 || extras.attachments.length > 0) && (
        <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
          {extras.subtasks.length > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare size={12} />
              {extras.subtasks.filter((s) => s.done).length}/{extras.subtasks.length}
            </span>
          )}
          {extras.comments.length > 0 && (
            <span className="flex items-center gap-1"><MessageSquare size={12} />{extras.comments.length}</span>
          )}
          {extras.attachments.length > 0 && (
            <span className="flex items-center gap-1"><Paperclip size={12} />{extras.attachments.length}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <AssigneePicker
          resources={resources}
          resourcesLoading={resourcesLoading}
          currentResourceId={task.rawApiData?.resource_id}
          currentResourceName={task.rawApiData?.resource_name}
          onRequestResources={onEnsureResources}
          onSelect={onAssigneeChange}
        />
        {task.isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <DueDatePicker
            isoDate={task.rawApiData?.due_date?.slice(0, 10)}
            displayDate={task.date}
            onChange={onDateChange}
          />
        )}
      </div>
    </div>
  </div>
);


export default function ProjectBoardSection({ projectId, pmId }) {
  const { toasts, showToast, dismissToast } = useToast();
  const {
    columns, labelPalette, getExtras, toggleLabel,
    addSubtask, toggleSubtask, deleteSubtask, addComment,
    addAttachment, deleteAttachment, addColumn, renameColumn,
    deleteColumn, setColumnWipLimit, reorderColumns, removeExtras,
  } = useBoardExtras(projectId);

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // { status, beforeTaskId | null }
  const [draggingColumnIndex, setDraggingColumnIndex] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState(new Set());
  const [selectedAssignees, setSelectedAssignees] = useState(new Set());
  const filterRef = useRef(null);

  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  const [groupByOpen, setGroupByOpen] = useState(false);
  const groupByRef = useRef(null);

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);

  const [activeColumnForAdd, setActiveColumnForAdd] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  // CREATE_BOARD links a board card to an existing schedule task (task_id),
  // it doesn't accept a free-text title — so "Add Task" picks from the
  // project's schedule instead of typing a new name.
  const [scheduleTaskOptions, setScheduleTaskOptions] = useState([]);
  const [scheduleTasksLoading, setScheduleTasksLoading] = useState(false);
  const [scheduleTasksFetched, setScheduleTasksFetched] = useState(false);
  const [selectedScheduleTaskId, setSelectedScheduleTaskId] = useState('');

  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [columnSettingsId, setColumnSettingsId] = useState(null);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesFetched, setResourcesFetched] = useState(false);

  const getResourceId = () => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return { id: user.id || null, role: user.role || user.user_type || null };
      } catch (e) {
        console.error('Error parsing auth_user:', e);
      }
    }
    return { id: null, role: null };
  };

  const getCurrentUserName = () => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try {
        const profile = JSON.parse(saved);
        return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'You';
      } catch {
        return 'You';
      }
    }
    return 'You';
  };

  const getCurrentUserProfile = () => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try {
        const profile = JSON.parse(saved);
        const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        if (name) {
          return {
            name,
            role: profile.role || 'Team Member',
            avatar: profile.image || 'https://i.pravatar.cc/150?img=47',
          };
        }
      } catch {
        // fall through to default below
      }
    }
    return { name: 'Dianne Russell', role: 'UI/UX Designer', avatar: 'https://i.pravatar.cc/150?img=47' };
  };

  // Local cache key for this project's board — see the loadTasks/persistence
  // note below for why this exists.
  const tasksKey = `board_tasks_${projectId || 'default'}`;

  // --- PURE DATA LOADER (no state writes) ---
  // TODO(backend): once GET_BOARDS_BY_RESOURCE (or whatever the real "list
  // boards" endpoint ends up being called) is live, restore the fetch below
  // — the returned shape already matches what the rest of this component
  // expects — AND delete the localStorage cache read here together with its
  // matching write effect further down. Leaving the cache in place after a
  // real endpoint exists would make it silently shadow the server's data
  // forever, which is worse than today's problem.
  const loadTasks = useCallback(async () => {
    try {
      // const { id: resourceId, role } = getResourceId();
      // if (!resourceId) {
      //   console.warn("resource_id not found in localStorage");
      //   return null;
      // }
      //
      // const response = await fetch(API_ENDPOINTS.GET_BOARDS_BY_RESOURCE, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ resource_id: resourceId, type: role, project_id: projectId })
      // });
      // const result = await response.json();
      // if (!result.success || !result.data) return null;
      //
      // return result.data
      //   .filter((item) => !projectId || !item.project_id || String(item.project_id) === String(projectId))
      //   .map((item) => ({
      //     id: `BRD-${item.board_id}`,
      //     boardId: item.board_id,
      //     title: item.sub_project_name,
      //     projectName: item.project_name,
      //     priority: item.priority || 'Medium',
      //     date: item.due_date
      //       ? new Date(item.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      //       : '—',
      //     isCompleted: item.status?.toLowerCase() === 'completed',
      //     status: item.status,
      //     rawApiData: item,
      //   }));

      // Interim persistence: CREATE_BOARD is live, but there's no matching
      // "list boards" endpoint yet, so a page refresh has nothing real to
      // refetch from — every card added via the real API call was getting
      // silently thrown away on reload. Cache the board's current state in
      // localStorage instead (same stopgap pattern useBoardExtras.js already
      // uses for labels/checklist/comments) so created/edited/moved/deleted
      // cards survive a refresh. This is per-browser only, not shared across
      // users/devices — the real fix is the backend list endpoint above.
      const cached = safeParse(localStorage.getItem(tasksKey), null);
      if (cached) return cached;

      return getMockBoardTasks(projectId);
    } catch (error) {
      console.error('ProjectBoardSection: fetch failed, using mock data', error);
      return getMockBoardTasks(projectId);
    }
  }, [projectId, tasksKey]);

  useEffect(() => {
    let isMounted = true;
    loadTasks()
      .then((data) => { if (isMounted && data) setTasks(data); })
      .catch((error) => {
        console.error('Error fetching board data:', error);
        showToast('Failed to load board data from server.', { type: 'error' });
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [loadTasks]);

  // Keep the cache in sync with every board mutation (create/edit/move/
  // delete/duplicate) — not just initial load — so any of them survives a
  // refresh. Skipped while the initial load is still in flight so we don't
  // clobber the cache with the transient empty `tasks` the component starts
  // with. Delete this together with the cache read above once the real list
  // endpoint lands.
  useEffect(() => {
    if (isLoading) return;
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
  }, [tasks, tasksKey, isLoading]);

  // Kept for the TODO(backend) restore path in handleCreateTaskAPI / handleDuplicateTask below.
  const _refetchTasks = useCallback(async () => {
    try {
      const data = await loadTasks();
      if (data) setTasks(data);
    } catch (error) {
      console.error('Error fetching board data:', error);
      showToast('Failed to refresh board data.', { type: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTasks]);

  useEffect(() => {
    if (activeColumnForAdd) inputRef.current?.focus();
  }, [activeColumnForAdd]);

  useEffect(() => {
    function handleOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) setRoleDropdownOpen(false);
      if (groupByRef.current && !groupByRef.current.contains(e.target)) setGroupByOpen(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setMoreMenuOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // TODO(backend): once RESOURCE_LIST is confirmed for this page, restore
  // the fetch below in place of the mock resource list.
  const ensureResourcesLoaded = useCallback(async () => {
    if (resourcesFetched) return;
    setResourcesLoading(true);
    try {
      // const res = await fetch(API_ENDPOINTS.RESOURCE_LIST);
      // const data = await res.json();
      // const list = data?.data || data?.resources || [];
      // setResources(
      //   list.map((r) => ({
      //     id: r.id || r.resource_id,
      //     name: r.name || r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unnamed',
      //   }))
      // );

      setResources(mockBoardResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setResourcesLoading(false);
      setResourcesFetched(true);
    }
  }, [resourcesFetched]);

  // Real endpoint (GanttChart already uses this one successfully) — fetches
  // the project's schedule so "Add Task" can link a board card to one of
  // the actual top-level tasks. Sub-tasks are left out: CREATE_BOARD's
  // task_id and a sub-task's own id share the same numbering, so picking a
  // sub-task here could silently attach the card to the wrong task_id.
  const ensureScheduleTasksLoaded = useCallback(async () => {
    if (scheduleTasksFetched || !projectId || !pmId) return;
    setScheduleTasksLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GET_PROJECT_SCHEDULE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, pm_id: pmId }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Failed to load schedule tasks');
      const options = (result.data || []).map((task) => ({ id: task.id, label: task.task_name }));
      setScheduleTaskOptions(options);
    } catch (error) {
      console.error('Error fetching schedule tasks for board:', error);
    } finally {
      setScheduleTasksLoading(false);
      setScheduleTasksFetched(true);
    }
  }, [scheduleTasksFetched, projectId, pmId]);

  // --- CREATE TASK ---
  // CREATE_BOARD links a card to an existing schedule task (task_id) —
  // there's no "read back the new card" response (just { success, message
  // }), so on success we add a local card built from the picked task's own
  // label/id rather than refetching (GET_BOARDS_BY_RESOURCE isn't
  // confirmed live yet — see loadTasks above).
  const handleCreateTaskAPI = async (columnTitle) => {
    if (!selectedScheduleTaskId) return;
    const pickedTask = scheduleTaskOptions.find((t) => String(t.id) === String(selectedScheduleTaskId));
    if (!pickedTask) return;

    setIsSubmitting(true);
    try {
      const { id: resourceId } = getResourceId();
      const response = await fetch(API_ENDPOINTS.CREATE_BOARD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          task_id: pickedTask.id,
          status: columnTitle.toLowerCase(),
          resource_id: resourceId,
          pm_id: pmId,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to create task');

      const newBoardId = nextMockBoardId();
      const newTask = {
        id: `WR-${newBoardId}`,
        boardId: newBoardId,
        title: pickedTask.label,
        projectName: tasks[0]?.projectName,
        priority: 'Medium',
        date: '—',
        isCompleted: columnTitle === 'Completed',
        status: columnTitle,
        rawApiData: { project_id: projectId, task_id: pickedTask.id, resource_id: resourceId, pm_id: pmId },
      };
      setTasks((current) => [...current, newTask]);
      setSelectedScheduleTaskId('');
      setActiveColumnForAdd(null);
      showToast('Task created.', { type: 'success' });
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Could not create task.', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicateTask = async (task) => {
    try {
      // CREATE_BOARD takes a task_id (not a free-text title), so "duplicate"
      // would create a second card pointing at the same schedule task:
      // const { id: resourceId } = getResourceId();
      // const response = await fetch(API_ENDPOINTS.CREATE_BOARD, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     project_id: projectId,
      //     task_id: task.rawApiData?.task_id,
      //     status: task.status.toLowerCase(),
      //     resource_id: task.rawApiData?.resource_id || resourceId,
      //     pm_id: pmId,
      //   }),
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message || 'Failed to duplicate task');
      // await _refetchTasks();

      const newBoardId = nextMockBoardId();
      const duplicated = {
        ...task,
        id: `WR-${newBoardId}`,
        boardId: newBoardId,
        title: `${task.title} (copy)`,
      };
      setTasks((current) => [...current, duplicated]);
      showToast('Task duplicated.', { type: 'success' });
    } catch (error) {
      console.error('Error duplicating task:', error);
      showToast('Could not duplicate task.', { type: 'error' });
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;

    // TODO(backend): once DELETE_BOARD is live, restore:
    // const response = await fetch(API_ENDPOINTS.DELETE_BOARD, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ board_id: task.boardId }),
    // });
    // const data = await response.json();
    // if (!data.success) throw new Error(data.message || 'Delete failed');

    setTasks((current) => current.filter((t) => t.id !== task.id));
    removeExtras(task.boardId);
    showToast('Task deleted.', { type: 'success' });
  };

  // --- FIELD EDIT (from the detail modal) ---
  // TODO(backend): once UPDATE_BOARD is live, restore the fetch below and
  // revert setTasks(previousTasks) on failure.
  const handleSaveField = async (task, field, value) => {
    setTasks((current) =>
      current.map((t) => {
        if (t.id !== task.id) return t;
        if (field === 'title') return { ...t, title: value };
        if (field === 'priority') return { ...t, priority: value };
        if (field === 'due_date') {
          return {
            ...t,
            rawApiData: { ...t.rawApiData, due_date: value },
            date: value
              ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—',
          };
        }
        if (field === 'resource_id') {
          const resource = resources.find((r) => String(r.id) === String(value));
          return { ...t, rawApiData: { ...t.rawApiData, resource_id: value, resource_name: resource?.name } };
        }
        if (field === 'description') return { ...t, rawApiData: { ...t.rawApiData, description: value } };
        return t;
      })
    );

    // const response = await fetch(API_ENDPOINTS.UPDATE_BOARD, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ board_id: task.boardId, [field]: value }),
    // });
    // const data = await response.json();
    // if (!data.success) throw new Error(data.message || 'Update failed');
  };

  // --- Quick-edit from the card itself (avatar / date icon), same
  // save path as the detail modal's fields, just with a toast for feedback
  // since there's no inline "Saving…" indicator on the card.
  const handleQuickAssigneeChange = async (task, resourceId) => {
    await handleSaveField(task, 'resource_id', resourceId);
    const resource = resources.find((r) => String(r.id) === String(resourceId));
    showToast(resource ? `Assigned to ${resource.name}.` : 'Unassigned.', { type: 'success' });
  };

  const handleQuickDateChange = async (task, value) => {
    await handleSaveField(task, 'due_date', value);
    showToast('Due date updated.', { type: 'success' });
  };

  const isDefaultColumn = (title) =>
    ['to do', 'in progress', 'review', 'completed'].includes(title.toLowerCase());

  // --- STATUS MOVE (drag-and-drop / move-to) ---
  // TODO(backend): once UPDATE_BOARD_STATUS is live, restore the fetch below
  // and revert setTasks(previousTasks) on failure.
  const moveTask = async (taskId, targetStatus, beforeTaskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const targetColumn = columns.find((c) => c.title === targetStatus);
    const currentInTarget = tasks.filter((t) => t.status === targetStatus && t.id !== taskId);
    if (targetColumn?.wipLimit && currentInTarget.length >= targetColumn.wipLimit) {
      showToast(`"${targetColumn.title}" is at its WIP limit (${targetColumn.wipLimit}).`, { type: 'info' });
    }

    setTasks((current) => {
      const withoutTask = current.filter((t) => t.id !== taskId);
      const updatedTask = { ...task, status: targetStatus, isCompleted: targetStatus === 'Completed' };
      if (!beforeTaskId) return [...withoutTask, updatedTask];
      const insertAt = withoutTask.findIndex((t) => t.id === beforeTaskId);
      if (insertAt === -1) return [...withoutTask, updatedTask];
      return [...withoutTask.slice(0, insertAt), updatedTask, ...withoutTask.slice(insertAt)];
    });

    if (!isDefaultColumn(targetStatus)) {
      showToast(`Moved to a custom column — status "${targetStatus}" may not be recognized by the backend yet.`, { type: 'info' });
    }

    // await fetch(API_ENDPOINTS.UPDATE_BOARD_STATUS, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ board_id: task.boardId, status: targetStatus.toLowerCase() }),
    // });
  };

  // --- Drag and drop: tasks ---
  const handleTaskDragStart = (e, taskId) => {
    e.stopPropagation();
    setDraggingTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-task', taskId);
  };

  const handleCardDragOver = (e, columnTitle, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer.types.includes('application/x-task')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isAbove = e.clientY < rect.top + rect.height / 2;
    setDropTarget({ status: columnTitle, beforeTaskId: isAbove ? taskId : null });
  };

  const handleColumnDragOver = (e, columnTitle) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/x-task')) {
      setDropTarget((current) => current?.status === columnTitle ? current : { status: columnTitle, beforeTaskId: null });
    }
  };

  const handleColumnDrop = async (e, columnTitle) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('application/x-task');
    setDraggingTaskId(null);
    const target = dropTarget?.status === columnTitle ? dropTarget : { status: columnTitle, beforeTaskId: null };
    setDropTarget(null);
    if (!taskId) return;
    await moveTask(taskId, columnTitle, target.beforeTaskId);
  };

  // --- Drag and drop: columns (header drag handle) ---
  const handleColumnHeaderDragStart = (e, index) => {
    e.dataTransfer.setData('application/x-column', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingColumnIndex(index);
  };
  const handleColumnHeaderDragEnd = () => setDraggingColumnIndex(null);
  const handleColumnHeaderDrop = (e, index) => {
    e.preventDefault();
    if (!e.dataTransfer.types.includes('application/x-column')) return;
    const fromIndex = Number(e.dataTransfer.getData('application/x-column'));
    if (!Number.isNaN(fromIndex) && fromIndex !== index) reorderColumns(fromIndex, index);
    setDraggingColumnIndex(null);
  };

  // --- Filtering ---
  const availableAssignees = useMemo(() => {
    const set = new Map();
    tasks.forEach((t) => {
      const name = t.rawApiData?.resource_name || 'Unassigned';
      set.set(name, true);
    });
    return Array.from(set.keys());
  }, [tasks]);

  const availableRoles = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      if (t.rawApiData?.resource_role) set.add(t.rawApiData.resource_role);
    });
    return ['All Roles', ...Array.from(set)];
  }, [tasks]);

  const matchesFilters = useCallback((task) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term ||
      task.title?.toLowerCase().includes(term) ||
      task.projectName?.toLowerCase().includes(term) ||
      task.id?.toLowerCase().includes(term);

    const matchesPriority = selectedPriorities.size === 0 || selectedPriorities.has(task.priority);
    const assigneeName = task.rawApiData?.resource_name || 'Unassigned';
    const matchesAssignee = selectedAssignees.size === 0 || selectedAssignees.has(assigneeName);
    const matchesRole = selectedRole === 'All Roles' || task.rawApiData?.resource_role === selectedRole;

    return matchesSearch && matchesPriority && matchesAssignee && matchesRole;
  }, [searchTerm, selectedPriorities, selectedAssignees, selectedRole]);

  const toggleSetValue = (setter) => (value) => {
    setter((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
  };

  const activeFilterCount = selectedPriorities.size + selectedAssignees.size;

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;
  const currentUser = getCurrentUserProfile();

  if (isLoading) {
    return (
      <div className="min-h-100 bg-[#F8F9FB] flex items-center justify-center font-sans text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-blue-600" />
        Loading your workspace...
      </div>
    );
  }

  return (
    <div className="min-h-100 bg-[#F8F9FB] p-8 font-sans">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="mb-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-slate-900">Kanban Board</h1>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Left cluster: current user, role filter, search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 pr-3 border-r border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full border border-slate-200 object-cover"
              />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.role}</p>
              </div>
            </div>

            <div className="relative" ref={roleDropdownRef}>
              <button
                type="button"
                onClick={() => setRoleDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                {selectedRole}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute left-0 top-11 z-30 w-48 rounded-xl border border-slate-100 bg-white shadow-xl p-1.5">
                  {availableRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => { setSelectedRole(role); setRoleDropdownOpen(false); }}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-slate-600 hover:bg-slate-50"
                    >
                      {role}
                      {selectedRole === role && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-w-45 flex-1 items-center rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 sm:flex-none sm:w-64">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="h-auto w-full border-none bg-transparent py-2 pl-2 pr-1 text-sm outline-none placeholder:text-slate-400 focus:ring-0"
              />
            </div>
          </div>

          {/* Right cluster: group by, filters, board menu */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative" ref={groupByRef}>
              <button
                type="button"
                onClick={() => setGroupByOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition"
              >
                <ListFilter className="w-3.5 h-3.5 text-slate-400" />
                Group by <span className="font-semibold text-slate-700">Status</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {groupByOpen && (
                <div className="absolute right-0 top-11 z-30 w-40 rounded-xl border border-slate-100 bg-white shadow-xl p-1.5">
                  <button
                    type="button"
                    onClick={() => setGroupByOpen(false)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-slate-600 hover:bg-slate-50"
                  >
                    Status
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${activeFilterCount > 0
                  ? 'border-blue-300 bg-blue-50 text-blue-600'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <Filter className="w-4 h-4" /> Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-11 z-30 w-56 rounded-xl border border-slate-100 bg-white shadow-xl p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Priority</p>
                  <div className="flex flex-col gap-1 mb-3">
                    {['High', 'Medium', 'Low'].map((p) => (
                      <label key={p} className="flex items-center gap-2 text-[13px] text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedPriorities.has(p)}
                          onChange={() => toggleSetValue(setSelectedPriorities)(p)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Assignee</p>
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                    {availableAssignees.map((name) => (
                      <label key={name} className="flex items-center gap-2 text-[13px] text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedAssignees.has(name)}
                          onChange={() => toggleSetValue(setSelectedAssignees)(name)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                        />
                        {name}
                      </label>
                    ))}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => { setSelectedPriorities(new Set()); setSelectedAssignees(new Set()); }}
                      className="mt-3 text-[12px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((v) => !v)}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 transition"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-slate-100 bg-white shadow-xl py-1.5">
                  <button
                    type="button"
                    onClick={() => { setAddingColumn(true); setMoreMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-slate-600 hover:bg-slate-50"
                  >
                    <Plus size={13} /> Add Column
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column, index) => {
          const columnTasks = tasks
            .filter((t) => t.status?.toLowerCase() === column.title.toLowerCase())
            .filter(matchesFilters);
          const overLimit = column.wipLimit && columnTasks.length > column.wipLimit;

          return (
            <div
              key={column.id}
              className={`shrink-0 w-75 flex flex-col bg-slate-50/50 rounded-2xl p-4 border transition-colors ${dropTarget?.status === column.title ? 'border-blue-300 bg-blue-50/40' : 'border-slate-100/50'
                } ${draggingColumnIndex === index ? 'opacity-50' : ''}`}
              onDragOver={(e) => handleColumnDragOver(e, column.title)}
              onDrop={(e) => { handleColumnDrop(e, column.title); handleColumnHeaderDrop(e, index); }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div
                  className="flex items-center gap-2 flex-1 min-w-0"
                  draggable
                  onDragStart={(e) => handleColumnHeaderDragStart(e, index)}
                  onDragEnd={handleColumnHeaderDragEnd}
                >
                  <GripVertical size={14} className="text-slate-300 cursor-grab shrink-0" />
                  <span className={`w-2 h-2 rounded-full shrink-0 ${column.color}`}></span>
                  {editingColumnId === column.id ? (
                    <input
                      autoFocus
                      defaultValue={column.title}
                      onBlur={(e) => { renameColumn(column.id, e.target.value.trim() || column.title); setEditingColumnId(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                      className="h-auto w-full rounded border border-blue-300 bg-white px-1 text-sm font-semibold text-slate-800 outline-none"
                    />
                  ) : (
                    <h3
                      className="font-semibold text-slate-800 text-sm truncate cursor-text"
                      onDoubleClick={() => setEditingColumnId(column.id)}
                      title="Double-click to rename"
                    >
                      {column.title}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-sm font-semibold ${overLimit ? 'text-rose-500' : 'text-slate-500'}`}>
                    {columnTasks.length}{column.wipLimit ? `/${column.wipLimit}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setColumnSettingsId((v) => v === column.id ? null : column.id)}
                    className="text-slate-300 hover:text-slate-500"
                  >
                    <Settings2 size={14} />
                  </button>
                </div>
              </div>

              {columnSettingsId === column.id && (
                <div className="mb-3 rounded-lg border border-slate-200 bg-white p-2.5 flex flex-col gap-2">
                  <label className="text-[11px] font-semibold text-slate-500">WIP limit</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      defaultValue={column.wipLimit || ''}
                      placeholder="No limit"
                      onBlur={(e) => setColumnWipLimit(column.id, e.target.value ? Number(e.target.value) : null)}
                      className="h-auto w-20 rounded-md border border-slate-200 px-2 py-1 text-[12px] outline-none focus:border-blue-400"
                    />
                    {columnTasks.length === 0 && (
                      <button
                        type="button"
                        onClick={() => { if (window.confirm(`Delete column "${column.title}"?`)) deleteColumn(column.id); }}
                        className="ml-auto flex items-center gap-1 text-[12px] font-semibold text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 size={12} /> Delete column
                      </button>
                    )}
                  </div>
                  {columnTasks.length > 0 && (
                    <p className="text-[11px] text-slate-400">Column must be empty to delete.</p>
                  )}
                </div>
              )}

              {/* Task List */}
              <div className="flex flex-col gap-3 min-h-12.5 mb-3">
                {columnTasks.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl">
                    No tasks yet
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      extras={getExtras(task.boardId)}
                      columns={columns}
                      isDragging={draggingTaskId === task.id}
                      isDropTargetAbove={dropTarget?.status === column.title && dropTarget?.beforeTaskId === task.id}
                      resources={resources}
                      resourcesLoading={resourcesLoading}
                      onDragStart={(e) => handleTaskDragStart(e, task.id)}
                      onDragOverCard={(e) => handleCardDragOver(e, column.title, task.id)}
                      onOpen={() => { setSelectedTaskId(task.id); ensureResourcesLoaded(); }}
                      onEdit={() => { setSelectedTaskId(task.id); ensureResourcesLoaded(); }}
                      onDuplicate={() => handleDuplicateTask(task)}
                      onDelete={() => handleDeleteTask(task)}
                      onMoveTo={(targetTitle) => moveTask(task.id, targetTitle, null)}
                      onEnsureResources={ensureResourcesLoaded}
                      onAssigneeChange={(value) => handleQuickAssigneeChange(task, value)}
                      onDateChange={(value) => handleQuickDateChange(task, value)}
                    />
                  ))
                )}
              </div>

              {/* Add Task — only on the leftmost column (To Do). New work
                  starts there and moves right via drag/"Move to", matching
                  how the board is meant to be used; the other columns just
                  don't get an add-task affordance. */}
              {index === 0 && (
                <div className="mt-auto pt-2">
                  {activeColumnForAdd === column.title ? (
                    <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm flex flex-col gap-2">
                      <select
                        ref={inputRef}
                        value={selectedScheduleTaskId}
                        onChange={(e) => setSelectedScheduleTaskId(e.target.value)}
                        disabled={isSubmitting || scheduleTasksLoading}
                        className="h-auto w-full border-none bg-transparent p-0 text-sm outline-none disabled:text-slate-400"
                      >
                        <option value="" disabled>
                          {scheduleTasksLoading ? 'Loading tasks…' : 'Select a task from Schedule…'}
                        </option>
                        {scheduleTaskOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                      {!scheduleTasksLoading && scheduleTaskOptions.length === 0 && (
                        <p className="text-[11px] text-slate-400">
                          No tasks in this project's Schedule yet — add one there first.
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          onClick={() => { setActiveColumnForAdd(null); setSelectedScheduleTaskId(''); }}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                          disabled={isSubmitting}
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button
                          onClick={() => handleCreateTaskAPI(column.title)}
                          disabled={isSubmitting || !selectedScheduleTaskId}
                          className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Saving...' : 'Add'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setActiveColumnForAdd(column.title); ensureScheduleTasksLoaded(); }}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-200/50 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Task
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Column */}
        <div className="shrink-0 w-65">
          {addingColumn ? (
            <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm flex flex-col gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Column name..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newColumnTitle.trim()) {
                    addColumn(newColumnTitle.trim());
                    setNewColumnTitle('');
                    setAddingColumn(false);
                  }
                  if (e.key === 'Escape') { setAddingColumn(false); setNewColumnTitle(''); }
                }}
                className="w-full text-sm outline-none placeholder:text-slate-400"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => { setAddingColumn(false); setNewColumnTitle(''); }}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newColumnTitle.trim()) return;
                    addColumn(newColumnTitle.trim());
                    setNewColumnTitle('');
                    setAddingColumn(false);
                  }}
                  className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 rounded-2xl border border-dashed border-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Column
            </button>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          key={selectedTask.boardId}
          task={selectedTask}
          resources={resources}
          resourcesLoading={resourcesLoading}
          labelPalette={labelPalette}
          extras={getExtras(selectedTask.boardId)}
          currentUserName={getCurrentUserName()}
          onClose={() => setSelectedTaskId(null)}
          onSaveField={(field, value) => handleSaveField(selectedTask, field, value)}
          onToggleLabel={(label) => toggleLabel(selectedTask.boardId, label)}
          onAddSubtask={(text) => addSubtask(selectedTask.boardId, text)}
          onToggleSubtask={(id) => toggleSubtask(selectedTask.boardId, id)}
          onDeleteSubtask={(id) => deleteSubtask(selectedTask.boardId, id)}
          onAddComment={(text, author) => addComment(selectedTask.boardId, text, author)}
          onAddAttachment={(name, url) => addAttachment(selectedTask.boardId, name, url)}
          onDeleteAttachment={(id) => deleteAttachment(selectedTask.boardId, id)}
          onDelete={() => { handleDeleteTask(selectedTask); setSelectedTaskId(null); }}
          onDuplicate={() => { handleDuplicateTask(selectedTask); setSelectedTaskId(null); }}
        />
      )}
    </div>
  );
}
