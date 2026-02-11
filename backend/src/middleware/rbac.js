/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role-based permissions for different endpoints
 */

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} - Express middleware function
 */
export function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }

    next();
  };
}

/**
 * Middleware to check if user is Global Admin
 */
export const requireGlobalAdmin = requireRole('Global Admin');

/**
 * Middleware to check if user is Admin (Global or Regional)
 */
export const requireAdmin = requireRole(['Global Admin', 'Regional Admin']);

/**
 * Middleware to check if user can access a specific region
 * Global Admin can access all regions
 * Regional Admin can only access their assigned region
 * Partners can access their assigned region
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Next middleware
 */
export function checkRegionAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
  }

  const userRole = req.user.role;
  const userRegion = req.user.region;

  // Global Admin can access all regions
  if (userRole === 'Global Admin') {
    return next();
  }

  // Get region from query params or body
  const requestedRegion = req.query.region || req.body.region;

  // If no region specified, allow (will be filtered in controller)
  if (!requestedRegion) {
    return next();
  }

  // Regional Admin and Partners can only access their assigned region
  if (userRegion !== 'All Regions' && requestedRegion !== userRegion) {
    return res.status(403).json({
      success: false,
      error: `Access denied. You can only access region: ${userRegion}.`,
    });
  }

  next();
}

/**
 * Middleware to filter resources by region based on user role
 * This is used in controllers to automatically filter results
 * @param {object} query - MongoDB query object (will be modified)
 * @param {object} user - User object from req.user
 */
export function applyRegionFilter(query, user) {
  const userRole = user.role;
  const userRegion = user.region;

  // Global Admin can see all regions
  if (userRole === 'Global Admin') {
    return; // No filter needed
  }

  // Regional Admin and Partners can only see their region
  if (userRegion !== 'All Regions') {
    query.region = userRegion;
  }
}

/**
 * Check if user can perform action on a resource
 * @param {object} user - User object
 * @param {string} resourceRegion - Region of the resource
 * @returns {boolean} - True if user can access resource
 */
export function canAccessResource(user, resourceRegion) {
  // Global Admin can access all resources
  if (user.role === 'Global Admin') {
    return true;
  }

  // Regional Admin and Partners can only access their region
  if (user.region === 'All Regions') {
    return true;
  }

  return user.region === resourceRegion;
}
