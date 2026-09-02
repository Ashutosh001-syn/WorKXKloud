import { API_ENDPOINTS } from '../config/api'

// In-memory cache for assigned resources keyed by String(projectId)
const projectResourceCache = new Map()
const inFlightRequests = new Map()

/**
 * Extracts and normalizes assigned resources from a project's resource_allocations field.
 * Handles both parsed array and JSON string formats.
 */
export function normalizeResourceAllocations(allocations) {
  if (!allocations) return []
  
  let groups = []
  if (Array.isArray(allocations)) {
    groups = allocations
  } else if (typeof allocations === 'string') {
    try {
      groups = JSON.parse(allocations || '[]')
    } catch {
      groups = []
    }
  }

  const result = []
  const seenKeys = new Set()

  ;(Array.isArray(groups) ? groups : []).forEach((group) => {
    // Ignore Cost line-items (not personnel resources)
    if (group?.type === 'Cost') return

    const rows = Array.isArray(group?.rows) ? group.rows : []
    rows.forEach((row, idx) => {
      const name = (row.resourceName || row.name || row.resource_name || '').trim()
      if (!name) return

      const id = row.resource_id || row.id || `res-${idx}-${name}`
      const role = row.role || row.designation || 'Team Member'
      const key = `${id}__${name.toLowerCase()}`

      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        result.push({
          id,
          name,
          role,
          allocation: row.allocation !== undefined ? row.allocation : 100,
          workingDays: row.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          type: group.type || 'In-house',
        })
      }
    })
  })

  return result
}

/**
 * Fetches only the resources assigned by PMO to a specific project.
 * Uses dedicated project resources endpoint with fallback to project register allocations.
 * Includes in-flight deduplication and caching.
 *
 * @param {string|number} projectId
 * @param {boolean} forceRefresh
 * @returns {Promise<Array<{ id: string, name: string, role: string, allocation: number, type: string }>>}
 */
export async function fetchProjectAssignedResources(projectId, forceRefresh = false) {
  if (!projectId) return []

  const key = String(projectId)

  if (!forceRefresh && projectResourceCache.has(key)) {
    return projectResourceCache.get(key)
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)
  }

  const promise = (async () => {
    try {
      // Query project register and extract project's PMO resource_allocations
      const response = await fetch(API_ENDPOINTS.GET_PROJECT_LIST)
      const data = await response.json()
      if (!data?.success || !Array.isArray(data.data)) {
        projectResourceCache.set(key, [])
        return []
      }

      const project = data.data.find((p) => String(p.id) === key)
      if (!project) {
        projectResourceCache.set(key, [])
        return []
      }

      let resources = normalizeResourceAllocations(project.resource_allocations)

      // Cross-reference with master resource_list to ensure real numeric IDs
      try {
        const masterRes = await fetch(API_ENDPOINTS.RESOURCE_LIST)
        const masterData = await masterRes.json()
        const masterList = Array.isArray(masterData?.data) ? masterData.data : []
        if (masterList.length > 0) {
          resources = resources.map((r) => {
            const found = masterList.find(
              (m) =>
                String(m.name || '').trim().toLowerCase() === String(r.name || '').trim().toLowerCase()
            )
            return found ? { ...r, id: found.id } : r
          })
        }
      } catch {
        // ignore master lookup error
      }

      projectResourceCache.set(key, resources)
      return resources
    } catch (err) {
      console.warn(`Error fetching assigned resources for project ${projectId}:`, err)
      return []
    } finally {
      inFlightRequests.delete(key)
    }
  })()

  inFlightRequests.set(key, promise)
  return promise
}

/**
 * Parses a resource assignment string (e.g. "Dhananjay (60%), Rahul (40%)" or "Dhananjay, Rahul")
 * into a structured array of assignments.
 *
 * @param {string} str
 * @returns {Array<{ name: string, percent: number }>}
 */
export function parseMultiResourceString(str) {
  if (!str || typeof str !== 'string') return []
  const parts = str.split(',').map((p) => p.trim()).filter(Boolean)
  return parts.map((part) => {
    // Match "Name (80%)" or "Name [80%]" or "Name"
    const match = part.match(/^(.+?)(?:\s*[\(\[]\s*(\d+)\s*%\s*[\)\]])?$/)
    if (match) {
      const name = (match[1] || '').trim()
      const percent = match[2] !== undefined ? parseInt(match[2], 10) : null
      return { name, percent: !isNaN(percent) && percent !== null ? percent : 100 }
    }
    return { name: part, percent: 100 }
  }).filter((item) => item.name.length > 0)
}

/**
 * Formats an array of resource assignments into a clean display string.
 * e.g. [{ name: "Dhananjay", percent: 60 }, { name: "Rahul", percent: 40 }] -> "Dhananjay (60%), Rahul (40%)"
 *
 * @param {Array<{ name: string, percent?: number }>} items
 * @returns {string}
 */
export function formatMultiResourceString(items) {
  if (!Array.isArray(items) || items.length === 0) return ''
  return items
    .filter((item) => item && item.name)
    .map((item) => {
      const percent = item.percent !== undefined && item.percent !== null ? item.percent : 100
      return `${item.name} (${percent}%)`
    })
    .join(', ')
}

/**
 * Validates whether a given resource name, ID, or multi-resource string belongs to the project's assigned resources.
 *
 * @param {string|number} resourceIdentifier - Resource string (e.g. "Dhananjay (60%), Rahul (40%)")
 * @param {Array<{ id: string, name: string }>} projectResources - List of project resources
 * @returns {boolean}
 */
export function validateResourceInProject(resourceIdentifier, projectResources) {
  if (!resourceIdentifier) return false
  if (!Array.isArray(projectResources) || projectResources.length === 0) return false

  const parsed = parseMultiResourceString(String(resourceIdentifier))
  if (parsed.length === 0) return false

  // All extracted resource names must be in projectResources
  return parsed.every((item) => {
    const target = item.name.toLowerCase()
    return projectResources.some(
      (res) =>
        String(res.id).toLowerCase() === target ||
        String(res.name).trim().toLowerCase() === target
    )
  })
}

/**
 * Resolves a resource string (e.g. "asd (100%)") into comma-separated resource IDs.
 * Matches by ID or Name against project resources, falling back to master resource_list.
 */
export async function resolveResourceIds(resourceStr, projectResources = []) {
  if (!resourceStr) return ''
  const parsed = parseMultiResourceString(String(resourceStr))
  if (parsed.length === 0) return ''

  let resources = [...projectResources]

  const hasMissing = parsed.some(
    (item) =>
      !resources.some(
        (r) =>
          String(r.id) === String(item.name).trim() ||
          String(r.resource_id) === String(item.name).trim() ||
          String(r.name || r.resourceName || r.person_name || '').trim().toLowerCase() ===
            String(item.name).trim().toLowerCase()
      )
  )

  if (hasMissing) {
    try {
      const res = await fetch(API_ENDPOINTS.RESOURCE_LIST)
      const data = await res.json()
      if (data?.success && Array.isArray(data.data)) {
        resources = [...resources, ...data.data]
      }
    } catch {
      // ignore
    }
  }

  const ids = parsed
    .map((item) => {
      const itemName = String(item.name).trim().toLowerCase()
      const match = resources.find(
        (r) =>
          String(r.id) === String(item.name).trim() ||
          String(r.resource_id) === String(item.name).trim() ||
          String(r.name || r.resourceName || r.person_name || '').trim().toLowerCase() === itemName
      )
      if (match) {
        return String(match.id || match.resource_id || match.resources_id)
      }
      if (/^\d+$/.test(item.name.trim())) {
        return item.name.trim()
      }
      return null
    })
    .filter(Boolean)

  return ids.join(',')
}

/**
 * Clears the cached assigned resources for a project or all projects.
 */
export function clearProjectResourceCache(projectId = null) {
  if (projectId) {
    projectResourceCache.delete(String(projectId))
  } else {
    projectResourceCache.clear()
  }
}
