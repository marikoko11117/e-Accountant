export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';
export type NormalBalance = 'debit' | 'credit';
export type AccountStatus = 'active' | 'archived';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  parentAccountId?: string | null;
  status: AccountStatus;
  currentBalance: number;
  description?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const ACCOUNT_TYPE_CONFIG: Record<AccountType, { normalBalance: NormalBalance; labelKey: string }> = {
  asset: { normalBalance: 'debit', labelKey: 'accountType.asset' },
  liability: { normalBalance: 'credit', labelKey: 'accountType.liability' },
  equity: { normalBalance: 'credit', labelKey: 'accountType.equity' },
  income: { normalBalance: 'credit', labelKey: 'accountType.income' },
  expense: { normalBalance: 'debit', labelKey: 'accountType.expense' },
};
