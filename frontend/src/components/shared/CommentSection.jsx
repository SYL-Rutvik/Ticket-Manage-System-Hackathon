import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';
import { getComments, addComment } from '@/services/shared/commentService';
import { formatDateTime } from '@/shared/utils/formatDate';
import { useAuth } from '@/shared/context/AuthContext';

const CommentSection = ({ ticketId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getComments(ticketId)
      .then(data => {
        if (mounted) { setComments(Array.isArray(data) ? data : []); setLoading(false); }
      })
      .catch(() => {
        if (mounted) { setComments([]); setLoading(false); }
      });
    return () => { mounted = false; };
  }, [ticketId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    try {
      const added = await addComment(ticketId, newText, 'public', user.name);
      setComments([...comments, added]);
      setNewText('');
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="text-gray-400 text-sm animate-pulse flex items-center gap-2"><MessageSquare size={16} /> Loading comments...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
        <MessageSquare size={16} /> Public Discussion
      </h3>
      
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((c, i) => {
            const authorName = typeof c.user === 'object' ? c.user?.name : c.author;
            const isAuthor = authorName === user.name;
            return (
              <motion.div 
                key={c._id || i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-2xl border ${isAuthor ? 'bg-primary/10 border-primary/20 ml-8' : 'bg-surface border-border/60 mr-8'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-bold ${isAuthor ? 'text-primary-light' : 'text-gray-300'}`}>
                    {isAuthor ? 'You' : authorName}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">{formatDateTime(c.createdAt)}</span>
                </div>
                <p className="text-[14px] text-gray-300 whitespace-pre-wrap leading-relaxed">{c.message || c.text}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {comments.length === 0 && (
          <p className="text-sm text-gray-500 italic flex items-center gap-2 bg-surface/30 p-4 rounded-xl border border-dashed border-border">
            <AlertCircle size={16} /> No comments yet. Start the conversation!
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea 
            className="form-input min-h-[44px] h-[44px] py-3 resize-none pr-12 focus:h-[100px] transition-all bg-elevated/50 focus:bg-elevated" 
            placeholder="Type a public reply..." 
            value={newText} onChange={e => setNewText(e.target.value)} 
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit" 
          disabled={!newText.trim()}
          className="btn btn-primary h-[44px] w-[44px] !p-0 flex items-center justify-center shrink-0 rounded-xl"
        >
          <Send size={18} />
        </motion.button>
      </form>
    </div>
  );
};

export default CommentSection;
