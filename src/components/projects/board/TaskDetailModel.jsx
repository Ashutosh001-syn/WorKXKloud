import { useState } from 'react'
import {
    X, Calendar, Flag, User as UserIcon, Tag, CheckSquare,
    MessageSquare, Paperclip, Plus, Trash2, ExternalLink, Loader2
} from 'lucide-react'

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

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
    extras,
    currentUserName,
    onClose,
    onSaveField,
    onToggleLabel,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask,
    onAddComment,
    onAddAttachment,
    onDeleteAttachment,
    onDelete,
    onDuplicate,
}) {
    const [title, setTitle] = useState(task.title || '')
    const [description, setDescription] = useState(task.rawApiData?.description || '')
    const [newSubtask, setNewSubtask] = useState('')
    const [newComment, setNewComment] = useState('')
    const [attachmentName, setAttachmentName] = useState('')
    const [attachmentUrl, setAttachmentUrl] = useState('')
    const [savingField, setSavingField] = useState(null)

    const handleFieldSave = async (field, value) => {
        setSavingField(field)
        try {
            await onSaveField(field, value)
        } finally {
            setSavingField(null)
        }
    }

    const doneSubtasks = extras.subtasks.filter((st) => st.done).length
    const totalSubtasks = extras.subtasks.length

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
                            onBlur={() => title.trim() && title !== task.title && handleFieldSave('title', title.trim())}
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
                                value={task.priority || 'Medium'}
                                onChange={(e) => handleFieldSave('priority', e.target.value)}
                                disabled={savingField === 'priority'}
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
                                value={task.rawApiData?.resource_id || ''}
                                onChange={(e) => handleFieldSave('resource_id', e.target.value)}
                                disabled={savingField === 'resource_id' || resourcesLoading}
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
                                defaultValue={task.rawApiData?.due_date?.slice(0, 10) || ''}
                                onChange={(e) => handleFieldSave('due_date', e.target.value)}
                                disabled={savingField === 'due_date'}
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
                            onBlur={() => handleFieldSave('description', description)}
                            rows={3}
                            placeholder="Add a description..."
                            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13.5px] text-slate-700 outline-none focus:border-blue-400"
                        />
                    </div>

                    {/* LABELS */}
                    <div>
                        <SectionLabel icon={Tag}>Labels</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                            {labelPalette.map((label) => {
                                const active = extras.labels.some((l) => l.name === label.name)
                                return (
                                    <button
                                        key={label.name}
                                        type="button"
                                        onClick={() => onToggleLabel(label)}
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
                            {extras.subtasks.map((st) => (
                                <div key={st.id} className="flex items-center gap-2 group">
                                    <input
                                        type="checkbox"
                                        checked={st.done}
                                        onChange={() => onToggleSubtask(st.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                                    />
                                    <span className={`flex-1 text-[13.5px] ${st.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                        {st.text}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onDeleteSubtask(st.id)}
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
                                    if (e.key === 'Enter' && newSubtask.trim()) {
                                        onAddSubtask(newSubtask.trim())
                                        setNewSubtask('')
                                    }
                                }}
                                placeholder="Add a checklist item..."
                                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] outline-none focus:border-blue-400"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (!newSubtask.trim()) return
                                    onAddSubtask(newSubtask.trim())
                                    setNewSubtask('')
                                }}
                                className="flex-shrink-0 rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* ATTACHMENTS (link-style) */}
                    <div>
                        <SectionLabel icon={Paperclip}>Attachments</SectionLabel>
                        <div className="flex flex-col gap-1.5 mb-2">
                            {extras.attachments.map((att) => (
                                <div key={att.id} className="flex items-center gap-2 group">
                                    <a
                                        href={att.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:underline truncate"
                                    >
                                        <ExternalLink size={12} className="flex-shrink-0" />
                                        {att.name}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => onDeleteAttachment(att.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={attachmentName}
                                onChange={(e) => setAttachmentName(e.target.value)}
                                placeholder="Name"
                                className="w-1/3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] outline-none focus:border-blue-400"
                            />
                            <input
                                type="text"
                                value={attachmentUrl}
                                onChange={(e) => setAttachmentUrl(e.target.value)}
                                placeholder="https://..."
                                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] outline-none focus:border-blue-400"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (!attachmentName.trim() || !attachmentUrl.trim()) return
                                    onAddAttachment(attachmentName.trim(), attachmentUrl.trim())
                                    setAttachmentName('')
                                    setAttachmentUrl('')
                                }}
                                className="flex-shrink-0 rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* COMMENTS */}
                    <div>
                        <SectionLabel icon={MessageSquare}>
                            Comments {extras.comments.length > 0 && `(${extras.comments.length})`}
                        </SectionLabel>
                        <div className="flex flex-col gap-3 mb-3">
                            {extras.comments.map((c) => (
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
                                    if (e.key === 'Enter' && newComment.trim()) {
                                        onAddComment(newComment.trim(), currentUserName)
                                        setNewComment('')
                                    }
                                }}
                                placeholder="Write a comment..."
                                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] outline-none focus:border-blue-400"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (!newComment.trim()) return
                                    onAddComment(newComment.trim(), currentUserName)
                                    setNewComment('')
                                }}
                                className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-blue-700"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5">
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                        {savingField && <Loader2 size={13} className="animate-spin" />}
                        {savingField ? 'Saving…' : 'All changes saved'}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onDuplicate}
                            className="text-[12.5px] font-semibold text-slate-500 hover:text-slate-700"
                        >
                            Duplicate
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="text-[12.5px] font-semibold text-rose-600 hover:text-rose-700"
                        >
                            Delete task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskDetailModal
