/**
 * Client-Side Encrypted IndexedDB & Local Storage Manager
 * Stores parsed bank statements locally in browser RAM/DB and syncs to Supabase when configured.
 */

import { syncStatementToCloud } from './supabase';
import { getCurrentUser } from './authService';

const DB_NAME = 'DocuFinance_LocalDB';
const DB_VERSION = 1;
const STORE_NAME = 'statements_history';

// Open IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('bankName', 'bankName', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Save a statement to history
export async function saveStatementToLocalDB(statementData) {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id || 'guest_demo';

    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record = {
      id: 'stmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
      fileName: statementData.meta?.fileName || 'Banka_Ekstresi',
      bankName: statementData.meta?.bankName || 'Genel Ekstre',
      currency: statementData.meta?.currency || 'TRY',
      transactionCount: statementData.rows?.length || 0,
      totalCredit: statementData.meta?.totalCredit || 0,
      totalDebit: statementData.meta?.totalDebit || 0,
      netFlow: statementData.meta?.netFlow || 0,
      endingBalance: statementData.meta?.endingBalance || 0,
      documentHash: statementData.meta?.documentHash || '',
      isReconciled: statementData.meta?.isReconciled ?? true,
      data: statementData,
      createdAt: new Date().toISOString()
    };

    // Background sync to Supabase Cloud if user is authenticated
    if (currentUser?.id) {
      syncStatementToCloud(statementData, currentUser.id).catch(() => {});
    }

    return new Promise((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('LocalDB save failed, falling back to memory:', err);
    return null;
  }
}

// Get all saved statement history (strictly isolated per user account)
export async function getAllStatementsFromLocalDB(targetUserId = null) {
  try {
    const activeUser = targetUserId ? { id: targetUserId } : getCurrentUser();
    const currentUserId = activeUser?.id || null;

    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const allRecords = req.result || [];
        
        // Filter by user isolation:
        const userRecords = allRecords.filter(r => {
          if (currentUserId) {
            // Logged in user: ONLY return their own statements, NEVER guest demos!
            return r.userId === currentUserId;
          } else {
            // Guest visitor: ONLY return guest demos
            return !r.userId || r.userId === 'guest_demo';
          }
        });

        const sorted = userRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('LocalDB get failed:', err);
    return [];
  }
}

// Delete a statement from history
export async function deleteStatementFromLocalDB(id) {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('LocalDB delete failed:', err);
    return false;
  }
}

// Clear entire history
export async function clearLocalDB() {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('LocalDB clear failed:', err);
    return false;
  }
}

export const clearAllStatementsFromLocalDB = clearLocalDB;
