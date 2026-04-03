import { CircleAlert, X } from 'lucide-react'

const pmOptions = ['Nathan Roberts', 'Albert Flores', 'Felicia Reid', 'Deanna Curtis']
const priorityOptions = ['High', 'Medium', 'Low']
const projectTypeOptions = ['Website', 'Mobile App', 'Migration', 'Marketing']
const billingOptions = ['No Billing', 'Fixed Cost', 'Time and Material']
const taskScheduleOptions = ['Fixed Effort', 'Fixed Duration', 'Fixed Work']
const optionFields = [
  {
    key: 'tasksStartAfterPredecessors',
    label: 'Tasks should start when all predecessors are complete.',
  },
  {
    key: 'skipEmailNotification',
    label: 'Do not send email notification for this project.',
  },
  {
    key: 'assumeOnTimeAndBudget',
    label: 'Always assume this project is on time and budget.',
  },
  {
    key: 'autoSubscribeTeamMembers',
    label: 'Auto subscribe team members to new discussion topics.',
  },
]

function CreateProjectWizardModal({
  activeTab,
  errorMessage,
  formValues,
  isOpen,
  title,
  onClose,
  onInputChange,
  onOptionToggle,
  onSave,
  onTabChange,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="absolute inset-0 z-40 flex items-start justify-center bg-slate-950/22 px-4 pt-10 backdrop-blur-[3px] sm:pt-16">
      <div role="presentation" className="absolute inset-0" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-modal-title"
        className="relative w-full max-w-[820px] overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      >
        <div className="flex items-center justify-between bg-[#e4f0fd] px-6 py-4">
          <div className="w-8" />
          <h2 id="create-project-modal-title" className="text-[1.05rem] font-semibold text-[#0b2c4d]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create project modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#0b2c4d] transition hover:bg-white/70"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="border-b border-[#edf1f5] px-6">
          <div className="flex items-center justify-center gap-10">
            {[
              ['basic', 'Basic'],
              ['advanced', 'Advanced'],
            ].map(([tabId, label]) => {
              const isActive = activeTab === tabId

              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => onTabChange(tabId)}
                  className={[
                    'border-b-2 px-3 py-3 text-base font-semibold transition',
                    isActive
                      ? 'border-[#f4b332] text-[#f4b332]'
                      : 'border-transparent text-[#6b7280] hover:text-[#0b2c4d]',
                  ].join(' ')}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <form className="px-6 pb-8 pt-6" onSubmit={onSave}>
          {activeTab === 'basic' ? (
            <div>
              <div className="grid gap-5 md:grid-cols-2">
                <LabeledInput label="Name" required name="name" value={formValues.name} onChange={onInputChange} placeholder="Enter name" />
                <LabeledInput label="Planned Start Date" required type="date" name="plannedStartDate" value={formValues.plannedStartDate} onChange={onInputChange} />
                <LabeledInput label="Deadline" type="date" name="deadline" value={formValues.deadline} onChange={onInputChange} />
                <LabeledSelect label="PM" required name="pm" value={formValues.pm} onChange={onInputChange}>
                  <option value="">Select pm</option>
                  {pmOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </LabeledSelect>
                <LabeledInput label="Client Name" required name="clientName" value={formValues.clientName} onChange={onInputChange} placeholder="Enter client name" />
                <LabeledInput label="State" required name="state" value={formValues.state} onChange={onInputChange} placeholder="Enter state" />
                <LabeledSelect label="Priority" name="priority" value={formValues.priority} onChange={onInputChange}>
                  {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </LabeledSelect>
                <LabeledSelect label="Project Type" required name="projectType" value={formValues.projectType} onChange={onInputChange}>
                  <option value="">Enter project type</option>
                  {projectTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </LabeledSelect>
                <label className="block">
                  <LabelText label="Description" />
                  <textarea
                    name="description"
                    value={formValues.description}
                    onChange={onInputChange}
                    placeholder="Add description"
                    className="min-h-[122px] w-full rounded-[6px] border border-[#dce5ef] px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-[#b2bac5] focus:border-[#1191da]"
                  />
                </label>
                <LabeledInput label="Portfolio" name="portfolio" value={formValues.portfolio} onChange={onInputChange} placeholder="Enter portfolio" />
              </div>

              <ValidationMessage message={errorMessage} />

              <div className="mt-7 flex justify-center">
                <button
                  type="button"
                  onClick={() => onTabChange('advanced')}
                  className="inline-flex min-w-[112px] items-center justify-center rounded-full bg-[#1191da] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0b82c7]"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid gap-5 md:grid-cols-2">
                <LabeledInput label="Budget" type="number" min="0" name="budget" value={formValues.budget} onChange={onInputChange} placeholder="0" />
                <LabeledSelect label="No Billing" name="billing" value={formValues.billing} onChange={onInputChange}>
                  {billingOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </LabeledSelect>
              </div>

              <div className="mt-5">
                <p className="text-[13px] font-medium text-[#1f2937]">Options</p>
                <div className="mt-3 space-y-2.5">
                  {optionFields.map((option) => (
                    <label key={option.key} className="flex items-start gap-2 text-sm text-[#6b7280]">
                      <input
                        type="checkbox"
                        checked={formValues.options[option.key]}
                        onChange={() => onOptionToggle(option.key)}
                        className="mt-0.5 h-4 w-4 rounded border border-[#cfd8e3]"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 max-w-[340px]">
                <LabeledSelect
                  label="Default Task Schedule"
                  name="defaultTaskSchedule"
                  value={formValues.defaultTaskSchedule}
                  onChange={onInputChange}
                >
                  {taskScheduleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </LabeledSelect>
              </div>

              <ValidationMessage message={errorMessage} />

              <div className="mt-9 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-w-[112px] items-center justify-center rounded-full bg-[#e6f4ff] px-7 py-3 text-sm font-semibold text-[#1191da] transition hover:bg-[#d5ecff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex min-w-[112px] items-center justify-center rounded-full bg-[#1191da] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0b82c7]"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

function LabelText({ label, required = false }) {
  return (
    <span className="mb-2 block text-[13px] font-medium text-[#1f2937]">
      {label}
      {required ? <span className="text-[#ef4444]">*</span> : null}
    </span>
  )
}

function LabeledInput({ label, required = false, type = 'text', ...props }) {
  return (
    <label className="block">
      <LabelText label={label} required={required} />
      <input
        type={type}
        {...props}
        className="h-11 w-full rounded-[6px] border border-[#dce5ef] px-3 text-sm text-slate-700 outline-none transition placeholder:text-[#b2bac5] focus:border-[#1191da]"
      />
    </label>
  )
}

function LabeledSelect({ children, label, required = false, ...props }) {
  return (
    <label className="block">
      <LabelText label={label} required={required} />
      <select
        {...props}
        className="h-11 w-full rounded-[6px] border border-[#dce5ef] bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1191da]"
      >
        {children}
      </select>
    </label>
  )
}

function ValidationMessage({ message }) {
  if (!message) {
    return null
  }

  return (
    <div className="mt-5 flex items-start gap-2 rounded-[10px] border border-[#fee2e2] bg-[#fff7f7] px-3 py-2 text-sm text-[#b91c1c]">
      <CircleAlert size={16} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  )
}

export default CreateProjectWizardModal
