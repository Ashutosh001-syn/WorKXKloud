import React, { useEffect, useState, useRef } from 'react'
import { Search, ChevronDown, X, Pencil, Ban, Camera, User, Check } from 'lucide-react'
import { API_ENDPOINTS } from '../api'

const initialTeamMembers = [
]

function RoleBadge({ role }) {
  const styles = {
    'Project Manager': 'text-[#1191da] bg-[#ebf5fc]',
    'Tech Lead': 'text-[#f59e0b] bg-[#fef3c7]',
    'Tester': 'text-[#a855f7] bg-[#f3e8ff]',
    'Management': 'text-[#22c55e] bg-[#dcfce7]',
    'Architect': 'text-[#ef4444] bg-[#fee2e2]',
    'Account Manager': 'text-[#06b6d4] bg-[#cffafe]',
  }

  const defaultStyle = 'text-slate-600 bg-slate-100'
  const style = styles[role] || defaultStyle

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${style}`}>
      {role}
    </span>
  )
}

function ActionButton({ tone, onClick }) {
  if (tone === 'edit') {
    return (
      <button type="button" onClick={onClick} className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full transition bg-[#ebf5fc] text-[#1191da] hover:bg-[#d8ecf9]">
        <Pencil size={12} strokeWidth={2.5} />
      </button>
    )
  }
  if (tone === 'unban') {
    return (
      <button type="button" onClick={onClick} className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full transition bg-[#dcfce7] text-[#22c55e] hover:bg-[#bbf7d0]">
        <Check size={12} strokeWidth={2.5} />
      </button>
    )
  }
  return (
    <button type="button" onClick={onClick} className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full transition bg-[#fee2e2] text-[#ef4444] hover:bg-[#fecaca]">
      <Ban size={12} strokeWidth={2.5} />
    </button>
  )
}

function CustomDropdown({ label, options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const requiredSpace = 250 

      if (spaceBelow < requiredSpace && spaceAbove > spaceBelow) {
        setDropUp(true)
      } else {
        setDropUp(false)
      }
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <span className="mb-2 block text-[13px] font-semibold text-[#334155]">{label}</span>}
      <div
        className={`flex h-11 w-full cursor-pointer items-center justify-between rounded-[8px] border ${isOpen ? 'border-[#1191da]' : 'border-[#e2e8f0]'} bg-white px-3.5 text-[13px] transition`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-[#334155]' : 'text-[#94a3b8]'}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className={`absolute z-50 max-h-[250px] w-full overflow-y-auto rounded-[8px] border border-[#e2e8f0] bg-white py-1 shadow-lg ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          {options.map((option) => (
            <div
              key={option}
              className="cursor-pointer px-4 py-2.5 text-[13px] text-[#334155] hover:bg-[#f8fafc] hover:text-[#1191da]"
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CreateUserPage() {
  const [activeTab, setActiveTab] = useState('Inhouse')
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formValues, setFormValues] = useState({
    type: '',
    name: '',
    email: '',
    password: '',
    role: '',
    mobile: '',
    image: null
  })
  const [editingId, setEditingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDepartment, setSearchDepartment] = useState('')
  const [searchRole, setSearchRole] = useState('')
  const [banModal, setBanModal] = useState({ isOpen: false, userId: null, action: null })
  const [showBlockedUsers, setShowBlockedUsers] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.USER_LIST)
      const data = await response.json()
      if (data.success) {
        const mappedUsers = data.data.map(user => ({
          ...user,
          type: user.user_type === 'inhouse' ? 'Inhouse' : 'Freelancer',
          designation: user.role,
          mobile: user.mobile || '',
          isBanned: user.status === 'disable'
        }))
        setTeamMembers(mappedUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormValues(prev => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const titleTabName = activeTab === 'Inhouse' ? 'Inhouse' : 'Freelancer'

  const uniqueDepartments = [...new Set(teamMembers.map(m => m.designation))].filter(Boolean)
  const uniqueRoles = [...new Set(teamMembers.map(m => m.role))].filter(Boolean)

  const filteredMembers = teamMembers.filter(member => {
    if (member.type !== activeTab) return false
    
    if (showBlockedUsers) {
      if (!member.isBanned) return false
    } else {
      if (member.isBanned) return false
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!member.name?.toLowerCase().includes(q) && !member.email?.toLowerCase().includes(q)) {
        return false
      }
    }

    if (searchDepartment && member.designation !== searchDepartment) return false
    if (searchRole && member.role !== searchRole) return false

    return true
  })

  const handleOpenModal = () => setIsModalOpen(true)

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormValues({ type: '', name: '', email: '', password: '', role: '', mobile: '', image: null })
    setSelectedFile(null)
    setEditingId(null)
  }

  const handleBanClick = (id, action) => {
    setBanModal({ isOpen: true, userId: id, action })
  }

  const handleConfirmBan = async () => {
    const newStatus = banModal.action === 'ban' ? 'disable' : 'enable'
    try {
      const res = await fetch(API_ENDPOINTS.UPDATE_STATUS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: banModal.userId,
          status: newStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
    setBanModal({ isOpen: false, userId: null, action: null })
  }

  const handleEdit = (id) => {
    const member = teamMembers.find(m => m.id === id)
    if (member) {
      setFormValues({
        type: member.type || 'Inhouse',
        name: member.name || '',
        email: member.email || '',
        password: member.password || '',
        role: member.role || '',
        mobile: member.mobile || '',
        image: member.image || null
      })
      setEditingId(id)
      setIsModalOpen(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formValues.type || !formValues.name || !formValues.email || !formValues.password || !formValues.role) {
      alert('Please fill in all mandatory fields.')
      return
    }
    
    if (formValues.type === 'Freelancer' && !formValues.mobile) {
      alert('Please provide a mobile number for the freelancer.')
      return
    }

    const formData = new FormData()
    formData.append('name', formValues.name)
    formData.append('email', formValues.email)
    formData.append('password', formValues.password || '')
    formData.append('role', formValues.role)
    formData.append('user_type', formValues.type?.toLowerCase() === 'freelancer' ? 'freelancer' : 'inhouse')
    if (formValues.type === 'Freelancer') {
      formData.append('mobile', formValues.mobile || '')
    }
    
    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    try {
      if (editingId) {
        formData.append('id', editingId)
        const res = await fetch(API_ENDPOINTS.UPDATE_USER, {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (data.success) {
          fetchUsers()
        }
      } else {
        const res = await fetch(API_ENDPOINTS.CREATE_USER, {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (data.success) {
          fetchUsers()
        }
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f1f5f9] p-6">
      <div className="rounded-[12px] bg-white p-6 shadow-sm">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-[#1e293b]">
              User Management(<span className="text-[#0052ff]">{titleTabName}</span>)
            </h1>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Manage and maintain all resource in the organization
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={handleOpenModal}
              className="rounded-full bg-[#0052ff] px-6 py-2 text-[14px] font-medium text-white transition hover:bg-[#0042cc]"
            >
              Add User
            </button>
            <label className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-[#64748b] transition-colors hover:text-[#334155]">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={showBlockedUsers}
                  onChange={(e) => setShowBlockedUsers(e.target.checked)}
                />
                <div className="h-4 w-7 rounded-full bg-slate-200 transition-colors duration-200 ease-in-out peer-checked:bg-[#0052ff]"></div>
                <div className="absolute left-[2px] h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-3"></div>
              </div>
              Show blocked users
            </label>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-[340px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="      Search by Name & Email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[42px] w-full rounded-[8px] border border-[#e2e8f0] bg-white pl-10 pr-4 text-[13px] text-[#334155] outline-none placeholder:text-[#94a3b8] focus:border-[#1191da]"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-[220px]">
              <select
                value={searchDepartment}
                onChange={(e) => setSearchDepartment(e.target.value)}
                className={`h-[42px] w-full appearance-none rounded-[8px] border border-[#e2e8f0] bg-white pl-4 pr-10 text-[13px] outline-none focus:border-[#1191da] ${searchDepartment ? 'text-[#334155]' : 'text-[#94a3b8]'}`}
              >
                <option value="">Search by Department</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            <div className="relative w-[220px]">
              <select
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                className={`h-[42px] w-full appearance-none rounded-[8px] border border-[#e2e8f0] bg-white pl-4 pr-10 text-[13px] outline-none focus:border-[#1191da] ${searchRole ? 'text-[#334155]' : 'text-[#94a3b8]'}`}
              >
                <option value="">Search by Role</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-8 border-b border-[#e2e8f0]">
          {['Inhouse', 'Freelancer'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-[14px] font-medium transition-colors ${activeTab === tab
                  ? 'text-[#0052ff]'
                  : 'text-[#64748b] hover:text-[#334155]'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#0052ff]" />
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-[8px] border border-[#e2e8f0]">
          <table className="w-full text-left text-[13px] text-[#475569]">
            <thead className="bg-[#f8fafc] text-[#334155]">
              <tr>
                <th className="px-5 py-3.5 font-medium">Sr.no</th>
                <th className="px-5 py-3.5 font-medium">Image</th>
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Email Id</th>
                <th className="px-5 py-3.5 font-medium">Password</th>
                <th className="px-5 py-3.5 font-medium">Designation</th>
                {activeTab === 'Freelancer' && (
                  <th className="px-5 py-3.5 font-medium">Mobile</th>
                )}
                <th className="px-5 py-3.5 font-medium">Role</th>
                <th className="px-5 py-3.5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] bg-white">
              {filteredMembers.map((member) => {
                const blurClass = member.isBanned ? 'blur-[4px] select-none opacity-60' : ''
                return (
                  <tr key={member.id} className="hover:bg-[#f8fafc]">
                    <td className={`px-5 py-3 ${blurClass}`}>{member.id}</td>
                    <td className={`px-5 py-3 ${blurClass}`}>
                      <img src={member.image} alt={member.name} className="h-8 w-8 rounded-full object-cover" />
                    </td>
                    <td className="px-5 py-3 text-[#334155]">{member.name}</td>
                    <td className={`px-5 py-3 ${blurClass}`}>{member.email}</td>
                    <td className={`px-5 py-3 ${blurClass}`}>{member.password}</td>
                    <td className={`px-5 py-3 text-[#334155] ${blurClass}`}>{member.designation}</td>
                    {activeTab === 'Freelancer' && (
                      <td className={`px-5 py-3 text-[#334155] ${blurClass}`}>{member.mobile || '-'}</td>
                    )}
                    <td className={`px-5 py-3 ${blurClass}`}>
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ActionButton tone="edit" onClick={() => handleEdit(member.id)} />
                        {member.isBanned ? (
                          <ActionButton tone="unban" onClick={() => handleBanClick(member.id, 'unban')} />
                        ) : (
                          <ActionButton tone="ban" onClick={() => handleBanClick(member.id, 'ban')} />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban Modal */}
      {banModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[4px]">
          <div className="relative w-full max-w-[400px] rounded-[16px] bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fee2e2]">
              <Ban size={24} className="text-[#ef4444]" />
            </div>
            <h3 className="mb-2 text-[18px] font-semibold text-[#1e293b]">
              {banModal.action === 'ban' ? 'Block User' : 'Unblock User'}
            </h3>
            <p className="mb-8 text-[14px] text-[#64748b]">
              {banModal.action === 'ban'
                ? 'Are you sure to block this user?'
                : 'Are you sure to unblock this user?'}
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setBanModal({ isOpen: false, userId: null, action: null })}
                className="w-[130px] rounded-[8px] bg-[#eff6ff] py-2.5 text-[14px] font-medium text-[#2563eb] transition hover:bg-[#dbeafe]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                className="w-[130px] rounded-[8px] bg-[#0052ff] py-2.5 text-[14px] font-medium text-white transition hover:bg-[#0042cc]"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[4px]">
          <div className="relative w-full max-w-[540px] rounded-[16px] bg-white shadow-2xl">

            <div className="flex items-center justify-between rounded-t-[16px] bg-[#f4f8fb] px-6 py-4">
              <h2 className="w-full text-center text-[16px] font-semibold text-[#1e293b]">
                {editingId ? 'Edit User' : 'Add User'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="absolute right-5 text-slate-400 transition hover:text-slate-600"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <form className="px-8 pb-8 pt-6" onSubmit={handleSubmit}>

              <div className="mb-6 flex justify-center">
                <div
                  className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-4 ring-white shadow-md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formValues.image ? (
                    <img
                      src={formValues.image}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={36} className="text-slate-400" strokeWidth={1.5} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={20} className="text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                <div className="col-span-2">
                  <CustomDropdown
                    label={<>User Type <span className="text-red-500">*</span></>}
                    options={['Inhouse', 'Freelancer']}
                    value={formValues.type}
                    placeholder="Select user type"
                    onChange={(val) => setFormValues({ ...formValues, type: val })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#334155]">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={formValues.name}
                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                    className="h-11 w-full rounded-[8px] border border-[#e2e8f0] px-3.5 text-[13px] text-[#334155] outline-none placeholder:text-[#94a3b8] focus:border-[#1191da]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#334155]">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email"
                    value={formValues.email}
                    onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                    className="h-11 w-full rounded-[8px] border border-[#e2e8f0] px-3.5 text-[13px] text-[#334155] outline-none placeholder:text-[#94a3b8] focus:border-[#1191da]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#334155]">Password <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Enter passsword"
                    value={formValues.password}
                    onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                    className="h-11 w-full rounded-[8px] border border-[#e2e8f0] px-3.5 text-[13px] text-[#334155] outline-none placeholder:text-[#94a3b8] focus:border-[#1191da]"
                  />
                </div>

                <div>
                  <CustomDropdown
                    label={<>Role <span className="text-red-500">*</span></>}
                    options={['Project manager', 'Frontend Developer', 'Backend developer', 'Tester', 'Architecture', 'Tech Lead']}
                    value={formValues.role}
                    placeholder="Enter role"
                    onChange={(val) => setFormValues({ ...formValues, role: val })}
                  />
                </div>

                {formValues.type === 'Freelancer' && (
                  <div>
                    <label className="mb-2 block text-[13px] font-semibold text-[#334155]">Mobile <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter mobile number"
                      value={formValues.mobile}
                      onChange={(e) => setFormValues({ ...formValues, mobile: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })}
                      className="h-11 w-full rounded-[8px] border border-[#e2e8f0] px-3.5 text-[13px] text-[#334155] outline-none placeholder:text-[#94a3b8] focus:border-[#1191da]"
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-[130px] rounded-[8px] bg-[#eff6ff] py-2.5 text-[14px] font-medium text-[#2563eb] transition hover:bg-[#dbeafe]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-[130px] rounded-[8px] bg-[#0052ff] py-2.5 text-[14px] font-medium text-white transition hover:bg-[#0042cc]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
