import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Search, ChevronDown, Clock, Plus, Eye, Pencil, Trash2, User, X, Shield, ShieldOff, Loader2 } from 'lucide-react'
import { API_ENDPOINTS } from '../config/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Convert "09:00 AM" → "09:00:00" for API
const toApiTime = (t = '') => {
  if (!t) return ''
  const [hm, period] = t.split(' ')
  if (!hm) return t
  let [h, m] = hm.split(':').map(Number)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

// Convert "09:00:00" → "09:00 AM" for display
const fromApiTime = (t = '') => {
  if (!t) return '09:00 AM'
  const [hStr, mStr] = t.split(':')
  let h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const period = h >= 12 ? 'PM' : 'AM'
  if (h > 12) h -= 12
  if (h === 0) h = 12
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
}

const numbersOnly = (v = '') => v.replace(/\D/g, '')
const nameOnly = (v = '') => v.replace(/[^a-zA-Z\s]/g, '').replace(/\s{2,}/g, ' ')
const decimalOnly = (v = '') => v.replace(/[^0-9.]/g, '')

// Map API row → UI row
const mapApiRow = (r) => ({
  id: r.id,
  type: r.resource_type
    ? (r.resource_type.toLowerCase() === 'inhouse' ? 'In-house' : r.resource_type.charAt(0).toUpperCase() + r.resource_type.slice(1).toLowerCase())
    : 'In-house',

  name: r.name || '',
  email: r.email || '',
  mobile: r.mobile || '',
  role: r.role || '',
  shift: r.shift || 'Day',
  salary: r.salary_ctc != null ? String(r.salary_ctc) : '',
  hourlyRate: r.salary_per_hours != null ? String(r.salary_per_hours) : '',

  startTime: fromApiTime(r.start_time),
  endTime: fromApiTime(r.end_time),

  unit: r.unit_bag_kg || '',
  rate: r.rate_per_unit ? String(r.rate_per_unit) : '',
  cost: r.cost != null ? String(r.cost) : '',
  dateTime: r.date && r.time
    ? `${r.date} ${r.time}`
    : (r.created_at ? new Date(r.created_at).toLocaleString() : '—'),

  // API: 1 = active, 0 = deactive
  blocked: Number(r.is_active) === 0,

  monday: r.monday === true || String(r.monday) === 'true' || r.monday === 1 || String(r.monday) === '1',
  tuesday: r.tuesday === true || String(r.tuesday) === 'true' || r.tuesday === 1 || String(r.tuesday) === '1',
  wednesday: r.wednesday === true || String(r.wednesday) === 'true' || r.wednesday === 1 || String(r.wednesday) === '1',
  thursday: r.thursday === true || String(r.thursday) === 'true' || r.thursday === 1 || String(r.thursday) === '1',
  friday: r.friday === true || String(r.friday) === 'true' || r.friday === 1 || String(r.friday) === '1',
  saturday: r.saturday === true || String(r.saturday) === 'true' || r.saturday === 1 || String(r.saturday) === '1',
  sunday: r.sunday === true || String(r.sunday) === 'true' || r.sunday === 1 || String(r.sunday) === '1',
})

// Build FormData for create/update
const buildFormData = (form, isUpdate = false) => {
  const fd = new FormData()
  if (isUpdate) fd.append('id', form.id)

  const typeMap = { 'In-house': 'inhouse', Freelancer: 'freelancer', Material: 'material', Cost: 'cost' }
  fd.append('resource_type', typeMap[form.type] || form.type.toLowerCase())
  fd.append('name', form.name || '')
  fd.append('role', form.role || '')
  fd.append('email', form.email || '')
  fd.append('mobile', form.mobile || '')
  fd.append('shift', form.shift || '')
  fd.append('salary_ctc', form.salary || '')
  fd.append('start_time', toApiTime(form.startTime))
  fd.append('end_time', toApiTime(form.endTime))
  fd.append('experience', form.experience || '')
  fd.append('salary_per_hours', form.hourlyRate || '')
  fd.append('unit_bag_kg', form.unit || '')
  fd.append('rate_per_unit', form.rate || '')
  fd.append('cost', form.cost || '')
  fd.append('is_active', form.blocked ? '0' : '1')
  fd.append('monday', form.monday ? 'true' : 'false')
  fd.append('tuesday', form.tuesday ? 'true' : 'false')
  fd.append('wednesday', form.wednesday ? 'true' : 'false')
  fd.append('thursday', form.thursday ? 'true' : 'false')
  fd.append('friday', form.friday ? 'true' : 'false')
  fd.append('saturday', form.saturday ? 'true' : 'false')
  fd.append('sunday', form.sunday ? 'true' : 'false')

  // image: only send if it's a new base64 upload
  if (form.image && form.image.startsWith('data:')) {
    const arr = form.image.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8 = new Uint8Array(n)
    while (n--) u8[n] = bstr.charCodeAt(n)
    fd.append('image', new Blob([u8], { type: mime }), 'photo.jpg')
  }

  return fd
}

// ─── Role colours ─────────────────────────────────────────────────────────────
const roleTone = {
  'Project Manager': { bg: '#e8f2ff', color: '#0052ff' },
  'Tech Lead': { bg: '#fff4e6', color: '#e07b00' },
  'Tester': { bg: '#f3ebff', color: '#7c3aed' },
  'Management': { bg: '#e6ffed', color: '#00a83a' },
  'Architect': { bg: '#ffebee', color: '#d32f2f' },
  'Account Manager': { bg: '#e0f7fa', color: '#0097a7' },
  'tester': { bg: '#f3ebff', color: '#7c3aed' },
}

/* ─── Time Dialer ─────────────────────────────────────────────────────────── */
function TimeDial({ label, value, onChange, onClose, upward, style: posStyle }) {
  const parseTime = (t = '12:00 AM') => {
    const [hm, period] = (t || '12:00 AM').split(' ')
    const [h, m] = (hm || '12:00').split(':').map(Number)
    return { h: isNaN(h) ? 12 : h, m: isNaN(m) ? 0 : m, period: period || 'AM' }
  }
  const [time, setTime] = useState(() => parseTime(value))
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 60 }, (_, i) => i)
  const pad = (n) => String(n).padStart(2, '0')
  const format = (t) => `${pad(t.h)}:${pad(t.m)} ${t.period}`
  const hourRef = useRef(null)
  const minRef = useRef(null)

  useEffect(() => {
    if (hourRef.current) hourRef.current.scrollTop = hours.indexOf(time.h) * 40
    if (minRef.current) minRef.current.scrollTop = time.m * 40
  }, [])

  return (
    <div className="fixed z-[200] w-[260px] rounded-2xl bg-white shadow-2xl ring-1 ring-gray-100 overflow-hidden"
      style={{
        animation: 'fadeIn 0.15s ease',
        ...posStyle,
      }}>
      <div className="bg-[#0052ff] px-5 py-3 flex items-center justify-between">
        <span className="text-[13px] font-bold text-white/80">{label}</span>
        <span className="text-[22px] font-bold text-white tracking-wider">{format(time)}</span>
      </div>
      <div className="flex items-stretch px-4 py-3 gap-2">
        <div className="flex flex-col items-center flex-1">
          <span className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1">Hour</span>
          <div ref={hourRef} onScroll={e => {
            const idx = Math.round(e.target.scrollTop / 40)
            setTime(p => ({ ...p, h: hours[Math.min(idx, 11)] || 12 }))
          }} className="h-[120px] overflow-y-scroll scroll-smooth no-scrollbar" style={{ scrollSnapType: 'y mandatory' }}>
            {[...hours, ...hours].map((h, i) => (
              <div key={i} onClick={() => { setTime(p => ({ ...p, h })); if (hourRef.current) hourRef.current.scrollTop = hours.indexOf(h) * 40 }}
                style={{ scrollSnapAlign: 'center', height: 40 }}
                className={`flex items-center justify-center text-[18px] font-bold cursor-pointer rounded-lg transition-colors select-none
                  ${time.h === h ? 'text-[#0052ff] bg-[#e8f2ff]' : 'text-[#64748b] hover:text-[#14365c]'}`}>
                {pad(h)}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center text-[24px] font-bold text-[#0052ff] self-center pb-2">:</div>
        <div className="flex flex-col items-center flex-1">
          <span className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1">Min</span>
          <div ref={minRef} onScroll={e => {
            const idx = Math.round(e.target.scrollTop / 40)
            setTime(p => ({ ...p, m: Math.min(idx, 59) }))
          }} className="h-[120px] overflow-y-scroll scroll-smooth no-scrollbar" style={{ scrollSnapType: 'y mandatory' }}>
            {minutes.map(m => (
              <div key={m} onClick={() => { setTime(p => ({ ...p, m })); if (minRef.current) minRef.current.scrollTop = m * 40 }}
                style={{ scrollSnapAlign: 'center', height: 40 }}
                className={`flex items-center justify-center text-[18px] font-bold cursor-pointer rounded-lg transition-colors select-none
                  ${time.m === m ? 'text-[#0052ff] bg-[#e8f2ff]' : 'text-[#64748b] hover:text-[#14365c]'}`}>
                {pad(m)}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 self-center">
          {['AM', 'PM'].map(p => (
            <button key={p} onClick={() => setTime(prev => ({ ...prev, period: p }))}
              className={`w-14 h-10 rounded-xl text-[13px] font-bold border-2 transition-all select-none
                ${time.period === p
                  ? 'bg-[#0052ff] text-white border-[#0052ff] shadow-lg shadow-[#0052ff]/20'
                  : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#0052ff] hover:text-[#0052ff]'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-4 mb-3 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-[#e2e8f0] py-2 text-[13px] font-bold text-[#64748b] hover:bg-[#f8fafc] transition">Cancel</button>
        <button onClick={() => { onChange(format(time)); onClose() }}
          className="flex-1 rounded-xl bg-[#0052ff] py-2 text-[13px] font-bold text-white shadow-lg shadow-[#0052ff]/20 hover:bg-[#0042cc] transition">
          Set Time
        </button>
      </div>
    </div>
  )
}

/* ─── Smart Time Input ──────────────────────────────────────────────────── */
function TimeInput({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const [dialPos, setDialPos] = useState({ top: 0, left: 0 })
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    if (disabled) return
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const dialHeight = 320
      const dialWidth = 260
      let top, left

      if (spaceBelow < dialHeight && rect.top > spaceBelow) {
        top = rect.top - dialHeight - 4
      } else {
        top = rect.bottom + 4
      }

      left = rect.left + rect.width / 2 - dialWidth / 2
      if (left < 8) left = 8
      if (left + dialWidth > window.innerWidth - 8) left = window.innerWidth - dialWidth - 8

      setDialPos({ top, left })
    }
    setOpen(o => !o)
  }

  return (
    <div ref={ref} className="relative flex-1">
      <button onClick={handleOpen} disabled={disabled}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg border text-[13px] font-semibold transition-all h-8 px-2"
        style={disabled
          ? { background: 'transparent', border: '1.5px solid transparent', color: '#475569', cursor: 'default' }
          : { background: '#f0f5ff', border: '1.5px solid #c7dcff', color: '#0052ff', cursor: 'pointer' }}>
        <Clock size={12} style={{ opacity: disabled ? 0.4 : 0.8 }} />
        <span>{value}</span>
      </button>
      {open && <TimeDial label="Select" value={value} onChange={onChange} onClose={() => setOpen(false)} style={{ position: 'fixed', top: dialPos.top, left: dialPos.left }} />}
    </div>
  )
}

/* ─── Avatar ────────────────────────────────────────────────────────────── */
function Avatar({ src, name, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0', flexShrink: 0 }}>
      <img
        src={src || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=e8f0ff&color=0052ff&bold=true`}
        alt={name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=e8f0ff&color=0052ff&bold=true` }}
      />
    </div>
  )
}

/* ─── Toast ─────────────────────────────────────────────────────────────── */
function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: type === 'error' ? '#d32f2f' : '#00a83a',
      color: '#fff', padding: '12px 20px', borderRadius: 14,
      fontSize: 14, fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      animation: 'fadeIn 0.2s ease',
    }}>
      {message}
    </div>
  )
}

/* ─── View Modal ────────────────────────────────────────────────────────── */
function ViewModal({ row, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!row) return null
  const roleStyle = roleTone[row.role] || { bg: '#f1f5f9', color: '#475569' }
  const fields = []

  if (row.type === 'In-house' || row.type === 'Freelancer') {
    fields.push(
      { label: 'Email', value: row.email },
      { label: 'Mobile', value: row.mobile },
      { label: 'Role', value: row.role },
      { label: 'Shift', value: row.shift },
      row.type === 'In-house'
        ? { label: 'CTC', value: row.salary ? `₹${row.salary}` : '—' }
        : { label: 'Hourly Rate', value: row.hourlyRate ? `$${row.hourlyRate}/hr` : '—' },
    )
    if (row.type === 'Freelancer') fields.push({ label: 'Experience', value: row.experience })
    fields.push({ label: 'Timing', value: `${row.startTime} — ${row.endTime}` })
    
    const activeDays = [
      row.monday && 'Mon', row.tuesday && 'Tue', row.wednesday && 'Wed', 
      row.thursday && 'Thu', row.friday && 'Fri', row.saturday && 'Sat', row.sunday && 'Sun'
    ].filter(Boolean).join(', ')
    if (activeDays) fields.push({ label: 'Working Days', value: activeDays })

    if (row.blocked) fields.push({ label: 'Status', value: '🚫 Blocked' })
  } else if (row.type === 'Material') {
    fields.push({ label: 'Unit', value: row.unit }, { label: 'Rate per unit', value: row.rate }, { label: 'Date & Time', value: row.dateTime })
  } else {
    fields.push({ label: 'Cost Amount', value: row.cost }, { label: 'Date & Time', value: row.dateTime })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(14,30,60,0.45)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-[440px] rounded-3xl bg-white overflow-hidden" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.15)', animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ background: 'linear-gradient(135deg, #0052ff 0%, #003adb 100%)' }} className="px-8 py-7 relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition">
            <X size={16} />
          </button>
          <div className="flex items-center gap-4">
            {(row.type === 'In-house' || row.type === 'Freelancer') ? (
              <Avatar src={row.image} name={row.name} size={56} />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Shield size={24} className="text-white" />
              </div>
            )}
            <div>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest">{row.type} Resource</p>
              <h3 className="text-white text-[20px] font-black mt-0.5">{row.name}</h3>
              {row.role && (
                <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  {row.role}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="px-8 py-6 space-y-4">
          {fields.map((f, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[#f1f5f9] last:border-0">
              <span className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">{f.label}</span>
              <span className="text-[14px] font-semibold text-[#1e293b]">{f.value || '—'}</span>
            </div>
          ))}
        </div>
        <div className="px-8 pb-7">
          <button onClick={onClose} className="w-full rounded-xl py-3 text-[14px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0052ff, #003adb)', boxShadow: '0 4px 16px rgba(0,82,255,0.3)' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Edit Modal ────────────────────────────────────────────────────────── */
function EditModal({ row, onClose, onSave }) {
  const [form, setForm] = useState({ ...row })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const set = (k, v) => {
    let next = v
    if (k === 'name') next = nameOnly(v)
    if (k === 'mobile') next = numbersOnly(v).slice(0, 10)
    else if (k === 'salary') next = numbersOnly(v)
    if (k === 'hourlyRate' || k === 'rate' || k === 'cost') next = decimalOnly(v)
    setForm(p => ({ ...p, [k]: next }))
  }

  const inp = "w-full h-10 rounded-xl border border-[#e2e8f0] px-3.5 text-[14px] text-[#1e293b] outline-none transition focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
  const lbl = "block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5"

  const handleSave = async () => {
    if (form.mobile && form.mobile.length !== 10) { alert('Mobile number must be exactly 10 digits'); return }
    setLoading(true)
    try {
      const fd = buildFormData(form, true)
      const res = await fetch(API_ENDPOINTS.UPDATE_RESOURCE, { method: 'POST', body: fd })
      const json = await res.json()
      if (json.success) { onSave(form); onClose() }
      else alert(json.message || 'Update failed')
    } catch (e) {
      alert('Network error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(14,30,60,0.45)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-3xl bg-white" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.15)', animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="sticky top-0 z-10 bg-white border-b border-[#f1f5f9] px-8 py-5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-[18px] font-black text-[#14365c]">Edit Resource</h2>
            <p className="text-[12px] text-[#94a3b8] mt-0.5">{row.type} · {row.name}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] transition">
            <X size={18} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">
          {(form.type === 'In-house' || form.type === 'Freelancer') && (<>
            <div className="flex items-center gap-4">
              <Avatar src={form.image} name={form.name} size={52} />
              <div>
                <label className={lbl}>Profile Photo</label>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-[#0052ff] bg-[#e8f2ff] hover:bg-[#d0e4ff] transition">
                  <Pencil size={13} /> Change Photo
                  <input type="file" className="hidden" accept="image/*" onChange={e => {
                    const f = e.target.files[0]; if (!f) return
                    const r = new FileReader(); r.onloadend = () => set('image', r.result); r.readAsDataURL(f)
                  }} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Name</label><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" /></div>
              <div>
                <label className={lbl}>Role</label>
                <div className="relative">
                  <select className={inp + " appearance-none pr-9 cursor-pointer"} value={form.role} onChange={e => set('role', e.target.value)}>
                    <option value="">Select role</option>
                    {Object.keys(roleTone).map(r => <option key={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Email</label><input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
              <div><label className={lbl}>Mobile</label><input className={inp} value={form.mobile} onChange={e => set('mobile', e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {form.type === 'Freelancer' ? (<>
                <div><label className={lbl}>Experience</label><input className={inp} value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="e.g. 5 Years" /></div>
                <div><label className={lbl}>Hourly Rate ($)</label><input className={inp} type="number" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} /></div>
              </>) : (<>
                <div>
                  <label className={lbl}>Shift</label>
                  <div className="relative">
                    <select className={inp + " appearance-none pr-9 cursor-pointer"} value={form.shift} onChange={e => set('shift', e.target.value)}>
                      <option>Day</option><option>Night</option><option>Both</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                  </div>
                </div>
                <div><label className={lbl}>CTC</label><input className={inp} type="number" value={form.salary} onChange={e => set('salary', e.target.value)} /></div>
              </>)}
            </div>

            <div>
              <label className={lbl}>Timing</label>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="flex-1 relative">
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">Start Time</p>
                  <TimeInput value={form.startTime} onChange={v => set('startTime', v)} disabled={false} />
                </div>
                <div className="text-[#cbd5e1] font-bold mt-5">→</div>
                <div className="flex-1 relative">
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">End Time</p>
                  <TimeInput value={form.endTime} onChange={v => set('endTime', v)} disabled={false} />
                </div>
              </div>
            </div>

            <div>
              <label className={lbl}>Working Days</label>
              <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                {[
                  { key: 'monday', label: 'Mon' },
                  { key: 'tuesday', label: 'Tue' },
                  { key: 'wednesday', label: 'Wed' },
                  { key: 'thursday', label: 'Thu' },
                  { key: 'friday', label: 'Fri' },
                  { key: 'saturday', label: 'Sat' },
                  { key: 'sunday', label: 'Sun' }
                ].map(day => (
                  <label key={day.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-[#cbd5e1] text-[#0052ff] focus:ring-[#0052ff]"
                           checked={form[day.key] || false} onChange={e => set(day.key, e.target.checked)} />
                    <span className="text-[13px] font-semibold text-[#475569]">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>)}

          {form.type === 'Material' && (
            <div className="space-y-4">
              <div><label className={lbl}>Material Name</label><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Unit</label><input className={inp} value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="Kg / Bag" /></div>
                <div><label className={lbl}>Rate per unit</label><input className={inp} type="number" value={form.rate} onChange={e => set('rate', e.target.value)} /></div>
              </div>
            </div>
          )}

          {form.type === 'Cost' && (
            <div className="space-y-4">
              <div><label className={lbl}>Cost Name</label><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} /></div>
              <div><label className={lbl}>Amount</label><input className={inp} type="number" value={form.cost} onChange={e => set('cost', e.target.value)} /></div>
            </div>
          )}
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 rounded-xl py-3 text-[14px] font-bold text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition">Cancel</button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 rounded-xl py-3 text-[14px] font-bold text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0052ff, #003adb)', boxShadow: '0 4px 16px rgba(0,82,255,0.3)', opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Add Resource Modal ────────────────────────────────────────────────── */
function AddResourceModal({ activeTab, onClose, onSave }) {
  const [form, setForm] = useState({
    type: activeTab || 'In-house', name: '', role: '', email: '', mobile: '',
    experience: '', hourlyRate: '', shift: 'Day', salary: '',
    startTime: '09:00 AM', endTime: '06:00 PM',
    unit: '', rate: '', cost: '', image: null,
    monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const set = (k, v) => {
    let next = v
    if (k === 'name') next = nameOnly(v)
    if (k === 'mobile') next = numbersOnly(v).slice(0, 10)
    else if (k === 'salary') next = numbersOnly(v)
    if (k === 'hourlyRate' || k === 'rate' || k === 'cost') next = decimalOnly(v)
    setForm(p => ({ ...p, [k]: next }))
  }

  const inp = "w-full h-10 rounded-xl border border-[#e2e8f0] px-3.5 text-[14px] text-[#1e293b] outline-none transition focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10"
  const lbl = "block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5"

  const handleAdd = async () => {
    if (!form.name.trim()) { alert('Name is required'); return }
    if (form.mobile && form.mobile.length !== 10) { alert('Mobile number must be exactly 10 digits'); return }
    setLoading(true)
    try {
      const fd = buildFormData(form, false)
      const res = await fetch(API_ENDPOINTS.CREATE_RESOURCE, { method: 'POST', body: fd })
      const json = await res.json()
      if (json.success) {
        // Use returned id if provided, else Date.now()
        onSave({ ...form, id: json.id || Date.now(), blocked: false, dateTime: new Date().toLocaleString() })
        onClose()
      } else {
        alert(json.message || 'Create failed')
      }
    } catch (e) {
      alert('Network error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(14,30,60,0.45)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-3xl bg-white" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.15)', animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="sticky top-0 z-10 bg-white border-b border-[#f1f5f9] px-8 py-5 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-[18px] font-black text-[#14365c]">Add New Resource</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] transition"><X size={18} /></button>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div>
            <label className={lbl}>Resource Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['In-house', 'Freelancer', 'Material', 'Cost'].map(t => (
                <button key={t} onClick={() => set('type', t)}
                  className="py-2 rounded-xl text-[13px] font-bold transition-all"
                  style={form.type === t
                    ? { background: '#0052ff', color: '#fff', boxShadow: '0 4px 12px rgba(0,82,255,0.3)' }
                    : { background: '#f1f5f9', color: '#64748b' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {(form.type === 'In-house' || form.type === 'Freelancer') && (<>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-[#e2e8f0] overflow-hidden flex items-center justify-center bg-[#f8fafc]">
                {form.image ? <img src={form.image} className="w-full h-full object-cover" alt="preview" /> : <User size={24} className="text-[#cbd5e1]" />}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-[#0052ff] bg-[#e8f2ff] hover:bg-[#d0e4ff] transition">
                Upload Photo
                <input type="file" className="hidden" accept="image/*" onChange={e => {
                  const f = e.target.files[0]; if (!f) return
                  const r = new FileReader(); r.onloadend = () => set('image', r.result); r.readAsDataURL(f)
                }} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Name</label><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" /></div>
              <div>
                <label className={lbl}>Role</label>
                <div className="relative">
                  <select className={inp + " appearance-none pr-9 cursor-pointer"} value={form.role} onChange={e => set('role', e.target.value)}>
                    <option value="">Select role</option>
                    {Object.keys(roleTone).map(r => <option key={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Email</label><input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" /></div>
              <div><label className={lbl}>Mobile</label><input className={inp} value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="Phone number" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {form.type === 'Freelancer' ? (<>
                <div><label className={lbl}>Experience</label><input className={inp} value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="e.g. 5 Years" /></div>
                <div><label className={lbl}>Hourly Rate ($)</label><input className={inp} type="number" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} placeholder="e.g. 50" /></div>
              </>) : (<>
                <div>
                  <label className={lbl}>Shift</label>
                  <div className="relative">
                    <select className={inp + " appearance-none pr-9 cursor-pointer"} value={form.shift} onChange={e => set('shift', e.target.value)}>
                      <option>Day</option><option>Night</option><option>Both</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                  </div>
                </div>
                <div><label className={lbl}>CTC</label><input className={inp} type="number" value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="e.g. 20000" /></div>
              </>)}
            </div>

            <div>
              <label className={lbl}>Timing</label>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">Start Time</p>
                  <TimeInput value={form.startTime} onChange={v => set('startTime', v)} disabled={false} />
                </div>
                <div className="text-[#cbd5e1] font-bold mt-5">→</div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">End Time</p>
                  <TimeInput value={form.endTime} onChange={v => set('endTime', v)} disabled={false} />
                </div>
              </div>
            </div>

            <div>
              <label className={lbl}>Working Days</label>
              <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                {[
                  { key: 'monday', label: 'Mon' },
                  { key: 'tuesday', label: 'Tue' },
                  { key: 'wednesday', label: 'Wed' },
                  { key: 'thursday', label: 'Thu' },
                  { key: 'friday', label: 'Fri' },
                  { key: 'saturday', label: 'Sat' },
                  { key: 'sunday', label: 'Sun' }
                ].map(day => (
                  <label key={day.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-[#cbd5e1] text-[#0052ff] focus:ring-[#0052ff]"
                           checked={form[day.key] || false} onChange={e => set(day.key, e.target.checked)} />
                    <span className="text-[13px] font-semibold text-[#475569]">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>)}

          {form.type === 'Material' && (
            <div className="space-y-4">
              <div><label className={lbl}>Material Name</label><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter material name" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Unit</label><input className={inp} value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="Kg / Bag" /></div>
                <div><label className={lbl}>Rate per unit</label><input className={inp} type="number" value={form.rate} onChange={e => set('rate', e.target.value)} placeholder="0.00" /></div>
              </div>
            </div>
          )}

          {form.type === 'Cost' && (
            <div className="space-y-4">
              <div><label className={lbl}>Cost Name</label><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter cost name" /></div>
              <div><label className={lbl}>Amount</label><input className={inp} type="number" value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="0.00" /></div>
            </div>
          )}
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 rounded-xl py-3 text-[14px] font-bold text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition">Cancel</button>
          <button onClick={handleAdd} disabled={loading}
            className="flex-1 rounded-xl py-3 text-[14px] font-bold text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0052ff, #003adb)', boxShadow: '0 4px 16px rgba(0,82,255,0.3)', opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Adding…' : 'Add Resource'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Ban Confirm Modal ─────────────────────────────────────────────────── */
function BanModal({ row, onClose, onConfirm }) {
  const isBlocked = row.blocked

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(14,30,60,0.45)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-[380px] rounded-3xl bg-white overflow-hidden" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.15)', animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: isBlocked ? '#e6ffed' : '#fff0f0' }}>
            {isBlocked ? <ShieldOff size={28} style={{ color: '#00a83a' }} /> : <Shield size={28} style={{ color: '#d32f2f' }} />}
          </div>
          <h3 className="text-[18px] font-black text-[#14365c] mb-2">{isBlocked ? 'Unblock Resource?' : 'Block Resource?'}</h3>
          <p className="text-[13px] text-[#64748b] leading-relaxed">
            {isBlocked ? `${row.name} will be unblocked and can access the system again.` : `${row.name} will be blocked and lose access to the system.`}
          </p>
        </div>
        <div className="px-8 pb-8 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl py-3 text-[14px] font-bold text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition">Cancel</button>
          <button onClick={() => { onConfirm(); onClose() }}
            className="flex-1 rounded-xl py-3 text-[14px] font-bold text-white"
            style={isBlocked
              ? { background: 'linear-gradient(135deg, #00cc55, #009933)', boxShadow: '0 4px 16px rgba(0,160,60,0.3)' }
              : { background: 'linear-gradient(135deg, #ff4d4d, #cc0000)', boxShadow: '0 4px 16px rgba(200,0,0,0.25)' }}>
            {isBlocked ? 'Unblock' : 'Block'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function ResourceMasterPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState('In-house')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewRow, setViewRow] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [banRow, setBanRow] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  // ── Responsive hook ──────────────────────────────────────────────────────
  const [winW, setWinW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const isMobile = winW < 1024

  // ── Fetch list from API ──────────────────────────────────────────────────
  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(API_ENDPOINTS.RESOURCE_LIST)
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setRows(json.data.map(mapApiRow))
      }
    } catch (e) {
      showToast('Failed to load resources', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchResources() }, [fetchResources])

  const filtered = useMemo(() => rows.filter(r => r.type === activeTab), [rows, activeTab])

  const saveEdit = (updated) => {
    setRows(p => p.map(r => r.id === updated.id ? updated : r))
    showToast('Resource updated successfully')
  }

  const addRow = (data) => {
    setRows(p => [...p, data])
    showToast('Resource added successfully')
    // Re-fetch to get server-assigned id & image path
    setTimeout(fetchResources, 500)
  }
const toggleBan = async (row) => {
  try {
    const payload = new FormData()
    payload.append("id", row.id)

    // ✅ toggle logic
    payload.append("is_active", row.blocked ? 1 : 0)

    const res = await fetch(API_ENDPOINTS.DEACTIVATE_RESOURCE, {
      method: "POST",
      body: payload,
    })

    const json = await res.json()

    if (json.success) {
      // ✅ update UI
      setRows(prev =>
        prev.map(r =>
          r.id === row.id ? { ...r, blocked: !row.blocked } : r
        )
      )

      showToast(
        row.blocked
          ? "Resource unblocked successfully"
          : "Resource blocked successfully"
      )
    } else {
      showToast(json.message || "Action failed", "error")
    }
  } catch (err) {
    showToast("Network error", "error")
  }
}

  const thClass = "px-6 py-5 text-left text-[11px] font-black uppercase tracking-widest text-[#94a3b8] whitespace-nowrap"

  const actionBtnList = (row) => [
    { key: 'view', icon: <Eye size={14} />, title: 'View', bg: '#e6ffed', color: '#00a83a', hoverBg: '#00a83a', onClick: () => setViewRow(row) },
    { key: 'edit', icon: <Pencil size={14} />, title: 'Edit', bg: '#e8f2ff', color: '#0052ff', hoverBg: '#0052ff', onClick: () => setEditRow(row) },
    { key: 'ban', icon: row.blocked ? <ShieldOff size={14} /> : <Shield size={14} />, title: row.blocked ? 'Unblock' : 'Block',
      bg: row.blocked ? '#e6ffed' : '#fff0f0', color: row.blocked ? '#00a83a' : '#d32f2f',
      hoverBg: row.blocked ? '#00a83a' : '#d32f2f', onClick: () => setBanRow(row) },
  ]

  const ActionBtns = ({ row }) => (
    <td className="px-4 py-4 pr-6">
      <div className="flex items-center justify-center gap-2">
        {actionBtnList(row).map(b => (
          <button key={b.key} onClick={b.onClick} title={b.title}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ background: b.bg, color: b.color }}
            onMouseEnter={e => { e.currentTarget.style.background = b.hoverBg; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = b.bg; e.currentTarget.style.color = b.color }}>
            {b.icon}
          </button>
        ))}
      </div>
    </td>
  )

  const ActionBtnsRow = ({ row }) => (
    <div className="flex items-center gap-2">
      {actionBtnList(row).map(b => (
        <button key={b.key} onClick={b.onClick} title={b.title}
          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
          style={{ background: b.bg, color: b.color }}
          onMouseEnter={e => { e.currentTarget.style.background = b.hoverBg; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = b.bg; e.currentTarget.style.color = b.color }}>
          {b.icon}
        </button>
      ))}
    </div>
  )

  const renderHeaders = () => {
    if (activeTab === 'In-house') return (
      <tr style={{ background: '#f8fbff' }}>
        <th className={thClass + " pl-8"} style={{ width: 80 }}>Sr.</th>
        <th className={thClass} style={{ width: 80 }}>Photo</th>
        <th className={thClass} style={{ width: 220 }}>Name</th>
        <th className={thClass} style={{ width: 260 }}>Email</th>
        <th className={thClass + " text-center"} style={{ width: 160 }}>Role</th>
        <th className={thClass + " text-center"} style={{ width: 100 }}>Shift</th>
        <th className={thClass + " text-center"} style={{ width: 120 }}>CTC</th>
        <th className={thClass + " text-center"} style={{ width: 220 }}>Timing</th>
        <th className={thClass + " text-center"} style={{ width: 200 }}>Working Days</th>
        <th className={thClass + " text-center pr-8"} style={{ width: 160 }}>Actions</th>
      </tr>
    )
    if (activeTab === 'Freelancer') return (
      <tr style={{ background: '#f8fbff' }}>
        <th className={thClass + " pl-8"} style={{ width: 80 }}>Sr.</th>
        <th className={thClass} style={{ width: 80 }}>Photo</th>
        <th className={thClass} style={{ width: 200 }}>Name</th>
        <th className={thClass} style={{ width: 220 }}>Email</th>
        <th className={thClass} style={{ width: 160 }}>Mobile</th>
        <th className={thClass + " text-center"} style={{ width: 160 }}>Role</th>
        <th className={thClass + " text-center"} style={{ width: 80 }}>Exp.</th>
        <th className={thClass + " text-center"} style={{ width: 100 }}>$/hr</th>
        <th className={thClass + " text-center"} style={{ width: 220 }}>Timing</th>
        <th className={thClass + " text-center"} style={{ width: 200 }}>Working Days</th>
        <th className={thClass + " text-center pr-8"} style={{ width: 160 }}>Actions</th>
      </tr>
    )
    if (activeTab === 'Material') return (
      <tr style={{ background: '#f8fbff' }}>
        <th className={thClass + " pl-6 w-14"}>Sr.</th>
        <th className={thClass}>Name</th>
        <th className={thClass}>Unit</th>
        <th className={thClass}>Rate / unit</th>
        <th className={thClass}>Date & Time</th>
        <th className={thClass + " text-center pr-6"}>Actions</th>
      </tr>
    )
    return (
      <tr style={{ background: '#f8fbff' }}>
        <th className={thClass + " pl-6 w-14"}>Sr.</th>
        <th className={thClass}>Name</th>
        <th className={thClass}>Cost</th>
        <th className={thClass}>Date & Time</th>
        <th className={thClass + " text-center pr-6"}>Actions</th>
      </tr>
    )
  }

  const tdBase = "px-6 py-5 text-[13px] text-[#334155]"

  const renderRow = (row, i) => {
    const rs = roleTone[row.role]
    const rowStyle = { borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s', opacity: row.blocked ? 0.6 : 1 }

    const sharedCells = (
      <>
        <td className={tdBase + " pl-8 text-[#94a3b8] font-semibold w-14"}>{i + 1}</td>
        <td className="px-4 py-3 w-12"><Avatar src={row.image} name={row.name} size={38} /></td>
        <td className={tdBase + " font-semibold max-w-[180px] truncate"}>
          <div className="flex items-center gap-2">
            {row.blocked && <span title="Blocked" style={{ color: '#d32f2f', fontSize: 12 }}>🚫</span>}
            {row.name}
          </div>
        </td>
        <td className={tdBase + " text-[#64748b] max-w-[200px] truncate"}>{row.email}</td>
      </>
    )

    if (activeTab === 'In-house') return (
      <tr key={row.id} style={rowStyle} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>
        {sharedCells}
        <td className={tdBase + " text-center"}>
          {rs ? <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-black" style={{ background: rs.bg, color: rs.color }}>{row.role}</span> : <span className="text-[#94a3b8]">—</span>}
        </td>
        <td className={tdBase + " text-center"}><span className="text-[12px] font-semibold">{row.shift}</span></td>
        <td className={tdBase + " text-center font-semibold text-[#14365c]"}>{row.salary ? `₹${row.salary}` : '—'}</td>
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="px-2 py-1 rounded-lg text-[11px] font-semibold" style={{ background: '#f0f5ff', color: '#0052ff' }}>{row.startTime}</span>
            <span className="text-[#cbd5e1] text-[10px]">→</span>
            <span className="px-2 py-1 rounded-lg text-[11px] font-semibold" style={{ background: '#f0f5ff', color: '#0052ff' }}>{row.endTime}</span>
          </div>
        </td>
        <td className={tdBase + " text-center"}>
          <span className="text-[11px] font-bold text-[#64748b]">
            {[
              row.monday && 'M', row.tuesday && 'T', row.wednesday && 'W', 
              row.thursday && 'TH', row.friday && 'F', row.saturday && 'S', row.sunday && 'S'
            ].filter(Boolean).join(',') || '—'}
          </span>
        </td>
        <ActionBtns row={row} />
      </tr>
    )

    if (activeTab === 'Freelancer') return (
      <tr key={row.id} style={rowStyle} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>
        {sharedCells}
        <td className={tdBase + " text-[#64748b]"}>{row.mobile}</td>
        <td className={tdBase + " text-center"}>
          {rs ? <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-black" style={{ background: rs.bg, color: rs.color }}>{row.role}</span> : <span className="text-[#94a3b8]">—</span>}
        </td>
        <td className={tdBase + " text-center font-semibold"}>{row.experience || '—'}</td>
        <td className={tdBase + " text-center font-semibold text-[#14365c]"}>{row.hourlyRate ? `$${row.hourlyRate}` : '—'}</td>
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="px-2 py-1 rounded-lg text-[11px] font-semibold" style={{ background: '#f0f5ff', color: '#0052ff' }}>{row.startTime}</span>
            <span className="text-[#cbd5e1] text-[10px]">→</span>
            <span className="px-2 py-1 rounded-lg text-[11px] font-semibold" style={{ background: '#f0f5ff', color: '#0052ff' }}>{row.endTime}</span>
          </div>
        </td>
        <td className={tdBase + " text-center"}>
          <span className="text-[11px] font-bold text-[#64748b]">
            {[
              row.monday && 'M', row.tuesday && 'T', row.wednesday && 'W', 
              row.thursday && 'TH', row.friday && 'F', row.saturday && 'S', row.sunday && 'S'
            ].filter(Boolean).join(',') || '—'}
          </span>
        </td>
        <ActionBtns row={row} />
      </tr>
    )

    if (activeTab === 'Material') return (
      <tr key={row.id} style={rowStyle} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>
        <td className={tdBase + " pl-6 text-[#94a3b8] font-semibold"}>{i + 1}</td>
        <td className={tdBase + " font-semibold"}>{row.name}</td>
        <td className={tdBase}>{row.unit}</td>
        <td className={tdBase}>{row.rate}</td>
        <td className={tdBase + " text-[#94a3b8]"}>{row.dateTime}</td>
        <ActionBtns row={row} />
      </tr>
    )

    return (
      <tr key={row.id} style={rowStyle} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>
        <td className={tdBase + " pl-6 text-[#94a3b8] font-semibold"}>{i + 1}</td>
        <td className={tdBase + " font-semibold"}>{row.name}</td>
        <td className={tdBase}>{row.cost ? `₹${row.cost}` : '—'}</td>
        <td className={tdBase + " text-[#94a3b8]"}>{row.dateTime}</td>
        <ActionBtns row={row} />
      </tr>
    )
  }

  // ── Card renderer for mobile ──────────────────────────────────────────────
  const renderCard = (row, i) => {
    const rs = roleTone[row.role]
    const isPerson = activeTab === 'In-house' || activeTab === 'Freelancer'

    return (
      <div key={row.id} className="rm-card" style={{ opacity: row.blocked ? 0.65 : 1 }}>
        {/* Card header */}
        <div className="rm-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', flexShrink: 0, width: 22 }}>{i + 1}.</span>
            {isPerson && <Avatar src={row.image} name={row.name} size={38} />}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {row.blocked && <span style={{ color: '#d32f2f', fontSize: 12 }}>🚫</span>}
                <span style={{ fontSize: 14, fontWeight: 700, color: '#14365c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
              </div>
              {isPerson && row.email && <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.email}</p>}
            </div>
          </div>
          <ActionBtnsRow row={row} />
        </div>

        {/* Card body — key-value grid */}
        <div className="rm-card-body">
          {isPerson && (
            <>
              {row.role && (
                <div className="rm-card-field">
                  <span className="rm-card-label">Role</span>
                  {rs
                    ? <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, background: rs.bg, color: rs.color }}>{row.role}</span>
                    : <span className="rm-card-value">{row.role}</span>}
                </div>
              )}
              {activeTab === 'In-house' && (
                <>
                  <div className="rm-card-field">
                    <span className="rm-card-label">Shift</span>
                    <span className="rm-card-value">{row.shift}</span>
                  </div>
                  <div className="rm-card-field">
                    <span className="rm-card-label">CTC</span>
                    <span className="rm-card-value" style={{ fontWeight: 700, color: '#14365c' }}>{row.salary ? `₹${row.salary}` : '—'}</span>
                  </div>
                </>
              )}
              {activeTab === 'Freelancer' && (
                <>
                  <div className="rm-card-field">
                    <span className="rm-card-label">Mobile</span>
                    <span className="rm-card-value">{row.mobile || '—'}</span>
                  </div>
                  <div className="rm-card-field">
                    <span className="rm-card-label">Exp.</span>
                    <span className="rm-card-value">{row.experience || '—'}</span>
                  </div>
                  <div className="rm-card-field">
                    <span className="rm-card-label">$/hr</span>
                    <span className="rm-card-value" style={{ fontWeight: 700, color: '#14365c' }}>{row.hourlyRate ? `$${row.hourlyRate}` : '—'}</span>
                  </div>
                </>
              )}
              <div className="rm-card-field" style={{ gridColumn: '1 / -1' }}>
                <span className="rm-card-label">Timing</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#f0f5ff', color: '#0052ff' }}>{row.startTime}</span>
                  <span style={{ color: '#cbd5e1', fontSize: 10 }}>→</span>
                  <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#f0f5ff', color: '#0052ff' }}>{row.endTime}</span>
                </div>
              </div>
            </>
          )}
          {activeTab === 'Material' && (
            <>
              <div className="rm-card-field"><span className="rm-card-label">Unit</span><span className="rm-card-value">{row.unit || '—'}</span></div>
              <div className="rm-card-field"><span className="rm-card-label">Rate / unit</span><span className="rm-card-value">{row.rate || '—'}</span></div>
              <div className="rm-card-field"><span className="rm-card-label">Date & Time</span><span className="rm-card-value" style={{ fontSize: 11 }}>{row.dateTime}</span></div>
            </>
          )}
          {activeTab === 'Cost' && (
            <>
              <div className="rm-card-field"><span className="rm-card-label">Cost</span><span className="rm-card-value" style={{ fontWeight: 700, color: '#14365c' }}>{row.cost ? `₹${row.cost}` : '—'}</span></div>
              <div className="rm-card-field"><span className="rm-card-label">Date & Time</span><span className="rm-card-value" style={{ fontSize: 11 }}>{row.dateTime}</span></div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fb', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        /* ── Responsive card styles ── */
        .rm-card {
          background: #fff; border: 1px solid #f1f5f9; border-radius: 16px;
          overflow: hidden; transition: box-shadow 0.2s, transform 0.15s;
          animation: fadeIn 0.2s ease;
        }
        .rm-card:hover { box-shadow: 0 4px 20px rgba(0,82,255,0.08); transform: translateY(-1px); }
        .rm-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; gap: 12px; border-bottom: 1px solid #f8fafc;
        }
        .rm-card-body {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px;
          padding: 14px 16px;
        }
        .rm-card-field { display: flex; flex-direction: column; gap: 3px; }
        .rm-card-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.6px; }
        .rm-card-value { font-size: 13px; font-weight: 500; color: #334155; }

        @media (max-width: 639px) {
          .rm-card-body { grid-template-columns: 1fr; }
        }

        /* ── Custom Scrollbar ── */
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '20px 16px' : '40px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', justifyContent: 'space-between', marginBottom: isMobile ? 20 : 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: '#0f1e3d', letterSpacing: '-0.5px', margin: 0 }}>Resource Master</h1>
            {!isMobile && <p style={{ fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: 500 }}>Manage all organizational resources from one place</p>}
          </div>
          <button onClick={() => setShowAdd(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #0052ff, #003adb)', color: '#fff', border: 'none', borderRadius: isMobile ? 12 : 14, padding: isMobile ? '10px 16px' : '12px 22px', fontSize: isMobile ? 13 : 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,82,255,0.3)', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <Plus size={isMobile ? 16 : 18} /> Add Resource
          </button>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: isMobile ? 16 : 24, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {/* Tabs — scrollable on mobile */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #f1f5f9', padding: isMobile ? '0 12px' : '0 32px', overflowX: 'auto' }} className="no-scrollbar">
            {['In-house', 'Freelancer', 'Material', 'Cost'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  position: 'relative', padding: isMobile ? '14px 14px' : '18px 20px', fontSize: isMobile ? 13 : 14, fontWeight: 800,
                  background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s',
                  letterSpacing: '-0.2px', color: activeTab === tab ? '#0052ff' : '#94a3b8',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                {tab}
                {activeTab === tab && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#0052ff', borderRadius: '3px 3px 0 0' }} />}
              </button>
            ))}
          </div>

          {/* Content: Table on desktop, Cards on mobile */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                <Loader2 size={20} className="animate-spin" style={{ color: '#0052ff' }} />
                Loading resources…
              </div>
            </div>
          ) : isMobile ? (
            /* ── Card layout ── */
            <div style={{ padding: '12px 12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.length === 0
                ? <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>No records found</div>
                : filtered.map((row, i) => renderCard(row, i))}
            </div>
          ) : (
            /* ── Table layout ── */
            <div className="overflow-x-auto custom-scrollbar">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1400 }}>
                <thead>{renderHeaders()}</thead>
                <tbody style={{ background: '#fff' }}>
                  {filtered.length === 0
                    ? <tr><td colSpan={10} style={{ padding: '80px 0', textAlign: 'center', color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>No records found</td></tr>
                    : filtered.map((row, i) => renderRow(row, i))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAdd && <AddResourceModal activeTab={activeTab} onClose={() => setShowAdd(false)} onSave={addRow} />}
      {viewRow && <ViewModal row={viewRow} onClose={() => setViewRow(null)} />}
      {editRow && <EditModal row={editRow} onClose={() => setEditRow(null)} onSave={saveEdit} />}
      {banRow && <BanModal 
  row={banRow} 
  onClose={() => setBanRow(null)} 
  onConfirm={() => toggleBan(banRow)} 
 />}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
