import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Search, Filter, MoreHorizontal, Calendar, GripVertical,
  ArrowUp, Minus, CheckCircle2, Plus, Loader2, X, Copy, Trash2,
  ArrowRightLeft, Pencil, Tag, CheckSquare, MessageSquare, Paperclip, Settings2,
  ChevronDown, Check, ListFilter
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
  onDragStart, onDragOverCard, onOpen,
  onEdit, onDuplicate, onDelete, onMoveTo,
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
        <img src={task.avatar} alt="Assignee" className="w-6 h-6 rounded-full border border-slate-200 pointer-events-none" />
        {task.isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <div className="flex items-center text-slate-400 text-xs font-medium gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {task.date}
          </div>
        )}
      </div>
    </div>
  </div>
);


export default function ProjectBoardSection({ projectId, pmId, subProjectId = null }) {
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
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

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

  // --- PURE DATA LOADER (no state writes) ---
  // TODO(backend): once GET_BOARDS_BY_RESOURCE is live, restore the fetch
  // below and drop the mock fallback — the returned shape already matches
  // what the rest of this component expects, so nothing else needs to change.
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
      //     avatar: item.assignee_avatar || 'https://i.pravatar.cc/150?img=47',
      //     date: item.due_date
      //       ? new Date(item.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      //       : '—',
      //     isCompleted: item.status?.toLowerCase() === 'completed',
      //     status: item.status,
      //     rawApiData: item,
      //   }));

      return getMockBoardTasks(projectId);
    } catch (error) {
      console.error('ProjectBoardSection: fetch failed, using mock data', error);
      return getMockBoardTasks(projectId);
    }
  }, [projectId]);

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

  // --- CREATE TASK ---
  // TODO(backend): once CREATE_BOARD is live, POST first and refetch on
  // success (see commented block) instead of inserting the task locally.
  const handleCreateTaskAPI = async (columnTitle) => {
    if (!newTaskTitle.trim()) return;
    setIsSubmitting(true);
    try {
      // const { id: resourceId } = getResourceId();
      // const response = await fetch(API_ENDPOINTS.CREATE_BOARD, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     project_id: projectId,
      //     sub_project_id: subProjectId,
      //     status: columnTitle.toLowerCase(),
      //     resource_id: resourceId,
      //     pm_id: pmId,
      //     title: newTaskTitle.trim()
      //   }),
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message || 'Failed to create task');
      // await _refetchTasks();

      const { id: resourceId } = getResourceId();
      const newBoardId = nextMockBoardId();
      const newTask = {
        id: `WR-${newBoardId}`,
        boardId: newBoardId,
        title: newTaskTitle.trim(),
        projectName: tasks[0]?.projectName,
        priority: 'Medium',
        avatar: 'https://i.pravatar.cc/150?img=47',
        date: '—',
        isCompleted: columnTitle === 'Completed',
        status: columnTitle,
        rawApiData: { project_id: projectId, sub_project_id: subProjectId, resource_id: resourceId, pm_id: pmId },
      };
      setTasks((current) => [...current, newTask]);
      setNewTaskTitle('');
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
      // const { id: resourceId } = getResourceId();
      // const response = await fetch(API_ENDPOINTS.CREATE_BOARD, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     project_id: projectId,
      //     sub_project_id: subProjectId,
      //     status: task.status.toLowerCase(),
      //     resource_id: task.rawApiData?.resource_id || resourceId,
      //     pm_id: pmId,
      //     title: `${task.title} (copy)`,
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
                      onDragStart={(e) => handleTaskDragStart(e, task.id)}
                      onDragOverCard={(e) => handleCardDragOver(e, column.title, task.id)}
                      onOpen={() => { setSelectedTaskId(task.id); ensureResourcesLoaded(); }}
                      onEdit={() => { setSelectedTaskId(task.id); ensureResourcesLoaded(); }}
                      onDuplicate={() => handleDuplicateTask(task)}
                      onDelete={() => handleDeleteTask(task)}
                      onMoveTo={(targetTitle) => moveTask(task.id, targetTitle, null)}
                    />
                  ))
                )}
              </div>

              {/* Add Task Input Area */}
              <div className="mt-auto pt-2">
                {activeColumnForAdd === column.title ? (
                  <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm flex flex-col gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Enter task name..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      disabled={isSubmitting}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateTaskAPI(column.title);
                        if (e.key === 'Escape') { setActiveColumnForAdd(null); setNewTaskTitle(''); }
                      }}
                      className="h-auto w-full border-none bg-transparent p-0 text-sm outline-none placeholder:text-slate-400"
                    />
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={() => { setActiveColumnForAdd(null); setNewTaskTitle(''); }}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                        disabled={isSubmitting}
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        onClick={() => handleCreateTaskAPI(column.title)}
                        disabled={isSubmitting || !newTaskTitle.trim()}
                        className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Add'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveColumnForAdd(column.title)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-200/50 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Task
                  </button>
                )}
              </div>
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
