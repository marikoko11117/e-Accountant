import React from 'react';
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface BalanceIndicatorProps {
  totalDebit: number;
  totalCredit: number;
}

/**
 * Live real-time debit/credit balance indicator.
 * Shows running totals and the remaining imbalance.
 * Green when balanced (|diff| < 0.001), amber/red when out of balance.
 */
const BalanceIndicator: React.FC<BalanceIndicatorProps> = ({ totalDebit, totalCredit }) => {
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.01 && totalDebit > 0;
  const isEmpty = totalDebit === 0 && totalCredit === 0;

  if (isEmpty) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <TrendingUp className="w-4 h-4 shrink-0" />
        <span>Enter amounts on the lines above — debits and credits will balance live here.</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
        isBalanced
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60'
      }`}
    >
      <div className="flex items-center gap-4 text-xs font-mono">
        {/* Debit total */}
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-slate-500 dark:text-slate-400 font-sans">DR</span>
          <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
            ${totalDebit.toFixed(2)}
          </span>
        </div>

        <span className="text-slate-300 dark:text-slate-600">|</span>

        {/* Credit total */}
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-slate-500 dark:text-slate-400 font-sans">CR</span>
          <span className="font-bold text-sm text-blue-700 dark:text-blue-300">
            ${totalCredit.toFixed(2)}
          </span>
        </div>

        {/* Difference */}
        {!isBalanced && (
          <>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center gap-1">
              <span className="text-amber-600 dark:text-amber-400 font-sans font-medium">
                Difference:
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-300">${diff.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isBalanced ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Balanced ✓
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Out of Balance
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default BalanceIndicator;
