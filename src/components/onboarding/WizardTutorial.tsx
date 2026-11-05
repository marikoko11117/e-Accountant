import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FolderTree,
  Scale,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';

const WIZARD_DONE_KEY = 'e_accountant_wizard_done';

interface WizardStep {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  body: React.ReactNode;
  tip?: string;
}

const steps: WizardStep[] = [
  {
    icon: <Sparkles className="w-8 h-8 text-amber-400" />,
    title: 'Welcome to e-Accountant For You',
    subtitle: 'Your professional double-entry bookkeeping system',
    body: (
      <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          This 2-minute tour walks you through the core accounting workflow — from setting up
          your <strong className="text-slate-800 dark:text-slate-200">Chart of Accounts</strong> to
          posting your first <strong className="text-slate-800 dark:text-slate-200">Journal Entry</strong> and
          reviewing it in the <strong className="text-slate-800 dark:text-slate-200">General Ledger</strong>.
        </p>
        <p>
          Every entry follows strict <span className="font-semibold text-brand-600 dark:text-brand-400">double-entry accounting rules</span>{' '}
          — every debit has a matching credit, ensuring your books always balance.
        </p>
      </div>
    ),
  },
  {
    icon: <FolderTree className="w-8 h-8 text-brand-500" />,
    title: 'Step 1: Chart of Accounts',
    subtitle: 'The backbone of your accounting system',
    body: (
      <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          Every transaction is assigned to an <strong className="text-slate-800 dark:text-slate-200">account</strong>. Accounts
          are organized into five types:
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { type: 'Assets', code: '1xxx', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', note: 'What you own' },
            { type: 'Liabilities', code: '2xxx', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', note: 'What you owe' },
            { type: 'Equity', code: '3xxx', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', note: 'Ownership interest' },
            { type: 'Income', code: '4xxx', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', note: 'Revenue earned' },
            { type: 'Expenses', code: '5xxx', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', note: 'Costs incurred' },
          ].map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg font-mono ${item.color}`}>
                {item.code}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{item.type}</span>
              <span className="text-slate-400">— {item.note}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    tip: 'Navigate to "Chart of Accounts" in the sidebar to get started.',
  },
  {
    icon: <PlusCircle className="w-8 h-8 text-emerald-500" />,
    title: 'Step 2: Seed Your Accounts',
    subtitle: 'Get set up instantly with one click',
    body: (
      <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          Don't want to create accounts manually? Click{' '}
          <strong className="text-slate-800 dark:text-slate-200">"Seed Standard Accounts"</strong> on
          the Chart of Accounts page to instantly load 27 standard accounts tailored for private
          practices, bookkeepers, and small businesses.
        </p>
        <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-800/40">
          <p className="text-brand-700 dark:text-brand-300 font-semibold text-[11px] uppercase tracking-wider mb-1">
            Seeded Accounts Include:
          </p>
          <ul className="space-y-0.5 text-brand-600 dark:text-brand-400">
            {[
              '1010 · Operating Cash & Checking',
              '1200 · Accounts Receivable (A/R)',
              '2010 · Accounts Payable (A/P)',
              '4010 · Professional Services Revenue',
              '5010 · Office Rent & Facilities',
            ].map((a) => (
              <li key={a} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span className="font-mono">{a}</span>
              </li>
            ))}
            <li className="text-[11px] text-brand-400 pl-4">…and 22 more accounts</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    icon: <BookOpen className="w-8 h-8 text-indigo-500" />,
    title: 'Step 3: Post a Journal Entry',
    subtitle: 'Record every financial event as a balanced entry',
    body: (
      <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          Go to <strong className="text-slate-800 dark:text-slate-200">Journal Entries</strong> →
          click <strong className="text-slate-800 dark:text-slate-200">New Journal Entry</strong>.
        </p>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Example: Owner deposits $10,000 into the business
          </div>
          <table className="w-full text-xs font-mono">
            <thead className="bg-slate-50/60 dark:bg-slate-800/60 text-[10px] text-slate-400 uppercase">
              <tr>
                <th className="py-1.5 px-3 text-left">Account</th>
                <th className="py-1.5 px-3 text-right text-emerald-500">DR</th>
                <th className="py-1.5 px-3 text-right text-blue-500">CR</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300">1010 · Operating Cash</td>
                <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">$10,000</td>
                <td className="py-2 px-3 text-right text-slate-300 dark:text-slate-600">—</td>
              </tr>
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3 text-slate-700 dark:text-slate-300 pl-8">3010 · Owner's Capital</td>
                <td className="py-2 px-3 text-right text-slate-300 dark:text-slate-600">—</td>
                <td className="py-2 px-3 text-right text-blue-600 dark:text-blue-400 font-bold">$10,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    tip: 'The "Post Entry" button is only enabled when Debits = Credits.',
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-amber-500" />,
    title: 'Step 4: The Balancing Rule',
    subtitle: 'The golden rule of double-entry accounting',
    body: (
      <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          In double-entry accounting, <strong className="text-slate-800 dark:text-slate-200">every transaction affects at least two accounts</strong>.
          The total of all debits must always equal the total of all credits:
        </p>
        <div className="py-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-lg font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            Σ Debits = Σ Credits
          </p>
          <p className="text-[11px] text-slate-400 mt-1">This must hold for every entry, always.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900">
            <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-[11px] mb-1">Debit Increases:</p>
            <p className="text-emerald-600 dark:text-emerald-400">Assets, Expenses</p>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
            <p className="font-semibold text-blue-700 dark:text-blue-300 text-[11px] mb-1">Credit Increases:</p>
            <p className="text-blue-600 dark:text-blue-400">Liabilities, Equity, Income</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <Scale className="w-8 h-8 text-purple-500" />,
    title: 'Step 5: Review in the General Ledger',
    subtitle: 'See every account\'s full transaction history',
    body: (
      <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          The <strong className="text-slate-800 dark:text-slate-200">General Ledger</strong> shows all
          transactions for a specific account with a running balance calculated according to
          that account's normal balance direction.
        </p>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800 grid grid-cols-5 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Date</span><span>Entry #</span><span>Description</span>
            <span className="text-right text-emerald-500">DR</span>
            <span className="text-right text-blue-500">CR</span>
          </div>
          {[
            ['Oct 28', 'JE-0001', 'Capital deposit', '10,000', '—'],
            ['Oct 29', 'JE-0002', 'Paid rent', '—', '2,400'],
          ].map(([date, num, desc, dr, cr], i) => (
            <div key={i} className="grid grid-cols-5 px-3 py-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <span className="font-sans">{date}</span>
              <span className="text-brand-600 dark:text-brand-400">{num}</span>
              <span className="font-sans truncate">{desc}</span>
              <span className={`text-right ${dr !== '—' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-300 dark:text-slate-600'}`}>{dr !== '—' ? `$${dr}` : '—'}</span>
              <span className={`text-right ${cr !== '—' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-300 dark:text-slate-600'}`}>{cr !== '—' ? `$${cr}` : '—'}</span>
            </div>
          ))}
        </div>
        <p>Switch to <strong className="text-slate-800 dark:text-slate-200">T-Account View</strong> to see debits on the left and credits on the right — the classic bookkeeper's visual.</p>
      </div>
    ),
    tip: 'Use date filters to narrow ledger entries to a specific reporting period.',
  },
  {
    icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
    title: "You're All Set!",
    subtitle: 'Start building your books with confidence',
    body: (
      <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          Here's your quick-start checklist:
        </p>
        <div className="space-y-2">
          {[
            { done: false, text: 'Visit Chart of Accounts → Seed Standard Accounts' },
            { done: false, text: 'Create your first Journal Entry (try a capital deposit)' },
            { done: false, text: 'Open the General Ledger and select your Cash account' },
            { done: false, text: 'Toggle to T-Account View to see the classic split view' },
            { done: false, text: 'Check Reports (coming in Stage 5) for Trial Balance' },
          ].map((item, i) => (
            <label key={i} className="flex items-start gap-2 cursor-pointer group">
              <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 group-hover:border-brand-400 shrink-0 mt-0.5 transition-colors" />
              <span className="text-slate-600 dark:text-slate-400">{item.text}</span>
            </label>
          ))}
        </div>
        <p className="text-slate-400 text-[11px] pt-1">
          You can restart this tutorial anytime from <strong className="text-slate-600 dark:text-slate-300">Settings → Restart Tutorial</strong>.
        </p>
      </div>
    ),
  },
];

interface WizardTutorialProps {
  onClose: () => void;
}

/**
 * Multi-step onboarding wizard modal.
 * Shown automatically on first login; re-triggerable from Settings.
 * Persists completion in localStorage under WIZARD_DONE_KEY.
 */
const WizardTutorial: React.FC<WizardTutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const total = steps.length;
  const step = steps[currentStep];
  const isLast = currentStep === total - 1;
  const isFirst = currentStep === 0;

  const handleFinish = () => {
    localStorage.setItem(WIZARD_DONE_KEY, 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem(WIZARD_DONE_KEY, 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`rounded-full transition-all ${
                  i === currentStep
                    ? 'w-5 h-2 bg-brand-600 dark:bg-brand-400'
                    : i < currentStep
                    ? 'w-2 h-2 bg-brand-300 dark:bg-brand-600'
                    : 'w-2 h-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            Skip tour <X className="w-3 h-3" />
          </button>
        </div>

        {/* Step Content */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          {/* Icon + Title */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 shadow-sm">
              {step.icon}
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{step.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{step.subtitle}</p>
          </div>

          {/* Body */}
          <div>{step.body}</div>

          {/* Tip */}
          {step.tip && (
            <div className="mt-4 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/40 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>{step.tip}</span>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={isFirst}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <span className="text-[11px] text-slate-400">
            {currentStep + 1} / {total}
          </span>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Start Bookkeeping
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((s) => Math.min(total - 1, s + 1))}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardTutorial;

/**
 * Hook to determine if the wizard should be shown.
 * Returns true on first login (wizard not yet completed).
 */
export function useWizardState(): {
  shouldShowWizard: boolean;
  showWizard: () => void;
  hideWizard: () => void;
} {
  const [shouldShowWizard, setShouldShowWizard] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(WIZARD_DONE_KEY);
    if (!done) setShouldShowWizard(true);
  }, []);

  return {
    shouldShowWizard,
    showWizard: () => setShouldShowWizard(true),
    hideWizard: () => {
      localStorage.setItem(WIZARD_DONE_KEY, 'true');
      setShouldShowWizard(false);
    },
  };
}
