import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, History, User, Clock, Workflow, CheckCircle, RefreshCcw, Trash2, ArrowUpDown } from 'lucide-react';
import { useTicketController } from '@/hooks/shared/useTickets';
import { useAuth } from '@/shared/context/AuthContext';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badge';
import SLABadge from '@/components/shared/SLABadge';
import CommentSection from '@/components/shared/CommentSection';
import InternalNotes from '@/components/agent/InternalNotes';
import { formatDateTime } from '@/shared/utils/formatDate';
import { getAllowedTransitions } from '@/shared/utils/fsmTransitions';
import { getTicketAuditLog } from '@/services/agent/auditService';
import { useNavigate } from 'react-router-dom';

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { ticket, loading, error, fetchOne, changeStatus, assign, changePriority, removeTicket } = useTicketController();
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { 
    fetchOne(id); 
    getTicketAuditLog(id).then(d => setAuditLogs(d.logs)).catch(() => {});
  }, [id, fetchOne]);

  if (loading || !ticket) return (
    <div className="p-12 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

  const allowedNext = getAllowedTransitions(ticket.status, user.role);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto pb-12 space-y-6">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between text-[13px] font-semibold tracking-wide text-gray-500 mb-2 uppercase">
        <Link to="/agent/queue" className="hover:text-primary flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={14} /> Back to Queue
        </Link>
        <button 
          onClick={() => setShowAudit(!showAudit)} 
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 transition-colors bg-elevated px-3 py-1.5 rounded-lg border border-border"
        >
          <History size={14} /> {showAudit ? 'Hide Audit Log' : 'Show Audit Log'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Pane */}
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="border-b border-border pb-6 mb-6">
                <h1 className="text-2xl font-extrabold text-gray-100 mb-4 tracking-tight">{ticket.title}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <User size={14} className="text-gray-500" /> Created by: <span className="text-gray-200">User #{ticket.createdBy}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-500" /> {formatDateTime(ticket.createdAt)}
                  </span>
                  {ticket.reopened && (
                    <span className="flex items-center gap-1.5 text-amber-500 border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 rounded text-xs font-bold tracking-wider uppercase">
                      <RefreshCcw size={12} /> Reopened
                    </span>
                  )}
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-gray-300 text-[15px] whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              </div>

              <CommentSection ticketId={ticket.id} />
              <InternalNotes ticketId={ticket.id} />
            </div>
          </div>
        </motion.div>

        {/* Sidebar Actions Pane */}
        <motion.div initial={{ x: 20 }} animate={{ x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          
          {/* Properties Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5">Ticket Properties</h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-2">Status</p>
                <div className="flex"><StatusBadge status={ticket.status} /></div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-2">Priority</p>
                {user.role === 'admin' ? (
                  <div className="relative w-full max-w-[120px]">
                    <ArrowUpDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <select 
                      className="form-select w-full !pl-8 !py-1 !pr-6 !text-[11px] bg-elevated/50 border-border/60 hover:border-primary/50 font-bold uppercase tracking-wider text-gray-300 transition-colors"
                      value={ticket.priority}
                      onChange={e => changePriority(ticket.id, e.target.value)}
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex"><PriorityBadge priority={ticket.priority} /></div>
                )}
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-2">SLA Deadline</p>
                <SLABadge dueAt={ticket.sla_due_at} status={ticket.status} />
                <p className="text-[11px] text-gray-500 font-medium mt-1.5">{formatDateTime(ticket.sla_due_at)}</p>
              </div>

              <div className="pt-5 border-t border-border">
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-3">Assignee</p>
                {ticket.assignedTo ? (
                  <div className="flex items-center justify-between bg-elevated/50 p-2.5 rounded-xl border border-border">
                    <span className="text-sm font-bold text-gray-200 flex items-center gap-2">
                       <User size={16} className="text-gray-500"/> Agent #{ticket.assignedTo}
                    </span>
                    {ticket.assignedTo !== user.id && user.role === 'admin' && (
                      <button onClick={() => assign(ticket.id, user.id)} className="text-[11px] font-bold tracking-widest text-primary hover:text-primary-light uppercase">Reassign</button>
                    )}
                  </div>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => assign(ticket.id, user.id)} 
                    className="btn btn-primary w-full justify-center shadow-lg shadow-primary/20"
                  >
                    Claim This Ticket
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2"><Workflow size={14}/> Workflow Actions</h3>
            {allowedNext.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {allowedNext.map(next => (
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    key={next} 
                    onClick={() => changeStatus(ticket.id, next)}
                    className="btn btn-secondary w-full justify-center capitalize font-bold text-[13px] border-border/80 hover:border-gray-500"
                  >
                    Transition to {next}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="bg-elevated/50 p-4 rounded-xl border border-dashed border-border text-center">
                <CheckCircle size={24} className="mx-auto text-emerald-500/50 mb-2"/>
                <p className="text-xs text-gray-500 font-medium">No further transitions available.</p>
              </div>
            )}
          </div>

          {/* Admin Delete Card */}
          {user.role === 'admin' && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-xl">
              <h3 className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Trash2 size={14}/> Danger Zone</h3>
              <p className="text-[11px] text-red-400 mb-4">Permanently delete this ticket and all its associated comments and internal notes. This action cannot be reversed.</p>
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (window.confirm('Are you absolutely sure you want to delete this ticket?')) {
                    await removeTicket(ticket.id);
                    navigate('/agent/queue');
                  }
                }}
                className="btn btn-danger w-full justify-center text-[12px] opacity-80 hover:opacity-100"
              >
                Delete Ticket
              </motion.button>
            </div>
          )}

          {/* Audit Log Toggle */}
          <AnimatePresence>
          {showAudit && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-elevated/50 border border-border rounded-2xl p-6 overflow-hidden"
            >
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <History size={14} /> Change History
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-600 before:to-transparent">
                {auditLogs.map(log => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-600 bg-surface shrink-0 z-10">
                       <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    </div>
                    <div className="w-[calc(100%-2.5rem)] ml-3 p-3 rounded-xl bg-surface border border-border shadow-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-gray-300 uppercase">{log.actorName}</span>
                        <span className="text-[10px] font-medium text-gray-500">{formatDateTime(log.createdAt)}</span>
                      </div>
                      <p className="text-[13px] text-gray-400">
                        {log.action === 'status_changed' && <span>Changed status: <strong className="text-gray-200">{log.oldValue}</strong> → <strong className="text-gray-200">{log.newValue}</strong></span>}
                        {log.action === 'assigned' && <span>Assigned to <strong className="text-gray-200">{log.newValue}</strong></span>}
                        {log.action === 'priority_changed' && <span>Set priority: <strong className="text-gray-200">{log.newValue}</strong></span>}
                        {log.action === 'created' && <span>Created the ticket</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          </AnimatePresence>

        </motion.div>
      </div>
    </motion.div>
  );
};

export default TicketDetail;
