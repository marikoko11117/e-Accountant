import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Receipt,
  Layers,
  Sparkles,
  FolderTree,
  Scale,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAccounts, seedStandardAccounts } from '../services/accountService';
import { getJournalStats } from '../services/journalService';
import { Account } from '../types/account';
import { LiquidGlassCharts } from '../components/dashboard/LiquidGlassCharts';
import { FiscalHealthRadarCard } from '../components/dashboard/FiscalHealthRadarCard';

export const DashboardPage: React.FC = () => {
  const { user, isDemo } = useAuth();
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalStats, setJournalStats] = useState({ total: 0, posted: 0, voided: 0 });
  const [isSeeding, setIsSeeding] = useState(false);

  const loadData = () => {
    if (!user) return;
    getAccounts(user.uid, isDemo).then(setAccounts).catch(console.error);
    getJournalStats(user.uid, isDemo).then(setJournalStats).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, [user, isDemo]);

  const handleSeedStandard = async () => {
    if (!user) return;
    try {
      setIsSeeding(true);
      const updated = await seedStandardAccounts(user.uid, isDemo);
      setAccounts(updated);
    } catch (err) {
      console.error('Failed to seed accounts from dashboard:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const activeAccounts = accounts.filter((a) => a.status === 'active');
  const assetCount = accounts.filter((a) => a.type === 'asset').length;
  const liabilityCount = accounts.filter((a) => a.type === 'liability').length;

  const totalAssetsBalance = accounts
    .filter((a) => a.type === 'asset')
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalLiabilitiesBalance = accounts
    .filter((a) => a.type === 'liability')
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const stageFeatures = [
    {
      title: 'Foundation & Security Rules',
      status: 'completed',
      description: 'Firebase Auth, Protected Routes, Security Rules, and Responsive Liquid Glass Shell.',
      badge: 'Completed',
    },
    {
      title: 'Chart of Accounts',
      status: 'completed',
      description: 'Hierarchical tree of Assets, Liabilities, Equity, Income, Expenses with normal balance rules.',
      link: '/accounts',
      badge: `${accounts.length} Accounts Active`,
    },
    {
      title: 'Double-Entry Journal',
      status: 'completed',
      description: 'Balanced multi-line validator ensuring live Debits == Credits balance before posting.',
      link: '/journal',
      badge: `${journalStats.posted} Posted`,
    },
    {
      title: 'General Ledger & T-Accounts',
      status: 'completed',
      description: 'Chronological account ledgers with visual T-Accounts and dynamic running balances.',
      link: '/ledger',
      badge: 'Interactive',
    },
    {
      title: 'Financial Reports',
      status: 'up-next',
      description: 'Trial Balance, Income Statement (P&L), Balance Sheet, and CSV ledger exports.',
      link: '/reports',
      badge: 'Roadmap Stage 5',
    },
    {
      title: 'Notion-Style Spatial Widgets',
      status: 'planned',
      description: 'Customizable draggable widgets with layout state saved per user in Firestore.',
      badge: 'Roadmap Stage 6',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner with Liquid Glass & Cosmic Glow */}
      <div className="relative overflow-hidden rounded-3xl liquid-glass-elevated p-6 sm:p-8 text-white border border-white/20 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>HyperOS Spatial Accounting Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
            {t('stage1.welcome')}, {user?.displayName || 'Practitioner'}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Floating liquid glass canvas for double-entry bookkeeping, general ledger reconciliation, and real-time balance sheets.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/accounts"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white text-slate-900 font-semibold text-xs shadow-lg hover:bg-slate-100 transition-all press-bounce"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Chart of Accounts ({accounts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/journal"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg border border-brand-400/40 transition-all press-bounce"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Record Journal Entry</span>
            </Link>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-white/10 text-xs font-medium border border-white/10 backdrop-blur">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isDemo ? 'Demo Mode Active' : 'Live Cloud Database'}</span>
            </div>
          </div>
        </div>

        {/* Ambient Nebula Specular Highlight */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-gradient-to-tr from-brand-600/30 to-purple-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Floating Liquid Glass Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-3xl liquid-glass border border-white/15 shadow-lg hover:liquid-glass-elevated transition-all duration-300 press-bounce group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Chart of Accounts</span>
            <FolderTree className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 text-2xl font-bold font-display text-slate-900 dark:text-white font-mono tabular-nums">
            {accounts.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {activeAccounts.length} Active · {assetCount} Assets, {liabilityCount} Liab.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-3xl liquid-glass border border-white/15 shadow-lg hover:liquid-glass-elevated transition-all duration-300 press-bounce group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Assets</span>
            <Receipt className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 text-2xl font-bold font-display text-slate-900 dark:text-white font-mono tabular-nums">
            ${totalAssetsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-400">Balanced Equation: A = L + E</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-3xl liquid-glass border border-white/15 shadow-lg hover:liquid-glass-elevated transition-all duration-300 press-bounce group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Liabilities</span>
            <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 text-2xl font-bold font-display text-slate-900 dark:text-white font-mono tabular-nums">
            ${totalLiabilitiesBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-400">Outstanding Vendor & Debt Balances</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-3xl liquid-glass border border-white/15 shadow-lg hover:liquid-glass-elevated transition-all duration-300 press-bounce group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Posted Transactions</span>
            <Layers className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 text-2xl font-bold font-display text-slate-900 dark:text-white font-mono tabular-nums">
            {journalStats.posted} Entries
          </p>
          <p className="mt-1 text-xs text-slate-400">Audited Double-Entry Ledger</p>
        </div>
      </div>

      {/* Interactive Liquid Glass Balance Analytics via Recharts */}
      <LiquidGlassCharts
        accounts={accounts}
        onSeedRequested={handleSeedStandard}
        isSeeding={isSeeding}
      />

      {/* Fiscal Health Multi-Axis Radar Card */}
      <FiscalHealthRadarCard accounts={accounts} />

      {/* Progressive Architecture & Pipeline Card */}
      <div className="p-6 sm:p-7 rounded-3xl liquid-glass border border-white/15 shadow-xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Financial Workspace Architecture</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Live Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Xiaomi HyperOS Liquid Glass surfaces with real-time balance calculations
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Operational & Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {stageFeatures.map((f, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border transition-all duration-200 press-bounce ${
                f.status === 'completed'
                  ? 'border-emerald-400/30 bg-emerald-500/5 hover:bg-emerald-500/10'
                  : f.status === 'up-next'
                  ? 'border-brand-400/40 bg-brand-500/5 hover:bg-brand-500/10 ring-1 ring-brand-400/30'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {f.title}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    f.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/30'
                      : f.status === 'up-next'
                      ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-400/30'
                      : 'bg-white/10 text-slate-400 border-white/10'
                  }`}
                >
                  {f.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {f.description}
              </p>
              {f.link && (
                <Link
                  to={f.link}
                  className="mt-3 inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <span>Open Section</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
