export const API_URL = 'http://localhost:5000/api';

export const ROLES = { CUSTOMER: 'customer', AGENT: 'agent', ADMIN: 'admin' };

export const STATUS = {
  OPEN:        'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED:    'resolved',
  CLOSED:      'closed',
};

export const PRIORITY = {
  CRITICAL: 'critical',
  HIGH:     'high',
  MEDIUM:   'medium',
  LOW:      'low',
};

export const CATEGORY = ['bug', 'feature', 'task', 'support'];

// Role default redirect after login
export const ROLE_HOME = {
  customer: '/customer/tickets',
  agent:    '/agent/queue',
  admin:    '/admin/dashboard',
};
