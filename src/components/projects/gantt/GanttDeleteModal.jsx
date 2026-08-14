import { createPortal } from 'react-dom'

// Type-to-confirm delete dialog for a task/sub-task. The Delete button
// stays disabled until the user types "delete" exactly, matching the
// destructive-action confirmation pattern used elsewhere in the app.
function GanttDeleteModal({ open, task, deleteText, onDeleteTextChange, onCancel, onConfirm }) {
  if (!open) return null

  const isConfirmed = deleteText.trim().toLowerCase() === 'delete'

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100dvh',
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: 16,
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        width: '100%',
        maxWidth: 400,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Delete Task
          </h3>
          <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#64748b', lineHeight: '1.5' }}>
            Are you sure you want to delete <strong>{task?.text}</strong>? This action cannot be undone.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
            Type <span style={{ color: '#ef4444', fontWeight: 700 }}>delete</span> to confirm:
          </label>
          <input
            type="text"
            value={deleteText}
            onChange={e => onDeleteTextChange(e.target.value)}
            placeholder="delete"
            style={{
              height: 38,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              padding: '0 12px',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#ef4444'
              e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.1)'
            }}
            onBlur={e => {
              e.target.style.borderColor = '#cbd5e1'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              height: 36,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              padding: '0 16px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmed}
            style={{
              height: 36,
              borderRadius: 8,
              border: 'none',
              background: isConfirmed ? '#ef4444' : '#fca5a5',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: isConfirmed ? 'pointer' : 'not-allowed',
              padding: '0 16px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (isConfirmed) e.currentTarget.style.background = '#dc2626' }}
            onMouseLeave={e => { if (isConfirmed) e.currentTarget.style.background = '#ef4444' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default GanttDeleteModal
