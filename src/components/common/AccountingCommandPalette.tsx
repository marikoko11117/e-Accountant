import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  FolderTree,
  Scale,
  FileSpreadsheet,
  Settings,
  Sparkles,
  Plus,
  X,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AccountingCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewJournalEntry?: () => void;
  onStartAuditFocus?: () => void;
}

export const AccountingCommandPalette: React.FC<AccountingCommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenNewJournalEntry,
  onStartAuditFocus,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      subtitle: 'Overview of accounts, trial balance, and roadmap',
      icon: FolderTree,
      category: 'Navigation',
      run: () => navigate('/dashboard'),
    },
    {
      id: 'nav-journal',
      label: 'Go to Journal Entries',
      subtitle: 'Double-entry ledger journal and balanced transactions',
      icon: BookOpen,
      category: 'Navigation',
      run: () => navigate('/journal'),
    },
    {
      id: 'action-new-entry',
      label: 'Record New Journal Entry',
      subtitle: 'Create a balanced multi-line debit & credit transaction',
      icon: Plus,
      category: 'Actions',
      run: () => {
        navigate('/journal');
        if (onOpenNewJournalEntry) onOpenNewJournalEntry();
      },
    },
    {
      id: 'nav-accounts',
      label: 'Go to Chart of Accounts',
      subtitle: 'Manage Assets, Liabilities, Equity, Revenue, and Expenses',
      icon: FolderTree,
      category: 'Navigation',
      run: () => navigate('/accounts'),
    },
    {
      id: 'nav-ledger',
      label: 'Go to General Ledger & T-Accounts',
      subtitle: 'Inspect running account balances and double-entry postings',
      icon: Scale,
      category: 'Navigation',
      run: () => navigate('/ledger'),
    },
    {
      id: 'nav-reports',
      label: 'Go to Financial Reports',
      subtitle: 'Trial Balance, Income Statement, and Balance Sheet',
      icon: FileSpreadsheet,
      category: 'Navigation',
      run: () => navigate('/reports'),
    },
    {
      id: 'action-audit-focus',
      label: 'Launch Audit & Reconciliation Focus Mode',
      subtitle: 'Immersive distraction-free reconciliation mode',
      icon: Sparkles,
      category: 'Focus',
      run: () => {
        if (onStartAuditFocus) onStartAuditFocus();
      },
    },
    {
      id: 'action-theme',
      label: isDark ? 'Switch to Light Mode' : 'Switch to Cosmic Dark Mode',
      subtitle: 'Toggle Liquid Glass theme appearance',
      icon: isDark ? Sun : Moon,
      category: 'Appearance',
      run: toggleTheme,
    },
    {
      id: 'nav-settings',
      label: 'Open Settings',
      subtitle: 'Currency, preferences, and data deletion',
      icon: Settings,
      category: 'Navigation',
      run: () => navigate('/settings'),
    },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl liquid-glass-elevated rounded-3xl p-4 sm:p-5 border border-white/20 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3 py-2 rounded-2xl bg-white/5 border border-white/10 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page name, or action (e.g. 'journal', 'audit')..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    action.run();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-2xl flex items-center justify-between gap-3 text-left hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/10 text-brand-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-white block truncate">
                        {action.label}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {action.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
                      {action.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
          <span>Xiaomi HyperOS Liquid Glass Engine</span>
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
