import { createPortal } from 'react-dom'

// Simple single-button notice dialog — used for validation messages and
// error surfacing throughout the Gantt (e.g. "cannot create this link").
function GanttAlertModal({ message, onClose }) {
  if (!message) return null

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
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
          Notice
        </h3>
        <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button
            onClick={onClose}
            style={{
              height: 36, borderRadius: 8, border: 'none', background: '#2563eb',
              color: '#ffffff', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '0 16px',
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default GanttAlertModal
