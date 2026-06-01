import { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="#666" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 2L4 7l5 5" stroke="#555" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2l5 5-5 5" stroke="#555" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="#bbb" strokeWidth="1.3" />
      <path d="M1.5 6h13" stroke="#bbb" strokeWidth="1.3" />
      <path d="M5 1.5v2M11 1.5v2" stroke="#bbb" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconUpload({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 15V5M8 9l4-4 4 4" stroke="#aaa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 18h18" stroke="#aaa" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M1 4l2.2 2.5L7 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus({ size = 12, color = "#2563eb" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M6 1v10M1 6h10" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2 3.5h10M5.5 3.5v-1a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M4 3.5l.7 7.5h4.6l.7-7.5" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PM_OPTIONS = ["Nathan Roberts", "Albert Flores", "Felicia Reid", "Deanna Curtis"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const PROJECT_TYPE_OPTIONS = ["Website", "Mobile App", "Migration", "Marketing"];
const METHODOLOGY_OPTIONS = ["Agile", "Predictive", "Hybrid"];
const BILLING_OPTIONS = ["No Billing", "Fixed Cost", "Time and Material"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const STEPS = ["Project Details", "Customer Details", "Resource Allocation", "Milestone & Payment"];

const OPTION_FIELDS = [
  { key: "tasksStart", label: "Tasks should start when all predecessors are complete." },
  { key: "noEmail", label: "Do not send email notification for this project." },
  { key: "onTime", label: "Always assume this project is on time and budget." },
  { key: "autoSubscribe", label: "Auto subscribe team members to new discussion topics." },
];

// ─── Utility ─────────────────────────────────────────────────────────────────

function fmt(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) return "";
  return `${String(date.getDate()).padStart(2, "0")} / ${String(date.getMonth() + 1).padStart(2, "0")} / ${date.getFullYear()}`;
}

function addDays(date, days, excludeWeekends) {
  if (!date || !days || isNaN(parseInt(days))) return null;
  let result = new Date(date);
  let added = 0;
  const n = parseInt(days);
  while (added < n) {
    result.setDate(result.getDate() + 1);
    if (excludeWeekends && (result.getDay() === 0 || result.getDay() === 6)) continue;
    added++;
  }
  return result;
}

function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validateMobile(v) { return /^[0-9+\-\s()]{7,15}$/.test(v); }

// ─── Calendar ────────────────────────────────────────────────────────────────

function CalendarPopup({ selectedDate, onSelect, onClose, anchorRef }) {
  const today = new Date();
  const [year, setYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
  const [month, setMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());
  const [position, setPosition] = useState({ top: "calc(100% + 4px)", bottom: "auto" });
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => {
      if (ref.current && !ref.current.contains(e.target) && anchorRef?.current && !anchorRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [onClose, anchorRef]);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const requiredSpace = 300; // Estimated height of calendar popup

      if (spaceBelow < requiredSpace && spaceAbove > spaceBelow) {
        setPosition({ top: "auto", bottom: "calc(100% + 4px)" });
      } else {
        setPosition({ top: "calc(100% + 4px)", bottom: "auto" });
      }
    }
  }, [anchorRef]);

  function nav(d) {
    let m = month + d, y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m); setYear(y);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div ref={ref} style={{
      position: "absolute", zIndex: 9999, top: position.top, bottom: position.bottom, left: 0,
      background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8,
      boxShadow: "0 6px 20px rgba(0,0,0,0.12)", padding: "10px 12px",
      minWidth: 220, fontFamily: "inherit",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button onClick={() => nav(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 4 }}><IconChevronLeft /></button>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#222" }}>{MONTHS[month]} {year}</span>
        <button onClick={() => nav(1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 4 }}><IconChevronRight /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {DAY_NAMES.map(d => <div key={d} style={{ fontSize: 9, fontWeight: 600, color: "#bbb", textAlign: "center", padding: "2px 0" }}>{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const dt = new Date(year, month, d);
          const isSel = selectedDate && dt.toDateString() === selectedDate.toDateString();
          const isToday = dt.toDateString() === today.toDateString();
          return (
            <button key={d} onClick={() => onSelect(new Date(year, month, d))} style={{
              fontSize: 10, textAlign: "center", padding: "4px 2px", borderRadius: 4,
              cursor: "pointer", border: "none", fontFamily: "inherit", width: "100%",
              background: isSel ? "#2563eb" : "transparent",
              color: isSel ? "#fff" : isToday ? "#2563eb" : "#444",
              fontWeight: isToday ? 600 : 400,
            }}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DateInput ────────────────────────────────────────────────────────────────

function DateInput({ value, onChange, placeholder = "DD / MM / YYYY", disabled }) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);
  const ref = useRef(null);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <input readOnly value={value ? fmt(value) : ""} placeholder={placeholder}
        onClick={() => !disabled && setOpen(o => !o)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          ...inputStyle, paddingRight: 36,
          cursor: disabled ? "not-allowed" : "pointer",
          background: disabled ? "#f8f9fa" : "#fff",
          color: disabled ? "#aaa" : value ? "#333" : "#bbb",
          borderColor: focus && !disabled ? "#2563eb" : disabled ? "#eeeff2" : "#dde1e9",
          boxShadow: focus && !disabled ? "0 0 0 3px rgba(37,99,235,0.10)" : "none",
        }} />
      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <IconCalendar size={15} />
      </span>
      {open && !disabled && <CalendarPopup selectedDate={value} anchorRef={ref} onSelect={d => { onChange(d); setOpen(false); }} onClose={() => setOpen(false)} />}
    </div>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const inputStyle = {
  height: 38, width: "100%", border: "1px solid #dde1e9", borderRadius: 6,
  padding: "0 12px", fontSize: 13, fontFamily: "inherit", color: "#333",
  outline: "none", background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s",
};

const labelStyle = { fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 5, display: "block" };
const requiredStar = { color: "#e53e3e", marginLeft: 2 };

function Field({ label, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}{required && <span style={requiredStar}>*</span>}</label>
      {children}
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, type = "text", disabled, error, style = {} }) {
  const [focus, setFocus] = useState(false);
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} type={type} disabled={disabled}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        ...inputStyle, ...style,
        borderColor: error ? "#e53e3e" : focus ? "#2563eb" : disabled ? "#eeeff2" : "#dde1e9",
        boxShadow: focus && !disabled ? "0 0 0 3px rgba(37,99,235,0.10)" : "none",
        background: disabled ? "#f8f9fa" : "#fff",
        color: disabled ? "#aaa" : "#333",
        cursor: disabled ? "not-allowed" : "text",
      }}
    />
  );
}

function StyledSelect({ value, onChange, placeholder, options, style = {} }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select value={value || ""} onChange={onChange}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          ...inputStyle, paddingRight: 32, appearance: "none", WebkitAppearance: "none", cursor: "pointer",
          color: !value ? "#bbb" : "#333", ...style,
          borderColor: focus ? "#2563eb" : "#dde1e9",
          boxShadow: focus ? "0 0 0 3px rgba(37,99,235,0.10)" : "none",
        }}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <IconChevronDown />
      </span>
    </div>
  );
}

function SearchableSelect({ value, onChange, placeholder, options, style = {} }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const toggle = () => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    }
    setOpen(!open);
  };

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div onClick={toggle}
        style={{
          ...inputStyle, ...style,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", color: value ? "#333" : "#bbb",
          borderColor: open ? "#2563eb" : "#dde1e9",
          boxShadow: open ? "0 0 0 3px rgba(37,99,235,0.10)" : "none",
        }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || placeholder}</span>
        <IconChevronDown />
      </div>
      {open && (
        <div style={{
          position: "fixed", top: coords.top - window.scrollY + 4, left: coords.left - window.scrollX, width: coords.width,
          zIndex: 10001, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", padding: 4
        }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..." autoFocus
            style={{ ...inputStyle, height: 32, marginBottom: 4, padding: "0 8px" }} />
          <div style={{ maxHeight: 150, overflowY: "auto" }}>
            {filtered.length > 0 ? filtered.map(o => (
              <div key={o} onClick={() => { onChange(o); setOpen(false); setSearch(""); }}
                style={{ padding: "8px 12px", cursor: "pointer", fontSize: 12, borderRadius: 4, background: value === o ? "#eff6ff" : "transparent", color: value === o ? "#2563eb" : "#333" }}>
                {o}
              </div>
            )) : <div style={{ padding: "8px 12px", fontSize: 11, color: "#94a3b8" }}>No results</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

function BtnPrimary({ onClick, children }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        height: 40, padding: "0 32px", borderRadius: 8, border: "none",
        background: h ? "#1d4ed8" : "#2563eb", color: "#fff",
        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        transition: "background 0.15s",
      }}>{children}</button>
  );
}

function BtnOutline({ onClick, children }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        height: 40, padding: "0 32px", borderRadius: 8, border: "1.5px solid #d1d5db",
        background: h ? "#f9fafb" : "#fff", color: "#374151",
        fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
      }}>{children}</button>
  );
}

// ─── Toast Notification ───────────────────────────────────────────────────────

function Toast({ message, visible, onHide }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div style={{
      position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
      zIndex: 10000, display: "flex", alignItems: "center", gap: 8,
      background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
      padding: "10px 18px", boxShadow: "0 4px 16px rgba(220,38,38,0.12)",
      animation: "toastSlideIn 0.3s ease",
      maxWidth: "90%", whiteSpace: "nowrap",
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.4" />
        <path d="M8 4.5v4" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.8" fill="#ef4444" />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#991b1b" }}>{message}</span>
      <button onClick={onHide} style={{
        background: "none", border: "none", cursor: "pointer", padding: 2,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#f87171", marginLeft: 4,
      }}>
        <IconX />
      </button>
    </div>
  );
}

// ─── Step Tabs (pixel-perfect from screenshot) ────────────────────────────────

function StepTabs({ step, onStepClick }) {
  const pct = ((step - 1) / 3) * 100;
  return (
    <div style={{ padding: "14px 24px 0", borderBottom: "1px solid #e8eaef", background: "#fff", flexShrink: 0 }}>
      <div style={{ position: "relative", maxWidth: 500, margin: "0 auto" }}>
        {/* Track line */}
        <div style={{ position: "absolute", left: "16.666%", right: "16.666%", top: 7, height: 1, background: "#e2e6ec" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", background: "#2563eb", width: `${pct}%`, transition: "width 0.3s ease" }} />
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", paddingBottom: 12 }}>
          {STEPS.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <button key={label} type="button" onClick={() => onStepClick(n)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <span style={{
                  width: 15, height: 15, borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: (active || done) ? "#2563eb" : "#d1d5db",
                  boxShadow: active ? "0 0 0 3px rgba(37,99,235,0.18)" : "none",
                  fontSize: 8, fontWeight: 700, color: "#fff",
                  transition: "background 0.2s, box-shadow 0.2s",
                }}>
                  {done ? <IconCheck /> : n}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  color: active ? "#2563eb" : "#9ca3af",
                  whiteSpace: "nowrap", transition: "color 0.2s",
                }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Upload Box ───────────────────────────────────────────────────────────────

function UploadBox({ files, setFiles }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);
  function handle(list) { setFiles(p => [...p, ...Array.from(list).map(f => f.name)]); }
  return (
    <div>
      <div onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: 90, border: `1.5px dashed ${drag ? "#2563eb" : "#d1d5db"}`,
          borderRadius: 8, background: drag ? "#eff6ff" : "#fafafa",
          cursor: "pointer", gap: 4, transition: "all 0.15s",
        }}>
        <IconUpload size={22} />
        <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>Upload Proposal Document</span>
        <span style={{ fontSize: 11, color: "#aaa" }}>Upload your project proposal here</span>
      </div>
      <input ref={ref} type="file" multiple accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => handle(e.target.files)} />
      {files.map((n, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, fontSize: 11, background: "#f0f4ff", borderRadius: 4, padding: "4px 8px", color: "#444" }}>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n}</span>
          <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 13 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Logo Upload ──────────────────────────────────────────────────────────────

function LogoUpload({ preview, setPreview, setLogoFile }) {
  const ref = useRef(null);
  function handle(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setLogoFile(f);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f);
  }
  return (
    <div onClick={() => ref.current?.click()}
      style={{
        width: 110, height: 110, borderRadius: "50%", border: "1.5px dashed #c9cdd4",
        background: "#fafafa", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", cursor: "pointer",
        overflow: "hidden", position: "relative",
      }}>
      {preview
        ? <img src={preview} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} alt="logo" />
        : (
          <>
            <IconUpload size={22} />
            <span style={{ fontSize: 12, color: "#666", fontWeight: 500, marginTop: 6 }}>Upload Logo</span>
            <span style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>(JPEG/ PNG/ GIF)</span>
          </>
        )}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handle} />
    </div>
  );
}

// ─── Milestone Date Cell ──────────────────────────────────────────────────────

function MsDateInput({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <input readOnly value={value ? fmt(value) : ""} placeholder="Select Date"
        onClick={() => setOpen(o => !o)}
        style={{ ...inputStyle, height: 34, fontSize: 12, paddingRight: 32, cursor: "pointer", borderColor: "#eaecf0", background: "#fff", color: value ? "#333" : "#bbb" }} />
      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <IconCalendar size={13} />
      </span>
      {open && <CalendarPopup selectedDate={value} anchorRef={ref} onSelect={d => { onChange(d); setOpen(false); }} onClose={() => setOpen(false)} />}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function CreateProjectModal({ isOpen = true, onClose, onSave, formValues = {}, editingId = null }) {
  console.log("Rendering CreateProjectModal, isOpen:", isOpen);
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState({ visible: false, message: "" });

  function showToast(message) {
    setToast({ visible: true, message });
  }

  function hideToast() {
    setToast({ visible: false, message: "" });
  }

  function handleStepClick(targetStep) {
    // Clicking the current step — do nothing
    if (targetStep === step) return;

    // Going backward is always allowed
    if (targetStep < step) {
      setStep(targetStep);
      return;
    }

    // Going forward — validate all steps in between
    if (step === 1 && targetStep >= 2) {
      if (!validateStep1()) {
        showToast("Please fill all required fields in Project Details.");
        return;
      }
    }
    if (step <= 2 && targetStep >= 3) {
      if (step === 1 && !validateStep1()) {
        showToast("Please fill all required fields in Project Details.");
        return;
      }
      if (!validateStep2(true)) {
        showToast("Please fill all required fields in Customer Details.");
        return;
      }
    }
    if (step <= 3 && targetStep >= 4) {
      if (step === 1 && !validateStep1()) {
        showToast("Please fill all required fields in Project Details.");
        return;
      }
      if (step <= 2 && !validateStep2(true)) {
        showToast("Please fill all required fields in Customer Details.");
        return;
      }
      if (!validateStep3()) {
        // showToast("Please fill all required fields in Resource Allocation.");
        // return;
      }
    }

    setStep(targetStep);
  }
  const [projectCode, setProjectCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectManagers, setProjectManagers] = useState([]);
  const [techLeads, setTechLeads] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userData, setUserData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const getNormalizedUserType = (user) => {
    const rawType = String(user?.user_type || user?.resource_type || "").toLowerCase().trim();
    if (rawType === "inhouse" || rawType === "in-house") return "inhouse";
    if (rawType === "freelancer") return "freelancer";
    return "";
  };
  const getDisplayNameWithType = (user) => {
    const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const userType = getNormalizedUserType(user);
    const typeLabel = userType === "inhouse" ? "(In-house)" : userType === "freelancer" ? "(Freelancer)" : "";
    return typeLabel ? `${name} ${typeLabel}` : name;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchManagers();
      fetchResources();
    }
  }, [isOpen]);

  async function fetchResources() {
    try {
      const response = await fetch(API_ENDPOINTS.RESOURCE_LIST);
      const data = await response.json();
      if (data.success) {
        const rawResources = data.data || [];
        setResourceData(rawResources);

        // Extract PMs and Tech Leads from Resource Master
        const resPMs = rawResources
          .filter(r => r.role && String(r.role).toLowerCase() === "project manager")
          .map(r => r.name);
        const resTLs = rawResources
          .filter(r => r.role && (String(r.role).toLowerCase() === "tech lead" || String(r.role).toLowerCase() === "technical lead"))
          .map(r => r.name);

        setProjectManagers(prev => [...new Set([...prev, ...resPMs])]);
        setTechLeads(prev => [...new Set([...prev, ...resTLs])]);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  }

  async function fetchManagers() {
    try {
      const response = await fetch(API_ENDPOINTS.RESOURCE_LIST);
      const data = await response.json();
      console.log("Raw Resource List:", data);
      const rawUsers = data.data || data;
      if (Array.isArray(rawUsers)) {
        const pmNames = rawUsers
          .filter(user => user.role && user.role.toLowerCase().trim() === 'project manager')
          .map(getDisplayNameWithType)
          .filter(name => name.length > 0);
        
        const tlNames = rawUsers
          .filter(user => user.role && (user.role.toLowerCase().trim() === 'tech lead' || user.role.toLowerCase().trim() === 'technical lead'))
          .map(getDisplayNameWithType)
          .filter(name => name.length > 0);
          
        console.log("Filtered Managers:", pmNames);
        setProjectManagers(pmNames);
        setTechLeads(tlNames);
        setAllUsers(rawUsers.map(user => {
          const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
          return name;
        }).filter(name => name.length > 0));
        setUserData(rawUsers);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  }

  // Step 1
  const [projectName, setProjectName] = useState("");
  const [contractDate, setContractDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [duration, setDuration] = useState("");
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [pm, setPm] = useState("");

  // Holiday check state
  const [endDateFromApi, setEndDateFromApi] = useState(null);
  const [holidaysSkipped, setHolidaysSkipped] = useState([]);
  const [holidayCheckLoading, setHolidayCheckLoading] = useState(false);
  const holidayCheckTimer = useRef(null);
  const [techLead, setTechLead] = useState("");
  const [technology, setTechnology] = useState("");
  const [projectType, setProjectType] = useState("");
  const [priority, setPriority] = useState("");
  const [methodology, setMethodology] = useState("");
  const [scope, setScope] = useState("");
  const [files, setFiles] = useState([]);

  // Step 2
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [persons, setPersons] = useState([{ name: "", role: "", mobile: "", email: "" }]);
  const [pErrors, setPErrors] = useState([{}]);

  // Step 3 (New: Resource Allocation)
  const [allocations, setAllocations] = useState([
    { type: "In-house", rows: [{ role: "", resourceName: "", allocation: "", workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }] },
    { type: "Cost", rows: [{ name: "", amount: "" }] }
  ]);
  const [showAddResourceType, setShowAddResourceType] = useState(false);

  const getDefaultRow = (type) => {
    if (type === "In-house" || type === "Freelancer") {
      return { role: "", resourceName: "", allocation: "", workingDays: [] };
    } else if (type === "Cost") {
      return { name: "", amount: "" };
    } else if (type === "Material") {
      return { name: "", unit: "", quantity: "1", rate: "0", total: "0" };
    }
    return {};
  };

  const MATERIAL_OPTIONS = [
    { name: "Cement", unit: "Bag", rate: 450 },
    { name: "Steel", unit: "Kg", rate: 70 },
    { name: "Bricks", unit: "Unit", rate: 10 },
    { name: "Sand", unit: "Cu.m", rate: 1200 },
  ];

  const addAllocation = (type) => {
    if (allocations.some(a => a.type === type)) {
      showToast(`${type} section already exists.`);
      setShowAddResourceType(false);
      return;
    }
    setAllocations(p => [...p, { type, rows: [getDefaultRow(type)] }]);
    setShowAddResourceType(false);
  };

  const removeAllocation = (index) => {
    setAllocations(p => p.filter((_, i) => i !== index));
  };

  const addRowToAllocation = (index) => {
    setAllocations(p => p.map((a, i) => i === index ? { ...a, rows: [...a.rows, getDefaultRow(a.type)] } : a));
  };

  const removeRowFromAllocation = (allocIndex, rowIndex) => {
    setAllocations(p => p.map((a, i) => i === allocIndex ? { ...a, rows: a.rows.filter((_, j) => j !== rowIndex) } : a));
  };

  const updateAllocationRow = (allocIndex, rowIndex, key, value) => {
    setAllocations(p => p.map((a, i) => i === allocIndex ? {
      ...a,
      rows: a.rows.map((r, j) => j === rowIndex ? {
        ...r,
        [key]: value,
        ...(a.type === "Material" && (key === "quantity" || key === "rate") ? {
          total: String((parseFloat(key === "quantity" ? value : r.quantity) || 0) * (parseFloat(key === "rate" ? value : r.rate) || 0))
        } : {}),
        ...(a.type === "Material" && key === "name" ? (() => {
          // Check Resource Master data first
          const res = resourceData.find(r => r.name === value && r.resource_type.toLowerCase() === "material");
          if (res) return { unit: res.unit_bag_kg, rate: String(res.rate_per_unit), total: String((parseFloat(r.quantity) || 0) * res.rate_per_unit) };
          
          // Fallback to MATERIAL_OPTIONS
          const mat = MATERIAL_OPTIONS.find(m => m.name === value);
          if (mat) return { unit: mat.unit, rate: String(mat.rate), total: String((parseFloat(r.quantity) || 0) * mat.rate) };
          return {};
        })() : {}),
        ...(a.type === "Cost" && key === "name" ? (() => {
          const res = resourceData.find(r => r.name === value && r.resource_type.toLowerCase() === "cost");
          if (res) return { amount: String(res.cost) };
          return {};
        })() : {})
      } : r)
    } : a));
  };

  const toggleDay = (allocIndex, rowIndex, day) => {
    setAllocations(p => p.map((a, i) => i === allocIndex ? {
      ...a,
      rows: a.rows.map((r, j) => j === rowIndex ? {
        ...r,
        workingDays: r.workingDays.includes(day)
          ? r.workingDays.filter(d => d !== day)
          : [...r.workingDays, day]
      } : r)
    } : a));
  };

  // Step 4 (Previous Step 3)
  const [milestones, setMilestones] = useState([{ name: "BRD Sign-off", date: null, pct: "" }]);
  const [budget, setBudget] = useState("");
  const [billing, setBilling] = useState("No Billing");
  const [opts, setOpts] = useState({ tasksStart: false, noEmail: false, onTime: false, autoSubscribe: false });

  // Use a ref to track if we've initialized for the current "open" session
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      const parseDateSafe = (val) => {
        if (!val) return null;
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? null : parsed;
      };

      setProjectName(formValues.name || "");
      setContractDate(parseDateSafe(formValues.contractDate));
      setStartDate(parseDateSafe(formValues.plannedStartDate));
      setDuration(formValues.duration || "");
      setPm(formValues.pm || "");
      setTechLead(formValues.techLead || formValues.technical_lead || "");
      setTechnology(formValues.technology || "");
      setProjectType(formValues.projectType || "");
      setPriority(formValues.priority || "");
      setMethodology(formValues.methodology || "");
      setScope(formValues.description || "");
      setCompanyName(formValues.clientName || formValues.companyName || "");
      setLocation(formValues.location || "");
      setBudget(formValues.budget || "");
      setBilling(formValues.billing || "No Billing");

      if (Array.isArray(formValues.persons)) setPersons(formValues.persons);
      if (Array.isArray(formValues.milestones)) setMilestones(formValues.milestones);
      if (Array.isArray(formValues.resource_allocations) && formValues.resource_allocations.length > 0) {
        setAllocations(formValues.resource_allocations);
      } else {
        setAllocations([
          { type: "In-house", rows: [{ role: "", resourceName: "", allocation: "", workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }] },
          { type: "Cost", rows: [{ name: "", amount: "" }] }
        ]);
      }
      if (formValues.options) setOpts(formValues.options);

      setStep(1);

      // Fetch Project Code
      if (!formValues.projectCode) {
        setProjectCode(""); // Clear while fetching
        fetch(API_ENDPOINTS.CREATE_PROJECT_API, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
          .then(res => res.json())
          .then(data => {
            const code = data.project_code || (data.data && data.data.project_code);
            if (code) setProjectCode(code);
          })
          .catch(err => {
            console.error("Error fetching project code:", err);
            setProjectCode("P-" + Math.floor(Math.random() * 1000000).toString().padStart(7, '0'));
          });
      } else {
        setProjectCode(formValues.projectCode);
      }

      hasInitialized.current = true;
    } else if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen, formValues]);
  useEffect(() => {
    if (!isOpen) return;
    const h = e => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  // Resolve PM and Tech Lead display names from userData (which fetches asynchronously)
  useEffect(() => {
    if (isOpen && userData.length > 0) {
      const resolveUserName = (val) => {
        if (!val) return "";
        const user = userData.find(u => 
          String(u.id) === String(val) || 
          String(u.user_id) === String(val) || 
          u.name === val || 
          `${u.first_name || ''} ${u.last_name || ''}`.trim() === val
        );
        if (user) {
          return getDisplayNameWithType(user);
        }
        return val;
      };

      if (formValues.pm) {
        setPm(resolveUserName(formValues.pm));
      }
      const tlVal = formValues.techLead || formValues.technical_lead;
      if (tlVal) {
        setTechLead(resolveUserName(tlVal));
      }
    }
  }, [isOpen, userData, formValues]);

  // ── Holiday API check ────────────────────────────────────────────────────────
  useEffect(() => {
    // Clear previous timer
    if (holidayCheckTimer.current) clearTimeout(holidayCheckTimer.current);

    if (!startDate || !duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      setEndDateFromApi(null);
      setHolidaysSkipped([]);
      return;
    }

    // Debounce 400 ms so we don't fire on every keystroke
    holidayCheckTimer.current = setTimeout(async () => {
      setHolidayCheckLoading(true);
      try {
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, "0");
        const day = String(startDate.getDate()).padStart(2, "0");
        const startStr = `${year}-${month}-${day}`;
        
        const url = `${API_ENDPOINTS.CHECK_HOLIDAYS}?start_date=${startStr}&duration=${duration}&exclude_weekends=${excludeWeekends ? 1 : 0}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          const [yr, mo, dy] = data.end_date.split("-").map(Number);
          setEndDateFromApi(new Date(yr, mo - 1, dy));
          setHolidaysSkipped(data.holidays_skipped || []);
        }
      } catch (err) {
        console.error("Holiday check failed:", err);
        // Fallback to local calculation
        setEndDateFromApi(addDays(startDate, duration, excludeWeekends));
        setHolidaysSkipped([]);
      } finally {
        setHolidayCheckLoading(false);
      }
    }, 400);

    return () => clearTimeout(holidayCheckTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, duration, excludeWeekends]);

  if (!isOpen) return null;

  // Use API-computed end date (with holidays), fall back to local calc
  const endDate = endDateFromApi ?? (startDate && duration ? addDays(startDate, duration, excludeWeekends) : null);

  function addPerson() {
    setPersons(p => [...p, { name: "", role: "", mobile: "", email: "" }]);
    setPErrors(e => [...e, {}]);
  }
  function removePerson(i) {
    setPersons(p => p.filter((_, j) => j !== i));
    setPErrors(e => e.filter((_, j) => j !== i));
  }
  function updatePerson(i, k, v) {
    setPersons(p => p.map((x, j) => j === i ? { ...x, [k]: v } : x));
    setPErrors(e => e.map((x, j) => j === i ? { ...x, [k]: undefined } : x));
  }
  // Helper to check validity without setting state (prevents render loops)
  function checkPersonsValid() {
    return persons.every(p =>
      p.name && String(p.name).trim() &&
      p.role && String(p.role).trim() &&
      p.mobile && String(p.mobile).trim() && validateMobile(p.mobile) &&
      p.email && String(p.email).trim() && validateEmail(p.email)
    );
  }

  function validatePersons() {
    const errs = persons.map(p => {
      const e = {};
      if (!p.name || !String(p.name).trim()) e.name = "Required";
      if (!p.role || !String(p.role).trim()) e.role = "Required";
      if (!p.mobile || !String(p.mobile).trim()) e.mobile = "Required"; else if (!validateMobile(p.mobile)) e.mobile = "Invalid";
      if (!p.email || !String(p.email).trim()) e.email = "Required"; else if (!validateEmail(p.email)) e.email = "Invalid email";
      return e;
    });
    setPErrors(errs);
    return errs.every(e => !Object.keys(e).length);
  }

  function addMilestone() { setMilestones(m => [...m, { name: "", date: null, pct: "" }]); }
  function removeMilestone(i) { setMilestones(m => m.filter((_, j) => j !== i)); }
  function updateMs(i, k, v) { setMilestones(m => m.map((x, j) => j === i ? { ...x, [k]: v } : x)); }

  function validateStep1() {
    const isNameValid = !!(projectName && String(projectName).trim());
    const isContractDateValid = !!contractDate;
    const isStartDateValid = !!startDate;
    const isDurationValid = duration !== "" && duration !== null;
    const isPmValid = !!pm;
    const isTechnologyValid = !!(technology && String(technology).trim());
    const isProjectTypeValid = !!projectType;
    const isMethodologyValid = !!methodology;

    const isValid = isNameValid && isContractDateValid && isStartDateValid && isDurationValid && isPmValid && isTechnologyValid && isProjectTypeValid && isMethodologyValid;

    if (!isValid) {
      console.log("Step 1 Validation Failed:", {
        isNameValid, isContractDateValid, isStartDateValid, isDurationValid, isPmValid, isTechnologyValid, isProjectTypeValid, isMethodologyValid
      });
    }
    return isValid;
  }

  function validateStep2(showErrors = false) {
    if (showErrors) {
      const isCompanyValid = !!(companyName && String(companyName).trim());
      const arePersonsValid = validatePersons();
      return isCompanyValid && arePersonsValid;
    }
    return !!(companyName && String(companyName).trim()) && checkPersonsValid();
  }

  function validateStep3() {
    // Resource Allocation validation - currently optional
    return true;
  }

  function validateStep4() {
    // 1. Billing is required
    if (!billing) return false;

    // 2. Each started row must be complete (Name + Pct)
    const msRowsValid = milestones.every(m => {
      const isStarted = m.name.trim() || m.date || m.pct;
      if (!isStarted) return true;
      return m.name.trim() && m.pct;
    });
    if (!msRowsValid) return false;

    // 3. Total Percentage must be exactly 100
    const totalPct = milestones.reduce((sum, m) => sum + (parseInt(m.pct) || 0), 0);
    return totalPct === 100;
  }

  async function handleSubmit() {
    if (!validateStep4()) {
      alert("Please fill all required fields in the Milestone section.");
      return;
    }
    setIsLoading(true);

    // Create FormData for form-data submission
    const formData = new FormData();

    if (editingId) {
      formData.append("project_id", editingId);
    }

    formData.append("project_code", projectCode);
    formData.append("project_name", projectName || null);
    formData.append("contact_sign_date", contractDate ? contractDate.toISOString().split('T')[0] : null);
    formData.append("start_date", startDate ? startDate.toISOString().split('T')[0] : null);
    formData.append("end_date", endDate ? endDate.toISOString().split('T')[0] : null);
    formData.append("duration", duration || null);
    const getUserId = (val) => {
      if (!val) return null;
      const user = userData.find(u => {
        const name = (u.name || `${u.first_name || ''} ${u.last_name || ''}`).trim();
        const normalizedType = getNormalizedUserType(u);
        const type = normalizedType === 'inhouse' ? '(In-house)' : normalizedType === 'freelancer' ? '(Freelancer)' : '';
        return `${name} ${type}` === val || name === val || String(u.id) === String(val) || String(u.user_id) === String(val);
      });
      if (user) return user.id || user.user_id;
      if (!isNaN(val) && String(val).trim() !== "") return val;
      return null;
    };

    const getCleanName = (val) => {
      if (!val) return null;
      return val.replace(/\s*\((In-house|Freelancer)\)\s*$/i, "").trim();
    };

    const pmId = getUserId(pm);
    if (pmId) formData.append("pm_id", pmId);
    formData.append("project_manager", getCleanName(pm) || null);
    
    const tlId = getUserId(techLead);
    if (tlId) formData.append("technical_lead", tlId);
    
    formData.append("technology", technology || null);
    formData.append("project_type", projectType || null);
    formData.append("priority", priority || null);
    formData.append("methodology", methodology || null);
    formData.append("project_scope", scope || null);
    formData.append("company_name", companyName || null);
    formData.append("location", location || null);
    formData.append("budget", budget || null);
    formData.append("no_billing", billing || null);

    // Handle File upload
    if (files && files.length > 0) {
      formData.append("upload_personal_document", files[0]);
    } else {
      formData.append("upload_personal_document", null);
    }

    if (logoFile) {
      formData.append("company_logo", logoFile);
    } else {
      formData.append("company_logo", null);
    }

    // Stringify arrays for form-data (JSON can handle actual nulls)
    formData.append("contacts", JSON.stringify(persons.map(p => ({
      person_name: p.name || null,
      role: p.role || null,
      mobile: p.mobile || null,
      email: p.email || null
    }))));

    formData.append("milestones", JSON.stringify(milestones.map(m => ({
      milestone: m.name || null,
      milestone_date: m.date ? m.date.toISOString().split('T')[0] : null,
      percentage: parseInt(m.pct) || 0
    }))));

    const formattedAllocations = allocations.map(alloc => {
      if (alloc.type === "In-house" || alloc.type === "Freelancer") {
        return {
          ...alloc,
          rows: alloc.rows.map(row => {
            const user = userData.find(u => {
              const uName = (u.name || `${u.first_name || ''} ${u.last_name || ''}`).trim();
              return uName === row.resourceName;
            });
            const userId = user ? (user.id || user.user_id || null) : null;
            
            // Include row-level id and pm_id for API compatibility
            const rowId = row.id ?? userId;
            const rowPmId = row.pm_id ?? (row.role === "Project Manager" ? userId : pmId ?? null);

            if (row.role === "Project Manager") {
              return { ...row, id: rowId, pm_id: rowPmId };
            } else if (row.role === "Tech Lead" || row.role === "Technical Lead") {
              return { ...row, id: rowId, pm_id: rowPmId, tl_id: userId, technical_lead_id: userId };
            } else {
              return { ...row, id: rowId, pm_id: rowPmId, resource_id: userId };
            }
          })
        };
      }
      return alloc;
    });

    formData.append("resource_allocations", JSON.stringify(formattedAllocations));

    try {
      const url = editingId ? API_ENDPOINTS.UPDATE_PROJECT : API_ENDPOINTS.ADD_PROJECT;
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (data.success) {
          alert(data.message || (editingId ? "Project updated successfully" : "Project created successfully"));
          onSave?.({ ...Object.fromEntries(formData), id: editingId || Date.now() });
          onClose();
        } else {
          alert(data.message || (editingId ? "Failed to update project" : "Failed to create project"));
        }
      } else {
        // If not JSON, it might be an HTML error page
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        alert(`Server Error: ${response.status}. Please check console for details.`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred during submission. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12px", background: "rgba(0,0,0,0.65)", fontFamily: "'Inter',system-ui,sans-serif", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
      <div style={{
        position: "relative", width: 580, maxWidth: "100%", borderRadius: 12,
        background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 24px)", overflow: "hidden",
      }}>

        {/* ── Header ── */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 48, background: "linear-gradient(135deg,#e8f0ff 0%,#eef4ff 100%)", borderBottom: "1px solid #dae4f8", flexShrink: 0 }}>
          <div style={{ width: 28 }} />
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1a2e", letterSpacing: "0.01em" }}>Create Project</h2>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconX />
          </button>
        </header>

        {/* ── Step Tabs ── */}
        <StepTabs step={step} onStepClick={handleStepClick} />

        {/* ── Toast Notification ── */}
        <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

          {/* ════ Step 1: Project Detail ════ */}
          {step === 1 && (
            <div style={{ padding: "20px 24px 28px" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px] sm:gap-x-5">

                {/* Row 1 */}
                <Field label="Project Code" required>
                  <StyledInput value={projectCode} disabled placeholder="Fetching..." />
                </Field>
                <Field label="Project Name" required>
                  <StyledInput value={projectName} onChange={e => setProjectName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))} placeholder="Enter project name" />
                </Field>

                {/* Row 2 */}
                <Field label="Contract Signed Date" required>
                  <DateInput value={contractDate} onChange={setContractDate} placeholder="Enter contract signed date" />
                </Field>

                {/* Start Date + weekend radios underneath */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Start Date<span style={requiredStar}>*</span></label>
                  <DateInput value={startDate} onChange={setStartDate} placeholder="Enter start date" />
                  <div style={{ display: "flex", gap: 16, marginTop: 7 }}>
                    {[{ val: false, label: "Included(Sat-Sun)" }, { val: true, label: "Exclude(Sat-Sun)" }].map(opt => (
                      <label key={opt.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#666", cursor: "pointer" }}>
                        <div onClick={() => setExcludeWeekends(opt.val)}
                          style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${excludeWeekends === opt.val ? "#2563eb" : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, background: "#fff" }}>
                          {excludeWeekends === opt.val && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />}
                        </div>
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Row 3 */}
                <Field label="End Date">
                  <div style={{ position: "relative" }}>
                    <DateInput value={endDate} onChange={() => { }} placeholder="End date" disabled />
                    {holidayCheckLoading && (
                      <span style={{ position: "absolute", right: 38, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#2563eb" }}>⟳</span>
                    )}
                  </div>
                </Field>
                <Field label="Duration (In Days)" required>
                  <StyledInput
                    value={duration}
                    onChange={e => setDuration(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter Duration (In Days)"
                    type="text"
                  />
                </Field>

                {/* Holiday Warning Banner */}
                {holidaysSkipped.length > 0 && (
                  <div style={{
                    gridColumn: "1 / -1",
                    background: "#fffbeb", border: "1px solid #fcd34d",
                    borderRadius: 8, padding: "10px 14px",
                    display: "flex", flexDirection: "column", gap: 4,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>🗓️</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>
                        {holidaysSkipped.length} holiday{holidaysSkipped.length > 1 ? "s" : ""} found — end date adjusted
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", marginTop: 2 }}>
                      {holidaysSkipped.map((h, i) => (
                        <span key={i} style={{
                          fontSize: 11, color: "#78350f",
                          background: "#fef3c7", borderRadius: 4,
                          padding: "2px 7px",
                        }}>
                          {h.date} · {h.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Row 4 */}
                <Field label="Project Manager" required>
                  <StyledSelect value={pm} onChange={e => setPm(e.target.value)} placeholder="Select project manager" options={projectManagers} />
                </Field>
                <Field label="Technical Lead">
                  <StyledSelect value={techLead} onChange={e => setTechLead(e.target.value)} placeholder="Select technical lead" options={techLeads} />
                </Field>

                {/* Row 4.5 */}
                <Field label="Technology" required>
                  <StyledInput value={technology} onChange={e => setTechnology(e.target.value)} placeholder="Enter technology" type="text" />
                </Field>
                <Field label="Project Type" required>
                  <StyledSelect value={projectType} onChange={e => setProjectType(e.target.value)} placeholder="Select project type" options={PROJECT_TYPE_OPTIONS} />
                </Field>

                {/* Row 5 */}
                <Field label="Priority">
                  <StyledSelect value={priority} onChange={e => setPriority(e.target.value)} placeholder="Enter priority" options={PRIORITY_OPTIONS} />
                </Field>
                <Field label="Methodology" required>
                  <StyledSelect value={methodology} onChange={e => setMethodology(e.target.value)} placeholder="Select Methodology" options={METHODOLOGY_OPTIONS} />
                </Field>

                {/* Row 6 — Scope textarea (left) + Upload (right) */}
                <Field label="Project Scope">
                  <textarea value={scope} onChange={e => setScope(e.target.value)} placeholder="Enter project scope" rows={4}
                    style={{ ...inputStyle, height: "auto", padding: "8px 12px", resize: "none", lineHeight: 1.5 }} />
                </Field>
                <Field label="Upload Proposal Document">
                  <UploadBox files={files} setFiles={setFiles} />
                </Field>

              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) {
                      console.log("Moving to Step 2");
                      setStep(2);
                    }
                  }}
                  disabled={!validateStep1()}
                  style={{
                    height: 40, padding: "0 32px", borderRadius: 8, border: "none",
                    background: !validateStep1() ? "#cbd5e1" : "#2563eb",
                    color: "#fff",
                    fontSize: 13, fontWeight: 600, cursor: !validateStep1() ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ════ Step 2: Customer Details ════ */}
          {step === 2 && (
            <div style={{ padding: "20px 24px 28px" }}>

              {/* Logo */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }}>
                <span style={{ ...labelStyle, textAlign: "center" }}>Company Logo</span>
                <LogoUpload preview={logo} setPreview={setLogo} setLogoFile={setLogoFile} />
              </div>

              {/* Company Name + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px] sm:gap-x-5 mb-[14px]">
                <Field label="Company Name" required>
                  <StyledInput value={companyName} onChange={e => setCompanyName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))} placeholder="Enter Company name" />
                </Field>
                <Field label="Location">
                  <StyledInput value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter location" />
                </Field>
              </div>

              {/* Dynamic persons — each shows Person Name / Role / Mobile / Email as 2-col grid */}
              {persons.map((p, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                    <Field label="Person Name" required>
                      <StyledInput value={p.name} onChange={e => updatePerson(i, "name", e.target.value.replace(/[^a-zA-Z\s]/g, ""))} placeholder="Enter person name" error={!!pErrors[i]?.name} />
                      {pErrors[i]?.name && <span style={{ fontSize: 10, color: "#e53e3e", marginTop: 2, display: "block" }}>{pErrors[i].name}</span>}
                    </Field>
                    <Field label="Role" required>
                      <StyledInput value={p.role} onChange={e => updatePerson(i, "role", e.target.value)} placeholder="Enter role" error={!!pErrors[i]?.role} />
                      {pErrors[i]?.role && <span style={{ fontSize: 10, color: "#e53e3e", marginTop: 2, display: "block" }}>{pErrors[i].role}</span>}
                    </Field>
                    <Field label="Mobile Number" required>
                      <StyledInput value={p.mobile} onChange={e => updatePerson(i, "mobile", e.target.value.replace(/[^0-9]/g, "").slice(0, 10))} placeholder="Enter mobile number" type="text" error={!!pErrors[i]?.mobile} />
                      {pErrors[i]?.mobile && <span style={{ fontSize: 10, color: "#e53e3e", marginTop: 2, display: "block" }}>{pErrors[i].mobile}</span>}
                    </Field>
                    <Field label="Email ID" required>
                      <StyledInput value={p.email} onChange={e => updatePerson(i, "email", e.target.value)} placeholder="Enter email id" type="email" error={!!pErrors[i]?.email} />
                      {pErrors[i]?.email && <span style={{ fontSize: 10, color: "#e53e3e", marginTop: 2, display: "block" }}>{pErrors[i].email}</span>}
                    </Field>
                  </div>
                  {persons.length > 1 && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                      <button onClick={() => removePerson(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#f87171", fontSize: 11 }}>
                        <IconTrash size={13} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* + Add Person button — right aligned, matching screenshot */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                <button onClick={addPerson}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#2563eb", fontFamily: "inherit" }}>
                  <IconPlus size={11} /> Add Person
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 28 }}>
                <BtnOutline onClick={() => setStep(1)}>Back</BtnOutline>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2(true)) {
                      console.log("Moving to Step 3");
                      setStep(3);
                    }
                  }}
                  disabled={!validateStep2(false)}
                  style={{
                    height: 40, padding: "0 32px", borderRadius: 8, border: "none",
                    background: !validateStep2(false) ? "#cbd5e1" : "#2563eb",
                    color: "#fff",
                    fontSize: 13, fontWeight: 600, cursor: !validateStep2(false) ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ════ Step 3: Resource Allocation ════ */}
          {step === 3 && (
            <div style={{ padding: "20px 24px 28px" }}>
              {allocations.map((alloc, aIdx) => (
                <div key={aIdx} style={{ marginBottom: 24, border: "1px solid #eef0f5", borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#f8faff", borderBottom: "1px solid #eef0f5" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ background: "#2563eb", color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                        {alloc.type}
                      </div>
                      <IconChevronDown />
                    </div>
                    <button onClick={() => removeAllocation(aIdx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                      <IconTrash size={14} />
                    </button>
                  </div>

                  <div style={{ padding: "0 0 12px", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                      <thead>
                        <tr style={{ background: "#f8f9fb" }}>
                          <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#64748b", width: 50 }}>Sr.no</th>
                          {(alloc.type === "In-house" || alloc.type === "Freelancer") && (
                            <>
                              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b", width: 140 }}>Role</th>
                              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b", width: 180 }}>Resource Name</th>
                              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b", width: 100 }}>Allocation%</th>
                              <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b" }}>Working Days</th>
                            </>
                          )}
                          {alloc.type === "Cost" && (
                            <>
                              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b" }}>Name</th>
                              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b" }}>Amount</th>
                            </>
                          )}
                          {alloc.type === "Material" && (
                            <>
                              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b" }}>Material Name</th>
                              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b" }}>Unit</th>
                              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b" }}>Quantity</th>
                              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b" }}>Rate</th>
                              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#64748b" }}>Total</th>
                            </>
                          )}
                          <th style={{ width: 40 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {alloc.rows.map((row, rIdx) => {
                          const filteredPeople = userData.filter(u => {
                            const userType = getNormalizedUserType(u);
                            const isType = alloc.type === "In-house" ? userType === "inhouse" : userType === "freelancer";
                            const isRole = row.role ? (u.role && u.role.toLowerCase() === row.role.toLowerCase()) : true;
                            return isType && isRole;
                          }).map(u => u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim());

                          return (
                            <tr key={rIdx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "10px 16px", fontSize: 12, color: "#64748b" }}>{rIdx + 1}.</td>
                              {(alloc.type === "In-house" || alloc.type === "Freelancer") && (
                                <>
                                  <td style={{ padding: "8px 4px" }}>
                                    <StyledSelect value={row.role} onChange={e => updateAllocationRow(aIdx, rIdx, "role", e.target.value)} placeholder="Select Role" options={["Project Manager", "Tech Lead", "Tester", "Architect", "Developer"]} style={{ height: 32, fontSize: 11 }} />
                                  </td>
                                  <td style={{ padding: "8px 4px" }}>
                                    <SearchableSelect value={row.resourceName} onChange={v => updateAllocationRow(aIdx, rIdx, "resourceName", v)} placeholder="Select Resource" options={filteredPeople} style={{ height: 32, fontSize: 11 }} />
                                  </td>
                                  <td style={{ padding: "8px 4px" }}>
                                    <StyledInput value={row.allocation} onChange={e => updateAllocationRow(aIdx, rIdx, "allocation", e.target.value.replace(/[^0-9]/g, ""))} placeholder="Enter %" style={{ height: 32, fontSize: 11 }} />
                                  </td>
                                  <td style={{ padding: "8px 4px" }}>
                                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                                        <label key={day} style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 9, color: "#64748b", cursor: "pointer" }}>
                                          <input type="checkbox" checked={row.workingDays.includes(day)} onChange={() => toggleDay(aIdx, rIdx, day)} style={{ width: 10, height: 10 }} />
                                          {day}
                                        </label>
                                      ))}
                                    </div>
                                  </td>
                                </>
                              )}
                              {alloc.type === "Cost" && (
                                <>
                                  <td style={{ padding: "8px 4px" }}>
                                    <SearchableSelect value={row.name} onChange={v => updateAllocationRow(aIdx, rIdx, "name", v)} placeholder="Enter Name" options={[...new Set([...resourceData.filter(r => r.resource_type.toLowerCase() === "cost").map(r => r.name), "Licensing", "Hosting", "Domain"])]} style={{ height: 32, fontSize: 11 }} />
                                  </td>
                                  <td style={{ padding: "8px 4px" }}>
                                    <StyledInput value={row.amount} onChange={e => updateAllocationRow(aIdx, rIdx, "amount", e.target.value.replace(/[^0-9]/g, ""))} placeholder="Enter Amount" style={{ height: 32, fontSize: 11 }} />
                                  </td>
                                </>
                              )}
                              {alloc.type === "Material" && (
                                <>
                                  <td style={{ padding: "8px 4px" }}>
                                    <SearchableSelect value={row.name} onChange={v => updateAllocationRow(aIdx, rIdx, "name", v)} placeholder="Select Material" options={[...new Set([...resourceData.filter(r => r.resource_type.toLowerCase() === "material").map(r => r.name), ...MATERIAL_OPTIONS.map(m => m.name)])]} style={{ height: 32, fontSize: 11 }} />
                                  </td>
                                  <td style={{ padding: "8px 4px" }}>
                                    <StyledInput value={row.unit} onChange={e => updateAllocationRow(aIdx, rIdx, "unit", e.target.value)} placeholder="Unit" style={{ height: 32, fontSize: 11 }} />
                                  </td>
                                  <td style={{ padding: "8px 4px" }}>
                                    <StyledInput value={row.quantity} onChange={e => updateAllocationRow(aIdx, rIdx, "quantity", e.target.value.replace(/[^0-9]/g, ""))} placeholder="Qty" style={{ height: 32, fontSize: 11 }} />
                                  </td>
                                  <td style={{ padding: "8px 4px" }}>
                                    <StyledInput value={row.rate} onChange={e => updateAllocationRow(aIdx, rIdx, "rate", e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Rate" style={{ height: 32, fontSize: 11 }} />
                                  </td>
                                  <td style={{ padding: "8px 4px" }}>
                                    <StyledInput value={row.total} disabled placeholder="Total" style={{ height: 32, fontSize: 11, background: "#f8f9fa" }} />
                                  </td>
                                </>
                              )}
                              <td style={{ padding: "8px 4px", textAlign: "center" }}>
                                {alloc.rows.length > 1 && (
                                  <button onClick={() => removeRowFromAllocation(aIdx, rIdx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171" }}>
                                    <IconTrash size={12} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <button onClick={() => addRowToAllocation(aIdx)} style={{ display: "flex", alignItems: "center", gap: 6, margin: "12px 16px 0", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#2563eb" }}>
                      <IconPlus size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ position: "relative", marginTop: 12 }}>
                <button onClick={() => setShowAddResourceType(!showAddResourceType)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  Add Resource type <IconChevronDown />
                </button>
                {showAddResourceType && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 10, minWidth: 160 }}>
                    {["In-house", "Freelancer", "Cost", "Material"].map(type => (
                      <button key={type} onClick={() => addAllocation(type)}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#475467", borderBottom: "1px solid #f1f5f9" }}>
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 32 }}>
                <BtnOutline onClick={() => setStep(2)}>Back</BtnOutline>
                <BtnPrimary onClick={() => setStep(4)}>Next</BtnPrimary>
              </div>
            </div>
          )}

          {/* ════ Step 4: Milestone & Payment ════ */}
          {step === 4 && (
            <div style={{ padding: "16px 24px 24px" }}>

              {/* Milestone table */}
              <div style={{ border: "1px solid #e8eaef", borderRadius: 8, overflow: "visible" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: 52 }} />
                    <col />
                    <col style={{ width: 158 }} />
                    <col style={{ width: 118 }} />
                    <col style={{ width: 36 }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #e8eaef" }}>
                      {["Sr.no", "Milestone*", "Milestone Date", "Percentage %", ""].map((h, i) => (
                        <th key={i} style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, fontWeight: 600, color: "#8a8f9a" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(milestones) && milestones.map((ms, i) => (
                      <tr key={i} style={{ borderBottom: i < milestones.length - 1 ? "1px solid #f0f1f4" : "none" }}>
                        <td style={{ padding: "8px", fontSize: 13, color: "#666", paddingLeft: 14 }}>{i + 1}.</td>
                        <td style={{ padding: "6px 8px" }}>
                          <input value={ms.name} onChange={e => updateMs(i, "name", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                            style={{ ...inputStyle, height: 34, fontSize: 12, borderColor: "#eaecf0", background: "#fff" }}
                            onFocus={e => { e.target.style.borderColor = "#2563eb"; }}
                            onBlur={e => { e.target.style.borderColor = "#eaecf0"; }} />
                        </td>
                        <td style={{ padding: "6px 8px", overflow: "visible", position: "relative" }}>
                          <MsDateInput value={ms.date} onChange={d => updateMs(i, "date", d)} />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <div style={{ display: "flex", height: 34, border: "1px solid #eaecf0", borderRadius: 6, background: "#fff", overflow: "hidden" }}>
                            <input type="text" value={ms.pct} onChange={e => updateMs(i, "pct", e.target.value.replace(/[^0-9]/g, ""))} placeholder="Enter %"
                              style={{ flex: 1, border: "none", outline: "none", padding: "0 8px", fontSize: 12, background: "transparent", fontFamily: "inherit", color: "#333", minWidth: 0 }} />
                            <span style={{ width: 28, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #eaecf0", fontSize: 11, fontWeight: 600, color: "#aaa", flexShrink: 0 }}>%</span>
                          </div>
                        </td>
                        <td style={{ padding: "6px 4px", textAlign: "center" }}>
                          {milestones.length > 1 && (
                            <button onClick={() => removeMilestone(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <IconTrash size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "#fcfcfd" }}>
                      <td colSpan={3} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#475467", textAlign: "right" }}>Total Percentage:</td>
                      <td style={{ padding: "6px 8px" }}>
                        <div style={{
                          display: "flex", height: 34, border: "1px solid #eaecf0", borderRadius: 6,
                          background: milestones.reduce((s, m) => s + (parseInt(m.pct) || 0), 0) === 100 ? "#ecfdf3" : "#fff",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            flex: 1, display: "flex", alignItems: "center", padding: "0 8px", fontSize: 12, fontWeight: 700,
                            color: milestones.reduce((s, m) => s + (parseInt(m.pct) || 0), 0) === 100 ? "#039855" : milestones.reduce((s, m) => s + (parseInt(m.pct) || 0), 0) > 100 ? "#d92d20" : "#333"
                          }}>
                            {milestones.reduce((sum, m) => sum + (parseInt(m.pct) || 0), 0)}
                          </div>
                          <span style={{ width: 28, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #eaecf0", fontSize: 11, fontWeight: 600, color: "#aaa", flexShrink: 0 }}>%</span>
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* + Add */}
              <button onClick={addMilestone} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#2563eb", padding: "8px 0 2px", fontFamily: "inherit" }}>
                <IconPlus size={11} /> Add
              </button>

              {/* Budget + Billing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px] sm:gap-x-5 mt-2.5">
                <Field label="Budget" required>
                  <StyledInput value={budget} onChange={e => setBudget(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" type="text" />
                </Field>
                <Field label="No Billing" required>
                  <StyledSelect value={billing} onChange={e => setBilling(e.target.value)} options={BILLING_OPTIONS} />
                </Field>
              </div>

              {/* Options with chevron */}
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>Options</span>
                  <span style={{ color: "#bbb", display: "flex" }}><IconChevronDown /></span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {OPTION_FIELDS.map(o => (
                    <label key={o.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#555", cursor: "pointer", userSelect: "none" }}>
                      <div onClick={() => setOpts(p => ({ ...p, [o.key]: !p[o.key] }))}
                        style={{
                          width: 14, height: 14, borderRadius: 3,
                          border: `1.5px solid ${opts[o.key] ? "#2563eb" : "#d1d5db"}`,
                          background: opts[o.key] ? "#2563eb" : "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, cursor: "pointer", transition: "all 0.15s",
                        }}>
                        {opts[o.key] && <IconCheck />}
                      </div>
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 28 }}>
                <BtnOutline onClick={() => setStep(3)}>Back</BtnOutline>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !validateStep4()}
                  style={{
                    height: 40, padding: "0 32px", borderRadius: 8, border: "none",
                    background: (isLoading || !validateStep4()) ? "#cbd5e1" : "#2563eb",
                    color: "#fff",
                    fontSize: 13, fontWeight: 600, cursor: (isLoading || !validateStep4()) ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
