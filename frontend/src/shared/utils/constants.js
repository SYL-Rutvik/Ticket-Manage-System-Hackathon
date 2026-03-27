export const API_URL = 'http://localhost:5000/api';

export const ROLES = { EMPLOYEE: 'employee', AGENT: 'agent', ADMIN: 'admin' };

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

export const CATEGORY = ['software', 'hardware', 'network', 'access', 'other'];

export const CATEGORY_FOLLOWUP_QUESTIONS = {
  software: [
    { id: 'application', label: 'Which application is affected?', type: 'select', options: ['ERP', 'CRM', 'Email', 'Browser', 'Custom App'] },
    { id: 'version', label: 'App version/build (if known)', type: 'text', placeholder: 'e.g. v2.4.1' },
    { id: 'errorCode', label: 'Error code or message', type: 'text', placeholder: 'Paste exact error text' },
    { id: 'impact', label: 'Business impact', type: 'select', options: ['Single user blocked', 'Team slowed down', 'Department blocked', 'Critical outage'] },
  ],
  hardware: [
    { id: 'deviceType', label: 'Device type', type: 'select', options: ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Peripheral'] },
    { id: 'assetTag', label: 'Asset tag / serial number', type: 'text', placeholder: 'e.g. LT-2048' },
    { id: 'location', label: 'Current location', type: 'text', placeholder: 'Office / Floor / Desk' },
    { id: 'symptom', label: 'Primary symptom', type: 'select', options: ['Won\'t power on', 'Intermittent issue', 'Performance issue', 'Physical damage'] },
  ],
  network: [
    { id: 'networkType', label: 'Connection type', type: 'select', options: ['Wi-Fi', 'LAN', 'VPN', 'Remote Desktop'] },
    { id: 'scope', label: 'How many users are affected?', type: 'select', options: ['Only me', 'My team', 'Multiple teams', 'Company-wide'] },
    { id: 'location', label: 'Location when issue happens', type: 'text', placeholder: 'Office, home, branch, etc.' },
    { id: 'frequency', label: 'Issue frequency', type: 'select', options: ['Always', 'Often', 'Sometimes', 'One-time'] },
  ],
  access: [
    { id: 'systemName', label: 'System/resource name', type: 'text', placeholder: 'e.g. Finance Portal' },
    { id: 'accessType', label: 'Access needed', type: 'select', options: ['Read', 'Write', 'Admin', 'Temporary access'] },
    { id: 'managerApproved', label: 'Manager approval status', type: 'select', options: ['Approved', 'Pending', 'Not requested'] },
    { id: 'requiredBy', label: 'Required by date', type: 'text', placeholder: 'e.g. 2026-03-30' },
  ],
  other: [
    { id: 'context', label: 'Context of issue/request', type: 'text', placeholder: 'What were you trying to do?' },
    { id: 'impact', label: 'Expected impact if unresolved', type: 'text', placeholder: 'Describe business/user impact' },
  ],
};

// Role default redirect after login
export const ROLE_HOME = {
  employee: '/employee/tickets',
  customer: '/employee/tickets',
  agent:    '/agent/queue',
  admin:    '/admin/dashboard',
};
