import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { JournalEntry, JournalLine } from '../../types/journal';
import { Account } from '../../types/account';
import BalanceIndicator from './BalanceIndicator';
import JournalLineItemRow from './JournalLineItemRow';

interface LineState {
  accountId: string;
  debit: number;
  credit: number;
  lineDescription: string;
}

function blankLine(): LineState {
  return { accountId: '', debit: 0, credit: 0, lineDescription: '' };
}

interface JournalEntryModalProps {
  /** Existing entry to edit; undefined means "new entry" */
  entry?: JournalEntry | null;
  accounts: Account[];
  defaultEntryNumber: string;
  onSave: (data: {
    entryDate: string;
    entryNumber: string;
    description: string;
    notes: string;
    lines: Omit<JournalLine, 'id'>[];
  }) => Promise<void>;
  onVoid?: (entryId: string) => Promise<void>;
  onClose: () => void;
}

/**
 * Full-screen modal for creating or editing journal entries.
 * Features:
 * - Dynamic line editor (add/remove lines)
 * - Live BalanceIndicator showing DR / CR running totals
 * - Blocks save when unbalanced or validation fails
 * - Supports both new entries and editing existing ones
 * - Void button for posted entries (preserves audit trail)
 */
const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  entry,
  accounts,
  defaultEntryNumber,
  onSave,
  onVoid,
  onClose,
}) => {
  const isEditing = !!entry;
  const isVoided = entry?.status === 'voided';

  // Form state
  const [entryDate, setEntryDate] = useState<string>(
    entry?.entryDate ?? new Date().toISOString().slice(0, 10)
  );
  const [entryNumber, setEntryNumber] = useState<string>(
    entry?.entryNumber ?? defaultEntryNumber
  );
  const [description, setDescription] = useState<string>(entry?.description ?? '');
  const [notes, setNotes] = useState<string>(entry?.notes ?? '');

  // Lines
  const [lines, setLines] = useState<LineState[]>(() => {
    if (entry?.lines && entry.lines.length >= 2) {
      return entry.lines.map((l) => ({
        accountId: l.accountId,
        debit: l.debit,
        credit: l.credit,
        lineDescription: l.lineDescription ?? '',
      }));
    }
    return [blankLine(), blankLine()];
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  // Sync entryNumber if defaultEntryNumber changes
  useEffect(() => {
    if (!isEditing) setEntryNumber(defaultEntryNumber);
  }, [defaultEntryNumber, isEditing]);

  const handleLineChange = useCallback(
    (index: number, field: string, value: string | number) => {
      setLines((prev) => {
        const updated = [...prev];
        if (field === 'debit') {
          updated[index] = { ...updated[index], debit: Number(value), credit: 0 };
        } else if (field === 'credit') {
          updated[index] = { ...updated[index], credit: Number(value), debit: 0 };
        } else {
          updated[index] = { ...updated[index], [field]: value };
        }
        return updated;
      });
    },
    []
  );

  const handleAddLine = () => {
    setLines((prev) => [...prev, blankLine()]);
  };

  const handleDeleteLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  function validate(): string[] {
    const errs: string[] = [];
    if (!entryDate) errs.push('Entry date is required.');
    if (!description.trim()) errs.push('Description is required.');
    if (lines.length < 2) errs.push('A journal entry must have at least 2 lines.');
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l.accountId) errs.push(`Line ${i + 1}: Please select an account.`);
      if ((l.debit || 0) === 0 && (l.credit || 0) === 0) {
        errs.push(`Line ${i + 1}: Enter a debit or credit amount.`);
      }
      if ((l.debit || 0) > 0 && (l.credit || 0) > 0) {
        errs.push(`Line ${i + 1}: A line cannot have both debit and credit amounts.`);
      }
    }
    if (!isBalanced && totalDebit > 0) {
      errs.push(
        `Entry is not balanced — Debits ($${totalDebit.toFixed(2)}) must equal Credits ($${totalCredit.toFixed(2)}).`
      );
    }
    return errs;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setIsSaving(true);
    try {
      const mappedLines: Omit<JournalLine, 'id'>[] = lines.map((l, i) => {
        const acc = accounts.find((a) => a.id === l.accountId)!;
        return {
          accountId: l.accountId,
          accountCode: acc?.code ?? '',
          accountName: acc?.name ?? '',
          accountType: acc?.type ?? 'expense',
          debit: Math.round((l.debit || 0) * 100) / 100,
          credit: Math.round((l.credit || 0) * 100) / 100,
          lineDescription: l.lineDescription,
          orderIndex: i,
        };
      });

      await onSave({
        entryDate,
        entryNumber,
        description: description.trim(),
        notes: notes.trim(),
        lines: mappedLines,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrors([msg]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoid = async () => {
    if (!entry || !onVoid) return;
    setIsVoiding(true);
    try {
      await onVoid(entry.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to void entry.';
      setErrors([msg]);
    } finally {
      setIsVoiding(false);
      setShowVoidConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md overflow-y-auto py-4 px-2 sm:py-8 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl liquid-glass-elevated rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/15 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center ring-1 ring-brand-500/25">
              <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
              </h2>
              {isVoided && (
                <span className="text-xs text-red-500 font-semibold">
                  This entry has been voided — read only
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors press-bounce"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-300 mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Please fix the following before saving:
              </div>
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600 dark:text-red-400 pl-5">
                  • {err}
                </p>
              ))}
            </div>
          )}

          {/* Header fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Entry Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Entry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                disabled={isVoided}
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Entry Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Entry Number
              </label>
              <input
                type="text"
                value={entryNumber}
                disabled={isVoided}
                onChange={(e) => setEntryNumber(e.target.value)}
                className="w-full text-xs font-mono rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-brand-700 dark:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Status badge (view only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Status
              </label>
              <div className="flex items-center h-9">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    isVoided
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {isVoided ? 'Voided' : isEditing ? 'Posted' : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isVoided}
              placeholder="e.g. Initial capital contribution by owner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Notes <span className="text-slate-300 text-[11px] font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              disabled={isVoided}
              placeholder="Additional memo, reference, or source document note…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Line items section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Transaction Lines
              </h3>
              <span className="text-[11px] text-slate-400">
                {lines.length} line{lines.length !== 1 ? 's' : ''} · min. 2 required
              </span>
            </div>

            <div className="space-y-2">
              {lines.map((line, i) => (
                <JournalLineItemRow
                  key={i}
                  index={i}
                  line={line}
                  accounts={accounts}
                  onChange={handleLineChange}
                  onDelete={handleDeleteLine}
                  canDelete={lines.length > 2 && !isVoided}
                />
              ))}
            </div>

            {!isVoided && (
              <button
                type="button"
                onClick={handleAddLine}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line (compound entry)
              </button>
            )}
          </div>

          {/* Balance indicator */}
          <BalanceIndicator totalDebit={totalDebit} totalCredit={totalCredit} />

          {/* Footer actions */}
          {!isVoided && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Void (edit mode only) */}
              <div>
                {isEditing && onVoid && !showVoidConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowVoidConfirm(true)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 underline transition-colors"
                  >
                    Void this entry…
                  </button>
                )}
                {showVoidConfirm && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 dark:text-red-400">Confirm void?</span>
                    <button
                      type="button"
                      onClick={handleVoid}
                      disabled={isVoiding}
                      className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {isVoiding ? 'Voiding…' : 'Yes, void it'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVoidConfirm(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Cancel + Save */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !isBalanced}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isBalanced && !isSaving
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/25'
                      : 'bg-brand-200 dark:bg-brand-900/60 text-brand-400 dark:text-brand-600 cursor-not-allowed'
                  }`}
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSaving
                    ? 'Saving…'
                    : isBalanced
                    ? isEditing
                      ? 'Save Changes'
                      : 'Post Entry'
                    : 'Balance First'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default JournalEntryModal;
