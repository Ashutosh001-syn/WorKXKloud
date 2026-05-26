/**
 * Utility to check if a user role has permission based on a list of allowed roles.
 * 
 * @param {string} userRole - The current user's role (e.g., 'admin', 'pm')
 * @param {string[]} allowedRoles - List of roles permitted to access a resource/route
 * @returns {boolean} - True if permitted, false otherwise
 */
export const hasPermission = (userRole, allowedRoles) => {
  if (!userRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true; // No specific restrictions
  
  const normalizedRole = userRole.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
  
  return normalizedAllowedRoles.includes(normalizedRole);
};
