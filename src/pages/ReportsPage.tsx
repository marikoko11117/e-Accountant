import React, { useState } from 'react';
import { FileSpreadsheet, Download, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedReport, setSelectedReport] = useState('trial-balance');

  const reports = [
    { id: 'trial-balance', title: 'Trial Balance', desc: 'Proof of equality for all total debits and credits.' },
    { id: 'income-statement', title: 'Income Statement (P&L)', desc: 'Summary of revenues, expenses, and net profit/loss.' },
    { id: 'balance-sheet', title: 'Balance Sheet', desc: 'Statement of Financial Position: Assets = Liabilities + Equity.' },
    { id: 'monthly-summary', title: 'Monthly Summary', desc: 'Month-by-month cashflow and net income breakdown.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-brand-600" />
            <span>{t('nav.reports')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated financial statements generated from double-entry journal transactions.
          </p>
        </div>

        <button
          disabled
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
          title="Will be fully operational in Stage 5"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV (Stage 5)</span>
        </button>
      </div>

      {/* Stage 5 Notice */}
      <div className="p-4 rounded-2xl liquid-glass border border-brand-500/20 flex items-start space-x-3 text-xs text-brand-800 dark:text-brand-200">
        <Info className="w-4 h-4 shrink-0 text-brand-500 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Stage 5 Roadmap Notice:</span> Automated mathematical computation of Trial Balance, Income Statement, Balance Sheet, and Monthly Summaries with period filtering and CSV download is scheduled for Stage 5.
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div
            key={r.id}
            onClick={() => setSelectedReport(r.id)}
            className={`p-6 rounded-3xl transition-all cursor-pointer press-bounce ${
              selectedReport === r.id
                ? 'liquid-glass-elevated border-brand-500/50 ring-2 ring-brand-500/30 shadow-lg'
                : 'liquid-glass hover:liquid-glass-elevated hover:border-white/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {r.title}
              </h3>
              <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-300 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                Stage 5
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {r.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
