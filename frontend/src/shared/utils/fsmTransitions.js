// Allowed FSM status transitions per role
// key = current status, value = array of allowed next statuses
export const FSM = {
  customer: { resolved: ['open'] },
  agent:    { open: ['in-progress'], 'in-progress': ['resolved'] },
  admin:    { open: ['in-progress', 'closed'], 'in-progress': ['resolved', 'closed'], resolved: ['closed'] },
};

export const getAllowedTransitions = (currentStatus, role) =>
  FSM[role]?.[currentStatus] ?? [];

export const canTransition = (from, to, role) =>
  getAllowedTransitions(from, role).includes(to);
