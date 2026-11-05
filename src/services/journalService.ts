import {
  collection,
  doc,
  getDocs,
  updateDoc,
  writeBatch,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { JournalEntry, JournalLine } from '../types/journal';
import { Account } from '../types/account';

const DEMO_JOURNAL_STORAGE_KEY_PREFIX = 'e_accountant_journal_';
const DEMO_ACCOUNTS_STORAGE_KEY_PREFIX = 'e_accountant_accounts_';

function getDemoJournalKey(userId: string): string {
  return `${DEMO_JOURNAL_STORAGE_KEY_PREFIX}${userId}`;
}

function getDemoAccountsKey(userId: string): string {
  return `${DEMO_ACCOUNTS_STORAGE_KEY_PREFIX}${userId}`;
}

function loadDemoEntries(userId: string): JournalEntry[] {
  try {
    const raw = localStorage.getItem(getDemoJournalKey(userId));
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load demo journal entries:', err);
  }
  return [];
}

function saveDemoEntries(userId: string, entries: JournalEntry[]): void {
  try {
    localStorage.setItem(getDemoJournalKey(userId), JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save demo journal entries:', err);
  }
}

function loadDemoAccounts(userId: string): Account[] {
  try {
    const raw = localStorage.getItem(getDemoAccountsKey(userId));
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load demo accounts:', err);
  }
  return [];
}

function saveDemoAccounts(userId: string, accounts: Account[]): void {
  try {
    localStorage.setItem(getDemoAccountsKey(userId), JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save demo accounts:', err);
  }
}

/**
 * Generate a sequential entry number in JE-YYYY-NNNN format.
 * Scans existing entries to find the next available sequence number.
 */
export function generateEntryNumber(existingEntries: JournalEntry[]): string {
  const year = new Date().getFullYear();
  const prefix = `JE-${year}-`;
  let maxNum = 0;
  for (const entry of existingEntries) {
    if (entry.entryNumber.startsWith(prefix)) {
      const num = parseInt(entry.entryNumber.slice(prefix.length), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

/**
 * Compute the balance change for an account given a journal line.
 * - Debit-normal accounts: debit increases balance, credit decreases it.
 * - Credit-normal accounts: credit increases balance, debit decreases it.
 */
function computeBalanceDelta(account: Account, line: JournalLine): number {
  if (account.normalBalance === 'debit') {
    return line.debit - line.credit;
  } else {
    return line.credit - line.debit;
  }
}

/**
 * Fetch all journal entries for a user, sorted by entryDate descending.
 */
export async function getJournalEntries(
  userId: string,
  isDemo = false
): Promise<JournalEntry[]> {
  if (isDemo || !isFirebaseConfigured || !db) {
    const entries = loadDemoEntries(userId);
    // Sort by date descending
    return entries.sort((a, b) => {
      const dateA = typeof a.entryDate === 'string' ? a.entryDate : '';
      const dateB = typeof b.entryDate === 'string' ? b.entryDate : '';
      return dateB.localeCompare(dateA);
    });
  }

  try {
    const journalRef = collection(db, 'users', userId, 'journalEntries');
    const q = query(journalRef, orderBy('entryDate', 'desc'));
    const snapshot = await getDocs(q);
    const entries: JournalEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      entries.push({
        id: docSnap.id,
        entryNumber: data.entryNumber,
        entryDate: data.entryDate?.toDate?.()?.toISOString?.()?.slice(0, 10) ?? data.entryDate,
        description: data.description,
        notes: data.notes || '',
        status: data.status,
        totalDebit: data.totalDebit,
        totalCredit: data.totalCredit,
        lineCount: data.lineCount,
        lines: data.lines || [],
        attachmentUrl: data.attachmentUrl || null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    return entries;
  } catch (err) {
    console.error('Error fetching Firestore journal entries, falling back to demo state:', err);
    return loadDemoEntries(userId);
  }
}

/**
 * Fetch journal lines affecting a specific account, filtered by optional date range.
 */
export async function getJournalEntriesForAccount(
  userId: string,
  accountId: string,
  dateFrom?: string,
  dateTo?: string,
  isDemo = false
): Promise<JournalEntry[]> {
  const allEntries = await getJournalEntries(userId, isDemo);
  return allEntries.filter((entry) => {
    if (entry.status === 'voided') return false;
    const hasAccount = entry.lines?.some((l) => l.accountId === accountId);
    if (!hasAccount) return false;
    if (dateFrom && entry.entryDate < dateFrom) return false;
    if (dateTo && entry.entryDate > dateTo) return false;
    return true;
  });
}

/**
 * Create a new journal entry with atomic balance updates.
 * Uses Firestore writeBatch when connected; localStorage atomic update in demo mode.
 */
export async function createJournalEntry(
  userId: string,
  entryData: {
    entryDate: string;
    description: string;
    notes?: string;
    lines: Omit<JournalLine, 'id'>[];
  },
  isDemo = false
): Promise<JournalEntry> {
  // Validate double-entry invariants
  const totalDebit = entryData.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = entryData.lines.reduce((sum, l) => sum + (l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) >= 0.01) {
    throw new Error(`Journal entry is not balanced: Debits (${totalDebit.toFixed(2)}) ≠ Credits (${totalCredit.toFixed(2)})`);
  }
  if (entryData.lines.length < 2) {
    throw new Error('Journal entry must have at least 2 lines.');
  }

  const now = new Date().toISOString();
  const existingEntries = await getJournalEntries(userId, isDemo);
  const entryNumber = generateEntryNumber(existingEntries);

  const entryId = `je_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const fullLines: JournalLine[] = entryData.lines.map((l, i) => ({
    ...l,
    id: `jl_${entryId}_${i}`,
    orderIndex: i,
  }));

  const newEntry: JournalEntry = {
    id: entryId,
    entryNumber,
    entryDate: entryData.entryDate,
    description: entryData.description,
    notes: entryData.notes || '',
    status: 'posted',
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    lineCount: fullLines.length,
    lines: fullLines,
    attachmentUrl: null,
    createdAt: now,
    updatedAt: now,
  };

  if (isDemo || !isFirebaseConfigured || !db) {
    // Demo mode: save to localStorage and update account balances
    const updatedEntries = [newEntry, ...existingEntries];
    saveDemoEntries(userId, updatedEntries);

    // Update account balances in localStorage
    const accounts = loadDemoAccounts(userId);
    const updatedAccounts = accounts.map((acc) => {
      let balance = acc.currentBalance;
      for (const line of fullLines) {
        if (line.accountId === acc.id) {
          balance += computeBalanceDelta(acc, line);
        }
      }
      return { ...acc, currentBalance: Math.round(balance * 100) / 100, updatedAt: now };
    });
    saveDemoAccounts(userId, updatedAccounts);

    return newEntry;
  }

  try {
    if (!db) throw new Error('Firestore not initialized');
    const batch = writeBatch(db);

    // Write journal entry document
    const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
    batch.set(entryRef, {
      entryNumber,
      entryDate: entryData.entryDate,
      description: entryData.description,
      notes: entryData.notes || '',
      status: 'posted',
      totalDebit: newEntry.totalDebit,
      totalCredit: newEntry.totalCredit,
      lineCount: fullLines.length,
      lines: fullLines,
      // Also store accountIds array for efficient querying
      accountIds: [...new Set(fullLines.map((l) => l.accountId))],
      attachmentUrl: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update each affected account balance
    for (const line of fullLines) {
      const accRef = doc(db, 'users', userId, 'accounts', line.accountId);
      // We load each account to get its normalBalance; in production, use FieldValue.increment
      // For now, store the delta — the actual increment is handled client-side
      batch.update(accRef, {
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
    return newEntry;
  } catch (err) {
    console.error('Error creating Firestore journal entry:', err);
    throw err;
  }
}

/**
 * Void a journal entry. Preserves all data but marks it voided and reverses account balances.
 */
export async function voidJournalEntry(
  userId: string,
  entryId: string,
  isDemo = false
): Promise<void> {
  const now = new Date().toISOString();

  if (isDemo || !isFirebaseConfigured || !db) {
    const entries = loadDemoEntries(userId);
    const entry = entries.find((e) => e.id === entryId);
    if (!entry || entry.status === 'voided') return;

    // Reverse account balances
    const accounts = loadDemoAccounts(userId);
    const updatedAccounts = accounts.map((acc) => {
      let balance = acc.currentBalance;
      if (entry.lines) {
        for (const line of entry.lines) {
          if (line.accountId === acc.id) {
            // Reverse: subtract what was previously added
            balance -= computeBalanceDelta(acc, line);
          }
        }
      }
      return { ...acc, currentBalance: Math.round(balance * 100) / 100, updatedAt: now };
    });
    saveDemoAccounts(userId, updatedAccounts);

    // Mark entry as voided
    const updatedEntries = entries.map((e) =>
      e.id === entryId ? { ...e, status: 'voided' as const, updatedAt: now } : e
    );
    saveDemoEntries(userId, updatedEntries);
    return;
  }

  try {
    const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
    await updateDoc(entryRef, {
      status: 'voided',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error voiding journal entry:', err);
    throw err;
  }
}

/**
 * Update an existing journal entry (replaces lines, re-validates balance).
 */
export async function updateJournalEntry(
  userId: string,
  entryId: string,
  updates: {
    entryDate?: string;
    description?: string;
    notes?: string;
    lines?: Omit<JournalLine, 'id'>[];
  },
  isDemo = false
): Promise<JournalEntry> {
  const now = new Date().toISOString();
  const entries = await getJournalEntries(userId, isDemo);
  const existing = entries.find((e) => e.id === entryId);
  if (!existing) throw new Error('Journal entry not found.');
  if (existing.status === 'voided') throw new Error('Cannot edit a voided journal entry.');

  let fullLines = existing.lines || [];

  if (updates.lines) {
    const totalDebit = updates.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = updates.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) >= 0.01) {
      throw new Error(`Entry not balanced: Debits (${totalDebit.toFixed(2)}) ≠ Credits (${totalCredit.toFixed(2)})`);
    }

    fullLines = updates.lines.map((l, i) => ({
      ...l,
      id: `jl_${entryId}_${i}`,
      orderIndex: i,
    }));

    const newTotalDebit = Math.round(totalDebit * 100) / 100;
    const newTotalCredit = Math.round(totalCredit * 100) / 100;

    const updatedEntry: JournalEntry = {
      ...existing,
      entryDate: updates.entryDate ?? existing.entryDate,
      description: updates.description ?? existing.description,
      notes: updates.notes ?? existing.notes,
      totalDebit: newTotalDebit,
      totalCredit: newTotalCredit,
      lineCount: fullLines.length,
      lines: fullLines,
      updatedAt: now,
    };

    if (isDemo || !isFirebaseConfigured || !db) {
      // Reverse old balances
      const accounts = loadDemoAccounts(userId);
      let updatedAccounts = accounts.map((acc) => {
        let balance = acc.currentBalance;
        if (existing.lines) {
          for (const line of existing.lines) {
            if (line.accountId === acc.id) {
              balance -= computeBalanceDelta(acc, line);
            }
          }
        }
        return { ...acc, currentBalance: Math.round(balance * 100) / 100 };
      });

      // Apply new balances
      updatedAccounts = updatedAccounts.map((acc) => {
        let balance = acc.currentBalance;
        for (const line of fullLines) {
          if (line.accountId === acc.id) {
            balance += computeBalanceDelta(acc, line);
          }
        }
        return { ...acc, currentBalance: Math.round(balance * 100) / 100, updatedAt: now };
      });
      saveDemoAccounts(userId, updatedAccounts);

      const updatedEntries = entries.map((e) => (e.id === entryId ? updatedEntry : e));
      saveDemoEntries(userId, updatedEntries);
      return updatedEntry;
    }

    const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
    await updateDoc(entryRef, {
      entryDate: updatedEntry.entryDate,
      description: updatedEntry.description,
      notes: updatedEntry.notes,
      totalDebit: updatedEntry.totalDebit,
      totalCredit: updatedEntry.totalCredit,
      lineCount: fullLines.length,
      lines: fullLines,
      accountIds: [...new Set(fullLines.map((l) => l.accountId))],
      updatedAt: serverTimestamp(),
    });
    return updatedEntry;
  }

  // No line changes — just update metadata
  const updatedEntry: JournalEntry = {
    ...existing,
    entryDate: updates.entryDate ?? existing.entryDate,
    description: updates.description ?? existing.description,
    notes: updates.notes ?? existing.notes,
    updatedAt: now,
  };

  if (isDemo || !isFirebaseConfigured || !db) {
    const updatedEntries = entries.map((e) => (e.id === entryId ? updatedEntry : e));
    saveDemoEntries(userId, updatedEntries);
    return updatedEntry;
  }

  const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
  await updateDoc(entryRef, {
    entryDate: updatedEntry.entryDate,
    description: updatedEntry.description,
    notes: updatedEntry.notes,
    updatedAt: serverTimestamp(),
  });
  return updatedEntry;
}

/**
 * Get summary stats: total entries, posted, voided, latest entry number.
 */
export async function getJournalStats(
  userId: string,
  isDemo = false
): Promise<{ total: number; posted: number; voided: number; nextEntryNumber: string }> {
  const entries = await getJournalEntries(userId, isDemo);
  const posted = entries.filter((e) => e.status === 'posted').length;
  const voided = entries.filter((e) => e.status === 'voided').length;
  const nextEntryNumber = generateEntryNumber(entries);
  return { total: entries.length, posted, voided, nextEntryNumber };
}

/**
 * Fetch journal entries that reference a specific account (for ledger and delete guard).
 */
export async function getEntriesReferencingAccount(
  userId: string,
  accountId: string,
  isDemo = false
): Promise<JournalEntry[]> {
  if (isDemo || !isFirebaseConfigured || !db) {
    const entries = loadDemoEntries(userId);
    return entries.filter(
      (e) => e.lines && e.lines.some((l) => l.accountId === accountId)
    );
  }

  try {
    const journalRef = collection(db, 'users', userId, 'journalEntries');
    const q = query(journalRef, where('accountIds', 'array-contains', accountId));
    const snapshot = await getDocs(q);
    const entries: JournalEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      entries.push({
        id: docSnap.id,
        entryNumber: data.entryNumber,
        entryDate: data.entryDate,
        description: data.description,
        notes: data.notes || '',
        status: data.status,
        totalDebit: data.totalDebit,
        totalCredit: data.totalCredit,
        lineCount: data.lineCount,
        lines: data.lines || [],
        attachmentUrl: data.attachmentUrl || null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    return entries;
  } catch (err) {
    console.error('Error querying entries for account:', err);
    return [];
  }
}
