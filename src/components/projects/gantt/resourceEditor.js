import { gantt } from 'dhtmlx-gantt'
import {
  parseMultiResourceString,
  formatMultiResourceString,
} from '../../../services/projectResourceService'

// Helper to auto-balance list of selected resources to strictly 100% total
function autoBalance100(list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const count = list.length
  const even = Math.floor(100 / count)
  const remainder = 100 - (even * count)
  return list.map((item, idx) => ({
    ...item,
    percent: idx === 0 ? even + remainder : even,
  }))
}

export function createResourceEditorConfig(getProjectResources, setAlertMessage) {
  let activeDropdown = null
  let activeBackdrop = null

  const closeDropdown = () => {
    if (activeDropdown && activeDropdown.parentNode) {
      activeDropdown.parentNode.removeChild(activeDropdown)
    }
    if (activeBackdrop && activeBackdrop.parentNode) {
      activeBackdrop.parentNode.removeChild(activeBackdrop)
    }
    activeDropdown = null
    activeBackdrop = null
  }

  return {
    show: function (id, column, config, placeholder) {
      const task = gantt.getTask(id)
      const currentVal = task.percentage || task.assignees || task.resource || task.resourceName || ''
      const projectResources = getProjectResources ? getProjectResources() : []
      let currentAllocations = parseMultiResourceString(String(currentVal)).map((item) => {
        const match = projectResources.find(
          (r) =>
            String(r.id) === String(item.name).trim() ||
            String(r.resource_id) === String(item.name).trim() ||
            String(r.name || '').trim().toLowerCase() === String(item.name).trim().toLowerCase()
        )
        return {
          ...item,
          name: match ? match.name : item.name,
        }
      })

      const container = document.createElement('div')
      container.style.cssText =
        'display:flex;align-items:center;width:100%;height:100%;padding:2px 4px;box-sizing:border-box;'

      const triggerBtn = document.createElement('button')
      triggerBtn.type = 'button'
      triggerBtn.className = 'custom-res-trigger-btn'
      triggerBtn.style.cssText =
        'width:100%;height:28px;border:1.5px solid #cbd5e1;border-radius:6px;background:#ffffff;color:#0f172a;font-weight:600;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:0 8px;transition:all 0.15s;font-family:inherit;outline:none;'

      const updateTriggerText = () => {
        if (currentAllocations.length === 0) {
          triggerBtn.innerHTML =
            '<span style="color:#94a3b8;font-weight:500;">Select resource...</span><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 5L6 8L9 5" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/></svg>'
        } else if (currentAllocations.length === 1) {
          triggerBtn.innerHTML = `<span style="color:#1d4ed8;font-weight:700;truncate;max-width:110px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;">${currentAllocations[0].name} (${currentAllocations[0].percent}%)</span><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 5L6 8L9 5" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round"/></svg>`
        } else {
          const total = currentAllocations.reduce((s, i) => s + (Number(i.percent) || 0), 0)
          triggerBtn.innerHTML = `<span style="color:#0f172a;font-weight:700;">${currentAllocations.length} Res (${total}%)</span><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 5L6 8L9 5" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/></svg>`
        }
      }

      updateTriggerText()
      container.appendChild(triggerBtn)
      placeholder.appendChild(container)

      // Popup Panel Creation
      const openPopup = () => {
        closeDropdown()

        const rect = triggerBtn.getBoundingClientRect()
        const popup = document.createElement('div')
        popup.className = 'custom-res-popup-panel'
        popup.style.cssText =
          'position:fixed;width:280px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 16px 36px rgba(0,0,0,0.18);z-index:999999;padding:12px;display:flex;flex-direction:column;gap:10px;font-family:Inter,system-ui,sans-serif;box-sizing:border-box;'

        let top = rect.bottom + 4
        let left = rect.left
        if (left + 280 > window.innerWidth) left = window.innerWidth - 290
        if (left < 10) left = 10
        if (top + 300 > window.innerHeight) top = Math.max(10, rect.top - 310)

        popup.style.top = `${top}px`
        popup.style.left = `${left}px`

        const backdrop = document.createElement('div')
        backdrop.style.cssText =
          'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999998;background:transparent;'
        backdrop.addEventListener('click', () => {
          closeDropdown()
        })

        // Header
        const header = document.createElement('div')
        header.style.cssText =
          'display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f1f5f9;padding-bottom:6px;'

        const renderHeaderContent = () => {
          const total = currentAllocations.reduce((s, i) => s + (Number(i.percent) || 0), 0)
          header.innerHTML = `
            <span style="font-size:12px;font-weight:700;color:#0f172a;">Assign Resources</span>
            <span style="font-size:11px;font-weight:700;color:${total === 100 ? '#16a34a' : '#d97706'};background:${total === 100 ? '#dcfce7' : '#fef3c7'};padding:2px 6px;border-radius:4px;">
              Total: ${total}%
            </span>
          `
        }

        renderHeaderContent()
        popup.appendChild(header)

        // List Container
        const listContainer = document.createElement('div')
        listContainer.style.cssText =
          'display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;padding-right:2px;'

        const renderList = () => {
          listContainer.innerHTML = ''

          if (projectResources.length === 0) {
            listContainer.innerHTML =
              '<p style="font-size:11px;color:#94a3b8;text-align:center;padding:12px 0;margin:0;">No assigned resources for this project.</p>'
            return
          }

          projectResources.forEach((res) => {
            const assigned = currentAllocations.find(
              (p) => p.name.toLowerCase() === res.name.trim().toLowerCase()
            )
            const isSelected = Boolean(assigned)
            const percent = assigned ? assigned.percent : 0

            const row = document.createElement('div')
            row.style.cssText = `display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:8px;background:${
              isSelected ? '#eff6ff' : '#ffffff'
            };border:1px solid ${isSelected ? '#93c5fd' : '#e2e8f0'};cursor:pointer;`

            const left = document.createElement('div')
            left.style.cssText = 'display:flex;align-items:center;gap:8px;min-width:0;flex:1;'

            const chk = document.createElement('input')
            chk.type = 'checkbox'
            chk.checked = isSelected
            chk.style.cssText = 'width:15px;height:15px;cursor:pointer;accent-color:#2563eb;'

            const nameSpan = document.createElement('span')
            nameSpan.style.cssText = `font-size:12px;font-weight:${isSelected ? '700' : '600'};color:${
              isSelected ? '#1e3a8a' : '#334155'
            };white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`
            nameSpan.textContent = res.name

            left.appendChild(chk)
            left.appendChild(nameSpan)
            row.appendChild(left)

            const toggle = () => {
              if (isSelected) {
                currentAllocations = currentAllocations.filter(
                  (p) => p.name.toLowerCase() !== res.name.trim().toLowerCase()
                )
              } else {
                // When checking a new resource: give it the remaining % or 50% without altering other resources
                const currentSum = currentAllocations.reduce((s, i) => s + (Number(i.percent) || 0), 0)
                const remaining = Math.max(0, 100 - currentSum)
                const defaultPercent = currentAllocations.length === 0 ? 100 : (remaining > 0 ? remaining : 50)
                currentAllocations = [...currentAllocations, { name: res.name, percent: defaultPercent }]
              }
              renderList()
              renderHeaderContent()
              updateTriggerText()
            }

            row.addEventListener('click', (e) => {
              if (e.target.tagName !== 'INPUT') toggle()
            })
            chk.addEventListener('change', toggle)

            if (isSelected) {
              const right = document.createElement('div')
              right.style.cssText = 'display:flex;align-items:center;gap:3px;flex-shrink:0;'

              const numInput = document.createElement('input')
              numInput.type = 'number'
              numInput.min = '1'
              numInput.max = '100'
              numInput.value = String(percent || '')
              numInput.placeholder = '0'
              numInput.style.cssText =
                'width:48px;height:24px;border:1.5px solid #3b82f6;border-radius:6px;text-align:center;font-size:12px;font-weight:700;color:#0f172a;outline:none;background:#ffffff;padding:0 2px;'

              numInput.addEventListener('click', (e) => e.stopPropagation())
              numInput.addEventListener('input', (e) => {
                const raw = e.target.value
                const val = raw === '' ? 0 : Math.min(100, Math.max(0, parseInt(raw, 10) || 0))
                currentAllocations = currentAllocations.map((p) =>
                  p.name.toLowerCase() === res.name.trim().toLowerCase()
                    ? { ...p, percent: val }
                    : p
                )
                renderHeaderContent()
                updateTriggerText()
              })

              const pctLabel = document.createElement('span')
              pctLabel.style.cssText = 'font-size:11px;font-weight:700;color:#64748b;'
              pctLabel.textContent = '%'

              right.appendChild(numInput)
              right.appendChild(pctLabel)
              row.appendChild(right)
            }

            listContainer.appendChild(row)
          })
        }

        renderList()
        popup.appendChild(listContainer)

        // Footer
        const footer = document.createElement('div')
        footer.style.cssText =
          'display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f1f5f9;padding-top:8px;'

        if (currentAllocations.length > 1) {
          const splitBtn = document.createElement('button')
          splitBtn.type = 'button'
          splitBtn.textContent = 'Split 100% Evenly'
          splitBtn.style.cssText =
            'background:none;border:none;color:#2563eb;font-size:11px;font-weight:700;cursor:pointer;padding:0;'
          splitBtn.addEventListener('click', () => {
            currentAllocations = autoBalance100(currentAllocations)
            renderList()
            renderHeaderContent()
            updateTriggerText()
          })
          footer.appendChild(splitBtn)
        } else {
          const clearBtn = document.createElement('button')
          clearBtn.type = 'button'
          clearBtn.textContent = 'Clear All'
          clearBtn.style.cssText =
            'background:none;border:none;color:#ef4444;font-size:11px;font-weight:600;cursor:pointer;padding:0;'
          clearBtn.addEventListener('click', () => {
            currentAllocations = []
            renderList()
            renderHeaderContent()
            updateTriggerText()
          })
          footer.appendChild(clearBtn)
        }

        const saveAndClose = () => {
          const newVal = formatMultiResourceString(currentAllocations)
          try {
            if (gantt.isTaskExists(id)) {
              const task = gantt.getTask(id)
              if (task) {
                task.assignees = newVal
                task.resource = newVal
                gantt.updateTask(id)
              }
            }
          } catch {}
          closeDropdown()
        }

        const applyBtn = document.createElement('button')
        applyBtn.type = 'button'
        applyBtn.textContent = 'Done'
        applyBtn.style.cssText =
          'background:#2563eb;border:none;border-radius:6px;color:#ffffff;font-size:11px;font-weight:700;padding:5px 14px;cursor:pointer;margin-left:auto;'
        applyBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          saveAndClose()
        })

        footer.appendChild(applyBtn)
        popup.appendChild(footer)

        document.body.appendChild(backdrop)
        document.body.appendChild(popup)
        backdrop.addEventListener('click', () => {
          saveAndClose()
        })
        activeBackdrop = backdrop
        activeDropdown = popup
      }

      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        openPopup()
      })

      container._getAllocations = () => currentAllocations
      container._getInitialVal = () => currentVal
      container._triggerBtn = triggerBtn
      this._container = container
    },

    focus: function () {
      if (this._container && this._container._triggerBtn) {
        this._container._triggerBtn.focus()
      }
    },

    get_value: function (id, column, config, placeholder) {
      const container = this._container || (placeholder && placeholder.firstChild)
      if (container && container._getAllocations) {
        return formatMultiResourceString(container._getAllocations())
      }
      return ''
    },

    getValue: function (id, column, config, placeholder) {
      return this.get_value(id, column, config, placeholder)
    },

    is_valid: function () {
      return true
    },

    is_changed: function (value, id, column, config, placeholder) {
      const container = this._container || (placeholder && placeholder.firstChild)
      const initial = container && container._getInitialVal ? container._getInitialVal() : ''
      return value !== initial
    },

    set_value: function (value, id, column, config, placeholder) {
      if (gantt.isTaskExists(id)) {
        const task = gantt.getTask(id)
        if (task) {
          task.assignees = value
          task.resource = value
        }
      }
    },

    save: function (id) {
      const val = this.get_value()
      if (gantt.isTaskExists(id)) {
        const task = gantt.getTask(id)
        if (task) {
          task.assignees = val
          task.resource = val
          gantt.updateTask(id)
        }
      }
    },

    hide: function () {
      closeDropdown()
      this._container = null
    },
  }
}
