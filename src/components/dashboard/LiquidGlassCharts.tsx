import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  Scale,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Eye,
  Plus,
} from 'lucide-react';
import { Account, AccountType } from '../../types/account';
import { Link } from 'react-router-dom';

interface LiquidGlassChartsProps {
  accounts: Account[];
  onSeedRequested?: () => void;
  isSeeding?: boolean;
}

type ChartViewMode = 'categories' | 'allocation' | 'top_accounts';

// Color themes matching the cosmic Liquid Glass palette
const CATEGORY_COLORS: Record<AccountType, { solid: string; glow: string; gradient: string }> = {
  asset: {
    solid: '#38bdf8', // sky-400
    glow: 'rgba(56, 189, 248, 0.4)',
    gradient: 'from-sky-500 to-blue-600',
  },
  liability: {
    solid: '#fbbf24', // amber-400
    glow: 'rgba(251, 191, 36, 0.4)',
    gradient: 'from-amber-500 to-orange-600',
  },
  equity: {
    solid: '#818cf8', // indigo-400
    glow: 'rgba(129, 140, 248, 0.4)',
    gradient: 'from-indigo-500 to-violet-600',
  },
  income: {
    solid: '#34d399', // emerald-400
    glow: 'rgba(52, 211, 153, 0.4)',
    gradient: 'from-emerald-500 to-teal-600',
  },
  expense: {
    solid: '#f43f5e', // rose-500
    glow: 'rgba(244, 63, 94, 0.4)',
    gradient: 'from-rose-500 to-pink-600',
  },
};

// Realistic sample benchmark amounts when a brand new workspace hasn't recorded journal transactions yet
const BENCHMARK_BALANCES: Record<string, number> = {
  '1010': 48500, // Operating Checking
  '1020': 1200,  // Petty Cash
  '1050': 25000, // Business Savings
  '1200': 18400, // Accounts Receivable
  '1300': 14200, // Inventory Asset
  '1400': 3600,  // Prepaid Insurance
  '1500': 22000, // Furniture & Fixtures
  '2010': 8400,  // Accounts Payable
  '2020': 3200,  // Credit Card
  '2100': 6500,  // Accrued Payroll
  '2500': 15000, // Term Loan
  '3010': 50000, // Owner's Capital
  '3100': 49800, // Retained Earnings
};

export const LiquidGlassCharts: React.FC<LiquidGlassChartsProps> = ({
  accounts,
  onSeedRequested,
  isSeeding = false,
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('categories');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<AccountType | 'all'>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [useBenchmarkPreview, setUseBenchmarkPreview] = useState(false);

  // Check if current user accounts have any non-zero balances
  const rawTotalBalance = accounts.reduce((acc, a) => acc + Math.abs(a.currentBalance || 0), 0);
  const hasZeroActualBalances = rawTotalBalance === 0;

  // Decide whether to use benchmark preview
  const isPreviewMode = hasZeroActualBalances || useBenchmarkPreview;

  // Prepare accounts with active display balances
  const displayAccounts = useMemo(() => {
    return accounts.map((acc) => {
      let balance = acc.currentBalance || 0;
      if (isPreviewMode && balance === 0) {
        balance = BENCHMARK_BALANCES[acc.code] ?? 0;
      }
      return {
        ...acc,
        displayBalance: balance,
      };
    });
  }, [accounts, isPreviewMode]);

  // Aggregate Category Balances for Bar/Area view
  const categoryData = useMemo(() => {
    const types: AccountType[] = ['asset', 'liability', 'equity', 'income', 'expense'];
    return types.map((type) => {
      const filtered = displayAccounts.filter((a) => a.type === type && a.status === 'active');
      const totalBalance = filtered.reduce((sum, a) => sum + Math.abs(a.displayBalance), 0);
      return {
        type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        balance: totalBalance,
        count: filtered.length,
        color: CATEGORY_COLORS[type].solid,
      };
    });
  }, [displayAccounts]);

  // Capital Structure Data (Assets vs Liabilities vs Equity) for Donut Chart
  const capitalStructureData = useMemo(() => {
    const assetTotal = displayAccounts
      .filter((a) => a.type === 'asset')
      .reduce((sum, a) => sum + Math.abs(a.displayBalance), 0);
    const liabilityTotal = displayAccounts
      .filter((a) => a.type === 'liability')
      .reduce((sum, a) => sum + Math.abs(a.displayBalance), 0);
    const equityTotal = displayAccounts
      .filter((a) => a.type === 'equity')
      .reduce((sum, a) => sum + Math.abs(a.displayBalance), 0);

    const total = assetTotal + liabilityTotal + equityTotal;

    return [
      { name: 'Total Assets', value: assetTotal, color: '#38bdf8', type: 'asset', percent: total > 0 ? (assetTotal / total) * 100 : 0 },
      { name: 'Total Liabilities', value: liabilityTotal, color: '#fbbf24', type: 'liability', percent: total > 0 ? (liabilityTotal / total) * 100 : 0 },
      { name: 'Owner Equity', value: equityTotal, color: '#818cf8', type: 'equity', percent: total > 0 ? (equityTotal / total) * 100 : 0 },
    ].filter((item) => item.value > 0);
  }, [displayAccounts]);

  // Top Individual Accounts Data for ranked Bar view
  const topAccountsData = useMemo(() => {
    let pool = displayAccounts.filter((a) => a.status === 'active');
    if (selectedTypeFilter !== 'all') {
      pool = pool.filter((a) => a.type === selectedTypeFilter);
    }
    return pool
      .filter((a) => a.displayBalance > 0)
      .sort((a, b) => b.displayBalance - a.displayBalance)
      .slice(0, 8)
      .map((a) => ({
        code: a.code,
        name: a.name.length > 20 ? a.name.slice(0, 18) + '…' : a.name,
        fullName: a.name,
        balance: a.displayBalance,
        type: a.type,
        normalBalance: a.normalBalance,
        color: CATEGORY_COLORS[a.type].solid,
      }));
  }, [displayAccounts, selectedTypeFilter]);

  // Key Header Metrics
  const totalAssets = useMemo(() => {
    return displayAccounts
      .filter((a) => a.type === 'asset')
      .reduce((sum, a) => sum + Math.abs(a.displayBalance), 0);
  }, [displayAccounts]);

  const totalLiabilities = useMemo(() => {
    return displayAccounts
      .filter((a) => a.type === 'liability')
      .reduce((sum, a) => sum + Math.abs(a.displayBalance), 0);
  }, [displayAccounts]);

  const netPosition = totalAssets - totalLiabilities;
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  // Custom Glassmorphic Tooltip Component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];
    const data = item.payload;
    const val = Number(item.value ?? 0);
    const displayName = data?.fullName || data?.name || String(label ?? '');

    return (
      <div className="liquid-glass-elevated border border-white/30 dark:border-white/15 rounded-2xl p-3.5 shadow-2xl backdrop-blur-2xl text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: item.color || '#38bdf8' }}
            />
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
              {displayName}
            </span>
          </div>
          {data?.code && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 dark:bg-white/5 text-slate-400">
              #{data.code}
            </span>
          )}
        </div>

        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-slate-400 text-[11px]">Balance:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm tabular-nums">
            ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {data?.percent !== undefined && (
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Capital Share:</span>
            <span className="font-mono font-semibold text-brand-400">
              {data.percent.toFixed(1)}%
            </span>
          </div>
        )}

        {data?.type && (
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
            <span className="capitalize">{data.type}</span>
            {data.normalBalance && (
              <span className="uppercase font-mono text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                DR/CR: {data.normalBalance}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl space-y-6">
      {/* Liquid Glass Background Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* SVG Definitions for Liquid Glass Specular Gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="glassAssetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#0284c7" stopOpacity={0.25} />
          </linearGradient>
          <linearGradient id="glassLiabilityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#d97706" stopOpacity={0.25} />
          </linearGradient>
          <linearGradient id="glassEquityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.25} />
          </linearGradient>
          <linearGradient id="glassIncomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0.25} />
          </linearGradient>
          <linearGradient id="glassExpenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#e11d48" stopOpacity={0.25} />
          </linearGradient>
          <linearGradient id="areaCurveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Header & Chart Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 ring-1 ring-white/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Liquid Glass Account Visualizer</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/25">
                Recharts Live
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Interactive spatial charts mapping general ledger distributions, asset allocation, and capital balances.
          </p>
        </div>

        {/* View Switching Pills & Benchmark Preview Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Benchmark Preview Badge/Toggle */}
          {hasZeroActualBalances && (
            <button
              onClick={() => setUseBenchmarkPreview(!useBenchmarkPreview)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl liquid-glass-subtle text-[11px] font-semibold text-amber-600 dark:text-amber-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all press-bounce"
              title="Toggle preview with standard practice financial model"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{useBenchmarkPreview ? 'Showing Benchmark Model' : 'Preview Sample Model'}</span>
            </button>
          )}

          {/* View Mode Buttons */}
          <div className="flex items-center liquid-glass-subtle p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('categories')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all press-bounce ${
                viewMode === 'categories'
                  ? 'bg-white/80 dark:bg-white/15 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setViewMode('allocation')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all press-bounce ${
                viewMode === 'allocation'
                  ? 'bg-white/80 dark:bg-white/15 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Capital Donut</span>
            </button>

            <button
              onClick={() => setViewMode('top_accounts')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all press-bounce ${
                viewMode === 'top_accounts'
                  ? 'bg-white/80 dark:bg-white/15 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Top Accounts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Health Glass KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/10">
          <p className="text-[11px] font-semibold text-sky-500 uppercase tracking-wider flex items-center justify-between">
            <span>Total Assets</span>
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
          </p>
          <p className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            ${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/10">
          <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider flex items-center justify-between">
            <span>Total Liabilities</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
          </p>
          <p className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            ${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/10">
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider flex items-center justify-between">
            <span>Net Position (A - L)</span>
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
          </p>
          <p className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            ${netPosition.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/10">
          <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider flex items-center justify-between">
            <span>Debt-to-Asset</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </p>
          <p className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {debtToAssetRatio.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Main Interactive Chart Canvas */}
      <div className="min-h-[340px] w-full pt-2">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 ring-1 ring-brand-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Accounts Available to Chart
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Seed the standard chart of accounts or create accounts to generate live interactive charts.
            </p>
            {onSeedRequested && (
              <button
                onClick={onSeedRequested}
                disabled={isSeeding}
                className="mt-2 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 press-bounce"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Seed Standard Accounts</span>
              </button>
            )}
          </div>
        ) : viewMode === 'categories' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Account Category Volumes (Combined Balances)</span>
              <span className="flex items-center gap-1 text-[11px] text-brand-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Hover bars to inspect normal balance</span>
              </span>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip content={renderCustomTooltip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar
                    dataKey="balance"
                    radius={[10, 10, 0, 0]}
                    animationDuration={600}
                    animationEasing="ease-out"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.type === 'asset'
                            ? 'url(#glassAssetGrad)'
                            : entry.type === 'liability'
                            ? 'url(#glassLiabilityGrad)'
                            : entry.type === 'equity'
                            ? 'url(#glassEquityGrad)'
                            : entry.type === 'income'
                            ? 'url(#glassIncomeGrad)'
                            : 'url(#glassExpenseGrad)'
                        }
                        stroke={entry.color}
                        strokeWidth={1}
                        className="transition-all duration-200 hover:opacity-100"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : viewMode === 'allocation' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Donut Chart Area */}
            <div className="md:col-span-7 h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={renderCustomTooltip} />
                  <Pie
                    data={capitalStructureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={700}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {capitalStructureData.map((entry, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={entry.color}
                        fillOpacity={activeIndex === index ? 0.95 : 0.75}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={activeIndex === index ? 2 : 1}
                        className="transition-all duration-300"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Glass Center Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Total Capital
                </span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  ${(totalAssets + totalLiabilities).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-brand-400 font-medium">A = L + E</span>
              </div>
            </div>

            {/* Interactive Legend List */}
            <div className="md:col-span-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Capital Distribution
              </h4>
              {capitalStructureData.map((item, i) => (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`p-3 rounded-2xl liquid-glass-subtle transition-all cursor-pointer flex items-center justify-between border ${
                    activeIndex === i
                      ? 'border-white/30 shadow-md bg-white/10'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/20"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.percent.toFixed(1)}% of capital base
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white tabular-nums">
                    ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Top Accounts Ranked Bar View */
          <div className="space-y-4">
            {/* Filter by Category */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'asset', 'liability', 'equity', 'income', 'expense'] as (AccountType | 'all')[]).map(
                  (fType) => (
                    <button
                      key={fType}
                      onClick={() => setSelectedTypeFilter(fType)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all press-bounce capitalize ${
                        selectedTypeFilter === fType
                          ? 'bg-brand-500/20 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500/30'
                          : 'liquid-glass-subtle text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {fType}
                    </button>
                  )
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                Displaying highest magnitude accounts
              </span>
            </div>

            {topAccountsData.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 liquid-glass-subtle rounded-2xl">
                No active accounts with balances found for this filter.
              </div>
            ) : (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={topAccountsData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={renderCustomTooltip} />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="#818cf8"
                      strokeWidth={2}
                      fill="url(#areaCurveGrad)"
                      dot={{ r: 4, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-white/10 text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <Eye className="w-3.5 h-3.5 text-brand-400" />
          <span>
            {isPreviewMode
              ? 'Preview active: standard business accounting benchmarks shown'
              : 'Live sync: powered by General Ledger double-entry transactions'}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/ledger"
            className="inline-flex items-center space-x-1 font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-300 transition-colors"
          >
            <span>Inspect T-Accounts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/journal"
            className="inline-flex items-center space-x-1 font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-300 transition-colors"
          >
            <span>Record Entry</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
