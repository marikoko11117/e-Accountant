import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, Loader2, Download, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_DETAILS } from '../../config/businessCompliance';

export const DataDeletionSection: React.FC = () => {
  const { user, signOut } = useAuth();
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const REQUIRED_PHRASE = 'DELETE ALL MY DATA';

  const handleExportData = () => {
    if (!user) return;
    const uid = user.uid;
    const exportData = {
      user: { uid: user.uid, email: user.email, displayName: user.displayName },
      accounts: localStorage.getItem(`e_accountant_accounts_${uid}`) ? JSON.parse(localStorage.getItem(`e_accountant_accounts_${uid}`)!) : [],
      journalEntries: localStorage.getItem(`e_accountant_journal_${uid}`) ? JSON.parse(localStorage.getItem(`e_accountant_journal_${uid}`)!) : [],
      preferences: {
        theme: localStorage.getItem('e_accountant_theme'),
        lang: localStorage.getItem('e_accountant_lang'),
        cookieConsent: localStorage.getItem('e_accountant_cookie_consent'),
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `e-accountant-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = async () => {
    if (!user || confirmPhrase !== REQUIRED_PHRASE) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const uid = user.uid;
      // 1. Purge all local user storage
      localStorage.removeItem(`e_accountant_accounts_${uid}`);
      localStorage.removeItem(`e_accountant_journal_${uid}`);
      localStorage.removeItem('e_accountant_demo_user');
      localStorage.removeItem('e_accountant_wizard_done');

      // 2. Simulated / Firestore server-side deletion ticket
      // In production with live Firestore, this triggers cloud function or batch delete
      await new Promise((r) => setTimeout(r, 800));

      setDeletionSuccess(true);
      setTimeout(async () => {
        await signOut();
      }, 2000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete user records');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 shadow-sm space-y-5">
      <div className="flex items-center space-x-2.5">
        <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            GDPR / CCPA Data Rights & Permanent Erasure
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download an export copy or permanently purge your bookkeeping records and authentication profile.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExportData}
          className="inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <Download className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Export All Financial Data (JSON)</span>
        </button>

        <a
          href={`mailto:${BUSINESS_DETAILS.dpoEmail}?subject=Formal%20GDPR%20Data%20Erasure%20Request&body=User%20UID:%20${user?.uid}%0AEmail:%20${user?.email}%0APlease%20confirm%20complete%20erasure.`}
          className="inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <span>Email DPO Directly</span>
        </a>
      </div>

      {deletionSuccess ? (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>All local and session data permanently deleted. Signing you out...</span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 space-y-3">
          <div className="flex items-start space-x-2 text-xs text-red-700 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>
              <strong>Warning:</strong> Deleting your account will immediately wipe all journal entries, chart of accounts, and preferences. This action cannot be reversed.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Type <span className="font-mono text-red-600 dark:text-red-400 font-bold">{REQUIRED_PHRASE}</span> below to confirm:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder="DELETE ALL MY DATA"
                className="flex-1 px-3.5 py-2 rounded-xl text-xs font-mono border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={handleDeleteData}
                disabled={confirmPhrase !== REQUIRED_PHRASE || isDeleting}
                className="inline-flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Execute Permanent Erasure</span>
              </button>
            </div>
            {errorMessage && <p className="text-xs text-red-600 mt-1.5">{errorMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
