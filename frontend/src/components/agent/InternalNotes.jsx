import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lock, AlertTriangle } from 'lucide-react';
import { getNotes, addNote } from '@/services/agent/noteService';
import { formatDateTime } from '@/shared/utils/formatDate';
import { useAuth } from '@/shared/context/AuthContext';

const InternalNotes = ({ ticketId }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);

  // Hidden from customers completely
  if (user?.role === 'customer') return null;

  useEffect(() => {
    let mounted = true;
    getNotes(ticketId).then(data => {
      if (mounted) { setNotes(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, [ticketId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    try {
      const added = await addNote(ticketId, newText, user.name);
      setNotes([...notes, added]);
      setNewText('');
    } catch (err) { alert(err.message); }
  };

  if (loading) return null;

  return (
    <div className="mt-8 pt-8 border-t border-amber-500/20">
      <div className="flex items-center gap-2 mb-6">
        <Lock size={16} className="text-amber-500" />
        <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Internal Notes</h3>
        <span className="text-[10px] text-amber-500/70 border border-amber-500/30 px-2 py-0.5 rounded-full ml-2">Agents & Admins Only</span>
      </div>
      
      <div className="space-y-3 mb-6">
        <AnimatePresence>
          {notes.map((n, i) => (
            <motion.div 
              key={n.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-amber-500">{n.author}</span>
                <span className="text-[10px] text-amber-500/60 font-medium">{formatDateTime(n.createdAt)}</span>
              </div>
              <p className="text-[14px] text-amber-100/90 whitespace-pre-wrap">{n.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        {notes.length === 0 && (
          <p className="text-xs text-amber-500/50 italic flex items-center gap-2">
            No internal notes found.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea 
          className="form-input bg-amber-500/5 border-amber-500/20 focus:border-amber-500/50 focus:ring-amber-500/10 min-h-[50px] py-3 pr-12 text-sm placeholder:text-amber-500/30 text-amber-100" 
          placeholder="Add a private note..." 
          value={newText} onChange={e => setNewText(e.target.value)} 
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit" 
          disabled={!newText.trim()}
          className="absolute right-2 bottom-2 p-2 bg-amber-500 text-amber-950 rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
        </motion.button>
      </form>
    </div>
  );
};

export default InternalNotes;
