import { Timer, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatTimeRemaining } from '@/shared/utils/formatDate';

const SLABadge = ({ dueAt, status }) => {
  if (status === 'resolved' || status === 'closed') {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-widest">
        <CheckCircle2 size={12} /> SLA Met
      </span>
    );
  }

  const dueDate = new Date(dueAt);
  const now = new Date();
  const isBreached = now > dueDate;
  const rem = formatTimeRemaining(dueAt);

  if (isBreached) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.1)]">
        <AlertCircle size={12} className="animate-pulse" /> Breached {rem} ago
      </span>
    );
  }

  // Warning if less than 1 hour remains
  const diffMs = dueDate - now;
  const isWarning = diffMs < 3600000;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-widest border ${
      isWarning 
        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
        : 'bg-elevated text-gray-400 border-border'
    }`}>
      <Timer size={12} className={isWarning ? 'animate-pulse' : ''} /> {rem} left
    </span>
  );
};

export default SLABadge;
