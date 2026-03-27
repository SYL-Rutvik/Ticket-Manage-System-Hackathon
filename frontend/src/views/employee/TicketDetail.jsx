import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Clock, RefreshCcw, Eye, AlertCircle, Hash, Info, RotateCcw, Radio } from 'lucide-react';
import { useLiveTicket } from '@/hooks/shared/useTickets';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badge';
import SLABadge from '@/components/shared/SLABadge';
import CommentSection from '@/components/shared/CommentSection';
import { formatDateTime } from '@/shared/utils/formatDate';

const TicketDetail = () => {
  const { id } = useParams();
  const { ticket, loading, error, changeStatus, lastUpdated, isPolling, refresh } = useLiveTicket(id, 30_000);

  if (loading || !ticket) return (
    <div className="min-h-[50vh] flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
    </div>
  );
  if (error) return (
    <div className="p-8 mt-10 text-center bg-red-500/10 border border-red-500/20 rounded-2xl max-w-lg mx-auto">
      <p className="text-red-400 font-bold">{error}</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* Header Actions */}
      <div className="flex items-center justify-between text-xs font-bold tracking-widest text-gray-500 mb-4 uppercase">
        <div className="flex items-center gap-3">
          <Link to="/employee/tickets" className="hover:text-primary flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={16} className="bg-elevated p-0.5 rounded-full" /> Back to My Tickets
          </Link>
          <span className="text-border">/</span>
          <span className="text-gray-400 flex items-center"><Hash size={12} />{ticket.id}</span>
        </div>

        {/* Live Update Indicator */}
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {isPolling ? (
              <motion.span
                key="polling"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full"
              >
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                Syncing...
              </motion.span>
            ) : (
              <motion.span
                key="live"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full"
              >
                <Radio size={10} className="animate-pulse" />
                Live · auto-updates every 30s
              </motion.span>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={refresh}
            disabled={isPolling}
            title="Refresh now"
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 transition-colors bg-elevated px-2.5 py-1 rounded-lg border border-border disabled:opacity-40"
          >
            <RotateCcw size={12} className={isPolling ? 'animate-spin' : ''} />
            <span className="text-[10px]">Refresh</span>
          </motion.button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-[10px] text-gray-600 text-right -mt-3 font-medium">
          Last synced: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      <motion.div
        initial={{ y: 20 }} animate={{ y: 0 }}
        className="bg-surface/50 border border-border/60 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 md:p-10">
          <div className="flex flex-col gap-6 border-b border-border/50 pb-8 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">{ticket.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-[13px] font-bold text-gray-400">
                <span className="flex items-center gap-1.5 bg-elevated/50 border border-border/50 px-3 py-1.5 rounded-lg shadow-sm">
                  <User size={14} className="text-primary" /> 
                  Submitted by {ticket.createdBy?.name || 'You'}
                  {ticket.createdBy?.location?.city && ` (${ticket.createdBy.location.city}, ${ticket.createdBy.location.state})`}
                </span>
                <span className="flex items-center gap-1.5 bg-elevated/50 border border-border/50 px-3 py-1.5 rounded-lg shadow-sm">
                  <Clock size={14} className="text-primary" /> {formatDateTime(ticket.createdAt)}
                </span>
                {ticket.reopened && (
                  <span className="flex items-center gap-1.5 text-amber-500 border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                    <RefreshCcw size={14} /> Reopened
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Employee Progress Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-elevated/40 border border-border/60 rounded-2xl p-5 hover:bg-elevated/60 transition-colors">
              <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Info size={14} /> Support Status</h4>
              <div className={`flex items-center gap-2 font-bold mb-2 ${ticket.assignedTo ? 'text-emerald-400' : 'text-amber-400'}`}>
                {ticket.assignedTo ? <><Eye size={18} /> Agent Assigned</> : <><AlertCircle size={18} /> Awaiting Review</>}
              </div>
              <p className="text-[13px] text-gray-400 font-medium leading-relaxed">{ticket.assignedTo ? 'A support agent is actively looking into your issue right now.' : 'Your ticket is currently in the queue waiting for assignment.'}</p>
            </div>

            <div className="bg-elevated/40 border border-border/60 rounded-2xl p-5 hover:bg-elevated/60 transition-colors">
              <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Info size={14} /> Ticket State</h4>
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={ticket.status} />
              </div>
              <p className="text-[13px] text-gray-400 font-medium leading-relaxed">
                {ticket.status === 'open' && 'We have successfully received your request.'}
                {ticket.status === 'in-progress' && 'We are actively working on a fix.'}
                {ticket.status === 'resolved' && 'We believe this issue has been resolved.'}
                {ticket.status === 'closed' && 'This ticket is permanently closed.'}
              </p>
            </div>

            <div className="bg-elevated/40 border border-border/60 rounded-2xl p-5 hover:bg-elevated/60 transition-colors">
              <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Info size={14} /> Estimated Resolution</h4>
              <div className="flex items-center gap-2 mb-3">
                <SLABadge dueAt={ticket.sla_due_at} status={ticket.status} />
              </div>
              <p className="text-[13px] text-gray-400 font-medium">{formatDateTime(ticket.sla_due_at)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-surface/80 border border-border/60 rounded-2xl p-5 mb-10 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-elevated rounded-xl border border-border/50">
                <AlertCircle size={20} className="text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">Assigned Target Priority</span>
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            {/* Employee Reopen Action */}
            {ticket.status === 'resolved' && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => changeStatus(ticket.id, 'open')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-sm flex items-center justify-center gap-2"
              >
                <RefreshCcw size={16} /> Reopen Ticket
              </motion.button>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-border/50 pb-2">Issue Description</h3>
            <div className="bg-elevated/20 rounded-2xl p-6 border border-border/30">
              <p className="text-gray-300 text-base whitespace-pre-wrap leading-loose">{ticket.description}</p>
            </div>
          </div>
        </div>

        {/* Public Comments */}
        <div className="bg-base/50 border-t border-border/60 p-6 md:p-10">
          <CommentSection ticketId={ticket.id} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TicketDetail;
