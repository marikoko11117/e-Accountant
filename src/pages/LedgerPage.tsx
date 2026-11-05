import React, { useState, useEffect, useCallback } from 'react';
import { Scale, Loader2, Search, ArrowUpDown, CalendarDays } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Account } from '../types/account';
import { getAccounts } from '../services/accountService';
import { getLedgerForAccount, formatLedgerDate, LedgerLine, LedgerSummary } from '../services/ledgerService';

export const LedgerPage: React.FC = () => {
  const { t } = useLanguage();
  const { user, isDemo } = useAuth();
  const [viewMode, setViewMode] = useState<'standard' | 't-account'>('standard');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [ledger, setLedger] = useState<LedgerSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountSearch] = useState('');

  // Load accounts on mount
  useEffect(() => {
    if (!user) return;
    setAccountsLoading(true);
    getAccounts(user.uid, isDemo)
      .then(setAccounts)
      .catch(console.error)
      .finally(() => setAccountsLoading(false));
  }, [user, isDemo]);

  // Load ledger when account or date range changes
  const loadLedger = useCallback(async () => {
    if (!user || !selectedAccountId) {
      setLedger(null);
      return;
    }
    const account = accounts.find((a) => a.id === selectedAccountId);
    if (!account) return;

    setLoading(true);
    setError(null);
    try {
      const summary = await getLedgerForAccount(
        user.uid,
        account,
        dateFrom || undefined,
        dateTo || undefined,
        isDemo
      );
      setLedger(summary);
    } catch (err) {
      setError('Failed to load ledger data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, isDemo, selectedAccountId, accounts, dateFrom, dateTo]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const filteredAccounts = accounts.filter((a) => {
    if (!accountSearch) return true;
    const q = accountSearch.toLowerCase();
    return a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
  });

  // Separate T-Account lines
  const debitLines = ledger?.lines.filter((l) => l.debit > 0) ?? [];
  const creditLines = ledger?.lines.filter((l) => l.credit > 0) ?? [];

  function formatBalance(val: number): string {
    const abs = Math.abs(val);
    const formatted = `$${abs.toFixed(2)}`;
    return val < 0 ? `(${formatted})` : formatted;
  }

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Scale className="w-6 h-6 text-brand-600" />
            <span>{t('nav.ledger')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('ledger.subtitle')}
          </p>
        </div>

        {/* View Toggle with Liquid Glass */}
        <div className="flex items-center liquid-glass p-1 rounded-2xl w-fit border border-white/15 dark:border-white/10 shadow-sm">
          <button
            onClick={() => setViewMode('standard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all press-bounce ${
              viewMode === 'standard'
                ? 'bg-white/15 text-brand-700 dark:text-brand-300 shadow-sm border border-brand-500/20'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('ledger.standardView')}
          </button>
          <button
            onClick={() => setViewMode('t-account')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all press-bounce ${
              viewMode === 't-account'
                ? 'bg-white/15 text-brand-700 dark:text-brand-300 shadow-sm border border-brand-500/20'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('ledger.tAccountView')}
          </button>
        </div>
      </div>

      {/* Filter Bar with Liquid Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Account Selector */}
        <div className="relative sm:col-span-1">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            {t('ledger.selectAccount')}
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              disabled={accountsLoading}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl liquid-glass border border-white/15 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 appearance-none disabled:opacity-60 transition-all shadow-sm"
            >
              <option value="">— {t('ledger.selectAccountPrompt')} —</option>
              {filteredAccounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                  {acc.code} · {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {t('ledger.dateFrom')}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full text-xs rounded-2xl liquid-glass border border-white/15 dark:border-white/10 px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all shadow-sm"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {t('ledger.dateTo')}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full text-xs rounded-2xl liquid-glass border border-white/15 dark:border-white/10 px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      {!selectedAccountId ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 mb-3">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('ledger.emptyTitle')}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            {t('ledger.emptySubtitle')}
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">{t('common.loading')}</span>
        </div>
      ) : error ? (
        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : ledger ? (
        <>
          {/* Account summary header */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-lg">
                    {ledger.account.code}
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ledger.account.name}
                  </h2>
                  <span className="text-xs text-slate-400 capitalize">
                    ({ledger.account.type} · {ledger.account.normalBalance} normal)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {ledger.lines.length} transaction{ledger.lines.length !== 1 ? 's' : ''} in range
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-center">
                  <p className="text-slate-400 font-sans text-[11px]">{t('common.debit')}</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    ${ledger.totalDebits.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 font-sans text-[11px]">{t('common.credit')}</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    ${ledger.totalCredits.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 font-sans text-[11px]">{t('common.balance')}</p>
                  <p
                    className={`font-bold ${
                      ledger.closingBalance >= 0
                        ? 'text-slate-900 dark:text-white'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatBalance(ledger.closingBalance)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {ledger.lines.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No transactions found for this account in the selected date range.
            </div>
          ) : viewMode === 'standard' ? (
            /* Standard Ledger View */
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3 px-4 font-semibold">{t('common.date')}</th>
                      <th className="py-3 px-4 font-semibold">{t('journal.entryNumber')}</th>
                      <th className="py-3 px-4 font-semibold">{t('common.description')}</th>
                      <th className="py-3 px-4 font-semibold text-right text-emerald-500">
                        {t('common.debit')}
                      </th>
                      <th className="py-3 px-4 font-semibold text-right text-blue-500">
                        {t('common.credit')}
                      </th>
                      <th className="py-3 px-4 font-semibold text-right">{t('common.balance')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 font-mono">
                    {/* Opening Balance Row */}
                    <tr className="bg-slate-50/60 dark:bg-slate-800/20">
                      <td className="py-2.5 px-4 text-slate-400 font-sans" colSpan={3}>
                        Opening Balance
                      </td>
                      <td className="py-2.5 px-4" />
                      <td className="py-2.5 px-4" />
                      <td className="py-2.5 px-4 text-right font-bold text-slate-600 dark:text-slate-400">
                        {formatBalance(ledger.openingBalance)}
                      </td>
                    </tr>

                    {ledger.lines.map((line: LedgerLine, i: number) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-2.5 px-4 text-slate-500 font-sans whitespace-nowrap">
                          {formatLedgerDate(line.entryDate)}
                        </td>
                        <td className="py-2.5 px-4 text-brand-600 dark:text-brand-400">
                          {line.entryNumber}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-sans max-w-xs truncate">
                          <span>{line.description}</span>
                          {line.lineDescription && (
                            <span className="text-slate-400 ml-2">· {line.lineDescription}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                          {line.debit > 0 ? `$${line.debit.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right text-blue-600 dark:text-blue-400 font-semibold">
                          {line.credit > 0 ? `$${line.credit.toFixed(2)}` : '—'}
                        </td>
                        <td
                          className={`py-2.5 px-4 text-right font-bold ${
                            line.runningBalance < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatBalance(line.runningBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-t-2 border-slate-200 dark:border-slate-700 font-bold">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-sans" colSpan={3}>
                        Closing Balance
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                        ${ledger.totalDebits.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                        ${ledger.totalCredits.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right ${
                          ledger.closingBalance < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatBalance(ledger.closingBalance)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            /* T-Account View */
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* T-Account Title */}
              <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  T-Account: {selectedAccount?.code} · {selectedAccount?.name}
                </span>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
                {/* Left — Debits */}
                <div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Debit (DR)
                    </p>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {debitLines.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-300 dark:text-slate-600">
                        No debit entries
                      </p>
                    ) : (
                      debitLines.map((l: LedgerLine, i: number) => (
                        <div key={i} className="px-4 py-2.5 flex justify-between items-center gap-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/20">
                          <div className="min-w-0">
                            <p className="text-[11px] font-mono text-brand-600 dark:text-brand-400">{l.entryNumber}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{l.description}</p>
                          </div>
                          <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300 shrink-0">
                            ${l.debit.toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  {/* DR Total */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Total DR</span>
                    <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      ${ledger.totalDebits.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Right — Credits */}
                <div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Credit (CR)
                    </p>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {creditLines.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-300 dark:text-slate-600">
                        No credit entries
                      </p>
                    ) : (
                      creditLines.map((l: LedgerLine, i: number) => (
                        <div key={i} className="px-4 py-2.5 flex justify-between items-center gap-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/20">
                          <div className="min-w-0">
                            <p className="text-[11px] font-mono text-brand-600 dark:text-brand-400">{l.entryNumber}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{l.description}</p>
                          </div>
                          <span className="text-xs font-bold font-mono text-blue-700 dark:text-blue-300 shrink-0">
                            ${l.credit.toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  {/* CR Total */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Total CR</span>
                    <span className="text-xs font-bold font-mono text-blue-700 dark:text-blue-300">
                      ${ledger.totalCredits.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Balance Footer */}
              <div className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-6 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Net Balance ({selectedAccount?.normalBalance === 'debit' ? 'Debit Normal' : 'Credit Normal'})
                </span>
                <span
                  className={`text-base font-bold font-mono ${
                    ledger.closingBalance < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {formatBalance(ledger.closingBalance)}
                </span>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
