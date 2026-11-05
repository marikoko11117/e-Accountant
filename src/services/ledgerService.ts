import { JournalLine } from '../types/journal';
import { Account } from '../types/account';
import { getJournalEntriesForAccount } from './journalService';

export interface LedgerLine {
  entryId: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
  lineDescription?: string;
}

export interface LedgerSummary {
  account: Account;
  lines: LedgerLine[];
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
}

/**
 * Calculate running balance for a sequence of ledger lines,
 * applying normal balance rules.
 * - Debit-normal: opening + debits - credits
 * - Credit-normal: opening + credits - debits
 */
export function calculateRunningBalance(
  account: Account,
  lines: Pick<JournalLine, 'debit' | 'credit'>[],
  openingBalance = 0
): number[] {
  const balances: number[] = [];
  let running = openingBalance;
  for (const line of lines) {
    if (account.normalBalance === 'debit') {
      running += (line.debit || 0) - (line.credit || 0);
    } else {
      running += (line.credit || 0) - (line.debit || 0);
    }
    balances.push(Math.round(running * 100) / 100);
  }
  return balances;
}

/**
 * Build the full ledger view for a specific account with running balances.
 */
export async function getLedgerForAccount(
  userId: string,
  account: Account,
  dateFrom?: string,
  dateTo?: string,
  isDemo = false
): Promise<LedgerSummary> {
  const entries = await getJournalEntriesForAccount(userId, account.id, dateFrom, dateTo, isDemo);

  // Sort entries chronologically ascending for running balance
  const sortedEntries = [...entries].sort((a, b) => {
    const da = typeof a.entryDate === 'string' ? a.entryDate : '';
    const db2 = typeof b.entryDate === 'string' ? b.entryDate : '';
    return da.localeCompare(db2);
  });

  // Collect the lines for this account from each entry
  const rawLines: Array<{
    entryId: string;
    entryNumber: string;
    entryDate: string;
    description: string;
    lineDescription?: string;
    debit: number;
    credit: number;
  }> = [];

  for (const entry of sortedEntries) {
    if (!entry.lines) continue;
    for (const line of entry.lines) {
      if (line.accountId === account.id) {
        rawLines.push({
          entryId: entry.id,
          entryNumber: entry.entryNumber,
          entryDate: entry.entryDate,
          description: entry.description,
          lineDescription: line.lineDescription,
          debit: line.debit,
          credit: line.credit,
        });
      }
    }
  }

  // Compute running balances
  const openingBalance = 0; // Could be computed from pre-period entries in a future enhancement
  const runningBalances = calculateRunningBalance(account, rawLines, openingBalance);

  const ledgerLines: LedgerLine[] = rawLines.map((raw, i) => ({
    ...raw,
    runningBalance: runningBalances[i],
  }));

  const totalDebits = ledgerLines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredits = ledgerLines.reduce((sum, l) => sum + l.credit, 0);
  const closingBalance = ledgerLines.length > 0
    ? ledgerLines[ledgerLines.length - 1].runningBalance
    : openingBalance;

  return {
    account,
    lines: ledgerLines,
    openingBalance,
    totalDebits: Math.round(totalDebits * 100) / 100,
    totalCredits: Math.round(totalCredits * 100) / 100,
    closingBalance: Math.round(closingBalance * 100) / 100,
  };
}

/**
 * Build a trial balance from all accounts and their current balances.
 * Returns accounts grouped and summed, proving Σ Debit balances = Σ Credit balances.
 */
export interface TrialBalanceLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
}

export function buildTrialBalance(accounts: Account[]): {
  lines: TrialBalanceLine[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
} {
  const lines: TrialBalanceLine[] = accounts
    .filter((acc) => acc.currentBalance !== 0 || acc.status === 'active')
    .map((acc) => {
      const balance = acc.currentBalance;
      // Positive balance in normal direction = debit for debit-normal, credit for credit-normal
      let debitBalance = 0;
      let creditBalance = 0;
      if (acc.normalBalance === 'debit') {
        if (balance >= 0) debitBalance = balance;
        else creditBalance = Math.abs(balance);
      } else {
        if (balance >= 0) creditBalance = balance;
        else debitBalance = Math.abs(balance);
      }
      return {
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type,
        debitBalance: Math.round(debitBalance * 100) / 100,
        creditBalance: Math.round(creditBalance * 100) / 100,
      };
    });

  const totalDebits = lines.reduce((sum, l) => sum + l.debitBalance, 0);
  const totalCredits = lines.reduce((sum, l) => sum + l.creditBalance, 0);

  return {
    lines,
    totalDebits: Math.round(totalDebits * 100) / 100,
    totalCredits: Math.round(totalCredits * 100) / 100,
    isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
  };
}

/**
 * Fetch journal entries for a specific account for export or display.
 * Re-exported for convenient use in LedgerPage.
 */
export { getJournalEntriesForAccount };

/**
 * Format a date string as a readable date for display in the ledger.
 */
export function formatLedgerDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return dateStr;
  }
}
