import React from 'react';
import { Trash2 } from 'lucide-react';
import { Account } from '../../types/account';
import { JournalLine } from '../../types/journal';

interface JournalLineItemRowProps {
  /** Zero-based row index */
  index: number;
  line: Partial<JournalLine> & { debit: number; credit: number; accountId: string; lineDescription?: string };
  accounts: Account[];
  onChange: (index: number, field: keyof JournalLine | 'debit' | 'credit', value: string | number) => void;
  onDelete: (index: number) => void;
  canDelete: boolean;
}

/**
 * A single editable row in a journal entry line-item editor.
 * - Account selector (active accounts only, sorted by code)
 * - Debit amount input (disables credit if > 0)
 * - Credit amount input (disables debit if > 0)
 * - Optional line description
 * - Delete row button (disabled when only 2 rows remain)
 */
const JournalLineItemRow: React.FC<JournalLineItemRowProps> = ({
  index,
  line,
  accounts,
  onChange,
  onDelete,
  canDelete,
}) => {
  const activeAccounts = accounts
    .filter((a) => a.status === 'active')
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  const hasDebit = (line.debit || 0) > 0;
  const hasCredit = (line.credit || 0) > 0;

  function handleAmountChange(field: 'debit' | 'credit', raw: string) {
    const num = parseFloat(raw);
    onChange(index, field, isNaN(num) ? 0 : Math.round(num * 100) / 100);
  }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
      {/* Main row fields */}
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(180px,2fr)_1fr_1fr_minmax(120px,1.5fr)] gap-2">
        {/* Account selector */}
        <div>
          {index === 0 && (
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Account
            </label>
          )}
          <select
            value={line.accountId || ''}
            onChange={(e) => onChange(index, 'accountId', e.target.value)}
            className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none"
          >
            <option value="">— Select Account —</option>
            {activeAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.code} · {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Debit input */}
        <div>
          {index === 0 && (
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 mb-1">
              Debit (DR)
            </label>
          )}
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            disabled={hasCredit}
            value={hasDebit ? line.debit : ''}
            onChange={(e) => handleAmountChange('debit', e.target.value)}
            className={`w-full text-xs rounded-xl border px-3 py-2.5 text-right font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors
              ${hasCredit
                ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-300'
              }`}
          />
        </div>

        {/* Credit input */}
        <div>
          {index === 0 && (
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-1">
              Credit (CR)
            </label>
          )}
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            disabled={hasDebit}
            value={hasCredit ? line.credit : ''}
            onChange={(e) => handleAmountChange('credit', e.target.value)}
            className={`w-full text-xs rounded-xl border px-3 py-2.5 text-right font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors
              ${hasDebit
                ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300'
              }`}
          />
        </div>

        {/* Line description (optional) */}
        <div>
          {index === 0 && (
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Memo (Optional)
            </label>
          )}
          <input
            type="text"
            placeholder="Line note…"
            value={line.lineDescription || ''}
            onChange={(e) => onChange(index, 'lineDescription', e.target.value)}
            className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
      </div>

      {/* Delete button */}
      <div className={index === 0 ? 'mt-6' : ''}>
        <button
          type="button"
          onClick={() => onDelete(index)}
          disabled={!canDelete}
          title={canDelete ? 'Remove this line' : 'At least 2 lines are required'}
          className={`p-2.5 rounded-xl transition-colors ${
            canDelete
              ? 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
              : 'text-slate-200 dark:text-slate-700 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default JournalLineItemRow;
