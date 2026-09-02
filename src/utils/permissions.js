/**
 * Utility to check if a user role has permission based on a list of allowed roles.
 * 
 * @param {string} userRole - The current user's role (e.g., 'admin', 'pm')
 * @param {string[]} allowedRoles - List of roles permitted to access a resource/route
 * @returns {boolean} - True if permitted, false otherwise
 */
export const hasPermission = (userRole, allowedRoles) => {
  if (!userRole) return false

  if (!allowedRoles || allowedRoles.length === 0) {
    return true
  }

  const normalizedRole = userRole.toLowerCase()

  return allowedRoles
    .map(role => role.toLowerCase())
    .includes(normalizedRole)
}

// Job-title roles Resource Master's own role dropdown offers (see
// roleTone in ResourceMasterPage.jsx) — a login with one of these is a
// team-member/resource account, not a PM or PMO/Admin login. "Project
// Manager" is deliberately excluded here since that already gets its own
// pm-side routing/menu; this set is only the roles that still need a
// dashboard of their own (My Tasks).
const RESOURCE_JOB_ROLES = ['tech lead', 'tester', 'management', 'architect', 'account manager']

export const isResourceRole = (userRole) => {
  if (!userRole) return false
  return RESOURCE_JOB_ROLES.includes(userRole.toLowerCase())
}