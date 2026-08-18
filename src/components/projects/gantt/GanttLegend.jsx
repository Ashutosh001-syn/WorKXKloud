
function GanttLegend({ isMobile, totalTasks, totalMilestones }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'space-between',
      padding: isMobile ? '8px 12px' : '12px 24px', background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      fontSize: 11, color: '#64748b', fontWeight: 600, flexShrink: 0,
      overflowX: isMobile ? 'auto' : 'visible',
      WebkitOverflowScrolling: 'touch',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: '#3b82f6' }} />
          <span>Task</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, transform: 'rotate(45deg)', background: '#10b981' }} />
          <span>Milestone</span>
        </div>
        {!isMobile && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#94a3b8', letterSpacing: '1px', fontSize: 13, fontWeight: 'bold' }}>- - -</span>
              <span>Baseline</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 16, height: 2, background: '#ef4444' }} />
              <span>Critical Path</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid #e2e8f0', paddingLeft: 16 }}>
              {[
                { label: 'FS', desc: 'Finish→Start', bg: '#dbeafe', color: '#1d4ed8' },
                { label: 'SS', desc: 'Start→Start', bg: '#dcfce7', color: '#15803d' },
                { label: 'FF', desc: 'Finish→Finish', bg: '#fef3c7', color: '#b45309' },
                { label: 'SF', desc: 'Start→Finish', bg: '#f3e8ff', color: '#7c3aed' },
              ].map(t => (
                <span key={t.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 10, color: '#64748b',
                }}>
                  <span style={{
                    background: t.bg, color: t.color,
                    fontWeight: 700, fontSize: 9, padding: '1px 5px',
                    borderRadius: 4, letterSpacing: '0.3px', lineHeight: '16px',
                  }}>{t.label}</span>
                  <span>{t.desc}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
        {totalTasks > 0
          ? isMobile
            ? `${totalTasks} tasks`
            : `Showing 1 – ${totalTasks} of ${totalTasks} tasks (${totalMilestones} milestones)`
          : 'No schedule data available for this project.'}
      </div>
    </div>
  )
}

export default GanttLegend
