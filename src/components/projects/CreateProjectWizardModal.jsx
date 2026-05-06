import { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "../../api";

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
const STEPS = ["Project Detail", "Customer Details", "Milestone & Payment"];

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

// ─── Step Tabs (pixel-perfect from screenshot) ────────────────────────────────

function StepTabs({ step, setStep }) {
  const pct = ((step - 1) / 2) * 100;
  return (
    <div style={{ padding: "14px 24px 0", borderBottom: "1px solid #e8eaef", background: "#fff", flexShrink: 0 }}>
      <div style={{ position: "relative", maxWidth: 500, margin: "0 auto" }}>
        {/* Track line */}
        <div style={{ position: "absolute", left: "16.666%", right: "16.666%", top: 7, height: 1, background: "#e2e6ec" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", background: "#2563eb", width: `${pct}%`, transition: "width 0.3s ease" }} />
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", paddingBottom: 12 }}>
          {STEPS.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <button key={label} type="button" onClick={() => setStep(n)}
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
        <span style={{ fontSize: 11, color: "#aaa" }}>PDF / DOC / DOCX</span>
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
            <span style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>PDF / DOC / DOCX</span>
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

export default function CreateProjectModal({ isOpen = true, onClose, onSave, formValues = {} }) {
  console.log("Rendering CreateProjectModal, isOpen:", isOpen);
  const [step, setStep] = useState(1);
  const [projectCode, setProjectCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectManagers, setProjectManagers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);

  async function fetchManagers() {
    try {
      const response = await fetch(API_ENDPOINTS.USER_LIST);
      const data = await response.json();
      console.log("Raw User List:", data);
      const rawUsers = data.data || data;
      if (Array.isArray(rawUsers)) {
        const pmNames = rawUsers
          .filter(user => user.role && user.role.toLowerCase().trim() === 'project manager')
          .map(user => {
            const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
            const type = user.user_type === 'inhouse' ? '(Inhouse)' : '(Freelancer)';
            return `${name} ${type}`;
          })
          .filter(name => name.length > 0);
        console.log("Filtered Managers:", pmNames);
        setProjectManagers(pmNames);
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

  // Step 3
  const [milestones, setMilestones] = useState([{ name: "BRD Sign-off", date: null, pct: "" }]);
  const [budget, setBudget] = useState("");
  const [billing, setBilling] = useState("No Billing");
  const [opts, setOpts] = useState({ tasksStart: false, noEmail: false, onTime: false, autoSubscribe: false });

  // Use a ref to track if we've initialized for the current "open" session
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      setProjectName(formValues.name || "");
      setContractDate(formValues.contractDate ? new Date(formValues.contractDate) : null);
      setStartDate(formValues.plannedStartDate ? new Date(formValues.plannedStartDate) : null);
      setDuration(formValues.duration || "");
      setPm(formValues.pm || "");
      setProjectType(formValues.projectType || "");
      setPriority(formValues.priority || "");
      setMethodology(formValues.methodology || "");
      setScope(formValues.description || "");
      setBudget(formValues.budget || "");
      setBilling(formValues.billing || "No Billing");

      if (Array.isArray(formValues.persons)) setPersons(formValues.persons);
      if (Array.isArray(formValues.milestones)) setMilestones(formValues.milestones);
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

  if (!isOpen) return null;

  const endDate = startDate && duration ? addDays(startDate, duration, excludeWeekends) : null;

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
      p.name.trim() &&
      p.role.trim() &&
      p.mobile.trim() && validateMobile(p.mobile) &&
      p.email.trim() && validateEmail(p.email)
    );
  }

  function validatePersons() {
    const errs = persons.map(p => {
      const e = {};
      if (!p.name.trim()) e.name = "Required";
      if (!p.role.trim()) e.role = "Required";
      if (!p.mobile.trim()) e.mobile = "Required"; else if (!validateMobile(p.mobile)) e.mobile = "Invalid";
      if (!p.email.trim()) e.email = "Required"; else if (!validateEmail(p.email)) e.email = "Invalid email";
      return e;
    });
    setPErrors(errs);
    return errs.every(e => !Object.keys(e).length);
  }

  function addMilestone() { setMilestones(m => [...m, { name: "", date: null, pct: "" }]); }
  function removeMilestone(i) { setMilestones(m => m.filter((_, j) => j !== i)); }
  function updateMs(i, k, v) { setMilestones(m => m.map((x, j) => j === i ? { ...x, [k]: v } : x)); }

  function validateStep1() {
    const isNameValid = !!projectName.trim();
    const isContractDateValid = !!contractDate;
    const isStartDateValid = !!startDate;
    const isDurationValid = duration !== "" && duration !== null;
    const isPmValid = !!pm;
    const isProjectTypeValid = !!projectType;
    const isMethodologyValid = !!methodology;

    const isValid = isNameValid && isContractDateValid && isStartDateValid && isDurationValid && isPmValid && isProjectTypeValid && isMethodologyValid;

    if (!isValid) {
      console.log("Step 1 Validation Failed:", {
        isNameValid, isContractDateValid, isStartDateValid, isDurationValid, isPmValid, isProjectTypeValid, isMethodologyValid
      });
    }
    return isValid;
  }

  function validateStep2(showErrors = false) {
    if (showErrors) {
      const isCompanyValid = !!companyName.trim();
      const arePersonsValid = validatePersons();
      return isCompanyValid && arePersonsValid;
    }
    return !!companyName.trim() && checkPersonsValid();
  }

  function validateStep3() {
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
    if (!validateStep3()) {
      alert("Please fill all required fields in the Milestone section.");
      return;
    }
    setIsLoading(true);

    // Create FormData for form-data submission
    const formData = new FormData();

    formData.append("project_code", projectCode);
    formData.append("project_name", projectName || null);
    formData.append("contact_sign_date", contractDate ? contractDate.toISOString().split('T')[0] : null);
    formData.append("start_date", startDate ? startDate.toISOString().split('T')[0] : null);
    formData.append("end_date", endDate ? endDate.toISOString().split('T')[0] : null);
    formData.append("duration", duration || null);
    formData.append("project_manager", pm || null);
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

    try {
      const response = await fetch(API_ENDPOINTS.ADD_PROJECT, {
        method: 'POST',
        body: formData
      });

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (data.success) {
          alert(data.message || "Project created successfully");
          onSave?.({ ...Object.fromEntries(formData), id: Date.now() });
          onClose();
        } else {
          alert(data.message || "Failed to create project");
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
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12px", background: "rgba(0,0,0,0.65)", fontFamily: "'Inter',system-ui,sans-serif" }}>
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
        <StepTabs step={step} setStep={setStep} />

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

          {/* ════ Step 1: Project Detail ════ */}
          {step === 1 && (
            <div style={{ padding: "20px 24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>

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
                  <DateInput value={endDate} onChange={() => { }} placeholder="End date" disabled />
                </Field>
                <Field label="Duration" required>
                  <StyledInput value={duration} onChange={e => setDuration(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Enter Duration" type="text" />
                </Field>

                {/* Row 4 */}
                <Field label="Project Manager" required>
                  <StyledSelect value={pm} onChange={e => setPm(e.target.value)} placeholder="Select project manager" options={projectManagers} />
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginBottom: 14 }}>
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

          {/* ════ Step 3: Milestone & Payment ════ */}
          {step === 3 && (
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginTop: 10 }}>
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
                <BtnOutline onClick={() => setStep(2)}>Back</BtnOutline>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !validateStep3()}
                  style={{
                    height: 40, padding: "0 32px", borderRadius: 8, border: "none",
                    background: (isLoading || !validateStep3()) ? "#cbd5e1" : "#2563eb",
                    color: "#fff",
                    fontSize: 13, fontWeight: 600, cursor: (isLoading || !validateStep3()) ? "not-allowed" : "pointer",
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