import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, AlertCircle, Timer, HelpCircle, ChevronDown } from 'lucide-react';
import { useTicketController } from '@/hooks/shared/useTickets';
import { CATEGORY, PRIORITY } from '@/shared/utils/constants';

const PROBLEM_TEMPLATES = [
  { id: 'auth', label: 'Cannot login / Authentication Issue', priority: PRIORITY.HIGH, title: 'Authentication Issue' },
  { id: 'down', label: 'System completely unavailable', priority: PRIORITY.CRITICAL, title: 'System Outage' },
  { id: 'bug',  label: 'Found a software bug or error page', priority: PRIORITY.MEDIUM, title: 'Software Bug' },
  { id: 'req',  label: 'Access / Hardware Request', priority: PRIORITY.LOW, title: 'Access Request' },
  { id: 'other',label: 'Other / Custom Issue', priority: PRIORITY.MEDIUM, title: '' },
];

const CreateTicket = () => {
  const navigate = useNavigate();
  const { create, error, loading } = useTicketController();
  
  const [templateId, setTemplateId] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: CATEGORY[0], priority: PRIORITY.MEDIUM });
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update form state when template changes
  useEffect(() => {
    if (templateId) {
      const tmpl = PROBLEM_TEMPLATES.find(t => t.id === templateId);
      if (tmpl) {
        setForm(prev => ({ 
          ...prev, 
          priority: tmpl.priority,
          title: tmpl.id === 'other' ? '' : prev.title || tmpl.title
        }));
      }
    }
  }, [templateId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tmpl = PROBLEM_TEMPLATES.find(t => t.id === templateId);
    
    const finalTitle = tmpl && tmpl.id !== 'other' ? tmpl.title : form.title;
    
    const newTicket = await create({ ...form, title: finalTitle });
    if (newTicket) navigate(`/employee/tickets/${newTicket.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl mx-auto pb-10"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Support Ticket</h1>
        <p className="text-gray-400 mt-2 font-medium">Select your problem below and provide details to help our team assist you quickly.</p>
      </div>

      <div className="bg-surface/50 border border-border/60 rounded-3xl p-6 md:p-10 shadow-2xl">
        {error && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex gap-3 items-start overflow-hidden">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
             <label className="flex items-center gap-2 text-sm font-extrabold text-gray-300 uppercase tracking-widest"><HelpCircle size={16} className="text-primary"/> 1. What is the issue?</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {PROBLEM_TEMPLATES.map(tmpl => {
                 const isSelected = templateId === tmpl.id;
                 return (
                   <button 
                     key={tmpl.id}
                     type="button"
                     onClick={() => setTemplateId(tmpl.id)}
                     className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                       isSelected 
                         ? 'bg-primary/10 border-primary ring-1 ring-primary/50' 
                         : 'bg-elevated/40 border-border/80 hover:bg-elevated hover:border-border'
                     }`}
                   >
                     <div className="flex justify-between items-start">
                       <span className={`font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{tmpl.label}</span>
                       {tmpl.id !== 'other' && (
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                           tmpl.priority === PRIORITY.CRITICAL ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                           tmpl.priority === PRIORITY.HIGH ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                           tmpl.priority === PRIORITY.MEDIUM ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                           'text-gray-400 bg-gray-500/10 border-gray-500/20'
                         }`}>
                           {tmpl.priority}
                         </span>
                       )}
                     </div>
                   </button>
                 );
               })}
             </div>
          </div>

          <motion.div 
            initial={false}
            animate={{ opacity: templateId ? 1 : 0.5, pointerEvents: templateId ? 'auto' : 'none' }}
            className="space-y-8 pt-6 border-t border-border/50"
          >
            {templateId === 'other' && (
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">Custom Issue Title</label>
                <input 
                  required 
                  className="w-full bg-elevated/40 border border-border/80 rounded-xl px-4 py-3.5 text-base text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  placeholder="E.g., Missing files in shared drive"
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Category</label>
                <button 
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full bg-elevated/40 border border-border/80 rounded-xl px-4 py-3.5 flex items-center justify-between text-base text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all capitalize"
                >
                  {form.category}
                  <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute left-0 right-0 mt-2 bg-surface border border-border/80 rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
                    >
                      {CATEGORY.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, category: c });
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                            form.category === c ? 'bg-primary/20 text-primary-light' : 'text-gray-300 hover:bg-elevated hover:text-white'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Calculated Priority</label>
                </div>
                <div className="w-full bg-base/50 border border-border/50 rounded-xl px-4 py-3.5 flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded truncate uppercase tracking-widest border flex items-center gap-1.5 ${
                           form.priority === PRIORITY.CRITICAL ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                           form.priority === PRIORITY.HIGH ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                           form.priority === PRIORITY.MEDIUM ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                           'text-gray-400 bg-gray-500/10 border-gray-500/20'
                         }`}>
                    <Timer size={14}/> {form.priority} SLA
                  </span>
                  <span className="text-[11px] text-gray-500 italic">(Locked by template)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">Detailed Description</label>
              <textarea 
                required 
                className="w-full bg-elevated/40 border border-border/80 rounded-xl px-4 py-4 text-base text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[200px] leading-relaxed resize-y" 
                placeholder="1. What steps were you taking?&#10;2. What did you expect to happen?&#10;3. What actually happened?"
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                type="button" 
                onClick={() => navigate(-1)} 
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-gray-300 bg-elevated border border-border hover:bg-hover hover:text-white transition-all text-sm"
              >
                Cancel
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                type="submit" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white rounded-xl px-8 py-3.5 text-sm font-bold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.30)] disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading || !templateId}
              >
                <Send size={18} /> {loading ? 'Submitting...' : 'Submit Support Ticket'}
              </motion.button>
            </div>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateTicket;
