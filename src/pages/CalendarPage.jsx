import { useState, useEffect, useRef } from 'react'
import { API_ENDPOINTS } from '../config/api'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  X,
  AlertCircle,
  Clock,
  Tag,
  CheckCircle,
  Edit3,
  Upload,
} from 'lucide-react'

// Default mock holidays to seed if none exist in localStorage
const DEFAULT_HOLIDAYS = [
  { id: '1', name: "New Year's Day", startDate: '2026-01-01', endDate: '2026-01-01', type: 'Public', color: 'red' },
  { id: '2', name: 'Valentine\'s Day', startDate: '2026-02-14', endDate: '2026-02-14', type: 'Corporate', color: 'pink' },
  { id: '3', name: 'President\'s Day', startDate: '2026-02-16', endDate: '2026-02-16', type: 'Public', color: 'blue' },
  { id: '4', name: 'Memorial Day', startDate: '2026-05-25', endDate: '2026-05-25', type: 'Public', color: 'red' },
  { id: '5', name: 'Independence Day', startDate: '2026-07-04', endDate: '2026-07-04', type: 'Public', color: 'blue' },
  { id: '6', name: 'Labor Day', startDate: '2026-09-07', endDate: '2026-09-07', type: 'Public', color: 'green' },
  { id: '7', name: 'Thanksgiving Break', startDate: '2026-11-25', endDate: '2026-11-27', type: 'Public', color: 'orange' },
  { id: '8', name: 'Christmas Day', startDate: '2026-12-25', endDate: '2026-12-25', type: 'Public', color: 'red' },
  { id: '9', name: 'Year-End Review', startDate: '2026-12-31', endDate: '2026-12-31', type: 'Corporate', color: 'purple' }
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500', button: 'bg-blue-500' },
  red: { bg: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500', button: 'bg-red-500' },
  green: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', button: 'bg-emerald-500' },
  purple: { bg: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-500', button: 'bg-purple-500' },
  orange: { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', button: 'bg-amber-500' },
  pink: { bg: 'bg-pink-50 text-pink-700 border-pink-100', dot: 'bg-pink-500', button: 'bg-pink-500' }
}

const CELL_COLOR_MAP = {
  blue: 'bg-blue-50/70 hover:bg-blue-100/60 border-blue-200 text-blue-900',
  red: 'bg-red-50/70 hover:bg-red-100/60 border-red-200 text-red-900',
  green: 'bg-emerald-50/70 hover:bg-emerald-100/60 border-emerald-200 text-emerald-900',
  purple: 'bg-purple-50/70 hover:bg-purple-100/60 border-purple-200 text-purple-900',
  orange: 'bg-amber-50/70 hover:bg-amber-100/60 border-amber-200 text-amber-900',
  pink: 'bg-pink-50/70 hover:bg-pink-100/60 border-pink-200 text-pink-900'
}

export default function CalendarPage() {
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    try {
      const profileStr = localStorage.getItem('user_profile')
      if (profileStr) {
        const profile = JSON.parse(profileStr)
        setUserRole(profile.role?.toLowerCase() || '')
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const isReadOnly = userRole === 'pm' || userRole === 'project manager'

  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [holidays, setHolidays] = useState([])
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError]   = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newHolidayName, setNewHolidayName] = useState('')
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const [newHolidayStartDate, setNewHolidayStartDate] = useState(todayStr)
  const [newHolidayEndDate, setNewHolidayEndDate] = useState(todayStr)
  const [newHolidayType, setNewHolidayType] = useState('Public')
  const [newHolidayColor, setNewHolidayColor] = useState('blue')
  const [stagedHolidays, setStagedHolidays] = useState([])
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedDateDetails, setSelectedDateDetails] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [holidayToDelete, setHolidayToDelete] = useState(null)
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [previewHolidays, setPreviewHolidays] = useState([])
  useEffect(() => {
    if (isModalOpen || isDetailsModalOpen || isDeleteConfirmOpen || isUploadModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen, isDetailsModalOpen, isDeleteConfirmOpen, isUploadModalOpen])

  // Long-press and click gesture refs and handlers
  const pressTimerRef = useRef(null)
  const pressStartTimeRef = useRef(0)
  const longPressTriggeredRef = useRef(false)

  const handlePressStart = (dateString) => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
    }
    
    pressStartTimeRef.current = Date.now()
    longPressTriggeredRef.current = false

    pressTimerRef.current = setTimeout(() => {
      if (isReadOnly) return
      longPressTriggeredRef.current = true
      // Vibrate mobile device if API is supported for high-end tactile feedback!
      if (navigator.vibrate) navigator.vibrate(50)
      setNewHolidayStartDate(dateString)
      setNewHolidayEndDate(dateString)
      setStagedHolidays([])
      setIsModalOpen(true)
    }, 550)
  }

  const handlePressEnd = (dateString, cellHolidays) => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }

    if (!longPressTriggeredRef.current) {
      const duration = Date.now() - pressStartTimeRef.current
      if (duration < 550) {
        setSelectedDateDetails({
          dateString,
          holidays: cellHolidays
        })
        setIsDetailsModalOpen(true)
      }
    }
  }

  const handlePressCancel = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }

  // ── Load holidays from DB API ──────────────────────────────────────────────
  const fetchHolidays = async () => {
    try {
      setApiLoading(true)
      const res  = await fetch(API_ENDPOINTS.HOLIDAYS)
      const data = await res.json()
      if (data.success) {
        // Map DB rows to UI shape
        const mapped = data.data.map(row => {
          // MySQL DATE comes as UTC midnight – use UTC getters to avoid timezone shift
          const d = new Date(row.holiday_date)
          const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`
          return {
            id:           String(row.id),
            name:         row.title,
            startDate:    dateStr,
            endDate:      dateStr,
            type:         row.description || 'Public',
            color:        'blue',
          }
        })
        setHolidays(mapped)
      }
    } catch (err) {
      console.error('Failed to load holidays:', err)
      setApiError('Could not load holidays from server.')
    } finally {
      setApiLoading(false)
    }
  }

  useEffect(() => { fetchHolidays() }, [])

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleMonthSelect = (monthIdx) => {
    setCurrentDate(new Date(currentYear, monthIdx, 1))
    setIsMonthDropdownOpen(false)
  }

  const handleYearSelect = (yearVal) => {
    setCurrentDate(new Date(yearVal, currentMonth, 1))
    setIsYearDropdownOpen(false)
  }

  // Calculate calendar days
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const generateDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth)

    const list = []

    // Previous Month padding
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dateNum = daysInPrevMonth - i
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`
      list.push({
        dayNumber: dateNum,
        dateString: dateStr,
        isPadding: true,
      })
    }

    // Current Month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      list.push({
        dayNumber: i,
        dateString: dateStr,
        isPadding: false,
      })
    }

    // Next Month padding to complete grid of 42 cells (6 rows * 7 days)
    const totalCells = 42
    const remaining = totalCells - list.length
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

    for (let i = 1; i <= remaining; i++) {
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      list.push({
        dayNumber: i,
        dateString: dateStr,
        isPadding: true,
      })
    }

    return list
  }

  const calendarDays = generateDays()

  // Find holidays matching specific date string
  const getHolidaysForDate = (dateStr) => {
    return holidays.filter((h) => dateStr >= h.startDate && dateStr <= h.endDate)
  }

  // ── Add holiday to DB ─────────────────────────────────────────────────────
  const addHolidayToDB = async (item) => {
    // Expand date range: insert one record per day
    const results = []
    let cursor = new Date(item.startDate + 'T00:00:00')
    const end   = new Date(item.endDate   + 'T00:00:00')
    while (cursor <= end) {
      const yr = cursor.getFullYear()
      const mo = String(cursor.getMonth() + 1).padStart(2, '0')
      const dy = String(cursor.getDate()).padStart(2, '0')
      const dateStr = `${yr}-${mo}-${dy}`
      const res  = await fetch(API_ENDPOINTS.ADD_HOLIDAY, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          holiday_date: dateStr,
          title:        item.name,
          description:  item.type,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        // Skip duplicate-date errors silently (UNIQUE KEY)
        console.warn('Add holiday skipped:', data.message)
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    return results
  }

  // Handle Form submit – persist to DB then refresh list
  const handleAddHolidaySubmit = async (e) => {
    e.preventDefault()

    let finalBatch = [...stagedHolidays]
    if (newHolidayName.trim()) {
      finalBatch.push({
        id:           Date.now().toString(),
        name:         newHolidayName.trim(),
        startDate:    newHolidayStartDate,
        endDate:      newHolidayEndDate,
        type:         newHolidayType,
        color:        newHolidayColor,
      })
    }
    if (finalBatch.length === 0) return

    setApiLoading(true)
    try {
      for (const item of finalBatch) {
        await addHolidayToDB(item)
      }
      await fetchHolidays()   // refresh from DB
    } catch (err) {
      console.error('Add holiday error:', err)
      setApiError('Failed to save holiday. Please try again.')
    } finally {
      setApiLoading(false)
    }

    setStagedHolidays([])
    setNewHolidayName('')
    setIsModalOpen(false)
  }

  // Handle removing a staged item from the batch list
  const handleRemoveStaged = (id) => {
    setStagedHolidays(stagedHolidays.filter(item => item.id !== id))
  }

  // Handle editing a staged item - loads it back into input fields and removes it from the list
  const handleEditStaged = (item) => {
    setNewHolidayName(item.name)
    setNewHolidayStartDate(item.startDate)
    setNewHolidayEndDate(item.endDate)
    setNewHolidayType(item.type)
    setNewHolidayColor(item.color)
    setStagedHolidays(stagedHolidays.filter(h => h.id !== item.id))
  }

  // Handle delete trigger (opens confirm popup)
  const handleDeleteHolidayTrigger = (holiday) => {
    setHolidayToDelete(holiday)
    setIsDeleteConfirmOpen(true)
  }

  // Handle final delete confirmation – calls DB API
  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return
    setApiLoading(true)
    try {
      const res  = await fetch(API_ENDPOINTS.DELETE_HOLIDAY, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: holidayToDelete.id }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchHolidays()   // refresh from DB
      } else {
        setApiError(data.message || 'Delete failed.')
      }
    } catch (err) {
      console.error('Delete holiday error:', err)
      setApiError('Failed to delete holiday. Please try again.')
    } finally {
      setApiLoading(false)
    }
    setIsDeleteConfirmOpen(false)
    setHolidayToDelete(null)
  }

  // Parse CSV helper respecting standard quoting conventions
  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n/)
    return lines.map(line => {
      const result = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    })
  }

  // Handle uploader file input change
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const rows = parseCSV(text)
      if (rows.length < 2) {
        alert("Invalid file format or empty spreadsheet.")
        return
      }

      const headers = rows[0].map(h => h.trim().toLowerCase())
      
      const nameIdx = headers.findIndex(h => h.includes('title') || h.includes('name') || h.includes('holiday'))
      const startIdx = headers.findIndex(h => h.includes('start') || h.includes('from') || h.includes('date'))
      const endIdx = headers.findIndex(h => h.includes('end') || h.includes('to'))
      const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('category'))
      const colorIdx = headers.findIndex(h => h.includes('color'))

      if (nameIdx === -1 || startIdx === -1) {
        alert("Could not map columns. Please make sure the file contains at least 'Title' and 'Start Date' columns.")
        return
      }

      const imported = []
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row.length < 2 || !row[nameIdx]) continue

        const name = row[nameIdx].trim()
        const startDate = row[startIdx] ? row[startIdx].trim() : '2026-05-18'
        // If end date index is found and present, use it; otherwise fallback to start date
        const endDate = (endIdx !== -1 && row[endIdx]) ? row[endIdx].trim() : startDate
        const type = (typeIdx !== -1 && row[typeIdx]) ? row[typeIdx].trim() : 'Public'
        const color = (colorIdx !== -1 && row[colorIdx]) ? row[colorIdx].trim().toLowerCase() : 'blue'

        imported.push({
          id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          name,
          startDate,
          endDate,
          type: ['public', 'corporate'].includes(type.toLowerCase()) ? type : 'Public',
          color: ['blue', 'red', 'green', 'amber', 'purple'].includes(color) ? color : 'blue'
        })
      }

      setPreviewHolidays(imported)
    }
    reader.readAsText(file)
  }

  // Trigger Excel-compatible CSV download directly
  const downloadSampleTemplate = () => {
    const csvContent = "Title,Start Date,End Date,Type,Color\n" +
      "Memorial Day,2026-05-25,2026-05-25,Public,red\n" +
      "Spring Break,2026-03-09,2026-03-13,Public,green\n" +
      "Company Foundation Day,2026-02-19,2026-02-19,Corporate,purple\n"
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "holidays_template.csv")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Save imported preview batch into DB
  const handleConfirmImport = async () => {
    if (previewHolidays.length === 0) return
    setApiLoading(true)
    try {
      for (const item of previewHolidays) {
        await addHolidayToDB(item)
      }
      await fetchHolidays()
    } catch (err) {
      console.error('Import error:', err)
      setApiError('Some holidays could not be imported.')
    } finally {
      setApiLoading(false)
    }
    setPreviewHolidays([])
    setIsUploadModalOpen(false)
  }

  // Clean formatted date display
  const formatDateFriendly = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Format dynamic single or multi-day range display
  const formatDateRangeFriendly = (startStr, endStr) => {
    if (startStr === endStr) {
      return formatDateFriendly(startStr)
    }
    const [sy, sm, sd] = startStr.split('-')
    const [ey, em, ed] = endStr.split('-')
    const sObj = new Date(sy, sm - 1, sd)
    const eObj = new Date(ey, em - 1, ed)
    
    const sFmt = sObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const eFmt = eObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    
    return `${sFmt} - ${eFmt}`
  }

  // Today string for highlighting
  const todayHighlight = todayStr

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8 font-sans text-slate-800">

      {/* API Error Toast */}
      {apiError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3 shadow-lg">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <span className="text-sm font-semibold text-red-700">{apiError}</span>
          <button onClick={() => setApiError('')} className="ml-2 text-red-400 hover:text-red-600"><X size={14}/></button>
        </div>
      )}

      {/* Loading overlay */}
      {apiLoading && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-xl border border-slate-100">
            <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span className="text-sm font-bold text-slate-700">Processing...</span>
          </div>
        </div>
      )}
      
      {/* Dynamic Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0d2646] tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-slate-500">
            View holidays, corporate schedules, and plan allocations effortlessly.
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setPreviewHolidays([])
                setIsUploadModalOpen(true)
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
            >
              <Upload size={18} className="text-slate-500" />
              <span>Import Excel/CSV</span>
            </button>
            
            <button
              onClick={() => {
                const formattedDate = '2026-05-18'
                setNewHolidayStartDate(formattedDate)
                setNewHolidayEndDate(formattedDate)
                setStagedHolidays([])
                setIsModalOpen(true)
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <Plus size={18} />
              <span>Add Holidays</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left is Calendar, Right is List of upcoming events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        
        {/* Calendar Core Card */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          
          {/* Calendar Controls */}
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition active:scale-95 text-slate-600"
                aria-label="Previous Month"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition active:scale-95 text-slate-600"
                aria-label="Next Month"
              >
                <ChevronRight size={20} />
              </button>

              {/* Separate Month and Year Dropdown Selectors */}
              <div className="flex items-center gap-2">
                {/* Month Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsMonthDropdownOpen(!isMonthDropdownOpen)
                      setIsYearDropdownOpen(false)
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 font-bold text-[#0d2646] hover:bg-slate-50 transition text-sm sm:text-base"
                  >
                    <span>{MONTHS[currentMonth]}</span>
                    <span className="text-[9px] text-slate-400">▼</span>
                  </button>

                  {isMonthDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsMonthDropdownOpen(false)} />
                      <div className="absolute left-0 mt-2 z-20 w-40 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
                        <div className="grid grid-cols-1 gap-0.5 max-h-60 overflow-y-auto">
                          {MONTHS.map((m, idx) => (
                            <button
                              key={m}
                              onClick={() => handleMonthSelect(idx)}
                              className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                                idx === currentMonth
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsYearDropdownOpen(!isYearDropdownOpen)
                      setIsMonthDropdownOpen(false)
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 font-bold text-[#0d2646] hover:bg-slate-50 transition text-sm sm:text-base"
                  >
                    <span>{currentYear}</span>
                    <span className="text-[9px] text-slate-400">▼</span>
                  </button>

                  {isYearDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsYearDropdownOpen(false)} />
                      <div className="absolute left-0 mt-2 z-20 w-28 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
                        <div className="grid grid-cols-1 gap-0.5 max-h-60 overflow-y-auto">
                          {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                            <button
                              key={yr}
                              onClick={() => handleYearSelect(yr)}
                              className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                                yr === currentYear
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {yr}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Public Holiday
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Corporate Event
              </span>
            </div>
          </div>

          {/* Weekday headers matching the dark navy style */}
          <div className="grid grid-cols-7 gap-1 overflow-hidden rounded-t-xl bg-[#0d2646] text-white">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-3.5 text-center text-xs font-bold uppercase tracking-wider">
                {day.substring(0, 3)}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 bg-slate-100 p-1 rounded-b-xl border border-slate-200/60">
            {calendarDays.map((cell, idx) => {
              const cellHolidays = getHolidaysForDate(cell.dateString)
              const hasHolidays = cellHolidays.length > 0

              const isWeekend = idx % 7 === 0 || idx % 7 === 6
              const firstHoliday = cellHolidays[0]
              
              let cellBgClass = ''
              if (hasHolidays) {
                cellBgClass = CELL_COLOR_MAP[firstHoliday.color] || CELL_COLOR_MAP.blue
              } else if (cell.isPadding) {
                cellBgClass = 'bg-slate-50/30 text-slate-300 hover:bg-slate-100/70 border-slate-100'
              } else if (isWeekend) {
                cellBgClass = 'bg-slate-50/80 text-slate-500 hover:bg-slate-100/70 border-slate-100'
              } else {
                cellBgClass = 'bg-white text-slate-800 hover:bg-slate-50/70 border-slate-100'
              }

              const isToday = cell.dateString === todayHighlight
              const todayRing = isToday ? 'ring-2 ring-blue-500 ring-offset-0 z-10 border-blue-400 shadow-md shadow-blue-100/50' : ''

              return (
                <div
                  key={`${cell.dateString}-${idx}`}
                  className={`min-h-[65px] sm:min-h-[90px] md:min-h-[115px] p-1.5 sm:p-2 flex flex-col justify-between group transition duration-150 border cursor-pointer select-none ${cellBgClass} ${todayRing}`}
                  onMouseDown={() => handlePressStart(cell.dateString)}
                  onMouseUp={() => handlePressEnd(cell.dateString, cellHolidays)}
                  onMouseLeave={handlePressCancel}
                  onTouchStart={() => handlePressStart(cell.dateString)}
                  onTouchEnd={() => handlePressEnd(cell.dateString, cellHolidays)}
                  onTouchMove={handlePressCancel}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <div className="flex justify-between items-start">
                    {isToday ? (
                      <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] sm:text-xs font-black text-white shadow-sm ring-2 ring-blue-100/80">
                        {cell.dayNumber}
                      </span>
                    ) : (
                      <span className={`text-[11px] sm:text-[13px] font-bold ${
                        cell.isPadding
                          ? 'text-slate-300'
                          : (isWeekend ? 'text-slate-400' : 'text-slate-700')
                      }`}>
                        {cell.dayNumber}
                      </span>
                    )}
                  </div>

                  {/* Render Day Events/Holidays */}
                  <div className="mt-1 flex-1 flex flex-col justify-end">
                    {/* Desktop View: Full-size text tags */}
                    <div className="hidden sm:block space-y-1 mt-1">
                      {cellHolidays.map((h) => {
                        const colorStyle = COLOR_MAP[h.color] || COLOR_MAP.blue
                        return (
                          <div
                            key={h.id}
                            className={`rounded-lg border px-2 py-1 text-[10px] md:text-[11px] font-semibold leading-tight shadow-sm flex items-center gap-1.5 truncate ${colorStyle.bg}`}
                            title={`${h.name} (${h.type})`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${colorStyle.dot}`} />
                            <span className="truncate">{h.name}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Mobile View: Tiny dot badges */}
                    <div className="flex sm:hidden flex-wrap gap-1 justify-center mt-1">
                      {cellHolidays.map((h) => {
                        const colorStyle = COLOR_MAP[h.color] || COLOR_MAP.blue
                        return (
                          <span
                            key={h.id}
                            className={`h-1.5 w-1.5 rounded-full ${colorStyle.dot}`}
                            title={h.name}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Panel: Holiday Register */}
        <div className="space-y-6">
          
          {/* Statistics summary */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Monthly Stats</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-2xl font-black text-[#0d2646]">{holidays.length}</span>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Total Scheduled</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100/50">
                <span className="text-2xl font-black text-blue-700">
                  {holidays.filter(h => {
                    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
                    return h.startDate.startsWith(currentMonthStr) || h.endDate.startsWith(currentMonthStr)
                  }).length}
                </span>
                <p className="text-xs text-blue-500 mt-1 font-semibold">In {MONTHS[currentMonth]}</p>
              </div>
            </div>
          </div>

          {/* Holiday List */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-[#0d2646] text-base">Holidays List</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {holidays.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {holidays.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-sm text-slate-400">No scheduled holidays.</p>
                </div>
              ) : (
                holidays
                  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                  .map((h) => {
                    const colorStyle = COLOR_MAP[h.color] || COLOR_MAP.blue
                    return (
                      <div
                        key={h.id}
                        className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition duration-150"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${colorStyle.dot}`} />
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-800 truncate">{h.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                              <span>{formatDateRangeFriendly(h.startDate, h.endDate)}</span>
                              <span>•</span>
                              <span className="capitalize">{h.type}</span>
                            </p>
                          </div>
                        </div>

                        {!isReadOnly && (
                          <button
                            onClick={() => handleDeleteHolidayTrigger(h)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition active:scale-90 shrink-0"
                            title="Delete Holiday"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Modal Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[4px] transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <h3 className="text-lg font-extrabold text-[#0d2646] flex items-center gap-2">
                <CalendarIcon size={18} className="text-blue-600" />
                <span>Add New Holiday</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddHolidaySubmit} className="mt-4 flex-1 flex flex-col overflow-hidden">
              
              <div className="flex-1 overflow-y-auto pr-1.5 py-1 space-y-4 max-h-[calc(90vh-200px)] sm:max-h-[calc(85vh-200px)] custom-scrollbar">
                {/* Holiday Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Holiday Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Christmas Break"
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                  />
                </div>

                {/* Holiday Start and End Date Range selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From Date</label>
                    <input
                      type="date"
                      value={newHolidayStartDate}
                      onChange={(e) => {
                        setNewHolidayStartDate(e.target.value)
                        if (newHolidayEndDate < e.target.value) {
                          setNewHolidayEndDate(e.target.value)
                        }
                      }}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Date</label>
                    <input
                      type="date"
                      min={newHolidayStartDate}
                      value={newHolidayEndDate}
                      onChange={(e) => setNewHolidayEndDate(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Holiday Type */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                    <select
                      value={newHolidayType}
                      onChange={(e) => setNewHolidayType(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                    >
                      <option value="Public">Public</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Regional">Regional</option>
                    </select>
                  </div>

                  {/* Holiday Color Theme */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Color Tag</label>
                    <select
                      value={newHolidayColor}
                      onChange={(e) => setNewHolidayColor(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition select-none"
                    >
                      <option value="blue">Blue</option>
                      <option value="red">Red</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                      <option value="orange">Orange</option>
                      <option value="pink">Pink</option>
                    </select>
                  </div>
                </div>

                {/* Add Button to Staging Batch List */}
                <button
                  type="button"
                  onClick={() => {
                    if (!newHolidayName.trim()) return
                    const newItem = {
                      id: Date.now().toString(),
                      name: newHolidayName.trim(),
                      startDate: newHolidayStartDate,
                      endDate: newHolidayEndDate,
                      type: newHolidayType,
                      color: newHolidayColor,
                    }
                    setStagedHolidays([...stagedHolidays, newItem])
                    setNewHolidayName('')
                  }}
                  disabled={!newHolidayName.trim()}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition border ${
                    newHolidayName.trim()
                      ? 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 active:scale-98'
                      : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Plus size={14} />
                  <span>Add Holiday to List</span>
                </button>

                {/* Staged Holidays List */}
                {stagedHolidays.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Staged list ({stagedHolidays.length})
                    </label>
                    <div className="max-h-[160px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-2 space-y-2">
                      {stagedHolidays.map((item) => {
                        const colorStyle = COLOR_MAP[item.color] || COLOR_MAP.blue
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${colorStyle.dot}`} />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                                  {formatDateRangeFriendly(item.startDate, item.endDate)} • {item.type}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditStaged(item)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition active:scale-90"
                                title="Edit Section"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveStaged(item.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition active:scale-90"
                                title="Remove Section"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stagedHolidays.length === 0 && !newHolidayName.trim()}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
                    stagedHolidays.length > 0 || newHolidayName.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Save Schedule
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Date Details Modal */}
      {isDetailsModalOpen && selectedDateDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Modal Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[4px] transition-opacity"
            onClick={() => setIsDetailsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-[#0d2646] flex items-center gap-2">
                <CalendarIcon size={18} className="text-blue-600" />
                <span>Date Details</span>
              </h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Target Date Header */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selected Date</p>
                <p className="text-base font-bold text-slate-800 mt-1">
                  {formatDateFriendly(selectedDateDetails.dateString)}
                </p>
              </div>

              {/* Holiday list or 'None' */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Scheduled Holidays</p>
                {selectedDateDetails.holidays.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {selectedDateDetails.holidays.map((h) => {
                      const colorStyle = COLOR_MAP[h.color] || COLOR_MAP.blue
                      return (
                        <div
                          key={h.id}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 ${colorStyle.bg}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`h-3 w-3 rounded-full shrink-0 ${colorStyle.dot}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-extrabold text-slate-800 truncate">{h.name}</p>
                              <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                {formatDateRangeFriendly(h.startDate, h.endDate)} • {h.type}
                              </p>
                            </div>
                          </div>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsDetailsModalOpen(false)
                                handleDeleteHolidayTrigger(h)
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition active:scale-90 shrink-0"
                              title="Delete Holiday"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                    <p className="text-sm font-bold text-slate-400">None</p>
                  </div>
                )}
              </div>
            </div>

            {/* Simple OK cut button */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setNewHolidayStartDate(selectedDateDetails.dateString)
                    setNewHolidayEndDate(selectedDateDetails.dateString)
                    setStagedHolidays([])
                    setIsDetailsModalOpen(false)
                    setIsModalOpen(true)
                  }}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-100 transition active:scale-95"
                >
                  + Add Holiday
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition active:scale-95 shadow-md hover:shadow-lg"
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && holidayToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Modal Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[4px] transition-opacity"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            <div className="flex flex-col items-center text-center p-2">
              {/* Alert icon with soft red bounce */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 ring-4 ring-red-50/50 mb-4 animate-bounce">
                <AlertCircle size={24} />
              </div>

              <h3 className="text-lg font-extrabold text-[#0d2646] mb-2">
                Delete Holiday Schedule
              </h3>
              
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                Are you sure you want to delete the holiday <strong className="text-slate-800">"{holidayToDelete.name}"</strong>? This action cannot be undone.
              </p>
            </div>

            {/* Modal Buttons */}
            <div className="mt-6 flex items-center justify-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition active:scale-95 shrink-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition active:scale-95 shadow-md hover:shadow-lg shrink-0"
              >
                Yes, Delete
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Excel/CSV Import Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Modal Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[4px] transition-opacity"
            onClick={() => setIsUploadModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-extrabold text-[#0d2646] flex items-center gap-2">
                <Upload size={20} className="text-blue-600" />
                <span>Import Holiday Spreadsheet</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Informative tips and template downloader */}
              <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100/50 text-xs text-blue-800 leading-relaxed">
                <p className="font-bold mb-1">💡 Excel spreadsheet Instructions:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Please export your Excel spreadsheet as a <strong>CSV (Comma Delimited)</strong> file.</li>
                  <li>Ensure your file contains these columns: <strong>Title</strong>, <strong>Start Date</strong>, <strong>End Date</strong>, <strong>Type</strong>, and <strong>Color</strong>.</li>
                  <li>Dates must follow the <code>YYYY-MM-DD</code> format (e.g. <code>2026-05-18</code>).</li>
                </ul>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                >
                  📥 Download Sample Template (.csv)
                </button>
              </div>

              {/* Upload Dropzone */}
              {previewHolidays.length === 0 ? (
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition text-center group cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition mb-3">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Click to upload spreadsheet</p>
                    <p className="text-xs text-slate-400 mt-1">or drag & drop your Excel CSV file here</p>
                  </div>
                </div>
              ) : (
                /* Parsed Preview Area */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-slate-700">Import Preview</p>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-100">
                      ✓ {previewHolidays.length} Holidays Parsed
                    </span>
                  </div>

                  <div className="border border-slate-100 rounded-2xl max-h-[220px] overflow-y-auto divide-y divide-slate-100 bg-slate-50/50 p-2 space-y-1">
                    {previewHolidays.map((h, idx) => {
                      const colorStyle = COLOR_MAP[h.color] || COLOR_MAP.blue
                      return (
                        <div
                          key={h.id}
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-white shadow-sm`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${colorStyle.dot}`} />
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-slate-800 truncate">{h.name}</h4>
                              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                {formatDateRangeFriendly(h.startDate, h.endDate)} • {h.type}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Reset/clear parser link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setPreviewHolidays([])}
                      className="text-xs font-bold text-red-500 hover:text-red-700 transition cursor-pointer"
                    >
                      Clear & Upload Different File
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setPreviewHolidays([])
                  setIsUploadModalOpen(false)
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={previewHolidays.length === 0}
                onClick={handleConfirmImport}
                className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition active:scale-95 shadow-md ${
                  previewHolidays.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-blue-100 hover:shadow-lg'
                    : 'bg-slate-300 cursor-not-allowed shadow-none'
                }`}
              >
                Confirm Import
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
