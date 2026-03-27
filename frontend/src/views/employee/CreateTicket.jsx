import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft,
  Lightbulb, PartyPopper, ArrowRight, Loader2, Hash
} from 'lucide-react';
import { useTicketController } from '@/hooks/shared/useTickets';
import { PROBLEM_TREE, PRIORITY } from '@/shared/utils/constants';

// ──────────────────────────────────────────────────────────
// Utility: compute priority from answers + problem rules
// ──────────────────────────────────────────────────────────
function computePriority(problem, answers) {
  if (!problem) return PRIORITY.MEDIUM;
  for (const rule of problem.priorityRules) {
    if (answers[rule.key] === rule.value) return rule.priority;
  }
  return problem.defaultPriority;
}

// ──────────────────────────────────────────────────────────
// Utility: should we escalate immediately (skip self-help)?
// ──────────────────────────────────────────────────────────
function shouldEscalate(problem, answers) {
  if (!problem?.selfResolvable) return true;
  for (const q of problem.subQuestions) {
    if (q.escalateIf && q.escalateIf.includes(answers[q.id])) return true;
  }
  return false;
}

// ──────────────────────────────────────────────────────────
// Build ticket description from sub-question answers
// ──────────────────────────────────────────────────────────
function buildDescription(problem, answers) {
  const lines = [`Issue Category: ${problem.label}`, ''];
  for (const q of problem.subQuestions) {
    const val = answers[q.id];
    if (val) lines.push(`${q.label}: ${val}`);
  }
  return lines.join('\n');
}

// ──────────────────────────────────────────────────────────
// Step 1 — Category Selector
// ──────────────────────────────────────────────────────────
const StepCategory = ({ selected, onSelect }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-extrabold text-white tracking-tight">What's the problem?</h2>
      <p className="text-gray-400 text-sm mt-1.5">Select the category that best describes your issue.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {PROBLEM_TREE.map(p => {
        const isSelected = selected?.id === p.id;
        return (
          <motion.button
            key={p.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(p)}
            className={`group text-left p-4 rounded-2xl border transition-all duration-200 ${isSelected
                ? 'bg-primary/10 border-primary ring-1 ring-primary/50 shadow-lg shadow-primary/10'
                : 'bg-elevated/40 border-border/80 hover:bg-elevated hover:border-border'
              }`}
          >
            <div className="text-3xl mb-3">{p.emoji}</div>
            <div className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
              {p.label}
            </div>
            <div className="text-[11px] text-gray-500 leading-relaxed">{p.description}</div>
          </motion.button>
        );
      })}
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────
// Step 2 — Sub-Questions
// ──────────────────────────────────────────────────────────
const StepSubQuestions = ({ problem, answers, onChange }) => (
  <div className="space-y-6">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{problem.emoji}</span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{problem.label}</h2>
      </div>
      <p className="text-gray-400 text-sm">Answer a few quick questions to help us understand the issue.</p>
    </div>

    <div className="space-y-6">
      {problem.subQuestions.map((q, qi) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: qi * 0.06 }}
          className="bg-elevated/30 border border-border/60 rounded-2xl p-5"
        >
          <label className="block text-sm font-bold text-gray-200 mb-3">
            <span className="text-primary/60 mr-2 font-mono text-xs">{qi + 1}.</span>
            {q.label}
          </label>

          {q.type === 'radio' && (
            <div className="flex flex-wrap gap-2">
              {q.options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(q.id, opt)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${answers[q.id] === opt
                      ? 'bg-primary/15 border-primary text-white ring-1 ring-primary/40'
                      : 'bg-elevated/50 border-border text-gray-400 hover:border-gray-500 hover:text-gray-200'
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === 'select' && (
            <select
              className="w-full bg-elevated/60 border border-border/80 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-primary transition-colors"
              value={answers[q.id] || ''}
              onChange={e => onChange(q.id, e.target.value)}
            >
              <option value="">— Select an option —</option>
              {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}

          {q.type === 'text' && (
            <input
              type="text"
              className="w-full bg-elevated/60 border border-border/80 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary transition-colors"
              placeholder={q.placeholder || 'Type your answer'}
              value={answers[q.id] || ''}
              onChange={e => onChange(q.id, e.target.value)}
            />
          )}
        </motion.div>
      ))}
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────
// Step 3 — Self-Help Checklist
// ──────────────────────────────────────────────────────────
const StepSelfHelp = ({ problem, checked, onToggle, onResolved, onNotFixed }) => {
  const allChecked = checked.length === problem.selfHelpSteps.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-5 bg-amber-500/8 border border-amber-500/25 rounded-2xl">
        <Lightbulb size={22} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-extrabold text-white">Before we create a ticket…</h2>
          <p className="text-gray-400 text-sm mt-1">
            Many <strong className="text-amber-300">{problem.label}</strong> issues can be fixed in minutes without waiting for support.
            Try these steps first — check each one as you go.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {problem.selfHelpSteps.map((step, idx) => {
          const done = checked.includes(idx);
          return (
            <motion.button
              key={idx}
              type="button"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onToggle(idx)}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 ${done
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-gray-200'
                  : 'bg-elevated/40 border-border/60 text-gray-400 hover:border-border hover:bg-elevated/60'
                }`}
            >
              <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'
                }`}>
                {done && <CheckCircle2 size={14} className="text-white fill-white" />}
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mr-2">Step {idx + 1}</span>
                <span className={`text-sm leading-relaxed ${done ? 'line-through opacity-60' : ''}`}>{step}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onResolved}
          disabled={!allChecked}
          className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-[0_4px_14px_rgba(16,185,129,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle2 size={18} />
          ✅ Problem is Solved — No ticket needed!
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onNotFixed}
          className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm bg-elevated border border-border/80 text-gray-300 hover:bg-hover hover:text-white transition-all"
        >
          <ArrowRight size={18} />
          ❌ Still not fixed — Create a ticket
        </motion.button>
      </div>

      {!allChecked && (
        <p className="text-[11px] text-gray-600 text-center">
          Check all steps above to confirm you've tried each fix.
        </p>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// Resolved State (no ticket needed)
// ──────────────────────────────────────────────────────────
const ResolvedState = ({ onBack }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-12 px-6"
  >
    <div className="text-6xl mb-6">🎉</div>
    <h2 className="text-2xl font-extrabold text-white mb-3">Great — Problem Solved!</h2>
    <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
      We're glad you got it working! No support ticket was created. If the issue comes back, come here anytime.
    </p>
    <motion.button
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
      onClick={onBack}
      className="mt-8 px-8 py-3.5 bg-primary hover:bg-primary-light text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all"
    >
      Back to My Tickets
    </motion.button>
  </motion.div>
);

// ──────────────────────────────────────────────────────────
// Step 4 — Ticket Form (pre-filled)
// ──────────────────────────────────────────────────────────
const StepTicketForm = ({ problem, answers, priority, onCreate, loading, error }) => {
  const autoTitle = `${problem.label} — ${answers[problem.subQuestions.find(q => q.id === 'symptom')?.id] || problem.label}`;
  const autoDesc = buildDescription(problem, answers);

  const [title, setTitle] = useState(autoTitle);
  const [description, setDesc] = useState(autoDesc);

  const priorityColor = {
    critical: 'text-red-400 bg-red-500/10 border-red-500/20',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    low: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  }[priority];

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ title, description, category: problem.category, priority });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Almost there — review your ticket</h2>
        <p className="text-gray-400 text-sm mt-1.5">We pre-filled the details from your answers. Edit if needed, then submit.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex gap-3 items-start">
          <AlertCircle size={18} className="shrink-0 mt-0.5" /><p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Priority badge (auto-locked) */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Auto-Priority:</span>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-lg border uppercase tracking-widest ${priorityColor}`}>
            {priority}
          </span>
          <span className="text-[10px] text-gray-600 italic">(calculated from your answers)</span>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
            Ticket Title
          </label>
          <input
            required
            className="w-full bg-elevated/40 border border-border/80 rounded-xl px-4 py-3.5 text-base text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
            Detailed Description
            <span className="ml-2 text-gray-600 font-normal normal-case">(feel free to add more detail)</span>
          </label>
          <textarea
            required
            className="w-full bg-elevated/40 border border-border/80 rounded-xl px-4 py-4 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[200px] leading-relaxed font-mono resize-y"
            value={description}
            onChange={e => setDesc(e.target.value)}
          />
        </div>

        {/* Category + priority info */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5 bg-elevated/50 border border-border/50 px-3 py-1.5 rounded-lg">
            <Hash size={11} /> Category: <strong className="text-gray-300 capitalize">{problem.category}</strong>
          </span>
          <span className="flex items-center gap-1.5 bg-elevated/50 border border-border/50 px-3 py-1.5 rounded-lg">
            {problem.emoji} Problem Type: <strong className="text-gray-300">{problem.label}</strong>
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-light text-white rounded-xl px-8 py-4 text-sm font-bold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            : <><Send size={18} /> Submit Support Ticket</>
          }
        </motion.button>
      </form>
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// Step Indicator
// ──────────────────────────────────────────────────────────
const StepDot = ({ label, active, done }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? 'bg-emerald-500 border-emerald-500 text-white' :
        active ? 'bg-primary border-primary text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]' :
          'bg-elevated border-border text-gray-600'
      }`}>
      {done ? <CheckCircle2 size={14} /> : <span>{label}</span>}
    </div>
  </div>
);

const STEP_LABELS = ['Category', 'Details', 'Self-Help', 'Ticket'];

// ──────────────────────────────────────────────────────────
// Main Wizard Component
// ──────────────────────────────────────────────────────────
const CreateTicket = () => {
  const navigate = useNavigate();
  const { create, error, loading } = useTicketController();

  const [step, setStep] = useState(0); // 0=category, 1=sub-q, 2=self-help, 3=form
  const [resolved, setResolved] = useState(false);
  const [problem, setProblem] = useState(null);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState([]);

  const priority = useMemo(() => computePriority(problem, answers), [problem, answers]);

  const handleAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));

  const goToSelfHelp = () => {
    // If escalation condition met or problem is not self-resolvable → skip step 2→4
    if (shouldEscalate(problem, answers)) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleCreate = async (ticketData) => {
    const newTicket = await create(ticketData);
    if (newTicket) navigate(`/employee/tickets/${newTicket.id}`);
  };

  const slideVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto pb-14"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Support Ticket</h1>
        <p className="text-gray-400 mt-2 text-sm font-medium">
          We'll guide you through a quick checklist — many issues can be solved in minutes without waiting.
        </p>
      </div>

      {/* Step Indicator */}
      {!resolved && (
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <StepDot label={i + 1} active={step === i} done={step > i} />
              <span className={`text-[11px] font-bold uppercase tracking-wider hidden sm:block ${step === i ? 'text-primary-light' : step > i ? 'text-emerald-400' : 'text-gray-600'
                }`}>{label}</span>
              {i < STEP_LABELS.length - 1 && (
                <div className={`hidden sm:block h-px w-8 mx-1 ${step > i ? 'bg-emerald-500' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Card */}
      <div className="bg-surface/50 border border-border/60 rounded-3xl p-6 md:p-10 shadow-2xl min-h-[400px]">
        <AnimatePresence mode="wait">

          {resolved ? (
            <motion.div key="resolved" {...slideVariants} transition={{ duration: 0.25 }}>
              <ResolvedState onBack={() => navigate('/employee/tickets')} />
            </motion.div>
          ) : step === 0 ? (
            <motion.div key="step0" {...slideVariants} transition={{ duration: 0.25 }}>
              <StepCategory selected={problem} onSelect={p => { setProblem(p); setAnswers({}); setChecked([]); }} />
              <div className="flex justify-end mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  disabled={!problem}
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next — Describe the issue <ChevronRight size={18} />
                </motion.button>
              </div>
            </motion.div>

          ) : step === 1 ? (
            <motion.div key="step1" {...slideVariants} transition={{ duration: 0.25 }}>
              <StepSubQuestions problem={problem} answers={answers} onChange={handleAnswer} />
              <div className="flex justify-between mt-8 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(0)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-400 bg-elevated border border-border hover:text-white hover:bg-hover transition-all"
                >
                  <ChevronLeft size={18} /> Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={goToSelfHelp}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all"
                >
                  Next <ChevronRight size={18} />
                </motion.button>
              </div>
            </motion.div>

          ) : step === 2 ? (
            <motion.div key="step2" {...slideVariants} transition={{ duration: 0.25 }}>
              <StepSelfHelp
                problem={problem}
                checked={checked}
                onToggle={idx => setChecked(prev => prev.includes(idx) ? prev.filter(x => x !== idx) : [...prev, idx])}
                onResolved={() => setResolved(true)}
                onNotFixed={() => setStep(3)}
              />
            </motion.div>

          ) : (
            <motion.div key="step3" {...slideVariants} transition={{ duration: 0.25 }}>
              <StepTicketForm
                problem={problem}
                answers={answers}
                priority={priority}
                onCreate={handleCreate}
                loading={loading}
                error={error}
              />
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setStep(problem.selfResolvable && !shouldEscalate(problem, answers) ? 2 : 1)}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  <ChevronLeft size={16} /> Go back
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CreateTicket;
