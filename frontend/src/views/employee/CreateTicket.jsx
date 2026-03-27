import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, X, AlertCircle, Timer } from 'lucide-react';
import { useTicketController } from '@/hooks/shared/useTickets';
import { CATEGORY, PRIORITY } from '@/shared/utils/constants';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { create, error, loading } = useTicketController();
  const [form, setForm] = useState({ title: '', description: '', category: CATEGORY[0], priority: PRIORITY.MEDIUM });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTicket = await create(form);
    if (newTicket) navigate(`/employee/tickets/${newTicket.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-3xl mx-auto pb-10"
    >
      <div className="page-header">
        <h1 className="page-title text-2xl font-bold">Create New Ticket</h1>
        <p className="page-sub text-gray-400 mt-1">Please provide as much detail as possible to help us resolve it quickly.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl">
        {error && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium flex gap-3 items-start overflow-hidden">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label className="form-label text-xs tracking-widest text-gray-500 mb-2">Title / Summary</label>
            <input 
              required className="form-input focus:ring-primary/20 text-base py-2.5" 
              placeholder="E.g., Cannot access billing dashboard"
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label text-xs tracking-widest text-gray-500 mb-2">Category</label>
              <select className="form-select text-base py-2.5" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORY.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                 <label className="form-label text-xs tracking-widest text-gray-500 mb-0">Priority</label>
                 {form.priority === PRIORITY.CRITICAL && <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20"><Timer size={10}/> ~4h SLA</span>}
                 {form.priority === PRIORITY.HIGH && <span className="text-[10px] font-bold text-orange-500 uppercase flex items-center gap-1 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20"><Timer size={10}/> ~24h SLA</span>}
                 {form.priority === PRIORITY.MEDIUM && <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"><Timer size={10}/> ~48h SLA</span>}
                 {form.priority === PRIORITY.LOW && <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 bg-gray-500/10 px-1.5 py-0.5 rounded border border-gray-500/20"><Timer size={10}/> ~72h SLA</span>}
              </div>
              <select className="form-select text-base py-2.5 w-full" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                {Object.values(PRIORITY).map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label text-xs tracking-widest text-gray-500 mb-2">Detailed Description</label>
            <textarea 
              required className="form-textarea min-h-[200px] text-base leading-relaxed" 
              placeholder="1. What steps were you taking?&#10;2. What did you expect to happen?&#10;3. What actually happened?"
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} 
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => navigate(-1)} className="btn btn-secondary px-6">
              <X size={16} /> Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary px-8 shadow-lg shadow-primary/20" disabled={loading}>
              <Send size={16} /> {loading ? 'Submitting...' : 'Submit Ticket'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateTicket;
