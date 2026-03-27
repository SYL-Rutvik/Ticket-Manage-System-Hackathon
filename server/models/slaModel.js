// ─── SLA Config Model ─────────────────────────────────────────────────────────
// Hours to resolve per priority (configurable by admin)
let slaConfig = {
  critical: 4,
  high: 8,
  medium: 24,
  low: 72,
};

const getAll = () => ({ ...slaConfig });

const getHours = (priority) => slaConfig[priority] ?? 24;

const update = (priority, hours) => {
  if (!slaConfig.hasOwnProperty(priority)) return null;
  slaConfig[priority] = parseInt(hours);
  return getAll();
};

const dueDateFor = (priority) => {
  const hours = getHours(priority);
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
};

module.exports = { getAll, getHours, update, dueDateFor };
