import { useState } from 'react'
import {
    X, Calendar, Flag, User as UserIcon, Tag, CheckSquare,
    MessageSquare, Paperclip, Plus, Trash2, ExternalLink, Loader2
} from 'lucide-react'

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

function parseJsonArray(raw) {
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function SectionLabel({ icon, children }) {
    const Icon = icon
    return (
        <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-400 mb-2">
            <Icon size={13} />
            {children}
        </div>
    )
}

function TaskDetailModal({
    task,
    resources,
    resourcesLoading,
    labelPalette,
    currentUserName,
    onClose,
    onSaveField,
    onUploadAttachment,
    onRemoveAttachment,
    isUploadingAttachment,
    onDelete,
    onDuplicate,
}) {
    // Everything in this modal — Title/Priority/Assignee/Due date/
    // Description/Labels/Checklist/Comments — is edited as a local draft
    // and only sent on "Update Task". Labels/Checklist/Comments used to
    // call their save handlers immediately on every click/keystroke (one
    // editBoard call per toggle/add), which is exactly the "API call per
    // field" bug — now they just mutate local draft state like every other
    // field, and handleUpdateTask sends the whole batch in one shot.
    const initialDueDate = task.rawApiData?.due_date?.slice(0, 10) || ''
    const initialLabels = (task.rawApiData?.labels || '').split(',').map((n) => n.trim()).filter(Boolean)
    const initialChecklist = parseJsonArray(task.rawApiData?.checklist)
    const initialComments = parseJsonArray(task.rawApiData?.comments)

    const [title, setTitle] = useState(task.title || '')
    const [priority, setPriority] = useState(task.priority || 'Medium')
    const [resourceId, setResourceId] = useState(task.rawApiData?.resource_id || '')
    const [dueDate, setDueDate] = useState(initialDueDate)
    const [description, setDescription] = useState(task.rawApiData?.description || '')
    const [activeLabelNames, setActiveLabelNames] = useState(initialLabels)
    const [subtasks, setSubtasks] = useState(initialChecklist)
    const [comments, setComments] = useState(initialComments)
    const [newSubtask, setNewSubtask] = useState('')
    const [newComment, setNewComment] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const hasChanges =
        title.trim() !== (task.title || '') ||
        priority !== (task.priority || 'Medium') ||
        String(resourceId) !== String(task.rawApiData?.resource_id || '') ||
        dueDate !== initialDueDate ||
        description !== (task.rawApiData?.description || '') ||
        JSON.stringify(activeLabelNames) !== JSON.stringify(initialLabels) ||
        JSON.stringify(subtasks) !== JSON.stringify(initialChecklist) ||
        JSON.stringify(comments) !== JSON.stringify(initialComments)

    const handleToggleLabel = (label) => {
        setActiveLabelNames((current) =>
            current.includes(label.name)
                ? current.filter((name) => name !== label.name)
                : [...current, label.name]
        )
    }

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return
        setSubtasks((current) => [...current, { id: `st_${crypto.randomUUID()}`, text: newSubtask.trim(), done: false }])
        setNewSubtask('')
    }

    const handleToggleSubtask = (subtaskId) => {
        setSubtasks((current) => current.map((st) => (st.id === subtaskId ? { ...st, done: !st.done } : st)))
    }

    const handleDeleteSubtask = (subtaskId) => {
        setSubtasks((current) => current.filter((st) => st.id !== subtaskId))
    }

    const handleAddComment = () => {
        if (!newComment.trim()) return
        setComments((current) => [
            ...current,
            { id: `cm_${crypto.randomUUID()}`, text: newComment.trim(), author: currentUserName, timestamp: new Date().toISOString() },
        ])
        setNewComment('')
    }

    const handleUpdateTask = async () => {
        if (!hasChanges || isUpdating) return
        setIsUpdating(true)
        try {
            const saves = []
            if (title.trim() && title.trim() !== (task.title || '')) saves.push(onSaveField('title', title.trim()))
            if (priority !== (task.priority || 'Medium')) saves.push(onSaveField('priority', priority))
            if (String(resourceId) !== String(task.rawApiData?.resource_id || '')) saves.push(onSaveField('resource_id', resourceId))
            if (dueDate !== initialDueDate) saves.push(onSaveField('due_date', dueDate))
            if (description !== (task.rawApiData?.description || '')) saves.push(onSaveField('description', description))
            if (JSON.stringify(activeLabelNames) !== JSON.stringify(initialLabels)) saves.push(onSaveField('labels', activeLabelNames.join(',')))
            if (JSON.stringify(subtasks) !== JSON.stringify(initialChecklist)) saves.push(onSaveField('checklist', JSON.stringify(subtasks)))
            if (JSON.stringify(comments) !== JSON.stringify(initialComments)) saves.push(onSaveField('comments', JSON.stringify(comments)))

            // Safety net to match onSaveField's own timeout — even if a save
            // hangs, the button doesn't stay stuck on "Updating…" forever.
            await Promise.race([
                Promise.all(saves),
                new Promise((resolve) => setTimeout(resolve, 4000)),
            ])
            // Back to the board so the update is visible on the card, instead
            // of leaving the modal sitting open on top of it.
            onClose()
        } catch (err) {
            console.error('Failed to update task:', err)
            setIsUpdating(false)
        }
    }

    const doneSubtasks = subtasks.filter((st) => st.done).length
    const totalSubtasks = subtasks.length

    return (
        <div
            className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-8"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
                    <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            #{task.id}
                        </span>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full border-none bg-transparent p-0 text-[18px] font-bold text-slate-800 outline-none focus:ring-0"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto px-6 py-5 flex flex-col gap-6">
                    {/* PROPERTIES ROW */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {/* Priority */}
                        <div>
                            <SectionLabel icon={Flag}>Priority</SectionLabel>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                disabled={isUpdating}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[13px] font-medium text-slate-700 outline-none focus:border-blue-400"
                            >
                                {PRIORITY_OPTIONS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        {/* Assignee */}
                        <div>
                            <SectionLabel icon={UserIcon}>Assignee</SectionLabel>
                            <select
                                value={resourceId}
                                onChange={(e) => setResourceId(e.target.value)}
                                disabled={isUpdating || resourcesLoading}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[13px] font-medium text-slate-700 outline-none focus:border-blue-400"
                            >
                                <option value="">Unassigned</option>
                                {resources.map((r) => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Due date */}
                        <div>
                            <SectionLabel icon={Calendar}>Due date</SectionLabel>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                disabled={isUpdating}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[13px] font-medium text-slate-700 outline-none focus:border-blue-400"
                            />
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <SectionLabel icon={MessageSquare}>Description</SectionLabel>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isUpdating}
                            rows={3}
                            placeholder="Add a description..."
                            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13.5px] text-slate-700 outline-none focus:border-blue-400 disabled:opacity-60"
                        />
                    </div>

                    {/* LABELS */}
                    <div>
                        <SectionLabel icon={Tag}>Labels</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                            {labelPalette.map((label) => {
                                const active = activeLabelNames.includes(label.name)
                                return (
                                    <button
                                        key={label.name}
                                        type="button"
                                        onClick={() => handleToggleLabel(label)}
                                        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition"
                                        style={{
                                            backgroundColor: active ? `${label.color}22` : '#f1f5f9',
                                            color: active ? label.color : '#64748b',
                                            border: `1px solid ${active ? label.color : '#e2e8f0'}`,
                                        }}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: label.color }} />
                                        {label.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* SUBTASKS / CHECKLIST */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <SectionLabel icon={CheckSquare}>
                                Checklist {totalSubtasks > 0 && `(${doneSubtasks}/${totalSubtasks})`}
                            </SectionLabel>
                        </div>

                        {totalSubtasks > 0 && (
                            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-blue-500 transition-all"
                                    style={{ width: `${(doneSubtasks / totalSubtasks) * 100}%` }}
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            {subtasks.map((st) => (
                                <div key={st.id} className="flex items-center gap-2 group">
                                    <input
                                        type="checkbox"
                                        checked={st.done}
                                        onChange={() => handleToggleSubtask(st.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                                    />
                                    <span className={`flex-1 text-[13.5px] ${st.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                        {st.text}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteSubtask(st.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                            <input
                                type="text"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask() }
                                }}
                                placeholder="Add a checklist item..."
                                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] outline-none focus:border-blue-400"
                            />
                            <button
                                type="button"
                                onClick={handleAddSubtask}
                                className="flex-shrink-0 rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* ATTACHMENT (single file — backend stores one URL per task) */}
                    <div>
                        <SectionLabel icon={Paperclip}>Attachment</SectionLabel>
                        {task.rawApiData?.attachments ? (
                            <div className="flex items-center gap-2 group">
                                <a
                                    href={task.rawApiData.attachments}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:underline truncate"
                                >
                                    <ExternalLink size={12} className="flex-shrink-0" />
                                    {task.rawApiData.attachments.split('/').pop()}
                                </a>
                                <button
                                    type="button"
                                    onClick={onRemoveAttachment}
                                    disabled={isUploadingAttachment}
                                    className="text-slate-300 hover:text-rose-500 transition disabled:opacity-40"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-[13px] font-medium text-slate-500 cursor-pointer hover:bg-slate-100 transition">
                                {isUploadingAttachment ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" /> Uploading…
                                    </>
                                ) : (
                                    <>
                                        <Plus size={14} /> Upload a file
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    disabled={isUploadingAttachment}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) onUploadAttachment(file)
                                        e.target.value = ''
                                    }}
                                />
                            </label>
                        )}
                    </div>

                    {/* COMMENTS */}
                    <div>
                        <SectionLabel icon={MessageSquare}>
                            Comments {comments.length > 0 && `(${comments.length})`}
                        </SectionLabel>
                        <div className="flex flex-col gap-3 mb-3">
                            {comments.map((c) => (
                                <div key={c.id} className="rounded-lg bg-slate-50 px-3 py-2">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[12.5px] font-bold text-slate-700">{c.author}</span>
                                        <span className="text-[11px] text-slate-400">
                                            {new Date(c.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-slate-600 leading-snug">{c.text}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); handleAddComment() }
                                }}
                                placeholder="Write a comment..."
                                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] outline-none focus:border-blue-400"
                            />
                            <button
                                type="button"
                                onClick={handleAddComment}
                                className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-blue-700"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-3.5">
                    <button
                        type="button"
                        onClick={onDelete}
                        className="text-[12.5px] font-semibold text-rose-600 hover:text-rose-700"
                    >
                        Delete task
                    </button>
                    <button
                        type="button"
                        onClick={handleUpdateTask}
                        disabled={!hasChanges || isUpdating}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                        {isUpdating && <Loader2 size={13} className="animate-spin" />}
                        {isUpdating ? 'Updating…' : 'Update Task'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskDetailModal
