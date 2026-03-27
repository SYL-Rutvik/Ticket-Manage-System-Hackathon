import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, BookOpen, MessageCircle, FileText, Server } from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'Authentication & Access',
    icon: <BookOpen size={18} />,
    questions: [
      { q: "How do I reset my password?", a: "You can securely reset your password by visiting the 'Profile Settings' page from the main menu, provided you know your current password. If you are entirely locked out, please contact the IT Service Desk directly." },
      { q: "I'm receiving an 'Access Denied' error on a shared file.", a: "This usually means your account lacks the necessary permissions for that specific folder. Please create a new support ticket using the 'Access Request' template and specify the exact folder path." }
    ]
  },
  {
    category: 'Hardware & Network',
    icon: <Server size={18} />,
    questions: [
      { q: "How do I connect to the corporate VPN?", a: "The VPN client is pre-installed on all company-issued laptops. Search for 'AnyConnect' in your start menu, enter your employee portal credentials, and approve the multi-factor authentication prompt on your phone." },
      { q: "My monitor randomly goes black. What should I do?", a: "First, ensure the display cable (HDMI/DisplayPort) is firmly seated at both the monitor and the dock. Try restarting the dock by unplugging its power for 10 seconds. If the issue persists, submit a Hardware ticket." }
    ]
  },
  {
    category: 'General Software',
    icon: <FileText size={18} />,
    questions: [
      { q: "How do I request a new software license?", a: "Submit an 'Access Request' ticket. Ensure you include the exact name of the software and secure managerial approval in the ticket comments to speed up the procurement process." },
      { q: "My email client is not syncing correctly.", a: "Close the email client entirely. Reopen it and force a manual send/receive. If it still fails, check the bottom right corner for a 'Disconnected' status. A network drop might be the cause." }
    ]
  }
];

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const filteredData = FAQ_DATA.map(category => ({
    ...category,
    questions: category.questions.filter(faq => 
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-12">
      
      {/* Header section */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BookOpen size={28} className="text-primary" /> Knowledge Base
        </h1>
        <p className="text-gray-400 mt-2 font-medium">Find instant answers to common questions and troubleshooting steps.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-500" />
        </div>
        <input 
          type="text" 
          placeholder="Search articles, issues, and guides..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-surface border border-border/80 rounded-2xl pl-12 pr-4 py-4 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-lg"
        />
      </div>

      {/* FAQ Categories */}
      <div className="space-y-10">
        {filteredData.length === 0 ? (
          <div className="text-center py-16 bg-surface/40 border border-border/60 border-dashed rounded-3xl">
            <MessageCircle size={40} className="mx-auto text-gray-600 mb-4 stroke-1" />
            <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
            <p className="text-gray-400">We couldn't find any articles matching "{searchTerm}".</p>
          </div>
        ) : (
          filteredData.map((category, catIdx) => (
            <motion.div 
              key={category.category} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.1 }}
            >
              <h2 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="p-1.5 bg-elevated/50 rounded-lg text-gray-400">{category.icon}</span>
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((faq, qIdx) => {
                  const id = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div key={id} className="bg-surface/60 border border-border/80 rounded-xl overflow-hidden shadow-sm hover:border-primary/30 transition-colors">
                      <button 
                        onClick={() => setOpenIndex(isOpen ? null : id)}
                        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                      >
                        <span className="font-bold text-gray-200 pr-8">{faq.q}</span>
                        <ChevronDown 
                          size={18} 
                          className={`text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-elevated/40 border-t border-border/50"
                          >
                            <p className="p-5 text-gray-400 text-[14px] leading-relaxed font-medium">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))
        )}
      </div>

    </motion.div>
  );
};

export default KnowledgeBase;
