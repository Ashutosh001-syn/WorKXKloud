import { Check, Trash2 } from 'lucide-react'
import { LINK_FS, LINK_SS, LINK_FF, LINK_SF } from './ganttConstants'

const LINK_TYPES = [
  { value: LINK_FS, label: 'FS', desc: 'Finish → Start', bg: '#dbeafe', color: '#1d4ed8', activeBg: '#2563eb' },
  { value: LINK_SS, label: 'SS', desc: 'Start → Start', bg: '#dcfce7', color: '#15803d', activeBg: '#16a34a' },
  { value: LINK_FF, label: 'FF', desc: 'Finish → Finish', bg: '#fef3c7', color: '#b45309', activeBg: '#d97706' },
  { value: LINK_SF, label: 'SF', desc: 'Start → Finish', bg: '#f3e8ff', color: '#7c3aed', activeBg: '#8b5cf6' },
]

const stopProp = (e) => e.stopPropagation()


function GanttLinkMenu({ linkMenu, onChangeType, onDeleteLink }) {
  if (!linkMenu) return null

  return (
    <div onMouseDown={stopProp} style={{
      position: 'fixed', top: linkMenu.y, left: linkMenu.x,
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: 10, boxShadow: '0 12px 32px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
      zIndex: 99999, padding: 5, minWidth: 220,
      animation: 'linkMenuIn 0.15s ease-out',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ padding: '6px 10px 5px', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #f1f5f9', marginBottom: 3 }}>
        Change Link Type
      </div>
      {LINK_TYPES.map(lt => {
        const isActive = linkMenu.currentType === lt.value
        return (
          <button key={lt.value} onClick={() => onChangeType(lt.value)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '8px 10px', border: 'none',
            borderRadius: 6, cursor: 'pointer', fontSize: 12,
            background: isActive ? lt.bg : 'transparent',
            fontFamily: 'inherit', textAlign: 'left', outline: 'none',
          }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 30, height: 20, borderRadius: 4, fontWeight: 700,
              fontSize: 10, letterSpacing: '0.4px',
              background: isActive ? lt.activeBg : '#f1f5f9',
              color: isActive ? '#fff' : lt.color,
            }}>{lt.label}</span>
            <span style={{ color: isActive ? '#0f172a' : '#64748b', fontWeight: isActive ? 600 : 500, flex: 1 }}>{lt.desc}</span>
            {isActive && <Check size={14} color={lt.color} />}
          </button>
        )
      })}
      <div style={{ borderTop: '1px solid #f1f5f9', margin: '3px 0' }} />
      <button onClick={onDeleteLink} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '8px 10px', border: 'none',
        borderRadius: 6, cursor: 'pointer', fontSize: 12,
        background: 'transparent', color: '#ef4444',
        fontWeight: 600, fontFamily: 'inherit', textAlign: 'left', outline: 'none',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Trash2 size={13} />
        Delete Link
      </button>
    </div>
  )
}

export default GanttLinkMenu
