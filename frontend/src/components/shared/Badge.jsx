const STATUS_CLASSES = {
  'open':        'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  'in-progress': 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  'resolved':    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  'closed':      'bg-gray-500/15 text-gray-400 border border-gray-500/30',
};

const PRIORITY_CLASSES = {
  critical: 'bg-red-500/15 text-red-400 border border-red-500/30',
  high:     'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  medium:   'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  low:      'bg-gray-500/15 text-gray-400 border border-gray-500/30',
};

const ROLE_CLASSES = {
  admin:    'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  agent:    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  customer: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
};

const STATUS_DOT = {
  'open': 'bg-blue-400', 'in-progress': 'bg-amber-400',
  'resolved': 'bg-emerald-400', 'closed': 'bg-gray-400',
};

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${STATUS_CLASSES[status] ?? ''}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] ?? 'bg-gray-400'}`} />
    {status}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${PRIORITY_CLASSES[priority] ?? ''}`}>
    {priority}
  </span>
);

export const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_CLASSES[role] ?? ''}`}>
    {role}
  </span>
);
