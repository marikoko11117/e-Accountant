import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { Account, AccountType, NormalBalance, ACCOUNT_TYPE_CONFIG } from '../../types/account';
import { useLanguage } from '../../context/LanguageContext';

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: Omit<Account, 'id' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingAccount?: Account | null;
  existingAccounts: Account[];
}

export const AccountFormModal: React.FC<AccountFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAccount,
  existingAccounts,
}) => {
  const { t } = useLanguage();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('asset');
  const [normalBalance, setNormalBalance] = useState<NormalBalance>('debit');
  const [parentAccountId, setParentAccountId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form
  useEffect(() => {
    if (editingAccount) {
      setCode(editingAccount.code);
      setName(editingAccount.name);
      setType(editingAccount.type);
      setNormalBalance(editingAccount.normalBalance);
      setParentAccountId(editingAccount.parentAccountId || '');
      setDescription(editingAccount.description || '');
      setStatus(editingAccount.status);
    } else {
      setCode('');
      setName('');
      setType('asset');
      setNormalBalance('debit');
      setParentAccountId('');
      setDescription('');
      setStatus('active');
    }
    setError(null);
  }, [editingAccount, isOpen]);

  // When account type changes during creation, update default normal balance
  const handleTypeChange = (newType: AccountType) => {
    setType(newType);
    if (!editingAccount) {
      setNormalBalance(ACCOUNT_TYPE_CONFIG[newType].normalBalance);
    }
    // Reset parent account if type changes, since parents should generally match category
    setParentAccountId('');
  };

  if (!isOpen) return null;

  // Potential parent accounts: same type and not the current editing account
  const eligibleParents = existingAccounts.filter(
    (a) => a.type === type && (!editingAccount || a.id !== editingAccount.id) && !a.parentAccountId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim();
    const cleanName = name.trim();

    if (!cleanCode) {
      setError(t('accounts.codePlaceholder'));
      return;
    }
    if (!cleanName) {
      setError(t('accounts.namePlaceholder'));
      return;
    }

    // Check code uniqueness
    const duplicate = existingAccounts.find(
      (a) => a.code.toLowerCase() === cleanCode.toLowerCase() && (!editingAccount || a.id !== editingAccount.id)
    );
    if (duplicate) {
      setError(t('accounts.codeExistsError'));
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        code: cleanCode,
        name: cleanName,
        type,
        normalBalance,
        parentAccountId: parentAccountId || null,
        description: description.trim(),
        status,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg liquid-glass-elevated rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/15 dark:border-white/10">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {editingAccount ? t('accounts.editAccount') : t('accounts.newAccount')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10 press-bounce"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('accounts.type')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['asset', 'liability', 'equity', 'income', 'expense'] as AccountType[]).map((tType) => (
                <button
                  key={tType}
                  type="button"
                  onClick={() => handleTypeChange(tType)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                    type === tType
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {t(ACCOUNT_TYPE_CONFIG[tType].labelKey as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>

          {/* Code and Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('accounts.code')} *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="1010"
                className="w-full px-3.5 py-2.5 font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('accounts.name')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Operating Checking Account"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
          </div>

          {/* Normal Balance Direction */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('accounts.normalBalance')}
              </label>
              <span className="text-[11px] text-slate-400">
                Contra accounts can override
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNormalBalance('debit')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  normalBalance === 'debit'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {t('normalBalance.debit')} (+ on Debit)
              </button>
              <button
                type="button"
                onClick={() => setNormalBalance('credit')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  normalBalance === 'credit'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {t('normalBalance.credit')} (+ on Credit)
              </button>
            </div>
          </div>

          {/* Parent Account (Subcategories) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('accounts.parent')}
            </label>
            <select
              value={parentAccountId}
              onChange={(e) => setParentAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">{t('accounts.noParent')}</option>
              {eligibleParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.code} - {parent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('accounts.description')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('accounts.descriptionPlaceholder')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Status (if editing) */}
          {editingAccount && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('accounts.status')}
              </label>
              <div className="flex items-center space-x-3">
                <label className="inline-flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="accountStatus"
                    value="active"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>{t('status.active')}</span>
                </label>
                <label className="inline-flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="accountStatus"
                    value="archived"
                    checked={status === 'archived'}
                    onChange={() => setStatus('archived')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>{t('status.archived')}</span>
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('accounts.saving')}</span>
                </>
              ) : (
                <span>{t('common.save')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
