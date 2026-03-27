import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, Info } from 'lucide-react';
import { useAdminController } from '@/hooks/admin/useAdmin';
import { PriorityBadge } from '@/components/shared/Badge';

const SLAConfig = () => {
  const { sla, loading, error, fetchSLA, saveSLA } = useAdminController();

  useEffect(() => { fetchSLA(); }, [fetchSLA]);

  if (loading || !sla) return (
    <div className="p-12 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

  const handleSave = (priority, val) => {
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) saveSLA(priority, num);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl pb-12">
      <div className="page-header">
        <h1 className="page-title">SLA Configuration</h1>
        <p className="page-sub">Define maximum resolution timeframes in hours based on ticket priority.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Clock size={16}/> Resolution Targets
        </h3>
        
        <div className="space-y-4">
          <AnimatePresence>
            {['critical', 'high', 'medium', 'low'].map((priority, i) => (
              <motion.div 
                key={priority} 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-elevated/40 border border-border/50 hover:border-gray-500/50 transition-colors group"
              >
                
                <div className="flex flex-col gap-2">
                  <div className="flex"><PriorityBadge priority={priority} /></div>
                  <p className="text-[13px] text-gray-400 font-medium w-full max-w-sm">
                    Must be resolved within <strong className="text-gray-200 font-bold">{sla[priority]} hours</strong>. Breaches trigger alerts in dashboard.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="number" 
                      min="1" 
                      className="form-input w-28 pl-9 text-center font-mono font-bold text-sm bg-surface shadow-inner focus:ring-primary/20" 
                      defaultValue={sla[priority]}
                      onBlur={(e) => handleSave(priority, e.target.value)}
                    />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Hours</span>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[13px] font-medium text-blue-300/80 mt-8 flex items-start gap-3"
        >
          <Info size={18} className="shrink-0 mt-0.5 text-blue-500" />
          <p>Changes are saved automatically when you click outside the input field. These thresholds only apply to newly created tickets. Overdue tickets are permanently marked breached.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SLAConfig;
