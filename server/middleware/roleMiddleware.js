// Role hierarchy: admin > agent > customer
const ROLE_LEVELS = { customer: 1, agent: 2, admin: 3 };

/**
 * requireRole('agent') — allows agent AND admin
 * requireRole('admin') — allows admin only
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  const userLevel = ROLE_LEVELS[req.user.role] ?? 0;
  const minRequired = Math.min(...roles.map((r) => ROLE_LEVELS[r] ?? 99));

  if (userLevel < minRequired) {
    return res.status(403).json({
      error: `Access denied. Required: ${roles.join(" or ")}, got: ${req.user.role}`,
    });
  }
  next();
};

module.exports = { requireRole };
