import { gantt } from 'dhtmlx-gantt'
import { LINK_FS, LINK_SS, LINK_FF, LINK_SF } from './ganttConstants'
import { hasCircularDependency } from './schedulingUtils'

// dhtmlx-gantt custom inline-editor for the Predecessor grid column: a
// hand-built WBS-node input + FS/SS/FF/SF type dropdown + lag-days input,
// wired directly through dhtmlx's editor_types API (show/hide/get_value/
// save/focus lifecycle methods) rather than React, since dhtmlx owns this
// DOM node's lifecycle entirely. `setAlertMessage` is threaded through so
// validation failures (unknown node, self-reference, circular dependency)
// surface in the same alert modal as everything else in the chart.
export function createPredecessorEditorConfig(setAlertMessage) {
  return {
    show: function (id, column, config, placeholder) {
      const task = gantt.getTask(id)
      const links = gantt.getLinks() || []
      const existingLink = links.find(l => String(l.target) === String(id))

      let currentWbs = ''
      let currentType = LINK_FS
      let currentLag = 0

      if (existingLink && gantt.isTaskExists(existingLink.source)) {
        const srcTask = gantt.getTask(existingLink.source)
        currentWbs = gantt.getWBSCode(srcTask) || ''
        currentType = parseInt(existingLink.type, 10)
        currentLag = existingLink.lag ? parseInt(existingLink.lag, 10) : 0
      }

      const TYPE_COLORS = {
        [LINK_FS]: { bg: '#dbeafe', color: '#1d4ed8', activeBg: '#2563eb' },
        [LINK_SS]: { bg: '#dcfce7', color: '#15803d', activeBg: '#16a34a' },
        [LINK_FF]: { bg: '#fef3c7', color: '#b45309', activeBg: '#d97706' },
        [LINK_SF]: { bg: '#f3e8ff', color: '#7c3aed', activeBg: '#8b5cf6' },
      }
      const getTypeColor = (v) => TYPE_COLORS[v] || TYPE_COLORS[LINK_FS]
      const typeLabels = { [LINK_FS]: 'FS', [LINK_SS]: 'SS', [LINK_FF]: 'FF', [LINK_SF]: 'SF' }

      const container = document.createElement('div')
      container.style.cssText = 'display:flex;align-items:stretch;gap:3px;width:100%;height:100%;padding:2px 4px;box-sizing:border-box;'

      const nodeInput = document.createElement('input')
      nodeInput.className = 'pred-editor-wbs-input'
      nodeInput.type = 'text'
      nodeInput.value = currentWbs
      nodeInput.placeholder = 'Node'
      nodeInput.title = 'Predecessor task number (WBS)'
      nodeInput.style.cssText = 'width:34px;flex:0 0 34px;height:28px;border:1.5px solid #e2e8f0;border-radius:6px;padding:0 4px;font-size:11px;text-align:center;outline:none;background:#fff;color:#0f172a;font-weight:700;font-family:inherit;transition:border-color 0.15s,box-shadow 0.15s;align-self:center;'

      const typeWrapper = document.createElement('div')
      typeWrapper.style.cssText = 'position:relative;flex:1 1 0;min-width:44px;align-self:center;'

      const typeBtn = document.createElement('button')
      typeBtn.type = 'button'
      typeBtn.dataset.value = String(currentType)

      const renderBtnContent = (typeVal) => {
        const tc = getTypeColor(typeVal)
        const lbl = typeLabels[typeVal] || 'FS'
        typeBtn.style.cssText = `width:100%;height:28px;border:1.5px solid ${tc.bg};border-radius:6px;background:${tc.bg};color:${tc.color};font-weight:700;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px;padding:0 6px;transition:all 0.15s;font-family:inherit;letter-spacing:0.3px;`
        typeBtn.innerHTML = `<span>${lbl}</span><svg width="8" height="8" viewBox="0 0 12 12" fill="none" style="opacity:0.6;flex-shrink:0;"><path d="M3 5L6 8L9 5" stroke="${tc.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      }
      renderBtnContent(currentType)

      const dropdown = document.createElement('div')
      dropdown.className = 'pred-type-dropdown-panel'
      dropdown.style.cssText = 'display:none;position:fixed;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,0.15),0 4px 12px rgba(0,0,0,0.08);z-index:99999;padding:5px;width:235px;box-sizing:border-box;'

      const header = document.createElement('div')
      header.style.cssText = 'padding:6px 10px 5px;font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;border-bottom:1px solid #f1f5f9;margin-bottom:3px;'
      header.textContent = 'When Start'
      dropdown.appendChild(header)

      const linkTypes = [
        { value: LINK_FS, label: 'FS', desc: 'Finish → Start' },
        { value: LINK_SS, label: 'SS', desc: 'Start → Start' },
        { value: LINK_FF, label: 'FF', desc: 'Finish → Finish' },
        { value: LINK_SF, label: 'SF', desc: 'Start → Finish' },
      ]

      const renderOptions = () => {
        dropdown.querySelectorAll('.pred-type-opt').forEach(el => el.remove())
        linkTypes.forEach(lt => {
          const tc = getTypeColor(lt.value)
          const isActive = parseInt(typeBtn.dataset.value, 10) === lt.value
          const opt = document.createElement('button')
          opt.type = 'button'
          opt.className = 'pred-type-opt'
          opt.style.cssText = `display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;border:none;border-radius:6px;cursor:pointer;font-size:12px;transition:background 0.1s;background:${isActive ? tc.bg : 'transparent'};font-family:inherit;outline:none;box-sizing:border-box;text-align:left;`
          opt.innerHTML = `
            <span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:20px;border-radius:4px;font-weight:700;font-size:10px;letter-spacing:0.4px;background:${isActive ? tc.activeBg : '#f1f5f9'};color:${isActive ? '#fff' : tc.color};">${lt.label}</span>
            <span style="color:${isActive ? '#0f172a' : '#64748b'};font-weight:${isActive ? '600' : '500'};flex:1;text-align:left;white-space:nowrap;">${lt.desc}</span>
            ${isActive ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${tc.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
          `
          opt.addEventListener('click', (e) => {
            e.stopPropagation()
            e.preventDefault()
            typeBtn.dataset.value = String(lt.value)
            renderBtnContent(lt.value)
            hideDropdown()
            renderOptions()
            nodeInput.focus()
          })
          dropdown.appendChild(opt)
        })
      }
      renderOptions()

      const positionDropdown = () => {
        const btnRect = typeBtn.getBoundingClientRect()
        const dropW = 235
        let left = btnRect.right - dropW
        if (left < 8) left = 8
        const viewportWidth = document.documentElement.clientWidth
        if (left + dropW > viewportWidth - 12) {
          left = viewportWidth - dropW - 12
        }
        dropdown.style.top = (btnRect.bottom + 4) + 'px'
        dropdown.style.left = left + 'px'
      }

      const showDropdown = () => { dropdown.style.display = 'block'; positionDropdown() }
      const hideDropdown = () => { dropdown.style.display = 'none' }

      typeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()
        if (dropdown.style.display !== 'none') hideDropdown()
        else showDropdown()
      })

      nodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault()
          if (dropdown.style.display !== 'none') hideDropdown()
          else showDropdown()
        }
      })

      const closeHandler = (e) => {
        if (!typeWrapper.contains(e.target) && !dropdown.contains(e.target)) hideDropdown()
      }
      document.addEventListener('mousedown', closeHandler, true)

      const scrollHandler = () => { if (dropdown.style.display !== 'none') positionDropdown() }
      window.addEventListener('scroll', scrollHandler, true)

      typeWrapper.appendChild(typeBtn)
      document.body.appendChild(dropdown)

      const divider = document.createElement('div')
      divider.className = 'pred-editor-divider'

      const lagWrapper = document.createElement('div')
      lagWrapper.style.cssText = 'flex:1 1 0;min-width:34px;align-self:center;'
      const lagInput = document.createElement('input')
      lagInput.type = 'text'
      lagInput.inputMode = 'numeric'
      lagInput.value = currentLag ? String(currentLag) : ''
      lagInput.placeholder = '±d'
      lagInput.title = 'Lag in days, e.g. -2 or 3'
      lagInput.style.cssText = 'width:100%;height:28px;border:1.5px solid #e2e8f0;border-radius:6px;padding:0 4px;font-size:11px;text-align:center;outline:none;background:#fff;color:#0f172a;font-weight:700;font-family:inherit;transition:border-color 0.15s,box-shadow 0.15s;box-sizing:border-box;'
      lagInput.addEventListener('input', () => {
        lagInput.value = lagInput.value.replace(/[^\d+-]/g, '').replace(/(?!^)[+-]/g, '')
      })
      lagWrapper.appendChild(lagInput)

      let dragging = false
      let startX = 0
      let startTypeWidth = 0
      let startLagWidth = 0

      const onPointerMove = (e) => {
        if (!dragging) return
        const dx = e.clientX - startX
        const totalWidth = startTypeWidth + startLagWidth
        let newTypeWidth = startTypeWidth + dx
        const minWidth = 30
        newTypeWidth = Math.max(minWidth, Math.min(totalWidth - minWidth, newTypeWidth))
        const newLagWidth = totalWidth - newTypeWidth
        typeWrapper.style.flex = `0 0 ${newTypeWidth}px`
        lagWrapper.style.flex = `0 0 ${newLagWidth}px`
      }
      const onPointerUp = () => {
        dragging = false
        divider.classList.remove('dragging')
        document.removeEventListener('mousemove', onPointerMove)
        document.removeEventListener('mouseup', onPointerUp)
      }
      divider.addEventListener('mousedown', (e) => {
        e.preventDefault()
        e.stopPropagation()
        dragging = true
        divider.classList.add('dragging')
        startX = e.clientX
        startTypeWidth = typeWrapper.getBoundingClientRect().width
        startLagWidth = lagWrapper.getBoundingClientRect().width
        document.addEventListener('mousemove', onPointerMove)
        document.addEventListener('mouseup', onPointerUp)
      })

      container.appendChild(nodeInput)
      container.appendChild(typeWrapper)
      container.appendChild(divider)
      container.appendChild(lagWrapper)

      placeholder.innerHTML = ''
      placeholder.appendChild(container)

      this._container = container
      this._dropdown = dropdown
      this._nodeInput = nodeInput
      this._typeBtn = typeBtn
      this._lagInput = lagInput
      this._closeHandler = closeHandler
      this._scrollHandler = scrollHandler

      requestAnimationFrame(() => { nodeInput.focus(); nodeInput.select() })
    },

    hide: function () {
      if (this._closeHandler) document.removeEventListener('mousedown', this._closeHandler, true)
      if (this._scrollHandler) window.removeEventListener('scroll', this._scrollHandler, true)
      if (this._dropdown && this._dropdown.parentNode) this._dropdown.parentNode.removeChild(this._dropdown)
      this._container = null
      this._dropdown = null
      this._nodeInput = null
      this._typeBtn = null
      this._lagInput = null
    },

    set_value: function () { /* handled in show() */ },

    get_value: function () {
      const wbs = this._nodeInput ? this._nodeInput.value.trim() : ''
      const linkType = this._typeBtn ? parseInt(this._typeBtn.dataset.value, 10) : LINK_FS
      const lagRaw = this._lagInput ? this._lagInput.value.trim() : ''
      const lag = lagRaw ? parseInt(lagRaw, 10) || 0 : 0
      return { wbs, linkType, lag }
    },

    is_changed: function () { return true },
    is_valid: function () { return true },

    save: function (id) {
      const val = this.get_value()

      const links = gantt.getLinks() || []
      links.filter(l => String(l.target) === String(id)).forEach(l => gantt.deleteLink(l.id))

      if (!val.wbs) return

      let sourceTask = null
      gantt.eachTask(t => {
        if (gantt.getWBSCode(t) === val.wbs) sourceTask = t
      })
      if (!sourceTask) {
        setAlertMessage(`No task found with node "${val.wbs}"`)
        return
      }
      if (String(sourceTask.id) === String(id)) {
        setAlertMessage('A task cannot be its own predecessor.')
        return
      }
      if (hasCircularDependency(sourceTask.id, id)) {
        setAlertMessage(`Node "${val.wbs}" would create a circular dependency.`)
        return
      }

      gantt.addLink({
        id: `link_${Date.now()}`,
        source: sourceTask.id,
        target: id,
        type: String(val.linkType),
        lag: val.lag || 0,
      })
    },

    focus: function () { if (this._nodeInput) this._nodeInput.focus() },
  }
}
