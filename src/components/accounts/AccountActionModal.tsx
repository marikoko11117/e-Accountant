import React, { useState } from 'react';
import { Archive, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { Account } from '../../types/account';
import { useLanguage } from '../../context/LanguageContext';

interface AccountActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  actionType: 'archive' | 'unarchive' | 'delete';
  hasTransactions: boolean;
  transactionCount: number;
  onConfirm: () => Promise<void>;
  onSwitchToArchive?: () => void;
}

export const AccountActionModal: React.FC<AccountActionModalProps> = ({
  isOpen,
  onClose,
  account,
  actionType,
  hasTransactions,
  transactionCount,
  onConfirm,
  onSwitchToArchive,
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !account) return null;

  const handleExecute = async () => {
    setError(null);
    try {
      setIsSubmitting(true);
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // If attempting to delete but has transactions -> Double-entry safety gate
  if (actionType === 'delete' && hasTransactions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
        <div className="relative w-full max-w-md liquid-glass-elevated rounded-3xl shadow-2xl border border-red-500/30 p-6 overflow-hidden">
          <div className="flex items-start space-x-3.5 mb-4">
            <div className="p-3 rounded-2xl bg-red-500/15 text-red-500 shrink-0 ring-1 ring-red-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('accounts.deleteBlocked')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Account <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{account.code} ({account.name})</span> is currently linked to <strong className="text-red-600 dark:text-red-400">{transactionCount} journal transaction(s)</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 leading-relaxed mb-5">
            {t('accounts.deleteBlockedDesc')}
          </div>

          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 transition-colors press-bounce"
            >
              {t('common.cancel')}
            </button>
            {onSwitchToArchive && (
              <button
                onClick={onSwitchToArchive}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-600/20 press-bounce"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{t('accounts.filterArchived')} Instead</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md liquid-glass-elevated rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-6 overflow-hidden">
        <div className="flex items-start space-x-3.5 mb-4">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              actionType === 'delete'
                ? 'bg-red-500/15 text-red-500 ring-1 ring-red-500/30'
                : 'bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30'
            }`}
          >
            {actionType === 'delete' ? <Trash2 className="w-6 h-6" /> : <Archive className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {actionType === 'delete'
                ? 'Delete Account'
                : actionType === 'archive'
                ? t('common.archive')
                : t('common.unarchive')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {account.code} - {account.name}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
          {actionType === 'archive' && t('accounts.archiveConfirm')}
          {actionType === 'unarchive' && t('accounts.unarchiveConfirm')}
          {actionType === 'delete' && t('accounts.deleteConfirm')}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleExecute}
            disabled={isSubmitting}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all ${
              actionType === 'delete'
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>{t('common.confirm')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
