import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Account } from '../types/account';

const DEMO_ACCOUNTS_STORAGE_KEY_PREFIX = 'e_accountant_accounts_';

// Standard Starter Chart of Accounts tailored for private practices, bookkeepers, and small businesses
export const STANDARD_ACCOUNTS_TEMPLATE: Omit<Account, 'id' | 'currentBalance' | 'createdAt' | 'updatedAt'>[] = [
  // 1000 - Assets (Normal: Debit)
  { code: '1010', name: 'Operating Cash & Checking', type: 'asset', normalBalance: 'debit', status: 'active', description: 'Primary business checking account for daily operations' },
  { code: '1020', name: 'Petty Cash Fund', type: 'asset', normalBalance: 'debit', status: 'active', description: 'Physical cash held on-site for minor incidental expenses' },
  { code: '1050', name: 'Business Savings Account', type: 'asset', normalBalance: 'debit', status: 'active', description: 'Interest-bearing reserve account' },
  { code: '1200', name: 'Accounts Receivable (A/R)', type: 'asset', normalBalance: 'debit', status: 'active', description: 'Amounts owed by clients for invoices billed but not yet collected' },
  { code: '1210', name: 'Allowance for Doubtful Accounts', type: 'asset', normalBalance: 'credit', status: 'active', description: 'Contra-asset account estimating uncollectible client balances' },
  { code: '1300', name: 'Inventory Asset', type: 'asset', normalBalance: 'debit', status: 'active', description: 'Goods, materials, and supplies held for resale' },
  { code: '1400', name: 'Prepaid Expenses', type: 'asset', normalBalance: 'debit', status: 'active', description: 'Prepaid rent, insurance, and vendor retainers' },
  { code: '1500', name: 'Office Furniture & Fixtures', type: 'asset', normalBalance: 'debit', status: 'active', description: 'Desks, chairs, and office equipment with multi-year life' },
  { code: '1510', name: 'Accumulated Depreciation - Equipment', type: 'asset', normalBalance: 'credit', status: 'active', description: 'Contra-asset cumulative depreciation on equipment' },

  // 2000 - Liabilities (Normal: Credit)
  { code: '2010', name: 'Accounts Payable (A/P)', type: 'liability', normalBalance: 'credit', status: 'active', description: 'Bills owed to vendors, suppliers, and contractors' },
  { code: '2020', name: 'Business Credit Card', type: 'liability', normalBalance: 'credit', status: 'active', description: 'Outstanding balance on company credit card' },
  { code: '2100', name: 'Accrued Payroll & Bonuses', type: 'liability', normalBalance: 'credit', status: 'active', description: 'Earned employee wages awaiting upcoming payroll run' },
  { code: '2200', name: 'Sales Tax Payable', type: 'liability', normalBalance: 'credit', status: 'active', description: 'Sales and usage taxes collected from clients awaiting remittance' },
  { code: '2500', name: 'Bank Loan Payable (Long-Term)', type: 'liability', normalBalance: 'credit', status: 'active', description: 'Principal balance on commercial bank term loan' },

  // 3000 - Equity (Normal: Credit)
  { code: '3010', name: "Owner's Capital Contribution", type: 'equity', normalBalance: 'credit', status: 'active', description: 'Direct capital invested into the business by the owner' },
  { code: '3020', name: "Owner's Draws & Distributions", type: 'equity', normalBalance: 'debit', status: 'active', description: 'Contra-equity account tracking withdrawals taken by owner' },
  { code: '3100', name: 'Retained Earnings', type: 'equity', normalBalance: 'credit', status: 'active', description: 'Cumulative net earnings retained in the business over prior periods' },

  // 4000 - Income (Normal: Credit)
  { code: '4010', name: 'Professional Services & Consulting', type: 'income', normalBalance: 'credit', status: 'active', description: 'Fees earned for client advisory, bookkeeping, and consulting services' },
  { code: '4020', name: 'Client Retainer Revenue', type: 'income', normalBalance: 'credit', status: 'active', description: 'Recurring monthly client retainer billings' },
  { code: '4900', name: 'Interest & Other Income', type: 'income', normalBalance: 'credit', status: 'active', description: 'Bank interest and miscellaneous non-operating income' },

  // 5000 - Expenses (Normal: Debit)
  { code: '5010', name: 'Office Rent & Facilities', type: 'expense', normalBalance: 'debit', status: 'active', description: 'Monthly lease payments for business office space' },
  { code: '5020', name: 'Salaries & Staff Compensation', type: 'expense', normalBalance: 'debit', status: 'active', description: 'Gross compensation paid to permanent and part-time staff' },
  { code: '5030', name: 'Contractor & Professional Fees', type: 'expense', normalBalance: 'debit', status: 'active', description: 'Payments to external CPAs, legal counsel, and IT contractors' },
  { code: '5040', name: 'Software & Cloud Subscriptions', type: 'expense', normalBalance: 'debit', status: 'active', description: 'SaaS platforms, cloud hosting, and accounting software tools' },
  { code: '5050', name: 'Advertising & Marketing', type: 'expense', normalBalance: 'debit', status: 'active', description: 'Client acquisition, website hosting, and promotion' },
  { code: '5060', name: 'Bank & Payment Processing Fees', type: 'expense', normalBalance: 'debit', status: 'active', description: 'Merchant processing fees, wire charges, and service charges' },
  { code: '5070', name: 'Office Supplies & Postage', type: 'expense', normalBalance: 'debit', status: 'active', description: 'Stationery, printing supplies, and delivery fees' },
];

function getDemoStorageKey(userId: string): string {
  return `${DEMO_ACCOUNTS_STORAGE_KEY_PREFIX}${userId}`;
}

function loadDemoAccounts(userId: string): Account[] {
  try {
    const raw = localStorage.getItem(getDemoStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
    if (userId.startsWith('demo-')) {
      const initial: Account[] = STANDARD_ACCOUNTS_TEMPLATE.map((tmpl, idx) => ({
        ...tmpl,
        id: `demo_acc_${idx + 1}`,
        currentBalance: 0,
        parentAccountId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      localStorage.setItem(getDemoStorageKey(userId), JSON.stringify(initial));
      return initial;
    }
  } catch (err) {
    console.error('Failed to load demo accounts from localStorage:', err);
  }
  return [];
}

function saveDemoAccounts(userId: string, accounts: Account[]): void {
  try {
    localStorage.setItem(getDemoStorageKey(userId), JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save demo accounts to localStorage:', err);
  }
}

/**
 * Fetch all accounts for a specific user
 */
export async function getAccounts(userId: string, isDemo = false): Promise<Account[]> {
  if (isDemo || !isFirebaseConfigured || !db) {
    return loadDemoAccounts(userId);
  }

  try {
    const accountsRef = collection(db, 'users', userId, 'accounts');
    const snapshot = await getDocs(accountsRef);
    const accounts: Account[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      accounts.push({
        id: docSnap.id,
        code: data.code,
        name: data.name,
        type: data.type,
        normalBalance: data.normalBalance,
        parentAccountId: data.parentAccountId || null,
        status: data.status,
        currentBalance: typeof data.currentBalance === 'number' ? data.currentBalance : 0,
        description: data.description || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    // Sort primarily by code
    return accounts.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  } catch (err) {
    console.error('Error fetching Firestore accounts, falling back to local demo state:', err);
    return loadDemoAccounts(userId);
  }
}

/**
 * Create a new account
 */
export async function createAccount(
  userId: string,
  accountData: Omit<Account, 'id' | 'currentBalance' | 'createdAt' | 'updatedAt'>,
  isDemo = false
): Promise<Account> {
  const newId = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newAccount: Account = {
    ...accountData,
    id: newId,
    currentBalance: 0,
    parentAccountId: accountData.parentAccountId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDemo || !isFirebaseConfigured || !db) {
    const current = loadDemoAccounts(userId);
    const updated = [...current, newAccount].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    saveDemoAccounts(userId, updated);
    return newAccount;
  }

  try {
    const docRef = doc(db, 'users', userId, 'accounts', newId);
    await setDoc(docRef, {
      code: accountData.code,
      name: accountData.name,
      type: accountData.type,
      normalBalance: accountData.normalBalance,
      parentAccountId: accountData.parentAccountId || null,
      status: accountData.status,
      currentBalance: 0,
      description: accountData.description || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newAccount;
  } catch (err) {
    console.error('Error creating Firestore account:', err);
    throw err;
  }
}

/**
 * Update an existing account
 */
export async function updateAccount(
  userId: string,
  accountId: string,
  updates: Partial<Omit<Account, 'id' | 'currentBalance' | 'createdAt'>>,
  isDemo = false
): Promise<void> {
  if (isDemo || !isFirebaseConfigured || !db) {
    const current = loadDemoAccounts(userId);
    const updated = current.map((acc) => {
      if (acc.id === accountId) {
        return { ...acc, ...updates, updatedAt: new Date().toISOString() };
      }
      return acc;
    }).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    saveDemoAccounts(userId, updated);
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'accounts', accountId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error updating Firestore account:', err);
    throw err;
  }
}

/**
 * Archive an account (preserves transaction history and audit trail)
 */
export async function archiveAccount(userId: string, accountId: string, isDemo = false): Promise<void> {
  return updateAccount(userId, accountId, { status: 'archived' }, isDemo);
}

/**
 * Unarchive an account (reactivate)
 */
export async function unarchiveAccount(userId: string, accountId: string, isDemo = false): Promise<void> {
  return updateAccount(userId, accountId, { status: 'active' }, isDemo);
}

/**
 * Check if an account has existing transactions.
 * Double-entry rule: Accounts with transactions CANNOT be deleted. They must be archived instead.
 */
export async function checkAccountTransactions(
  userId: string,
  accountId: string,
  isDemo = false
): Promise<{ hasTransactions: boolean; transactionCount: number }> {
  if (isDemo || !isFirebaseConfigured || !db) {
    // Check local storage for journal entries referencing this account
    try {
      const raw = localStorage.getItem(`e_accountant_journal_${userId}`);
      if (raw) {
        const entries = JSON.parse(raw);
        let count = 0;
        for (const entry of entries) {
          if (entry.lines && entry.lines.some((l: { accountId: string }) => l.accountId === accountId)) {
            count++;
          }
        }
        return { hasTransactions: count > 0, transactionCount: count };
      }
    } catch {
      // ignore
    }
    return { hasTransactions: false, transactionCount: 0 };
  }

  try {
    // In Firestore, we query journal entries that contain this accountId
    const journalRef = collection(db, 'users', userId, 'journalEntries');
    const q = query(journalRef, where('accountIds', 'array-contains', accountId));
    const snapshot = await getDocs(q);
    return {
      hasTransactions: !snapshot.empty,
      transactionCount: snapshot.size,
    };
  } catch (err) {
    console.warn('Could not query journal entries, assuming no transactions:', err);
    return { hasTransactions: false, transactionCount: 0 };
  }
}

/**
 * Attempt to delete an account.
 * Throws an error if the account contains transactions, enforcing accounting compliance.
 */
export async function deleteAccount(userId: string, accountId: string, isDemo = false): Promise<void> {
  const { hasTransactions, transactionCount } = await checkAccountTransactions(userId, accountId, isDemo);
  if (hasTransactions) {
    throw new Error(
      `Cannot delete account: It is linked to ${transactionCount} journal transaction(s). To preserve accounting records and balance sheet integrity, please archive this account instead.`
    );
  }

  if (isDemo || !isFirebaseConfigured || !db) {
    const current = loadDemoAccounts(userId);
    const updated = current.filter((a) => a.id !== accountId);
    saveDemoAccounts(userId, updated);
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'accounts', accountId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting account from Firestore:', err);
    throw err;
  }
}

/**
 * 1-Click Starter Template Seeder: Seeds the standard business accounts
 */
export async function seedStandardAccounts(userId: string, isDemo = false): Promise<Account[]> {
  const existingAccounts = await getAccounts(userId, isDemo);
  const existingCodes = new Set(existingAccounts.map((a) => a.code));

  const accountsToAdd = STANDARD_ACCOUNTS_TEMPLATE.filter((tmpl) => !existingCodes.has(tmpl.code));

  if (accountsToAdd.length === 0) {
    return existingAccounts;
  }

  const seeded: Account[] = [];
  for (const item of accountsToAdd) {
    const created = await createAccount(userId, item, isDemo);
    seeded.push(created);
  }

  return [...existingAccounts, ...seeded].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
}
