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

const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };
const PRIORITY_GROUPS = [
  { id: 'High', title: 'High', color: 'bg-red-500', wipLimit: null },
  { id: 'Medium', title: 'Medium', color: 'bg-orange-400', wipLimit: null },
  { id: 'Low', title: 'Low', color: 'bg-slate-400', wipLimit: null },
];


function boardItemToTask(item, statusKey, scheduleMap, resourceMap) {
  return {
    id: `WR-${item.id}`,
    boardId: item.id,
    // editBoard's title/priority/due_date are now confirmed to persist and
    // come back through getBoard — prefer them, and only fall back to the
    // schedule task's own name/defaults for older records that predate this
    // (title/priority/due_date still null on those).
    title: item.title || scheduleMap.get(String(item.task_id)) || `Task #${item.task_id}`,
    projectName: undefined,
    priority: item.priority || 'Medium',
    date: item.due_date
      ? new Date(item.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—',
    isCompleted: statusKey === 'completed',
    statusKey,
    customColumnId: null,
    rawApiData: {
      ...item,
      resource_name: resourceMap.get(String(item.resource_id)),
    },
  };
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

function safeParseJsonArray(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Backend `labels` field is a comma-separated string of names; map each
// name to its palette entry for color, falling back to a neutral tone for
// names that don't match any palette entry.
function parseTaskLabels(rawLabels, labelPalette) {
  if (!rawLabels) return [];
  return rawLabels
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => labelPalette.find((l) => l.name === name) || { name, color: '#64748b' });
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

function CardMenu({ onEdit, onDuplicate, onDelete, columns, currentStatusKey, currentCustomColumnId, onMoveTo }) {
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
          {/* <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); setOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
          >
            <Copy size={13} /> Duplicate
          </button> */}

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
                {columns
                  .filter((c) => (c.statusKey ? c.statusKey !== currentStatusKey : c.id !== currentCustomColumnId))
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onMoveTo(c); setOpen(false); setShowMoveTo(false); }}
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
  task, columns, labelPalette, isDragging, isDropTargetAbove,
  resources, resourcesLoading,
  onDragStart, onDragOverCard, onOpen,
  onEdit, onDuplicate, onDelete, onMoveTo,
  onEnsureResources, onAssigneeChange, onDateChange,
}) => {
  const cardSubtasks = safeParseJsonArray(task.rawApiData?.checklist);
  const cardComments = safeParseJsonArray(task.rawApiData?.comments);
  return (
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
          currentStatusKey={task.statusKey}
          currentCustomColumnId={task.customColumnId}
        />
      </div>

      <LabelChips labels={parseTaskLabels(task.rawApiData?.labels, labelPalette)} />

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-slate-500 font-medium">#{task.id}</span>
        <PriorityBadge level={task.priority || 'Medium'} />
      </div>

      {(cardSubtasks.length > 0 || cardComments.length > 0 || task.rawApiData?.attachments) && (
        <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
          {cardSubtasks.length > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare size={12} />
              {cardSubtasks.filter((s) => s.done).length}/{cardSubtasks.length}
            </span>
          )}
          {cardComments.length > 0 && (
            <span className="flex items-center gap-1"><MessageSquare size={12} />{cardComments.length}</span>
          )}
          {task.rawApiData?.attachments && (
            <span className="flex items-center gap-1"><Paperclip size={12} />1</span>
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
};

export default function ProjectBoardSection({ projectId, pmId, projectName }) {
  const { toasts, showToast, dismissToast } = useToast();
  const {
    columns, labelPalette,
    addColumn, renameColumn,
    deleteColumn, setColumnWipLimit, reorderColumns, removeExtras,
  } = useBoardExtras(projectId);

  const [tasks, setTasks] = useState([]);
  const [uploadingAttachmentId, setUploadingAttachmentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // { columnId, beforeTaskId | null }
  const [draggingColumnIndex, setDraggingColumnIndex] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState(new Set());
  const [selectedAssignees, setSelectedAssignees] = useState(new Set());
  const filterRef = useRef(null);

  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  // TODO(backend): switching boards between PMs needs a way to map a PM's
  // name to the pm_id get_projectsByPm/getBoard actually expect — neither
  // USER_LIST nor RESOURCE_LIST's `id` matches that space (verified: real
  // pm_ids 1-4 return inconsistent project_manager names, and USER_LIST's
  // "Project manager"-role ids return 0 projects). So this only lists PM
  // resources for now; picking one is a no-op until that mapping exists.
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  const [groupBy, setGroupBy] = useState('Status'); // 'Status' | 'Assignee' | 'Priority'
  const [groupByOpen, setGroupByOpen] = useState(false);
  const groupByRef = useRef(null);
  // Only used when groupBy !== 'Status' — those groups don't support the
  // "insert before this card" tracking that dropTarget gives Status mode,
  // just a simple "you're hovering this group" highlight.
  const [hoveredGroupId, setHoveredGroupId] = useState(null);

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
            // avatar: profile.image || 'https://i.pravatar.cc/150?img=47',
          };
        }
      } catch {
        // fall through to default below
      }
    }
    return { name: 'Dianne Russell', role: 'UI/UX Designer', avatar: 'https://i.pravatar.cc/150?img=47' };
  };

  // --- BOARD LOADER ---
  // GET_BOARD is live (projectManager/getBoard) and groups cards by status:
  // in_discussion, to_do, in_work, in_progress, completed. Each row only
  // carries ids (task_id, resource_id) — no title, no resource name, no
  // priority, no due date — so it's enriched here against the project's
  // Schedule (task_id -> task_name) and the resource list (resource_id ->
  // name/role), fetched in parallel. Schedule/resource lookups degrade
  // gracefully (cards still render, just with fallback labels) — only
  // GET_BOARD itself failing is treated as a hard error, since that's the
  // one piece with no reasonable fallback.
  const refetchBoard = useCallback(async () => {
    if (!projectId || !pmId) {
      setTasks([]);
      setLoadError(null);
      return;
    }
    setLoadError(null);
    try {
      // Checked for response.ok before parsing (rather than jumping straight
      // to .json()) so a route that isn't deployed on this server yet shows
      // up as a clear "server error" instead of a raw JSON-parse failure —
      // a 404 page is HTML, and .json() on HTML throws a confusing
      // "Unexpected token '<'" error.
      const parseJsonResponse = async (response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} — this endpoint may not be deployed here yet.`);
        }
        return response.json();
      };

      const [boardResult, scheduleResult, resourceResult] = await Promise.allSettled([
        fetch(API_ENDPOINTS.GET_BOARD, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pm_id: pmId, project_id: projectId }),
        }).then(parseJsonResponse),
        fetch(API_ENDPOINTS.GET_PROJECT_SCHEDULE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, pm_id: pmId }),
        }).then(parseJsonResponse),
        fetch(API_ENDPOINTS.RESOURCE_LIST).then(parseJsonResponse),
      ]);

      const boardData = boardResult.status === 'fulfilled' ? boardResult.value : null;
      if (!boardData?.success || !boardData.data) {
        throw new Error(
          boardData?.message ||
          (boardResult.status === 'rejected' ? boardResult.reason?.message : null) ||
          'Could not reach the board server.'
        );
      }

      const scheduleTasks = (scheduleResult.status === 'fulfilled' && scheduleResult.value?.success)
        ? (scheduleResult.value.data || [])
        : [];
      const scheduleMap = new Map(scheduleTasks.map((t) => [String(t.id), t.task_name]));

      const resourceRows = (resourceResult.status === 'fulfilled' && resourceResult.value?.success)
        ? (resourceResult.value.data || [])
        : [];
      const resourceMap = new Map(resourceRows.map((r) => [String(r.id), r.name]));

      const flattened = [];
      Object.entries(boardData.data).forEach(([statusKey, items]) => {
        (items || []).forEach((item) => {
          const task = boardItemToTask(item, statusKey, scheduleMap, resourceMap);
          task.projectName = projectName;
          flattened.push(task);
        });
      });
      setTasks(flattened);

      // The board load already pulls the full resource list — reuse it for
      // the assignee picker/grouping instead of firing a second identical
      // request the first time someone opens it.
      if (resourceRows.length > 0) {
        setResources(resourceRows.map((r) => ({ id: r.id, name: r.name, role: r.role })));
        setResourcesFetched(true);
      }
    } catch (error) {
      console.error('Error fetching board data:', error);
      setLoadError(error.message || 'Failed to load board data.');
      setTasks([]);
    }
  }, [projectId, pmId, projectName]);

  useEffect(() => {
    let isMounted = true;
    async function run() {
      try {
        await refetchBoard();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    run();
    return () => { isMounted = false; };
  }, [refetchBoard]);

  useEffect(() => {
    if (activeColumnForAdd) inputRef.current?.focus();
  }, [activeColumnForAdd]);

  useEffect(() => {
    function handleOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) setRoleDropdownOpen(false);
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setUserDropdownOpen(false);
      if (groupByRef.current && !groupByRef.current.contains(e.target)) setGroupByOpen(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setMoreMenuOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // RESOURCE_LIST is confirmed live (already used by Resource Master and the
  // create-project wizard). Usually already populated by refetchBoard above
  // by the time this is called — this only hits the network if that hasn't
  // happened yet (e.g. the board itself failed to load but someone still
  // opens the assignee picker).
  const ensureResourcesLoaded = useCallback(async () => {
    if (resourcesFetched) return;
    setResourcesLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.RESOURCE_LIST);
      const data = await res.json();
      if (data.success) {
        setResources((data.data || []).map((r) => ({ id: r.id, name: r.name, role: r.role })));
      }
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

  // Assignee grouping needs the full resource list (to build one group per
  // resource, including people with zero cards) — not just the names that
  // happen to show up on already-loaded tasks. Deferred a tick so the
  // resulting setState doesn't fire synchronously inside this effect.
  useEffect(() => {
    if (groupBy !== 'Assignee') return;
    queueMicrotask(() => ensureResourcesLoaded());
  }, [groupBy, ensureResourcesLoaded]);

  // --- CREATE TASK ---
  // CREATE_BOARD is live and confirmed: { project_id, task_id, status,
  // resource_id, pm_id } -> { success, message } (no card payload back), so
  // on success we just re-pull the board via GET_BOARD rather than guessing
  // at the new row's id.
  const handleCreateTaskAPI = async (column) => {
    if (!selectedScheduleTaskId || !column.statusKey) return;
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
          status: column.statusKey,
          resource_id: resourceId,
          pm_id: pmId,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to create task');

      await refetchBoard();
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

  // GET_BOARD's sample data shows several rows sharing the same task_id
  // (e.g. task_id 2 appears six times under to_do with different resource
  // ids/created_at) — so a second CREATE_BOARD call against the same
  // task_id is normal here, not a data-integrity problem. Duplicate goes
  // through the real API and refetches, same as create.
  const handleDuplicateTask = async (task) => {
    if (!task.statusKey) {
      showToast('Cards in a custom column can\'t be duplicated yet — the backend has no status for it.', { type: 'info' });
      return;
    }
    try {
      const { id: resourceId } = getResourceId();
      const response = await fetch(API_ENDPOINTS.CREATE_BOARD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: task.rawApiData?.project_id || projectId,
          task_id: task.rawApiData?.task_id,
          status: task.statusKey,
          resource_id: task.rawApiData?.resource_id || resourceId,
          pm_id: pmId,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to duplicate task');

      await refetchBoard();
      showToast('Task duplicated.', { type: 'success' });
    } catch (error) {
      console.error('Error duplicating task:', error);
      showToast('Could not duplicate task.', { type: 'error' });
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;

    const previousTasks = tasks;
    setTasks((current) => current.filter((t) => t.id !== task.id));

    try {
      const response = await fetch(API_ENDPOINTS.DELETE_BOARD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.boardId }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Delete failed');

      removeExtras(task.boardId);
      showToast('Task deleted.', { type: 'success' });
    } catch (err) {
      console.error('Failed to delete task:', err);
      setTasks(previousTasks);
      showToast(err.message || 'Could not delete the task. Please try again.', { type: 'error' });
    }
  };

  // --- Persist a board record edit ---
  // editBoard is a full-record update: it always expects id, project_id,
  // task_id, resource_id, status, pm_id together — sending only the
  // changed field(s) nulls out the rest server-side (confirmed by testing),
  // so this always sends task.rawApiData merged with the override(s).
  // attachmentFile is only passed when the user is uploading a new file —
  // the backend field is a single-file multer upload (confirmed via curl:
  // field name "attachments", one URL stored, not a list), so this switches
  // to multipart/form-data only for that call instead of every save.
  const saveBoardRecord = async (task, overrides, attachmentFile) => {
    const fields = {
      id: task.boardId,
      project_id: task.rawApiData?.project_id,
      task_id: task.rawApiData?.task_id,
      resource_id: task.rawApiData?.resource_id,
      status: task.rawApiData?.status,
      pm_id: task.rawApiData?.pm_id,
      title: task.rawApiData?.title,
      priority: task.rawApiData?.priority,
      assignee_id: task.rawApiData?.assignee_id,
      due_date: task.rawApiData?.due_date,
      description: task.rawApiData?.description,
      labels: task.rawApiData?.labels,
      checklist: task.rawApiData?.checklist,
      comments: task.rawApiData?.comments,
      ...overrides,
    };

    let response;
    if (attachmentFile) {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (key === 'attachments') return;
        formData.append(key, value ?? '');
      });
      formData.append('attachments', attachmentFile);
      response = await fetch(API_ENDPOINTS.UPDATE_BOARD, { method: 'POST', body: formData });
    } else {
      response = await fetch(API_ENDPOINTS.UPDATE_BOARD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
    }

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Update failed');
    return data;
  };

  // --- FIELD EDIT (from the detail modal) ---
  // resource_id, title, priority, due_date, description are all confirmed
  // round-tripping through editBoard -> getBoard now.
  const FIELD_TO_OVERRIDE_KEY = {
    resource_id: 'resource_id',
    title: 'title',
    priority: 'priority',
    due_date: 'due_date',
    description: 'description',
    labels: 'labels',
    checklist: 'checklist',
    comments: 'comments',
    attachments: 'attachments',
  }

  // editBoard is a full-record write every time, so editing several fields
  // in quick succession (e.g. Priority, Assignee, Due Date one after
  // another in the detail modal) shouldn't fire one network call per field —
  // debounce and merge them into a single call. previousTasks is snapshotted
  // once per batch (not per field) so a failure rolls back everything the
  // batch touched, not just the last field.
  const pendingSaveRef = useRef({});

  useEffect(() => {
    const pendingSaves = pendingSaveRef.current;
    return () => {
      Object.values(pendingSaves).forEach((pending) => clearTimeout(pending.timer));
    };
  }, []);

  const flushSave = async (taskId) => {
    const pending = pendingSaveRef.current[taskId];
    if (!pending) return;
    delete pendingSaveRef.current[taskId];

    try {
      await saveBoardRecord(pending.task, pending.overrides);
    } catch (err) {
      console.error('Failed to save task fields:', err);
      setTasks(pending.previousTasks);
      showToast(err.message || 'Could not save the change. Please try again.', { type: 'error' });
    }
  };

  const queueFieldSave = (task, overrideKey, value) => {
    const existing = pendingSaveRef.current[task.id];
    if (existing) clearTimeout(existing.timer);

    const previousTasks = existing ? existing.previousTasks : tasks;
    const overrides = { ...(existing?.overrides || {}), [overrideKey]: value };
    const timer = setTimeout(() => flushSave(task.id), 600);

    pendingSaveRef.current[task.id] = { task, overrides, timer, previousTasks };
  };

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
        if (field === 'labels') return { ...t, rawApiData: { ...t.rawApiData, labels: value } };
        if (field === 'checklist') return { ...t, rawApiData: { ...t.rawApiData, checklist: value } };
        if (field === 'comments') return { ...t, rawApiData: { ...t.rawApiData, comments: value } };
        if (field === 'attachments') return { ...t, rawApiData: { ...t.rawApiData, attachments: value } };
        return t;
      })
    );

    const overrideKey = FIELD_TO_OVERRIDE_KEY[field]
    if (!overrideKey) return

    queueFieldSave(task, overrideKey, value || null);
  };

  // Attachments are a single-file multer upload on the backend (confirmed:
  // one URL stored per task, not a list) — upload immediately on file
  // select/remove rather than batching through the debounced field queue,
  // since a file needs multipart/form-data and its own request.
  const handleUploadAttachment = async (task, file) => {
    setUploadingAttachmentId(task.id);
    try {
      const data = await saveBoardRecord(task, {}, file);
      setTasks((current) =>
        current.map((t) =>
          t.id === task.id
            ? { ...t, rawApiData: { ...t.rawApiData, attachments: data.attachment } }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to upload attachment:', err);
      showToast(err.message || 'Could not upload the file. Please try again.', { type: 'error' });
    } finally {
      setUploadingAttachmentId(null);
    }
  };

  const handleRemoveAttachment = (task) => {
    handleSaveField(task, 'attachments', null);
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

  // --- STATUS MOVE (drag-and-drop / move-to) ---
  // Takes the target column object (not a title string) so this keeps
  // working correctly even if a column has been renamed. Default columns
  // move the card's real statusKey; a custom column has none, so the card
  // just tracks it locally via customColumnId until the backend supports
  // arbitrary statuses.
  const moveTask = async (taskId, targetColumn, beforeTaskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !targetColumn) return;

    const currentInTarget = tasks.filter((t) => {
      const inTarget = targetColumn.statusKey ? t.statusKey === targetColumn.statusKey : t.customColumnId === targetColumn.id;
      return inTarget && t.id !== taskId;
    });
    if (targetColumn.wipLimit && currentInTarget.length >= targetColumn.wipLimit) {
      showToast(`"${targetColumn.title}" is at its WIP limit (${targetColumn.wipLimit}).`, { type: 'info' });
    }

    const previousTasks = tasks;

    setTasks((current) => {
      const withoutTask = current.filter((t) => t.id !== taskId);
      const updatedTask = {
        ...task,
        statusKey: targetColumn.statusKey || task.statusKey,
        customColumnId: targetColumn.statusKey ? null : targetColumn.id,
        isCompleted: targetColumn.statusKey === 'completed',
        rawApiData: targetColumn.statusKey
          ? { ...task.rawApiData, status: targetColumn.statusKey }
          : task.rawApiData,
      };
      if (!beforeTaskId) return [...withoutTask, updatedTask];
      const insertAt = withoutTask.findIndex((t) => t.id === beforeTaskId);
      if (insertAt === -1) return [...withoutTask, updatedTask];
      return [...withoutTask.slice(0, insertAt), updatedTask, ...withoutTask.slice(insertAt)];
    });

    if (!targetColumn.statusKey) {
      showToast(`Moved to a custom column — status "${targetColumn.title}" isn't recognized by the backend yet, so this only shows locally.`, { type: 'info' });
      return;
    }

    try {
      await saveBoardRecord(task, { status: targetColumn.statusKey });
    } catch (err) {
      console.error('Failed to save status move:', err);
      setTasks(previousTasks);
      showToast(err.message || 'Could not move the task. Please try again.', { type: 'error' });
    }
  };

  // --- Drag and drop: tasks ---
  const handleTaskDragStart = (e, taskId) => {
    e.stopPropagation();
    setDraggingTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-task', taskId);
  };

  const handleCardDragOver = (e, columnId, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer.types.includes('application/x-task')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isAbove = e.clientY < rect.top + rect.height / 2;
    setDropTarget({ columnId, beforeTaskId: isAbove ? taskId : null });
  };

  const handleColumnDragOver = (e, columnId) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/x-task')) {
      setDropTarget((current) => current?.columnId === columnId ? current : { columnId, beforeTaskId: null });
    }
  };

  const handleColumnDrop = async (e, column) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('application/x-task');
    setDraggingTaskId(null);
    const target = dropTarget?.columnId === column.id ? dropTarget : { columnId: column.id, beforeTaskId: null };
    setDropTarget(null);
    if (!taskId) return;
    await moveTask(taskId, column, target.beforeTaskId);
  };

  // --- Drag and drop when grouped by Assignee or Priority ---
  // These groups aren't status columns, so dropping a card into one changes
  // a different field instead: resource_id for Assignee, priority for
  // Priority. No "insert before this card" tracking here — just "which
  // group is the card now in".
  const handleGroupDragOver = (e, groupId) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('application/x-task')) setHoveredGroupId(groupId);
  };

  const handleGroupDrop = async (e, group) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('application/x-task');
    setDraggingTaskId(null);
    setHoveredGroupId(null);
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (groupBy === 'Assignee') {
      await handleQuickAssigneeChange(task, group.id);
    } else if (groupBy === 'Priority') {
      await handleSaveField(task, 'priority', group.id);
      showToast(`Priority set to ${group.id}.`, { type: 'success' });
    }
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

  // --- Grouping (Status / Assignee / Priority) ---
  // "Status" uses the real board columns (from useBoardExtras — supports
  // WIP limits, rename, custom columns, reordering, add-task). Assignee and
  // Priority are lighter read/write groupings built on the fly: dragging a
  // card into one of these changes resource_id / priority instead of
  // status, and they don't get the column-management affordances since
  // there's nothing to rename/limit/reorder there.
  const displayGroups = useMemo(() => {
    if (groupBy === 'Assignee') {
      return [
        { id: '', title: 'Unassigned', color: 'bg-slate-300', wipLimit: null },
        ...resources.map((r) => ({ id: String(r.id), title: r.name, color: 'bg-blue-400', wipLimit: null })),
      ];
    }
    if (groupBy === 'Priority') return PRIORITY_GROUPS;
    return columns;
  }, [groupBy, columns, resources]);

  const getGroupTasks = useCallback((group) => {
    return tasks
      .filter((t) => {
        if (groupBy === 'Assignee') {
          const rid = t.rawApiData?.resource_id ? String(t.rawApiData.resource_id) : '';
          return rid === group.id;
        }
        if (groupBy === 'Priority') return (t.priority || 'Medium') === group.id;
        // Status mode: match the column's fixed backend statusKey, not its
        // (renamable) title — a custom column has no statusKey, so those
        // match on the locally-tracked customColumnId instead.
        return group.statusKey ? t.statusKey === group.statusKey : t.customColumnId === group.id;
      })
      .filter(matchesFilters);
  }, [tasks, groupBy, matchesFilters]);

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

  if (loadError) {
    return (
      <div className="min-h-100 bg-[#F8F9FB] flex flex-col items-center justify-center gap-3 p-8 text-center font-sans">
        <p className="text-sm font-semibold text-slate-700">Couldn't load the board</p>
        <p className="max-w-sm text-sm text-slate-400">{loadError}</p>
        <button
          type="button"
          onClick={() => { setIsLoading(true); refetchBoard().finally(() => setIsLoading(false)); }}
          className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Retry
        </button>
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
            <div className="relative pr-3 border-r border-slate-200" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => { setUserDropdownOpen((v) => !v); ensureResourcesLoaded(); }}
                className="flex items-center gap-2.5 rounded-lg px-1 py-0.5 hover:bg-slate-50 transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                />
                <div className="leading-tight text-left">
                  <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                  <p className="text-xs text-slate-400">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute left-0 top-14 z-30 w-56 rounded-xl border border-slate-100 bg-white shadow-xl p-1.5">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-slate-700 bg-blue-50"
                  >
                    {currentUser.name}
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  {resources
                    .filter((r) => (r.role || '').toLowerCase().includes('project manager') && r.name !== currentUser.name)
                    .map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        disabled
                        title="Switching boards between PMs isn't available yet — the backend has no reliable way to map a PM to their board data."
                        className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-slate-400 cursor-not-allowed"
                      >
                        {r.name}
                        <span className="text-[10px] font-medium text-slate-300">Coming soon</span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* <div className="relative" ref={roleDropdownRef}>
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
            </div> */}

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
                Group by <span className="font-semibold text-slate-700">{groupBy}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {groupByOpen && (
                <div className="absolute right-0 top-11 z-30 w-40 rounded-xl border border-slate-100 bg-white shadow-xl p-1.5">
                  {['Status', 'Assignee', 'Priority'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => { setGroupBy(option); setGroupByOpen(false); }}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-slate-600 hover:bg-slate-50"
                    >
                      {option}
                      {groupBy === option && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
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
        {displayGroups.map((column, index) => {
          const isStatusMode = groupBy === 'Status';
          const columnTasks = getGroupTasks(column);
          const overLimit = column.wipLimit && columnTasks.length > column.wipLimit;
          const isHighlighted = isStatusMode
            ? dropTarget?.columnId === column.id
            : hoveredGroupId === column.id;

          return (
            <div
              key={column.id}
              className={`shrink-0 w-75 flex flex-col bg-slate-50/50 rounded-2xl p-4 border transition-colors ${isHighlighted ? 'border-blue-300 bg-blue-50/40' : 'border-slate-100/50'
                } ${draggingColumnIndex === index ? 'opacity-50' : ''}`}
              onDragOver={(e) => isStatusMode ? handleColumnDragOver(e, column.id) : handleGroupDragOver(e, column.id)}
              onDragLeave={() => { if (!isStatusMode) setHoveredGroupId((v) => (v === column.id ? null : v)); }}
              onDrop={(e) => {
                if (isStatusMode) {
                  handleColumnDrop(e, column);
                  handleColumnHeaderDrop(e, index);
                } else {
                  handleGroupDrop(e, column);
                }
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div
                  className="flex items-center gap-2 flex-1 min-w-0"
                  draggable={isStatusMode}
                  onDragStart={isStatusMode ? (e) => handleColumnHeaderDragStart(e, index) : undefined}
                  onDragEnd={isStatusMode ? handleColumnHeaderDragEnd : undefined}
                >
                  {isStatusMode && <GripVertical size={14} className="text-slate-300 cursor-grab shrink-0" />}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${column.color}`}></span>
                  {isStatusMode && editingColumnId === column.id ? (
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
                      onDoubleClick={isStatusMode ? () => setEditingColumnId(column.id) : undefined}
                      title={isStatusMode ? 'Double-click to rename' : undefined}
                    >
                      {column.title}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-sm font-semibold ${overLimit ? 'text-rose-500' : 'text-slate-500'}`}>
                    {columnTasks.length}{column.wipLimit ? `/${column.wipLimit}` : ''}
                  </span>
                  {isStatusMode && (
                    <button
                      type="button"
                      onClick={() => setColumnSettingsId((v) => v === column.id ? null : column.id)}
                      className="text-slate-300 hover:text-slate-500"
                    >
                      <Settings2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {isStatusMode && columnSettingsId === column.id && (
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
                      columns={columns}
                      labelPalette={labelPalette}
                      isDragging={draggingTaskId === task.id}
                      isDropTargetAbove={isStatusMode && dropTarget?.columnId === column.id && dropTarget?.beforeTaskId === task.id}
                      resources={resources}
                      resourcesLoading={resourcesLoading}
                      onDragStart={(e) => handleTaskDragStart(e, task.id)}
                      onDragOverCard={isStatusMode ? (e) => handleCardDragOver(e, column.id, task.id) : undefined}
                      onOpen={() => { setSelectedTaskId(task.id); ensureResourcesLoaded(); }}
                      onEdit={() => { setSelectedTaskId(task.id); ensureResourcesLoaded(); }}
                      onDuplicate={() => handleDuplicateTask(task)}
                      onDelete={() => handleDeleteTask(task)}
                      onMoveTo={(targetColumn) => moveTask(task.id, targetColumn, null)}
                      onEnsureResources={ensureResourcesLoaded}
                      onAssigneeChange={(value) => handleQuickAssigneeChange(task, value)}
                      onDateChange={(value) => handleQuickDateChange(task, value)}
                    />
                  ))
                )}
              </div>

              {/* Add Task — always on the "In Discussion" column specifically
                  (the leftmost column), and only in Status grouping. New
                  work starts in In Discussion and moves right via drag/
                  "Move to". */}
              {isStatusMode && column.statusKey === 'in_discussion' && (
                <div className="mt-auto pt-2">
                  {activeColumnForAdd === column.id ? (
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
                          onClick={() => handleCreateTaskAPI(column)}
                          disabled={isSubmitting || !selectedScheduleTaskId}
                          className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Saving...' : 'Add'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setActiveColumnForAdd(column.id); ensureScheduleTasksLoaded(); }}
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

        {/* Add Column — only in Status mode; Assignee/Priority groups are
            derived, not user-defined, so there's nothing to add here. */}
        {groupBy === 'Status' && (
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
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          key={selectedTask.boardId}
          task={selectedTask}
          resources={resources}
          resourcesLoading={resourcesLoading}
          labelPalette={labelPalette}
          currentUserName={getCurrentUserName()}
          onClose={() => setSelectedTaskId(null)}
          onSaveField={(field, value) => handleSaveField(selectedTask, field, value)}
          onUploadAttachment={(file) => handleUploadAttachment(selectedTask, file)}
          onRemoveAttachment={() => handleRemoveAttachment(selectedTask)}
          isUploadingAttachment={uploadingAttachmentId === selectedTask.id}
          onDelete={() => { handleDeleteTask(selectedTask); setSelectedTaskId(null); }}
          onDuplicate={() => { handleDuplicateTask(selectedTask); setSelectedTaskId(null); }}
        />
      )}
    </div>
  );
}