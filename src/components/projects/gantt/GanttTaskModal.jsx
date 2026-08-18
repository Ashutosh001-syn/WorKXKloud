import { createPortal } from 'react-dom'


function GanttTaskModal({ open, data, onChange, onClose, onSubmit, isSaving, projectResourceNames }) {
  if (!open || !data) return null

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
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
            Add {data.type === 'project' ? 'Work Stream' : data.type === 'task' && data.isSubTaskFlag ? 'Sub-task' : data.type}
          </h3>
          {data.isSubTaskFlag && data.parentName && (
            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>
              Under: <span style={{ fontWeight: 600, color: '#334155' }}>{data.parentName}</span>
            </p>
          )}
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Name</label>
            <input
              type="text"
              required
              value={data.text}
              onChange={e => onChange({ ...data, text: e.target.value })}
              style={{ height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Start Date</label>
            <input
              type="date"
              required
              value={data.start_date}
              onChange={e => onChange({ ...data, start_date: e.target.value })}
              style={{ height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, outline: 'none' }}
            />
          </div>

          {data.type !== 'milestone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Duration (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={data.duration}
                onChange={e => onChange({ ...data, duration: e.target.value })}
                style={{ height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, outline: 'none' }}
              />
            </div>
          )}

          {data.type !== 'milestone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Resource</label>
              <select
                value={data.assignees}
                onChange={e => onChange({ ...data, assignees: e.target.value })}
                style={{ height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, outline: 'none', background: '#fff' }}
              >
                <option value="">— Select resource —</option>
                {projectResourceNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          )}

          {data.type === 'task' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Predecessor (optional)</label>
              <input
                type="text"
                placeholder="Task # or name it depends on"
                value={data.predecessor}
                onChange={e => onChange({ ...data, predecessor: e.target.value })}
                style={{ height: 38, borderRadius: 8, border: '1px solid #cbd5e1', padding: '0 12px', fontSize: 14, outline: 'none' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                height: 36, borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff',
                color: '#475569', fontWeight: 600, fontSize: 13, cursor: isSaving ? 'not-allowed' : 'pointer',
                padding: '0 16px', opacity: isSaving ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                height: 36, borderRadius: 8, border: 'none', background: '#2563eb',
                color: '#ffffff', fontWeight: 600, fontSize: 13, cursor: isSaving ? 'not-allowed' : 'pointer',
                padding: '0 16px', opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? 'Saving…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default GanttTaskModal
