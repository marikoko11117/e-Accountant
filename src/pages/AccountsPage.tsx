import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  CheckCircle2,
  Archive,
  RotateCcw,
  Sparkles,
  Loader2,
  Edit2,
  Trash2,
  CornerDownRight,
  ListTree,
  Table as TableIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Account, AccountType, ACCOUNT_TYPE_CONFIG } from '../types/account';
import {
  getAccounts,
  createAccount,
  updateAccount,
  archiveAccount,
  unarchiveAccount,
  checkAccountTransactions,
  deleteAccount,
  seedStandardAccounts,
} from '../services/accountService';
import { AccountFormModal } from '../components/accounts/AccountFormModal';
import { AccountActionModal } from '../components/accounts/AccountActionModal';

export const AccountsPage: React.FC = () => {
  const { user, isDemo } = useAuth();
  const { t } = useLanguage();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AccountType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionTargetAccount, setActionTargetAccount] = useState<Account | null>(null);
  const [actionType, setActionType] = useState<'archive' | 'unarchive' | 'delete'>('archive');
  const [targetHasTransactions, setTargetHasTransactions] = useState(false);
  const [targetTransactionCount, setTargetTransactionCount] = useState(0);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccessBanner, setSeedSuccessBanner] = useState(false);

  // Fetch accounts on mount and whenever user changes
  const fetchAccounts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const list = await getAccounts(user.uid, isDemo);
      setAccounts(list);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user, isDemo]);

  // Handle Seeding
  const handleSeedStandard = async () => {
    if (!user) return;
    try {
      setIsSeeding(true);
      const updated = await seedStandardAccounts(user.uid, isDemo);
      setAccounts(updated);
      setSeedSuccessBanner(true);
      setTimeout(() => setSeedSuccessBanner(false), 5000);
    } catch (err) {
      console.error('Failed to seed accounts:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Handle Create or Update
  const handleSaveAccount = async (
    data: Omit<Account, 'id' | 'currentBalance' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;
    if (editingAccount) {
      await updateAccount(user.uid, editingAccount.id, data, isDemo);
    } else {
      await createAccount(user.uid, data, isDemo);
    }
    await fetchAccounts();
  };

  // Open Edit Modal
  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setIsFormModalOpen(true);
  };

  // Open Action Modal (Archive / Unarchive / Delete)
  const openActionModal = async (acc: Account, type: 'archive' | 'unarchive' | 'delete') => {
    if (!user) return;
    setActionTargetAccount(acc);
    setActionType(type);

    if (type === 'delete') {
      const check = await checkAccountTransactions(user.uid, acc.id, isDemo);
      setTargetHasTransactions(check.hasTransactions);
      setTargetTransactionCount(check.transactionCount);
    } else {
      setTargetHasTransactions(false);
      setTargetTransactionCount(0);
    }

    setActionModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!user || !actionTargetAccount) return;
    if (actionType === 'archive') {
      await archiveAccount(user.uid, actionTargetAccount.id, isDemo);
    } else if (actionType === 'unarchive') {
      await unarchiveAccount(user.uid, actionTargetAccount.id, isDemo);
    } else if (actionType === 'delete') {
      await deleteAccount(user.uid, actionTargetAccount.id, isDemo);
    }
    await fetchAccounts();
  };

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // Type filter
      if (selectedType !== 'all' && acc.type !== selectedType) return false;
      // Status filter
      if (statusFilter === 'active' && acc.status !== 'active') return false;
      if (statusFilter === 'archived' && acc.status !== 'archived') return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = acc.code.toLowerCase().includes(q);
        const matchesName = acc.name.toLowerCase().includes(q);
        const matchesDesc = (acc.description || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [accounts, selectedType, statusFilter, searchQuery]);

  // Build hierarchical tree structure: top-level accounts and their children
  const hierarchicalAccounts = useMemo(() => {
    const parentMap = new Map<string, Account[]>();
    const rootAccounts: Account[] = [];

    // Map children by parentAccountId
    for (const acc of filteredAccounts) {
      if (acc.parentAccountId) {
        const list = parentMap.get(acc.parentAccountId) || [];
        list.push(acc);
        parentMap.set(acc.parentAccountId, list);
      } else {
        rootAccounts.push(acc);
      }
    }

    // Return items with their nested children
    return rootAccounts.map((root) => ({
      account: root,
      children: parentMap.get(root.id) || [],
    }));
  }, [filteredAccounts]);

  // Statistics
  const stats = useMemo(() => {
    const total = accounts.length;
    const active = accounts.filter((a) => a.status === 'active').length;
    const archived = accounts.filter((a) => a.status === 'archived').length;
    const assets = accounts.filter((a) => a.type === 'asset').length;
    const liabilities = accounts.filter((a) => a.type === 'liability').length;
    const equity = accounts.filter((a) => a.type === 'equity').length;
    const income = accounts.filter((a) => a.type === 'income').length;
    const expenses = accounts.filter((a) => a.type === 'expense').length;
    return { total, active, archived, assets, liabilities, equity, income, expenses };
  }, [accounts]);

  const typeTabs: { key: AccountType | 'all'; labelKey: string }[] = [
    { key: 'all', labelKey: 'common.all' },
    { key: 'asset', labelKey: 'accountType.asset' },
    { key: 'liability', labelKey: 'accountType.liability' },
    { key: 'equity', labelKey: 'accountType.equity' },
    { key: 'income', labelKey: 'accountType.income' },
    { key: 'expense', labelKey: 'accountType.expense' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Notice when seeded */}
      {seedSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{t('accounts.seedSuccess')}</span>
          </div>
          <button
            onClick={() => setSeedSuccessBanner(false)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FolderTree className="w-6 h-6 text-brand-600" />
            <span>{t('accounts.title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {t('accounts.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {accounts.length === 0 && (
            <button
              onClick={handleSeedStandard}
              disabled={isSeeding}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/80 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-semibold hover:bg-brand-100 transition-all shadow-sm disabled:opacity-60"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
              <span>{t('accounts.seedStandard')}</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingAccount(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('accounts.newAccount')}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl liquid-glass press-bounce shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('accounts.totalCount')}</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">{stats.total}</p>
        </div>
        <div className="p-3.5 rounded-2xl liquid-glass press-bounce shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('accounts.activeCount')}</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">{stats.active}</p>
        </div>
        <div className="p-3.5 rounded-2xl liquid-glass press-bounce shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{t('accounts.archivedCount')}</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">{stats.archived}</p>
        </div>
        <div className="p-3.5 rounded-2xl liquid-glass press-bounce shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Assets / Liab.</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">{stats.assets} / {stats.liabilities}</p>
        </div>
        <div className="p-3.5 rounded-2xl liquid-glass press-bounce shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Equity</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">{stats.equity}</p>
        </div>
        <div className="p-3.5 rounded-2xl liquid-glass press-bounce shadow-sm hover:shadow-md transition-all">
          <p className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Inc. / Exp.</p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">{stats.income} / {stats.expenses}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 rounded-2xl liquid-glass shadow-sm">
        {/* Account Type Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {typeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedType(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all press-bounce ${
                selectedType === tab.key
                  ? 'bg-brand-500/15 text-brand-600 dark:text-brand-300 shadow-sm ring-1 ring-brand-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              {t(tab.labelKey as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>

        {/* Right controls: search, status, and view toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('accounts.searchPlaceholder')}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl liquid-glass-subtle text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
            className="px-2.5 py-1.5 rounded-xl liquid-glass-subtle text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            <option value="active">{t('accounts.filterActive')}</option>
            <option value="archived">{t('accounts.filterArchived')}</option>
            <option value="all">{t('accounts.filterAll')}</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center liquid-glass-subtle p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('grouped')}
              title={t('accounts.treeView')}
              className={`p-1.5 rounded-lg transition-all press-bounce ${
                viewMode === 'grouped'
                  ? 'bg-white/80 dark:bg-white/10 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <ListTree className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('flat')}
              title={t('accounts.flatView')}
              className={`p-1.5 rounded-lg transition-all press-bounce ${
                viewMode === 'flat'
                  ? 'bg-white/80 dark:bg-white/10 text-brand-600 dark:text-brand-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center rounded-3xl liquid-glass">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl liquid-glass space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 ring-1 ring-brand-500/20">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('accounts.emptyTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              {t('accounts.emptySubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedStandard}
              disabled={isSeeding}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all press-bounce"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              <span>{t('accounts.seedStandard')}</span>
            </button>
            <button
              onClick={() => {
                setEditingAccount(null);
                setIsFormModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl liquid-glass-subtle text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-white/40 dark:hover:bg-white/10 press-bounce"
            >
              <Plus className="w-4 h-4" />
              <span>{t('accounts.newAccount')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="liquid-glass rounded-3xl overflow-hidden shadow-lg border border-white/20 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider backdrop-blur-sm">
                  <th className="py-3.5 px-4">{t('accounts.code')}</th>
                  <th className="py-3.5 px-4">{t('accounts.name')}</th>
                  <th className="py-3.5 px-4">{t('accounts.type')}</th>
                  <th className="py-3.5 px-4">{t('accounts.normalBalance')}</th>
                  <th className="py-3.5 px-4 text-right">{t('accounts.currentBalance')}</th>
                  <th className="py-3.5 px-4 text-center">{t('accounts.status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {viewMode === 'grouped' ? (
                  hierarchicalAccounts.map(({ account: parent, children }) => (
                    <React.Fragment key={parent.id}>
                      {/* Parent / Main Account Row */}
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {parent.code}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <span>{parent.name}</span>
                            {children.length > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                                {children.length} sub-accounts
                              </span>
                            )}
                          </div>
                          {parent.description && (
                            <p className="text-[11px] font-normal text-slate-400 mt-0.5 truncate max-w-sm">
                              {parent.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                            {t(ACCOUNT_TYPE_CONFIG[parent.type].labelKey as Parameters<typeof t>[0])}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              parent.normalBalance === 'debit'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50'
                            }`}
                          >
                            {parent.normalBalance.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 dark:text-white">
                          ${parent.currentBalance.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              parent.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {parent.status === 'active' ? t('status.active') : t('status.archived')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(parent)}
                              title={t('common.edit')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {parent.status === 'active' ? (
                              <button
                                onClick={() => openActionModal(parent, 'archive')}
                                title={t('common.archive')}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => openActionModal(parent, 'unarchive')}
                                title={t('common.unarchive')}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => openActionModal(parent, 'delete')}
                              title={t('common.delete')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Sub-Accounts / Children Rows */}
                      {children.map((child) => (
                        <tr
                          key={child.id}
                          className="bg-slate-50/30 dark:bg-slate-900/40 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300 pl-8 flex items-center space-x-1.5">
                            <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{child.code}</span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200 pl-6">
                            <span className="font-medium">{child.name}</span>
                            {child.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-sm">
                                {child.description}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-4 capitalize text-slate-500 dark:text-slate-400">
                            {t(ACCOUNT_TYPE_CONFIG[child.type].labelKey as Parameters<typeof t>[0])}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                child.normalBalance === 'debit'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {child.normalBalance.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-medium text-right text-slate-800 dark:text-slate-200">
                            ${child.currentBalance.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                child.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {child.status === 'active' ? t('status.active') : t('status.archived')}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => openEditModal(child)}
                                className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {child.status === 'active' ? (
                                <button
                                  onClick={() => openActionModal(child, 'archive')}
                                  className="p-1 rounded text-slate-400 hover:text-amber-600"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => openActionModal(child, 'unarchive')}
                                  className="p-1 rounded text-slate-400 hover:text-emerald-600"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => openActionModal(child, 'delete')}
                                className="p-1 rounded text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  // Flat View
                  filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {acc.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {acc.name}
                        {acc.description && (
                          <p className="text-[11px] font-normal text-slate-400 mt-0.5 truncate max-w-sm">
                            {acc.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-700 dark:text-slate-300">
                        {t(ACCOUNT_TYPE_CONFIG[acc.type].labelKey as Parameters<typeof t>[0])}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            acc.normalBalance === 'debit'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {acc.normalBalance.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 dark:text-white">
                        ${acc.currentBalance.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            acc.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {acc.status === 'active' ? t('status.active') : t('status.archived')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openEditModal(acc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {acc.status === 'active' ? (
                            <button
                              onClick={() => openActionModal(acc, 'archive')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openActionModal(acc, 'unarchive')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openActionModal(acc, 'delete')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Account Create/Edit Form Modal */}
      <AccountFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        editingAccount={editingAccount}
        existingAccounts={accounts}
      />

      {/* Account Action (Archive / Unarchive / Delete) Modal */}
      <AccountActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setActionTargetAccount(null);
        }}
        account={actionTargetAccount}
        actionType={actionType}
        hasTransactions={targetHasTransactions}
        transactionCount={targetTransactionCount}
        onConfirm={handleConfirmAction}
        onSwitchToArchive={() => {
          setActionType('archive');
          setTargetHasTransactions(false);
        }}
      />
    </div>
  );
};
