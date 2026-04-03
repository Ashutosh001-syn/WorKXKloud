import { useEffect, useState } from 'react'
import { Funnel, PencilLine, Search, Trash2, X } from 'lucide-react'

const tabLabels = ['PMO', 'PM', 'Team Member']

const defaultFormValues = {
  name: '',
  email: '',
  password: '',
  role: '',
  WorkingHour: '',
  shift: '',
  salary: '',
}

const initialTeamMembers = [
  { id: 1, name: 'Nathan Roberts', email: 'nathan.roberts@example.com', password: '18293192', role: 'Designer', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 2, name: 'Albert Flores', email: 'debbie.baker@example.com', password: '18293192', role: 'Developer', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 3, name: 'Felicia Reid', email: 'felicia.reid@example.com', password: '18293192', role: 'Tester', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 4, name: 'Deanna Curtis', email: 'deanna.curtis@example.com', password: '18293192', role: 'Designer', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 5, name: 'Felicia Reid', email: 'felicia.reid@example.com', password: '18293192', role: 'Tester', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 6, name: 'Deanna Curtis', email: 'deanna.curtis@example.com', password: '18293192', role: 'Designer', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 7, name: 'Felicia Reid', email: 'felicia.reid@example.com', password: '18293192', role: 'Tester', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 8, name: 'Deanna Curtis', email: 'deanna.curtis@example.com', password: '18293192', role: 'Designer', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 9, name: 'Felicia Reid', email: 'felicia.reid@example.com', password: '18293192', role: 'Tester', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 10, name: 'Deanna Curtis', email: 'deanna.curtis@example.com', password: '18293192', role: 'Designer',Salary:'10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 11, name: 'Felicia Reid', email: 'felicia.reid@example.com', password: '18293192', role: 'Tester', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 12, name: 'Deanna Curtis', email: 'deanna.curtis@example.com', password: '18293192', role: 'Designer', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 13, name: 'Felicia Reid', email: 'felicia.reid@example.com', password: '18293192', role: 'Tester', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
  { id: 14, name: 'Deanna Curtis', email: 'deanna.curtis@example.com', password: '18293192', role: 'Designer', Salary: '10000',Shift:'Morning',WorkingHour:'9:00 AM - 5:00 PM' },
].map((member) => ({
  ...member,
  salary: member.salary ?? member.Salary ?? '',
  shift: member.shift ?? member.Shift ?? '',
  WorkingHour: member.WorkingHour ?? member.workingHour ?? '',
}))

function ToolbarButton({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
    >
      {children}
    </button>
  )
}

function ActionButton({ tone = 'edit', onClick, memberId }) {
  const isEdit = tone === 'edit'

  return (
    <button
      type="button"
      onClick={() => onClick(memberId)}
      aria-label={isEdit ? 'Edit user' : 'Delete user'}
      className={[
        'inline-flex h-6 w-6 items-center justify-center rounded-full transition',
        isEdit
          ? 'bg-[#efedff] text-[#5a65ff] hover:bg-[#e3e0ff]'
          : 'bg-[#ffe9ea] text-[#ff4e5b] hover:bg-[#ffdce0]',
      ].join(' ')}
    >
      {isEdit ? <PencilLine size={11} strokeWidth={2.2} /> : <Trash2 size={11} strokeWidth={2.2} />}
    </button>
  )
}

function CreateUserPage() {
  const [activeTab, setActiveTab] = useState('Team Member')

  function getFilteredMembers() {
    if (activeTab === 'Team Member') {
      return teamMembers.filter(member => 
        ['Designer', 'Developer', 'Tester'].includes(member.role)
      )
    } else if (activeTab === 'PM') {
      return teamMembers.filter(member => member.role === 'PM')
    } else if (activeTab === 'PMO') {
      return teamMembers.filter(member => member.role === 'PMO')
    }
    return teamMembers
  }
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers)
  const [formValues, setFormValues] = useState(defaultFormValues)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (!isModalOpen) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isModalOpen])

  function handleInputChange(event) {
    const { name, value } = event.target

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleOpenModal() {
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setFormValues(defaultFormValues)
    setEditingId(null)
  }

  function handleDelete(id) {
    if (confirm('Are you sure you want to delete this user?')) {
      setTeamMembers(current => current.filter(member => member.id !== id))
    }
  }

  function handleEdit(id) {
    const member = teamMembers.find(m => m.id === id)
    if (member) {
      const normalizedMember = {
        ...member,
        WorkingHour: member.WorkingHour ?? member.workingHour ?? '',
        shift: member.shift ?? member.Shift ?? '',
        salary: member.salary ?? member.Salary ?? '',
      }

      setFormValues({
        name: normalizedMember.name,
        email: normalizedMember.email,
        password: normalizedMember.password,
        role: normalizedMember.role,
        WorkingHour: normalizedMember.WorkingHour,
        shift: normalizedMember.shift,
        salary: normalizedMember.salary,
      })
      setEditingId(id)
      setIsModalOpen(true)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const userData = {
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      password: formValues.password.trim(),
      role: formValues.role.trim(),
      WorkingHour: formValues.WorkingHour.trim(),
      shift: formValues.shift.trim(),
      salary: formValues.salary.trim(),
    }

    if (!userData.name || !userData.email || !userData.password || !userData.role || !userData.shift || !userData.salary) {
      alert('Please fill all required fields')
      return
    }

    if (editingId) {
      // Update existing
      setTeamMembers(current => current.map(member => 
        member.id === editingId ? { ...member, ...userData } : member
      ))
    } else {
      // Create new
      const nextUser = {
        id: teamMembers.length + 1,
        ...userData
      }
      setTeamMembers(current => [...current, nextUser])
    }
    handleCloseModal()
  }

  return (
    <div className="relative min-h-screen bg-[#0d2646] p-3 sm:p-4">
      <section className="rounded-[10px] bg-white p-4 shadow-[0_16px_40px_rgba(3,10,24,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-[#161616]">
            Create user
          </h1>

          <div className="flex items-center gap-1.5">
            <ToolbarButton label="Search">
              <Search size={16} strokeWidth={1.9} />
            </ToolbarButton>
            <ToolbarButton label="Filter">
              <Funnel size={15} strokeWidth={1.9} />
            </ToolbarButton>
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center rounded-full bg-[#1191da] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b82c7]"
            >
              Create user
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[8px] border border-[#e7eef5] bg-[#f9fbfd]">
          <div className="flex items-end gap-7 border-b border-[#e6edf4] px-4 pt-3">
            {tabLabels.map((tab) => {
              const isActive = activeTab === tab

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'border-b-2 pb-2 text-[13px] font-medium transition',
                    isActive
                      ? 'border-[#5db5ee] text-[#1191da]'
                      : 'border-transparent text-[#475569] hover:text-[#1191da]',
                  ].join(' ')}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          <div className="px-2 py-2">
            <div className="overflow-hidden rounded-[6px] border border-[#edf1f5] bg-white">
              <div className="max-h-[468px] overflow-y-auto">
                <table className="w-full table-fixed border-collapse text-left text-[11px] text-[#6f7e8f]">
                  <colgroup>
                    <col className="w-[54px]" />
                    <col className="w-[140px]" />
                    <col className="w-[160px]" />
                    <col className="w-[110px]" />
                    <col className="w-[90px]" />
                    <col className="w-[80px]" />
                    <col className="w-[80px]" />
                    <col className="w-[90px]" />
                    <col className="w-[90px]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#edf4f9] text-[#334155]">
                      <th className="px-4 py-3 font-medium">Sr.no</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Password</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium text-center">Salary</th>
                      <th className="px-4 py-3 font-medium text-center">Shift</th>
                      <th className="px-4 py-3 font-medium text-center">Hours</th>
                      <th className="px-4 py-3 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredMembers().map((member) => (
                      <tr key={member.id} className="border-b border-[#edf1f5] last:border-b-0">
                        <td className="px-4 py-3">{member.id}</td>
                        <td className="px-4 py-3">{member.name}</td>
                        <td className="px-4 py-3">{member.email}</td>
                        <td className="px-4 py-3">{member.password}</td>
                        <td className="px-4 py-3">{member.role}</td>
                        <td className="px-4 py-3 text-center">${member.salary}</td>
                        <td className="px-4 py-3 text-center">{member.shift}</td>
                        <td className="px-4 py-3 text-center">{member.WorkingHour}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3">
                            <ActionButton tone="edit" onClick={handleEdit} memberId={member.id} />
                            <ActionButton tone="delete" onClick={handleDelete} memberId={member.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="absolute inset-0 z-40 flex items-start justify-center bg-slate-950/45 px-4 pt-16 sm:pt-20">
          <div
            role="presentation"
            className="absolute inset-0"
            onClick={handleCloseModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-modal-title"
            className="relative w-full max-w-[456px] overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
          >
            <div className="flex items-center justify-between bg-[#e4f0fd] px-5 py-3.5">
              <div className="w-8" />
              <h2
                id="create-user-modal-title"
                className="text-[1.05rem] font-semibold text-[#0b2c4d]"
              >
                {editingId ? 'Edit User' : 'Create User'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close create user modal"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#0b2c4d] transition hover:bg-white/70"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <form className="px-4 pb-7 pt-6 sm:px-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1f2937]">Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    className="h-11 w-full rounded-[6px] border border-[#dce5ef] px-3 text-sm text-slate-700 outline-none transition placeholder:text-[#b2bac5] focus:border-[#1191da]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1f2937]">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    className="h-11 w-full rounded-[6px] border border-[#dce5ef] px-3 text-sm text-slate-700 outline-none transition placeholder:text-[#b2bac5] focus:border-[#1191da]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1f2937]">Password</span>
                  <input
                    type="text"
                    name="password"
                    value={formValues.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="h-11 w-full rounded-[6px] border border-[#dce5ef] px-3 text-sm text-slate-700 outline-none transition placeholder:text-[#b2bac5] focus:border-[#1191da]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1f2937]">Role</span>
                  <input
                    type="text"
                    name="role"
                    value={formValues.role}
                    onChange={handleInputChange}
                    placeholder="Enter role"
                    className="h-11 w-full rounded-[6px] border border-[#dce5ef] px-3 text-sm text-slate-700 outline-none transition placeholder:text-[#b2bac5] focus:border-[#1191da]"
                  />
                </label>
                  <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1f2937]">Working Hour</span>
                  <input
                    type="text"
                    name="WorkingHour"
                    value={formValues.WorkingHour}
                    onChange={handleInputChange}
                    placeholder="Enter working hour"
                    className="h-11 w-full rounded-[6px] border border-[#dce5ef] px-3 text-sm text-slate-700 outline-none transition placeholder:text-[#b2bac5] focus:border-[#1191da]"
                  />
                </label>
                 <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1f2937]">Shift</span>
                  <input
                    type="text"
                    name="shift"
                    value={formValues.shift}
                    onChange={handleInputChange}
                    placeholder="Enter shift"
                    className="h-11 w-full rounded-[6px] border border-[#dce5ef] px-3 text-sm text-slate-700 outline-none transition placeholder:text-[#b2bac5] focus:border-[#1191da]"
                  />
                </label>
                 <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-[#1f2937]">Salary</span>
                  <input
                    type="text"
                    name="salary"
                    value={formValues.salary}
                    onChange={handleInputChange}
                    placeholder="Enter salary"
                    className="h-11 w-full rounded-[6px] border border-[#dce5ef] px-3 text-sm text-slate-700 outline-none transition placeholder:text-[#b2bac5] focus:border-[#1191da]"
                  />
                </label>
              </div>

              <div className="mt-9 flex justify-center">
                <button
                  type="submit"
                  className="inline-flex min-w-[108px] items-center justify-center rounded-full bg-[#1191da] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0b82c7]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CreateUserPage
