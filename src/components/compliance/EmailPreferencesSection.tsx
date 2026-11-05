import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { BUSINESS_DETAILS } from '../../config/businessCompliance';

export const EmailPreferencesSection: React.FC = () => {
  const [productUpdates, setProductUpdates] = useState(false);
  const securityAlerts = true;
  const [unsubscribedAll, setUnsubscribedAll] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleOneClickUnsubscribe = () => {
    setProductUpdates(false);
    setUnsubscribedAll(true);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex items-center space-x-2.5">
        <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Email & Notification Governance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Requirement #18: Transparent 1-click unsubscribe mechanisms on all communications.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <input
            type="checkbox"
            checked={securityAlerts}
            disabled
            className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
          />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">
              Essential Security & Transactional Alerts (Mandatory)
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Password resets, suspicious login notifications, and system status notices. (Cannot be disabled).
            </span>
          </div>
        </label>

        <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <input
            type="checkbox"
            checked={productUpdates && !unsubscribedAll}
            onChange={(e) => {
              setProductUpdates(e.target.checked);
              if (e.target.checked) setUnsubscribedAll(false);
            }}
            className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
          />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">
              Feature Announcements & Accounting Best Practice Guides
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Optional periodic product tips. Every email sent includes a direct 1-click unsubscribe footer.
            </span>
          </div>
        </label>
      </div>

      {/* Unsubscribe Demo Box */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="font-semibold block text-slate-800 dark:text-slate-200">
            Simulated Email Footer Preview:
          </span>
          <span className="text-[11px] text-slate-400">
            "{BUSINESS_DETAILS.tradingName} • {BUSINESS_DETAILS.registeredAddress} • "
            <button
              onClick={handleOneClickUnsubscribe}
              className="text-brand-600 dark:text-brand-400 underline ml-1 hover:text-brand-700"
            >
              Unsubscribe with 1 Click
            </button>
          </span>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-all shrink-0"
        >
          {savedNotice ? 'Saved!' : 'Update Preferences'}
        </button>
      </div>
    </div>
  );
};
