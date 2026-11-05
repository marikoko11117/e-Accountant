import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit3,
  Ban,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { JournalEntry } from '../types/journal';
import { Account } from '../types/account';
import { getJournalEntries, createJournalEntry, updateJournalEntry, voidJournalEntry, getJournalStats } from '../services/journalService';
import { getAccounts } from '../services/accountService';
import JournalEntryModal from '../components/journal/JournalEntryModal';

export const JournalPage: React.FC = () => {
  const { t } = useLanguage();
  const { user, isDemo } = useAuth();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [stats, setStats] = useState({ total: 0, posted: 0, voided: 0, nextEntryNumber: 'JE-2026-0001' });

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [fetchedEntries, fetchedAccounts, fetchedStats] = await Promise.all([
        getJournalEntries(user.uid, isDemo),
        getAccounts(user.uid, isDemo),
        getJournalStats(user.uid, isDemo),
      ]);
      setEntries(fetchedEntries);
      setAccounts(fetchedAccounts);
      setStats(fetchedStats);
      setError(null);
    } catch (err) {
      setError('Failed to load journal entries.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, isDemo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenNew = () => {
    setEditingEntry(null);
    setShowModal(true);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setShowModal(true);
  };

  const handleSave = async (data: Parameters<typeof createJournalEntry>[1]) => {
    if (!user) return;
    if (editingEntry) {
      await updateJournalEntry(user.uid, editingEntry.id, data, isDemo);
    } else {
      await createJournalEntry(user.uid, data, isDemo);
    }
    await loadData();
  };

  const handleVoid = async (entryId: string) => {
    if (!user) return;
    await voidJournalEntry(user.uid, entryId, isDemo);
    await loadData();
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredEntries = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.entryNumber.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      (e.notes || '').toLowerCase().includes(q) ||
      (e.lines || []).some(
        (l) =>
          l.accountName.toLowerCase().includes(q) ||
          l.accountCode.toLowerCase().includes(q)
      )
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-brand-600" />
            <span>{t('nav.journal')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('journal.subtitle')}
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 border border-brand-400/40 transition-all press-bounce"
        >
          <Plus className="w-4 h-4" />
          <span>{t('journal.newEntry')}</span>
        </button>
      </div>

      {/* KPI Cards with Liquid Glass */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('journal.totalEntries'), value: stats.total, color: 'text-slate-900 dark:text-white' },
          { label: t('status.posted'), value: stats.posted, color: 'text-emerald-500 dark:text-emerald-300' },
          { label: t('status.voided'), value: stats.voided, color: 'text-rose-500 dark:text-rose-400' },
          { label: t('journal.nextNumber'), value: stats.nextEntryNumber, color: 'text-brand-600 dark:text-brand-400', mono: true },
        ].map((card, i) => (
          <div key={i} className="p-4 rounded-3xl liquid-glass border border-white/15 dark:border-white/10 shadow-lg hover:liquid-glass-elevated transition-all press-bounce">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{card.label}</p>
            <p className={`mt-1.5 text-xl font-bold font-display ${card.color} ${card.mono ? 'font-mono text-sm' : 'font-mono tabular-nums'}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search Bar with Liquid Glass */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={t('journal.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl liquid-glass border border-white/15 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all shadow-sm"
        />
      </div>

      {/* Entries list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">{t('common.loading')}</span>
        </div>
      ) : error ? (
        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {search ? 'No entries match your search' : t('journal.emptyTitle')}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'Try a different keyword or entry number.' : t('journal.emptySubtitle')}
          </p>
          {!search && (
            <button
              onClick={handleOpenNew}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('journal.newEntry')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedIds.has(entry.id);
            const isVoided = entry.status === 'voided';

            return (
              <div
                key={entry.id}
                className={`rounded-3xl liquid-glass border shadow-lg transition-all press-bounce ${
                  isVoided
                    ? 'border-rose-400/30 opacity-70'
                    : 'border-white/15 dark:border-white/10 hover:border-white/30'
                }`}
              >
                {/* Entry header row */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-4 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors"
                  onClick={() => toggleExpand(entry.id)}
                >
                  {/* Chevron */}
                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>

                  {/* Entry number + date */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-lg shrink-0">
                      {entry.entryNumber}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">{entry.entryDate}</span>
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {entry.description}
                    </span>
                  </div>

                  {/* Totals + status */}
                  <div className="flex items-center gap-2 sm:ml-auto shrink-0 flex-wrap">
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                      DR ${entry.totalDebit.toFixed(2)}
                    </span>
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                      CR ${entry.totalCredit.toFixed(2)}
                    </span>

                    {isVoided ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                        <XCircle className="w-3 h-3" />
                        {t('status.voided')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('status.posted')}
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                      {!isVoided && (
                        <button
                          onClick={() => handleOpenEdit(entry)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!isVoided && (
                        <button
                          onClick={() => handleVoid(entry.id)}
                          title="Void this entry"
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded lines sub-table */}
                {isExpanded && entry.lines && (
                  <div className="px-5 pb-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 text-[11px] uppercase tracking-wider">
                            <th className="py-1 px-2">Account</th>
                            <th className="py-1 px-2">Memo</th>
                            <th className="py-1 px-2 text-right text-emerald-500">Debit</th>
                            <th className="py-1 px-2 text-right text-blue-500">Credit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 font-mono">
                          {entry.lines.map((l, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                              <td className={`py-2 px-2 text-slate-700 dark:text-slate-300 ${l.credit > 0 ? 'pl-6' : ''}`}>
                                <span className="text-slate-400 mr-2">{l.accountCode}</span>
                                <span className="font-sans font-medium">{l.accountName}</span>
                              </td>
                              <td className="py-2 px-2 text-slate-400 font-sans">
                                {l.lineDescription || '—'}
                              </td>
                              <td className="py-2 px-2 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                                {l.debit > 0 ? `$${l.debit.toFixed(2)}` : '—'}
                              </td>
                              <td className="py-2 px-2 text-right text-blue-600 dark:text-blue-400 font-semibold">
                                {l.credit > 0 ? `$${l.credit.toFixed(2)}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-200 dark:border-slate-700 font-bold text-xs">
                            <td className="py-2 px-2 text-slate-500 font-sans" colSpan={2}>
                              Totals
                            </td>
                            <td className="py-2 px-2 text-right text-emerald-600 dark:text-emerald-400">
                              ${entry.totalDebit.toFixed(2)}
                            </td>
                            <td className="py-2 px-2 text-right text-blue-600 dark:text-blue-400">
                              ${entry.totalCredit.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    {entry.notes && (
                      <p className="mt-2 text-[11px] text-slate-400 italic">
                        Note: {entry.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Journal Entry Modal */}
      {showModal && (
        <JournalEntryModal
          entry={editingEntry}
          accounts={accounts}
          defaultEntryNumber={stats.nextEntryNumber}
          onSave={handleSave}
          onVoid={editingEntry ? handleVoid : undefined}
          onClose={() => {
            setShowModal(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
};
