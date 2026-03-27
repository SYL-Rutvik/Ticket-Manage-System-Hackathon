import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTicketController } from '@/hooks/shared/useTickets';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badge';

const UserTicketsModal = ({ user, onClose, mode }) => {
    const navigate = useNavigate();
    const { tickets, loading, fetchAll } = useTicketController();

    useEffect(() => {
        if (mode === 'created') fetchAll({ createdBy: user.id });
        else fetchAll({ assignedTo: user.id });
    }, [user.id, mode, fetchAll]);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-end">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative bg-surface border-l border-border h-full w-full max-w-2xl shadow-2xl flex flex-col"
            >
                <div className="p-6 border-b border-border flex items-center justify-between bg-elevated/20">
                    <div>
                        <h2 className="text-xl font-extrabold text-white">Tickets by {user.name}</h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                            {mode === 'created' ? 'Submitted History' : 'Assignment History'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white bg-elevated/50 p-2 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-500 font-medium italic">
                            <Mail size={32} className="mb-4 opacity-20" />
                            This user hasn't {mode === 'created' ? 'created' : 'handled'} any tickets yet.
                        </div>
                    ) : (
                        tickets.map((t, i) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => navigate(`/agent/tickets/${t.id}`)}
                                className="bg-elevated/30 border border-border/50 p-4 rounded-2xl hover:bg-elevated/50 hover:border-primary/30 cursor-pointer transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-200 group-hover:text-primary-light">{t.title}</h4>
                                    <StatusBadge status={t.status} />
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 tracking-wider">
                                    <span className="uppercase">#{t.id}</span>
                                    <span className="opacity-30">•</span>
                                    <PriorityBadge priority={t.priority} />
                                    <span className="opacity-30">•</span>
                                    <span className="uppercase">{new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default UserTicketsModal;
